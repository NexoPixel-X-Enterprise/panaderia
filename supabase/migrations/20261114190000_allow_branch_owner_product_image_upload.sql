create policy "branch_owners_can_upload_product_images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'producto'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.sucursales as branch
    where branch.authuserid = (select auth.uid())
  )
);
