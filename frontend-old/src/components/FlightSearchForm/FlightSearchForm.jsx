import { useForm } from 'react-hook-form';
import Button from 'antd/es/button';
import DatePicker from 'antd/es/date-picker';
import { App as AntdApp } from 'antd';
import { useTranslation } from '../../contexts/TranslationContext';
import { getAirportCode } from '../../utils/airportCodes';
import AirportSelector from '../shared/AirportSelector';
import TravelersSelector from '../TravelersSelector/TravelersSelector';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ar';
import './FlightSearchForm.css';

function FlightSearchForm({ onSearch, loading }) {
  const { message } = AntdApp.useApp();
  const { t, language, direction } = useTranslation();
  
  // Set default dates to future (tomorrow for departure, 2 months later for return)
  const tomorrow = dayjs().add(1, 'day');
  const twoMonthsLater = dayjs().add(2, 'months');
  
  const { handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      from: 'ORD',
      to: 'ATL',
      departure: tomorrow,
      return: twoMonthsLater,
      travelers: { adults: 1, children: 0, infants: 0 }
    },
    mode: 'onChange'
  });

  // Set locale for dayjs
  dayjs.locale(language === 'ar' ? 'ar' : 'en');
  
  // Disable past dates
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  const onSubmit = (data) => {
    // Get current values from watch to ensure we have latest
    const fromValue = data.from || watch('from') || '';
    const toValue = data.to || watch('to') || '';
    
    // Convert city names or codes to airport codes
    const fromCode = getAirportCode(fromValue);
    const toCode = getAirportCode(toValue);
    
    // Validation
    if (!fromCode || fromCode.length !== 3) {
      message.error({
        content: t('invalidAirportCode') || 'Please enter a valid 3-letter airport code for origin',
        duration: 3,
      });
      return;
    }
    
    if (!toCode || toCode.length !== 3) {
      message.error({
        content: t('invalidAirportCode') || 'Please enter a valid 3-letter airport code for destination',
        duration: 3,
      });
      return;
    }
    
    if (fromCode === toCode) {
      message.error({
        content: t('sameAirportError') || 'Origin and destination cannot be the same',
        duration: 3,
      });
      return;
    }
    
    if (!data.departure) {
      message.error({
        content: t('departureDateRequired') || 'Please select a departure date',
        duration: 3,
      });
      return;
    }
    
    const travelersData = data.travelers || watch('travelers') || { adults: 1, children: 0, infants: 0 };
    const totalTravelers = (travelersData.adults || 1) + (travelersData.children || 0) + (travelersData.infants || 0);
    
    const searchData = {
      ...data,
      from: fromCode,
      to: toCode,
      departure: data.departure?.format('YYYY-MM-DD'),
      return: data.return?.format('YYYY-MM-DD') || null,
      travelers: String(totalTravelers),
      travelersData: travelersData
    };
    onSearch(searchData);
  };

  return (
    <div className="search-bar" dir={direction}>
      <form className="search-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="search-field">
          <AirportSelector
            label={`${t('from')} (${t('airportCode') || 'Code'})`}
            value={watch('from')}
            onChange={(value) => setValue('from', value, { shouldValidate: true })}
            placeholder="ORD, BER, THR..."
          />
        </div>
        <div className="search-field">
          <AirportSelector
            label={`${t('to')} (${t('airportCode') || 'Code'})`}
            value={watch('to')}
            onChange={(value) => setValue('to', value, { shouldValidate: true })}
            placeholder="ATL, SFO, MHD..."
          />
        </div>
        <div className="search-field">
          <label>{t('departure')}</label>
          <DatePicker
            size="large"
            style={{ width: '100%' }}
            value={watch('departure')}
            onChange={(date) => {
              setValue('departure', date);
              // If return date is before new departure date, update it
              const returnDate = watch('return');
              if (date && returnDate && returnDate < date) {
                setValue('return', date.add(1, 'day'));
              }
            }}
            format="YYYY-MM-DD"
            disabledDate={disabledDate}
          />
        </div>
        <div className="search-field">
          <label>{t('return')}</label>
          <DatePicker
            size="large"
            style={{ width: '100%' }}
            value={watch('return')}
            onChange={(date) => setValue('return', date)}
            format="YYYY-MM-DD"
            disabledDate={(current) => {
              // Disable past dates and dates before departure date
              const departureDate = watch('departure');
              if (departureDate) {
                return current && (current < dayjs().startOf('day') || current < departureDate.startOf('day'));
              }
              return current && current < dayjs().startOf('day');
            }}
          />
        </div>
        <div className="search-field">
          <label>{t('travelers')}</label>
          <TravelersSelector
            value={watch('travelers') || { adults: 1, children: 0, infants: 0 }}
            onChange={(value) => setValue('travelers', value, { shouldValidate: true })}
          />
        </div>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={loading}
          className="search-button"
        >
          {direction === 'rtl' ? '← ' : ''}{t('search')}{direction === 'ltr' ? ' →' : ''}
        </Button>
      </form>
    </div>
  );
}

export default FlightSearchForm;

