import { useState, useMemo, useEffect } from 'react';
import Empty from 'antd/es/empty';
import Spin from 'antd/es/spin';
import Select from 'antd/es/select';
import Typography from 'antd/es/typography';
import Pagination from 'antd/es/pagination';
import { useTranslation } from '../../contexts/TranslationContext';
import FlightCard from '../FlightCard/FlightCard';
import AgencyFlightCard from '../FlightCard/AgencyFlightCard'; // <-- ایمپورت کارت جدید
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ar';
import './ResultsArea.css';

const { Option } = Select;
const { Text } = Typography;

function ResultsArea({ flights, loading, onBook, onDateChange, hasSearched = false }) {
  const { t, language, direction } = useTranslation();
  const [sortBy, setSortBy] = useState('best');
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  dayjs.locale(language === 'ar' ? 'ar' : 'en');

  const weekDays = useMemo(() => {
    const days = [];
    const today = dayjs();
    const currentLocale = language === 'ar' ? 'ar' : 'en';
    const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    for (let i = 1; i <= 7; i++) {
      const date = today.add(i, 'day').locale(currentLocale);
      const monthNum = date.month();
      let monthName = language === 'ar' ? monthNamesAr[monthNum] : date.format('MMM');
      days.push({
        date: date,
        dateString: date.format('YYYY-MM-DD'),
        dayName: date.format('ddd'),
        dayNumber: date.date(),
        month: monthName,
        isSelected: selectedDate === date.format('YYYY-MM-DD')
      });
    }
    return days;
  }, [selectedDate, language]);

  const parseDurationToMinutes = (duration) => {
    if (!duration) return 0;
    if (typeof duration === 'number') return duration;
    const match = duration.match(/(\d+)h\s*(\d+)?m?/);
    if (!match) return 0;
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    return hours * 60 + minutes;
  };

  const sortedFlights = useMemo(() => {
    if (!flights || flights.length === 0) return [];
    
    const flightsCopy = [...flights];
    
    switch (sortBy) {
      case 'price-asc':
        return flightsCopy.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc':
        return flightsCopy.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'duration-asc':
        return flightsCopy.sort((a, b) => {
          const durationA = parseDurationToMinutes(a.totalDuration || a.travelTime);
          const durationB = parseDurationToMinutes(b.totalDuration || b.travelTime);
          return durationA - durationB;
        });
      case 'duration-desc':
        return flightsCopy.sort((a, b) => {
          const durationA = parseDurationToMinutes(a.totalDuration || a.travelTime);
          const durationB = parseDurationToMinutes(b.totalDuration || b.travelTime);
          return durationB - durationA;
        });
      case 'stops-asc':
        return flightsCopy.sort((a, b) => (a.stops || 0) - (b.stops || 0));
      case 'best':
      default:
        return flightsCopy.sort((a, b) => {
          const priceA = a.price || 0;
          const priceB = b.price || 0;
          const durationA = parseDurationToMinutes(a.totalDuration || a.travelTime);
          const durationB = parseDurationToMinutes(b.totalDuration || b.travelTime);
          const scoreA = priceA + (durationA / 60 * 10);
          const scoreB = priceB + (durationB / 60 * 10);
          return scoreA - scoreB;
        });
    }
  }, [flights, sortBy]);

  const paginatedFlights = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedFlights.slice(startIndex, startIndex + pageSize);
  }, [sortedFlights, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [flights]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="results-area">
      <div className="results-header">
        <div className="results-count">
          <Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>{flights?.length || 0}</Text>
          <Text type="secondary" style={{ fontSize: '16px', marginLeft: '6px' }}>{t('resultsFound') || 'results found'}</Text>
        </div>
        <Select
          value={sortBy}
          onChange={setSortBy}
          style={{ minWidth: 180 }}
          size="large"
        >
          <Option value="best">{t('sortBest') || 'Best Match'}</Option>
          <Option value="price-asc">{t('sortPriceLow') || 'Price: Low to High'}</Option>
          <Option value="price-desc">{t('sortPriceHigh') || 'Price: High to Low'}</Option>
          <Option value="duration-asc">{t('sortDurationShort') || 'Duration: Shortest'}</Option>
          <Option value="duration-desc">{t('sortDurationLong') || 'Duration: Longest'}</Option>
          <Option value="stops-asc">{t('sortStopsFewest') || 'Stops: Fewest'}</Option>
        </Select>
      </div>

      <div className="week-calendar-container">
        <div className="week-calendar-header">
          <Text strong style={{ fontSize: '16px', color: '#1a1a1a' }}>
            {t('nextWeek') || 'Next Week'}
          </Text>
        </div>
        <div className="week-calendar">
          {weekDays && weekDays.length > 0 ? (
            weekDays.map((day) => (
              <button
                key={day.dateString}
                className={`week-calendar-day ${day.isSelected ? 'selected' : ''}`}
                onClick={async () => {
                  setSelectedDate(day.dateString);
                  if (onDateChange && hasSearched) {
                    try {
                      await onDateChange(day.dateString);
                    } catch (error) {}
                  }
                }}
                disabled={loading || !hasSearched}
                title={!hasSearched ? (t('pleaseSearchFirst') || 'Please search first') : ''}
              >
                <div className="week-calendar-day-name">{day.dayName}</div>
                <div className="week-calendar-day-number">{day.dayNumber}</div>
                <div className="week-calendar-day-month">{day.month}</div>
              </button>
            ))
          ) : (
            <div>Loading calendar...</div>
          )}
        </div>
      </div>

      <div className="results-list">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : sortedFlights.length > 0 ? (
          <>
            {paginatedFlights.map((flight, index) => (
              // --- اینجا تنها تغییر اعمال شده است ---
        <FlightCard
                key={flight.id || `flight-${index}`}
                flight={flight}
                onBook={onBook}
              />
              
            ))}
            {sortedFlights.length > pageSize && (
              <div className="results-pagination">
                <Pagination
                  current={currentPage}
                  total={sortedFlights.length}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper={false}
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} ${t('of') || 'of'} ${total} ${t('results') || 'results'}`
                  }
                />
              </div>
            )}
          </>
        ) : (
          <Empty description={t('noFlightsFound')} />
        )}
      </div>
    </main>
  );
}

export default ResultsArea;