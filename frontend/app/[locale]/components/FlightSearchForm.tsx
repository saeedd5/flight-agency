'use client';

import { useState, useEffect } from 'react'; 
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing'; // روتر دوزبانه
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, PlaneTakeoff, PlaneLanding, Search, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { AirportSelector } from './AirportSelector';
import { airports } from '@/lib/constants'; // 🔥 وارد کردن لیست فرودگاه‌ها از فایل مرکزی 🔥

const FormSchema = z.object({
  origin: z.string().min(3, "Required"),
  destination: z.string().min(3, "Required"),
  departureDate: z.date({ message: "Required" })
});

export function FlightSearchForm() {
  const t = useTranslations('SearchForm');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { 
    setIsMounted(true); 
    setIsLoading(false); 
  }, [searchParams]);

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
    router.push(`${pathname}?${params.toString()}`);
  }

  if (!isMounted) return null;

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
          <span className="mt-2 text-xs font-bold text-emerald-900 tracking-tighter uppercase">{t('searching')}</span>
        </div>
      )}

      <Form {...form}>
        <form 
          dir="ltr" // فرم همیشه چپ‌چین می‌ماند
          onSubmit={form.handleSubmit(onSubmit)} 
          className="flex flex-col md:flex-row w-full max-w-4xl mx-auto -mt-6 bg-white border border-slate-300 shadow-xl rounded-none overflow-hidden"
        >
          {/* Origin */}
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem className="flex-1 border-b md:border-b-0 md:border-r border-slate-200 relative pt-3">
                <div className="absolute top-1.5 left-3 z-10 text-[9px] font-black text-emerald-800 uppercase tracking-tighter">{t('from')}</div>
                <div className="pt-1">
                  {/* ارسال آرایه فرودگاه‌ها به کامپوننت Selector */}
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
              <FormItem className="flex-1 border-b md:border-b-0 md:border-r border-slate-200 relative pt-3">
                <div className="absolute top-1.5 left-3 z-10 text-[9px] font-black text-emerald-800 uppercase tracking-tighter">{t('to')}</div>
                <div className="pt-1">
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
              <FormItem className="flex-1 relative border-b md:border-b-0 md:border-r border-slate-200 pt-3">
                <div className="absolute top-1.5 left-3 z-10 text-[9px] font-black text-emerald-800 uppercase tracking-tighter">{t('departure')}</div>
                <div className="pt-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("w-full justify-between h-12 bg-white border-none text-xs font-bold rounded-none shadow-none", !field.value && "text-slate-500")}>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-emerald-800" />
                            {field.value ? <span className="font-black text-slate-900 uppercase">{format(field.value, "dd MMM yyyy")}</span> : <span>{t('selectDate')}</span>}
                          </div>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 rounded-none border-slate-300 shadow-2xl" align="center">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus className="rounded-none" />
                    </PopoverContent>
                  </Popover>
                </div>
                <FormMessage className="text-[9px] absolute bottom-0 left-3" />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button type="submit" disabled={isLoading} className="h-14 md:h-auto md:w-36 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs uppercase tracking-widest rounded-none border-none transition-all">
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <div className="flex items-center gap-2"><Search className="h-4 w-4" /><span>{t('search')}</span></div>}
          </Button>
        </form>
      </Form>
    </>
  );
}