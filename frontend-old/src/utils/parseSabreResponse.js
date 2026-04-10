//flight-agancy/frontend/src/utils/parseSabreResponse.js


/**
 * Shared parser for Sabre API responses (InstaFlights v1 + Bargain Finder v5)
 * Extracts flights from PricedItineraries structure
 */
export function parseSabreFlights(data) {
  const parsedFlights = [];
  let pricedItineraries = [];

  if (data?.PricedItineraries) {
    pricedItineraries = Array.isArray(data.PricedItineraries) ? data.PricedItineraries : [];
  } else if (data?.OTA_AirLowFareSearchRS?.PricedItineraries) {
    const p = data.OTA_AirLowFareSearchRS.PricedItineraries;
    pricedItineraries = Array.isArray(p?.PricedItinerary) ? p.PricedItinerary : (p?.PricedItinerary ? [p.PricedItinerary] : []);
  }

  pricedItineraries.forEach((itinerary, index) => {
    const airItinerary = itinerary.AirItinerary;
    const pricingInfo = itinerary.AirItineraryPricingInfo;
    const options = airItinerary?.OriginDestinationOptions?.OriginDestinationOption;
    if (!options?.length) return;
    const option = options[0];
    const segments = option.FlightSegment || [];
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];
    const totalPrice = pricingInfo?.ItinTotalFare?.TotalFare?.Amount || 0;
    const currency = pricingInfo?.ItinTotalFare?.TotalFare?.CurrencyCode || 'USD';

    // Extract BookingCount from first BookingInfo (seats available)
    let bookingCount = null;
    const ptcBreakdown = pricingInfo?.PTC_FareBreakdowns;
    if (ptcBreakdown) {
      const breakdown = Array.isArray(ptcBreakdown.PTC_FareBreakdown) ? ptcBreakdown.PTC_FareBreakdown[0] : ptcBreakdown.PTC_FareBreakdown;
      const bookingInfo = breakdown?.PassengerFare?.BookingInfo;
      if (bookingInfo) {
        const info = Array.isArray(bookingInfo) ? bookingInfo[0] : bookingInfo;
        if (info?.BookingCount != null) bookingCount = parseInt(info.BookingCount, 10);
      }
    }

    parsedFlights.push({
      key: `itinerary-${index}-${Date.now()}`,
      origin: firstSegment?.DepartureAirport?.LocationCode || '',
      destination: lastSegment?.ArrivalAirport?.LocationCode || '',
      departureTime: firstSegment?.DepartureDateTime || '',
      arrivalTime: lastSegment?.ArrivalDateTime || '',
      stops: segments.length - 1,
      price: parseFloat(totalPrice) || 0,
      currency: currency || 'USD',
      airline: firstSegment?.MarketingAirline?.Code || 'N/A',
      bookingCount: bookingCount,
      segments: segments.map((seg) => ({
        airline: seg.MarketingAirline?.Code || '',
        flightNumber: seg.FlightNumber || '',
        origin: seg.DepartureAirport?.LocationCode || '',
        destination: seg.ArrivalAirport?.LocationCode || '',
        departure: seg.DepartureDateTime || '',
        arrival: seg.ArrivalDateTime || '',
      })),
    });
  });

  return parsedFlights;
}
