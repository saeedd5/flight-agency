import { useTranslation } from '../../contexts/TranslationContext';
import { getFlag } from '../../utils/countryFlags';
import TerminalBadge from './TerminalBadge';
import dayjs from 'dayjs';
import './SegmentView.css';

function SegmentView({ segment, isFirst = false, isLast = false, compact = false }) {
  const { t, language } = useTranslation();

  const formatTime = (time) => {
    return dayjs(time).format('HH:mm');
  };

  const formatDate = (date) => {
    dayjs.locale(language === 'ar' ? 'ar' : 'en');
    return dayjs(date).format('ddd, D MMM');
  };

  // Check if dates are different (multi-day flight)
  const departureDate = dayjs(segment.departureTime);
  const arrivalDate = dayjs(segment.arrivalTime);
  const isMultiDay = !departureDate.isSame(arrivalDate, 'day');

  return (
    <div className={`segment-view-modern ${compact ? 'compact' : ''}`}>
      {/* Date header for first segment or multi-day */}
      {(isFirst || isMultiDay) && (
        <div className="segment-date-header">
          <span>{formatDate(segment.departureTime)}</span>
          {isMultiDay && (
            <span className="arrival-date">→ {formatDate(segment.arrivalTime)}</span>
          )}
        </div>
      )}

      {/* Main Route */}
      <div className="segment-route-modern">
        {/* Origin */}
        <div className="airport-box origin-box">
          <div className="airport-time-large">{formatTime(segment.departureTime)}</div>
          <div className="airport-code-large">
            <span className="flag-icon">{getFlag(segment.origin)}</span>
            <span className="code-text">{segment.origin}</span>
          </div>
          <div className="airport-city-name">
            {segment.originCity || segment.originName || segment.origin}
          </div>
          {segment.originTerminal && (
            <TerminalBadge terminal={segment.originTerminal} type="origin" />
          )}
        </div>

        {/* Flight Info Middle */}
        <div className="flight-connector">
          <div className="flight-line"></div>
          <div className="flight-middle-content">
            <div className="flight-number-box">
              {segment.airlineCode && (
                <span className="airline-code-small">{segment.airlineCode}</span>
              )}
              {segment.flightNumber && (
                <span className="flight-number-small">{segment.flightNumber}</span>
              )}
            </div>
            {segment.equipment && (
              <div className="equipment-text">{segment.equipment}</div>
            )}
            <div className="duration-text">{segment.duration}</div>
          </div>
          <div className="flight-line"></div>
        </div>

        {/* Destination */}
        <div className="airport-box destination-box">
          <div className="airport-time-large">
            {formatTime(segment.arrivalTime)}
            {isMultiDay && <span className="plus-day-badge">+1</span>}
          </div>
          <div className="airport-code-large">
            <span className="flag-icon">{getFlag(segment.destination)}</span>
            <span className="code-text">{segment.destination}</span>
          </div>
          <div className="airport-city-name">
            {segment.destinationCity || segment.destinationName || segment.destination}
          </div>
          {segment.destinationTerminal && (
            <TerminalBadge terminal={segment.destinationTerminal} type="destination" />
          )}
        </div>
      </div>
    </div>
  );
}

export default SegmentView;
