'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCompanyForm } from './company/useCompanyForm';
import {
  TypeSection, DataSection, CitiesSection, ImagesSection,
  BrokersSection, ContactSection, SpecialtiesSection, AddressSection,
} from './company/sections';

type Opt = { id: string; name: string };

export function OnboardingWizard({ cities, specialties }: { cities: Opt[]; specialties: Opt[] }) {
  const c = useCompanyForm();
  const [step, setStep] = useState(0);
  const [triedAdvance, setTriedAdvance] = useState(false);
  const showBrokersStep = c.f.type === 'imobiliaria';

  const steps = [
    {
      title: 'Tipo de perfil',
      description: 'Como você atua no mercado imobiliário.',
      content: <TypeSection value={c.f.type} onChange={(v) => c.set('type', v)} />,
      canAdvance: !!c.f.type
    },
    {
      title: 'Dados do perfil',
      description: 'As informações principais do seu perfil.',
      content: <DataSection f={c.f} set={c.set} cities={cities} isWizard />,
      canAdvance: !!c.f.tradeName.trim()
    },
    {
      title: 'Contato',
      description: 'Como os clientes falam com você.',
      content: <ContactSection f={c.f} set={c.set} lockWhatsapp showError={triedAdvance} />,
      canAdvance: !!(c.f.whatsapp.trim() || c.f.phone.trim() || c.f.email.trim())
    },
    {
      title: 'Endereço',
      description: 'Endereço do escritório (opcional).',
      content: <AddressSection f={c.f} set={c.set} hideCep />,
      canAdvance: true
    },
    ...(showBrokersStep ? [{
      title: 'Corretores',
      description: 'Equipe avulsa que aparece no perfil da imobiliária.',
      content: (
        <BrokersSection
          brokers={c.brokers}
          companyWhatsapp={c.f.whatsapp}
          addBroker={c.addBroker}
          removeBroker={c.removeBroker}
          updateBroker={c.updateBroker}
        />
      ),
      canAdvance: true
    }] : []),
    {
      title: 'Cidades de atuação',
      description: 'Onde sua empresa anuncia e atende.',
      content: <CitiesSection cities={cities} citySet={c.citySet} toggle={c.toggleCity} />,
      canAdvance: true
    },
    {
      title: 'Logo e capa',
      description: 'Imagens que aparecem na sua página.',
      content: <ImagesSection logo={c.logo} setLogo={c.setLogo} cover={c.cover} setCover={c.setCover} />,
      canAdvance: true
    },
    {
      title: 'Especialidades',
      description: 'No que sua empresa é especialista.',
      content: <SpecialtiesSection specialties={specialties} specSet={c.specSet} toggle={c.toggleSpec} />,
      canAdvance: true
    }
  ];
  const total = steps.length;
  const current = steps[step];
  const isLast = step === total - 1;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-semibold text-link">Passo {step + 1} de {total}</p>
          <p className="text-sm font-semibold text-link">{Math.round(((step + 1) / total) * 100)}%</p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border">
          <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1 text-text">{current.title}</h2>
        {current.description && <p className="text-sm text-muted">{current.description}</p>}
      </div>

      <div>
        {current.content}
      </div>

      {c.error && <p className="text-sm text-danger">{c.error}</p>}

      <div className="flex items-center justify-between pt-2">
        {step > 0 ? (
          <Button
            variant="ghost"
            rounded="lg"
            onClick={() => {
              setTriedAdvance(false);
              setStep((s) => s - 1);
            }}
            disabled={c.busy}
          >
            Voltar
          </Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <Button onClick={c.submit} disabled={c.busy} rounded="lg">
            {c.busy && <Loader2 size={16} className="animate-spin" />}
            {c.busy ? 'Criando…' : 'Criar perfil profissional'}
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (!current.canAdvance) {
                setTriedAdvance(true);
                return;
              }
              setTriedAdvance(false);
              setStep((s) => s + 1);
            }}
            rounded="lg"
          >
            Continuar
          </Button>
        )}
      </div>
    </div>
  );
}
