import React, { useState } from 'react';
import { Modal, Select, Checkbox, Table, Typography, Card, Row, Col, Tag, Space, Divider, Alert } from 'antd';
import { CalculatorOutlined, EnvironmentOutlined, DollarOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const OnRoadCalculatorModal = ({ visible, onClose, car }) => {
  const [region, setRegion] = useState('hanoi'); // 'hanoi', 'hcm', 'province'
  const [includePhysicalInsurance, setIncludePhysicalInsurance] = useState(true);

  if (!car) return null;

  // Calculation rules according to Vietnamese Automotive Tax Regulations
  const basePrice = car.price || 0;
  const isElectric = car.fuel_type === 'Điện';

  // 1. Lệ phí trước bạ (Electric cars in VN currently get 0% registration tax rebate!)
  let taxRate = 0.10;
  if (region === 'hanoi') taxRate = 0.12;
  if (isElectric) taxRate = 0.0; // 0% rebate for EV

  const registrationTax = basePrice * taxRate;

  // 2. Phí cấp biển số
  let licensePlateFee = 20000000; // 20M for HN & HCM
  if (region === 'province') licensePlateFee = 1000000; // 1M for other provinces

  // 3. Fixed statutory fees
  const inspectionFee = 90000; // Phí kiểm định
  const roadMaintenanceFee = 1560000; // Phí đường bộ (12 tháng)
  const civilInsuranceFee = 480700; // BH TNDS (xe dưới 6 chỗ)

  // 4. Voluntary physical damage insurance (Bảo hiểm vật chất 1.5%)
  const physicalInsuranceFee = includePhysicalInsurance ? basePrice * 0.015 : 0;

  // Total On-Road Cost
  const totalOnRoadPrice = basePrice + registrationTax + licensePlateFee + inspectionFee + roadMaintenanceFee + civilInsuranceFee + physicalInsuranceFee;

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const feeDataSource = [
    { key: '1', item: 'Giá Niêm Yết Xe Ô Tô', cost: basePrice, note: 'Giá công bố từ TuanAnh Auto' },
    { 
      key: '2', 
      item: `Lệ Phí Trước Bạ (${(taxRate * 100).toFixed(0)}%)`, 
      cost: registrationTax, 
      note: isElectric ? 'Ưu đãi 0% lệ phí trước bạ cho Xe Điện' : (region === 'hanoi' ? '12% tại Hà Nội' : '10% tại TP.HCM & Tỉnh') 
    },
    { key: '3', item: 'Phí Cấp Biển Số Xe', cost: licensePlateFee, note: region === 'province' ? '1.000.000đ (Các Tỉnh thành)' : '20.000.000đ (HN & TP.HCM)' },
    { key: '4', item: 'Phí Đăng Kiểm Lần Đầu', cost: inspectionFee, note: 'Theo quy định Cục Đăng Kiểm' },
    { key: '5', item: 'Phí Bảo Trì Đường Bộ (1 Năm)', cost: roadMaintenanceFee, note: '1.560.000đ/Năm' },
    { key: '6', item: 'Bảo Hiểm TNDS Bắt Buộc', cost: civilInsuranceFee, note: 'Bảo hiểm trách nhiệm dân sự' },
    { 
      key: '7', 
      item: 'Bảo Hiểm Vật Chất Xe (Tự Nguyện 1.5%)', 
      cost: physicalInsuranceFee, 
      note: includePhysicalInsurance ? 'Bảo vệ toàn diện thân vỏ & động cơ' : 'Không đăng ký' 
    },
  ];

  const columns = [
    { title: 'Hạng Mục Chi Phí', dataIndex: 'item', key: 'item', render: (text) => <Text strong>{text}</Text> },
    { title: 'Số Tiền (VND)', dataIndex: 'cost', key: 'cost', align: 'right', render: (cost) => <Text strong style={{ color: '#0284c7' }}>{formatPrice(cost)}</Text> },
    { title: 'Ghi Chú Chi Tiết', dataIndex: 'note', key: 'note', render: (note) => <Text type="secondary" style={{ fontSize: '0.85rem' }}>{note}</Text> },
  ];

  return (
    <Modal
      title={
        <Space align="center">
          <CalculatorOutlined style={{ color: '#0284c7', fontSize: 22 }} />
          <span>Bảng Tính Dự Tính Chi Phí Lăn Bánh Xe Ô Tô</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      style={{ maxWidth: '800px' }}
      destroyOnClose
    >
      {/* Car Info Header */}
      <Card style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', marginBottom: 16, borderRadius: 12, borderColor: '#bae6fd' }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} sm={16}>
            <Text type="secondary" style={{ fontSize: '0.85rem' }}>Mẫu xe đang tính toán:</Text>
            <Title level={4} style={{ margin: '2px 0 0 0', color: '#0369a1' }}>
              {car.name} ({car.brand} - {car.year})
            </Title>
            <Tag color={car.fuel_type === 'Điện' ? 'green' : 'blue'} style={{ marginTop: 6 }}>
              {car.fuel_type}
            </Tag>
          </Col>
          <Col xs={24} sm={8}>
            <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block' }}>Giá Niêm Yết Showroom</Text>
            <Title level={3} style={{ margin: 0, color: '#0284c7' }}>
              {formatPrice(car.price)}
            </Title>
          </Col>
        </Row>
      </Card>

      {/* Region & Insurance Options */}
      <Row gutter={[16, 12]} align="middle" style={{ marginBottom: 16 }}>
        <Col xs={24} sm={14}>
          <Text strong style={{ display: 'block', marginBottom: 6 }}>
            <EnvironmentOutlined style={{ color: '#0284c7', marginRight: 6 }} />
            Chọn Tỉnh / Thành Phố Đăng Ký Biển Số:
          </Text>
          <Select value={region} onChange={(val) => setRegion(val)} style={{ width: '100%' }} size="large">
            <Option value="hanoi">Hà Nội (Trước bạ 12% - Biển 20 Tr)</Option>
            <Option value="hcm">TP. Hồ Chí Minh (Trước bạ 10% - Biển 20 Tr)</Option>
            <Option value="province">Các Tỉnh Thành Khác (Trước bạ 10% - Biển 1 Tr)</Option>
          </Select>
        </Col>

        <Col xs={24} sm={10}>
          <Text strong style={{ display: 'block', marginBottom: 6 }}>Bảo Hiểm Vật Chất (Thân Vỏ):</Text>
          <Checkbox 
            checked={includePhysicalInsurance} 
            onChange={(e) => setIncludePhysicalInsurance(e.target.checked)}
            style={{ marginTop: 4 }}
          >
            Tính thêm BH vật chất (1.5%)
          </Checkbox>
        </Col>
      </Row>

      {/* Breakdown Table */}
      <Table columns={columns} dataSource={feeDataSource} pagination={false} size="small" bordered scroll={{ x: 'max-content' }} />

      <Divider style={{ margin: '16px 0 12px 0' }} />

      {/* Summary Highlight */}
      <div style={{ background: '#0f172a', padding: '16px 20px', borderRadius: 12, color: '#fff' }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} sm={14}>
            <Text style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block' }}>TỔNG CHI PHÍ LĂN BÁNH DỰ TÍNH (TRỌN GÓI)</Text>
            <Text style={{ color: '#38bdf8', fontSize: '0.75rem' }}>* Đã bao gồm toàn bộ thuế, phí biển số & thủ tục giấy tờ</Text>
          </Col>
          <Col xs={24} sm={10}>
            <Title level={2} style={{ color: '#38bdf8', margin: 0, fontWeight: 800 }}>
              {formatPrice(totalOnRoadPrice)}
            </Title>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default OnRoadCalculatorModal;
