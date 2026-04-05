import { useState } from 'react';
import { useTranslation } from '../../contexts/TranslationContext';
import { getAirlineDisplayName } from '../../utils/airlineNames';
import { getAirportName, getAirportCity } from '../../utils/airportCodes';
import { getAirlineLogoUrl } from '../../utils/airlineLogo';
import dayjs from 'dayjs';
import { LuLuggage } from 'react-icons/lu';
import { MdRestaurant } from 'react-icons/md';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import SegmentView from './SegmentView';
import LayoverIndicator from './LayoverIndicator';
import './FlightCard.css';

function FlightCard({ flight, onBook }) {
  const { t, language } = useTranslation();
  const [logoError, setLogoError] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  dayjs.locale(language === 'ar' ? 'ar' : 'en');

  const formatPrice = (price, currency = 'USD') => {
    if (!price && price !== 0) return null;
    const currencySymbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'IRR': '﷼',
      'SAR': 'SAR'
    };
    const symbol = currencySymbols[currency?.toUpperCase()] || currency || '$';
    return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTime = (time) => {
    return dayjs(time).format('HH:mm');
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    if (typeof duration === 'string') {
      if (duration.includes('h') && !duration.includes(' ')) {
        return duration.replace(/(\d+h)(\d+m)/, '$1 $2');
      }
      return duration;
    }
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}h ${minutes}m`;
    }
    return duration;
  };

  const segments = flight.legs || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  if (!firstSegment) return null;

  const airlineName = getAirlineDisplayName(flight.airline);
  const airlineCode = firstSegment.airlineCode || flight.airline;
  const logoUrl = airlineCode && !logoError ? getAirlineLogoUrl(airlineCode, 50, 50) : null;
  const flightClass = flight.class || flight.cabinClass || 'Economy';
  const equipment = firstSegment.equipment || flight.equipment;
  const baggageAllowance = flight.baggageAllowance || flight.baggage;
  const hasMeal = flight.mealIncluded === undefined ? true : flight.mealIncluded !== false;
  
  // Get airport codes and full names (city preferred for route display)
  const originCode = firstSegment.origin || firstSegment.originCode || flight.origin;
  const destinationCode = lastSegment.destination || lastSegment.destinationCode || flight.destination;
  const originName = getAirportCity(originCode) || getAirportName(originCode) || firstSegment.originName || firstSegment.originCity || originCode;
  const destinationName = getAirportCity(destinationCode) || getAirportName(destinationCode) || lastSegment.destinationName || lastSegment.destinationCity || destinationCode;
  
  // Get times
  const departureTime = firstSegment.departureTime;
  const arrivalTime = lastSegment.arrivalTime;
  const duration = formatDuration(flight.totalDuration || flight.totalDurationMinutes || flight.travelTime);

  // Flight number
  const flightNumber = firstSegment.flightNumber || flight.flightNumber;

  // Stops information
  const stops = flight.stops || 0;
  const getStopsText = () => {
    if (stops === 0) return null; // Direct flights don't show stops
    if (stops === 1) return '1 stop';
    return `${stops} stops`;
  };

  // Baggage details
  let checkedBaggage = null;
  let carryOnBaggage = null;
  if (baggageAllowance) {
    if (typeof baggageAllowance === 'string') {
      const baggageStr = baggageAllowance.toLowerCase();
      const checkedMatch = baggageStr.match(/(\d+)\s*(kg|kgs?|kilograms?)\s*(checked|baggage)/i);
      const carryOnMatch = baggageStr.match(/(\d+)\s*(kg|kgs?|kilograms?)\s*(carry|hand|carry-on)/i);
      if (checkedMatch) {
        checkedBaggage = `${checkedMatch[1]}kg`;
      } else if (baggageStr.match(/\d+\s*(kg|kgs?|kilograms?)/)) {
        checkedBaggage = baggageStr.match(/\d+\s*(kg|kgs?|kilograms?)/)[0].toLowerCase();
      }
      if (carryOnMatch) {
        carryOnBaggage = `${carryOnMatch[1]}kg`;
      }
      const piecesMatch = baggageStr.match(/(\d+)\s*piece/i);
      if (piecesMatch && !checkedBaggage) {
        checkedBaggage = `${piecesMatch[1]} piece(s)`;
      }
    } else if (typeof baggageAllowance === 'object') {
      checkedBaggage = baggageAllowance.checked || baggageAllowance.checkedBaggage;
      carryOnBaggage = baggageAllowance.carryOn || baggageAllowance.carryOnBaggage;
    }
  }

  // If no checked baggage found but we have numberOfPieces
  if (!checkedBaggage && flight.baggageNumberOfPieces && flight.baggageNumberOfPieces > 0) {
    checkedBaggage = `${flight.baggageNumberOfPieces} piece(s)`;
  }

  // Extra flight info
  const originTerminal = firstSegment.originTerminal || flight.originTerminal;
  const destinationTerminal = lastSegment.destinationTerminal || flight.destinationTerminal;
  const distance = flight.distance;
  const refundable = flight.refundable;
  const eTicketability = flight.eTicketability;
  const bookingClass = flight.bookingClass;
  const fareBasis = flight.fareBasis;
  const latestTicketingTime = flight.latestTicketingTime;
  const totalTaxes = flight.totalTaxes;
  const changePenalty = flight.changePenalty;
  const changePenaltyAmount = flight.changePenaltyAmount;
  const changePenaltyPercentage = flight.changePenaltyPercentage;
  const cancelPenalty = flight.cancelPenalty;
  const cancelPenaltyPercentage = flight.cancelPenaltyPercentage;
  const platingCarrier = flight.platingCarrier;
  const pricingMethod = flight.pricingMethod;

  const handleCardClick = () => {
    if (onBook) {
      onBook(flight);
    }
  };

  return (
    <div 
      className="flight-card-new-design" 
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Top Section: Airline Name (left) | Flight Number (center) | Logo (right) */}
      <div className="flight-card-header">
        <div className="header-airline">
          <div className="airline-name">{airlineName}</div>
        </div>
        <div className="header-center">
          <div className="flight-number-display">
            {flightNumber && (
              <span className="flight-number-label">
                {t('flightNumber') || 'Flight'}: {airlineCode}{flightNumber}
              </span>
            )}
          </div>
          <div className="class-equipment">
            {flightClass} {equipment && `• ${equipment}`}
          </div>
        </div>
        <div className="header-icon">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={airlineName}
              className="airline-logo"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="gradient-circle" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Middle Section: Flight Route with Timeline */}
      <div className="flight-route-section">
        <div className="route-left">
          <div className="time-large">{departureTime ? formatTime(departureTime) : '--:--'}</div>
          <div className="airport-name">{originName}</div>
          {originCode !== originName && <div className="airport-code-small">{originCode}</div>}
          {originTerminal && <div className="terminal-text">{t('terminal') || 'Terminal'} {originTerminal}</div>}
        </div>
        
        <div className="route-middle">
          <div className="duration-above">{duration || '--'}{distance && ` • ${distance} mi`}</div>
          <div className="route-line-container">
            <div className="route-line">
              <div className="route-dot start-dot"></div>
              <div className="route-dot end-dot"></div>
            </div>
          </div>
          <div className="stops-below">{getStopsText() || t('directFlight') || 'Direct'}</div>
        </div>

        <div className="route-right">
          <div className="time-large">{arrivalTime ? formatTime(arrivalTime) : '--:--'}</div>
          <div className="airport-name">{destinationName}</div>
          {destinationCode !== destinationName && <div className="airport-code-small">{destinationCode}</div>}
          {destinationTerminal && <div className="terminal-text">{t('terminal') || 'Terminal'} {destinationTerminal}</div>}
        </div>
      </div>

      {/* Bottom Section: Price, Button, and Info */}
      <div className="flight-card-footer">
        <div className="footer-left">
          {/* Baggage and Meal Info */}
          <div className="info-buttons">
            {checkedBaggage && (
              <div className="info-button">
                <LuLuggage className="info-icon" />
                <span>{checkedBaggage}</span>
              </div>
            )}
            {hasMeal && (
              <div className="info-button">
                <MdRestaurant className="info-icon" />
                <span>{t('mealIncluded') || 'Meal included'}</span>
              </div>
            )}
            {refundable === true && (
              <div className="info-button info-badge-green">
                <span>{t('refundable') || 'Refundable'}</span>
              </div>
            )}
            {eTicketability === 'Yes' && (
              <div className="info-button info-badge-blue">
                <span>eTicket</span>
              </div>
            )}
            {fareBasis && (
              <div className="info-button">
                <span>{t('fareBasis') || 'Fare'}: {fareBasis}</span>
              </div>
            )}
          </div>
        </div>

        <div className="footer-right">
          <div className="price-section">
            <div className="price-amount">
              {flight.price ? formatPrice(flight.price, flight.currency) : '--'} / {t('pax') || 'pax'}
            </div>
            {(flight.bookingCount !== undefined && flight.bookingCount !== null && flight.bookingCount > 0) && (
              <div className="seats-available">
                {t('seatsAvailable') || 'Seats available'}: {flight.bookingCount}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expand/Collapse Details */}
      <div
        className="details-toggle"
        onClick={(e) => { e.stopPropagation(); setDetailsExpanded(!detailsExpanded); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDetailsExpanded(!detailsExpanded); } }}
      >
        {detailsExpanded ? (
          <><UpOutlined /> {t('lessDetails') || 'Less details'}</>
        ) : (
          <><DownOutlined /> {t('moreDetails') || 'More details'}</>
        )}
      </div>

      {/* Expandable Details Panel */}
      {detailsExpanded && (
        <div className="flight-details-panel" onClick={(e) => e.stopPropagation()}>
          {/* Segment details (multi-leg) */}
          {segments.length > 0 && (
            <div className="details-section">
              <h4 className="details-section-title">{t('flightDetails') || 'Flight details'}</h4>
              <div className="segments-list">
                {segments.map((seg, idx) => (
                  <div key={idx}>
                    <SegmentView segment={seg} isFirst={idx === 0} isLast={idx === segments.length - 1} compact />
                    {idx < segments.length - 1 && seg.layoverAfter != null && (
                      <LayoverIndicator layoverMinutes={seg.layoverAfter} airport={seg.destination} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fare & policies */}
          <div className="details-section details-grid">
            {bookingClass && (
              <div className="detail-row">
                <span className="detail-label">{t('bookingClass') || 'Booking class'}</span>
                <span className="detail-value">{bookingClass}</span>
              </div>
            )}
            {pricingMethod && (
              <div className="detail-row">
                <span className="detail-label">{t('pricingMethod') || 'Pricing method'}</span>
                <span className="detail-value">{pricingMethod}</span>
              </div>
            )}
            {platingCarrier && (
              <div className="detail-row">
                <span className="detail-label">{t('platingCarrier') || 'Issuing airline'}</span>
                <span className="detail-value">{platingCarrier}</span>
              </div>
            )}
            {latestTicketingTime && (
              <div className="detail-row">
                <span className="detail-label">{t('latestTicketingTime') || 'Latest ticketing'}</span>
                <span className="detail-value">{dayjs(latestTicketingTime).format('YYYY-MM-DD HH:mm')}</span>
              </div>
            )}
            {distance != null && (
              <div className="detail-row">
                <span className="detail-label">{t('distance') || 'Distance'}</span>
                <span className="detail-value">{distance} mi</span>
              </div>
            )}
            {totalTaxes != null && totalTaxes > 0 && (
              <div className="detail-row">
                <span className="detail-label">{t('taxes') || 'Taxes & fees'}</span>
                <span className="detail-value">{formatPrice(totalTaxes, flight.currency)}</span>
              </div>
            )}
            {changePenalty && (
              <div className="detail-row">
                <span className="detail-label">{t('changePenalty') || 'Change penalty'}</span>
                <span className="detail-value">
                  {changePenaltyAmount != null ? formatPrice(changePenaltyAmount, flight.currency) : ''}
                  {changePenaltyPercentage != null && ` (${changePenaltyPercentage}%)`}
                </span>
              </div>
            )}
            {cancelPenalty && cancelPenaltyPercentage != null && (
              <div className="detail-row">
                <span className="detail-label">{t('cancelPenalty') || 'Cancel penalty'}</span>
                <span className="detail-value">{cancelPenaltyPercentage}%</span>
              </div>
            )}
            {refundable === false && (
              <div className="detail-row">
                <span className="detail-label">{t('refundable') || 'Refundable'}</span>
                <span className="detail-value detail-warning">{t('nonRefundable') || 'Non-refundable'}</span>
              </div>
            )}
          </div>

          {/* Taxes breakdown (if available) */}
          {flight.taxes && Array.isArray(flight.taxes) && flight.taxes.length > 0 && (
            <div className="details-section">
              <h4 className="details-section-title">{t('taxBreakdown') || 'Tax breakdown'}</h4>
              <div className="tax-list">
                {flight.taxes.map((tax, idx) => (
                  <div key={idx} className="tax-row">
                    <span>{tax.category || tax.Category || 'Tax'}</span>
                    <span>{formatPrice(tax.amount || tax.Amount, tax.currency || tax.Currency || flight.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FlightCard;
