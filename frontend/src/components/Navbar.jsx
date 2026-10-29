import React from 'react';
import { Layout, Typography, Space, Tag, Button, Dropdown, Badge, Tooltip, Avatar } from 'antd';
import { 
  CarOutlined, 
  PhoneOutlined, 
  SafetyCertificateOutlined, 
  EnvironmentOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  PlusCircleOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  RobotOutlined,
  ShopOutlined,
  IdcardOutlined,
  DownOutlined
} from '@ant-design/icons';

const { Header } = Layout;
const { Title, Text } = Typography;

const Navbar = ({ 
  activeTab, 
  onTabChange, 
  onOpenChat,
  currentUser,
  onOpenAuth,
  onOpenPostCar,
  onOpenMessages,
  unreadCount = 0,
  onLogout
}) => {
  // User menu items for dropdown
  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{currentUser?.full_name || currentUser?.username}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{currentUser?.email}</div>
          <div style={{ marginTop: 4 }}>
            <Tag color={currentUser?.role === 'seller' ? 'purple' : currentUser?.role === 'admin' ? 'green' : 'cyan'}>
              {currentUser?.role === 'seller' ? '🚗 Người Bán Xe / Đại Lý' : currentUser?.role === 'admin' ? '🛡️ Quản Trị Viên' : '🛒 Khách Hàng'}
            </Tag>
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'messages',
      icon: <MessageOutlined />,
      label: (
        <span>
          Hộp Thư Tin Nhắn {unreadCount > 0 && <Badge count={unreadCount} size="small" style={{ marginLeft: 6 }} />}
        </span>
      ),
      onClick: onOpenMessages,
    },
    ...(currentUser?.role === 'seller' || currentUser?.role === 'admin' ? [
      {
        key: 'post-car',
        icon: <PlusCircleOutlined style={{ color: '#0284c7' }} />,
        label: 'Đăng Bài Bán Xe Mới',
        onClick: onOpenPostCar,
      }
    ] : []),
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: '#ef4444' }} />,
      label: <span style={{ color: '#ef4444', fontWeight: 600 }}>Đăng Xuất</span>,
      onClick: onLogout,
    },
  ];

  return (
    <div style={{ background: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      {/* 1. Top Mini Bar */}
      <div style={{ background: '#0f172a', color: '#cbd5e1', padding: '6px 16px', fontSize: '0.8rem' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }} className="top-mini-bar">
          <Space size="middle" flexWrap="wrap" split={<span style={{ color: '#334155' }} className="hide-on-mobile">|</span>}>
            <Space align="center" size="xs">
              <EnvironmentOutlined style={{ color: '#38bdf8' }} />
              <span>Showroom: 88 Nguyễn Văn Cừ, Long Biên, Hà Nội</span>
            </Space>
            <Space align="center" size="xs" className="hide-on-mobile">
              <ClockCircleOutlined style={{ color: '#38bdf8' }} />
              <span>Giờ mở cửa: 08:00 - 20:00 (T2 - CN)</span>
            </Space>
          </Space>

          <Space size="middle">
            <Tag color="success" style={{ margin: 0, borderRadius: 10, fontSize: '0.75rem' }}>
              ● Đang Mở Cửa
            </Tag>
            <Space align="center" size="xs">
              <PhoneOutlined style={{ color: '#38bdf8' }} />
              <Text style={{ color: '#f8fafc', fontWeight: 600 }}>Hotline: 1900 6868</Text>
            </Space>
          </Space>
        </div>
      </div>

      {/* 2. Main Branding Header */}
      <Header style={{ background: '#ffffff', height: 'auto', padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }} className="responsive-header-row">
          {/* Logo Section */}
          <Space align="center" size="middle" style={{ cursor: 'pointer' }} onClick={() => onTabChange && onTabChange('1')}>
            <div style={{ 
              background: 'linear-gradient(135deg, #0284c7, #0369a1)', 
              width: 44, 
              height: 44, 
              borderRadius: 12, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
              flexShrink: 0
            }}>
              <CarOutlined style={{ fontSize: 24, color: '#fff' }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                TuanAnh <span style={{ color: '#0284c7' }}>Auto</span>
              </Title>
              <Text type="secondary" style={{ fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.2px' }}>
                Hệ Thống Phân Phối & Ký Gửi Ô Tô Toàn Quốc
              </Text>
            </div>
          </Space>

          {/* Quick Actions & Auth Controls */}
          <Space size="middle" align="center" style={{ flexWrap: 'wrap' }}>
            {/* Post Car Listing CTA */}
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={onOpenPostCar}
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                borderColor: '#f97316',
                fontWeight: 700,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)'
              }}
            >
              Đăng Tin Bán Xe
            </Button>

            {/* Messages Inbox Button */}
            <Tooltip title="Xem hộp thư tin nhắn trao đổi mua bán xe">
              <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                <Button
                  icon={<MessageOutlined style={{ color: '#0284c7' }} />}
                  onClick={onOpenMessages}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  <span className="hide-on-mobile">Tin Nhắn</span>
                </Button>
              </Badge>
            </Tooltip>

            {/* AI Assistant Button */}
            <Tooltip title="Trợ lý AI Gemma 3:1B tư vấn ô tô thông minh (Ollama)">
              <Button 
                type="default" 
                size="middle" 
                icon={<RobotOutlined style={{ color: '#0284c7' }} />}
                style={{ 
                  borderColor: '#0284c7', 
                  color: '#0284c7',
                  borderRadius: 8,
                  fontWeight: 600
                }}
                onClick={() => onOpenChat && onOpenChat()}
              >
                <span className="hide-on-mobile">Trợ Lý AI</span>
              </Button>
            </Tooltip>

            {/* User Account / Auth Section */}
            {currentUser ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <Button 
                  style={{ 
                    borderRadius: 20, 
                    padding: '4px 12px', 
                    height: 'auto',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Avatar 
                    size="small" 
                    icon={<UserOutlined />} 
                    style={{ 
                      backgroundColor: currentUser.role === 'seller' ? '#9333ea' : currentUser.role === 'admin' ? '#10b981' : '#0284c7' 
                    }} 
                  />
                  <span style={{ fontWeight: 600, color: '#0f172a', maxWidth: 120 }} className="brand-text-nowrap">
                    {currentUser.full_name || currentUser.username}
                  </span>
                  <Tag 
                    color={currentUser.role === 'seller' ? 'purple' : currentUser.role === 'admin' ? 'green' : 'cyan'} 
                    style={{ margin: 0, fontSize: '0.72rem', padding: '0 6px', borderRadius: 8 }}
                  >
                    {currentUser.role === 'seller' ? 'Người Bán' : currentUser.role === 'admin' ? 'Admin' : 'Khách Hàng'}
                  </Tag>
                  <DownOutlined style={{ fontSize: 10, color: '#94a3b8' }} />
                </Button>
              </Dropdown>
            ) : (
              <Button 
                type="primary"
                icon={<UserOutlined />}
                onClick={onOpenAuth}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  borderColor: '#0284c7',
                  borderRadius: 8,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                }}
              >
                Đăng Nhập / Đăng Ký
              </Button>
            )}
          </Space>
        </div>
      </Header>
    </div>
  );
};

export default Navbar;
