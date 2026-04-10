import React, { useState } from 'react';
import { Layout, Spin, Alert, ConfigProvider, App as AntdApp, Input, Button, Row, Col, DatePicker } from 'antd';
import { SearchOutlined, SwapRightOutlined } from '@ant-design/icons';
import axios from 'axios';
import enUS from 'antd/es/locale/en_US';
import Header from './Header/Header';
import dayjs from 'dayjs';

const { Content } = Layout;

// --- این کامپوننت را بیرون از کامپوننت اصلی و بسیار ساده نوشتیم ---
const MarketplaceCard = ({ ticket, onBook }) => {
  let flight = {};
  let firstSegment = {};
  let lastSegment = {};
  
  try {
    flight = JSON.parse(ticket.rawFlightData);
    const segments = flight.legs || [];
    firstSegment = segments[0] || {};
    lastSegment = segments[segments.length - 1] || {};
  } catch (e) {
    return null; // اگر دیتای بلیط خراب بود رندر نکن و ارور نده
  }

  const formatTime = (time) => time ? dayjs(time).format('HH:mm') : '--:--';
  const formatDuration = (mins) => mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : '--';

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #eaeaea' }}>
      
      {/* هدر آژانس */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {ticket.agencyProfileImage ? (
            <img src={ticket.agencyProfileImage} alt="Agency" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #157f43', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#157f43', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
              {ticket.agencyName ? ticket.agencyName.charAt(0).toUpperCase() : 'A'}
            </div>
          )}
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Offered by</div>
            <strong style={{ fontSize: '16px', color: '#111' }}>{ticket.agencyName || 'Agency'}</strong>
          </div>
        </div>
      </div>

      {/* اطلاعات پرواز */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ minWidth: '120px' }}>
          <strong style={{ fontSize: '16px' }}>{flight.airline}</strong>
          <div style={{ fontSize: '13px', color: '#666' }}>Flight: {flight.flightNumber}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'center', minWidth: '250px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatTime(firstSegment.departureTime)}</div>
            <div style={{ fontSize: '16px', color: '#666' }}>{flight.origin}</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>{formatDuration(flight.travelTime || flight.totalDuration)}</div>
            <div style={{ width: '80px', height: '2px', background: '#ccc', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-4px', left: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#ccc' }}></div>
              <div style={{ position: 'absolute', top: '-4px', right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#ccc' }}></div>
            </div>
            <div style={{ fontSize: '12px', color: flight.stops === 0 ? '#157f43' : '#e63946', marginTop: '5px', fontWeight: 'bold' }}>
              {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop(s)`}
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatTime(lastSegment.arrivalTime)}</div>
            <div style={{ fontSize: '16px', color: '#666' }}>{flight.destination}</div>
          </div>
        </div>

        <div style={{ textAlign: 'right', borderLeft: '1px solid #eee', paddingLeft: '20px', minWidth: '150px' }}>
          <div style={{ fontSize: '12px', color: '#666' }}>Final Price</div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#1a1a1a', margin: '5px 0' }}>
            {Number(ticket.finalPrice).toFixed(2)} <span style={{ fontSize: '14px' }}>{ticket.currency}</span>
          </div>
          <Button type="primary" size="large" onClick={() => onBook(ticket)} style={{ width: '100%', background: '#e63946', borderColor: '#e63946', fontWeight: 'bold' }}>
            Book Ticket
          </Button>
        </div>
      </div>
    </div>
  );
};
// ----------------------------------------------------------------------------------

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // فرمت جستجو کاملاً ساده شده است (بدون نیاز به کامپوننت فرم سنگین)
  const [origin, setOrigin] = useState('ORD');
  const [destination, setDestination] = useState('ATL');
  const [date, setDate] = useState(dayjs());

  const performSearch = async () => {
    if (!origin || !destination || !date) {
      setError("Please fill all search fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const formattedDate = date.format('YYYY-MM-DD');
      
      // فراخوانی مستقیم API (بدون نیاز به Parse سنگین، دیتابیس همه کارها را کرده است)
      // توجه: در این نسخه ما فقط 50 بلیط را میگیریم تا مرورگر خفه نشود
      const response = await axios.get(`/api/flight/agency-tickets?origin=${origin}&destination=${destination}&date=${formattedDate}&page=1&pageSize=50`);

      if (response.data.success) {
        setTickets(response.data.flights); // ذخیره مستقیم
      } else {
        setError(response.data.ErrorMessage || 'Error fetching tickets');
      }
    } catch (err) {
      setError(err.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (ticket) => {
    alert(`Booking initiated for ticket from ${ticket.agencyName} at ${ticket.finalPrice} ${ticket.currency}`);
  };

  return (
    <ConfigProvider locale={enUS} theme={{ token: { colorPrimary: '#157f43' }}}>
      <AntdApp>
        <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
          <Header />
          <Content>
            
            <div style={{ background: 'linear-gradient(135deg, #157f43 0%, #0a58ca 100%)', padding: '60px 20px', textAlign: 'center', color: 'white' }}>
              <h1 style={{ fontSize: '42px', fontWeight: 'bold', margin: '0 0 15px 0', color: 'white' }}>Agency Marketplace</h1>
              <p style={{ fontSize: '20px', opacity: 0.9, margin: 0 }}>Find exclusive deals directly from trusted travel agencies.</p>
            </div>

            <div style={{ maxWidth: '900px', margin: '-40px auto 30px', background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10 }}>
              <Row gutter={16}>
                <Col xs={24} md={7}>
                  <div style={{ marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Origin</div>
                  <Input size="large" value={origin} onChange={e => setOrigin(e.target.value.toUpperCase())} placeholder="e.g. ORD" maxLength={3} />
                </Col>
                <Col xs={24} md={7}>
                  <div style={{ marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Destination</div>
                  <Input size="large" value={destination} onChange={e => setDestination(e.target.value.toUpperCase())} placeholder="e.g. ATL" maxLength={3} />
                </Col>
                <Col xs={24} md={6}>
                  <div style={{ marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Date</div>
                  <DatePicker size="large" style={{ width: '100%' }} value={date} onChange={d => setDate(d)} allowClear={false} />
                </Col>
                <Col xs={24} md={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button type="primary" size="large" block icon={<SearchOutlined />} onClick={performSearch} loading={loading} style={{ background: '#157f43', height: '40px' }}>
                    Search
                  </Button>
                </Col>
              </Row>
            </div>

            {error && (
              <div style={{ maxWidth: '900px', margin: '0 auto 20px' }}>
                <Alert message="Search Error" description={error} type="error" showIcon closable onClose={() => setError(null)} />
              </div>
            )}

            {hasSearched && (
              <div style={{ maxWidth: '900px', margin: '0 auto 50px' }}>
                
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '60px' }}><Spin size="large" tip="Searching database..." /></div>
                ) : tickets.length > 0 ? (
                  <div>
                    <h2 style={{ marginBottom: '25px', color: '#333' }}>{tickets.length} Tickets Found</h2>
                    {tickets.map(ticket => (
                      <MarketplaceCard key={ticket.id} ticket={ticket} onBook={handleBook} />
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '12px', border: '1px dashed #ddd' }}>
                    <div style={{ fontSize: '50px', marginBottom: '15px' }}>🎫</div>
                    <h2 style={{ color: '#555', margin: 0 }}>No tickets found</h2>
                    <p style={{ color: '#888', marginTop: '10px', fontSize: '16px' }}>Try changing your dates or destination.</p>
                  </div>
                )}

              </div>
            )}

          </Content>
        </Layout>
      </AntdApp>
    </ConfigProvider>
  );
}