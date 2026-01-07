import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Student } from '../types';

type UserRole = 'admin' | 'student' | null;

interface AuthContextType {
  session: Session | null;
  student: Student | null;
  role: UserRole;
  loading: boolean;
  loginStudent: (studentData: Student) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check Supabase Session (Admin)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setRole('admin');
    });

    // Check Local Student Session
    const storedStudent = localStorage.getItem('student_session');
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
      setRole('student');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setRole('admin');
        setStudent(null);
        localStorage.removeItem('student_session');
      } else if (!localStorage.getItem('student_session')) {
        setRole(null);
      }
    });

    setLoading(false);
    return () => subscription.unsubscribe();
  }, []);

  const loginStudent = (studentData: Student) => {
    setStudent(studentData);
    setRole('student');
    localStorage.setItem('student_session', JSON.stringify(studentData));
    // Ensure admin session is cleared
    supabase.auth.signOut(); 
  };

  const logout = async () => {
    if (role === 'admin') {
      await supabase.auth.signOut();
    }
    setStudent(null);
    setRole(null);
    localStorage.removeItem('student_session');
  };

  return (
    <AuthContext.Provider value={{ session, student, role, loading, loginStudent, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
