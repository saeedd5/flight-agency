import Select from 'antd/es/select';
import { getFlag } from '../../utils/countryFlags';
import { popularAirports } from '../../utils/airportCodes';
import { useTranslation } from '../../contexts/TranslationContext';

const { Option } = Select;

/**
 * Reusable Airport Selector Component
 * Handles airport code input with autocomplete and validation
 */
function AirportSelector({ 
  value, 
  onChange, 
  onBlur,
  placeholder = "ORD, BER, THR...",
  label,
  size = "large",
  style = { width: '100%' }
}) {
  const { t } = useTranslation();

  // Create options for autocomplete
  const airportOptions = popularAirports.map(airport => ({
    value: airport.code,
    label: `${airport.city} (${airport.code})`,
    code: airport.code,
    city: airport.city
  }));

  const handleChange = (newValue) => {
    if (onChange) {
      onChange(newValue || '');
    }
  };

  const handleSearch = (searchValue) => {
    // Allow typing directly, convert to uppercase and limit to 3 chars
    const code = searchValue.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3);
    if (code.length <= 3 && code.length > 0 && onChange) {
      onChange(code);
    }
  };

  const handleBlurEvent = () => {
    if (onBlur) {
      // Validate and ensure it's a valid code
      const code = (value || '').toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3);
      onChange(code);
      onBlur();
    }
  };

  return (
    <div className="airport-selector">
      {label && <label>{label}</label>}
      <Select
        showSearch
        size={size}
        value={value || undefined}
        placeholder={placeholder}
        style={style}
        allowClear
        optionLabelProp="value"
        filterOption={(input, option) => {
          const label = option?.label || '';
          const optionValue = option?.value || '';
          const city = option?.city || '';
          const searchValue = input.toUpperCase();
          return (
            label.toUpperCase().includes(searchValue) ||
            optionValue.toUpperCase().includes(searchValue) ||
            city.toUpperCase().includes(searchValue)
          );
        }}
        onChange={handleChange}
        onSearch={handleSearch}
        onBlur={handleBlurEvent}
        notFoundContent={null}
        popupRender={(menu) => (
          <div>
            {menu}
            <div style={{ 
              padding: '8px', 
              borderTop: '1px solid #f0f0f0', 
              fontSize: '12px', 
              color: '#999', 
              textAlign: 'center' 
            }}>
              {t('typeAirportCode') || 'Type airport code (3 letters)'}
            </div>
          </div>
        )}
        tagRender={(props) => {
          const { value: tagValue } = props;
          return (
            <span 
              className="ant-select-selection-item" 
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {getFlag(tagValue)}
              <span>{tagValue}</span>
            </span>
          );
        }}
      >
        {airportOptions.map(airport => (
          <Option 
            key={airport.code} 
            value={airport.code} 
            label={airport.label}
            city={airport.city}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>{getFlag(airport.code)}</span>
              <span style={{ fontWeight: 600, letterSpacing: '1px' }}>{airport.code}</span>
              <span style={{ color: '#999', marginLeft: '4px' }}>- {airport.city}</span>
            </div>
          </Option>
        ))}
      </Select>
    </div>
  );
}

export default AirportSelector;
