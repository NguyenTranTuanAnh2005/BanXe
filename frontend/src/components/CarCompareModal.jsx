import React from 'react';
import { Modal, Table, Typography, Tag, Button, Space, Card, Row, Col, Empty } from 'antd';
import { SwapOutlined, CheckOutlined, CloseOutlined, DollarOutlined, CarOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const CarCompareModal = ({ visible, onClose, compareCars = [], onRemoveCar }) => {
  if (!compareCars || compareCars.length === 0) {
    return (
      <Modal open={visible} onCancel={onClose} footer={null} title="So Sánh Các Mẫu Xe Ô Tô" width={700}>
        <Empty description="Chưa có mẫu xe nào được chọn để so sánh. Hãy chọn ít nhất 2 xe từ showroom." />
      </Modal>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <Modal
      title={
        <Space align="center">
          <SwapOutlined style={{ color: '#0284c7', fontSize: 22 }} />
          <span>Bảng So Sánh Chi Tiết Các Mẫu Xe ({compareCars.length}/3)</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Đóng Bảng So Sánh
        </Button>
      ]}
      style={{ maxWidth: '1000px' }}
      destroyOnClose
    >
      <Row gutter={[16, 16]} justify="center" style={{ marginBottom: 24 }}>
        {compareCars.map((car) => (
          <Col xs={24} sm={12} md={Math.floor(24 / compareCars.length)} key={car.id}>
            <Card
              bordered
              style={{ textAlign: 'center', borderRadius: 12, borderColor: '#cbd5e1' }}
              cover={
                <img
                  alt={car.name}
                  src={car.image_url || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800"}
                  style={{ height: 140, objectFit: 'cover' }}
                />
              }
            >
              <Title level={5} style={{ margin: '8px 0 4px 0' }} ellipsis={{ rows: 1 }}>
                {car.name}
              </Title>
              <Text strong style={{ color: '#0284c7', fontSize: '1rem', display: 'block', marginBottom: 8 }}>
                {formatPrice(car.price)}
              </Text>
              <Button size="small" type="text" danger icon={<CloseOutlined />} onClick={() => onRemoveCar(car.id)}>
                Bỏ so sánh
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Side-by-side comparison breakdown */}
      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <Title level={5} style={{ marginBottom: 12, color: '#0f172a' }}>
          📊 Thông Số Kỹ Thuật & Tính Năng So Sánh
        </Title>
        <Table
          pagination={false}
          bordered
          size="middle"
          scroll={{ x: 'max-content' }}
          columns={[
            {
              title: 'Tiêu Chí So Sánh',
              dataIndex: 'feature',
              key: 'feature',
              width: 160,
              render: (text) => <Text strong>{text}</Text>
            },
            ...compareCars.map((car) => ({
              title: car.name,
              dataIndex: `car_${car.id}`,
              key: `car_${car.id}`,
              align: 'center',
              width: 200,
            }))
          ]}
          dataSource={[
            {
              key: '1',
              feature: 'Hãng sản xuất',
              ...compareCars.reduce((acc, car) => ({ ...acc, [`car_${car.id}`]: <Tag color="blue">{car.brand}</Tag> }), {})
            },
            {
              key: '2',
              feature: 'Giá Niêm Yết',
              ...compareCars.reduce((acc, car) => ({ ...acc, [`car_${car.id}`]: <Text strong style={{ color: '#0284c7' }}>{formatPrice(car.price)}</Text> }), {})
            },
            {
              key: '3',
              feature: 'Năm Sản Xuất',
              ...compareCars.reduce((acc, car) => ({ ...acc, [`car_${car.id}`]: car.year }), {})
            },
            {
              key: '4',
              feature: 'Loại Nhiên Liệu',
              ...compareCars.reduce((acc, car) => ({ ...acc, [`car_${car.id}`]: <Tag color={car.fuel_type === 'Điện' ? 'green' : car.fuel_type === 'Hybrid' ? 'cyan' : 'orange'}>{car.fuel_type}</Tag> }), {})
            },
            {
              key: '5',
              feature: 'Trạng Thái Kho',
              ...compareCars.reduce((acc, car) => ({ ...acc, [`car_${car.id}`]: <Tag color="success">{car.status}</Tag> }), {})
            },
            {
              key: '6',
              feature: 'Mô Tả & Động Cơ',
              ...compareCars.reduce((acc, car) => ({ ...acc, [`car_${car.id}`]: <Paragraph type="secondary" style={{ fontSize: '0.85rem', margin: 0 }}>{car.description || "N/A"}</Paragraph> }), {})
            }
          ]}
        />
      </div>
    </Modal>
  );
};

export default CarCompareModal;
