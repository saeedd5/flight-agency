import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Spin,
  Empty,
  DatePicker,
  Select,
  Alert,
  Row,
  Col,
  Divider,
  Typography,
} from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { searchSabreInstaFlights } from '../../../services/saberApi';
import { parseSabreFlights } from '../../../utils/parseSabreResponse';
import { popularAirports } from '../../../utils/airportCodes';
import { saberFlightToApiFormat } from '../../../utils/saberFlightMapper';
import { mapApiFlightToComponent } from '../../../utils/flightMapper';
import { getSavedFlights, removeSavedFlight, saveFlights } from '../../../utils/savedFlights';
import dayjs from 'dayjs';

const { Text } = Typography;

const Air = () => {
  const [searchParams, setSearchParams] = useState({
    from: 'JFK',
    to: 'LAX',
    departure: dayjs().add(7, 'day'),
    return: null,
  });
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState(null);
  const [savedFlights, setSavedFlights] = useState(() => getSavedFlights());

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setFlights([]);
    try {
      const response = await searchSabreInstaFlights({
        origin: searchParams.from.toUpperCase().trim().substring(0, 3),
        destination: searchParams.to.toUpperCase().trim().substring(0, 3),
        departureDate: searchParams.departure.format('YYYY-MM-DD'),
        returnDate: searchParams.return ? searchParams.return.format('YYYY-MM-DD') : null,
      });
      if (response.success && response.data) {
        const parsed = parseSabreFlights(response.data);
        setFlights(parsed);
        if (parsed.length === 0) setError('هیچ پروازی یافت نشد. لطفاً تاریخ یا مسیر را تغییر دهید.');
      } else {
        setError(response.error || 'خطا در دریافت داده از Sabre');
      }
    } catch (err) {
      setError(err.message || 'خطا در اتصال به Sabre API');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFlight = (saberFlight) => {
    const apiFormat = saberFlightToApiFormat(saberFlight);
    const mapped = mapApiFlightToComponent(apiFormat);
    const id = `saved-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const withId = { ...mapped, id };
    const current = getSavedFlights();
    const updated = [...current, withId];
    saveFlights(updated);
    setSavedFlights(updated);
    message.success('پرواز به لیست نمایش صفحه اصلی اضافه شد');
  };

  const handleRemoveSaved = (id) => {
    removeSavedFlight(id);
    setSavedFlights(getSavedFlights());
    message.success('پرواز از لیست حذف شد');
  };

  const searchColumns = [
    {
      title: 'مبدا',
      dataIndex: 'origin',
      key: 'origin',
      width: 80,
    },
    {
      title: 'مقصد',
      dataIndex: 'destination',
      key: 'destination',
      width: 80,
    },
    {
      title: 'تاریخ/زمان',
      key: 'departure',
      render: (_, r) => (
        <div>
          <div>{r.departureTime || '—'}</div>
          {r.arrivalTime && <div style={{ fontSize: '11px', color: '#666' }}>تا: {r.arrivalTime}</div>}
        </div>
      ),
    },
    {
      title: 'توقف',
      dataIndex: 'stops',
      key: 'stops',
      width: 80,
      render: (s) => (s === 0 ? <Tag color="green">مستقیم</Tag> : <Tag>{s} توقف</Tag>),
    },
    {
      title: 'ایرلاین',
      dataIndex: 'airline',
      key: 'airline',
      width: 90,
    },
    {
      title: 'قیمت',
      key: 'price',
      width: 100,
      render: (_, r) => (
        <Text strong style={{ color: '#157f43' }}>
          {r.price > 0 ? `${r.price} ${r.currency}` : '—'}
        </Text>
      ),
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleAddFlight(record)}
        >
          اضافه کردن
        </Button>
      ),
    },
  ];

  const savedColumns = [
    {
      title: 'مبدا',
      dataIndex: 'origin',
      key: 'origin',
      width: 80,
    },
    {
      title: 'مقصد',
      dataIndex: 'destination',
      key: 'destination',
      width: 80,
    },
    {
      title: 'قیمت',
      key: 'price',
      width: 100,
      render: (_, r) => (
        <Text strong>{r.price > 0 ? `${r.price} ${r.currency || 'USD'}` : '—'}</Text>
      ),
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 100,
      render: (_, r) => (
        <Button
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveSaved(r.id)}
        >
          حذف
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card title="مدیریت پروازها" extra={<Text type="secondary">داده از Sabre API • پروازهای اضافه‌شده در صفحه اصلی نمایش داده می‌شوند</Text>}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Search form */}
          <Card size="small" title="جستجوی پرواز از Sabre API">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Text strong>مبدا</Text>
                <Select
                  value={searchParams.from}
                  onChange={(v) => setSearchParams({ ...searchParams, from: v })}
                  style={{ width: '100%', marginTop: 4 }}
                  showSearch
                  optionFilterProp="label"
                  options={popularAirports.map((a) => ({ value: a.code, label: `${a.city} (${a.code})` }))}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>مقصد</Text>
                <Select
                  value={searchParams.to}
                  onChange={(v) => setSearchParams({ ...searchParams, to: v })}
                  style={{ width: '100%', marginTop: 4 }}
                  showSearch
                  optionFilterProp="label"
                  options={popularAirports.map((a) => ({ value: a.code, label: `${a.city} (${a.code})` }))}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>تاریخ رفت</Text>
                <DatePicker
                  value={searchParams.departure}
                  onChange={(d) => setSearchParams({ ...searchParams, departure: d })}
                  format="YYYY-MM-DD"
                  style={{ width: '100%', marginTop: 4 }}
                  disabledDate={(c) => c && c < dayjs().startOf('day')}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  loading={loading}
                  style={{ marginTop: 24 }}
                >
                  جستجو
                </Button>
              </Col>
            </Row>
          </Card>

          {error && (
            <Alert message="خطا" description={error} type="error" showIcon closable onClose={() => setError(null)} />
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Spin size="large" tip="در حال دریافت داده از Sabre..." />
            </div>
          )}

          {!loading && flights.length > 0 && (
            <Card size="small" title={`نتایج جستجو (${flights.length} پرواز)`}>
              <Table
                dataSource={flights}
                columns={searchColumns}
                rowKey="key"
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 700 }}
              />
            </Card>
          )}

          <Divider />

          {/* Saved flights */}
          <Card size="small" title={`پروازهای اضافه‌شده برای نمایش در صفحه اصلی (${savedFlights.length})`}>
            {savedFlights.length === 0 ? (
              <Empty
                description="هنوز پروازی اضافه نشده. از نتایج جستجو «اضافه کردن» را بزنید."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                dataSource={savedFlights}
                columns={savedColumns}
                rowKey="id"
                pagination={{ pageSize: 10, showSizeChanger: true }}
              />
            )}
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default Air;
