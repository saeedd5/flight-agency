import dayjs from 'dayjs';
import { getAirportName, getAirportCity } from './airportCodes';

/**
 * Calculate layover time between two flights (in minutes)
 */
const calculateLayover = (previousArrival, nextDeparture) => {
  if (!previousArrival || !nextDeparture) return null;
  try {
    const arrival = dayjs(previousArrival);
    const departure = dayjs(nextDeparture);
    const minutes = departure.diff(arrival, 'minute');
    return minutes > 0 ? minutes : null;
  } catch (error) {
    return null;
  }
};

/**
 * Maps API response to component-friendly format
 * Uses all backend fields: Terminal, Equipment, Segments with layovers
 */
export const mapApiFlightToComponent = (apiFlight) => {
  // API returns lowercase or PascalCase field names
  const origin = apiFlight.origin || apiFlight.Origin;
  const destination = apiFlight.destination || apiFlight.Destination;
  const departureTime = apiFlight.departureTime || apiFlight.DepartureTime;
  const arrivalTime = apiFlight.arrivalTime || apiFlight.ArrivalTime;
  const travelTime = apiFlight.travelTime || apiFlight.TravelTime;
  const flightTime = apiFlight.flightTime || apiFlight.FlightTime;
  const stops = apiFlight.stops || apiFlight.Stops || 0;
  const airline = apiFlight.airline || apiFlight.Airline;
  const price = apiFlight.price || apiFlight.Price;
  const segments = apiFlight.segments || apiFlight.Segments || [];
  
  // Create legs from segments or single flight
  const legs = [];
  
  if (segments.length > 0) {
    // Multiple segments - create a leg for each segment with full details
    segments.forEach((segment, index) => {
      const segmentOrigin = segment.origin || segment.Origin;
      const segmentDestination = segment.destination || segment.Destination;
      const segmentDeparture = segment.departureTime || segment.DepartureTime;
      const segmentArrival = segment.arrivalTime || segment.ArrivalTime;
      const segmentFlightTime = segment.flightTime || segment.FlightTime;
      const segmentCarrier = segment.carrier || segment.Carrier || airline;
      const segmentFlightNumber = segment.flightNumber || segment.FlightNumber;
      
      // Calculate layover after this segment (if not last segment)
      let layoverAfter = null;
      if (index < segments.length - 1) {
        const nextSegment = segments[index + 1];
        const nextDeparture = nextSegment.departureTime || nextSegment.DepartureTime;
        layoverAfter = calculateLayover(segmentArrival, nextDeparture);
      }
      
      // Get airport names for better display
      const originName = getAirportName(segmentOrigin) || getAirportCity(segmentOrigin) || segmentOrigin;
      const destinationName = getAirportName(segmentDestination) || getAirportCity(segmentDestination) || segmentDestination;
      
      legs.push({
        origin: segmentOrigin,
        originName: originName,
        originCity: getAirportCity(segmentOrigin) || segmentOrigin,
        destination: segmentDestination,
        destinationName: destinationName,
        destinationCity: getAirportCity(segmentDestination) || segmentDestination,
        departureTime: segmentDeparture,
        arrivalTime: segmentArrival,
        flightTime: segmentFlightTime, // Keep in minutes for calculations
        duration: formatDuration(segmentFlightTime), // Formatted string
        stops: 0, // Each segment is direct
        airlineCode: segmentCarrier,
        flightNumber: segmentFlightNumber || `${segmentCarrier}${segmentFlightNumber || ''}`,
        equipment: segment.equipment || segment.Equipment || null,
        originTerminal: segment.originTerminal || segment.OriginTerminal || null,
        destinationTerminal: segment.destinationTerminal || segment.DestinationTerminal || null,
        layoverAfter: layoverAfter,
        layoverAfterFormatted: layoverAfter ? formatDuration(layoverAfter) : null,
        stopDetails: []
      });
    });
  } else {
    // Single flight leg - use main flight data
    // Get airport names for better display
    const originName = getAirportName(origin) || getAirportCity(origin) || origin;
    const destinationName = getAirportName(destination) || getAirportCity(destination) || destination;
    
    legs.push({
      origin: origin,
      originName: originName,
      originCity: getAirportCity(origin) || origin,
      destination: destination,
      destinationName: destinationName,
      destinationCity: getAirportCity(destination) || destination,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      flightTime: flightTime || travelTime,
      duration: formatDuration(flightTime || travelTime),
      stops: stops,
      airlineCode: airline,
      flightNumber: apiFlight.flightNumber || apiFlight.FlightNumber,
      equipment: apiFlight.equipment || apiFlight.Equipment || null,
      originTerminal: apiFlight.originTerminal || apiFlight.OriginTerminal || null,
      destinationTerminal: apiFlight.destinationTerminal || apiFlight.DestinationTerminal || null,
      layoverAfter: null,
      layoverAfterFormatted: null,
      stopDetails: stops > 0 ? [] : []
    });
  }

  return {
    id: apiFlight.key || apiFlight.Key || `${airline}-${apiFlight.flightNumber || apiFlight.FlightNumber || Date.now()}`,
    price: price,
    currency: apiFlight.currency || apiFlight.Currency || 'USD',
    legs: legs,
    totalDuration: formatDuration(travelTime),
    totalDurationMinutes: travelTime, // Keep minutes for calculations
    airline: airline,
    flightNumber: apiFlight.flightNumber || apiFlight.FlightNumber,
    stops: stops,
    class: apiFlight.class || apiFlight.Class || 'Economy',
    equipment: apiFlight.equipment || apiFlight.Equipment || null,
    originTerminal: apiFlight.originTerminal || apiFlight.OriginTerminal || null,
    destinationTerminal: apiFlight.destinationTerminal || apiFlight.DestinationTerminal || null,
    // Additional fields for UI display
    origin: origin,
    destination: destination,
    baggageAllowance: apiFlight.baggageAllowance || apiFlight.BaggageAllowance || null, // Only use if provided
    mealIncluded: apiFlight.mealIncluded !== undefined ? apiFlight.mealIncluded : null, // Only use if provided
    tripType: apiFlight.tripType || apiFlight.TripType || null,
    roundTrip: apiFlight.roundTrip || apiFlight.RoundTrip || false,
    returnDate: apiFlight.returnDate || apiFlight.ReturnDate || null,
    // Real data from XML
    refundable: apiFlight.refundable !== undefined ? apiFlight.refundable : apiFlight.Refundable,
    bookingClass: apiFlight.bookingClass || apiFlight.BookingClass || null,
    bookingCount: apiFlight.bookingCount !== undefined ? apiFlight.bookingCount : apiFlight.BookingCount,
    changePenalty: apiFlight.changePenalty !== undefined ? apiFlight.changePenalty : apiFlight.ChangePenalty,
    // Additional detailed fields from XML
    distance: apiFlight.distance !== undefined ? apiFlight.distance : apiFlight.Distance,
    eTicketability: apiFlight.eTicketability || apiFlight.ETicketability || null,
    latestTicketingTime: apiFlight.latestTicketingTime || apiFlight.LatestTicketingTime || null,
    pricingMethod: apiFlight.pricingMethod || apiFlight.PricingMethod || null,
    platingCarrier: apiFlight.platingCarrier || apiFlight.PlatingCarrier || null,
    cancelPenalty: apiFlight.cancelPenalty !== undefined ? apiFlight.cancelPenalty : apiFlight.CancelPenalty,
    changePenaltyPercentage: apiFlight.changePenaltyPercentage !== undefined ? apiFlight.changePenaltyPercentage : apiFlight.ChangePenaltyPercentage,
    changePenaltyAmount: apiFlight.changePenaltyAmount !== undefined ? apiFlight.changePenaltyAmount : apiFlight.ChangePenaltyAmount,
    cancelPenaltyPercentage: apiFlight.cancelPenaltyPercentage !== undefined ? apiFlight.cancelPenaltyPercentage : apiFlight.CancelPenaltyPercentage,
    fareBasis: apiFlight.fareBasis || apiFlight.FareBasis || null,
    baggageNumberOfPieces: apiFlight.baggageNumberOfPieces !== undefined ? apiFlight.baggageNumberOfPieces : apiFlight.BaggageNumberOfPieces,
    passengerTypeCode: apiFlight.passengerTypeCode || apiFlight.PassengerTypeCode || null,
    effectiveDate: apiFlight.effectiveDate || apiFlight.EffectiveDate || null,
    notValidBefore: apiFlight.notValidBefore || apiFlight.NotValidBefore || null,
    notValidAfter: apiFlight.notValidAfter || apiFlight.NotValidAfter || null,
    negotiatedFare: apiFlight.negotiatedFare !== undefined ? apiFlight.negotiatedFare : apiFlight.NegotiatedFare,
    brandId: apiFlight.brandId || apiFlight.BrandId || null,
    brandTier: apiFlight.brandTier || apiFlight.BrandTier || null,
    changeOfPlane: apiFlight.changeOfPlane !== undefined ? apiFlight.changeOfPlane : apiFlight.ChangeOfPlane,
    participantLevel: apiFlight.participantLevel || apiFlight.ParticipantLevel || null,
    availabilitySource: apiFlight.availabilitySource || apiFlight.AvailabilitySource || null,
    totalTaxes: apiFlight.totalTaxes !== undefined ? apiFlight.totalTaxes : apiFlight.TotalTaxes,
    taxes: apiFlight.taxes || apiFlight.Taxes || null,
    // Keep original data for reference
    _original: apiFlight
  };
};

/**
 * Formats minutes to readable duration string
 */
const formatDuration = (minutes) => {
  if (!minutes) return '0h';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h${mins}m`;
};

/**
 * Maps multiple API flights
 */
export const mapApiFlightsToComponents = (apiFlights) => {
  if (!Array.isArray(apiFlights)) {
    return [];
  }
  return apiFlights.map(mapApiFlightToComponent);
};

