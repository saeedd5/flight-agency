'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { searchAgencyFlights } from '@/lib/api';
import { FlightSearchFormbooking } from './components/FlightSearchFormbooking';
import { FlightCardbooking } from './components/FlightCardbooking';
import { PlaneLanding, Globe2, Zap, ShieldCheck, Loader2, Sparkles, Building2 } from 'lucide-react';
import { format } from 'date-fns';

export default function HomePage() {
  const t = useTranslations('HomePage');

  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

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
      fetchData(origin, destination, date);
    } else {
      const today = format(new Date(), 'yyyy-MM-dd');
      fetchData('ORD', 'ATL', today);
    }
  }, [searchParams]);

  const hasSearched = !!(origin && destination && date);

  return (
    <main className="min-h-screen bg-slate-50 pb-12 font-sans text-sm">
      
      {/* ================= Hero Section ================= */}
      <div className="bg-emerald-950 pt-16 pb-24 px-4 text-center relative overflow-hidden">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
          {t('Hero.title')}
        </h1>
        <p className="text-emerald-100 text-sm max-w-xl mx-auto font-medium mb-8">
          {t('Hero.subtitle')}
        </p>
      </div>

      {/* ================= فرم جستجو ================= */}
      {/* عرض این فرم max-w-4xl (معادل 896px) است */}
      <div className="container mx-auto px-4 relative z-20">
        <FlightSearchFormbooking />
      </div>

      {/* ================= بدنه اصلی (۳ ستونه: سایدبار - نتایج - سایدبار) ================= */}
      <div className="container mx-auto px-4 mt-8 flex justify-center items-start gap-4">
        
        {/* ۱. سایدبار چپ (فقط در دسکتاپ) - باریک، بلند، چسبنده */}
        <aside className="hidden lg:flex w-52 sticky top-6 self-start flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-none h-[60rem] w-full flex items-center justify-center shadow-sm border-l-4 border-l-emerald-800">
            <span className="text-slate-200 font-black text-2xl uppercase tracking-[0.6em] [writing-mode:vertical-lr] rotate-180">
              Ads
            </span>
          </div>
        </aside>

        {/* ۲. ستون وسط (نتایج) - عرض دقیقاً برابر با فرم جستجو (max-w-4xl) */}
        <section className="w-full max-w-4xl flex-shrink-0">
          
          {/* لودینگ */}
          {isSearching && (
             <div className="py-20 flex flex-col items-center justify-center bg-white border border-slate-200 shadow-sm">
               <Loader2 className="w-10 h-10 animate-spin text-emerald-800 mb-4" />
               <p className="font-black text-emerald-900 uppercase tracking-widest text-[10px]">
                 {t('Loading.findingTickets')}
               </p>
             </div>
          )}

          {/* لیست بلیت‌ها */}
          {!isSearching && searchResults && (
            <div className="space-y-3">
              {/* هدر نتایج */}
              <div className="bg-white p-3 border border-slate-200 flex justify-between items-center shadow-sm rounded-none">
                <div className="flex items-center gap-2">
                  {!hasSearched ? <Sparkles className="w-4 h-4 text-amber-500" /> : <Building2 className="w-4 h-4 text-emerald-600"/>}
                  <h2 className="text-[11px] font-black text-emerald-900 uppercase tracking-tighter">
                    {hasSearched ? t('Results.searchTitle') : t('Results.featuredTitle')}
                  </h2>
                </div>
                <div className="bg-emerald-50 px-2 py-1 text-emerald-800 font-black text-[10px] border border-emerald-100 uppercase tracking-wider">
                  {searchResults.flights?.length || 0} {t('Results.ticketsCount')}
                </div>
              </div>

              {/* کارت‌ها */}
              <div className="grid grid-cols-1 gap-3">
                {searchResults.flights?.length > 0 ? (
                  searchResults.flights.map((flight: any) => (
                    <FlightCardbooking key={flight.key} flight={flight} />
                  ))
                ) : (
                  <div className="text-center py-20 bg-white border border-slate-200 shadow-sm rounded-none">
                    <PlaneLanding className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-1">
                      {t('Empty.noTicketsFound')}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {hasSearched 
                        ? t('Empty.searchedDesc', { origin: origin || '', destination: destination || '' }) 
                        : t('Empty.featuredDesc')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ۳. سایدبار راست (فقط در دسکتاپ) - باریک، بلند، چسبنده */}
        <aside className="hidden lg:flex w-52 sticky top-6 self-start flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-none h-[60rem] w-full flex items-center justify-center shadow-sm border-r-4 border-r-emerald-800">
            <span className="text-slate-200 font-black text-2xl uppercase tracking-[0.6em] [writing-mode:vertical-lr]">
              Ads
            </span>
          </div>
        </aside>

      </div>

      {/* ================= امکانات سایت ================= */}
      <div className="container mx-auto px-4 mt-16 text-center max-w-4xl border-t border-slate-200 pt-12">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 border border-slate-200 rounded-none shadow-sm">
              <Globe2 className="h-6 w-6 text-emerald-700 mb-3 mx-auto" />
              <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-800">{t('Features.verified')}</h3>
            </div>
            <div className="bg-white p-5 border border-slate-200 rounded-none shadow-sm">
              <Zap className="h-6 w-6 text-emerald-700 mb-3 mx-auto" />
              <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-800">{t('Features.instant')}</h3>
            </div>
            <div className="bg-white p-5 border border-slate-200 rounded-none shadow-sm">
              <ShieldCheck className="h-6 w-6 text-emerald-700 mb-3 mx-auto" />
              <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-800">{t('Features.secure')}</h3>
            </div>
         </div>
      </div>

    </main>
  );
}