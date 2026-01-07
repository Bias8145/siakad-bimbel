-- 1. Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Enable RLS on objects
alter table storage.objects enable row level security;

-- 3. Policy: Allow Public Read Access (Anyone can view photos)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- 4. Policy: Allow Authenticated Users (Admins) to Upload
create policy "Authenticated Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'avatars' );

-- 5. Policy: Allow Authenticated Users (Admins) to Update
create policy "Authenticated Update"
on storage.objects for update
to authenticated
using ( bucket_id = 'avatars' );

-- 6. Policy: Allow Authenticated Users (Admins) to Delete
create policy "Authenticated Delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'avatars' );

-- 7. Policy: Allow Students (Public/Anon) to Upload their own photo
-- Note: Since students login via custom auth (not Supabase Auth), they are technically 'anon'.
-- We allow 'anon' to insert, but in a real production app with custom auth, 
-- you might want a stricter function. For this app's requirement, we allow anon uploads to 'avatars'.
create policy "Public Upload"
on storage.objects for insert
to anon
with check ( bucket_id = 'avatars' );
