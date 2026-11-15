create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.dashboard_user_owns_product(product_id integer)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.inventario as inventory
    join public.sucursales as branch
      on branch.idsucursal = inventory.idsucursal
    where inventory.idproducto = product_id
      and branch.authuserid = (select auth.uid())
  );
$$;

revoke all on function private.dashboard_user_owns_product(integer) from public, anon;
grant execute on function private.dashboard_user_owns_product(integer) to authenticated;

create policy branch_owners_can_update_products
on public.producto
for update
to authenticated
using (private.dashboard_user_owns_product(idproducto))
with check (private.dashboard_user_owns_product(idproducto));

create policy branch_owners_can_update_inventory
on public.inventario
for update
to authenticated
using (
  exists (
    select 1
    from public.sucursales as branch
    where branch.idsucursal = inventario.idsucursal
      and branch.authuserid = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.sucursales as branch
    where branch.idsucursal = inventario.idsucursal
      and branch.authuserid = (select auth.uid())
  )
);

create policy branch_owners_can_insert_promotions
on public.promocion
for insert
to authenticated
with check (
  exists (
    select 1
    from public.sucursales as branch
    where branch.idsucursal = promocion.idsucursal
      and branch.authuserid = (select auth.uid())
  )
);

create policy branch_owners_can_update_promotions
on public.promocion
for update
to authenticated
using (
  exists (
    select 1
    from public.sucursales as branch
    where branch.idsucursal = promocion.idsucursal
      and branch.authuserid = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.sucursales as branch
    where branch.idsucursal = promocion.idsucursal
      and branch.authuserid = (select auth.uid())
  )
);

create policy branch_owners_can_delete_promotions
on public.promocion
for delete
to authenticated
using (
  exists (
    select 1
    from public.sucursales as branch
    where branch.idsucursal = promocion.idsucursal
      and branch.authuserid = (select auth.uid())
  )
);

create policy branch_owners_can_insert_product_categories
on public.categoriaproducto
for insert
to authenticated
with check (private.dashboard_user_owns_product(idproducto));

create policy branch_owners_can_delete_product_categories
on public.categoriaproducto
for delete
to authenticated
using (private.dashboard_user_owns_product(idproducto));

create policy branch_owners_can_update_categories
on public.categoria
for update
to authenticated
using (
  exists (
    select 1
    from public.sucursales as branch
    where branch.authuserid = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.sucursales as branch
    where branch.authuserid = (select auth.uid())
  )
);

create or replace function public.remove_product_from_user_inventory(
  p_idproducto integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  requesting_user uuid := (select auth.uid());
begin
  if requesting_user is null
    or not private.dashboard_user_owns_product(p_idproducto) then
    raise exception 'Product is not available in the authenticated user inventory'
      using errcode = '42501';
  end if;

  delete from public.promocion as promotion
  using public.sucursales as branch
  where promotion.idproducto = p_idproducto
    and promotion.idsucursal = branch.idsucursal
    and branch.authuserid = requesting_user;

  delete from public.inventario as inventory
  using public.sucursales as branch
  where inventory.idproducto = p_idproducto
    and inventory.idsucursal = branch.idsucursal
    and branch.authuserid = requesting_user;

  if exists (
    select 1
    from public.inventario as inventory
    where inventory.idproducto = p_idproducto
  ) then
    return false;
  end if;

  delete from public.categoriaproducto
  where idproducto = p_idproducto;

  delete from public.promocion
  where idproducto = p_idproducto;

  delete from public.producto
  where idproducto = p_idproducto;

  return true;
end;
$$;

revoke all on function public.remove_product_from_user_inventory(integer)
from public, anon;
grant execute on function public.remove_product_from_user_inventory(integer)
to authenticated;
