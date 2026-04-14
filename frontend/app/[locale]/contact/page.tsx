'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Phone, Mail, Send, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  const t = useTranslations('ContactUs');
  
  // استیت‌های فرم تماس
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // شبیه‌سازی ارسال پیام (چون فعلاً API برای Contact نداریم)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // پاک کردن پیام موفقیت بعد از ۵ ثانیه
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-sm pb-20">
      
      {/* --- بخش هدر --- */}
      <div className="bg-slate-900 pt-20 pb-28 px-4 text-center relative overflow-hidden">
        {/* افکت پس‌زمینه */}
        <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600"></div>
        
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase relative z-10">
          {t('title')}
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto font-bold uppercase tracking-widest relative z-10">
          {t('subtitle')}
        </p>
      </div>

      {/* --- بخش محتوای اصلی (۲ ستونه) --- */}
      <div className="container mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white border border-slate-300 shadow-2xl rounded-none">
          
          {/* ستون اول: اطلاعات تماس (۴ ستون از ۱۲ ستون در دسکتاپ) */}
          <div className="col-span-1 lg:col-span-5 bg-emerald-950 p-8 md:p-12 text-emerald-50 border-r-4 border-emerald-800">
            <div className="flex items-center gap-2 mb-8">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Support</span>
            </div>
            
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter leading-none">
              {t('getInTouch')}
            </h2>
            <p className="text-emerald-200/80 font-medium mb-12 text-justify leading-relaxed">
              {t('description')}
            </p>

            <div className="space-y-8">
              {/* آدرس */}
              <div className="flex items-start gap-4">
                <div className="bg-emerald-900 p-3 flex-shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-[10px] tracking-widest text-emerald-300 mb-1">{t('addressTitle')}</h3>
                  <p className="text-xs font-bold leading-relaxed whitespace-pre-line">{t('addressText')}</p>
                </div>
              </div>

              {/* تلفن */}
              <div className="flex items-start gap-4">
                <div className="bg-emerald-900 p-3 flex-shrink-0">
                  <Phone className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-[10px] tracking-widest text-emerald-300 mb-1">{t('phoneTitle')}</h3>
                  <p className="text-xs font-bold leading-relaxed whitespace-pre-line">{t('phoneText')}</p>
                </div>
              </div>

              {/* ایمیل */}
              <div className="flex items-start gap-4">
                <div className="bg-emerald-900 p-3 flex-shrink-0">
                  <Mail className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-[10px] tracking-widest text-emerald-300 mb-1">{t('emailTitle')}</h3>
                  <p className="text-xs font-bold leading-relaxed whitespace-pre-line">{t('emailText')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ستون دوم: فرم تماس (۷ ستون منهای ۱ برای فاصله) */}
          <div className="col-span-1 lg:col-span-7 p-8 md:p-12 bg-white">
            <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter border-b border-slate-100 pb-4">
              {t('formTitle')}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('nameLabel')}</Label>
                  <Input required className="rounded-none h-12 text-sm font-bold border-slate-300 focus-visible:ring-emerald-700 bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('emailLabel')}</Label>
                  <Input required type="email" className="rounded-none h-12 text-sm font-bold border-slate-300 focus-visible:ring-emerald-700 bg-slate-50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('subjectLabel')}</Label>
                <Input required className="rounded-none h-12 text-sm font-bold border-slate-300 focus-visible:ring-emerald-700 bg-slate-50" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('messageLabel')}</Label>
                <textarea 
                  required 
                  rows={5}
                  className="flex w-full rounded-none border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-bold ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || isSuccess}
                className={`w-full md:w-auto rounded-none h-12 px-10 text-xs font-black uppercase tracking-widest transition-all ${isSuccess ? 'bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-emerald-900 text-white'}`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isSuccess ? (
                  "Message Sent!"
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" /> {t('sendBtn')}
                  </div>
                )}
              </Button>
              
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}