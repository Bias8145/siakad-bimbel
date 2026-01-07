import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function StudentGuard({ children }: { children: React.ReactNode }) {
  const { student, loading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!student) {
        navigate('/login');
      }
      setIsChecking(false);
    }
  }, [student, loading, navigate]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEF7FF]">
        <Loader2 className="h-8 w-8 animate-spin text-[#4F378B]" />
      </div>
    );
  }

  return <>{children}</>;
}
