-- Marca o momento em que o usuário escolheu Particular ou Profissional após o cadastro.
-- null = ainda não escolheu (será pego pelo gate em /painel).
alter table profiles add column role_choice_made_at timestamptz;

-- Contas já existentes não devem ser pegas pelo gate retroativamente.
update profiles set role_choice_made_at = created_at where role_choice_made_at is null;
