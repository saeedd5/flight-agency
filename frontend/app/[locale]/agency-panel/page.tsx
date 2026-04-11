'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/app/context/AuthContext';
import { updateProfile, getMyAgencyFlights, getAgencySoldTickets, baseURL } from '@/lib/api';
import { useTranslations } from 'next-intl';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, UserCog, PlaneTakeoff, Clock, LayoutDashboard, TicketCheck, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

// تابع کمکی برای ساخت آدرس صحیح عکس
const getImageUrl = (url: string | null | undefined) => {
  if (!url || url === '/default-avatar.png') return '/default-avatar.png';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (url.startsWith('/upload/')) return url;
  return `${baseURL}${url}`; 
};

export default function AgencyPanelPage() {
  const t = useTranslations('AgencyPanel');
  const { user, loginState } = useAuth();
  const router = useRouter();

  // --- استیت‌های کنترل دسترسی ---
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // --- استیت‌های مربوط به پروفایل ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // --- استیت‌های مربوط به لیست پروازها (داشبورد/آرشیو) ---
  const [myFlights, setMyFlights] = useState<any[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(true);

  // --- استیت‌های مربوط به بلیت‌های فروخته شده (فروش‌ها) ---
  const [soldTickets, setSoldTickets] = useState<any[]>([]);
  const [loadingSoldTickets, setLoadingSoldTickets] = useState(true);

  // ۱. کنترل دسترسی اصلی
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      if (user === null) {
        if (typeof window !== 'undefined' && localStorage.getItem('token')) return; 
        router.replace('/'); 
        return;
      }

      const isAgency = user?.roles?.some(r => r.toLowerCase() === 'agency');

      if (!isAgency) {
        router.replace('/');
        return;
      }

      setName(user.name || '');
      setEmail(user.email || '');
      setImagePreview(user.profileImageUrl || '/default-avatar.png');
      
      await Promise.all([fetchMyFlights(), fetchSoldTickets()]);
      setIsCheckingAuth(false);
    };

    checkAuthAndLoadData();
  }, [user, router]); 

  // ۲. توابع دریافت اطلاعات از سرور
  const fetchMyFlights = async () => {
    setLoadingFlights(true);
    const res = await getMyAgencyFlights();
    if (res.success) setMyFlights(res.flights);
    setLoadingFlights(false);
  };

  const fetchSoldTickets = async () => {
    setLoadingSoldTickets(true);
    const res = await getAgencySoldTickets();
    if (res.success) setSoldTickets(res.bookings);
    setLoadingSoldTickets(false);
  };

  // ۳. هندلرهای فرم پروفایل
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitProfile = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const res = await updateProfile({ name, email, profileImageFile: imageFile || undefined });

    if (res.success && res.user) {
      const token = localStorage.getItem('token');
      const finalImageUrl = res.user.profileImageUrl || (res.user as any).ProfileImageUrl || imagePreview || '/default-avatar.png';

      const normalizedUser = {
          ...res.user,
          profileImageUrl: finalImageUrl
      };
      
      if (token) {
          loginState(normalizedUser as any, token); 
      }
      
      setImagePreview(finalImageUrl);
      setImageFile(null); 
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'error', text: res.errorMessage || 'An error occurred while updating.' });
    }
    
    setIsSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  // --- نمایش لودینگ اولیه ---
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {t('authenticating')}
          </span>
        </div>
      </div>
    );
  }

  // --- رندر اصلی پنل ---
  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* هدر پنل */}
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-emerald-900 p-2 text-white shadow-sm">
             <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-emerald-950 uppercase tracking-tighter">{t('title')}</h1>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{t('subtitle')}</p>
          </div>
        </div>

        {/* تب‌ها */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-200 rounded-none h-12 p-0 shadow-sm">
            <TabsTrigger value="dashboard" className="rounded-none text-xs font-black uppercase tracking-widest data-[state=active]:bg-emerald-800 data-[state=active]:text-white h-full transition-all">
              {t('tabArchive')}
            </TabsTrigger>
            <TabsTrigger value="sales" className="rounded-none text-xs font-black uppercase tracking-widest data-[state=active]:bg-emerald-800 data-[state=active]:text-white h-full transition-all">
              {t('tabSales')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-none text-xs font-black uppercase tracking-widest data-[state=active]:bg-emerald-800 data-[state=active]:text-white h-full transition-all">
              {t('tabSettings')}
            </TabsTrigger>
          </TabsList>
          
          {/* ================= تب ۱: آرشیو پروازهای ذخیره شده ================= */}
          <TabsContent value="dashboard" className="mt-6">
            <Card className="rounded-none border-slate-300 shadow-md">
              <CardHeader className="bg-slate-50 border-b border-slate-200 py-4">
                <CardTitle className="text-sm font-black uppercase text-emerald-900 tracking-tight">{t('archiveTitle')}</CardTitle>
                <CardDescription className="text-[10px] font-bold text-slate-500 uppercase">{t('archiveDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loadingFlights ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-800" /></div>
                ) : myFlights.length === 0 ? (
                  <div className="py-20 text-center">
                     <PlaneTakeoff className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                     <p className="text-xs font-bold text-slate-400 uppercase">{t('noArchivedFlights')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase tracking-tighter font-black">
                        <tr>
                          <th className="px-4 py-3 border-r border-slate-200">{t('colRoute')}</th>
                          <th className="px-4 py-3 border-r border-slate-200">{t('colFlightNo')}</th>
                          <th className="px-4 py-3 border-r border-slate-200">{t('colBasePrice')}</th>
                          <th className="px-4 py-3 border-r border-slate-200 text-emerald-700">{t('colMarkup')}</th>
                          <th className="px-4 py-3 border-r border-slate-200 text-emerald-900">{t('colFinalPrice')}</th>
                          <th className="px-4 py-3 text-right">{t('colDateSaved')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myFlights.map((f, i) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-emerald-50/50 transition-colors">
                            <td className="px-4 py-3 font-black text-slate-800 border-r border-slate-50 uppercase">
                              <div className="flex items-center gap-2">{f.origin} <PlaneTakeoff className="w-3 h-3 text-emerald-600" /> {f.destination}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-500 font-bold border-r border-slate-50 uppercase">{f.airline}{f.flightNumber}</td>
                            <td className="px-4 py-3 font-bold text-slate-400 border-r border-slate-50">${f.basePrice.toFixed(2)}</td>
                            <td className="px-4 py-3 font-black text-emerald-600 border-r border-slate-50">{f.markupPercentage}%</td>
                            <td className="px-4 py-3 font-black text-emerald-900 border-r border-slate-50 bg-emerald-50/30">${f.finalPrice.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right text-[10px] text-slate-400 font-medium">
                               <div className="flex items-center justify-end gap-1 uppercase tracking-tighter"><Clock className="w-3 h-3" /> {format(new Date(f.createdAt), 'MMM dd, HH:mm')}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= تب ۲: بلیت‌های فروخته شده ================= */}
          <TabsContent value="sales" className="mt-6">
            <Card className="rounded-none border-slate-300 shadow-md">
              <CardHeader className="bg-emerald-950 text-white border-b border-emerald-900 py-4">
                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                  <TicketCheck className="w-4 h-4 text-emerald-400" /> {t('salesTitle')}
                </CardTitle>
                <CardDescription className="text-[10px] font-bold text-emerald-100/70 uppercase">{t('salesDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loadingSoldTickets ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-800" /></div>
                ) : soldTickets.length === 0 ? (
                  <div className="py-20 text-center">
                     <UserIcon className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                     <p className="text-xs font-bold text-slate-400 uppercase">{t('noSales')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase tracking-tighter font-black">
                        <tr>
                          <th className="px-4 py-3 border-r border-slate-200">{t('colBookingID')}</th>
                          <th className="px-4 py-3 border-r border-slate-200">{t('colPassenger')}</th>
                          <th className="px-4 py-3 border-r border-slate-200">{t('colRouteFlight')}</th>
                          <th className="px-4 py-3 border-r border-slate-200 text-emerald-900">{t('colPaid')}</th>
                          <th className="px-4 py-3 text-right">{t('colDateBooked')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {soldTickets.map((ticket, i) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-emerald-50/50 transition-colors">
                            <td className="px-4 py-3 font-black text-slate-500 border-r border-slate-50">#{ticket.id}</td>
                            <td className="px-4 py-3 border-r border-slate-50">
                              <div className="font-black text-slate-800 uppercase">{ticket.passengerName}</div>
                              <div className="text-[10px] text-slate-500 font-bold">{ticket.passengerEmail}</div>
                            </td>
                            <td className="px-4 py-3 border-r border-slate-50">
                              <div className="font-black text-slate-700 uppercase">{ticket.flightRoute}</div>
                              <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                                {ticket.flightNumber} • {format(new Date(ticket.departureTime), 'MMM dd, HH:mm')}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-black text-emerald-900 border-r border-slate-50 text-base">
                              ${ticket.totalPrice.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-[10px] text-slate-400 font-medium">
                               <div className="flex items-center justify-end gap-1 uppercase tracking-tighter">
                                 <Clock className="w-3 h-3" /> {format(new Date(ticket.bookingDate), 'MMM dd, HH:mm')}
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= تب ۳: تنظیمات پروفایل ================= */}
          <TabsContent value="settings" className="mt-6">
            <form onSubmit={handleSubmitProfile}>
              <Card className="rounded-none border-slate-300 shadow-md">
                <CardHeader className="bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <UserCog className="w-5 h-5 text-emerald-800" />
                    <CardTitle className="text-sm font-black uppercase text-emerald-900 tracking-tight">{t('settingsTitle')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* بخش آپلود عکس */}
                  <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="relative w-20 h-20 bg-slate-200 border border-slate-300">
                       <Image src={getImageUrl(imagePreview)} alt="Agency Logo" fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="picture" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('logoLabel')}</Label>
                      <div className="mt-1 flex gap-2">
                        <Input id="picture" type="file" onChange={handleImageChange} accept="image/*" className="rounded-none h-9 text-xs file:hidden border-slate-300 focus-visible:ring-emerald-700" />
                      </div>
                    </div>
                  </div>

                  {/* فرم اطلاعات */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('nameLabel')}</Label>
                      <Input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-none h-10 text-sm font-bold border-slate-300 focus-visible:ring-emerald-700" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('emailLabel')}</Label>
                      <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-none h-10 text-sm font-bold border-slate-300 focus-visible:ring-emerald-700" />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="bg-slate-50 border-t border-slate-200 py-4 flex justify-between items-center px-6">
                  <div>
                    {message && (
                      <p className={`text-[10px] font-black uppercase px-3 py-1 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {message.text}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={isSaving} className="rounded-none bg-emerald-800 hover:bg-emerald-900 text-white font-black h-10 px-8 text-xs uppercase tracking-widest shadow-md">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2"/> {t('saveProfileBtn')}</>}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
          
        </Tabs>
      </div>
    </main>
  );
}