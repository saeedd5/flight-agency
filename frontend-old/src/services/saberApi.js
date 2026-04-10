//flight-agancy/frontend/src/services/sabrApi.js

import axios from 'axios';

// Use backend proxy for all Sabre API requests (secure)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function handleError(err) {
  if (err.response?.data?.error) return err.response.data.error;
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.status === 401) return 'Authentication error';
  if (err.response?.status === 400) return 'Invalid request parameters';
  if (err.request) return 'No response from server';
  return err.message || 'An error occurred';
}

/**
 * Search flights using Sabre Bargain Finder Max API (via backend proxy)
 */
export async function searchSabreFlights({ origin, destination, departureDate, returnDate, adultCount = 1 }, signal = null) {
  try {
    const body = {
      OTA_AirLowFareSearchRQ: {
        Version: "5.0.0",
        POS: { Source: [{ RequestorID: { Type: "1", ID: "1", CompanyName: { Code: "TN" } } }] },
        OriginDestinationInformation: [{
          RPH: "1",
          DepartureDateTime: departureDate || new Date().toISOString().slice(0, 10),
          OriginLocation: { LocationCode: origin },
          DestinationLocation: { LocationCode: destination }
        }],
        TravelPreferences: { ValidInterlineTicket: true },
        TravelerInfoSummary: {
          SeatsRequested: [adultCount],
          AirTravelerAvail: [{ PassengerTypeQuantity: [{ Code: "ADT", Quantity: adultCount }] }]
        },
        TPA_Extensions: { IntelliSellTransaction: { RequestType: { Name: "50ITINS" } } }
      }
    };
    
    if (returnDate) {
      body.OTA_AirLowFareSearchRQ.OriginDestinationInformation.push({
        RPH: "2", 
        DepartureDateTime: returnDate,
        OriginLocation: { LocationCode: destination },
        DestinationLocation: { LocationCode: origin }
      });
    }
    
    // Use backend proxy endpoint
    const res = await axios.post(`${API_BASE_URL}/sabre/bargainfinder`, body, {
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json' 
      },
      timeout: 60000,
      signal // Add AbortSignal support
    });
    
    return { success: true, data: res.data };
  } catch (err) {
    return { 
      success: false, 
      error: handleError(err), 
      errorDetails: err.response?.data 
    };
  }
}

/**
 * Search flights using Sabre InstaFlights API (via backend proxy)
 */
export async function searchSabreInstaFlights({ origin, destination, departureDate, returnDate }, signal = null) {
  try {
    const dep = departureDate || new Date().toISOString().slice(0, 10);
    const params = new URLSearchParams({
      origin, 
      destination,
      departuredate: dep,
      pointofsalecountry: 'US'
    });
    
    if (returnDate) {
      params.append('returndate', returnDate);
    }
    
    // Use backend proxy endpoint
    const res = await axios.get(`${API_BASE_URL}/sabre/instaflights?${params}`, {
      headers: { 'Accept': 'application/json' },
      timeout: 30000,
      signal // Add AbortSignal support
    });
    
    return { success: true, data: res.data };
  } catch (err) {
    return { 
      success: false, 
      error: handleError(err), 
      errorDetails: err.response?.data 
    };
  }
}
