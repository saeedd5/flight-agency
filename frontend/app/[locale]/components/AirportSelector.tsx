'use client';

import { Check, ChevronsUpDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../../../components/ui/button';
import { FormControl } from '../../../components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface Airport {
  city: string;
  code: string;
  country: string;
}

interface AirportSelectorProps {
  field: any;
  form: any;
  placeholder: string;
  icon: LucideIcon;
  airports: Airport[];
}

export function AirportSelector({ field, form, placeholder, icon: Icon, airports }: AirportSelectorProps) {
  const selectedAirport = airports.find((a) => a.code === field.value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between h-12 bg-white border-none hover:bg-slate-50 text-xs font-normal shadow-none rounded-none transition-none",
              !field.value && "text-slate-500"
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <Icon className="h-4 w-4 text-emerald-800 shrink-0" />
              {selectedAirport ? (
                <span className="flex items-center gap-1 truncate font-bold text-slate-900">
                  {selectedAirport.city} <span className="text-slate-400 font-normal text-[10px]">({selectedAirport.code})</span>
                </span>
              ) : (
                <span className="text-slate-400">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50 text-emerald-800" />
          </Button>
        </FormControl>
      </PopoverTrigger>

      <PopoverContent className="w-[260px] p-0 rounded-none border-slate-300 shadow-xl" align="start">
        <Command className="rounded-none">
          <CommandInput placeholder="Search code or city..." className="h-8 text-xs" />
          <CommandList className="max-h-[200px]">
            <CommandEmpty className="text-[10px] p-2">No airport found.</CommandEmpty>
            <CommandGroup>
              {airports.map((airport) => (
                <CommandItem
                  key={airport.code}
                  value={`${airport.city} ${airport.code}`}
                  onSelect={() => form.setValue(field.name, airport.code)}
                  className="flex items-center justify-between cursor-pointer py-1.5 px-2 text-[11px] rounded-none hover:bg-emerald-50"
                >
                  <div className="flex flex-col">
                    <span className="font-bold">{airport.city}</span>
                    <span className="text-[9px] text-slate-400">{airport.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-600 px-1 py-0.5 font-bold text-[9px]">{airport.code}</span>
                    <Check className={cn("h-3 w-3 text-emerald-700", airport.code === field.value ? "opacity-100" : "opacity-0")} />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}