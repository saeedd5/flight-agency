import React from 'react';
import { useTranslation } from '../../contexts/TranslationContext';
import { getAirlineDisplayName } from '../../utils/airlineNames';
import { getAirlineLogoUrl } from '../../utils/airlineLogo';
import dayjs from 'dayjs';
import './FlightCard.css'; // استفاده از همان استایل‌های قبلی

export default function AgencyFlightCard({ flight, onBook }) {
  const { t, language } = useTranslation();
  
  // توابع کمکی
  const formatTime = (time) => dayjs(time).format('HH:mm');
  const formatPrice = (price, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);

  const logoUrl = getAirlineLogoUrl(flight.airline, 50, 50);

  const handleBookClick = (e) => {
    e.stopPropagation();
    if (onBook) {
      onBook(flight);
    }
  };

  return (
    <div className="flight-card-new-design" style={{ border: '1px solid #1890ff', boxShadow: '0 4px 12px rgba(24,144,255,0.1)' }}>
      {/* هدر کارت */}
      <div className="flight-card-header">
        <div className="header-airline">
          <div className="airline-name">{getAirlineDisplayName(flight.airline)}</div>
        </div>
        <div className="header-center">
          <span className="flight-number-label">{flight.airline}{flight.flightNumber}</span>
        </div>
        <div className="header-icon">
          {logoUrl && <img src={logoUrl} alt={flight.airline} className="airline-logo" />}
        </div>
      </div>
      


      <div className="flight-route-section">
        <div className="route-left">
          <div className="time-large">{formatTime(flight.departureTime)}</div>
          <div className="airport-name">{flight.origin}</div>
        </div>
        <div className="route-middle">
          <div className="duration-above">{flight.travelTime ? `${Math.floor(flight.travelTime / 60)}h ${flight.travelTime % 60}m` : 'Direct'}</div>
          <div className="route-line-container"><div className="route-line"><div className="route-dot start-dot" /><div className="route-dot end-dot" /></div></div>
          <div className="stops-below">{t('directFlight') || 'Direct'}</div>
        </div>
        <div className="route-right">
          <div className="time-large">{formatTime(flight.arrivalTime)}</div>
          <div className="airport-name">{flight.destination}</div>
        </div>
      </div>
      



      <div className="flight-card-footer" style={{ justifyContent: 'space-between' }}>
        
        {/* اطلاعات آژانس */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>Offered by:</span>
          {flight.agencyProfileImage ? (
            <img src={flight.agencyProfileImage} alt={flight.agencyName} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1890ff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              {flight.agencyName ? flight.agencyName.charAt(0).toUpperCase() : 'A'}
            </div>
          )}
          <strong style={{ color: '#0050b3' }}>{flight.agencyName}</strong>
        </div>

        <div className="footer-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="price-section">
            <div className="price-amount" style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {formatPrice(flight.price, flight.currency)}
            </div>
          </div>
          <button onClick={handleBookClick} className="book-now-btn">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}