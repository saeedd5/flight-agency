// Mapping cities to airport codes
export const cityToAirportCode = {
  // Cities
  'Berlin': 'BER',
  'San Francisco': 'SFO',
  'New York': 'JFK',
  'Chicago': 'ORD',
  'Los Angeles': 'LAX',
  'Miami': 'MIA',
  'London': 'LHR',
  'Paris': 'CDG',
  'Tehran': 'THR',
  'Mashhad': 'MHD',
  'Baghdad': 'BGW',
  'Erbil': 'EBL',
  'Basra': 'BSR',
  'Najaf': 'NJF',
  'Sulaymaniyah': 'ISU',
  'Dubai': 'DXB',
  'Istanbul': 'IST',
  'Tokyo': 'NRT',
  'Sydney': 'SYD',
  'Frankfurt': 'FRA',
  'Amsterdam': 'AMS',
  'Rome': 'FCO',
  'Madrid': 'MAD',
  'Barcelona': 'BCN',
  'Moscow': 'SVO',
  'Beijing': 'PEK',
  'Shanghai': 'PVG',
  'Atlanta': 'ATL',
  'Toronto': 'YYZ',
  
  // Airport codes (to keep themselves)
  'BER': 'BER', 'SFO': 'SFO', 'JFK': 'JFK', 'ORD': 'ORD',
  'LAX': 'LAX', 'MIA': 'MIA', 'LHR': 'LHR', 'CDG': 'CDG',
  'THR': 'THR', 'MHD': 'MHD', 'BGW': 'BGW', 'EBL': 'EBL', 'BSR': 'BSR', 'NJF': 'NJF', 'ISU': 'ISU', 'DXB': 'DXB', 'IST': 'IST',
  'NRT': 'NRT', 'SYD': 'SYD', 'FRA': 'FRA', 'AMS': 'AMS',
  'FCO': 'FCO', 'MAD': 'MAD', 'BCN': 'BCN', 'SVO': 'SVO',
  'PEK': 'PEK', 'PVG': 'PVG', 'ATL': 'ATL', 'YYZ': 'YYZ',
  'IKA': 'IKA', 'EWR': 'EWR', 'LGA': 'LGA', 'MDW': 'MDW'
};

// Convert city or code to airport code
export const getAirportCode = (input) => {
  if (!input) return '';
  const normalized = input.trim();
  // If already an airport code (3 letters)
  if (/^[A-Z]{3}$/i.test(normalized)) {
    return normalized.toUpperCase();
  }
  // Convert city to code
  const code = cityToAirportCode[normalized] || cityToAirportCode[normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()];
  return code || normalized.toUpperCase();
};

// List of cities and codes for autocomplete
export const popularAirports = [
  { city: 'Berlin', code: 'BER', country: 'Germany', airportName: 'Berlin Brandenburg Airport' },
  { city: 'San Francisco', code: 'SFO', country: 'USA', airportName: 'San Francisco International Airport' },
  { city: 'Chicago', code: 'ORD', country: 'USA', airportName: 'Chicago O\'Hare International Airport' },
  { city: 'Atlanta', code: 'ATL', country: 'USA', airportName: 'Hartsfield-Jackson Atlanta International Airport' },
  { city: 'New York', code: 'JFK', country: 'USA', airportName: 'John F. Kennedy International Airport' },
  { city: 'Tehran', code: 'THR', country: 'Iran', airportName: 'Mehrabad Airport' },
  { city: 'Mashhad', code: 'MHD', country: 'Iran', airportName: 'Mashhad International Airport' },
  { city: 'Baghdad', code: 'BGW', country: 'Iraq', airportName: 'Baghdad International Airport' },
  { city: 'Erbil', code: 'EBL', country: 'Iraq', airportName: 'Erbil International Airport' },
  { city: 'Basra', code: 'BSR', country: 'Iraq', airportName: 'Basra International Airport' },
  { city: 'Najaf', code: 'NJF', country: 'Iraq', airportName: 'Al Najaf International Airport' },
  { city: 'Sulaymaniyah', code: 'ISU', country: 'Iraq', airportName: 'Sulaymaniyah International Airport' },
  { city: 'London', code: 'LHR', country: 'UK', airportName: 'London Heathrow Airport' },
  { city: 'Paris', code: 'CDG', country: 'France', airportName: 'Charles de Gaulle Airport' },
  { city: 'Dubai', code: 'DXB', country: 'UAE', airportName: 'Dubai International Airport' },
  { city: 'Istanbul', code: 'IST', country: 'Turkey', airportName: 'Istanbul Airport' },
  { city: 'Tokyo', code: 'NRT', country: 'Japan', airportName: 'Narita International Airport' },
  { city: 'Frankfurt', code: 'FRA', country: 'Germany', airportName: 'Frankfurt Airport' },
  { city: 'Amsterdam', code: 'AMS', country: 'Netherlands', airportName: 'Amsterdam Airport Schiphol' },
  { city: 'Los Angeles', code: 'LAX', country: 'USA', airportName: 'Los Angeles International Airport' },
  { city: 'Miami', code: 'MIA', country: 'USA', airportName: 'Miami International Airport' },
  { city: 'Rome', code: 'FCO', country: 'Italy', airportName: 'Leonardo da Vinci Airport' },
  { city: 'Madrid', code: 'MAD', country: 'Spain', airportName: 'Adolfo Suárez Madrid–Barajas Airport' },
  { city: 'Barcelona', code: 'BCN', country: 'Spain', airportName: 'Barcelona–El Prat Airport' },
  { city: 'Moscow', code: 'SVO', country: 'Russia', airportName: 'Sheremetyevo Airport' },
  { city: 'Beijing', code: 'PEK', country: 'China', airportName: 'Beijing Capital International Airport' },
  { city: 'Shanghai', code: 'PVG', country: 'China', airportName: 'Shanghai Pudong International Airport' },
  { city: 'Toronto', code: 'YYZ', country: 'Canada', airportName: 'Toronto Pearson International Airport' },
  { city: 'Sydney', code: 'SYD', country: 'Australia', airportName: 'Sydney Kingsford Smith Airport' }
];

// Complete mapping of airport code to airport name and city
export const airportCodeToName = {};
export const airportCodeToCity = {};
export const airportCodeToCountry = {};

popularAirports.forEach(airport => {
  airportCodeToName[airport.code] = airport.airportName;
  airportCodeToCity[airport.code] = airport.city;
  airportCodeToCountry[airport.code] = airport.country;
});

// Function to get airport name from code
export const getAirportName = (code) => {
  if (!code) return null;
  const normalizedCode = code.toUpperCase().trim();
  return airportCodeToName[normalizedCode] || airportCodeToCity[normalizedCode] || null;
};

// Function to get city from airport code
export const getAirportCity = (code) => {
  if (!code) return null;
  const normalizedCode = code.toUpperCase().trim();
  return airportCodeToCity[normalizedCode] || null;
};

// Function to get country from airport code
export const getAirportCountry = (code) => {
  if (!code) return null;
  const normalizedCode = code.toUpperCase().trim();
  return airportCodeToCountry[normalizedCode] || null;
};

