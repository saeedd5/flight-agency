import { useState } from 'react';
import { 
  Card, 
  Button, 
  DatePicker, 
  Space, 
  Alert, 
  Spin, 
  Typography, 
  Divider, 
  Layout, 
  ConfigProvider, 
  Select,
  Table,
  Tag,
  Row,
  Col
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import enUS from 'antd/locale/en_US';
import arEG from 'antd/locale/ar_EG';
import { useTranslation } from '../../contexts/TranslationContext';
import { searchSabreFlights, searchSabreInstaFlights } from '../../services/saberApi';
import { popularAirports } from '../../utils/airportCodes';
import dayjs from 'dayjs';
import Header from '../Header/Header';
import './SaberTest.css';

const { Title, Text } = Typography;
const { Content } = Layout;

function SaberTest() {
  const { language, direction } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [flights, setFlights] = useState([]);

  const getAntdLocale = () => {
    switch (language) {
      case 'ar':
        return arEG;
      default:
        return enUS;
    }
  };
  
  const [apiType, setApiType] = useState('instaflights');
  
  const [searchParams, setSearchParams] = useState({
    from: 'JFK',
    to: 'LAX',
    departure: dayjs().add(7, 'day'),
    return: null,
    travelers: 1
  });

  // Parse InstaFlights v1/shop/flights response (PricedItineraries - same as BFM)
  const parseInstaFlightsData = (data) => parseBargainFinderData(data);

  // Parse PricedItineraries (v1 shop/flights و BFM)
  const parseBargainFinderData = (data) => {
    const parsedFlights = [];
    let pricedItineraries = [];
    if (data?.PricedItineraries) {
      pricedItineraries = Array.isArray(data.PricedItineraries) ? data.PricedItineraries : [];
    } else if (data?.OTA_AirLowFareSearchRS?.PricedItineraries) {
      const p = data.OTA_AirLowFareSearchRS.PricedItineraries;
      pricedItineraries = Array.isArray(p?.PricedItinerary) ? p.PricedItinerary : (p?.PricedItinerary ? [p.PricedItinerary] : []);
    }
    
    pricedItineraries.forEach((itinerary, index) => {
      const airItinerary = itinerary.AirItinerary;
      const pricingInfo = itinerary.AirItineraryPricingInfo;
      const options = airItinerary?.OriginDestinationOptions?.OriginDestinationOption;
      if (!options?.length) return;
      const option = options[0];
      const segments = option.FlightSegment || [];
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];
      const totalPrice = pricingInfo?.ItinTotalFare?.TotalFare?.Amount || 0;
      const currency = pricingInfo?.ItinTotalFare?.TotalFare?.CurrencyCode || 'USD';
      parsedFlights.push({
        key: `itinerary-${index}`,
        origin: firstSegment?.DepartureAirport?.LocationCode || '',
        destination: lastSegment?.ArrivalAirport?.LocationCode || '',
        departureTime: firstSegment?.DepartureDateTime || '',
        arrivalTime: lastSegment?.ArrivalDateTime || '',
        stops: segments.length - 1,
        price: totalPrice,
        currency: currency,
        airline: firstSegment?.MarketingAirline?.Code || 'N/A',
        segments: segments.map(seg => ({
          airline: seg.MarketingAirline?.Code || '',
          flightNumber: seg.FlightNumber || '',
          origin: seg.DepartureAirport?.LocationCode || '',
          destination: seg.ArrivalAirport?.LocationCode || '',
          departure: seg.DepartureDateTime || '',
          arrival: seg.ArrivalDateTime || ''
        }))
      });
    });
    
    return parsedFlights;
  };

  const handleTestSearch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setFlights([]);

    try {
      const apiRequest = {
        origin: searchParams.from.toUpperCase().trim().substring(0, 3),
        destination: searchParams.to.toUpperCase().trim().substring(0, 3),
        departureDate: searchParams.departure.format('YYYY-MM-DD'),
        returnDate: searchParams.return ? searchParams.return.format('YYYY-MM-DD') : null,
        adultCount: parseInt(searchParams.travelers) || 1
      };

      let response;
      if (apiType === 'instaflights') {
        response = await searchSabreInstaFlights(apiRequest);
      } else {
        response = await searchSabreFlights(apiRequest);
      }

      setResult(response);
      
      if (response.success && response.data) {
        // Parse data based on API type
        let parsedFlights = [];
        if (apiType === 'instaflights') {
          parsedFlights = parseInstaFlightsData(response.data);
        } else {
          parsedFlights = parseBargainFinderData(response.data);
        }
        
        setFlights(parsedFlights);
        
        if (parsedFlights.length === 0) {
          setError('هیچ پروازی یافت نشد. لطفاً تاریخ یا مسیر را تغییر دهید.');
        }
      } else {
        const errorMsg = typeof response.error === 'object' 
          ? JSON.stringify(response.error, null, 2)
          : response.error || 'خطا در دریافت داده‌ها';
        setError(errorMsg);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'خطا در اتصال به Sabre API';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const flightColumns = [
    {
      title: 'مبدا',
      dataIndex: 'origin',
      key: 'origin',
      width: 100,
    },
    {
      title: 'مقصد',
      dataIndex: 'destination',
      key: 'destination',
      width: 100,
    },
    {
      title: 'تاریخ/زمان پرواز',
      key: 'departure',
      render: (_, record) => (
        <div>
          <div>{record.departureDate || record.departureTime || 'N/A'}</div>
          {record.arrivalTime && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              تا: {record.arrivalTime}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'توقف',
      dataIndex: 'stops',
      key: 'stops',
      width: 80,
      render: (stops) => {
        if (stops === undefined) return '-';
        return stops === 0 ? <Tag color="green">مستقیم</Tag> : <Tag>{stops} توقف</Tag>;
      },
    },
    {
      title: 'ایرلاین',
      dataIndex: 'airline',
      key: 'airline',
      width: 100,
    },
    {
      title: 'قیمت',
      key: 'price',
      width: 120,
      render: (_, record) => (
        <Text strong style={{ color: '#157f43', fontSize: '16px' }}>
          {record.price > 0 ? `${record.price} ${record.currency}` : 'N/A'}
        </Text>
      ),
    },
  ];

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
      <Layout className="app-layout">
        <Header />
        <Content className="app-content">
          <div className="saber-test-container">
            <Card>
              <Title level={2}>تست API های Sabre</Title>
              <Text type="secondary">دریافت داده‌های واقعی از Sabre API</Text>
              
              <Divider />

              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Search Form */}
                <Card title="فرم جستجو" size="small">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>نوع API:</Text>
                        <Select
                          value={apiType}
                          onChange={setApiType}
                          style={{ width: '100%' }}
                          options={[
                            { label: 'InstaFlights (ساده)', value: 'instaflights' },
                            { label: 'Bargain Finder Max (پیشرفته)', value: 'bargainfinder' }
                          ]}
                        />
                      </Space>
                    </Col>
                    
                    <Col xs={24} sm={12} md={4}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>مبدا:</Text>
                        <Select
                          value={searchParams.from}
                          onChange={(v) => setSearchParams({ ...searchParams, from: v })}
                          style={{ width: '100%' }}
                          showSearch
                          optionFilterProp="label"
                          placeholder="انتخاب مبدا"
                          options={popularAirports.map(a => ({ value: a.code, label: `${a.city} (${a.code})` }))}
                        />
                      </Space>
                    </Col>
                    
                    <Col xs={24} sm={12} md={4}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>مقصد:</Text>
                        <Select
                          value={searchParams.to}
                          onChange={(v) => setSearchParams({ ...searchParams, to: v })}
                          style={{ width: '100%' }}
                          showSearch
                          optionFilterProp="label"
                          placeholder="انتخاب مقصد"
                          options={popularAirports.map(a => ({ value: a.code, label: `${a.city} (${a.code})` }))}
                        />
                      </Space>
                    </Col>
                    
                    <Col xs={24} sm={12} md={4}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>تاریخ رفت:</Text>
                        <DatePicker
                          value={searchParams.departure}
                          onChange={(date) => setSearchParams({ ...searchParams, departure: date })}
                          format="YYYY-MM-DD"
                          style={{ width: '100%' }}
                          disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                      </Space>
                    </Col>
                    
                    <Col xs={24} sm={12} md={4}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>تاریخ برگشت:</Text>
                        <DatePicker
                          value={searchParams.return}
                          onChange={(date) => setSearchParams({ ...searchParams, return: date })}
                          format="YYYY-MM-DD"
                          style={{ width: '100%' }}
                          disabledDate={(current) => current && current < searchParams.departure}
                        />
                      </Space>
                    </Col>
                  </Row>
                  
                  <Divider />
                  
                  <Row>
                    <Col span={24}>
                      <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={handleTestSearch}
                        loading={loading}
                        size="large"
                        block
                      >
                        جستجوی پرواز از Sabre
                      </Button>
                    </Col>
                  </Row>
                </Card>

                {/* Error Display */}
                {error && (
                  <Alert
                    message="خطا"
                    description={
                      <pre style={{ 
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-word',
                        margin: 0,
                        fontSize: '12px'
                      }}>
                        {error}
                      </pre>
                    }
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                  />
                )}

                {/* Loading */}
                {loading && (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" tip="در حال دریافت داده از Sabre API..." />
                  </div>
                )}

                {/* Flights Table */}
                {!loading && flights.length > 0 && (
                  <Card title={`نتایج جستجو (${flights.length} پرواز)`}>
                    <Table
                      dataSource={flights}
                      columns={flightColumns}
                      pagination={{ pageSize: 10, showSizeChanger: true }}
                      scroll={{ x: 800 }}
                    />
                  </Card>
                )}

                {/* Raw JSON Result */}
                {result && !loading && (
                  <Card 
                    title="داده خام (JSON)" 
                    size="small"
                    extra={
                      <Button 
                        size="small" 
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'sabre-response.json';
                          a.click();
                        }}
                      >
                        دانلود JSON
                      </Button>
                    }
                  >
                    <pre style={{ 
                      background: '#f5f5f5', 
                      padding: '15px', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '400px',
                      fontSize: '11px',
                      direction: 'ltr',
                      textAlign: 'left'
                    }}>
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </Card>
                )}

                {/* No Results */}
                {!loading && result && result.success && flights.length === 0 && !error && (
                  <Alert
                    message="نتیجه‌ای یافت نشد"
                    description="لطفاً تاریخ یا مسیر را تغییر دهید و دوباره تلاش کنید."
                    type="info"
                    showIcon
                  />
                )}
              </Space>
            </Card>
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default SaberTest;
