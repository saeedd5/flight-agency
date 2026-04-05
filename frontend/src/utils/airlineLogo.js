/**
 * Get airline logo URL by IATA code.
 * Uses pics.avs.io - free CDN for airline logos (no API key required).
 * @param {string} iataCode - 2-letter IATA airline code (e.g. 'DL', 'UA')
 * @param {number} width - Logo width in pixels (default 80)
 * @param {number} height - Logo height in pixels (default 80)
 * @returns {string} Logo URL or null if invalid code
 */
export function getAirlineLogoUrl(iataCode, width = 80, height = 80) {
  if (!iataCode || typeof iataCode !== 'string') return null;
  const code = iataCode.toUpperCase().trim();
  if (code.length < 2) return null;
  return `https://pics.avs.io/${width}/${height}/${code}.png`;
}
