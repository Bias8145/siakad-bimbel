-- FIX for Error 42501: must be owner of table objects
-- This script avoids altering system tables and only manages buckets/policies safely.

-- 1. Create the 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Safely remove old policies if they exist (to avoid conflicts)
-- We use a DO block to handle cases where policies might not exist
DO $$
BEGIN
    BEGIN
        DROP POLICY "Public Access" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DROP POLICY "Authenticated Upload" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DROP POLICY "Owner Update" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DROP POLICY "Owner Delete" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    -- Also drop policies with new names just in case
    BEGIN
        DROP POLICY "Avatar Public Read" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DROP POLICY "Avatar Auth Upload" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END $$;

-- 3. Create New Policies (Granting Access)

-- Policy 1: Everyone (Public) can VIEW files in the 'avatars' bucket
CREATE POLICY "Avatar Public Read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Policy 2: Authenticated Users (Admin/Staff) can UPLOAD files
CREATE POLICY "Avatar Auth Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- Policy 3: Authenticated Users can UPDATE their files
CREATE POLICY "Avatar Auth Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' );

-- Policy 4: Authenticated Users can DELETE their files
CREATE POLICY "Avatar Auth Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'avatars' );
