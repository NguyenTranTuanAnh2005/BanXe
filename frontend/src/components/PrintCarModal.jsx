import React from 'react';
import { Modal, Button, Typography, Space, Row, Col, Tag, Divider } from 'antd';
import { 
  PrinterOutlined, 
  CarOutlined, 
  CheckCircleOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  CalendarOutlined,
  CloseOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const PrintCarModal = ({ visible, onClose, car }) => {
  if (!car) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={780}
      footer={[
        <Button key="close" className="no-print" onClick={onClose} icon={<CloseOutlined />}>
          Đóng
        </Button>,
        <Button 
          key="print" 
          type="primary" 
          className="no-print" 
          icon={<PrinterOutlined />} 
          style={{ background: '#0284c7', borderColor: '#0284c7', fontWeight: 600 }}
          onClick={handlePrint}
        >
          In Bài Đăng Ngay
        </Button>
      ]}
      centered
      destroyOnClose
    >
      <div className="print-document print-document-container" id="printable-car-listing">
        {/* 1. Header of Document */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0284c7', paddingBottom: 12, marginBottom: 16 }}>
          <Space align="center" size="middle">
            <div style={{ 
              background: '#0284c7', 
              color: '#fff', 
              width: 44, 
              height: 44, 
              borderRadius: 8, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 22
            }}>
              <CarOutlined />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                TUANANH AUTO SHOWROOM
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Hệ Thống Phân Phối & Ký Gửi Ô Tô Chính Hãng Toàn Quốc
              </div>
            </div>
          </Space>

          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#475569' }}>
            <div><strong>PHIẾU THÔNG TIN BÀI ĐĂNG BÁN XE</strong></div>
            <div>Mã tin: <Tag color="blue" style={{ margin: 0, fontWeight: 700 }}>#CAR-{car.id}</Tag></div>
            <div>Ngày in: {currentDate}</div>
          </div>
        </div>

        {/* 2. Car Title & Price Highlight */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <Title level={3} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>
              {car.name}
            </Title>
            <Space size="small" style={{ marginTop: 4 }}>
              <Tag color="volcano" style={{ fontWeight: 600 }}>{car.brand}</Tag>
              <Tag color="geekblue" style={{ fontWeight: 600 }}>{car.body_type || 'Sedan'}</Tag>
              <Tag color="purple" style={{ fontWeight: 600 }}>Đời {car.year}</Tag>
              <Tag color="green" style={{ fontWeight: 600 }}>Nhiên liệu: {car.fuel_type}</Tag>
            </Space>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              GIÁ NIÊM YẾT CHÍNH THỨC
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0284c7', lineHeight: 1.2 }}>
              {formatPrice(car.price)}
            </div>
          </div>
        </div>

        {/* 3. Image & Key Specifications Table */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={11}>
            <div style={{ 
              borderRadius: 8, 
              overflow: 'hidden', 
              border: '1px solid #cbd5e1', 
              height: 220,
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={car.image_url || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800"}
                alt={car.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </Col>

          <Col xs={24} sm={13}>
            <table className="spec-table" style={{ margin: 0 }}>
              <tbody>
                <tr>
                  <th>Tên Mẫu Xe</th>
                  <td><strong>{car.name}</strong></td>
                </tr>
                <tr>
                  <th>Hãng Sản Xuất</th>
                  <td>{car.brand}</td>
                </tr>
                <tr>
                  <th>Năm Sản Xuất</th>
                  <td>{car.year}</td>
                </tr>
                <tr>
                  <th>Kiểu Dáng / Dòng Xe</th>
                  <td>{car.body_type || 'Sedan'}</td>
                </tr>
                <tr>
                  <th>Động Cơ / Nhiên Liệu</th>
                  <td>{car.fuel_type}</td>
                </tr>
                <tr>
                  <th>Tình Trạng Xe</th>
                  <td><Tag color="success">{car.status || 'Có sẵn'}</Tag></td>
                </tr>
                <tr>
                  <th>Bảo Hành</th>
                  <td>Chính hãng 5 năm / 100.000 KM</td>
                </tr>
              </tbody>
            </table>
          </Col>
        </Row>

        {/* 4. Description Box (Phần Mô Tả Chi Tiết Bài Đăng) */}
        <div style={{ 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: 8, 
          padding: '12px 16px', 
          marginBottom: 16 
        }}>
          <div style={{ 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            color: '#0369a1', 
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <SafetyCertificateOutlined />
            <span>MÔ TẢ CHI TIẾT TỪ NGƯỜI ĐĂNG BÁN XE:</span>
          </div>
          <Paragraph style={{ 
            margin: 0, 
            fontSize: '0.88rem', 
            lineHeight: 1.6, 
            color: '#334155',
            whiteSpace: 'pre-line'
          }}>
            {car.description || "Xe còn rất mới, giữ gìn cẩn thận, bảo dưỡng định kỳ đúng tiêu chuẩn hãng. Nội ngoại thất sang trọng, trang bị đầy đủ tính năng tiện nghi và an toàn hàng đầu phân khúc."}
          </Paragraph>
        </div>

        {/* 5. Contact Seller & Showroom Details */}
        <Row gutter={[16, 12]} style={{ 
          border: '1px solid #cbd5e1', 
          borderRadius: 8, 
          padding: '10px 14px', 
          background: '#ffffff',
          marginBottom: 16
        }}>
          <Col xs={24} sm={12}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase' }}>
              NGƯỜI ĐĂNG BÁN / ĐẠI LÝ LIÊN HỆ
            </div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
              {car.contact_name || "Tuấn Anh Auto Showroom"}
            </div>
            <div style={{ color: '#0284c7', fontWeight: 600, fontSize: '0.9rem', marginTop: 2 }}>
              <PhoneOutlined style={{ marginRight: 6 }} />
              Hotline/Zalo: {car.contact_phone || "0988 776 655 / 1900 6868"}
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase' }}>
              ĐỊA CHỈ XEM XE & LÁI THỬ TRỰC TIẾP
            </div>
            <div style={{ fontSize: '0.88rem', color: '#334155' }}>
              <EnvironmentOutlined style={{ marginRight: 6, color: '#0284c7' }} />
              88 Nguyễn Văn Cừ, Long Biên, Hà Nội
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
              Giờ phục vụ: 08:00 - 20:00 (Tất cả các ngày trong tuần)
            </div>
          </Col>
        </Row>

        {/* 6. Commitments & Signature Area */}
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 10, fontSize: '0.78rem', color: '#64748b' }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Col span={24}>
              <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>CAM KẾT CHẤT LƯỢNG TUANANH AUTO:</div>
              <div>• Cam kết xe không tai nạn, đâm đụng, thủy kích ảnh hưởng tới khung gầm, máy móc nguyên bản.</div>
              <div>• Hồ sơ pháp lý đầy đủ, hợp lệ, sang tên nhanh chóng trong ngày. Hỗ trợ trả góp 80%.</div>
            </Col>
          </Row>

          <Row justify="space-around" style={{ textAlign: 'center', marginTop: 12 }}>
            <Col span={10}>
              <div style={{ fontWeight: 700, color: '#334155' }}>ĐẠI DIỆN BÊN BÁN</div>
              <div style={{ fontSize: '0.72rem', fontStyle: 'italic', color: '#94a3b8' }}>(Ký, ghi rõ họ tên & đóng dấu)</div>
              <div style={{ height: 48 }}></div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>{car.contact_name || "Tuấn Anh Auto"}</div>
            </Col>
            <Col span={10}>
              <div style={{ fontWeight: 700, color: '#334155' }}>KHÁCH HÀNG / BÊN MUA</div>
              <div style={{ fontSize: '0.72rem', fontStyle: 'italic', color: '#94a3b8' }}>(Ký và ghi rõ họ tên)</div>
              <div style={{ height: 48 }}></div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>..........................................</div>
            </Col>
          </Row>
        </div>
      </div>
    </Modal>
  );
};

export default PrintCarModal;
