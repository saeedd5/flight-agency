const STORAGE_KEY = 'savedFlights';

/**
 * Load saved flights from localStorage
 */
export function getSavedFlights() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save flights to localStorage
 */
export function saveFlights(flights) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flights));
  } catch (err) {
    console.error('Failed to save flights:', err);
  }
}

/**
 * Add a single flight to saved flights
 */
export function addSavedFlight(flight) {
  const flights = getSavedFlights();
  const id = flight.id || `saved-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const withId = { ...flight, id };
  if (flights.some((f) => f.id === id || (f.origin === flight.origin && f.destination === flight.destination && f.departureTime === flight.departureTime))) {
    return false;
  }
  flights.push(withId);
  saveFlights(flights);
  return true;
}

/**
 * Remove a flight by id
 */
export function removeSavedFlight(id) {
  const flights = getSavedFlights().filter((f) => f.id !== id);
  saveFlights(flights);
}
