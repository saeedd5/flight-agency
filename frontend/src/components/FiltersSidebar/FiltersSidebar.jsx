import { useState, useMemo, useEffect } from 'react';
import Radio from 'antd/es/radio';
import Slider from 'antd/es/slider';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import Button from 'antd/es/button';
import Space from 'antd/es/space';
import { useTranslation } from '../../contexts/TranslationContext';
import './FiltersSidebar.css';

const { Option } = Select;

function FiltersSidebar({ filters, onFiltersChange, flights = [] }) {
  const { t, language } = useTranslation();
  const [localFilters, setLocalFilters] = useState(filters || {
    transfers: 'all',
    priceRange: [0, 2000],
    maxTravelTime: 15,
    airline: 'all',
    alliance: 'all'
  });

  // Calculate dynamic price range from flights
  const priceRange = useMemo(() => {
    if (!flights || flights.length === 0) return [0, 2000];
    const prices = flights.map(f => f.price || 0).filter(p => p > 0);
    if (prices.length === 0) return [0, 2000];
    const min = Math.floor(Math.min(...prices) * 0.9); // 10% below min
    const max = Math.ceil(Math.max(...prices) * 1.1); // 10% above max
    return [Math.max(0, min), Math.max(200, max)];
  }, [flights]);

  // Get unique airlines from flights
  const airlines = useMemo(() => {
    if (!flights || flights.length === 0) return [];
    const airlineSet = new Set();
    flights.forEach(f => {
      if (f.airline) airlineSet.add(f.airline);
      if (f.legs) {
        f.legs.forEach(leg => {
          if (leg.airlineCode) airlineSet.add(leg.airlineCode);
        });
      }
    });
    return Array.from(airlineSet).sort();
  }, [flights]);

  // Initialize localFilters properly
  useEffect(() => {
    if (filters) {
      setLocalFilters({
        transfers: filters.transfers || 'all',
        priceRange: Array.isArray(filters.priceRange) && filters.priceRange.length === 2 
          ? filters.priceRange 
          : priceRange,
        maxTravelTime: filters.maxTravelTime || 24,
        airline: filters.airline || 'all',
        alliance: filters.alliance || 'all'
      });
    }
  }, [filters, priceRange]);

  // Update price range when flights change (only if using default)
  useEffect(() => {
    if (priceRange[1] > 0 && localFilters.priceRange && localFilters.priceRange[1] === 2000 && priceRange[1] !== 2000) {
      const newFilters = { 
        ...localFilters, 
        priceRange: priceRange 
      };
      setLocalFilters(newFilters);
      onFiltersChange?.(newFilters);
    }
  }, [priceRange[0], priceRange[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      transfers: 'all',
      priceRange: priceRange,
      maxTravelTime: 24,
      airline: 'all',
      alliance: 'all'
    };
    setLocalFilters(resetFilters);
    onFiltersChange?.(resetFilters);
  };

  return (
    <aside className="filters-sidebar">
      <div className="filters-header">
        <h2>{t('filters')}</h2>
        <Button type="link" onClick={handleReset} className="reset-btn">
          {t('reset')}
        </Button>
      </div>

      <div className="filter-section">
        <h3>{t('transfers')}</h3>
        <Radio.Group
          value={localFilters.transfers}
          onChange={(e) => handleFilterChange('transfers', e.target.value)}
        >
          <Space direction="vertical">
            <Radio value="all">{t('allFlights')}</Radio>
            <Radio value="max1">{t('max1Transfer')}</Radio>
            <Radio value="direct">{t('withoutTransfers')}</Radio>
          </Space>
        </Radio.Group>
      </div>

      <div className="filter-section">
        <h3>{t('times')}</h3>
        <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>
          {t('timeFilterNote') || 'Time filters will be applied to search results'}
        </p>
      </div>

      <div className="filter-section">
        <h3>{t('priceRange')}</h3>
        <div className="price-inputs">
          <Input
            type="number"
            placeholder={t('priceFrom')}
            value={Array.isArray(localFilters.priceRange) ? localFilters.priceRange[0] : priceRange[0]}
            onChange={(e) => {
              const currentRange = Array.isArray(localFilters.priceRange) ? localFilters.priceRange : priceRange;
              handleFilterChange('priceRange', [
                parseInt(e.target.value) || currentRange[0],
                currentRange[1]
              ]);
            }}
          />
          <Input
            type="number"
            placeholder={t('priceTo')}
            value={Array.isArray(localFilters.priceRange) ? localFilters.priceRange[1] : priceRange[1]}
            onChange={(e) => {
              const currentRange = Array.isArray(localFilters.priceRange) ? localFilters.priceRange : priceRange;
              handleFilterChange('priceRange', [
                currentRange[0],
                parseInt(e.target.value) || currentRange[1]
              ]);
            }}
          />
        </div>
        <Slider
          range
          min={priceRange[0]}
          max={priceRange[1]}
          value={Array.isArray(localFilters.priceRange) ? localFilters.priceRange : priceRange}
          onChange={(value) => handleFilterChange('priceRange', value)}
          style={{ marginTop: 10 }}
        />
      </div>

      <div className="filter-section">
        <h3>{t('maxTravelTime')}</h3>
        <Slider
          min={1}
          max={24}
          value={localFilters.maxTravelTime}
          onChange={(value) => handleFilterChange('maxTravelTime', value)}
          marks={{
            1: '1h',
            24: '24h'
          }}
        />
      </div>

      <div className="filter-section">
        <h3>
          {t('airlines')} 
          {airlines.length > 0 && <span className="filter-count">({airlines.length})</span>}
        </h3>
        <Select
          value={localFilters.airline || 'all'}
          onChange={(value) => handleFilterChange('airline', value)}
          style={{ width: '100%' }}
          showSearch
          placeholder={t('allAirlines')}
          filterOption={(input, option) =>
            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
          }
          notFoundContent={airlines.length === 0 ? t('noAirlinesFound') || 'No airlines found' : null}
        >
          <Option value="all">{t('allAirlines')}</Option>
          {airlines.length > 0 && airlines.map(airline => (
            <Option key={airline} value={airline.toLowerCase()}>
              {airline}
            </Option>
          ))}
        </Select>
        {airlines.length === 0 && (
          <p style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
            {t('noAirlinesAvailable') || 'No airlines available'}
          </p>
        )}
      </div>

      <div className="filter-section">
        <h3>{t('airlineAlliances')}</h3>
        <Select
          value={localFilters.alliance}
          onChange={(value) => handleFilterChange('alliance', value)}
          style={{ width: '100%' }}
        >
          <Option value="all">{t('allAlliances')}</Option>
          <Option value="star">Star Alliance</Option>
          <Option value="oneworld">OneWorld</Option>
        </Select>
      </div>
    </aside>
  );
}

export default FiltersSidebar;

