'use client';
import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BrokersSection } from './company/sections';
import { saveBrokers } from '@/app/painel/corretores/actions';

type Broker = { name: string; creci?: string; email?: string; phone?: string; whatsapp?: string };

const digits = (v: string) => v.replace(/\D/g, '');

export function BrokersManager({
  initialBrokers,
  companyWhatsapp,
}: {
  initialBrokers: Broker[];
  companyWhatsapp?: string;
}) {
  const [brokers, setBrokers] = useState<Broker[]>(initialBrokers);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const addBroker = () => setBrokers((p) => [...p, { name: '' }]);
  const removeBroker = (i: number) => setBrokers((p) => p.filter((_, idx) => idx !== i));
  const updateBroker = (i: number, patch: Partial<Broker>) =>
    setBrokers((p) => p.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));

  function submit() {
    setError('');
    setSaved(false);
    if (brokers.some((b) => b.whatsapp && digits(b.whatsapp).length < 10))
      return setError('Informe um WhatsApp válido com DDD para os corretores ou deixe em branco.');
    start(async () => {
      const r = await saveBrokers(brokers);
      if ('error' in r) setError(r.error!);
      else setSaved(true);
    });
  }

  return (
    <div className="space-y-5">
      <BrokersSection
        brokers={brokers}
        companyWhatsapp={companyWhatsapp}
        addBroker={addBroker}
        removeBroker={removeBroker}
        updateBroker={updateBroker}
      />

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && !error && <p className="text-sm font-medium text-green-700">Equipe atualizada com sucesso.</p>}

      <div className="flex justify-end">
        <Button onClick={submit} disabled={pending} rounded="lg">
          {pending && <Loader2 size={16} className="animate-spin" />}
          {pending ? 'Salvando…' : 'Salvar equipe'}
        </Button>
      </div>
    </div>
  );
}
