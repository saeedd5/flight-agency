'use client';

import { useState, Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import { createUserBooking } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Users, CheckCircle2, Ticket, Loader2, User as UserIcon, Mail, ShieldCheck, ChevronDown, ChevronUp, PlaneTakeoff, ShieldAlert, Clock } from 'lucide-react';
import { useRouter } from '@/i18n/routing'; // روتر مخصوص next-intl
import { FlightSegment } from '@/lib/types';
import { useTranslations } from 'next-intl'; // 🔥 ایمپورت هوک ترجمه
import Image from 'next/image';
// توابع کمکی امن
function safeFormatTime(dateString: any, formatStr: string = 'HH:mm'): string {
  if (!dateString) return '--:--';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '--:--'; 
    return format(d, formatStr);
  } catch (e) {
    return '--:--';
  }
}



// تابع کمکی و امن برای ساخت آدرس عکس آژانس
// تابع کمکی و امن برای ساخت آدرس عکس (سازگار با Next.js و ASP.NET Core)
function safeImageUrl(url: string | null | undefined): string {
  // ۱. بررسی مقادیر خالی یا کلمات اشتباهی که ممکن است از سمت دیتابیس بیاید
  if (!url || url === 'null' || url === 'undefined' || url.trim() === '') {
    return '/default-avatar.png'; // این فایل در پوشه frontend/public قرار دارد
  }
  
  // ۲. اگر عکس همین الان آدرس کامل دارد (مثلاً از یک سرور دیگر یا گوگل)
  if (url.startsWith('http')) {
    return url;
  }
  
  // ۳. اگر آدرس برای پیش‌نمایش زنده در مرورگر است (blob: یا base64)
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }

  // ۴. اگر آدرس با / شروع شده و مربوط به پوشه uploads بک‌اِند است
  // مثال: /uploads/profile_8.png -> http://187.77.219.229:5000/uploads/profile_8.png
  if (url.startsWith('/uploads')) {
    return `http://187.77.219.229:5000${url}`;
  }
  
  // ۵. اگر آدرس مربوط به خودِ فایل‌های فرانت‌اِند است (مثل عکس پیش‌فرض)
  if (url.startsWith('/')) {
    return url;
  }

  // در نهایت اگر هیچ‌کدام نبود، عکس پیش‌فرض را برگردان
  return '/default-avatar.png';
}





function formatDuration(minutes: number) {
  if (!minutes) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim();
}

// کامپوننت نمایش سگمنت‌ها (مسیر پرواز)
function FlightSegmentsDetail({ segments, t }: { segments: FlightSegment[], t: any }) {
  if (!segments || segments.length === 0) return <div className="text-slate-400">{t('noSegmentData')}</div>;
  
  return (
    <div>
      <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2 text-[11px] uppercase tracking-tighter">
        <PlaneTakeoff className="w-4 h-4 text-emerald-700" /> {t('flightPath')}
      </h4>
      <div className="space-y-2">
        {segments.map((segment, index) => {
          let layoverMinutes = 0;
          if (index < segments.length - 1) {
            const nextSegment = segments[index + 1];
            const arrival = new Date(segment.arrivalTime);
            const nextDeparture = new Date(nextSegment.departureTime);
            layoverMinutes = Math.round((nextDeparture.getTime() - arrival.getTime()) / 60000);
          }

          return (
            <Fragment key={index}>
              <div className="flex gap-3 text-xs">
                <div className="flex flex-col items-center">
                  <span className="font-black text-slate-800">{safeFormatTime(segment.departureTime)}</span>
                  <div className="w-px h-10 bg-slate-300 my-1"></div>
                  <span className="font-black text-slate-800">{safeFormatTime(segment.arrivalTime)}</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-600">{segment.origin}</div>
                  <div className="text-[10px] text-slate-400 py-1 my-1 pl-2 border-l-2 border-slate-200 uppercase">
                    {segment.carrier}{segment.flightNumber} • {formatDuration(segment.elapsedTime || 0)} • {segment.equipment}
                  </div>
                  <div className="font-bold text-slate-600">{segment.destination}</div>
                </div>
              </div>
              {layoverMinutes > 0 && (
                <div className="flex items-center gap-2 text-amber-700 my-3 pl-4">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase">
                    {t('layover', { time: formatDuration(layoverMinutes), city: segment.destination })}
                  </span>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function FlightCardbooking({ flight }: { flight: any }) {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('FlightCard'); // 🔥 فراخوانی متون ترجمه

  const [isExpanded, setIsExpanded] = useState(false);
  
  const stops = flight.stops || 0;
  const isDirect = stops === 0;
  const departureTime = flight.departureTime || flight.segments?.[0]?.departureTime;
  const arrivalTime = flight.arrivalTime || flight.segments?.[flight.segments?.length - 1]?.arrivalTime;

  const [showModal, setShowModal] = useState(false);
  const [passengerName, setPassengerName] = useState(user?.name || '');
  const [passengerEmail, setPassengerEmail] = useState(user?.email || '');
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!user) {
      alert(t('checkout.loginRequired'));
      return;
    }
    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!passengerName || !passengerEmail) {
      setError(t('checkout.fillDetails')); return;
    }
    setIsBooking(true);
    setError('');

    const finalPriceToBook = flight.price || flight.finalPrice || 0;
    const res = await createUserBooking({
      flightKey: flight.key,
      passengerName: passengerName,
      passengerEmail: passengerEmail,
      totalPrice: finalPriceToBook 
    });

    if (res.success) {
      alert(t('checkout.success'));
      setShowModal(false);
      router.push('/my-bookings');
    } else {
      setError(res.errorMessage || t('checkout.failed'));
    }
    setIsBooking(false);
  };

  return (
    <>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full rounded-none border transition-all duration-200 bg-white overflow-hidden shadow-sm cursor-pointer ${isExpanded ? 'border-emerald-700 ring-1 ring-emerald-700' : 'border-slate-300 hover:border-emerald-500'}`}
      >
        <div className="bg-emerald-50/50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
         {/* تصویر پروفایل آژانس */}
            <div className="w-6 h-6 rounded-none overflow-hidden border border-emerald-200 bg-white flex-shrink-0 relative">
               <Image 
                 src={safeImageUrl(flight.agencyProfileImage)} 
                 alt={flight.agencyName || 'Agency Logo'}
                 fill
                 sizes="24px"
                 className="object-cover"
               />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">{t('verifiedAgency')}</span>
              </div>
              <span className="text-xs font-black text-slate-800 uppercase leading-none mt-0.5">{flight.agencyName || t('premiumAgency')}</span>
            </div>
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('guaranteedPrice')}</span>
        </div>

        <div className="flex flex-col md:flex-row min-h-[80px]">
          <div className="flex-1 p-3 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-900 text-white rounded-none text-[10px] flex items-center justify-center font-bold">{flight.airline || 'FL'}</div>
                <div className="leading-tight">
                   <span className="text-xs font-bold text-slate-800 uppercase">{flight.airline}{flight.flightNumber}</span>
                   <div className="text-[10px] text-slate-500">{flight.cabinClass || 'Economy'}</div>
                </div>
              </div>
              <div className="text-[9px] font-bold text-emerald-700 flex items-center gap-1">
                <Users className="w-3 h-3" /> {t('available')}
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="text-right w-[60px]">
                <div className="text-lg font-black text-slate-900">{safeFormatTime(departureTime)}</div>
                <div className="text-[10px] font-bold text-slate-500">{flight.origin}</div>
              </div>
              <div className="flex-1 flex flex-col items-center px-2">
                <div className="text-[9px] font-bold text-slate-400 mb-0.5">{formatDuration(flight.travelTime || 0)}</div>
                <div className="w-full relative flex items-center justify-center h-2">
                  <div className="absolute w-full h-[1px] bg-slate-300"></div>
                  <div className={`z-10 px-2 py-0 text-[8px] font-bold bg-white border ${isDirect ? 'text-emerald-700 border-emerald-300' : 'text-slate-500 border-slate-300'}`}>
                    {isDirect ? t('direct') : t('stop', { count: stops })}
                  </div>
                </div>
              </div>
              <div className="text-left w-[60px]">
                <div className="text-lg font-black text-slate-900">{safeFormatTime(arrivalTime)}</div>
                <div className="text-[10px] font-bold text-slate-500">{flight.destination}</div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-[150px] bg-slate-50 p-3 border-t md:border-t-0 md:border-l border-slate-200 flex flex-row md:flex-col justify-between items-center md:items-end">
            <div className="text-left md:text-right">
              <div className="text-[9px] font-bold text-slate-400 uppercase">{t('totalPrice')}</div>
              <div className="text-xl font-black text-emerald-900 leading-none mt-1">
                ${(flight.price || flight.finalPrice || 0).toFixed(2)}
              </div>
            </div>
            <Button onClick={handleBookNowClick} className="rounded-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 px-4 text-xs mt-0 md:mt-2 w-full md:w-auto uppercase tracking-wider">
              <Ticket className="w-3 h-3 mr-1" /> {t('bookNow')}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="bg-slate-50/50 border-t border-slate-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs cursor-default" onClick={(e) => e.stopPropagation()}>
            <FlightSegmentsDetail segments={flight.segments} t={t} />
            
            <div>
              <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2 text-[11px] uppercase tracking-tighter">
                 <ShieldAlert className="w-4 h-4 text-emerald-700" /> {t('fareRules')}
              </h4>
              <ul className="space-y-1 text-slate-600 font-medium">
                 <li className="flex justify-between border-b border-slate-200/50 pb-1"><span>{t('class')}</span> <span className="font-bold text-slate-900">{flight.cabinClass || 'Economy'}</span></li>
                 <li className="flex justify-between border-b border-slate-200/50 pb-1"><span>{t('baggage')}</span> <span className="font-bold text-slate-900">{flight.baggageAllowance || t('notSpecified')}</span></li>
                 <li className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span>{t('refundable')}</span> 
                    <span className={flight.isRefundable ? "text-emerald-700 font-black" : "text-amber-700 font-black"}>
                       {flight.isRefundable ? t('yes') : t('no')}
                    </span>
                 </li>
              </ul>
            </div>
          </div>
        )}

        <div className="w-full bg-slate-50/80 flex justify-center items-center py-1 border-t border-slate-100 text-slate-400">
           {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="rounded-none sm:max-w-[400px] border-emerald-800 p-0 shadow-2xl">
          <DialogHeader className="p-4 border-b border-slate-200 bg-emerald-950 text-white">
            <DialogTitle className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> {t('checkout.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="p-5 space-y-4 bg-white">
            {error && <div className="text-[10px] font-black text-red-600 bg-red-50 p-2 uppercase text-center border border-red-200">{error}</div>}
            <div className="bg-slate-50 border border-slate-200 p-3 text-xs">
               <div className="font-black text-slate-800 uppercase border-b border-slate-200 pb-2 mb-2 flex justify-between">
                 <span>{t('checkout.summary')}</span>
                 <span className="text-emerald-700">${(flight.price || flight.finalPrice || 0).toFixed(2)}</span>
               </div>
               <div className="text-slate-600 font-bold">{flight.origin} ➔ {flight.destination}</div>
               <div className="text-[10px] text-slate-400 mt-1 uppercase">{safeFormatTime(departureTime, 'dd MMM yyyy, HH:mm')}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1"><UserIcon className="w-3 h-3"/> {t('checkout.passengerName')}</Label>
              <Input value={passengerName} onChange={e => setPassengerName(e.target.value)} className="rounded-none h-10 text-xs font-bold border-slate-300 focus-visible:ring-emerald-700 uppercase" placeholder="JOHN DOE" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3"/> {t('checkout.passengerEmail')}</Label>
              <Input type="email" value={passengerEmail} onChange={e => setPassengerEmail(e.target.value)} className="rounded-none h-10 text-xs font-bold border-slate-300 focus-visible:ring-emerald-700" placeholder="john@example.com" />
            </div>
          </div>
          <DialogFooter className="p-4 border-t border-slate-200 bg-slate-50">
            <Button onClick={handleConfirmBooking} disabled={isBooking} className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900 text-white h-10 text-xs font-black uppercase tracking-wider">
              {isBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-2" /> {t('checkout.confirmBtn', { price: (flight.price || flight.finalPrice || 0).toFixed(2) })}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}