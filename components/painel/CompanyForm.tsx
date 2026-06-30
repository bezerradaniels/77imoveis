'use client';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCompanyForm } from './company/useCompanyForm';
import {
  TypeSection, DataSection, CitiesSection, ImagesSection, DescriptionSection,
  ContactSection, HoursSection, SpecialtiesSection, AddressSection,
} from './company/sections';

type Opt = { id: string; name: string };

// Card de seção — agrupa campos relacionados. O título é opcional: algumas
// seções (Cidades, Especialidades, Horário, Sobre) já têm cabeçalho próprio.
function Card({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      {title && (
        <header className="mb-4">
          <h2 className="text-base font-bold text-text">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

export function CompanyForm({
  cities,
  specialties,
  initial,
}: {
  cities: Opt[];
  specialties: Opt[];
  initial?: any;
}) {
  const c = useCompanyForm(initial, { manageBrokers: false });

  return (
    // [&_.max-w-xl]:max-w-none — neutraliza as larguras estreitas usadas no wizard,
    // para que todos os campos preencham o card de forma alinhada no desktop.
    <div className="space-y-5 [&_.max-w-xl]:max-w-none">
      <Card title="Tipo de perfil" description="Como você atua no mercado imobiliário.">
        <TypeSection value={c.f.type} onChange={(v) => c.set('type', v)} />
      </Card>

      <Card title="Dados do perfil" description="Identificação exibida no seu perfil público.">
        <DataSection f={c.f} set={c.set} cities={cities} />
      </Card>

      <Card>
        <DescriptionSection value={c.f.description} onChange={(v) => c.set('description', v)} />
      </Card>

      <Card title="Contato" description="Como os clientes vão falar com você.">
        <ContactSection f={c.f} set={c.set} />
      </Card>

      <Card title="Endereço">
        <AddressSection f={c.f} set={c.set} />
      </Card>

      <Card title="Imagens" description="Logo e capa do perfil.">
        <ImagesSection logo={c.logo} setLogo={c.setLogo} cover={c.cover} setCover={c.setCover} />
      </Card>

      <Card>
        <CitiesSection cities={cities} citySet={c.citySet} toggle={c.toggleCity} />
      </Card>

      <Card>
        <SpecialtiesSection specialties={specialties} specSet={c.specSet} toggle={c.toggleSpec} />
      </Card>

      <Card>
        <HoursSection hours={c.hours} setHour={c.setHour} />
      </Card>

      {c.error && <p className="text-sm text-danger">{c.error}</p>}
      <div className="flex justify-end">
        <Button onClick={c.submit} disabled={c.busy} rounded="lg">
          {c.busy && <Loader2 size={16} className="animate-spin" />}
          {c.busy ? 'Salvando…' : initial?.id ? 'Salvar perfil' : 'Criar perfil profissional'}
        </Button>
      </div>
    </div>
  );
}
