'use client';

import { useState, useEffect } from 'react'; 
import { useRouter, useSearchParams, usePathname } from 'next/navigation'; // اضافه شدن usePathname
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, PlaneTakeoff, PlaneLanding, Search, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '../../../components/ui/button';
import { Calendar } from '../../../components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../../../components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { AirportSelector } from './AirportSelector';

// دیتا بیس فرودگاه‌ها (میتواند در فایلی مثل lib/constants.ts باشد)
const airports = [
  { city: 'Atlanta', code: 'ATL', state: 'GA', country: '🇺🇸 United States' },
  { city: 'Chicago', code: 'ORD', state: 'IL', country: '🇺🇸 United States' },
  { city: 'Shiraz', code: 'SYZ', state: 'Fars', country: '🇮🇷 Iran' },
  { city: 'Erbil', code: 'EBL', state: 'Kurdistan', country: '🇮🇶 Iraq' },
  { city: 'Dubai', code: 'DXB', state: 'Dubai', country: '🇦🇪 United Arab Emirates' },
  { city: 'Istanbul', code: 'IST', state: 'Istanbul', country: '🇹🇷 Turkey' },
  { city: 'New York', code: 'LGA', state: 'NY', country: '🇺🇸 United States' },
  { city: 'Los Angeles', code: 'LAX', state: 'CA', country: '🇺🇸 United States' },
  { city: 'Abu Dhabi', code: 'AUH', state: 'Abu Dhabi', country: '🇦🇪 United Arab Emirates' },
  { city: 'Doha', code: 'DOH', state: 'Doha', country: '🇶🇦 Qatar' },
  { city: 'Amman', code: 'AMM', state: 'Amman', country: '🇯🇴 Jordan' },
  { city: 'Kuwait City', code: 'KWI', state: 'Kuwait', country: '🇰🇼 Kuwait' },
  { city: 'Muscat', code: 'MCT', state: 'Muscat', country: '🇴🇲 Oman' },
  { city: 'Tehran', code: 'IKA', state: 'Tehran', country: '🇮🇷 Iran' },
  { city: 'Mashhad', code: 'MHD', state: 'Khorasan', country: '🇮🇷 Iran' },

  { city: 'Ankara', code: 'ESB', state: 'Ankara', country: '🇹🇷 Turkey' },

  { city: 'Riyadh', code: 'RUH', state: 'Riyadh', country: '🇸🇦 Saudi Arabia' },
  { city: 'Jeddah', code: 'JED', state: 'Mecca', country: '🇸🇦 Saudi Arabia' },

  { city: 'Manama', code: 'BAH', state: 'Capital', country: '🇧🇭 Bahrain' },
  { city: 'Tel Aviv', code: 'TLV', state: 'Tel Aviv', country: '🇮🇱 Israel' },
  { city: 'Baghdad', code: 'BGW', state: 'Baghdad', country: '🇮🇶 Iraq' },
  { city: 'Basra', code: 'BSR', state: 'Basra', country: '🇮🇶 Iraq' },

  { city: 'Dushanbe', code: 'DYU', state: 'Dushanbe', country: '🇹🇯 Tajikistan' },
  { city: 'Khujand', code: 'LBD', state: 'Sughd', country: '🇹🇯 Tajikistan' },
  { city: 'New York', code: 'JFK', state: 'NY', country: '🇺🇸 United States' },
  
  { city: 'San Francisco', code: 'SFO', state: 'CA', country: '🇺🇸 United States' },
  { city: 'San Diego', code: 'SAN', state: 'CA', country: '🇺🇸 United States' },
  { city: 'Dallas', code: 'DFW', state: 'TX', country: '🇺🇸 United States' },
  { city: 'Houston', code: 'IAH', state: 'TX', country: '🇺🇸 United States' },

  { city: 'Miami', code: 'MIA', state: 'FL', country: '🇺🇸 United States' },
  { city: 'Orlando', code: 'MCO', state: 'FL', country: '🇺🇸 United States' },

  { city: 'Seattle', code: 'SEA', state: 'WA', country: '🇺🇸 United States' },
  { city: 'Boston', code: 'BOS', state: 'MA', country: '🇺🇸 United States' },
  { city: 'Las Vegas', code: 'LAS', state: 'NV', country: '🇺🇸 United States' },
  { city: 'Denver', code: 'DEN', state: 'CO', country: '🇺🇸 United States' },
  { city: 'Phoenix', code: 'PHX', state: 'AZ', country: '🇺🇸 United States' },

  { city: 'London', code: 'LHR', state: 'London', country: '🇬🇧 United Kingdom' },
  { city: 'London', code: 'LGW', state: 'London', country: '🇬🇧 United Kingdom' },

  { city: 'Paris', code: 'CDG', state: 'Paris', country: '🇫🇷 France' },

  { city: 'Frankfurt', code: 'FRA', state: 'Hesse', country: '🇩🇪 Germany' },
  { city: 'Munich', code: 'MUC', state: 'Bavaria', country: '🇩🇪 Germany' },

  { city: 'Amsterdam', code: 'AMS', state: 'North Holland', country: '🇳🇱 Netherlands' },

  { city: 'Madrid', code: 'MAD', state: 'Madrid', country: '🇪🇸 Spain' },
  { city: 'Barcelona', code: 'BCN', state: 'Catalonia', country: '🇪🇸 Spain' },

  { city: 'Rome', code: 'FCO', state: 'Lazio', country: '🇮🇹 Italy' },
  { city: 'Milan', code: 'MXP', state: 'Lombardy', country: '🇮🇹 Italy' },

  { city: 'Istanbul', code: 'SAW', state: 'Istanbul', country: '🇹🇷 Turkey' },

  { city: 'Zurich', code: 'ZRH', state: 'Zurich', country: '🇨🇭 Switzerland' },

  { city: 'Vienna', code: 'VIE', state: 'Vienna', country: '🇦🇹 Austria' },
];





const FormSchema = z.object({
  origin: z.string().min(3, "Select origin"),
  destination: z.string().min(3, "Select destination"),
  departureDate: z.date({ required_error: "Required" }),
});

export function FlightSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
   const pathname = usePathname();
  const [isSearching, setIsSearching] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => { setIsSearching(false); }, [searchParams]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      origin: searchParams.get('origin')?.toUpperCase() || "ORD",
      destination: searchParams.get('destination')?.toUpperCase() || "ATL",
      departureDate: searchParams.get('date') ? new Date(searchParams.get('date')!) : new Date(),
    },
  });

function onSubmit(values: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    
    const params = new URLSearchParams({
      origin: values.origin,
      destination: values.destination,
      date: format(values.departureDate, 'yyyy-MM-dd'),
    });
    
    // 🔥 اصلاح شد: به جای رفتن به / همیشه به آدرس فعلی (pathname) می‌رود 🔥
    router.push(`${pathname}?${params.toString()}`);
    
    setTimeout(() => setIsLoading(false), 1000);
  }

  if (!isMounted) return null;

  return (
    <>
      {/* Overlay Loading حرفه‌ای */}
      {isSearching && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
          <span className="mt-2 text-xs font-bold text-emerald-900 tracking-tighter uppercase">Searching Sabre...</span>
        </div>
      )}

      <Form {...form}>
        <form  dir="ltr"
          onSubmit={form.handleSubmit(onSubmit)} 
          className="flex flex-col md:flex-row w-full max-w-4xl mx-auto -mt-6 bg-white border border-slate-300 shadow-xl rounded-none overflow-hidden"
        >
          {/* Origin */}
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem className="flex-1 border-b md:border-b-0 md:border-r border-slate-200 relative">
                <div className="absolute top-1.5 left-3 z-10 text-[9px] font-black text-emerald-800 uppercase tracking-tighter">From</div>
                <div className="pt-3">
                  <AirportSelector field={field} form={form} placeholder="Origin" icon={PlaneTakeoff} airports={airports} />
                </div>
                <FormMessage className="text-[9px] absolute bottom-0 left-3" />
              </FormItem>
            )}
          />

          {/* Destination */}
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem className="flex-1 border-b md:border-b-0 md:border-r border-slate-200 relative">
                <div className="absolute top-1.5 left-3 z-10 text-[9px] font-black text-emerald-800 uppercase tracking-tighter">To</div>
                <div className="pt-3">
                  <AirportSelector field={field} form={form} placeholder="Destination" icon={PlaneLanding} airports={airports} />
                </div>
                <FormMessage className="text-[9px] absolute bottom-0 left-3" />
              </FormItem>
            )}
          />

          {/* Date */}
          <FormField
            control={form.control}
            name="departureDate"
            render={({ field }) => (
              <FormItem className="flex-1 relative border-b md:border-b-0 md:border-r border-slate-200">
                <div className="absolute top-1.5 left-3 z-10 text-[9px] font-black text-emerald-800 uppercase tracking-tighter">Departure</div>
                <div className="pt-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between h-12 bg-white border-none text-xs font-bold rounded-none shadow-none",
                            !field.value && "text-slate-500"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-emerald-800" />
                            {field.value ? format(field.value, "dd MMM yyyy") : <span>Select Date</span>}
                          </div>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 rounded-none border-slate-300" align="center">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        className="rounded-none"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <FormMessage className="text-[9px] absolute bottom-0 left-3" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isSearching}
            className="h-14 md:h-auto md:w-36 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs uppercase tracking-widest rounded-none border-none transition-colors"
          >
            {isSearching ? <Loader2 className="animate-spin h-4 w-4" /> : <><Search className="h-4 w-4 mr-2" /> Search</>}
          </Button>
        </form>
      </Form>
    </>
  );
}