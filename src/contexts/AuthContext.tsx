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
        
        if (mounted) {
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
                setStudent(parsedStudent);
                setRole('student');
                setSession(null);
              } catch (e) {
                console.error("Failed to parse student session", e);
                localStorage.removeItem('student_session');
              }
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
        // Jika ada sesi Supabase -> Admin Login
        setSession(newSession);
        setRole('admin');
        setStudent(null);
        localStorage.removeItem('student_session');
      } else {
        // Jika sesi Supabase hilang (Logout Admin atau Login Siswa)
        setSession(null);
        
        // Cek apakah ini switch ke siswa?
        const storedStudent = localStorage.getItem('student_session');
        if (storedStudent) {
          try {
            const parsedStudent = JSON.parse(storedStudent);
            setStudent(parsedStudent);
            setRole('student');
          } catch {
            setRole(null);
            setStudent(null);
          }
        } else {
          // Benar-benar logout
          setRole(null);
          setStudent(null);
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginStudent = (studentData: Student) => {
    // Set local state first to prevent UI flicker
    setStudent(studentData);
    setRole('student');
    localStorage.setItem('student_session', JSON.stringify(studentData));
    
    // Sign out from Supabase (Admin) if needed, but this triggers onAuthStateChange
    // The onAuthStateChange handler above is now smart enough to check localStorage
    supabase.auth.signOut(); 
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (role === 'admin') {
        await supabase.auth.signOut();
      }
      // Clear local state
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
