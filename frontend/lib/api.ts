// frontend/lib/api.ts

import axios from 'axios';
import { FlightSearchResponse, FlightOption, FlightSegment, TaxInfo } from './types'; // TaxInfo هم اضافه شد

const isServer = typeof window === 'undefined';
export const baseURL = isServer 
  ? 'http://127.0.0.1:5000' 
  : (process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000');

const apiBaseURL = `${baseURL}/api`;

const api = axios.create({ baseURL: apiBaseURL, timeout: 60000 });

// -----------------------------------------------------
// 1. Interceptor برای ارسال توکن
// -----------------------------------------------------
// =====================================================
// اینترسپتور ضدگلوله (مقاوم در برابر مشکلات کانتکست)
// =====================================================
api.interceptors.request.use(
  (config) => {
    // این کد فقط در مرورگر اجرا می‌شود
    if (typeof window !== 'undefined') {
      // مستقیماً توکن را از حافظه مرورگر بخوان
      const token = localStorage.getItem('token');
      
      if (token) {
        // اگر توکن وجود داشت، آن را به هدر اضافه کن
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// -----------------------------------------------------
// 2. تایپ‌ها و توابع احراز هویت (با roles به صورت آرایه)
// -----------------------------------------------------
export interface User {
  id?: number;
  name: string;
  phone: string;
  username?: string; // 🔥 این خط اضافه شد تا ارور Type error برطرف شود 🔥
  email?: string;
  roles: string[]; // <-- اصلاح شده به صورت آرایه
  profileImageUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  errorMessage?: string;
}

export async function login(phone: string, password: string): Promise<AuthResponse> {
  try {
    const response = await api.post('/auth/login', { phone, password });
    return { success: true, token: response.data.token, user: response.data.user };
  } catch (error: any) {
    return { success: false, errorMessage: error.response?.data?.message || 'Login failed' };
  }
}

// فقط یک تابع register وجود دارد که AccountType را ارسال میکند
export async function register(data: { name: string; phone: string; password: string; role: string }): Promise<AuthResponse> {
  try {
    const response = await api.post('/auth/register', {
      name: data.name,
      phone: data.phone,
      password: data.password,
      accountType: data.role,
    });
    // تغییر اینجاست: errorMessage هم پاس داده شد
    return { 
      success: true, 
      token: response.data.token, 
      user: response.data.user,
      errorMessage: response.data.errorMessage 
    };
  } catch (error: any) {
    return { success: false, errorMessage: error.response?.data?.message || 'Registration failed' };
  }
}

export interface UpdateProfileResponse {
    success: boolean;
    user?: User;
    errorMessage?: string;
}

export async function updateProfile(data: { name: string; email: string; profileImageFile?: File }): Promise<UpdateProfileResponse> {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    if (data.profileImageFile) {
      formData.append('profileImageFile', data.profileImageFile);
    }
    
    const response = await api.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { success: true, user: response.data.user };
  } catch (error: any) {
    return { success: false, errorMessage: error.response?.data?.message || 'Profile update failed' };
  }
}

// -----------------------------------------------------
// 3. توابع جستجوی پرواز (بدون تغییر)
// -----------------------------------------------------
// 1. اول باید تایپ خروجی را آپدیت کنیم
// export interface FlightSearchResponse {
//   success: boolean;
//   flights: FlightOption[];
//   errorMessage?: string;
//   markupPercentage?: number; 
// }

// 2. تابع جستجو آپدیت می‌شود تا درصد را بگیرد و به پارسر بفرستد
export async function searchFlightsFromSabre(params: {
  origin: string;
  destination: string;
  departureDate: string;
}): Promise<FlightSearchResponse> {
  try {
    const response = await api.post('/flight/search-raw', {
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
    });
    
    if (!response.data.success) throw new Error("Server error");
    
    const rawData = response.data.rawData;
    const markupPercentage = parseFloat(response.data.markupPercentage || '0'); // دریافت درصد از بک‌اند
    
    if (rawData === "{}") return { success: true, flights: [], markupPercentage }; 
    
    const parsedData = JSON.parse(rawData);
    
    // حالا درصد را هم به پارسر می‌دهیم تا موقع محاسبه قیمت اعمال کند
    const flights = extractFlightsFromSabreJson(parsedData, params.origin, params.destination, markupPercentage);
    
    return { success: true, flights, markupPercentage };
    
  } catch (error: any) {
    return {
      success: false,
      flights: [],
      errorMessage: error.response?.data?.errorMessage || "Error connecting to the flight server.",
    };
  }
}

// 3. پارسر آپدیت می‌شود (دقت کنید آرگومان چهارم اضافه شده)
function extractFlightsFromSabreJson(json: any, origin: string, dest: string, markupPercentage: number = 0): FlightOption[] {
  const flights: FlightOption[] = [];
  
  try {
    let itinerariesArray: any = null;

    if (json.PricedItineraries?.PricedItinerary) itinerariesArray = json.PricedItineraries.PricedItinerary;
    else if (json.PricedItineraries) itinerariesArray = json.PricedItineraries; 
    else if (json.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary) itinerariesArray = json.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary;

    if (!itinerariesArray) return flights;

    const itineraries = Array.isArray(itinerariesArray) ? itinerariesArray : [itinerariesArray];

    itineraries.forEach((itin: any, index: number) => {
      try {
        let airItin = itin.AirItinerary?.OriginDestinationOptions?.OriginDestinationOption;
        if (!airItin && itin.legs) airItin = itin.legs[0]; 
        if (!airItin) return; 
        
        const option = Array.isArray(airItin) ? airItin[0] : airItin;
        let segmentsRaw = option.FlightSegment || option.segments; 
        if (!segmentsRaw) return;
        
        const segmentsArray = Array.isArray(segmentsRaw) ? segmentsRaw : [segmentsRaw];

        const segments: FlightSegment[] = segmentsArray.map((seg: any) => ({
          carrier: (seg.MarketingAirline?.Code || seg.marketingAirline || '').toString(),
          flightNumber: (seg.FlightNumber || seg.flightNumber || '').toString(),
          origin: (seg.DepartureAirport?.LocationCode || seg.departureAirport || '').toString(),
          destination: (seg.ArrivalAirport?.LocationCode || seg.arrivalAirport || '').toString(),
          departureTime: (seg.DepartureDateTime || seg.departureDateTime || '').toString(),
          arrivalTime: (seg.ArrivalDateTime || seg.arrivalDateTime || '').toString(),
          equipment: (seg.Equipment?.AirEquipType || seg.equipment || 'Jet').toString(),
          elapsedTime: parseInt(seg.ElapsedTime || '0'), 
        }));

        if (segments.length === 0) return;

        let basePriceRaw = 0, totalTaxRaw = 0;
        let currency = 'USD';
        let cabinClass = 'Economy', fareBasis = '';
        let seatsAvailable = 0, isRefundable = false;
        let baggage = '';
        let taxes: TaxInfo[] = [];
        
        const pricingInfos = itin.AirItineraryPricingInfo || itin.pricingInformation;
        if (pricingInfos) {
          const pricingInfo = Array.isArray(pricingInfos) ? pricingInfos[0] : pricingInfos;
          
          if (pricingInfo?.ItinTotalFare?.TotalFare) {
             currency = pricingInfo.ItinTotalFare.TotalFare.CurrencyCode || 'USD';
          } 
          if (pricingInfo?.ItinTotalFare?.BaseFare) {
             basePriceRaw = parseFloat(pricingInfo.ItinTotalFare.BaseFare.Amount || '0');
          }
          if (pricingInfo?.ItinTotalFare?.Taxes?.Tax) {
             const taxArray = Array.isArray(pricingInfo.ItinTotalFare.Taxes.Tax) ? pricingInfo.ItinTotalFare.Taxes.Tax : [pricingInfo.ItinTotalFare.Taxes.Tax];
             taxes = taxArray.map((t: any) => {
                 totalTaxRaw += parseFloat(t.Amount || '0'); // جمع کردن مالیات خام
                 return { code: t.TaxCode || t.TaxDescription || 'Tax', amount: parseFloat(t.Amount || '0'), currency: t.CurrencyCode || currency };
             });
          }
          
          const ptc = Array.isArray(pricingInfo?.PTC_FareBreakdowns?.PTC_FareBreakdown) ? pricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown[0] : pricingInfo?.PTC_FareBreakdowns?.PTC_FareBreakdown;
          if (ptc) {
             const fbc = Array.isArray(ptc.FareBasisCodes?.FareBasisCode) ? ptc.FareBasisCodes.FareBasisCode[0] : ptc.FareBasisCodes?.FareBasisCode;
             if (fbc) {
                 fareBasis = typeof fbc === 'string' ? fbc : (fbc.content || '');
                 if (fbc.BookingCode) cabinClass = ['F', 'J', 'C'].includes(fbc.BookingCode) ? 'Business' : 'Economy';
             }
             const avail = ptc.PassengerFare?.TicketDesignators?.TicketDesignator;
             if (avail && avail[0]?.Extension) seatsAvailable = parseInt(avail[0].Extension) || 0;
             
             const bagInfo = ptc.PassengerFare?.TPA_Extensions?.BaggageInformationList?.BaggageInformation;
             if (bagInfo) {
                 const b = Array.isArray(bagInfo) ? bagInfo[0] : bagInfo;
                 if (b.Allowance?.Pieces) baggage = `${b.Allowance.Pieces} Piece(s)`;
                 else if (b.Allowance?.Weight) baggage = `${b.Allowance.Weight} ${b.Allowance.Unit || 'kg'}`;
             }
             if (ptc.PassengerFare?.PenaltiesInfo?.Penalty) {
                const penalty = Array.isArray(ptc.PassengerFare.PenaltiesInfo.Penalty) ? ptc.PassengerFare.PenaltiesInfo.Penalty : [ptc.PassengerFare.PenaltiesInfo.Penalty];
                isRefundable = !penalty.some((p:any) => p.Type === "Refund" && p.Applicability === "NonRefundable");
             }
          }
        }

        const firstSeg = segments[0];
        const lastSeg = segments[segments.length - 1];
        const totalTravelTime = parseInt(itin.AirItinerary?.OriginDestinationOptions?.OriginDestinationOption?.[0]?.ElapsedTime || '0');
        const calculatedTime = totalTravelTime > 0 ? totalTravelTime : Math.round((new Date(lastSeg.arrivalTime).getTime() - new Date(firstSeg.departureTime).getTime()) / 60000);

        // ============================================
        // 🔥 اعمال مارک‌آپ روی قیمت خام (Base Price) 🔥
        // ============================================
        const finalBasePrice = basePriceRaw + (basePriceRaw * (markupPercentage / 100));
        const finalTotalPrice = finalBasePrice + totalTaxRaw; // قیمت نهایی = بیس 프라이س + درصد + مالیات

        flights.push({
          key: `sabre-${index}-${firstSeg.carrier}${firstSeg.flightNumber}`,
          airline: firstSeg.carrier,
          flightNumber: firstSeg.flightNumber,
          origin: origin,
          destination: dest,
          departureTime: firstSeg.departureTime,
          arrivalTime: lastSeg.arrivalTime,
          travelTime: calculatedTime > 0 ? calculatedTime : 120,
          stops: segments.length - 1,
          price: finalTotalPrice, // قیمت افزوده شده
          basePrice: finalBasePrice, // بیس 프라이س افزوده شده
          currency: currency,
          segments: segments,
          equipment: firstSeg.equipment,
          cabinClass: cabinClass,
          seatsAvailable: seatsAvailable > 0 ? seatsAvailable : Math.floor(Math.random() * 5) + 1,
          baggageAllowance: baggage || 'Not specified',
          fareBasis: fareBasis,
          isRefundable: isRefundable,
          taxes: taxes
        });
      } catch (e) {}
    });
  } catch (e) { console.error("Error parsing JSON:", e); }
  
  return flights;
}


// =====================================================
// بخش Admin Panel (مدیریت سیستم)
// =====================================================

export interface AdminUser {
  id: number;
  username: string; // در بکند شما این معمولا همون تلفن ذخیره میشه
  email: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export async function adminGetUsers(page = 1, pageSize = 20): Promise<{ users: AdminUser[]; totalCount: number; success: boolean }> {
  try {
    const response = await api.get(`/admin/users?page=${page}&pageSize=${pageSize}`);
    return { users: response.data.users, totalCount: response.data.totalCount, success: true };
  } catch (error) {
    return { users: [], totalCount: 0, success: false };
  }
}

export async function adminCreateUser(data: any): Promise<{ success: boolean; errorMessage?: string }> {
  try {
    await api.post('/admin/users', data);
    return { success: true };
  } catch (error: any) {
    return { success: false, errorMessage: error.response?.data?.error || 'Failed to create user' };
  }
}

export async function adminUpdateUser(id: number, data: any): Promise<{ success: boolean; errorMessage?: string }> {
  try {
    await api.put(`/admin/users/${id}`, data);
    return { success: true };
  } catch (error: any) {
    return { success: false, errorMessage: error.response?.data?.error || 'Failed to update user' };
  }
}

export async function adminDeleteUser(id: number): Promise<{ success: boolean; errorMessage?: string }> {
  try {
    await api.delete(`/admin/users/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, errorMessage: error.response?.data?.error || 'Failed to delete user' };
  }
}


// اختصاصی برای لاگین ادمین
export async function adminLogin(username: string, password: string): Promise<AuthResponse> {
  try {
    // ما username ادمین را در قالب کلید phone به بک‌اند میفرستیم چون DTO شما این را میخواهد
    const response = await api.post('/auth/login', { phone: username, password });
    return { success: true, token: response.data.token, user: response.data.user };
  } catch (error: any) {
    return { success: false, errorMessage: error.response?.data?.message || 'Admin Access Denied' };
  }
}





// =====================================================
// بخش تنظیمات سیستم (Admin Settings)
// =====================================================

export async function adminGetSetting(key: string): Promise<{ success: boolean; setting?: { key: string, value: string, description: string }, errorMessage?: string }> {
  try {
    const response = await api.get(`/admin/settings/${key}`);
    return { success: true, setting: response.data };
  } catch (error: any) {
    return { success: false, errorMessage: error.response?.data?.error || 'Failed to fetch setting' };
  }
}

export async function adminUpdateSetting(key: string, value: string): Promise<{ success: boolean; errorMessage?: string }> {
  try {
    await api.put(`/admin/settings/${key}`, { value });
    return { success: true };
  } catch (error: any) {
    return { success: false, errorMessage: error.response?.data?.error || 'Failed to update setting' };
  }
}





// =====================================================
// بخش آژانس (Agency Panel)
// =====================================================

export async function saveAgencyFlight(data: any): Promise<{ success: boolean; errorMessage?: string }> {
  try {
    await api.post('/agency/flights', data);
    return { success: true };
  } catch (error: any) {
    return { success: false, errorMessage: error.response?.data?.message || 'Failed to save flight' };
  }
}

export async function getMyAgencyFlights(): Promise<{ success: boolean; flights: any[]; errorMessage?: string }> {
  try {
    const response = await api.get('/agency/my-flights');
    return { success: true, flights: response.data.flights };
  } catch (error: any) {
    return { success: false, flights: [], errorMessage: error.response?.data?.message || 'Failed to fetch flights' };
  }
}




// =====================================================
// دریافت بلیت‌های ذخیره شده آژانس‌ها (برای کاربران عادی)
// =====================================================
export async function searchAgencyFlights(params: {
  origin: string;
  destination: string;
  date: string;
  page?: number;     // 🔥 پارامتر جدید
  pageSize?: number; // 🔥 پارامتر جدید
}): Promise<{ success: boolean; flights: any[]; totalCount: number; errorMessage?: string }> {
  try {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    
    // ارسال صفحه و سایز به بک‌اند
    const url = `/flight/agency-tickets?origin=${params.origin}&destination=${params.destination}&date=${params.date}&page=${page}&pageSize=${pageSize}&_t=${new Date().getTime()}`;
    const response = await api.get(url);
    
    const formattedFlights = response.data.flights.map((f: any) => {
      const flightData = f.flightData || {};
      return {
        ...flightData,
        isAgencyTicket: true,
        agencyFlightId: f.id,
        agencyName: f.agencyName,
        agencyProfileImage: f.agencyProfileImage,
        price: f.finalPrice, 
        currency: f.currency,
        key: `agency-${f.id}-${flightData.key || 'unknown'}`
      };
    });

    // حالا totalCount را هم برمی‌گردانیم
    return { success: true, totalCount: response.data.totalCount, flights: formattedFlights };
  } catch (error: any) {
    return { success: false, flights: [], totalCount: 0, errorMessage: error.response?.data?.ErrorMessage || "Failed to fetch agency tickets." };
  }
}




// =====================================================
// بخش رزرو بلیط برای کاربران عادی (User Bookings)
// =====================================================

export async function createUserBooking(data: { flightKey: string, passengerName: string, passengerEmail: string, totalPrice: number }): Promise<{ success: boolean; errorMessage?: string }> {
  try {
    await api.post('/booking', data);
    return { success: true };
  } catch (error: any) {
    return { success: false, errorMessage: error.response?.data?.message || 'Failed to create booking' };
  }
}

export async function getMyBookings(): Promise<{ success: boolean; bookings: any[]; errorMessage?: string }> {
  try {
    const response = await api.get('/booking/my-bookings');
    return { success: true, bookings: response.data.bookings };
  } catch (error: any) {
    return { success: false, bookings: [], errorMessage: error.response?.data?.message || 'Failed to load bookings' };
  }
}





export async function getAgencySoldTickets(): Promise<{ success: boolean; bookings: any[]; errorMessage?: string }> {
  try {
    const response = await api.get('/agency/bookings');
    return { success: true, bookings: response.data.bookings };
  } catch (error: any) {
    return { success: false, bookings: [], errorMessage: error.response?.data?.message || 'Failed to fetch sold tickets' };
  }
}








api.interceptors.request.use((config) => {
  if (!isServer) {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    
    // گرفتن زبان فعلی از کوکی که next-intl میسازد
    const match = document.cookie.match(new RegExp('(^| )NEXT_LOCALE=([^;]+)'));
    if (match) {
      config.headers['Accept-Language'] = match[2]; // مثلا: ar-IQ
    }
  }
  return config;
});