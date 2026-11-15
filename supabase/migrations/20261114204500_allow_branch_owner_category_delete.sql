create or replace function public.delete_category_for_branch_owner(
  p_idcategoria integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  requesting_user uuid := (select auth.uid());
  deleted_count integer;
begin
  if requesting_user is null
    or not exists (
      select 1
      from public.sucursales as branch
      where branch.authuserid = requesting_user
    ) then
    raise exception 'Category deletion is not allowed for this user'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.categoria
    where idcategoria = p_idcategoria
  ) then
    return false;
  end if;

  delete from public.categoriaproducto
  where idcategoria = p_idcategoria;

  delete from public.categoria
  where idcategoria = p_idcategoria;

  get diagnostics deleted_count = row_count;
  return deleted_count = 1;
end;
$$;

revoke all on function public.delete_category_for_branch_owner(integer)
from public, anon;
grant execute on function public.delete_category_for_branch_owner(integer)
to authenticated;
