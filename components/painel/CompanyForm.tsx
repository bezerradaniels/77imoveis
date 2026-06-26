'use client';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCompanyForm } from './company/useCompanyForm';
import {
  TypeSection, DataSection, CitiesSection, ImagesSection, DescriptionSection,
  BrokersSection, ContactSection, HoursSection, SpecialtiesSection, AddressSection,
} from './company/sections';

type Opt = { id: string; name: string };

export function CompanyForm({
  cities,
  specialties,
  initial,
}: {
  cities: Opt[];
  specialties: Opt[];
  initial?: any;
}) {
  const c = useCompanyForm(initial);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <TypeSection value={c.f.type} onChange={(v) => c.set('type', v)} />
        <DataSection f={c.f} set={c.set} cities={cities} />
      </section>

      <DescriptionSection value={c.f.description} onChange={(v) => c.set('description', v)} />

      <ContactSection f={c.f} set={c.set} />

      <AddressSection f={c.f} set={c.set} />

      <ImagesSection logo={c.logo} setLogo={c.setLogo} cover={c.cover} setCover={c.setCover} />

      <CitiesSection cities={cities} citySet={c.citySet} toggle={c.toggleCity} />

      <SpecialtiesSection specialties={specialties} specSet={c.specSet} toggle={c.toggleSpec} />

      <BrokersSection brokers={c.brokers} addBroker={c.addBroker} removeBroker={c.removeBroker} updateBroker={c.updateBroker} />

      <HoursSection hours={c.hours} setHour={c.setHour} />

      {c.error && <p className="text-sm text-danger">{c.error}</p>}
      <div className="border-t border-border pt-4">
        <Button onClick={c.submit} disabled={c.busy} rounded="lg">
          {c.busy && <Loader2 size={16} className="animate-spin" />}
          {c.busy ? 'Salvando…' : initial?.id ? 'Salvar empresa' : 'Criar empresa e virar profissional'}
        </Button>
      </div>
    </div>
  );
}
