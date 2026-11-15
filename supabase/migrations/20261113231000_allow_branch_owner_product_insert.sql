create policy "branch_owners_can_insert_products"
on public.producto
for insert
to authenticated
with check (
  exists (
    select 1
    from public.sucursales
    where authuserid = (select auth.uid())
  )
);
