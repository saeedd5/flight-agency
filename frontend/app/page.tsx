'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchAgencyFlights } from '@/lib/api';
import { FlightSearchFormbooking } from './components/FlightSearchFormbooking';
import { FlightCardbooking } from './components/FlightCardbooking';
import { PlaneLanding, Globe2, Zap, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export default function HomePage() {
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // دریافت پارامترها از URL
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');

  useEffect(() => {
    const fetchData = async (o: string, d: string, dt: string) => {
      setIsSearching(true);
      const res = await searchAgencyFlights({ origin: o, destination: d, date: dt });
      setSearchResults(res);
      setIsSearching(false);
      setInitialLoad(false);
    };

    if (origin && destination && date) {
      // اگر کاربر سرچ کرده بود
      fetchData(origin, destination, date);
    } else {
      // 🔥 لود خودکار بلیت‌های امروز (در صورت عدم جستجو) 🔥
      // چون نمی‌دانیم کاربر دنبال چه مسیری است، مسیر پیش‌فرض ORD به ATL را برای امروز می‌گردیم
      // (شما می‌توانید این مسیر را تغییر دهید یا اندپوینتی در بک‌اند بسازید که *همه* بلیت‌های امروز را بدون فیلتر مبدا/مقصد بیاورد)
      const today = format(new Date(), 'yyyy-MM-dd');
      fetchData('ORD', 'ATL', today);
    }
  }, [searchParams]);

  const hasSearched = !!(origin && destination && date);

  return (
    <main className="min-h-screen bg-slate-50 pb-12 font-sans text-sm">
      
      {/* Hero Section */}
      <div className="bg-emerald-950 pt-16 pb-24 px-4 text-center relative overflow-hidden">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Premium Flight Deals</h1>
        <p className="text-emerald-100 text-sm max-w-xl mx-auto font-medium mb-8">
          Browse exclusive discounted tickets hand-picked by our verified partner agencies.
        </p>
      </div>

      {/* فرم جستجوی مسافر */}
      <div className="container mx-auto px-4 relative z-20">
        <FlightSearchFormbooking />
      </div>

      {/* نمایش وضعیت لودینگ */}
      {isSearching && (
         <div className="py-20 flex flex-col items-center justify-center">
           <Loader2 className="w-10 h-10 animate-spin text-emerald-800 mb-4" />
           <p className="font-bold text-emerald-900">Finding the best agency tickets...</p>
         </div>
      )}

      {/* نمایش نتایج (چه سرچ شده باشد چه لود اولیه امروز) */}
      {!isSearching && searchResults && (
        <div className="container mx-auto px-4 mt-8 max-w-4xl">
          
          <div className="mb-4 bg-white p-3 border border-slate-200 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              {!hasSearched ? <Sparkles className="w-5 h-5 text-amber-500" /> : null}
              <h2 className="text-sm font-black text-emerald-900 uppercase tracking-tighter">
                {hasSearched ? 'Search Results' : 'Today\'s Featured Deals (ORD ➔ ATL)'}
              </h2>
            </div>
            <div className="bg-emerald-50 px-3 py-1 text-emerald-800 font-black text-xs">
              {searchResults.flights?.length || 0} Tickets
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {searchResults.flights?.length > 0 ? (
              searchResults.flights.map((flight: any) => (
                <FlightCardbooking key={flight.key} flight={flight} />
              ))
            ) : (
              <div className="text-center py-16 bg-white border border-slate-200 shadow-sm">
                <PlaneLanding className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-black text-slate-800 text-base uppercase tracking-tighter">No Agency Tickets Found</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">
                  {hasSearched 
                    ? `No agencies have saved flights for ${origin} to ${destination} on this date.` 
                    : "No featured tickets available for today yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* امکانات سایت (همیشه در پایین صفحه نمایش داده می‌شود) */}
      <div className="container mx-auto px-4 mt-16 text-center max-w-4xl border-t border-slate-200 pt-12">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 border border-slate-200"><Globe2 className="h-6 w-6 text-emerald-700 mb-3 mx-auto" /><h3 className="font-bold text-sm">Verified Agencies</h3></div>
            <div className="bg-white p-5 border border-slate-200"><Zap className="h-6 w-6 text-emerald-700 mb-3 mx-auto" /><h3 className="font-bold text-sm">Instant Booking</h3></div>
            <div className="bg-white p-5 border border-slate-200"><ShieldCheck className="h-6 w-6 text-emerald-700 mb-3 mx-auto" /><h3 className="font-bold text-sm">Secure Payments</h3></div>
         </div>
      </div>
    </main>
  );
}