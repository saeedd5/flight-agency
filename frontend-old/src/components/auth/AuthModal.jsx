import React, { useState } from 'react';
import { Modal, Tabs, Form, Input, Button, Radio, message } from 'antd';
import { UserOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { loginUser, registerUser } from '../../services/authApi';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('register');
  const [loading, setLoading] = useState(false);
  
  // ساخت دو فرم کاملاً مجزا برای جلوگیری از تداخل اعتبارسنجی‌ها
  const [registerForm] = Form.useForm();
  const [loginForm] = Form.useForm();
  
  const { login, handleSuccessfulAuth } = useAuth();

  // تابع هندل کردن سابمیت (هم برای لاگین، هم رجیستر)
  const handleFinish = async (values) => {
    setLoading(true);
    try {
          if (activeTab === 'login') {
          // تابع login حالا phone و password را به عنوان دو آرگومان جدا میگیرد
          const result = await login(values.phone, values.password); 
          if (result.success) {
            message.success('با موفقیت وارد شدید!');
            onClose();
          } else {
            message.error(result.error || 'ورود ناموفق بود.');
          }
        
      } else {
  // ---- ثبت‌نام ----
        const result = await registerUser(values);
        if (result.success) {
          
          // چک میکنیم آیا فرم برای آژانس بوده است؟
          if (values.accountType === 'Agency' || result.errorMessage === 'pending_approval') {
            // پیام مخصوص آژانس (بدون لاگین کردن)
            message.info('ثبت نام آژانس با موفقیت انجام شد. لطفاً منتظر بررسی و تایید مدیریت بمانید.', 6);
            onClose(); // فقط مودال را میبندیم
          } else {
            // کاربر عادی (مستقیم لاگین میشود)
            message.success('ثبت نام با موفقیت انجام شد!');
            handleSuccessfulAuth(result.user, result.token);
            onClose();
          }

        } else {
          message.error(result.errorMessage || 'ثبت نام ناموفق بود.');
        }
      }

      
    } catch (error) {
      message.error(error.message || 'خطایی رخ داده است.');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'register',
      label: 'Sign Up',
      children: (
        // فرم اول (مربوط به ثبت‌نام)
        <Form form={registerForm} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
            <Input prefix={<UserOutlined />} placeholder="Full Name (e.g. John Doe / Travel Agency)" size="large" />
          </Form.Item>
          <Form.Item name="phone" rules={[{ required: true, message: 'Please enter your phone number' }]}>
            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please enter a password' }, { min: 6, message: 'Minimum 6 characters' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item name="accountType" initialValue="User" className="mb-2">
            <Radio.Group className="w-full flex justify-center">
              <Radio.Button value="User">Regular User</Radio.Button>
              <Radio.Button value="Agency">Travel Agency</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading} className="mt-4" style={{background: '#157f43'}}>
            Sign Up
          </Button>
        </Form>
      ),
    },
    {
      key: 'login',
      label: 'Login',
      children: (
        // فرم دوم (مربوط به ورود)
        <Form form={loginForm} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="phone" rules={[{ required: true, message: 'Please enter your phone number' }]}>
            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading} className="mt-4" style={{background: '#0d6efd'}}>
            Login
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <Modal
      open={isOpen}
      onCancel={() => {
        // هنگام بسته شدن، هر دو فرم را پاک میکنیم تا اطلاعات قبلی نماند
        registerForm.resetFields();
        loginForm.resetFields();
        onClose();
      }}
      footer={null}
      destroyOnClose
      width={400}
      centered
    >
      <div className="text-center mb-6 mt-4">
        <h2 className="text-2xl font-bold text-gray-800">Welcome!</h2>
        <p className="text-gray-500">Please login or create an account</p>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        centered
        items={items}
      />
    </Modal>
  );
}