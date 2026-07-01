-- 77IMOVEIS - Migracao 22: trava contra auto-promocao de role em profiles
-- Problema: a policy profiles_update_self permitia que qualquer usuario
-- alterasse sua propria linha em profiles, incluindo a coluna "role" —
-- ou seja, um usuario comum podia se promover a 'admin' via update direto.
-- Fix: a unica transicao de role feita pelo proprio usuario (fora do admin)
-- e completeOnboarding promovendo 'particular' -> 'profissional'
-- (app/painel/escolha-perfil/actions.ts). Qualquer outra mudanca de role
-- (para 'admin'/'moderador', ou downgrade) fica bloqueada nesta policy.

drop policy if exists profiles_update_self on profiles;

create policy profiles_update_self on profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and (
      role is not distinct from (select p.role from profiles p where p.id = auth.uid())
      or (
        (select p.role from profiles p where p.id = auth.uid()) = 'particular'
        and role = 'profissional'
      )
    )
  );
