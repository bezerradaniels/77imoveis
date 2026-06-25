// Constantes compartilhadas (rótulos de enums do banco em pt-BR).

// Tipos de empresa/profissional (enum company_type). value = valor no banco.
export const companyTypes = [
  { value: 'imobiliaria', label: 'Imobiliária' },
  { value: 'corretor_autonomo', label: 'Corretor autônomo' },
  { value: 'construtora', label: 'Construtora' },
  { value: 'incorporadora', label: 'Incorporadora' },
  { value: 'engenharia_civil', label: 'Engenharia civil' },
  { value: 'arquitetura', label: 'Arquitetura' },
  { value: 'topografia', label: 'Topografia' },
  { value: 'energia_solar', label: 'Energia solar' },
  { value: 'material_construcao', label: 'Material de construção' },
  { value: 'financiamento', label: 'Financiamento' },
  { value: 'seguranca', label: 'Segurança' },
  { value: 'pintura', label: 'Pintura' },
  { value: 'pedreiro', label: 'Pedreiro' },
  { value: 'eletrica', label: 'Elétrica' },
  { value: 'hidraulica', label: 'Hidráulica' },
  { value: 'outro', label: 'Outro' },
] as const;

export const companyTypeLabel = (v: string) =>
  companyTypes.find((t) => t.value === v)?.label ?? v;
