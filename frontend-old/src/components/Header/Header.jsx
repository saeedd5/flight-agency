import React, { useState } from 'react';
import { useTranslation } from '../../contexts/TranslationContext';
import { useAuth } from '../../contexts/AuthContext'; 
import { Link } from 'react-router-dom';
import { Button, Dropdown, Space, Modal, List } from 'antd'; 
import { UserOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons'; 
import { logoutUser } from '../../services/authApi'; 
import AuthModal from '../auth/AuthModal'; 
import './Header.css';

function Header() {
  const { t, language, changeLanguage } = useTranslation();
  const { user, logout } = useAuth(); 
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false); // استیت جدید برای مودال رزروها

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    changeLanguage(newLang);
  };

  const handleLogout = async () => {
    try {
      await logoutUser(); 
      logout(); 
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // --- تعریف منوی داینامیک بر اساس نقش کاربر ---
  
  // ۱. منوی پیش‌فرض برای کاربر عادی (User)
  let userMenuItems = [
    {
      key: 'my-bookings',
      label: 'My Bookings',
      icon: <UserOutlined />,
      onClick: () => setIsBookingsModalOpen(true),
    },
    {
      key: 'logout',
      danger: true,
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  // ۲. اگر کاربر نقش آژانس (Agency) داشت، منو را تغییر می‌دهیم
  if (user && user.roles && user.roles.includes('Agency')) {
    userMenuItems = [
      {
        key: 'my-panel',
        label: <Link to="/agency-panel">My Panel</Link>, // لینک به پنل ادمین
        icon: <UserOutlined />,
      },
      {
        key: 'logout',
        danger: true,
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ];
  }

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">Travelyn</div>
        <nav className="nav-links">
          <Link to="/">Home</Link> {/* اضافه کردن لینک صفحه اصلی */}
          <Link to="/tickets">Tickets</Link> {/* <-- لینک جدید اضافه شد */}
          <Link to="/saber-test">تست Saber</Link>
          <a href="#">{t('support')}</a>
          <a href="#">{t('aboutUs')}</a>
        </nav>
      </div>

      <div className="header-right">
        {/* بخش Signup / Login */}
        <div className="auth-section" style={{ marginRight: '15px' }}>
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Button type="text" className="user-profile-btn" style={{ color: 'white' }}>
                <Space>
                  <UserOutlined />
                  {/* نمایش نام کاربر */}
                  <span>Hello, {user.name || user.username}</span>
                </Space>
              </Button>
            </Dropdown>
          ) : (
            <Button 
              type="primary" 
              icon={<LoginOutlined />} 
              onClick={() => setIsAuthModalOpen(true)}
              className="login-action-btn"
              style={{ background: '#157f43', border: 'none' }}
            >
              Signup / Login
            </Button>
          )}
        </div>

        {/* تغییر زبان */}
        <button 
          className="lang-toggle"
          onClick={handleLanguageToggle}
          title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
        >
          <span className="lang-flag">{language === 'en' ? '🇬🇧' : '🇸🇦'}</span>
          <span className="lang-code">{language === 'en' ? 'EN' : 'AR'}</span>
        </button>
      </div>

      {/* مودال ورود و ثبت نام */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />





 <Modal
        title="My Bookings"
        open={isBookingsModalOpen}
        onCancel={() => setIsBookingsModalOpen(false)}
        footer={null}
        width={600}
      >
        <p>در این قسمت، لیست رزروهای شما که از سرور دریافت می‌شود قرار خواهد گرفت.</p>
        <List
          itemLayout="horizontal"
          dataSource={[]} // اینجا دیتا از بک‌اند میاد
          renderItem={(item) => (
             <List.Item>
                <List.Item.Meta title={item.title} description={item.desc} />
             </List.Item>
          )}
          locale={{ emptyText: 'هیچ پروازی رزرو نکرده‌اید' }}
        />
      </Modal>






    </header>
  );




}

export default Header;