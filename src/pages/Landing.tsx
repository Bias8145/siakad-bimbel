import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, CheckCircle2, Users, BookOpen, Trophy, Loader2, Star, Heart } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FEF7FF] dark:bg-[#141218] text-[#1D1B20] dark:text-[#E6E1E5] font-sans overflow-x-hidden transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#FEF7FF]/80 dark:bg-[#141218]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[#EADDFF] dark:bg-[#4F378B]/30 p-2 rounded-xl">
                <GraduationCap className="h-8 w-8 text-[#4F378B] dark:text-[#D0BCFF]" />
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
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#EADDFF] dark:bg-[#4F378B]/30 text-[#21005D] dark:text-[#D0BCFF] text-sm font-bold tracking-wide">
              <Star className="h-4 w-4 mr-2 text-orange-500 fill-orange-500" />
              Platform Belajar Anak Juara
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight text-[#1D1B20] dark:text-white">
              {t('hero_title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
              {t('hero_subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="m3-button m3-button-primary text-lg px-8 shadow-xl shadow-purple-600/20 hover:shadow-purple-600/30 transform hover:-translate-y-1 transition-all"
              >
                {t('get_started')} <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-[#141218] bg-gray-200 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*123}`} alt="avatar" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Bergabung dengan <span className="text-[#4F378B] dark:text-[#D0BCFF] font-bold">500+ Siswa</span> lainnya
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Animated Blobs */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#FFD8E4] dark:bg-[#4A041D] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 dark:opacity-30 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#EADDFF] dark:bg-[#4F378B] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 dark:opacity-30 animate-blob animation-delay-2000"></div>
            
            <div className="relative bg-white dark:bg-[#2B2930] rounded-[40px] p-4 shadow-2xl border border-gray-100 dark:border-white/5 rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* RELEVANT IMAGE: Young kids learning */}
              <div className="relative overflow-hidden rounded-[32px] h-[500px]">
                <img 
                  src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80" 
                  alt="Happy elementary students" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="font-bold text-lg">Belajar Menyenangkan</p>
                  <p className="text-sm opacity-90">Metode interaktif untuk TK & SD</p>
                </div>
              </div>
              
              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-[#1D1B20] p-4 rounded-[24px] shadow-xl flex items-center gap-4 border border-gray-50 dark:border-white/5 animate-float">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Siswa Terdaftar</p>
                  <p className="text-xl font-bold dark:text-white">
                    {studentCount !== null ? `${studentCount} Siswa` : <Loader2 className="h-4 w-4 animate-spin" />}
                  </p>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute top-8 -right-6 bg-white dark:bg-[#1D1B20] p-3 rounded-[20px] shadow-lg border border-gray-50 dark:border-white/5 flex items-center gap-2 animate-float animation-delay-2000">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                  <Heart className="h-5 w-5 text-orange-500 fill-orange-500" />
                </div>
                <span className="font-bold text-sm dark:text-white">Terfavorit</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-white dark:bg-[#1D1B20] rounded-t-[60px] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-5">
           <div className="absolute top-20 left-20 w-32 h-32 rounded-full border-4 border-[#4F378B]"></div>
           <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-[#4F378B]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[#4F378B] dark:text-[#D0BCFF] font-bold tracking-wider uppercase text-sm mb-2 block">Tentang Kami</span>
            <h2 className="text-4xl font-bold mb-4 dark:text-white">{t('vision')} & {t('mission')}</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-[#4F378B] to-[#6750A4] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-3 lg:col-span-1 p-10 rounded-[40px] bg-[#FEF7FF] dark:bg-[#2B2930] border border-[#EADDFF] dark:border-white/5 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-[#EADDFF] dark:bg-[#4F378B]/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transform rotate-3">
                <Trophy className="h-8 w-8 text-[#21005D] dark:text-[#D0BCFF]" />
              </div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white">{t('vision')}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                {t('vision_text')}
              </p>
            </div>

            <div className="col-span-1 md:col-span-3 lg:col-span-2 p-10 rounded-[40px] bg-[#F3F4F6] dark:bg-[#2B2930] border border-gray-200 dark:border-white/5 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gray-200 dark:bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transform -rotate-2">
                <BookOpen className="h-8 w-8 text-gray-700 dark:text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold mb-8 dark:text-white">{t('mission')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[t('mission_text_1'), t('mission_text_2'), t('mission_text_3')].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="bg-white dark:bg-white/5 p-2 rounded-full shadow-sm">
                      <CheckCircle2 className="h-5 w-5 text-[#4F378B] dark:text-[#D0BCFF]" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1D1B20] text-white py-16 rounded-t-[60px] mt-[-60px] relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-white/10 p-2 rounded-xl">
              <GraduationCap className="h-8 w-8 text-[#D0BCFF]" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Bimbel Cendekia</span>
          </div>
          <div className="flex justify-center gap-6 mb-8 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
          <p className="text-gray-500 text-sm">© 2025 Bimbel Cendekia. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
