-- 1. Create the 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop any existing policies on the 'avatars' bucket to prevent conflicts
-- We use a DO block to handle potential errors if policies don't exist
DO $$
BEGIN
    BEGIN
        DROP POLICY "Avatar Public Access" ON storage.objects;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
        DROP POLICY "Avatar Admin Access" ON storage.objects;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
        DROP POLICY "Public Access" ON storage.objects;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;
END $$;

-- 3. Create a SINGLE, simple policy that allows everything for the 'avatars' bucket
-- This allows both Admins (Authenticated) and Students (Anon) to upload/view photos
CREATE POLICY "Avatar Full Access"
ON storage.objects FOR ALL
USING ( bucket_id = 'avatars' )
WITH CHECK ( bucket_id = 'avatars' );

-- 4. Ensure the bucket is public (redundant safety check)
UPDATE storage.buckets
SET public = true
WHERE id = 'avatars';
