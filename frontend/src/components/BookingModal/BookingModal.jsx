import { useState } from 'react';
import Modal from 'antd/es/modal';
import Button from 'antd/es/button';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import Space from 'antd/es/space';
import Typography from 'antd/es/typography';
import Divider from 'antd/es/divider';
import { App as AntdApp } from 'antd';
import { useTranslation } from '../../contexts/TranslationContext';
import { getAirlineDisplayName } from '../../utils/airlineNames';
import { validateBookingForm } from '../../utils/validation';
import dayjs from 'dayjs';
import './BookingModal.css';

const { Option } = Select;
const { Text, Title } = Typography;

function BookingModal({ flight, open, onCancel, onConfirm }) {
  const { message } = AntdApp.useApp();
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  dayjs.locale(language === 'ar' ? 'ar' : 'en');

  const formatPrice = (price, currency = 'USD') => {
    if (!price) return 'N/A';
    const currencySymbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'IRR': '﷼',
      'SAR': 'SAR'
    };
    const symbol = currencySymbols[currency?.toUpperCase()] || currency || '$';
    return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const formatTime = (time) => {
    return dayjs(time).format('HH:mm');
  };

  const formatDate = (time) => {
    return dayjs(time).format('YYYY-MM-DD');
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Validate form data
      const validation = validateBookingForm(values);
      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0];
        message.error(firstError);
        setLoading(false);
        return;
      }

      const segments = flight.legs || [];
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];
      
      // Use sanitized data
      const sanitized = validation.sanitized;
      const bookingData = {
        flightKey: flight.id || flight.key || `flight-${Date.now()}`,
        passengerName: `${sanitized.firstName} ${sanitized.lastName}`,
        passengerEmail: sanitized.email,
        passengerPhone: sanitized.phone,
        passengerPassport: sanitized.passport || null,
        origin: firstSegment?.origin || flight.origin || 'N/A',
        destination: lastSegment?.destination || flight.destination || 'N/A',
        flightDate: firstSegment?.departureTime || new Date().toISOString(),
        airline: flight.airline || 'N/A',
        flightNumber: flight.flightNumber || firstSegment?.flightNumber || null,
        totalPrice: flight.price || 0,
        currency: flight.currency || 'USD'
      };

      console.log('Sending booking data:', bookingData);

      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Booking API error:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const result = await response.json();
      
      message.success(t('bookingSuccessful') || 'Booking successful!');
      onConfirm?.(values, flight);
      form.resetFields();
    } catch (error) {
      message.error(t('bookingError') || 'Error booking flight');
    } finally {
      setLoading(false);
    }
  };

  if (!flight) return null;

  const segments = flight.legs || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const airlineName = getAirlineDisplayName(flight.airline);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      className="booking-modal"
      title={
        <Title level={4} style={{ margin: 0 }}>
          {t('bookFlight') || 'Book Flight'}
        </Title>
      }
    >
      <div className="booking-content">
        {/* Flight Summary */}
        <div className="booking-flight-summary">
          <div className="flight-summary-header">
            <div className="flight-route">
              <div className="route-item">
                <Text strong>{firstSegment?.originCity || firstSegment?.originName || firstSegment?.origin}</Text>
                <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                  {firstSegment?.origin} • {firstSegment?.originTerminal ? `T${firstSegment.originTerminal}` : ''}
                </Text>
              </div>
              <div className="route-arrow">→</div>
              <div className="route-item">
                <Text strong>{lastSegment?.destinationCity || lastSegment?.destinationName || lastSegment?.destination}</Text>
                <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                  {lastSegment?.destination} • {lastSegment?.destinationTerminal ? `T${lastSegment.destinationTerminal}` : ''}
                </Text>
              </div>
            </div>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          <div className="flight-details-grid">
            <div className="detail-item">
              <Text type="secondary" style={{ fontSize: '12px' }}>{t('departure') || 'Departure'}</Text>
              <Text strong>{formatDate(firstSegment?.departureTime)}</Text>
              <Text>{formatTime(firstSegment?.departureTime)}</Text>
            </div>
            <div className="detail-item">
              <Text type="secondary" style={{ fontSize: '12px' }}>{t('arrival') || 'Arrival'}</Text>
              <Text strong>{formatDate(lastSegment?.arrivalTime)}</Text>
              <Text>{formatTime(lastSegment?.arrivalTime)}</Text>
            </div>
            <div className="detail-item">
              <Text type="secondary" style={{ fontSize: '12px' }}>{t('duration') || 'Duration'}</Text>
              <Text strong>{flight.totalDuration}</Text>
            </div>
            <div className="detail-item">
              <Text type="secondary" style={{ fontSize: '12px' }}>{t('airline') || 'Airline'}</Text>
              <Text strong>{airlineName}</Text>
            </div>
            {flight.stops > 0 && (
              <div className="detail-item">
                <Text type="secondary" style={{ fontSize: '12px' }}>{t('stops') || 'Stops'}</Text>
                <Text strong>{flight.stops} {t('stop') || 'stop'}</Text>
              </div>
            )}
          </div>

          <Divider style={{ margin: '16px 0' }} />

          <div className="price-summary">
            <div className="price-row">
              <Text>{t('flightPrice') || 'Flight Price'}</Text>
              <Text strong style={{ fontSize: '16px' }}>
                {formatPrice(flight.price, flight.currency)}
              </Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div className="price-row total">
              <Text strong style={{ fontSize: '18px' }}>{t('total') || 'Total'}</Text>
              <Text strong style={{ fontSize: '20px', color: '#157f43' }}>
                {formatPrice(flight.price, flight.currency)}
              </Text>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="booking-form"
        >
          <Title level={5}>{t('passengerInformation') || 'Passenger Information'}</Title>
          
          <Form.Item
            name="firstName"
            label={t('firstName') || 'First Name'}
            rules={[{ required: true, message: t('firstNameRequired') || 'Please enter your first name' }]}
          >
            <Input size="large" placeholder={t('enterFirstName') || 'First Name'} />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={t('lastName') || 'Last Name'}
            rules={[{ required: true, message: t('lastNameRequired') || 'Please enter your last name' }]}
          >
            <Input size="large" placeholder={t('enterLastName') || 'Last Name'} />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('email') || 'Email'}
            rules={[
              { required: true, message: t('emailRequired') || 'Please enter your email' },
              { type: 'email', message: t('emailInvalid') || 'Invalid email address' }
            ]}
          >
            <Input size="large" type="email" placeholder={t('enterEmail') || 'email@example.com'} />
          </Form.Item>

          <Form.Item
            name="phone"
            label={t('phone') || 'Phone'}
            rules={[{ required: true, message: t('phoneRequired') || 'Please enter your phone number' }]}
          >
            <Input size="large" placeholder={t('enterPhone') || '+98 912 345 6789'} />
          </Form.Item>

          <Divider />

          <div className="booking-actions">
            <Button onClick={onCancel} size="large">
              {t('cancel') || 'Cancel'}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="confirm-booking-btn"
            >
              {t('confirmBooking') || 'Confirm Booking'}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}

export default BookingModal;

