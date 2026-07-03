import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Cria, no Stripe, um Product + Price recorrente (BRL) para cada plano ativo
// que ainda não tenha stripe_price_id, e grava o id de volta em plans. É
// idempotente: rode quantas vezes quiser. Requer STRIPE_SECRET_KEY (live) e a
// service role do Supabase no .env.local.
//
//   npm run stripe:setup-plans

config({ path: '.env.local' });
config();

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Defina ${name} no .env.local.`);
  return value;
}

const supabase = createClient(
  requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
);
const stripe = new Stripe(requiredEnv('STRIPE_SECRET_KEY'), {
  apiVersion: '2026-06-24.dahlia',
});

const intervalOf = (interval: string): 'month' | 'year' | null =>
  interval === 'anual' ? 'year' : interval === 'mensal' ? 'month' : null;

async function main() {
  const { data: plans, error } = await supabase
    .from('plans')
    .select('id,name,slug,price,interval,stripe_price_id')
    .eq('is_active', true)
    .order('sort', { ascending: true });
  if (error) throw error;

  let created = 0;
  for (const plan of plans ?? []) {
    if (plan.stripe_price_id) {
      console.log(`= ${plan.slug}: já tem price (${plan.stripe_price_id})`);
      continue;
    }
    const interval = intervalOf(plan.interval);
    const amount = Number(plan.price);
    if (!interval || !(amount > 0)) {
      console.log(`- ${plan.slug}: ignorado (interval=${plan.interval}, price=${plan.price})`);
      continue;
    }

    const product = await stripe.products.create({
      name: `77Imóveis — ${plan.name}`,
      metadata: { plan_id: plan.id, plan_slug: plan.slug },
    });
    const price = await stripe.prices.create({
      product: product.id,
      currency: 'brl',
      unit_amount: Math.round(amount * 100),
      recurring: { interval },
      metadata: { plan_id: plan.id, plan_slug: plan.slug },
    });

    const { error: updateError } = await supabase
      .from('plans')
      .update({ stripe_price_id: price.id })
      .eq('id', plan.id);
    if (updateError) throw updateError;

    created += 1;
    console.log(`+ ${plan.slug}: ${price.id} (R$ ${amount.toFixed(2)}/${interval})`);
  }

  console.log(`\nConcluído. ${created} price(s) criado(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
