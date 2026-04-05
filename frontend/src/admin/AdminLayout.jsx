import { useState } from 'react';
import Layout from 'antd/es/layout';
import Menu from 'antd/es/menu';
import Button from 'antd/es/button';
import Avatar from 'antd/es/avatar';
import Dropdown from 'antd/es/dropdown';
import theme from 'antd/es/theme';
import ConfigProvider from 'antd/es/config-provider';
import Select from 'antd/es/select';
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  HomeOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import enUS from 'antd/locale/en_US';
import arEG from 'antd/locale/ar_EG';
import './AdminLayout.css';

const { Option } = Select;

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t, language, direction, changeLanguage } = useTranslation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const getAntdLocale = () => {
    switch (language) {
      case 'ar':
        return arEG;
      default:
        return enUS;
    }
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: t('dashboard'),
    },
    {
      key: '/admin/air',
      icon: <ThunderboltOutlined />,
      label: t('air'),
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: t('userManagement'),
    },
    {
      key: '/admin/bookings',
      icon: <CalendarOutlined />,
      label: t('bookingManagement'),
    },
    {
      key: '/admin/logs',
      icon: <FileTextOutlined />,
      label: t('searchLogs'),
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: t('settings'),
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const userMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: t('backToSite'),
      onClick: () => navigate('/'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('logout'),
      onClick: handleLogout,
    },
  ];

  // Find current selected key
  const selectedKey = menuItems.find(item => 
    location.pathname === item.key || 
    (item.key !== '/admin' && location.pathname.startsWith(item.key))
  )?.key || '/admin';

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
    <Layout style={{ minHeight: '100vh', direction }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          right: direction === 'rtl' ? 0 : 'auto',
          left: direction === 'ltr' ? 0 : 'auto',
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
        theme="light"
        className="admin-sider-white"
      >
        <div className="admin-logo">
          {collapsed ? 'T' : 'Travelyn'}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout style={{ 
        marginRight: direction === 'rtl' ? (collapsed ? 80 : 200) : 0,
        marginLeft: direction === 'ltr' ? (collapsed ? 80 : 200) : 0,
        transition: 'all 0.2s'
      }}>
        <Header
          className="admin-main-header"
          style={{
            padding: '0 24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 25%, #ffffff 50%, #f1f5f9 75%, #ffffff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div className="admin-header-right">
            <Select
              value={language}
              onChange={changeLanguage}
              className="admin-lang-selector"
              size="small"
            >
              <Option value="en">English (EUR)</Option>
              <Option value="ar">العربية (SAR)</Option>
            </Select>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomLeft">
              <div className="admin-user-info">
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#157f43' }} />
                <span className="admin-username">{user?.username || 'Admin'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          className="admin-main-content"
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: 'linear-gradient(to bottom, #f8f9fa 0%, #f5f5f5 100%)',
            borderRadius: 12,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;

