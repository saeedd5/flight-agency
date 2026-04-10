'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { searchFlightsFromSabre } from '@/lib/api';
import { FlightSearchForm } from '@/app/components/FlightSearchForm';
import { FlightCard } from '@/app/components/FlightCard';
import { PlaneLanding, ShieldCheck, Loader2 } from 'lucide-react';

export default function AgencySearchPage() {
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
      <div className="bg-slate-900 pt-16 pb-24 px-4 text-center relative">
        <div className="absolute top-4 right-4 bg-emerald-900 text-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Authorized Personnel Only
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Sabre Flight Engine</h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto font-bold mb-8">Search raw flights from Sabre, apply your markup, and save them for your customers.</p>
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <FlightSearchForm />
      </div>

      {isSearching && (
         <div className="py-20 flex flex-col items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-800 mb-4" /><p className="font-bold text-emerald-900">Fetching Sabre Data...</p></div>
      )}

      {hasSearched && !isSearching && searchResults && (
        <div className="container mx-auto px-4 mt-8 max-w-4xl">
          <div className="mb-4 bg-white p-3 border border-slate-200 flex justify-between items-center shadow-sm">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Raw Sabre Results</h2>
            <div className="bg-slate-100 px-3 py-1 text-slate-600 font-black text-xs">{searchResults.flights?.length || 0} Flights</div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {searchResults.flights?.length > 0 ? (
              searchResults.flights.map((flight: any) => (
                <FlightCard key={flight.key} flight={flight} />
              ))
            ) : (
              <div className="text-center py-12 bg-white border border-slate-200 shadow-sm">
                <PlaneLanding className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <h3 className="font-black text-slate-800">No Raw Flights Found</h3>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}