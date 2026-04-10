import React from 'react';
import { getAirlineDisplayName } from '../../utils/airlineNames';
import { getAirlineLogoUrl } from '../../utils/airlineLogo';
import { getAirportCity } from '../../utils/airportCodes';
import dayjs from 'dayjs';

export default function MarketplaceFlightCard({ ticket, onBook }) {
  // اطلاعات اصلی پرواز را از JSON ذخیره شده بیرون می‌کشیم
  const flight = JSON.parse(ticket.rawFlightData);
  
  const formatTime = (time) => dayjs(time).format('HH:mm');
  const formatPrice = (price, currency = 'USD') => {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency;
    return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    if (typeof duration === 'number') return `${Math.floor(duration / 60)}h ${duration % 60}m`;
    return duration.replace(/(\d+h)(\d+m)/, '$1 $2');
  };

  const segments = flight.legs || [];
  const firstSegment = segments[0] || {};
  const lastSegment = segments[segments.length - 1] || {};
  
  const airlineCode = firstSegment.airlineCode || flight.airline;
  const airlineName = getAirlineDisplayName(flight.airline);
  const logoUrl = getAirlineLogoUrl(airlineCode, 50, 50);

  const originName = getAirportCity(flight.origin) || flight.origin;
  const destinationName = getAirportCity(flight.destination) || flight.destination;

  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', marginBottom: '20px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', transition: 'all 0.3s' }}>
      
      {/* --- نوار مخصوص آژانس فروشنده --- */}
      <div style={{ background: '#f8f9fa', padding: '10px 20px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {ticket.agencyProfileImage ? (
            <img src={ticket.agencyProfileImage} alt="Agency" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #157f43' }} />
          ) : (
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#157f43', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {ticket.agencyName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1' }}>Offered by</div>
            <strong style={{ color: '#1a1a1a', fontSize: '15px' }}>{ticket.agencyName}</strong>
          </div>
        </div>
        <div style={{ background: '#e6f4ea', color: '#157f43', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
          Verified Agency ✓
        </div>
      </div>

      {/* --- اطلاعات پرواز --- */}
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* ایرلاین */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', minWidth: '150px' }}>
          <img src={logoUrl} alt={airlineName} style={{ width: '40px', objectFit: 'contain' }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{airlineName}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{airlineCode}{flight.flightNumber}</div>
          </div>
        </div>

        {/* مسیر و زمان */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'center', minWidth: '300px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333' }}>{formatTime(flight.departureTime)}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>{originName} ({flight.origin})</div>
          </div>
          
          <div style={{ textAlign: 'center', width: '120px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{formatDuration(flight.travelTime || flight.totalDuration)}</div>
            <div style={{ height: '2px', background: '#ccc', position: 'relative', width: '100%' }}>
              <div style={{ position: 'absolute', top: '-4px', left: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#ccc' }}></div>
              <div style={{ position: 'absolute', top: '-4px', right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#ccc' }}></div>
            </div>
            <div style={{ fontSize: '12px', color: flight.stops === 0 ? '#157f43' : '#e63946', marginTop: '4px', fontWeight: 'bold' }}>
              {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop(s)`}
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333' }}>{formatTime(flight.arrivalTime)}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>{destinationName} ({flight.destination})</div>
          </div>
        </div>

        {/* قیمت و رزرو */}
        <div style={{ textAlign: 'right', minWidth: '150px', borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
          <div style={{ fontSize: '13px', color: '#666' }}>Final Price</div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px' }}>
            {formatPrice(ticket.finalPrice, ticket.currency)}
          </div>
          <button 
            onClick={() => onBook(ticket)}
            style={{ width: '100%', background: '#e63946', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Book Ticket
          </button>
        </div>

      </div>
    </div>
  );
}