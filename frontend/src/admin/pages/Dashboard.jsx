import { useState, useEffect } from 'react';
import Card from 'antd/es/card';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import Table from 'antd/es/table';
import Spin from 'antd/es/spin';
import message from 'antd/es/message';
import Statistic from 'antd/es/statistic';
import Tag from 'antd/es/tag';
import Empty from 'antd/es/empty';
import {
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
  DollarOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminApi } from '../../services/adminApi';
import { useTranslation } from '../../contexts/TranslationContext';
import dayjs from 'dayjs';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const { t, language } = useTranslation();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await adminApi.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      } else {
        setError(true);
        message.error(t('errorLoadingStats'));
      }
    } catch (error) {
      setError(true);
      message.error(t('errorLoadingStats'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" tip={t('loading')} />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <Empty
          description={t('errorLoadingStats')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  const bookingColumns = [
    {
      title: t('passenger'),
      dataIndex: 'passengerName',
      key: 'passengerName',
    },
    {
      title: t('route'),
      key: 'route',
      render: (_, record) => `${record.origin} → ${record.destination}`,
    },
    {
      title: t('bookingDate'),
      dataIndex: 'bookingDate',
      key: 'bookingDate',
      render: (date) => dayjs(date).format('YYYY/MM/DD HH:mm'),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          Pending: 'orange',
          Confirmed: 'green',
          Cancelled: 'red',
          Completed: 'blue'
        };
        const labels = {
          Pending: t('pending'),
          Confirmed: t('confirmed'),
          Cancelled: t('cancelled'),
          Completed: t('completed')
        };
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
      },
    },
  ];

  const searchColumns = [
    {
      title: t('route'),
      key: 'route',
      render: (_, record) => `${record.origin} → ${record.destination}`,
    },
    {
      title: t('searchDate'),
      dataIndex: 'searchDate',
      key: 'searchDate',
      render: (date) => dayjs(date).format('YYYY/MM/DD HH:mm'),
    },
    {
      title: t('results'),
      dataIndex: 'resultCount',
      key: 'resultCount',
    },
    {
      title: t('responseTime'),
      dataIndex: 'responseTimeMs',
      key: 'responseTimeMs',
      render: (ms) => `${ms} ms`,
    },
  ];

  // Prepare chart data
  const searchKey = 'Searches';
  const searchChartData = stats?.searchesByDay 
    ? Object.entries(stats.searchesByDay).map(([date, count]) => ({
        date: dayjs(date).format('MM/DD'),
        [searchKey]: count
      }))
    : [];

  const topRoutesData = stats?.topRoutes
    ? Object.entries(stats.topRoutes).slice(0, 5).map(([route, count]) => ({
        name: route,
        value: count
      }))
    : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div>
      <h2 className="admin-page-title">{t('dashboard')}</h2>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('users')}
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('bookings')}
              value={stats?.totalBookings || 0}
              prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ fontSize: 12, marginTop: 8 }}>
              <Tag color="orange">{stats?.pendingBookings || 0} {t('pending')}</Tag>
              <Tag color="green">{stats?.confirmedBookings || 0} {t('confirmed')}</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('searches')}
              value={stats?.totalSearches || 0}
              prefix={<SearchOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ fontSize: 12, marginTop: 8, color: '#52c41a' }}>
              <RiseOutlined /> {stats?.todaySearches || 0} {t('today')}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('totalRevenue')}
              value={stats?.totalRevenue || 0}
              prefix={<DollarOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
              precision={2}
              suffix="$"
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={t('dailySearches')}>
            {searchChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={searchChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                  <Bar dataKey={searchKey} fill="#1890ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <Empty description={t('noData')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={t('popularRoutes')}>
            {topRoutesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topRoutesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {topRoutesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description={t('noData')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('recentBookings')} extra={<a href="/admin/bookings">{t('viewAll')}</a>}>
            <Table
              columns={bookingColumns}
              dataSource={stats?.recentBookings || []}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: t('noBookings') }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('recentSearches')} extra={<a href="/admin/logs">{t('viewAll')}</a>}>
            <Table
              columns={searchColumns}
              dataSource={stats?.recentSearches || []}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: t('noSearches') }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

