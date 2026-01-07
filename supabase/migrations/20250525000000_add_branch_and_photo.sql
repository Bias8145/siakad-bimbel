-- Add branch and photo_url to students
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'Pusat',
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add branch to schedules
ALTER TABLE schedules 
ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'Pusat';

-- Note: You must create a public storage bucket named 'avatars' in Supabase Dashboard
