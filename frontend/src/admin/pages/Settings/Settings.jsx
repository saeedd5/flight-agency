import { useState, useEffect } from 'react';
import Card from 'antd/es/card';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Switch from 'antd/es/switch';
import Button from 'antd/es/button';
import message from 'antd/es/message';
import Spin from 'antd/es/spin';
import Divider from 'antd/es/divider';
import Space from 'antd/es/space';
import { SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { adminApi } from '../../../services/adminApi';

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSettings();
      const data = response.success ? (Array.isArray(response.data) ? response.data : []) : [];
      setSettings(data);
      
      // Set form values
      const formValues = {};
      data.forEach(setting => {
        // Convert boolean strings
        if (setting.value === 'true' || setting.value === 'false') {
          formValues[setting.key] = setting.value === 'true';
        } else {
          formValues[setting.key] = setting.value;
        }
      });
      form.setFieldsValue(formValues);
    } catch (error) {
      message.error('Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const values = form.getFieldsValue();
      
      // Update each setting
      const updates = settings.map(async (setting) => {
        let value = values[setting.key];
        
        // Convert boolean to string
        if (typeof value === 'boolean') {
          value = value.toString();
        }
        
        if (value !== setting.value) {
          await adminApi.updateSetting(setting.key, { value: value.toString() });
        }
      });
      
      await Promise.all(updates);
      message.success('Settings saved successfully');
      fetchSettings();
    } catch (error) {
      message.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  // Group settings by category
  const groupedSettings = settings.reduce((acc, setting) => {
    const category = setting.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(setting);
    return acc;
  }, {});

  const getCategoryTitle = (category) => {
    const titles = {
      General: 'General',
      System: 'System',
      Search: 'Search',
      Booking: 'Booking'
    };
    return titles[category] || category;
  };

  const renderSettingInput = (setting) => {
    // Boolean settings
    if (setting.value === 'true' || setting.value === 'false') {
      return (
        <Form.Item
          key={setting.key}
          name={setting.key}
          label={setting.description || setting.key}
          valuePropName="checked"
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
      );
    }

    // Number settings
    if (!isNaN(setting.value) && setting.value !== '') {
      return (
        <Form.Item
          key={setting.key}
          name={setting.key}
          label={setting.description || setting.key}
        >
          <Input type="number" style={{ maxWidth: 200 }} />
        </Form.Item>
      );
    }

    // Text settings
    return (
      <Form.Item
        key={setting.key}
        name={setting.key}
        label={setting.description || setting.key}
      >
        <Input style={{ maxWidth: 400 }} />
      </Form.Item>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">
          <SettingOutlined style={{ marginLeft: 8 }} />
          System Settings
        </h2>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
        >
          Save Changes
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        className="settings-form"
      >
        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <Card
            key={category}
            title={getCategoryTitle(category)}
            style={{ marginBottom: 24 }}
            size="small"
          >
            {categorySettings.map(renderSettingInput)}
          </Card>
        ))}
      </Form>

      {settings.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            No settings available
          </div>
        </Card>
      )}
    </div>
  );
};

export default Settings;

