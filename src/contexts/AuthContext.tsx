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
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // 1. Cek Sesi Admin (Supabase)
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (currentSession) {
          setSession(currentSession);
          setRole('admin');
          setStudent(null);
        } else {
          // 2. Jika bukan admin, Cek Sesi Siswa (LocalStorage)
          const storedStudent = localStorage.getItem('student_session');
          if (storedStudent) {
            try {
              const parsedStudent = JSON.parse(storedStudent);
              // Set data awal dari local storage agar UI langsung muncul (Optimistic)
              setStudent(parsedStudent);
              setRole('student');
              setSession(null);

              // 3. RE-VALIDASI: Cek data terbaru ke server diam-diam
              // Ini penting jika admin baru saja upload foto atau mengubah status siswa
              const { data: freshStudent } = await supabase
                .from('students')
                .select('*')
                .eq('id', parsedStudent.id)
                .single();

              if (freshStudent) {
                if (freshStudent.status !== 'Active') {
                  // Jika siswa dinonaktifkan admin, logout paksa
                  console.warn('Student is no longer active');
                  localStorage.removeItem('student_session');
                  setStudent(null);
                  setRole(null);
                } else {
                  // Update data lokal dengan yang terbaru (misal ada foto baru)
                  setStudent(freshStudent);
                  localStorage.setItem('student_session', JSON.stringify(freshStudent));
                }
              }
            } catch (e) {
              console.error("Failed to parse student session", e);
              localStorage.removeItem('student_session');
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listener untuk perubahan auth Supabase (Login/Logout Admin)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;

      if (newSession) {
        setSession(newSession);
        setRole('admin');
        setStudent(null);
        localStorage.removeItem('student_session');
      } else {
        setSession(null);
        // Cek apakah ini logout murni atau switch ke siswa
        const storedStudent = localStorage.getItem('student_session');
        if (!storedStudent) {
          setRole(null);
          setStudent(null);
        }
        // Jika ada storedStudent, biarkan logika initializeAuth atau loginStudent yang menangani
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginStudent = (studentData: Student) => {
    setStudent(studentData);
    setRole('student');
    localStorage.setItem('student_session', JSON.stringify(studentData));
    supabase.auth.signOut(); // Pastikan sesi admin bersih
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (role === 'admin') {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('student_session');
      setStudent(null);
      setRole(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
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
