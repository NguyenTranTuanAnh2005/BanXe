import React from 'react';
import { Layout, Typography, Space, Tag, Button, Row, Col, Badge, Tooltip } from 'antd';
import { 
  CarOutlined, 
  PhoneOutlined, 
  SafetyCertificateOutlined, 
  EnvironmentOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  ScheduleOutlined,
  CustomerServiceOutlined,
  RobotOutlined
} from '@ant-design/icons';

const { Header } = Layout;
const { Title, Text } = Typography;

const Navbar = ({ activeTab, onTabChange, onOpenChat }) => {
  return (
    <div style={{ background: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      {/* 1. Top Mini Bar */}
      <div style={{ background: '#0f172a', color: '#cbd5e1', padding: '6px 16px', fontSize: '0.8rem' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }} className="top-mini-bar">
          <Space size="middle" flexWrap="wrap" split={<span style={{ color: '#334155' }} className="hide-on-mobile">|</span>}>
            <Space align="center" size="xs">
              <EnvironmentOutlined style={{ color: '#38bdf8' }} />
              <span>Showroom: 88 Nguyễn Văn Cừ, Hà Nội</span>
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
      <Header style={{ background: '#ffffff', height: 'auto', padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }} className="responsive-header-row">
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
                Hệ Thống Phân Phối Ô Tô Chính Hãng
              </Text>
            </div>
          </Space>

          {/* Quick Badges & Call to Actions */}
          <Space size="middle" align="center" style={{ flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} className="hide-on-mobile">
              <Tag icon={<SafetyCertificateOutlined />} color="cyan" style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', margin: 0 }}>
                Bảo Hành 5 Năm
              </Tag>
              <Tag icon={<ThunderboltOutlined />} color="volcano" style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', margin: 0 }}>
                Ưu Đãi Trả Góp 0%
              </Tag>
            </div>

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
                Trợ Lý AI Gemma 3
              </Button>
            </Tooltip>

            <Tooltip title="Liên hệ tư vấn hoặc đăng ký lái thử trực tiếp">
              <Button 
                type="primary" 
                size="middle" 
                icon={<ScheduleOutlined />}
                style={{ 
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)', 
                  borderColor: '#0284c7', 
                  borderRadius: 8,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                }}
                onClick={() => onTabChange && onTabChange('1')}
              >
                Đặt Lịch Khảo Sát
              </Button>
            </Tooltip>
          </Space>
        </div>
      </Header>
    </div>
  );
};

export default Navbar;
