-- Storage bucket for MyGigs assets (avatars, kyc, tracks, contracts)
insert into storage.buckets (id, name, public)
values ('mygigs-assets', 'mygigs-assets', false)
on conflict (id) do nothing;

-- Allow authenticated users to upload into their own folder: <bucket>/<folder>/<user_id>/...
create policy "mygigs authenticated upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'mygigs-assets' and (storage.foldername(name))[2] = auth.uid()::text);

create policy "mygigs owner read" on storage.objects
  for select to authenticated
  using (bucket_id = 'mygigs-assets' and (storage.foldername(name))[2] = auth.uid()::text);

-- Public read for avatars and tracks (profiles are public)
create policy "mygigs public avatars" on storage.objects
  for select to public
  using (bucket_id = 'mygigs-assets' and (storage.foldername(name))[1] in ('avatars', 'tracks'));
