create policy "branch_owners_can_insert_categories"
on public.categoria
for insert
to authenticated
with check (
  exists (
    select 1
    from public.sucursales
    where authuserid = (select auth.uid())
  )
);
