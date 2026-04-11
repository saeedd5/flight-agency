'use client';

import { useState, Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveAgencyFlight } from '@/lib/api';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { FlightOption, FlightSegment } from '@/lib/types';
import { format } from 'date-fns';
import { Users, ChevronDown, ChevronUp, Percent, Loader2, Save, PlaneTakeoff, ShieldAlert, Clock } from 'lucide-react';

// تابع کمکی برای فرمت‌دهی زمان
function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim();
}

// ===================================================================
// کامپوننت داخلی برای نمایش جزئیات سگمنت‌ها
// ===================================================================
function FlightSegmentsDetail({ segments }: { segments: FlightSegment[] }) {
  return (
    <div>
      <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2 text-[11px] uppercase tracking-tighter">
        <PlaneTakeoff className="w-4 h-4 text-emerald-700" /> Flight Path & Details
      </h4>
      <div className="space-y-2">
        {segments.map((segment, index) => {
          let layoverMinutes = 0;
          if (index < segments.length - 1) {
            const nextSegment = segments[index + 1];
            const arrival = new Date(segment.arrivalTime);
            const nextDeparture = new Date(nextSegment.departureTime);
            layoverMinutes = Math.round((nextDeparture.getTime() - arrival.getTime()) / 60000);
          }

          return (
            <Fragment key={index}>
              {/* بخش اطلاعات یک سگمنت */}
              <div className="flex gap-3 text-xs">
                <div className="flex flex-col items-center">
                  <span className="font-black text-slate-800">{format(new Date(segment.departureTime), 'HH:mm')}</span>
                  <div className="w-px h-10 bg-slate-300 my-1"></div>
                  <span className="font-black text-slate-800">{format(new Date(segment.arrivalTime), 'HH:mm')}</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-600">{segment.origin}</div>
                  <div className="text-[10px] text-slate-400 py-1 my-1 pl-2 border-l-2 border-slate-200">
                    {segment.carrier}{segment.flightNumber} • {formatDuration(segment.elapsedTime || 0)} • {segment.equipment}
                  </div>
                  <div className="font-bold text-slate-600">{segment.destination}</div>
                </div>
              </div>

              {/* نمایش زمان توقف (Layover) اگر وجود داشت */}
              {layoverMinutes > 0 && (
                <div className="flex items-center gap-2 text-amber-700 my-3 pl-4">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase">
                    Layover: {formatDuration(layoverMinutes)} in {segment.destination}
                  </span>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ===================================================================
// کامپوننت اصلی کارت پرواز
// ===================================================================
export function FlightCard({ flight }: { flight: FlightOption }) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [agencyMarkup, setAgencyMarkup] = useState<number>(10);
  const [isSaving, setIsSaving] = useState(false);

  const isAgency = Boolean(user?.roles?.map(r => r.toLowerCase()).includes('agency'));
  const isDirect = flight.stops === 0;
  const calculatedFinalPrice = flight.price + (flight.price * (agencyMarkup / 100));

  const handleSaveFlight = async () => {
    setIsSaving(true);
    const flightData = {
      flightKey: flight.key,
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      basePrice: flight.price,
      markupPercentage: agencyMarkup,
      finalPrice: calculatedFinalPrice,
      currency: flight.currency,
      rawFlightData: JSON.stringify(flight)
    };

    const res = await saveAgencyFlight(flightData);
    if (res.success) {
      alert("Flight saved successfully!");
      setShowModal(false);
    } else {
      alert(res.errorMessage || "Error saving flight.");
    }
    setIsSaving(false);
  };

  return (
    <>
      <Card 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full rounded-none border transition-all duration-200 bg-white overflow-hidden cursor-pointer ${isExpanded ? 'border-emerald-700 ring-1 ring-emerald-700' : 'border-slate-300 hover:border-emerald-600'}`}
      >
        <div className="flex flex-col md:flex-row min-h-[80px]">
          
          {/* بخش اصلی اطلاعات پرواز (همیشه نمایان) */}
          <div className="flex-1 p-3 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-900 text-white rounded-none text-[10px] flex items-center justify-center font-bold">{flight.airline}</div>
                <div className="leading-tight">
                   <span className="text-xs font-bold text-slate-800 uppercase">{flight.airline}{flight.flightNumber}</span>
                   <div className="text-[10px] text-slate-500">{flight.cabinClass || 'Economy'} • {flight.equipment || 'Jet'}</div>
                </div>
              </div>
              <div className={`text-[9px] font-bold flex items-center gap-1 ${flight.seatsAvailable && flight.seatsAvailable <= 5 ? 'text-red-700' : 'text-emerald-700'}`}>
                <Users className="w-3 h-3" /> {flight.seatsAvailable && flight.seatsAvailable <= 5 ? `${flight.seatsAvailable} left` : 'Available'}
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="text-right w-[60px]">
                <div className="text-lg font-black text-slate-900">{format(new Date(flight.departureTime), 'HH:mm')}</div>
                <div className="text-[10px] font-bold text-slate-500">{flight.origin}</div>
              </div>
              <div className="flex-1 flex flex-col items-center px-2">
                <div className="text-[9px] font-bold text-slate-400 mb-0.5">{formatDuration(flight.travelTime)}</div>
                <div className="w-full relative flex items-center justify-center h-2">
                  <div className="absolute w-full h-[1px] bg-slate-300"></div>
                  <div className={`z-10 px-2 py-0 text-[8px] font-bold bg-white border ${isDirect ? 'text-emerald-700 border-emerald-300' : 'text-amber-700 border-amber-300'}`}>
                    {isDirect ? 'Direct' : `${flight.stops} Stop`}
                  </div>
                </div>
              </div>
              <div className="text-left w-[60px]">
                <div className="text-lg font-black text-slate-900">{format(new Date(flight.arrivalTime), 'HH:mm')}</div>
                <div className="text-[10px] font-bold text-slate-500">{flight.destination}</div>
              </div>
            </div>
          </div>

          {/* بخش قیمت و دکمه Select برای آژانس */}
          <div className="w-full md:w-[150px] bg-slate-50 p-3 border-t md:border-t-0 md:border-l border-slate-200 flex flex-row md:flex-col justify-between items-center md:items-end">
            <div className="text-left md:text-right">
              <div className="text-[9px] font-bold text-slate-400 uppercase">Price</div>
              <div className="text-xl font-black text-emerald-900 leading-none mt-1">${flight.price.toFixed(2)}</div>
            </div>
            {isAgency && (
              <Button onClick={(e) => { e.stopPropagation(); setShowModal(true); }} className="rounded-none bg-emerald-800 hover:bg-emerald-900 text-white font-bold h-8 px-4 text-xs mt-0 md:mt-2">
                Select
              </Button>
            )}
          </div>
        </div>

        {/* بخش جزئیات کشویی (با سگمنت‌ها) */}
        {isExpanded && (
          <div className="bg-slate-50/50 border-t border-slate-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <FlightSegmentsDetail segments={flight.segments} />
            
            <div>
              <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2 text-[11px] uppercase tracking-tighter">
                 <ShieldAlert className="w-4 h-4 text-emerald-700" /> Fare & Baggage
              </h4>
              <ul className="space-y-1 text-slate-600 font-medium">
                 <li className="flex justify-between border-b border-slate-200/50 pb-1"><span>Class:</span> <span className="font-medium text-slate-900">{flight.cabinClass}</span></li>
                 <li className="flex justify-between border-b border-slate-200/50 pb-1"><span>Baggage:</span> <span className="font-medium text-slate-900">{flight.baggageAllowance}</span></li>
                 <li className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span>Refundable:</span> 
                    <span className={flight.isRefundable ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                       {flight.isRefundable ? "Yes" : "No"}
                    </span>
                 </li>
                 <li className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span>Base Fare:</span> <span className="font-medium text-slate-900">${flight.basePrice?.toFixed(2) || 'N/A'}</span>
                 </li>
                 {flight.taxes?.map((tax, idx) => (
                    <li key={idx} className="flex justify-between border-b border-slate-200/50 pb-1">
                       <span>Tax ({tax.code}):</span> <span className="font-medium text-slate-900">${tax.amount.toFixed(2)}</span>
                    </li>
                 ))}
              </ul>
            </div>
          </div>
        )}

        <div className="w-full bg-white flex justify-center items-center py-1 border-t border-slate-100 text-slate-400 hover:text-blue-500 hover:bg-slate-50 transition-colors">
           {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </Card>

      {/* مودال قیمت‌گذاری برای آژانس */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="rounded-none sm:max-w-[360px] border-emerald-800 p-0 shadow-2xl">
          <DialogHeader className="p-4 border-b border-slate-200 bg-emerald-950 text-white">
            <DialogTitle className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" /> Agency Pricing
            </DialogTitle>
          </DialogHeader>
          <div className="p-5 space-y-5 bg-white">
            <div className="flex justify-between items-center bg-slate-50 p-3 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500">Base Price (incl. admin markup)</span>
              <span className="font-black text-sm text-slate-800">${flight.price.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500">Your Markup (%)</label>
              <div className="relative">
                <Input type="number" min="0" max="100" value={agencyMarkup} onChange={(e) => setAgencyMarkup(Number(e.target.value))} className="rounded-none h-12 text-xl font-black border-slate-300 pl-10 focus-visible:ring-emerald-700" />
                <Percent className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>
            <div className="flex justify-between items-center bg-emerald-50 p-3 border border-emerald-200">
              <span className="text-[10px] font-black uppercase text-emerald-800">Final Client Price</span>
              <span className="font-black text-xl text-emerald-700">${calculatedFinalPrice.toFixed(2)}</span>
            </div>
          </div>
          <DialogFooter className="p-4 border-t border-slate-200 bg-slate-50">
            <Button onClick={handleSaveFlight} disabled={isSaving} className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900 text-white h-10 text-xs font-black uppercase tracking-wider">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save to My Dashboard</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}