create sequence if not exists public.producto_idproducto_seq;

select setval(
  'public.producto_idproducto_seq',
  greatest(
    coalesce((select max(idproducto) from public.producto), 0),
    (
      select case
        when is_called then last_value
        else last_value - 1
      end
      from public.producto_idproducto_seq
    )
  ) + 1,
  false
);

alter table public.producto
  alter column idproducto
  set default nextval('public.producto_idproducto_seq');

alter sequence public.producto_idproducto_seq
  owned by public.producto.idproducto;
