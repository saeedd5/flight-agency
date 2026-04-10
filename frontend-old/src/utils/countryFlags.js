// Mapping cities and airports to country codes
const cityToCountry = {
  'Berlin': 'DE', 'BER': 'DE',
  'San Francisco': 'US', 'SFO': 'US',
  'New York': 'US', 'NYC': 'US', 'JFK': 'US', 'LGA': 'US', 'EWR': 'US',
  'Chicago': 'US', 'ORD': 'US', 'MDW': 'US',
  'Los Angeles': 'US', 'LAX': 'US',
  'Miami': 'US', 'MIA': 'US',
  'London': 'GB', 'LHR': 'GB', 'LGW': 'GB', 'STN': 'GB',
  'Paris': 'FR', 'CDG': 'FR', 'ORY': 'FR',
  'Tehran': 'IR', 'THR': 'IR', 'IKA': 'IR',
  'Dubai': 'AE', 'DXB': 'AE',
  'Istanbul': 'TR', 'IST': 'TR', 'SAW': 'TR',
  'Tokyo': 'JP', 'NRT': 'JP', 'HND': 'JP',
  'Sydney': 'AU', 'SYD': 'AU',
  'Frankfurt': 'DE', 'FRA': 'DE',
  'Amsterdam': 'NL', 'AMS': 'NL',
  'Rome': 'IT', 'FCO': 'IT', 'CIA': 'IT',
  'Madrid': 'ES', 'MAD': 'ES',
  'Barcelona': 'ES', 'BCN': 'ES',
  'Moscow': 'RU', 'SVO': 'RU', 'DME': 'RU',
  'Beijing': 'CN', 'PEK': 'CN', 'PKX': 'CN',
  'Shanghai': 'CN', 'PVG': 'CN', 'SHA': 'CN',
};

// Convert country code to flag emoji
const getCountryFlag = (countryCode) => {
  if (!countryCode) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

// Get flag based on city or airport code
export const getFlag = (cityOrCode) => {
  if (!cityOrCode) return '';
  const countryCode = cityToCountry[cityOrCode] || cityToCountry[cityOrCode.toUpperCase()];
  return countryCode ? getCountryFlag(countryCode) : '';
};

