import dayjs from 'dayjs';

/**
 * Converts Sabre parsed flight format to API format expected by mapApiFlightToComponent.
 * Sabre format: { origin, destination, departureTime, arrivalTime, stops, price, currency, airline, segments }
 */
export function saberFlightToApiFormat(saberFlight) {
  const segments = saberFlight.segments || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  const origin = saberFlight.origin || firstSegment?.origin || '';
  const destination = saberFlight.destination || lastSegment?.destination || '';
  const departureTime = saberFlight.departureTime || firstSegment?.departure || '';
  const arrivalTime = saberFlight.arrivalTime || lastSegment?.arrival || '';
  const airline = saberFlight.airline || firstSegment?.airline || '';
  const stops = saberFlight.stops ?? (segments.length > 0 ? segments.length - 1 : 0);
  const price = saberFlight.price || 0;
  const currency = saberFlight.currency || 'USD';

  // Calculate travelTime in minutes
  let travelTimeMinutes = 0;
  if (departureTime && arrivalTime) {
    const dep = dayjs(departureTime);
    const arr = dayjs(arrivalTime);
    if (dep.isValid() && arr.isValid()) {
      travelTimeMinutes = arr.diff(dep, 'minute');
    }
  }
  if (travelTimeMinutes <= 0 && segments.length > 0) {
    // Fallback: sum segment durations
    segments.forEach((seg) => {
      if (seg.departure && seg.arrival) {
        const d = dayjs(seg.departure);
        const a = dayjs(seg.arrival);
        if (d.isValid() && a.isValid()) {
          travelTimeMinutes += a.diff(d, 'minute');
        }
      }
    });
  }

  const apiSegments = segments.map((seg) => {
    const dep = seg.departure || seg.departureTime;
    const arr = seg.arrival || seg.arrivalTime;
    let segMinutes = 0;
    if (dep && arr) {
      const d = dayjs(dep);
      const a = dayjs(arr);
      if (d.isValid() && a.isValid()) {
        segMinutes = a.diff(d, 'minute');
      }
    }
    return {
      origin: seg.origin,
      destination: seg.destination,
      departureTime: dep,
      arrivalTime: arr,
      flightTime: segMinutes,
      carrier: seg.airline,
      flightNumber: seg.flightNumber,
    };
  });

  const result = {
    origin,
    destination,
    departureTime,
    arrivalTime,
    travelTime: Math.max(0, travelTimeMinutes),
    stops,
    airline,
    price,
    currency,
    segments: apiSegments,
    key: saberFlight.key || `saber-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
  if (saberFlight.bookingCount != null) result.bookingCount = saberFlight.bookingCount;
  return result;
}
