import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Star, Users, ShieldCheck, Zap, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [studentCount, setStudentCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { count } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'Active');
      setStudentCount(count || 0);
    };
    fetchStats();
  }, []);

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF7FF] dark:bg-[#141218] text-[#1D1B20] dark:text-[#E6E1E5] font-sans selection:bg-[#EADDFF] selection:text-[#21005D]">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#FEF7FF]/90 dark:bg-[#141218]/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#6750A4] p-2.5 rounded-xl text-white shadow-lg shadow-[#6750A4]/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1D1B20] dark:text-white">Bimbel Cendekia</span>
          </div>
          <button onClick={() => navigate('/login')} className="m3-btn m3-btn-primary rounded-full px-8">
            {t('login_button')}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#EADDFF] dark:bg-[#4F378B] text-[#21005D] dark:text-[#EADDFF] text-sm font-bold tracking-wide border border-[#6750A4]/10">
              <Star className="h-3.5 w-3.5 mr-2 fill-current" />
              Platform Pendidikan No. 1
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-[#1D1B20] dark:text-white">
              Wujudkan Masa Depan <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6750A4] to-[#D0BCFF]">Gemilang.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
              Platform pendidikan holistik yang menyinergikan potensi siswa dengan teknologi terkini. Pantau akademik, kehadiran, dan jadwal dalam satu aplikasi.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <button onClick={() => navigate('/login')} className="m3-btn m3-btn-primary h-14 px-10 text-base">
                {t('get_started')} <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button onClick={scrollToFeatures} className="m3-btn m3-btn-tonal h-14 px-10 text-base">
                Pelajari Lebih Lanjut
              </button>
            </div>

            <div className="flex items-center gap-4 pt-6">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-[3px] border-[#FEF7FF] dark:border-[#141218] overflow-hidden bg-gray-200">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*99}`} alt="avatar" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-[#1D1B20] dark:text-white">{studentCount ? `${studentCount}+` : '100+'} Siswa</span>
                <span className="text-sm text-gray-500">Telah bergabung bersama kami</span>
              </div>
            </div>
          </motion.div>

          {/* Image Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#EADDFF] to-[#FFD8E4] dark:from-[#4F378B] dark:to-[#4A041D] rounded-[48px] rotate-3 opacity-60 blur-3xl"></div>
            <div className="relative rounded-[48px] overflow-hidden shadow-2xl border-[8px] border-white dark:border-[#2B2930]">
              <img 
                src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1200&auto=format&fit=crop" 
                alt="Happy Student Learning" 
                className="w-full h-[500px] lg:h-[600px] object-cover hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="bg-white/20 backdrop-blur-md border border-white/30 p-6 rounded-3xl">
                  <p className="font-bold text-xl mb-1 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Metode Terbukti
                  </p>
                  <p className="text-white/90">Pendekatan personal yang membuat anak nyaman belajar.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[#F3EDF7] dark:bg-[#1D1B20] rounded-t-[64px]">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#6750A4] dark:text-[#D0BCFF] font-bold tracking-widest uppercase text-sm">Keunggulan Kami</span>
            <h2 className="text-4xl font-bold mt-3 mb-6 text-[#1D1B20] dark:text-white">Fasilitas Belajar Terbaik</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Kami menyediakan lingkungan belajar yang kondusif dengan dukungan teknologi modern.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Real-time Monitoring", desc: "Pantau nilai dan kehadiran siswa secara langsung melalui dashboard.", color: "bg-yellow-100 text-yellow-700" },
              { icon: Users, title: "Pengajar Profesional", desc: "Didukung oleh tim pengajar berpengalaman dan tersertifikasi.", color: "bg-blue-100 text-blue-700" },
              { icon: ShieldCheck, title: "Laporan Terperinci", desc: "Dapatkan laporan perkembangan akademik siswa secara berkala.", color: "bg-green-100 text-green-700" }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#FEF7FF] dark:bg-[#2B2930] p-8 rounded-[32px] hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-gray-100 dark:border-white/5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${item.color}`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[#1D1B20] dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Rounded & Elegant */}
      <footer className="bg-[#1D1B20] text-white pt-20 pb-12 rounded-t-[64px] mt-[-40px] relative z-10">
        <div className="max-w-[1440px] mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-[#D0BCFF] p-2 rounded-xl text-[#1D1B20]">
              <GraduationCap className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Bimbel Cendekia</span>
          </div>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">
            Membangun masa depan cerah melalui pendidikan berkualitas dan berkarakter. Bergabunglah bersama ribuan siswa berprestasi lainnya.
          </p>
          <div className="w-full h-px bg-white/10 mb-8"></div>
          <p className="text-gray-500 text-sm">© 2025 Bimbel Cendekia. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
