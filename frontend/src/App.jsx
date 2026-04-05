import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConfigProvider from 'antd/es/config-provider';
import Layout from 'antd/es/layout';
import Spin from 'antd/es/spin';
import Alert from 'antd/es/alert';
import AntdApp from 'antd/es/app';
import enUS from 'antd/es/locale/en_US';
import arEG from 'antd/es/locale/ar_EG';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header/Header';
import { getSavedFlights } from './utils/savedFlights';
import { searchSabreInstaFlights } from './services/saberApi';
import { parseSabreFlights } from './utils/parseSabreResponse';
import { saberFlightToApiFormat } from './utils/saberFlightMapper';
import { mapApiFlightToComponent } from './utils/flightMapper';
import { validateAirportCode, validateDate } from './utils/validation';
import dayjs from 'dayjs';
import './App.css';

// Lazy load main components for better initial load
const FlightSearchForm = lazy(() => import('./components/FlightSearchForm/FlightSearchForm'));
const FiltersSidebar = lazy(() => import('./components/FiltersSidebar/FiltersSidebar'));
const ResultsArea = lazy(() => import('./components/ResultsArea/ResultsArea'));
const BookingModal = lazy(() => import('./components/BookingModal/BookingModal'));
const AdBox = lazy(() => import('./components/AdBox/AdBox'));
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'));

// Lazy load admin pages and test pages
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const Dashboard = lazy(() => import('./admin/pages/Dashboard'));
const UserList = lazy(() => import('./admin/pages/Users/UserList'));
const BookingList = lazy(() => import('./admin/pages/Bookings/BookingList'));
const SearchLogs = lazy(() => import('./admin/pages/Logs/SearchLogs'));
const Settings = lazy(() => import('./admin/pages/Settings/Settings'));
const Air = lazy(() => import('./admin/pages/Air/Air'));
const Login = lazy(() => import('./admin/pages/Login'));
const SaberTest = lazy(() => import('./components/SaberTest/SaberTest'));

const { Content } = Layout;

// Main Flight Search Page Component
function FlightSearchPage() {
  const { language, direction, t } = useTranslation();
  const [flights, setFlights] = useState([]);
  const [allFlights, setAllFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAllFlights, setLoadingAllFlights] = useState(true);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [filters, setFilters] = useState({
    transfers: 'all',
    priceRange: [0, 3000],
    maxTravelTime: 24,
    airline: 'all',
    alliance: 'all'
  });

  // Load only flights added from admin (Sabre API) - no backend mock
  useEffect(() => {
    const loadFlights = async () => {
      try {
        const saved = getSavedFlights();
        setAllFlights(saved);
      } catch (error) {
        // Silent fail - no flights to show
      } finally {
        setLoadingAllFlights(false);
      }
    };
    loadFlights();
  }, []);

  const getAntdLocale = () => {
    switch (language) {
      case 'ar':
        return arEG;
      default:
        return enUS;
    }
  };

  // AbortController for cancelling previous requests
  const abortControllerRef = useRef(null);

  // Search flights directly from Sabre API (no mock data)
  const performSearch = async (searchParams) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);
    setFlights([]);
    setHasSearched(true);

    try {
      // Validate origin airport code
      const originValidation = validateAirportCode(searchParams.from);
      if (!originValidation.valid) {
        setError(originValidation.error);
        setLoading(false);
        return;
      }
      const origin = originValidation.value;

      // Validate destination airport code
      const destinationValidation = validateAirportCode(searchParams.to);
      if (!destinationValidation.valid) {
        setError(destinationValidation.error);
        setLoading(false);
        return;
      }
      const destination = destinationValidation.value;

      // Check if origin and destination are the same
      if (origin === destination) {
        setError(t('sameAirportError') || 'Origin and destination cannot be the same');
        setLoading(false);
        return;
      }

      const departureDate = searchParams.departure
        ? (typeof searchParams.departure === 'string' ? searchParams.departure : dayjs(searchParams.departure).format('YYYY-MM-DD'))
        : dayjs().format('YYYY-MM-DD');
      let returnDate = null;
      if (searchParams.return) {
        const ret = typeof searchParams.return === 'string' ? searchParams.return : dayjs(searchParams.return).format('YYYY-MM-DD');
        if (dayjs(ret).isAfter(departureDate) || ret === departureDate) returnDate = ret;
      }

      const response = await searchSabreInstaFlights({
        origin,
        destination,
        departureDate,
        returnDate,
      }, abortController.signal);

      if (!response.success || !response.data) {
        setError(response.error || t('searchError') || 'خطا در دریافت پروازها');
        setLoading(false);
        return;
      }

      const parsed = parseSabreFlights(response.data);
      const mapped = parsed.map((f) => mapApiFlightToComponent(saberFlightToApiFormat(f)));
      const withIds = mapped.map((m, i) => ({ ...m, id: m.id || `sabre-${Date.now()}-${i}` }));
      setFlights(withIds);
    } catch (err) {
      // Don't show error if request was cancelled
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        setError(err.message || t('searchError'));
      }
    } finally {
      setLoading(false);
      // Clear abort controller reference
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleSearch = async (searchParams) => {
    const paramsToStore = {
      from: searchParams.from,
      to: searchParams.to,
      departure: searchParams.departure,
      return: searchParams.return || null,
      travelers: searchParams.travelers || '1'
    };
    setLastSearchParams(paramsToStore);
    await performSearch(searchParams);
  };

  const handleDateChange = async (newDateString) => {
    if (!lastSearchParams) {
      return;
    }

    const newDepartureDate = dayjs(newDateString);
    let returnDateValue = null;

    if (lastSearchParams.return) {
      const returnDate = typeof lastSearchParams.return === 'string' 
        ? dayjs(lastSearchParams.return) 
        : dayjs(lastSearchParams.return);
      
      if (returnDate.isValid() && returnDate.isAfter(newDepartureDate)) {
        returnDateValue = typeof lastSearchParams.return === 'string' 
          ? lastSearchParams.return 
          : returnDate.format('YYYY-MM-DD');
      }
    }

    const updatedParams = {
      from: lastSearchParams.from,
      to: lastSearchParams.to,
      departure: newDateString,
      return: returnDateValue,
      travelers: lastSearchParams.travelers || '1'
    };

    setLastSearchParams(updatedParams);
    await performSearch(updatedParams);
  };

  const applyFilters = useMemo(() => {
    const getFlightStops = (flight) => {
      if (flight.stops !== undefined && flight.stops !== null) {
        const stops = typeof flight.stops === 'number' ? flight.stops : parseInt(flight.stops) || 0;
        return Math.max(0, Math.min(stops, 5));
      }
      if (flight.legs && flight.legs.length > 0) {
        return Math.max(0, Math.min(flight.legs.length - 1, 5));
      }
      return 0;
    };

    return (flightList, currentFilters) => {
      let filtered = [...flightList];
      
      if (currentFilters.transfers === 'direct') {
        filtered = filtered.filter(f => getFlightStops(f) === 0);
      } else if (currentFilters.transfers === 'max1') {
        filtered = filtered.filter(f => getFlightStops(f) <= 1);
      }

      filtered = filtered.filter(f => {
        const price = f.price || 0;
        const minPrice = Array.isArray(currentFilters.priceRange) ? currentFilters.priceRange[0] : 0;
        const maxPrice = Array.isArray(currentFilters.priceRange) ? currentFilters.priceRange[1] : 10000;
        if (price === 0) return true;
        return price >= minPrice && price <= maxPrice;
      });

      if (currentFilters.maxTravelTime) {
        filtered = filtered.filter(f => {
          let totalMinutes = f.totalDurationMinutes || 0;
          if (totalMinutes === 0 && f.totalDuration) {
            const durationMatch = f.totalDuration.match(/(\d+)h\s*(\d+)?m?/);
            if (durationMatch) {
              const hours = parseInt(durationMatch[1]) || 0;
              const minutes = parseInt(durationMatch[2]) || 0;
              totalMinutes = hours * 60 + minutes;
            }
          }
          if (totalMinutes === 0 && f.travelTime) {
            totalMinutes = f.travelTime;
          }
          // If still 0, check legs
          if (totalMinutes === 0 && f.legs && f.legs.length > 0) {
            totalMinutes = f.legs.reduce((sum, leg) => sum + (leg.flightTime || 0), 0);
          }
          // If still 0, don't filter it out (might be missing data)
          if (totalMinutes === 0) return true;
          const hours = Math.floor(totalMinutes / 60);
          return hours <= currentFilters.maxTravelTime;
        });
      }

      if (currentFilters.airline && currentFilters.airline !== 'all') {
        filtered = filtered.filter(f => 
          f.airline?.toLowerCase().includes(currentFilters.airline.toLowerCase())
        );
      }

      return filtered;
    };
  }, []);

  const filteredFlights = useMemo(() => {
    const sourceFlights = hasSearched ? flights : allFlights;
    const filtered = applyFilters(sourceFlights, filters);
    return filtered;
  }, [flights, allFlights, filters, hasSearched, applyFilters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleBook = (flight) => {
    setSelectedFlight(flight);
    setBookingModalOpen(true);
  };

  const handleBookingConfirm = (passengerData, flight) => {
    setBookingModalOpen(false);
    setSelectedFlight(null);
  };

  const handleBookingCancel = () => {
    setBookingModalOpen(false);
    setSelectedFlight(null);
  };

  return (
    <ConfigProvider
      direction={direction}
      locale={getAntdLocale()}
      theme={{
        token: {
          colorPrimary: '#157f43',
          borderRadius: 5,
        },
      }}
    >
      <AntdApp>
        <Layout className="app-layout">
          <Header />
          <Content className="app-content">
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Spin size="large" /></div>}>
            <div className="search-form-wrapper">
              <FlightSearchForm onSearch={handleSearch} loading={loading} />
            </div>
            
            {error && (
              <div className="error-container">
                <Alert
                  message={t('errorOccurred')}
                  description={error}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setError(null)}
                  role="alert"
                />
              </div>
            )}

            {(hasSearched && (filteredFlights.length > 0 || loading)) && (
              <div className="container">
                <div className="filters-with-ad">
                  <FiltersSidebar
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    flights={flights}
                  />
                  <AdBox position="left" />
                </div>
                <div className="results-with-ad">
                  <ResultsArea
                    flights={filteredFlights}
                    loading={loading}
                    onBook={handleBook}
                    onDateChange={handleDateChange}
                    hasSearched={hasSearched}
                  />
                  <AdBox position="right" />
                </div>
              </div>
            )}

            {!hasSearched && (
              <div className="container">
                {loadingAllFlights ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <>
                    <div className="filters-with-ad">
                      <FiltersSidebar
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        flights={allFlights}
                      />
                      <AdBox position="left" />
                    </div>
                    <div className="results-with-ad">
                      <ResultsArea
                        flights={filteredFlights}
                        loading={false}
                        onBook={handleBook}
                        onDateChange={handleDateChange}
                        hasSearched={hasSearched}
                      />
                      <AdBox position="right" />
                    </div>
                  </>
                )}
              </div>
            )}

            {hasSearched && !loading && filteredFlights.length === 0 && !error && (
              <div className="empty-state">
                <div className="empty-state-icon">✈️</div>
                <p>{t('noResults')}</p>
              </div>
            )}

            <BookingModal
              flight={selectedFlight}
              open={bookingModalOpen}
              onCancel={handleBookingCancel}
              onConfirm={handleBookingConfirm}
            />
          </Suspense>
        </Content>
      </Layout>
      </AntdApp>
    </ConfigProvider>
  );
}

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh',
    background: '#f5f5f5'
  }}>
    <Spin size="large" />
  </div>
);

// Main App with Router
function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TranslationProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Main Flight Search */}
              <Route path="/" element={<FlightSearchPage />} />
              
              {/* Saber API Test Page */}
              <Route path="/saber-test" element={<SaberTest />} />
              
              {/* Admin Login */}
              <Route path="/admin/login" element={<Login />} />
              
              {/* Admin Panel (Protected) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="air" element={<Air />} />
                <Route path="users" element={<UserList />} />
                <Route path="bookings" element={<BookingList />} />
                <Route path="logs" element={<SearchLogs />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </TranslationProvider>
    </BrowserRouter>
  );
}

export default App;
