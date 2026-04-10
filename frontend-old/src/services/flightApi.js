//flight-agancy/frontend/src/services/flightApi.js


import axios from 'axios'

// Always use relative path - Vite proxy will handle routing to backend
// This avoids CORS issues and works for both localhost and external IP
const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Ensure we're using the same origin
  withCredentials: false,
  timeout: 10000 // 10 seconds timeout
})

export const searchFlights = async (searchParams) => {
  try {
    const response = await api.post('/flight/search', searchParams)
    return response.data
  } catch (error) {
    console.error('Flight search error:', error)
    if (error.response) {
      return {
        success: false,
        errorMessage: error.response.data?.errorMessage || error.response.data?.error || 'Error searching flights'
      }
    }
    return {
      success: false,
      errorMessage: 'Error connecting to server'
    }
  }
}

export const getAllFlights = async () => {
  try {
    const response = await api.get('/flight/all')
    console.log('getAllFlights response status:', response.status);
    console.log('getAllFlights response.data:', JSON.stringify(response.data).substring(0, 200));
    // Always return the data, even if success is false - let the component handle it
    return response.data
  } catch (error) {
    console.error('Get all flights error:', error)
    console.error('Get all flights error details:', JSON.stringify({
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      hasRequest: !!error.request
    }))
    
    // If we got a response, return it even if it's an error
    if (error.response && error.response.data) {
      return error.response.data
    }
    
    if (error.request) {
      // Request was made but no response received (network error, CORS, etc.)
      return {
        success: false,
        errorMessage: 'Error connecting to server - Please check your internet connection and CORS settings'
      }
    }
    return {
      success: false,
      errorMessage: 'Error connecting to server'
    }
  }
}

export default api

