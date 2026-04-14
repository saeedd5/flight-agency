//frontend/lib/types.ts : 
export interface FlightSegment {
  carrier: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  equipment?: string;
  elapsedTime?: number; // زمان پرواز هر سگمنت به دقیقه
}

export interface TaxInfo {
  code: string;
  amount: number;
  currency: string;
}

export interface FlightOption {
  key: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  travelTime: number; 
  stops: number;
  price: number;
  basePrice?: number; // قیمت پایه
  currency: string;
  segments: FlightSegment[];
  
  equipment?: string;
  cabinClass?: string;
  seatsAvailable?: number;
  
  // --- اطلاعات جدید اضافه شد ---
  baggageAllowance?: string; // میزان بار (مثلاً "1 Piece" یا "23kg")
  fareBasis?: string;        // کد پایه نرخی (برای تغییر/کنسلی)
  isRefundable?: boolean;    // آیا قابل استرداد است؟
  taxes?: TaxInfo[];         // لیست مالیات‌ها
  
  isAgencyTicket?: boolean;
  agencyName?: string;
  agencyProfileImage?: string;
}

export interface FlightSearchResponse {
  success: boolean;
  flights: FlightOption[];
  errorMessage?: string;
    markupPercentage?: number; // 🔥 این خط را اضافه کنید 🔥

}