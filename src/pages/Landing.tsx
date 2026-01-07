import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, CheckCircle2, Users, BookOpen, Trophy, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [studentCount, setStudentCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Active');
        setStudentCount(count || 0);
      } catch (error) {
        console.error('Error fetching stats', error);
      }
    };
    fetchStats();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-[#FEF7FF] text-[#1D1B20] font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#FEF7FF]/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[#EADDFF] p-2 rounded-xl">
                <GraduationCap className="h-8 w-8 text-[#4F378B]" />
              </div>
              <span className="text-xl font-bold tracking-tight">Bimbel Cendekia</span>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="m3-button m3-button-primary"
              >
                {t('login_button')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="space-y-8"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#EADDFF] text-[#21005D] text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-[#4F378B] mr-2"></span>
              Platform Bimbel Terpercaya
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight text-[#1D1B20]">
              {t('hero_title')}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              {t('hero_subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="m3-button m3-button-primary text-lg px-8"
              >
                {t('get_started')} <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#FFD8E4] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#EADDFF] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            
            <div className="relative bg-white rounded-[40px] p-6 shadow-2xl border border-gray-100 rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80" 
                alt="Students learning" 
                className="rounded-[32px] w-full object-cover h-[500px]"
              />
              
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-[24px] shadow-xl flex items-center gap-4 border border-gray-50">
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Siswa Terdaftar</p>
                  <p className="text-xl font-bold">
                    {studentCount !== null ? `${studentCount} Siswa` : <Loader2 className="h-4 w-4 animate-spin" />}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-white rounded-t-[60px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('vision')} & {t('mission')}</h2>
            <div className="h-1 w-20 bg-[#4F378B] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-3 lg:col-span-1 p-8 rounded-[32px] bg-[#FEF7FF] border border-[#EADDFF]">
              <div className="bg-[#EADDFF] w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <Trophy className="h-7 w-7 text-[#21005D]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('vision')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('vision_text')}
              </p>
            </div>

            <div className="col-span-1 md:col-span-3 lg:col-span-2 p-8 rounded-[32px] bg-[#F3F4F6] border border-gray-200">
              <div className="bg-gray-200 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="h-7 w-7 text-gray-700" />
              </div>
              <h3 className="text-2xl font-bold mb-6">{t('mission')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[t('mission_text_1'), t('mission_text_2'), t('mission_text_3')].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#4F378B] flex-shrink-0" />
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1D1B20] text-white py-12 rounded-t-[60px] mt-[-60px] relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <GraduationCap className="h-8 w-8 text-[#D0BCFF]" />
            <span className="text-2xl font-bold">Bimbel Cendekia</span>
          </div>
          <p className="text-gray-400">© 2025 Bimbel Cendekia. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
