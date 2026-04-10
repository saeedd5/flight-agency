import { useState, useEffect } from 'react';
import Table from 'antd/es/table';
import Tag from 'antd/es/tag';
import Space from 'antd/es/space';
import Button from 'antd/es/button';
import Select from 'antd/es/select';
import Modal from 'antd/es/modal';
import Descriptions from 'antd/es/descriptions';
import message from 'antd/es/message';
import Card from 'antd/es/card';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { adminApi } from '../../../services/adminApi';
import dayjs from 'dayjs';

const { Option } = Select;

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [statusFilter, setStatusFilter] = useState(null);
  const [detailModal, setDetailModal] = useState({ visible: false, booking: null });

  useEffect(() => {
    fetchBookings();
  }, [pagination.current, pagination.pageSize, statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getBookings(pagination.current, pagination.pageSize, statusFilter);
      
      const bookingsData = response.bookings || response.Bookings || [];
      const totalCount = response.totalCount || response.TotalCount || 0;
      
      setBookings(bookingsData);
      setPagination(prev => ({ ...prev, total: totalCount }));
    } catch (error) {
      message.error('Error fetching bookings: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await adminApi.updateBookingStatus(bookingId, { status: newStatus });
      message.success('Booking status updated');
      fetchBookings();
    } catch (error) {
      message.error('Error updating status');
    }
  };

  const showDetail = (booking) => {
    setDetailModal({ visible: true, booking });
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'orange',
      Confirmed: 'green',
      Cancelled: 'red',
      Completed: 'blue',
      Refunded: 'purple'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      Pending: 'Pending',
      Confirmed: 'Confirmed',
      Cancelled: 'Cancelled',
      Completed: 'Completed',
      Refunded: 'Refunded'
    };
    return labels[status] || status;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Passenger',
      dataIndex: 'passengerName',
      key: 'passengerName',
    },
    {
      title: 'Route',
      key: 'route',
      render: (_, record) => (
        <Space>
          <strong>{record.origin}</strong>
          <span>→</span>
          <strong>{record.destination}</strong>
        </Space>
      ),
    },
    {
      title: 'Flight Date',
      dataIndex: 'flightDate',
      key: 'flightDate',
      render: (date) => dayjs(date).format('YYYY/MM/DD'),
    },
    {
      title: 'Airline',
      dataIndex: 'airline',
      key: 'airline',
      render: (airline, record) => airline ? `${airline} - ${record.flightNumber || ''}` : '-',
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record) => (
        <strong style={{ color: '#1890ff' }}>
          {record.totalPrice?.toLocaleString()} {record.currency}
        </strong>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Booking Date',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
      render: (date) => dayjs(date).format('YYYY/MM/DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
          />
          {record.status === 'Pending' && (
            <>
              <Button
                type="text"
                style={{ color: '#52c41a' }}
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusChange(record.id, 1)} // Confirmed
              />
              <Button
                type="text"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleStatusChange(record.id, 2)} // Cancelled
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Booking Management</h2>
        <Select
          placeholder="Filter by status"
          allowClear
          style={{ width: 150 }}
          onChange={(value) => {
            setStatusFilter(value);
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
        >
          <Option value={0}>Pending</Option>
          <Option value={1}>Confirmed</Option>
          <Option value={2}>Cancelled</Option>
          <Option value={3}>Completed</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={bookings}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} bookings`,
        }}
        onChange={handleTableChange}
        locale={{ emptyText: 'No bookings found' }}
      />

      <Modal
        title="Booking Details"
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, booking: null })}
        footer={null}
        width={600}
      >
        {detailModal.booking && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Booking ID">{detailModal.booking.id}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(detailModal.booking.status)}>
                {getStatusLabel(detailModal.booking.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Passenger Name">{detailModal.booking.passengerName}</Descriptions.Item>
            <Descriptions.Item label="Email">{detailModal.booking.passengerEmail}</Descriptions.Item>
            <Descriptions.Item label="Phone">{detailModal.booking.passengerPhone || '-'}</Descriptions.Item>
            <Descriptions.Item label="Airline">{detailModal.booking.airline || '-'}</Descriptions.Item>
            <Descriptions.Item label="Flight Number">{detailModal.booking.flightNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Origin">{detailModal.booking.origin}</Descriptions.Item>
            <Descriptions.Item label="Destination">{detailModal.booking.destination}</Descriptions.Item>
            <Descriptions.Item label="Flight Date">
              {dayjs(detailModal.booking.flightDate).format('YYYY/MM/DD')}
            </Descriptions.Item>
            <Descriptions.Item label="Price">
              <strong style={{ color: '#1890ff' }}>
                {detailModal.booking.totalPrice?.toLocaleString()} {detailModal.booking.currency}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Booking Date">
              {dayjs(detailModal.booking.bookingDate).format('YYYY/MM/DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>
              {detailModal.booking.notes || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default BookingList;

