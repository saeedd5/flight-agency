import React, { useEffect, useState } from 'react';
import { Table, Spin, message, Tabs, Form, Input, Button, Upload, Avatar, Tag, Divider, Row, Col } from 'antd'; 
import { UserOutlined, UploadOutlined, PhoneOutlined, MailOutlined, IdcardOutlined, BankOutlined } from '@ant-design/icons';

// --- اصلاح آدرس‌ها (چون حالا در پوشه components هستیم، یک پوشه به عقب برمی‌گردیم) ---
import { getMyAgencyFlights, getAgencyProfile, updateAgencyProfile } from '../services/agencyApi';
import Header from './Header/Header'; // هدر در کنار همین فایل (داخل یک پوشه) قرار دارد
// ----------------------------------------------------------------------------------

// تابع کمکی برای تبدیل فایل به Base64
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });


export default function AgencyPanel() {
  const [flights, setFlights] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(true);

  const [profileForm] = Form.useForm();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [imageUrl, setImageUrl] = useState(null); // فقط برای نمایش عکس (چه قدیمی و چه جدید)
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const response = await getMyAgencyFlights();
        if (response.success) setFlights(response.flights);
      } catch (error) {
        message.error("خطا در دریافت لیست بلیط‌ها");
      } finally {
        setLoadingFlights(false);
      }
    };
    fetchFlights();
  }, []);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await getAgencyProfile();
      if (response.success) {
        profileForm.setFieldsValue({
          name: response.profile.name,
          username: response.profile.username,
          email: response.profile.email,
          phone: response.profile.phone,
        });
        setImageUrl(response.profile.profileImageUrl); // عکس ذخیره شده را نمایش بده
        setUserRoles(response.profile.roles || []);
      }
    } catch (error) {
      message.error("خطا در دریافت اطلاعات پروفایل. لطفاً صفحه را رفرش کنید.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleTabChange = (key) => {
    if (key === 'profile') fetchProfile();
  };

  // --- مکانیزم جدید و حرفه‌ای آپلود عکس ---
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    // اگر هر دو شرط درست بود، اجازه آپلود (و در نتیجه پیش‌نمایش) داده میشود
    if (isJpgOrPng && isLt2M) {
      // تبدیل فایل به Base64 برای پیش‌نمایش فوری
      getBase64(file).then(url => {
        setImageUrl(url); // این خط باعث پیش‌نمایش زنده عکس می‌شود
      });
    }
    return false; // این خط جلوی آپلود خودکار توسط Ant Design را می‌گیرد
  };
  // ------------------------------------------

  const handleSaveProfile = async (values) => {
    setSavingProfile(true);
    try {
      // داده‌هایی که به بک‌اند ارسال می‌شوند
      const dataToSave = {
        name: values.name,
        username: values.username,
        phone: values.phone, // این فیلد غیرفعال است، اما مقدارش را می‌فرستیم
        email: values.email,
        profileImageUrl: imageUrl // رشته Base64 عکس جدید یا آدرس عکس قدیمی
      };
      
      const response = await updateAgencyProfile(dataToSave);
      if (response.success) {
        message.success('پروفایل شما با موفقیت بروزرسانی شد.');
      }
    } catch (error) {
      message.error(error.message || 'خطا در ذخیره اطلاعات. نام کاربری ممکن است تکراری باشد.');
    } finally {
      setSavingProfile(false);
    }
  };

const columns = [
    { title: 'Airline', dataIndex: 'airline', key: 'airline' },
    { title: 'Origin', dataIndex: 'origin', key: 'origin' },
    { title: 'Destination', dataIndex: 'destination', key: 'destination' },
    { 
      // ستون جدید: نمایش تاریخ و ساعت پرواز
      title: 'Flight Date', 
      dataIndex: 'departureTime', 
      key: 'departureTime',
      render: (date) => {
        if (!date) return '-';
        const d = new Date(date);
        return (
          <div style={{ fontSize: '13px' }}>
            <strong style={{ color: '#333' }}>{d.toLocaleDateString()}</strong><br/>
            <span style={{ color: '#888' }}>{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      }
    },
    { 
      title: 'Base Price', 
      render: (r) => `${Number(r.basePrice).toFixed(2)} ${r.currency}` 
    },
    { 
      title: 'Markup (%)', 
      dataIndex: 'markupPercentage', 
      render: (val) => <span style={{color: '#1890ff', fontWeight: 'bold'}}>+{val}%</span> 
    },
    { 
      title: 'Final Price', 
      render: (r) => <span style={{color: '#157f43', fontWeight: 'bold', fontSize: '16px'}}>{Number(r.finalPrice).toFixed(2)} {r.currency}</span> 
    },
  ];




  

  const ticketsTab = (
    <div>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>My Marked-up Tickets</h3>
      <Table dataSource={flights} columns={columns} loading={loadingFlights} rowKey="id" pagination={{ pageSize: 10 }} />
    </div>
  );

  const profileTab = (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 0' }}>
      {loadingProfile ? (
        <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
      ) : (
        <Form form={profileForm} layout="vertical" onFinish={handleSaveProfile} size="large">
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
            <Upload
              name="avatar"
              listType="picture-circle" // این حالت دایره‌ای زیبا برای آپلود است
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload} // تابع جدید ما
            >
              {imageUrl ? (
                // اگر عکسی وجود دارد (چه از سرور، چه تازه آپلود شده)، آن را نشان بده
                <Avatar size={120} src={imageUrl} />
              ) : (
                // اگر عکسی نیست، دکمه آپلود را نشان بده
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload Logo</div>
                </div>
              )}
            </Upload>
            
            <div style={{ marginTop: '15px' }}>
              <strong>Your Roles: </strong>
              {userRoles.map(role => (
                <Tag key={role} color={role === 'Agency' ? 'green' : 'blue'}>{role}</Tag>
              ))}
            </div>
          </div>

          <Divider>General Information</Divider>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item label="Agency Name (Business Name)" name="name" rules={[{ required: true, message: 'Agency name is required!' }]}>
                <Input prefix={<BankOutlined style={{color: '#bfbfbf'}}/>} placeholder="e.g. Skyline Travels" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Username is required!' }]}>
                <Input prefix={<IdcardOutlined style={{color: '#bfbfbf'}}/>} placeholder="Choose a unique username" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item 
                label="Phone Number (Login ID)" 
                name="phone" 
                tooltip="Your phone number is your login ID and cannot be changed."
              >
                {/* --- فیلد تلفن کاملاً قفل (disabled) شد --- */}
                <Input prefix={<PhoneOutlined style={{color: '#bfbfbf'}}/>} disabled style={{ background: '#f5f5f5', color: '#888', cursor: 'not-allowed' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Contact Email" name="email" rules={[{ type: 'email', message: 'Invalid email address!' }]}>
                <Input prefix={<MailOutlined style={{color: '#bfbfbf'}}/>} placeholder="agency@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item style={{ marginTop: '20px', textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" loading={savingProfile} style={{ background: '#157f43', padding: '0 40px' }}>
              Save Profile Changes
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );

  const tabItems = [
    { key: 'tickets', label: '🎫 My Tickets', children: ticketsTab },
    { key: 'profile', label: '⚙️ Profile Settings', children: profileTab },
  ];

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Tabs defaultActiveKey="tickets" items={tabItems} onChange={handleTabChange} size="large" />
      </div>
    </div>
  );
}