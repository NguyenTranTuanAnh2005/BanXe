import React, { useState } from 'react';
import { Modal, Tabs, Form, Input, Button, Radio, Typography, Space, message, Card, Divider, Tag } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  ShopOutlined, 
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  LoginOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const AuthModal = ({ visible, onClose, onSuccess, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  // Handle Login Submit
  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        username_or_email: values.username_or_email,
        password: values.password
      });

      const { user, token } = response.data;
      localStorage.setItem('tuananh_auth_user', JSON.stringify(user));
      localStorage.setItem('tuananh_auth_token', token);

      message.success(`Đăng nhập thành công! Chào mừng ${user.full_name || user.username} (${user.role === 'seller' ? 'Người Bán Xe' : user.role === 'admin' ? 'Quản Trị Viên' : 'Khách Hàng'})`);
      if (onSuccess) onSuccess(user);
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      const detail = error.response?.data?.detail || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin!';
      message.error(detail);
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick Demo Login (1-Click)
  const handleQuickLogin = (username, password) => {
    loginForm.setFieldsValue({
      username_or_email: username,
      password: password
    });
    handleLogin({ username_or_email: username, password: password });
  };

  // Handle Register Submit
  const handleRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register', {
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role, // 'customer' or 'seller'
        full_name: values.full_name,
        phone: values.phone
      });

      const { user, token } = response.data;
      localStorage.setItem('tuananh_auth_user', JSON.stringify(user));
      localStorage.setItem('tuananh_auth_token', token);

      message.success(`Đăng ký tài khoản ${values.role === 'seller' ? 'Người Bán Xe' : 'Khách Hàng'} thành công!`);
      if (onSuccess) onSuccess(user);
      onClose();
    } catch (error) {
      console.error('Register error:', error);
      const detail = error.response?.data?.detail || 'Đăng ký không thành công. Tên đăng nhập hoặc email có thể đã tồn tại.';
      message.error(detail);
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'login',
      label: (
        <span style={{ fontWeight: 600 }}>
          <LoginOutlined style={{ marginRight: 6 }} />
          Đăng Nhập
        </span>
      ),
      children: (
        <div>
          <Paragraph type="secondary" style={{ marginBottom: 18, fontSize: '0.88rem' }}>
            Đăng nhập để xem tin bán xe, gửi tin nhắn đến người bán, in bài đăng và quản lý thông tin xe.
          </Paragraph>

          <Form form={loginForm} layout="vertical" onFinish={handleLogin}>
            <Form.Item
              name="username_or_email"
              label="Tên Đăng Nhập hoặc Email"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập hoặc email!' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#0284c7' }} />} 
                placeholder="VD: khachhang, nguoiban hoặc email" 
                size="large" 
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật Khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#0284c7' }} />} 
                placeholder="Nhập mật khẩu..." 
                size="large" 
              />
            </Form.Item>

            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large" 
              loading={loading}
              style={{ 
                background: 'linear-gradient(135deg, #0284c7, #0369a1)', 
                borderColor: '#0284c7',
                fontWeight: 600,
                marginTop: 8
              }}
            >
              Đăng Nhập Ngay
            </Button>
          </Form>

          {/* Quick Demo Accounts */}
          <Divider orientation="center" style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '20px 0 14px' }}>
            ⚡ ĐĂNG NHẬP NHANH 1-CLICK (TÀI KHOẢN MẪU)
          </Divider>

          <Space orientation="vertical" style={{ width: '100%' }} size="small">
            <Button 
              block 
              style={{ textAlign: 'left', borderColor: '#38bdf8', background: '#f0f9ff' }}
              onClick={() => handleQuickLogin('khachhang', '123456')}
            >
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <span>🛒 <strong>Khách Hàng:</strong> khachhang / 123456</span>
                <Tag color="cyan">Khách Mua Xe</Tag>
              </Space>
            </Button>

            <Button 
              block 
              style={{ textAlign: 'left', borderColor: '#a855f7', background: '#faf5ff' }}
              onClick={() => handleQuickLogin('nguoiban', '123456')}
            >
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <span>🚗 <strong>Người Bán Xe:</strong> nguoiban / 123456</span>
                <Tag color="purple">Người Bán / Đại Lý</Tag>
              </Space>
            </Button>

            <Button 
              block 
              style={{ textAlign: 'left', borderColor: '#10b981', background: '#ecfdf5' }}
              onClick={() => handleQuickLogin('admin', 'admin123')}
            >
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <span>🛡️ <strong>Admin:</strong> admin / admin123</span>
                <Tag color="green">Quản Trị</Tag>
              </Space>
            </Button>
          </Space>
        </div>
      ),
    },
    {
      key: 'register',
      label: (
        <span style={{ fontWeight: 600 }}>
          <UserAddOutlined style={{ marginRight: 6 }} />
          Đăng Ký Tài Khoản
        </span>
      ),
      children: (
        <div>
          <Paragraph type="secondary" style={{ marginBottom: 16, fontSize: '0.88rem' }}>
            Chọn vai trò tài khoản phù hợp với nhu cầu của bạn trên hệ thống TuanAnh Auto.
          </Paragraph>

          <Form 
            form={registerForm} 
            layout="vertical" 
            onFinish={handleRegister}
            initialValues={{ role: 'customer' }}
          >
            {/* Role Selection */}
            <Form.Item name="role" label="Bạn Muốn Đăng Ký Tài Khoản Cho:" rules={[{ required: true }]}>
              <Radio.Group style={{ width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Card 
                    hoverable 
                    size="small"
                    style={{ 
                      borderRadius: 8, 
                      cursor: 'pointer',
                      border: '1px solid #bae6fd',
                      background: '#f0f9ff'
                    }}
                  >
                    <Radio value="customer">
                      <div style={{ fontWeight: 700, color: '#0369a1' }}>🛒 Khách Hàng</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Tìm mua ô tô, so sánh giá, gửi tin nhắn đến người bán, in bài đăng
                      </div>
                    </Radio>
                  </Card>

                  <Card 
                    hoverable 
                    size="small"
                    style={{ 
                      borderRadius: 8, 
                      cursor: 'pointer',
                      border: '1px solid #e9d5ff',
                      background: '#faf5ff'
                    }}
                  >
                    <Radio value="seller">
                      <div style={{ fontWeight: 700, color: '#7e22ce' }}>🚗 Người Bán Xe</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Đăng tin bán xe kèm mô tả chi tiết, quản lý bài đăng, nhận tin nhắn
                      </div>
                    </Radio>
                  </Card>
                </div>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="full_name"
              label="Họ và Tên / Tên Đại Lý"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên hoặc tên showroom!' }]}
            >
              <Input prefix={<UserOutlined style={{ color: '#0284c7' }} />} placeholder="VD: Nguyễn Văn Tuấn hoặc Auto Minh Phát" />
            </Form.Item>

            <Form.Item
              name="username"
              label="Tên Đăng Nhập"
              rules={[
                { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                { min: 3, message: 'Tên đăng nhập tối thiểu 3 ký tự' }
              ]}
            >
              <Input prefix={<SafetyCertificateOutlined style={{ color: '#0284c7' }} />} placeholder="VD: tuandemo, autoxe..." />
            </Form.Item>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item
                name="email"
                label="Địa Chỉ Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không đúng định dạng!' }
                ]}
              >
                <Input prefix={<MailOutlined style={{ color: '#0284c7' }} />} placeholder="email@domain.com" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số Điện Thoại Liên Hệ"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input prefix={<PhoneOutlined style={{ color: '#0284c7' }} />} placeholder="VD: 0912345678" />
              </Form.Item>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item
                name="password"
                label="Mật Khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
                ]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: '#0284c7' }} />} placeholder="Tối thiểu 6 ký tự" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác Nhận Mật Khẩu"
                rules={[{ required: true, message: 'Vui lòng nhập lại mật khẩu!' }]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: '#0284c7' }} />} placeholder="Nhập lại mật khẩu" />
              </Form.Item>
            </div>

            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large" 
              loading={loading}
              style={{ 
                background: 'linear-gradient(135deg, #0284c7, #0369a1)', 
                borderColor: '#0284c7',
                fontWeight: 600,
                marginTop: 8
              }}
            >
              Tạo Tài Khoản Mới
            </Button>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={520}
      centered
      destroyOnClose
    >
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <Title level={3} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>
          TuanAnh <span style={{ color: '#0284c7' }}>Auto</span>
        </Title>
        <Text type="secondary" style={{ fontSize: '0.85rem' }}>
          Hệ Thống Đăng Ký & Đăng Nhập Khách Hàng / Người Bán Xe
        </Text>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={(k) => setActiveTab(k)} 
        items={tabItems} 
        centered 
      />
    </Modal>
  );
};

export default AuthModal;
