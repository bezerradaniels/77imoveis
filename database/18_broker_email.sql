-- Migracao 18: e-mail do corretor (brokers).
-- Permite atribuir um imovel a um corretor e pre-preencher o e-mail de leads.
alter table brokers add column if not exists email text;
