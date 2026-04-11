'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../app/[locale]/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Users, CircleDollarSign, UserCog, Loader2 } from 'lucide-react';

// ایمپورت کامپوننت‌های تب‌ها
import { UserManagement } from './components/UserManagement';
import { PriceManagement } from './components/PriceManagement';
import { ProfileSettings } from './components/ProfileSettings';

export default function AdminPanelPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // محافظت از صفحه و اطمینان از لود شدن استیت
  useEffect(() => {
    // اگر هنوز در حال خواندن از لوکال استورج است، صبر کن
    if (user === null && typeof window !== 'undefined' && localStorage.getItem('token')) {
      return;
    }
    
    // استخراج امن نقش ادمین
    const rolesRaw = JSON.stringify(user?.roles || []).toLowerCase();
    const isAdmin = rolesRaw.includes('admin');

    if (!user || !isAdmin) {
      router.replace('/admin'); // اخراج افراد غیرمجاز
    } else {
      setIsChecking(false); // اجازه ورود صادر شد
    }
  }, [user, router]);

  // نمایش لودینگ فقط تا زمانی که مطمئن شویم کاربر ادمین است
  if (isChecking) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Authenticating...
          </span>
        </div>
      </div>
    );
  }

  // نمایش داشبورد اصلی ادمین
  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-8 h-8 text-emerald-700" />
          <div>
            <h1 className="text-xl font-black text-emerald-900 tracking-tighter uppercase">Admin Panel</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">System Control & Configuration</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-200 rounded-none h-12 p-0">
            <TabsTrigger value="users" className="rounded-none text-xs font-bold uppercase tracking-wider data-[state=active]:bg-emerald-800 data-[state=active]:text-white h-full">
              <Users className="w-4 h-4 mr-2" /> User Management
            </TabsTrigger>
            
            <TabsTrigger value="pricing" className="rounded-none text-xs font-bold uppercase tracking-wider data-[state=active]:bg-emerald-800 data-[state=active]:text-white h-full">
              <CircleDollarSign className="w-4 h-4 mr-2" /> Price Management
            </TabsTrigger>
            
            <TabsTrigger value="settings" className="rounded-none text-xs font-bold uppercase tracking-wider data-[state=active]:bg-emerald-800 data-[state=active]:text-white h-full">
              <UserCog className="w-4 h-4 mr-2" /> Profile Settings
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