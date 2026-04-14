'use client';

import { useState } from 'react';
import { usePathname, useRouter, Link } from '@/i18n/routing'; 
import { useTranslations, useLocale } from 'next-intl'; 
import { useAuth } from '@/app/context/AuthContext';
import { login, register } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plane, LogOut, LayoutDashboard, Ticket, Globe, ShieldCheck, Home, Info, Phone, Search, Loader2, Menu, X, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  const { user, loginState, logoutState } = useAuth();
  
  // استیت‌ها
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('User');

  // مخفی کردن Navbar در صفحه لاگین ادمین
  if (pathname === '/admin') return null;

  const switchLanguage = (newLocale: 'en' | 'ar-IQ') => {
    router.replace(pathname, { locale: newLocale });
    setIsMobileMenuOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (isLoginTab) {
      const res = await login(phone, password);
      if (res.success && res.user && res.token) {
        loginState(res.user, res.token);
        setIsModalOpen(false);
      } else { 
        setError(res.errorMessage || 'Login failed'); 
      }
    } else {
      const res = await register({ name, phone, password, role });
      if (res.success) {
        if (res.token && res.user) { 
          loginState(res.user, res.token); 
          setIsModalOpen(false); 
        } else if (res.errorMessage === 'pending_approval') { 
          alert('Agency registered successfully! Wait for admin approval.'); 
          setIsModalOpen(false); 
        }
      } else { 
        setError(res.errorMessage || 'Registration failed'); 
      }
    }
    setIsLoading(false);
  };

  // تشخیص امن نقش‌ها
  const rolesRawString = JSON.stringify(user?.roles || []).toLowerCase();
  const isAgency = rolesRawString.includes('agency');
  const isAdmin = rolesRawString.includes('admin');
  const isUser = rolesRawString.includes('user') && !isAgency && !isAdmin;

  // تعریف دسترسی آیتم‌های منو
  const menuItems = [
    { href: '/', label: t('home'), icon: Home, showTo: 'all' },
    { href: '/about', label: t('about'), icon: Info, showTo: 'all' },
    { href: '/contact', label: t('contact'), icon: Phone, showTo: 'all' },
    { href: '/my-bookings', label: t('myBookings'), icon: Ticket, showTo: 'logged_in_users' }, // کاربر یوزر، آژانس و ادمین
    { href: '/agency-panel', label: t('myPanel'), icon: LayoutDashboard, showTo: 'agency_admin' }, // فقط آژانس و ادمین
    { href: '/agency-search', label: t('agencySearch'), icon: Search, showTo: 'agency_admin' }, // فقط آژانس و ادمین
    { href: '/admin-panel', label: t('adminPanel'), icon: ShieldCheck, showTo: 'admin' }, // فقط ادمین
  ];

  const canShow = (itemShowTo: string) => {
    if (itemShowTo === 'all') return true;
    if (!user) return false; // هیچ لاگین‌نکرده‌ای نباید آیتم‌های پایین را ببیند
    if (itemShowTo === 'logged_in_users') return true; // چون قبلا چک کردیم user وجود دارد
    if (itemShowTo === 'agency_admin' && (isAgency || isAdmin)) return true;
    if (itemShowTo === 'admin' && isAdmin) return true;
    return false;
  };

  const filteredMenuItems = menuItems.filter(item => canShow(item.showTo));

  return (
    <>
      <nav className="bg-emerald-950 text-white py-3 px-4 md:px-6 border-b border-emerald-900 shadow-sm relative z-50">
        
        {/* =========================================================
            نسخه دسکتاپ
        ========================================================= */}
        <div className="hidden md:flex justify-between items-center w-full">
          
          {/* سمت چپ: لوگو + منوها */}
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer font-black text-lg text-emerald-400">
                <Plane className="h-5 w-5" />
                <span>FlightAgency</span>
              </div>
            </Link>
            <div className="flex items-center gap-5">
              {filteredMenuItems.map(item => (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    "text-[10px] font-black uppercase tracking-widest text-emerald-200 hover:text-white transition-colors", 
                    pathname === item.href && "text-white border-b-2 border-emerald-500 pb-0.5"
                  )}>
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* سمت راست: تغییر زبان + اطلاعات کاربر / دکمه لاگین */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => switchLanguage(locale === 'en' ? 'ar-IQ' : 'en')} 
              className="flex items-center gap-1.5 text-[10px] font-black text-emerald-300 hover:text-white uppercase tracking-widest border border-emerald-800 px-3 py-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              {locale === 'en' ? 'العربية' : 'English'}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3 bg-emerald-900/50 pl-4 border border-emerald-800">
                <div className="text-right py-1.5">
                  <div className="text-[10px] font-black text-white uppercase">{user.name}</div>
                  <div className="text-[8px] font-bold text-emerald-400 uppercase leading-none mt-0.5">
                    {isAdmin ? 'Admin' : (isAgency ? 'Agency' : 'User')}
                  </div>
                </div>
                <button onClick={logoutState} className="bg-red-900/80 p-2.5 hover:bg-red-800 transition-colors" title={t('logout')}>
                  <LogOut className="w-4 h-4 text-red-100" />
                </button>
              </div>
            ) : (
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-none bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] h-9 px-6 tracking-widest uppercase">
                    {t('loginBtn')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[360px] p-0 bg-white rounded-none border-emerald-800 shadow-2xl gap-0">
                   {/* محتوای مودال در پایین قرار دارد */}
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* =========================================================
            نسخه موبایل
        ========================================================= */}
        <div className="md:hidden flex items-center justify-between w-full h-10">
          
          {/* سمت چپ: دکمه لاگین یا اسم کاربر */}
          <div className="flex-1 flex justify-start">
            {user ? (
              <div className="flex items-center gap-2">
                <button onClick={logoutState} className="bg-red-900/50 p-1.5 border border-red-900/50"><LogOut className="w-3.5 h-3.5 text-red-200" /></button>
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-white truncate max-w-[80px] uppercase leading-none">{user.name}</span>
                   <span className="text-[7px] font-bold text-emerald-400 uppercase mt-0.5">{isAgency ? 'Agency' : (isAdmin ? 'Admin' : 'User')}</span>
                </div>
              </div>
            ) : (
              <button onClick={() => setIsModalOpen(true)} className="text-[9px] font-black uppercase tracking-widest text-white bg-emerald-700 px-3 py-1.5 shadow-sm">
                {t('tabLogin')}
              </button>
            )}
          </div>

          {/* وسط: لوگو */}
          <div className="flex-1 flex justify-center">
            <Link href="/">
              <div className="flex items-center gap-1.5 cursor-pointer font-black tracking-tighter text-lg text-emerald-400">
                <Plane className="h-5 w-5" />
              </div>
            </Link>
          </div>

          {/* سمت راست: منوی همبرگری */}
          <div className="flex-1 flex justify-end">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1.5 border border-emerald-800 text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors">
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* =========================================================
          محتوای منوی کشویی موبایل (پس‌زمینه سفید)
      ========================================================= */}
      <div className={cn(
        "md:hidden fixed top-[65px] bottom-0 left-0 right-0 bg-white z-40 p-6 transform transition-transform duration-300 ease-in-out border-t border-slate-200 shadow-2xl flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full" 
      )}>
        
        {/* لیست منوها */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {filteredMenuItems.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <div className={cn(
                  "flex items-center gap-4 p-4 border transition-colors", 
                  pathname === item.href 
                    ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm" 
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                )}>
                  <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-emerald-700" : "text-slate-400")} />
                  <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* بخش پایین منو: تغییر زبان */}
        <div className="pt-6 border-t border-slate-200 mt-auto pb-4">
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 text-center">Select Language</p>
          <div className="flex gap-2">
            <button 
              onClick={() => switchLanguage('en')} 
              className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest border transition-all", locale === 'en' ? 'bg-emerald-800 text-white border-emerald-900 shadow-md' : 'bg-slate-100 text-slate-500 border-slate-200')}
            >
              {t('langEn')}
            </button>
            <button 
              onClick={() => switchLanguage('ar-IQ')} 
              className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest border transition-all", locale === 'ar-IQ' ? 'bg-emerald-800 text-white border-emerald-900 shadow-md' : 'bg-slate-100 text-slate-500 border-slate-200')}
            >
              {t('langAr')}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          محتوای مودال لاگین/ثبت‌نام
      ========================================================= */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[380px] p-0 bg-white rounded-none border-emerald-800 shadow-2xl gap-0">
          <DialogTitle className="sr-only">Authentication</DialogTitle>
          <div className="flex text-xs font-black uppercase tracking-widest text-center">
            <div onClick={() => { setIsLoginTab(true); setError(''); }} className={cn("flex-1 py-4 cursor-pointer transition-colors", isLoginTab ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>{t('tabLogin')}</div>
            <div onClick={() => { setIsLoginTab(false); setError(''); }} className={cn("flex-1 py-4 cursor-pointer transition-colors", !isLoginTab ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>{t('tabSignup')}</div>
          </div>
          <div className="p-6">
            {error && <div className="bg-red-50 text-red-600 p-2 mb-4 text-[10px] font-bold border border-red-200 text-center">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginTab && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">{t('fullName')}</Label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-none h-10 text-xs font-bold border-slate-300 focus-visible:ring-emerald-700 bg-slate-50" />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">{t('phone')}</Label>
                <Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-none h-10 text-xs font-bold border-slate-300 focus-visible:ring-emerald-700 bg-slate-50" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">{t('password')}</Label>
                <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-none h-10 text-xs font-bold border-slate-300 focus-visible:ring-emerald-700 bg-slate-50" />
              </div>
              {!isLoginTab && (
                <div className="space-y-2 pt-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">{t('accountType')}</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-[10px] font-black text-slate-700 uppercase">
                      <input type="radio" name="role" value="User" checked={role === 'User'} onChange={() => setRole('User')} className="accent-emerald-700" />
                      {t('roleUser')}
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[10px] font-black text-slate-700 uppercase">
                      <input type="radio" name="role" value="Agency" checked={role === 'Agency'} onChange={() => setRole('Agency')} className="accent-emerald-700" />
                      {t('roleAgency')}
                    </label>
                  </div>
                </div>
              )}
              <Button type="submit" disabled={isLoading} className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs h-12 mt-4 uppercase tracking-widest shadow-md">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isLoginTab ? t('submitLogin') : t('submitSignup'))}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}