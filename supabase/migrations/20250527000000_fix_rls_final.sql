-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- POLICY 1: ADMIN (Authenticated) gets FULL ACCESS to everything
CREATE POLICY "Admin Full Access Students" ON students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Attendance" ON attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Schedules" ON schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Grades" ON grades FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- POLICY 2: PUBLIC/STUDENTS (Anon) gets READ ONLY access
-- This is required because students login using a custom method (not Supabase Auth), 
-- so they are technically "anonymous" users to the database.
CREATE POLICY "Public Read Students" ON students FOR SELECT TO anon USING (true);
CREATE POLICY "Public Read Attendance" ON attendance FOR SELECT TO anon USING (true);
CREATE POLICY "Public Read Schedules" ON schedules FOR SELECT TO anon USING (true);
CREATE POLICY "Public Read Grades" ON grades FOR SELECT TO anon USING (true);

-- STORAGE POLICIES (For Photo Upload)
-- Allow public read access to avatars bucket
CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT TO public USING ( bucket_id = 'avatars' );
-- Allow authenticated (Admin) to upload/update/delete
CREATE POLICY "Admin Upload Avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'avatars' );
CREATE POLICY "Admin Update Avatars" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'avatars' );
CREATE POLICY "Admin Delete Avatars" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'avatars' );
-- Allow Anon (Students) to upload their own photo (Optional, strictly speaking they need permission)
CREATE POLICY "Anon Upload Avatars" ON storage.objects FOR INSERT TO anon WITH CHECK ( bucket_id = 'avatars' );
