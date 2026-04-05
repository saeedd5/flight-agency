// Mapping airline codes to full names
export const airlineCodeToName = {
  'UA': 'United Airlines',
  'AA': 'American Airlines',
  'DL': 'Delta Air Lines',
  'BA': 'British Airways',
  'LH': 'Lufthansa',
  'AF': 'Air France',
  'KL': 'KLM',
  'TK': 'Turkish Airlines',
  'EK': 'Emirates',
  'QR': 'Qatar Airways',
  'EY': 'Etihad Airways',
  'SQ': 'Singapore Airlines',
  'CX': 'Cathay Pacific',
  'JL': 'Japan Airlines',
  'NH': 'All Nippon Airways',
  'QF': 'Qantas',
  'CA': 'Air China',
  'MU': 'China Eastern',
  'CZ': 'China Southern',
  'AI': 'Air India',
  'SV': 'Saudia',
  'MS': 'EgyptAir',
  'PK': 'Pakistan International Airlines',
  'BG': 'Biman Bangladesh Airlines',
  'SU': 'Aeroflot',
  'IB': 'Iberia',
  'AZ': 'Alitalia',
  'SN': 'Brussels Airlines',
  'LX': 'Swiss International Air Lines',
  'OS': 'Austrian Airlines',
  'TP': 'TAP Air Portugal',
  'AY': 'Finnair',
  'SK': 'SAS',
  'LO': 'LOT Polish Airlines',
  'W6': 'Wizz Air',
  'FR': 'Ryanair',
  'U2': 'EasyJet',
  'DY': 'Norwegian Air Shuttle',
  'VS': 'Virgin Atlantic',
  '9W': 'Jet Airways',
  '6E': 'IndiGo',
  'SG': 'SpiceJet',
  'IX': 'Air India Express',
  'AI': 'Air India',
  'WY': 'Oman Air',
  'GF': 'Gulf Air',
  'FZ': 'Flydubai',
  'RJ': 'Royal Jordanian',
  'ME': 'Middle East Airlines',
  'J9': 'Jazeera Airways',
  'KU': 'Kuwait Airways',
  'PC': 'Pegasus Airlines',
  'TK': 'Turkish Airlines',
  'IR': 'Iran Air',
  'W5': 'Mahan Air',
  'EP': 'Aseman Airlines',
  'ZV': 'Iran Air Tours',
  'B9': 'Iran Airtour',
  'HH': 'Taban Air',
  'I3': 'ATA Airlines',
  'QB': 'Qeshm Air',
  'JI': 'Meraj Airlines',
  'NV': 'Karun Airlines',
  'IV': 'Caspian Airlines',
  'Y9': 'Kish Air',
  'LF': 'Chabahar Airlines',
  'V2': 'Varesh Airlines',
  'ZJ': 'Zagros Airlines',
  'NV': 'Karun Airlines',
  'YJ': 'Yas Air',
  'ZH': 'Iran Aseman Airlines'
};

/**
 * Get full airline name from code
 * @param {string} code - Airline code (e.g., 'UA', 'AA')
 * @returns {string} - Full airline name or code if not found
 */
export const getAirlineName = (code) => {
  if (!code) return null;
  const normalizedCode = code.toUpperCase().trim();
  return airlineCodeToName[normalizedCode] || normalizedCode;
};

/**
 * Get display name (full name or code)
 * @param {string} code - Airline code
 * @returns {string} - Display name (prefers full name, falls back to code)
 */
export const getAirlineDisplayName = (code) => {
  const fullName = getAirlineName(code);
  return fullName || code || 'N/A';
};

