export interface Student {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null; // Added
  parent_name: string | null;
  parent_phone: string | null;
  address: string | null;
  grade_level: string;
  status: 'Active' | 'Inactive';
  created_at: string;
}

export interface Schedule {
  id: string;
  subject: string;
  teacher_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string | null;
  grade_level: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string;
  status: 'Present' | 'Permission' | 'Sick' | 'Alpha';
  notes: string | null;
  student?: Student;
}

export interface Grade {
  id: string;
  student_id: string;
  subject: string;
  exam_type: string;
  score: number;
  date: string;
  student?: Student;
}
