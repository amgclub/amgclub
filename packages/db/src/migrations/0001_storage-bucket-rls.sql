-- Admin media storage: public bucket for uploaded images.
--
-- Uploads and deletes are performed server-side using SUPABASE_SECRET_KEY,
-- which bypasses RLS. Only a public read policy is needed so the frontend
-- can display stored images without authentication.

insert into storage.buckets (id, name, public)
values ('admin-media', 'admin-media', true)
on conflict (id) do update set public = true;

do $$
begin
	if not exists (
		select 1 from pg_policies
		where schemaname = 'storage' and tablename = 'objects'
			and policyname = 'Public read access to admin media'
	) then
		create policy "Public read access to admin media"
		on storage.objects for select
		to anon, authenticated
		using (bucket_id = 'admin-media');
	end if;
end $$;
