import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && role !== 'admin') {
      navigate('/login');
    }
  }, [role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEF7FF]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#4F378B]" />
          <p className="text-sm text-gray-500 font-medium">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  // Jika tidak loading tapi bukan admin, return null (karena useEffect akan redirect)
  if (role !== 'admin') return null;

  return <>{children}</>;
}
