import { useState } from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import Card from 'antd/es/card';
import message from 'antd/es/message';
import Typography from 'antd/es/typography';
import ConfigProvider from 'antd/es/config-provider';
import Layout from 'antd/es/layout';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import Header from '../../components/Header/Header';
import enUS from 'antd/es/locale/en_US';
import arEG from 'antd/es/locale/ar_EG';
import './Login.css';

const { Title, Text } = Typography;
const { Content } = Layout;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, direction } = useTranslation();

  const from = location.state?.from?.pathname || '/admin';

  const getAntdLocale = () => {
    switch (language) {
      case 'ar':
        return arEG;
      default:
        return enUS;
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const result = await login(values.username, values.password);
      
      if (result.success) {
        message.success(t('loginSuccess'));
        navigate(from, { replace: true });
      } else {
        message.error(result.error || t('loginError'));
      }
    } catch (error) {
      message.error(t('systemError'));
    } finally {
      setLoading(false);
    }
  };

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
      <Layout className="login-layout">
        <Header />
        <Content className="login-content">
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
                <div className="login-logo">Travelyn</div>
                <Title level={3} style={{ margin: 0 }}>{t('adminPanel')}</Title>
                <Text type="secondary">{t('adminLogin')}</Text>
        </div>
        
        <Form
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          initialValues={{ username: '', password: '' }}
        >
          <Form.Item
            name="username"
                  label={t('usernameLabel')}
            rules={[
                    { required: true, message: t('usernameRequired') }
            ]}
          >
            <Input
              prefix={<UserOutlined className="input-icon" />}
                    placeholder={t('usernamePlaceholder')}
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
                  label={t('passwordLabel')}
            rules={[
                    { required: true, message: t('passwordRequired') }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
                    placeholder={t('passwordPlaceholder')}
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="login-button"
            >
                    {t('login')}
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <Text type="secondary">
                  {t('defaultCredentials')}: <code>admin</code> | {t('password')}: <code>Admin@123</code>
          </Text>
        </div>
      </Card>
    </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default Login;

