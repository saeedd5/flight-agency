'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing'; // استفاده از روتر دوزبانه
import { useAuth } from '../context/AuthContext'; // مسیر اصلاح شده
import { useTranslations } from 'next-intl'; // هوک ترجمه
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Users, CircleDollarSign, UserCog, Loader2 } from 'lucide-react';

// ایمپورت کامپوننت‌های تب‌ها
import { UserManagement } from './components/UserManagement';
import { PriceManagement } from './components/PriceManagement';
import { ProfileSettings } from './components/ProfileSettings';

export default function AdminPanelPage() {
  const t = useTranslations('AdminPanel');
  const { user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // محافظت از صفحه و اطمینان از لود شدن استیت
  useEffect(() => {
    if (user === null) {
      if (typeof window !== 'undefined' && localStorage.getItem('token')) return;
      router.replace('/admin');
      return;
    }
    
    const rolesRaw = JSON.stringify(user?.roles || []).toLowerCase();
    const isAdmin = rolesRaw.includes('admin');

    if (!isAdmin) {
      router.replace('/'); 
    } else {
      setIsChecking(false); 
    }
  }, [user, router]);

  if (isChecking) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {t('authenticating')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-8 h-8 text-emerald-700" />
          <div>
            <h1 className="text-xl font-black text-emerald-900 tracking-tighter uppercase">
              {t('title')}
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-200 rounded-none h-12 p-0 shadow-sm overflow-hidden">
            <TabsTrigger 
              value="users" 
              className="rounded-none text-[10px] md:text-xs font-black uppercase tracking-widest data-[state=active]:bg-emerald-800 data-[state=active]:text-white h-full transition-all"
            >
              <Users className="w-4 h-4 me-2" /> {t('tabs.users')}
            </TabsTrigger>
            
            <TabsTrigger 
              value="pricing" 
              className="rounded-none text-[10px] md:text-xs font-black uppercase tracking-widest data-[state=active]:bg-emerald-800 data-[state=active]:text-white h-full transition-all"
            >
              <CircleDollarSign className="w-4 h-4 me-2" /> {t('tabs.pricing')}
            </TabsTrigger>
            
            <TabsTrigger 
              value="settings" 
              className="rounded-none text-[10px] md:text-xs font-black uppercase tracking-widest data-[state=active]:bg-emerald-800 data-[state=active]:text-white h-full transition-all"
            >
              <UserCog className="w-4 h-4 me-2" /> {t('tabs.settings')}
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="pricing">
              <PriceManagement />
            </TabsContent>

            <TabsContent value="settings">
              <ProfileSettings />
            </TabsContent>
          </div>
        </Tabs>

      </div>
    </div>
  );
}