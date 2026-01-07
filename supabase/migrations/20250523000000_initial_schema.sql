/*
  # Initial Schema for Academic Information System
  
  ## Query Description:
  Creates the core tables for the tutoring center system: students, schedules, attendance, and grades.
  It includes Row Level Security (RLS) policies to allow public access for this prototype (can be restricted later).

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Tables: students, schedules, attendance, grades
*/

-- Create Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    parent_name TEXT,
    parent_phone TEXT,
    address TEXT,
    grade_level TEXT, -- e.g., "10 SMA", "9 SMP"
    status TEXT DEFAULT 'Active', -- Active, Inactive
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Schedules Table
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    teacher_name TEXT,
    day_of_week TEXT NOT NULL, -- Monday, Tuesday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room TEXT,
    grade_level TEXT, -- To match with students
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Permission', 'Sick', 'Alpha')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Grades Table
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    exam_type TEXT NOT NULL, -- Tryout, Exam, Quiz
    score NUMERIC(5,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public access for prototype simplicity, replace with auth in production)
CREATE POLICY "Allow public access to students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to schedules" ON public.schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to grades" ON public.grades FOR ALL USING (true) WITH CHECK (true);
