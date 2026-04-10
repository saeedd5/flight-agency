import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// تابع جادویی پرچم‌ها (میتوانید کدهای بیشتری اضافه کنید)
export function getAirportFlag(code: string): string {
  const c = code.toUpperCase();
  if (['JFK', 'LAX', 'ORD', 'MIA', 'SFO', 'ATL', 'DFW', 'SEA'].includes(c)) return '🇺🇸';
  if (['LHR', 'LGW', 'MAN'].includes(c)) return '🇬🇧';
  if (['CDG', 'ORY'].includes(c)) return '🇫🇷';
  if (['FRA', 'MUC', 'BER'].includes(c)) return '🇩🇪';
  if (['DXB', 'AUH'].includes(c)) return '🇦🇪';
  if (['IST', 'SAW'].includes(c)) return '🇹🇷';
  if (['THR', 'IKA', 'MHD'].includes(c)) return '🇮🇷';
  if (['YYZ', 'YVR'].includes(c)) return '🇨🇦';
  if (['SYD', 'MEL'].includes(c)) return '🇦🇺';
  if (['NRT', 'HND'].includes(c)) return '🇯🇵';
  if (['PEK', 'PVG'].includes(c)) return '🇨🇳';
  return '✈️'; // پیش‌فرض
}