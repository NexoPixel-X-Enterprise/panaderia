drop policy if exists branch_owners_can_upload_product_images
on storage.objects;

create policy branch_owners_can_upload_product_images
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'producto'
  and array_length(storage.foldername(name), 1) = 1
  and name ~* '^(ElFrailer|OperaDely|KamutBakery)/[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp|gif)$'
  and exists (
    select 1
    from public.sucursales as branch
    where branch.authuserid = (select auth.uid())
      and branch.nombresucursal = (storage.foldername(name))[1]
  )
);
