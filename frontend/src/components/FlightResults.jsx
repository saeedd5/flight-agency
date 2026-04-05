import { getFlag } from '../utils/countryFlags';
import './FlightResults.css'

function FlightResults({ flights }) {
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price)
  }

  if (flights.length === 0) {
    return (
      <div className="no-flights">
        <p>No flights found</p>
      </div>
    )
  }

  return (
    <div className="flight-results">
      <h2>Search Results ({flights.length} flights)</h2>
      
      <div className="flights-list">
        {flights.map((flight, index) => (
          <div key={flight.key || index} className="flight-card">
            <div className="flight-header">
              <div className="airline-info">
                <span className="airline-code">{flight.airline}</span>
                <span className="flight-number">{flight.flightNumber}</span>
              </div>
              <div className="flight-price">
                {formatPrice(flight.price, flight.currency)}
              </div>
            </div>

            <div className="flight-route">
              <div className="route-segment">
                <div className="time-info">
                  <span className="time">{formatTime(flight.departureTime)}</span>
                  <span className="airport">
                    <span className="flag-icon">{getFlag(flight.origin)}</span>
                    <span>{flight.origin}</span>
                  </span>
                  {flight.originTerminal && (
                    <span className="terminal">Terminal {flight.originTerminal}</span>
                  )}
                </div>
                <div className="duration">
                  <div className="duration-line"></div>
                  <span>{formatDuration(flight.travelTime)}</span>
                  {flight.stops > 0 && (
                    <span className="stops">{flight.stops} stop{flight.stops > 1 ? 's' : ''}</span>
                  )}
                </div>
                <div className="time-info">
                  <span className="time">{formatTime(flight.arrivalTime)}</span>
                  <span className="airport">
                    <span className="flag-icon">{getFlag(flight.destination)}</span>
                    <span>{flight.destination}</span>
                  </span>
                  {flight.destinationTerminal && (
                    <span className="terminal">Terminal {flight.destinationTerminal}</span>
                  )}
                </div>
              </div>
            </div>

            {flight.segments && flight.segments.length > 0 && (
              <div className="flight-segments">
                <details>
                  <summary>Flight Details</summary>
                  <div className="segments-list">
                    {flight.segments.map((segment, segIndex) => (
                      <div key={segIndex} className="segment">
                        <div className="segment-info">
                          <span className="segment-carrier">
                            {segment.carrier} {segment.flightNumber}
                          </span>
                          <span className="segment-route">
                            <span className="flag-icon">{getFlag(segment.origin)}</span>
                            <span>{segment.origin}</span>
                            {' → '}
                            <span className="flag-icon">{getFlag(segment.destination)}</span>
                            <span>{segment.destination}</span>
                          </span>
                          <span className="segment-time">
                            {formatTime(segment.departureTime)} - {formatTime(segment.arrivalTime)}
                          </span>
                          {segment.equipment && (
                            <span className="segment-equipment">
                              {segment.equipment}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}

            <div className="flight-footer">
              <div className="flight-class">{flight.class}</div>
              {flight.equipment && (
                <div className="flight-equipment">Aircraft: {flight.equipment}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FlightResults

