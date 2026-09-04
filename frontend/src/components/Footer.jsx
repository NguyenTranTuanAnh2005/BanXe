import React from 'react';
import { Row, Col, Typography, Space, Input, Button, Divider, Tag, message } from 'antd';
import { 
  CarOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  MailOutlined, 
  SendOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  InstagramOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const Footer = () => {
  const [email, setEmail] = React.useState('');

  const handleSubscribe = () => {
    if (!email || !email.includes('@')) {
      message.warning('Vui lòng nhập địa chỉ email hợp lệ!');
      return;
    }
    message.success('Cảm ơn bạn đã đăng ký nhận thông tin khuyến mãi từ TuanAnh Auto!');
    setEmail('');
  };

  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', paddingTop: 60, paddingBottom: 24, marginTop: 48 }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <Row gutter={[32, 32]}>
          {/* Column 1: Brand & Slogan */}
          <Col xs={24} sm={12} lg={7}>
            <Space align="center" size="middle" style={{ marginBottom: 16 }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #0284c7, #0369a1)', 
                width: 44, 
                height: 44, 
                borderRadius: 10, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
              }}>
                <CarOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <Title level={3} style={{ margin: 0, color: '#ffffff', fontWeight: 700, letterSpacing: '-0.5px' }}>
                TuanAnh <span style={{ color: '#38bdf8' }}>Auto</span>
              </Title>
            </Space>
            
            <Paragraph style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              TuanAnh Auto là thương hiệu hàng đầu chuyên phân phối các dòng xe ô tô chính hãng hạng sang, xe điện thế hệ mới và dịch vụ bảo dưỡng đạt tiêu chuẩn quốc tế.
            </Paragraph>

            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                <SafetyCertificateOutlined style={{ color: '#38bdf8', marginRight: 8 }} />
                Cam kết 100% xe chính hãng - Bảo hành 5 năm
              </Text>
              <Text style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                <CheckCircleOutlined style={{ color: '#10b981', marginRight: 8 }} />
                Hỗ trợ trả góp lên đến 85% giá trị xe
              </Text>
            </Space>
          </Col>

          {/* Column 2: Showroom Branches */}
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ color: '#f8fafc', marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Hệ Thống Showroom
            </Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ color: '#e2e8f0', display: 'block' }}>📍 Showroom Hà Nội (Trụ sở chính)</Text>
                <Text style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Số 88 Nguyễn Văn Cừ, Q. Long Biên, Hà Nội</Text>
              </div>
              <div>
                <Text strong style={{ color: '#e2e8f0', display: 'block' }}>📍 Showroom TP. Hồ Chí Minh</Text>
                <Text style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Số 202 Nguyễn Văn Linh, Quận 7, TP. HCM</Text>
              </div>
              <div>
                <Text strong style={{ color: '#e2e8f0', display: 'block' }}>📍 Showroom Đà Nẵng</Text>
                <Text style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Số 55 Nguyễn Hữu Thọ, Q. Hải Châu, Đà Nẵng</Text>
              </div>
            </Space>
          </Col>

          {/* Column 3: Quick Links & Services */}
          <Col xs={24} sm={12} lg={5}>
            <Title level={5} style={{ color: '#f8fafc', marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Dịch Vụ & Khách Hàng
            </Title>
            <Space direction="vertical" size="small" style={{ width: '100%', fontSize: '0.9rem' }}>
              <a href="#showroom" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>• Đăng ký lái thử tận nơi</a>
              <a href="#admin" style={{ color: '#94a3b8' }}>• Cập nhật bảng giá xe mới nhất</a>
              <a href="#insurance" style={{ color: '#94a3b8' }}>• Tư vấn gói bảo hiểm xe cao cấp</a>
              <a href="#tradein" style={{ color: '#94a3b8' }}>• Định giá & Đổi xe cũ lấy xe mới</a>
              <a href="#warranty" style={{ color: '#94a3b8' }}>• Quy trình bảo dưỡng định kỳ</a>
            </Space>
          </Col>

          {/* Column 4: Newsletter & Contact */}
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} style={{ color: '#f8fafc', marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Nhận Báo Giá Độc Quyền
            </Title>
            <Paragraph style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Đăng ký email để nhận bảng tính giá lăn bánh chi tiết và ưu đãi giảm giá lên tới 100 triệu VNĐ.
            </Paragraph>

            <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
              <Input 
                placeholder="Nhập email của bạn..." 
                prefix={<MailOutlined style={{ color: '#64748b' }} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ background: '#1e293b', borderColor: '#334155', color: '#fff' }}
              />
              <Button 
                type="primary" 
                icon={<SendOutlined />} 
                onClick={handleSubscribe}
                style={{ background: '#0284c7', borderColor: '#0284c7' }}
              >
                Gửi
              </Button>
            </Space.Compact>

            <div style={{ background: '#1e293b', padding: '12px 16px', borderRadius: 8, border: '1px solid #334155' }}>
              <Space align="center">
                <CustomerServiceOutlined style={{ color: '#38bdf8', fontSize: 24 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Hotline Hỗ Trợ 24/7</Text>
                  <Text strong style={{ color: '#38bdf8', fontSize: '1.1rem' }}>1900 6868 - 0988 999 888</Text>
                </div>
              </Space>
            </div>
          </Col>
        </Row>

        <Divider style={{ borderColor: '#1e293b', margin: '40px 0 24px 0' }} />

        {/* Bottom copyright bar */}
        <Row justify="space-between" align="middle" gutter={[16, 12]}>
          <Col xs={24} md={14}>
            <Text style={{ color: '#64748b', fontSize: '0.85rem' }}>
              © {new Date().getFullYear()} <strong style={{ color: '#cbd5e1' }}>TuanAnh Auto</strong>. Tất cả quyền được bảo lưu. 
              Xây dựng với React.js, Ant Design & Python FastAPI.
            </Text>
          </Col>
          <Col xs={24} md={10} style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Space size="middle">
              <Button type="text" shape="circle" icon={<FacebookOutlined style={{ color: '#cbd5e1', fontSize: 18 }} />} />
              <Button type="text" shape="circle" icon={<YoutubeOutlined style={{ color: '#cbd5e1', fontSize: 18 }} />} />
              <Button type="text" shape="circle" icon={<InstagramOutlined style={{ color: '#cbd5e1', fontSize: 18 }} />} />
            </Space>
          </Col>
        </Row>
      </div>
    </footer>
  );
};

export default Footer;
