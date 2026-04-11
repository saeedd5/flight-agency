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
import { Plane, LogOut, LayoutDashboard, Ticket, Globe, ShieldCheck, Home, Info, Phone, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const { user, loginState, logoutState } = useAuth();
  
  // --- استیت‌های مودال ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- استیت‌های فرم ---
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('User');

  // مخفی کردن کل Navbar در صفحه لاگین ادمین
  if (pathname === '/admin') return null;

  const switchLanguage = () => {
    const newLocale = locale === 'en' ? 'ar-IQ' : 'en';
    router.replace(pathname, { locale: newLocale });
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
          alert('Agency registered successfully! Please wait for admin approval.');
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
  const isUser = !isAgency && !isAdmin;

  // تعریف آیتم‌های منو بر اساس نقش
  const menuItems = [
    { href: '/', label: t('home'), icon: Home, showTo: 'all' },
    { href: '/about', label: t('about'), icon: Info, showTo: 'all' },
    { href: '/contact', label: t('contact'), icon: Phone, showTo: 'all' },
    { href: '/my-bookings', label: t('myBookings'), icon: Ticket, showTo: 'user_admin' },
    { href: '/agency-panel', label: t('myPanel'), icon: LayoutDashboard, showTo: 'agency_admin' },
    { href: '/agency-search', label: t('agencySearch'), icon: Search, showTo: 'agency_admin' },
    { href: '/admin-panel', label: t('adminPanel'), icon: ShieldCheck, showTo: 'admin' },
  ];

  const canShow = (itemShowTo: string) => {
    if (itemShowTo === 'all') return true;
    if (!user) return false;
    if (itemShowTo === 'user_admin' && (isUser || isAdmin)) return true;
    if (itemShowTo === 'agency_admin' && (isAgency || isAdmin)) return true;
    if (itemShowTo === 'admin' && isAdmin) return true;
    return false;
  };

  const filteredMenuItems = menuItems.filter(item => canShow(item.showTo));

  return (
    <>
      {/* ======================= دسکتاپ Navbar ======================= */}
      <nav className="hidden md:flex bg-emerald-950 text-white py-3 px-6 justify-between items-center border-b border-emerald-900 shadow-sm relative z-50">
        
        <div className="flex items-center gap-8">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer font-black tracking-tighter text-lg text-emerald-400">
              <Plane className="h-5 w-5" />
              <span>FlightAgency</span>
            </div>
          </Link>
          <div className="flex items-center gap-5">
            {filteredMenuItems.map(item => (
              <Link key={item.href} href={item.href}>
                <div className={cn("text-xs font-bold uppercase tracking-wider text-emerald-200 hover:text-white transition-colors", pathname === item.href && "text-white border-b-2 border-emerald-500 pb-1")}>
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={switchLanguage} className="flex items-center gap-1.5 text-xs font-bold text-emerald-200 hover:text-white transition-colors">
            <Globe className="w-4 h-4" />
            <span className="uppercase tracking-widest">{locale === 'en' ? 'AR' : 'EN'}</span>
          </button>
          
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs font-bold text-white">{user.name}</div>
                <div className="text-[10px] font-black uppercase text-emerald-400">
                  {isAdmin ? 'Admin' : (isAgency ? 'Agency' : 'User')}
                </div>
              </div>
              <button onClick={logoutState} className="bg-red-800 hover:bg-red-700 p-2 rounded-none transition-colors" title={t('logout')}>
                <LogOut className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-6 tracking-wider border-none">
                  {t('loginBtn')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[360px] p-0 bg-white rounded-none border-emerald-800 shadow-2xl gap-0">
                <DialogTitle className="sr-only">Authentication</DialogTitle>
                <div className="flex text-xs font-bold uppercase tracking-wider text-center">
                  <div onClick={() => { setIsLoginTab(true); setError(''); }} className={`flex-1 py-4 cursor-pointer transition-colors ${isLoginTab ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{t('tabLogin')}</div>
                  <div onClick={() => { setIsLoginTab(false); setError(''); }} className={`flex-1 py-4 cursor-pointer transition-colors ${!isLoginTab ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{t('tabSignup')}</div>
                </div>
                <div className="p-6">
                  {error && <div className="bg-red-50 text-red-600 p-2 mb-4 text-[10px] font-bold border border-red-200 text-center">{error}</div>}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLoginTab && (
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{t('fullName')}</Label>
                        <Input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-none h-9 text-xs border-slate-300 focus-visible:ring-emerald-700" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{t('phone')}</Label>
                      <Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-none h-9 text-xs border-slate-300 focus-visible:ring-emerald-700" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{t('password')}</Label>
                      <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-none h-9 text-xs border-slate-300 focus-visible:ring-emerald-700" />
                    </div>
                    {!isLoginTab && (
                      <div className="space-y-2 pt-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{t('accountType')}</Label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                            <input type="radio" name="role" value="User" checked={role === 'User'} onChange={() => setRole('User')} className="accent-emerald-700" />{t('roleUser')}
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                            <input type="radio" name="role" value="Agency" checked={role === 'Agency'} onChange={() => setRole('Agency')} className="accent-emerald-700" />{t('roleAgency')}
                          </label>
                        </div>
                      </div>
                    )}
                    <Button type="submit" disabled={isLoading} className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs h-10 mt-2 uppercase tracking-wider">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isLoginTab ? t('submitLogin') : t('submitSignup'))}
                    </Button>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </nav>

      {/* ======================= موبایل Bottom Navigation ======================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-emerald-950 border-t border-emerald-800 shadow-lg z-50 flex overflow-x-auto">
        {filteredMenuItems.slice(0, 4).map(item => (
          <Link key={item.href} href={item.href} className="flex-1 min-w-[70px]">
            <div className={cn("flex flex-col items-center justify-center h-full text-emerald-300 transition-colors", pathname === item.href ? "text-white bg-emerald-800" : "hover:bg-emerald-800/50")}>
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
      <div className="md:hidden h-16"></div> 
    </>
  );
}