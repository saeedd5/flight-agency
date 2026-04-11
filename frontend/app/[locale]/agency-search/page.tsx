'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { searchFlightsFromSabre } from '@/lib/api';
import { FlightSearchForm } from '../components/FlightSearchForm';
import { FlightCard } from '../components/FlightCard';
import { PlaneLanding, ShieldCheck, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing'; // روتر مخصوص چندزبانه
import { useTranslations } from 'next-intl';

export default function AgencySearchPage() {
  const t = useTranslations('AgencySearch');
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // محافظت از صفحه (فقط آژانس و ادمین)
  useEffect(() => {
    if (user === null && typeof window !== 'undefined' && localStorage.getItem('token')) return;
    
    const rolesRaw = JSON.stringify(user?.roles || []).toLowerCase();
    const isAuthorized = rolesRaw.includes('agency') || rolesRaw.includes('admin');

    if (!isAuthorized) {
      router.replace('/');
    } else {
      setIsCheckingAuth(false);
    }
  }, [user, router]);

  // انجام جستجو اگر پارامتر در URL بود
  useEffect(() => {
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');

    if (origin && destination && date && !isCheckingAuth) {
      const fetchData = async () => {
        setIsSearching(true);
        const res = await searchFlightsFromSabre({ origin, destination, departureDate: date });
        setSearchResults(res);
        setIsSearching(false);
      };
      fetchData();
    }
  }, [searchParams, isCheckingAuth]);

  if (isCheckingAuth) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-800" /></div>;
  }

  const hasSearched = searchParams.has('origin');

  return (
    <main className="min-h-screen bg-slate-50 pb-12 font-sans text-sm">
      {/* ================= هدر صفحه ================= */}
      <div className="bg-slate-900 pt-16 pb-24 px-4 text-center relative overflow-hidden">
        <div className="absolute top-4 right-4 bg-emerald-900 text-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-700 shadow-sm">
          <ShieldCheck className="w-3 h-3" /> {t('authorizedOnly')}
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight uppercase">
          {t('title')}
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto font-bold mb-8 uppercase tracking-wider">
          {t('subtitle')}
        </p>
      </div>

      {/* ================= فرم جستجو ================= */}
      {/* فرم دقیقاً هم‌تراز با ستون وسط (max-w-4xl) */}
      <div className="container mx-auto px-4 relative z-20">
        <FlightSearchForm />
      </div>

      {/* ================= بدنه اصلی (۳ ستونه: سایدبار - نتایج - سایدبار) ================= */}
      <div className="container mx-auto px-4 mt-8 flex justify-center items-start gap-4">
        
        {/* ۱. سایدبار چپ (فقط در دسکتاپ) - چسبنده با عرض w-36 */}
        <aside className="hidden lg:flex w-52 sticky top-6 self-start flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-none h-[60rem] w-full flex items-center justify-center shadow-sm border-l-4 border-l-emerald-800">
            <span className="text-slate-200 font-black text-2xl uppercase tracking-[0.6em] [writing-mode:vertical-lr] rotate-180">
              Ads
            </span>
          </div>
        </aside>

        {/* ۲. ستون وسط (نتایج جستجو) - عرض ثابت و قفل شده روی max-w-4xl */}
        <section className="w-full max-w-4xl flex-shrink-0">
          
          {/* لودینگ */}
          {isSearching && (
             <div className="py-20 flex flex-col items-center justify-center bg-white border border-slate-200 shadow-sm rounded-none">
               <Loader2 className="w-10 h-10 animate-spin text-emerald-800 mb-4" />
               <p className="font-black text-emerald-900 uppercase tracking-widest text-[10px]">
                 {t('fetching')}
               </p>
             </div>
          )}

          {/* نتایج خام Sabre */}
          {hasSearched && !isSearching && searchResults && (
            <div className="space-y-3">
              {/* هدر نتایج */}
              <div className="bg-white p-3 border border-slate-200 flex justify-between items-center shadow-sm rounded-none">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <h2 className="text-[11px] font-black text-emerald-900 uppercase tracking-tighter">
                    {t('resultsTitle')}
                  </h2>
                </div>
                <div className="bg-slate-100 px-2 py-1 text-slate-600 font-black text-[10px] border border-slate-200 uppercase tracking-wider">
                  {t('flightsCount', { count: searchResults.flights?.length || 0 })}
                </div>
              </div>

              {/* کارت‌ها */}
              <div className="grid grid-cols-1 gap-3">
                {searchResults.flights?.length > 0 ? (
                  searchResults.flights.map((flight: any) => (
                    <FlightCard key={flight.key} flight={flight} />
                  ))
                ) : (
                  <div className="text-center py-20 bg-white border border-slate-200 shadow-sm rounded-none">
                    <PlaneLanding className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-1">
                      {t('noFlights')}
                    </h3>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ۳. سایدبار راست (فقط در دسکتاپ) - چسبنده با عرض w-36 */}
        <aside className="hidden lg:flex w-52 sticky top-6 self-start flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-none h-[60rem] w-full flex items-center justify-center shadow-sm border-r-4 border-r-emerald-800">
            <span className="text-slate-200 font-black text-2xl uppercase tracking-[0.6em] [writing-mode:vertical-lr]">
              Ads
            </span>
          </div>
        </aside>

      </div>
    </main>
  );
}