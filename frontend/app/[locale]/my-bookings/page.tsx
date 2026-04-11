'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/app/context/AuthContext';
import { getMyBookings } from '@/lib/api';
import { Ticket, Loader2, Plane, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

export default function MyBookingsPage() {
  const t = useTranslations('MyBookings');
  const { user } = useAuth();
  const router = useRouter();
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user === null) return;
    const isRegularUser = user.roles?.some(r => r.toLowerCase() === 'user');
    if (!user || !isRegularUser) { 
      router.replace('/');
    } else {
      fetchBookings();
    }
  }, [user, router]);

  const fetchBookings = async () => {
    setIsLoading(true);
    const res = await getMyBookings();
    if (res.success) setBookings(res.bookings);
    setIsLoading(false);
  };

  if (!user || user.roles?.some(r => r.toLowerCase() === 'agency')) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-700" /></div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 border-b border-slate-200 pb-4 flex items-center gap-3">
          <div className="bg-emerald-900 p-3 text-white"><Ticket className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-black text-emerald-900 uppercase tracking-tighter">{t('title')}</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{t('subtitle')}</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-700" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center p-12">
            <Ticket className="w-12 h-12 text-slate-200 mb-4 mx-auto" />
            <h2 className="text-base font-black text-slate-800 uppercase tracking-tighter">{t('noTickets')}</h2>
            <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase">{t('noTicketsDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row">
                <div className="bg-emerald-900 text-emerald-50 p-4 flex flex-col items-center justify-center">
                  <Plane className="w-6 h-6 mb-2 opacity-50" />
                  <span className="text-[10px] font-black uppercase text-emerald-400">{t('boarding')}</span>
                  <span className="text-xl font-black">${booking.totalPrice.toFixed(2)}</span>
                </div>
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
                     <div>
                       <span className="text-[9px] font-black text-slate-400 uppercase">{t('passenger')}</span>
                       <div className="font-black text-slate-800 uppercase">{booking.passengerName}</div>
                     </div>
                     <div className="text-right">
                       <span className="text-[9px] font-black text-slate-400 uppercase">{t('status')}</span>
                       <div className="font-black text-emerald-600 uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> {t('confirmed')}</div>
                     </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase">{t('refKey')}</span>
                    <div className="text-[10px] font-bold text-slate-600 bg-slate-100 p-1 mt-1">
                      {booking.flightKey}
                    </div>
                    <div className="text-right text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                       <Clock className="w-3 h-3" /> {t('bookedOn', { date: format(new Date(booking.bookingDate), 'dd MMM yyyy') })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}