'use client';

import { useTranslations } from 'next-intl';
import { Building2, Target, Globe2, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  const t = useTranslations('AboutUs');

  return (
    <main className="min-h-screen bg-white font-sans text-sm pb-20">
      
      {/* --- بخش هدر (تیره و شارپ) --- */}
      <div className="bg-emerald-950 pt-20 pb-28 px-4 text-center border-b border-emerald-900">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase">
          {t('title')}
        </h1>
        <p className="text-emerald-400 text-sm md:text-base max-w-2xl mx-auto font-bold uppercase tracking-widest opacity-80">
          {t('subtitle')}
        </p>
      </div>

      {/* --- بخش محتوای اصلی (۲ ستونه) --- */}
      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white border border-slate-300 shadow-2xl overflow-hidden rounded-none">
          
          {/* ستون اول: متن‌ها */}
          <div className="p-8 md:p-12 flex flex-col justify-center bg-white border-b lg:border-b-0 lg:border-r border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-emerald-700" />
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-[0.3em]">Identity</span>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter leading-none">
              FlightAgency <br/>
              <span className="text-emerald-700">Digital Gateway</span>
            </h2>
            
            <p className="text-slate-500 leading-relaxed font-medium mb-8 text-justify">
              {t('description')}
            </p>

            {/* کارت‌های کوچک ویژگی‌ها */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Target className="w-4 h-4" />
                  <h3 className="font-black uppercase text-[11px] tracking-tight">{t('missionTitle')}</h3>
                </div>
                <p className="text-[11px] text-slate-400 font-bold leading-tight">{t('missionText')}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Globe2 className="w-4 h-4" />
                  <h3 className="font-black uppercase text-[11px] tracking-tight">{t('reachTitle')}</h3>
                </div>
                <p className="text-[11px] text-slate-400 font-bold leading-tight">{t('reachText')}</p>
              </div>
            </div>
          </div>

          {/* ستون دوم: عکس (پلِیس‌هولدر شارپ) */}
          <div className="relative min-h-[400px] bg-slate-100 flex items-center justify-center overflow-hidden group">
            {/* دیزاین پس‌زمینه برای زمانی که عکس خالی است */}
            <div className="absolute inset-0 bg-emerald-900/5 mix-blend-multiply"></div>
            <div className="absolute inset-10 border-4 border-emerald-900/20 opacity-20"></div>
            
            <Image 
              src="/travel.jpeg" // 🔥 آدرس تصویر فعلاً خالی است 🔥
              alt="About Flight Agency"
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
            
            {/* روی عکس یک لیبل قرار می‌دهیم تا خالی بودنش شیک باشد */}
            <div className="absolute bottom-6 right-6 bg-emerald-950 text-white p-4 rounded-none shadow-xl border-l-4 border-emerald-500">
               <ShieldCheck className="w-8 h-8 text-emerald-400 mb-2" />
               <div className="text-[10px] font-black uppercase tracking-widest">Sabre Powered</div>
               <div className="text-[8px] font-bold text-emerald-600 uppercase mt-1">Official Provider</div>
            </div>
          </div>

        </div>
      </div>

      {/* بخش پایین صفحه (امکانات کوتاه) */}
      <div className="container mx-auto px-4 mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
         {[1, 2, 3, 4].map((i) => (
           <div key={i} className="h-1 bg-emerald-100 relative">
              <div className="absolute top-0 left-0 h-full bg-emerald-800 w-1/3"></div>
           </div>
         ))}
      </div>
    </main>
  );
}