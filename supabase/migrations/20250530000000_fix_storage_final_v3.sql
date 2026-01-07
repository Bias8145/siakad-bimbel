-- Fix Storage Permissions V3
-- This script avoids "ALTER TABLE" on system tables to prevent "must be owner" errors.

-- 1. Create 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to avoid conflicts (Clean Slate)
-- We use DO block to ignore errors if policies don't exist
DO $$
BEGIN
    BEGIN EXECUTE 'DROP POLICY "Public Access" ON storage.objects'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'DROP POLICY "Admin Insert" ON storage.objects'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'DROP POLICY "Admin Update" ON storage.objects'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'DROP POLICY "Admin Delete" ON storage.objects'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'DROP POLICY "Avatar Public Access" ON storage.objects'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'DROP POLICY "Avatar Admin Upload" ON storage.objects'; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- 3. Create Policies
-- Policy: Everyone can view/download images (Public Read)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Policy: Authenticated users (Admins) can upload
CREATE POLICY "Admin Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- Policy: Authenticated users (Admins) can update
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' );

-- Policy: Authenticated users (Admins) can delete
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'avatars' );
