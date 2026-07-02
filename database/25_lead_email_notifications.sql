-- =====================================================================
-- 77IMOVEIS — Migração 25: notificação por e-mail de novos leads
-- Ao inserir um lead vindo do formulário de contato do imóvel, chama a
-- Edge Function `send-lead-email` (Resend) via pg_net. A função avisa o
-- anunciante (lead_email/contact_email/e-mail do dono) e confirma pro lead.
-- =====================================================================

create extension if not exists pg_net;

-- Segredo compartilhado só pra autenticar a chamada do trigger -> Edge Function
-- (a função não usa verify_jwt; valida esse header sozinha).
select vault.create_secret(
  '9971671f520b74fdb61485025290a79eaa75208af2f64605',
  'leads_webhook_secret'
) where not exists (select 1 from vault.secrets where name = 'leads_webhook_secret');

create or replace function public.notify_lead_email()
returns trigger
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  webhook_secret text;
begin
  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets where name = 'leads_webhook_secret';

  perform net.http_post(
    url := 'https://ayojizahxmasnjtvyxaf.supabase.co/functions/v1/send-lead-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret
    ),
    body := jsonb_build_object('record', to_jsonb(new))
  );
  return new;
end;
$$;

drop trigger if exists leads_notify_email on public.leads;
create trigger leads_notify_email
  after insert on public.leads
  for each row
  when (new.channel = 'formulario')
  execute function public.notify_lead_email();

-- A função só deve rodar via trigger, nunca chamada direto por RPC pública.
revoke execute on function public.notify_lead_email() from public, anon, authenticated;
