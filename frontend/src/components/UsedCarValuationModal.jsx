import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Card, Typography, Row, Col, Space, Tag, message, Result } from 'antd';
import { DollarOutlined, CarOutlined, UserOutlined, PhoneOutlined, SafetyCertificateOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const UsedCarValuationModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [valuationResult, setValuationResult] = useState(null);

  const handleCalculate = async (values) => {
    setSubmitting(true);
    try {
      const response = await axios.post('http://localhost:8000/api/valuations', values);
      setValuationResult(response.data);
      message.success('Đã tính toán định giá ước tính thành công!');
    } catch (error) {
      console.error('Lỗi định giá xe:', error);
      message.error('Có lỗi xảy ra khi kết nối hệ thống định giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleReset = () => {
    setValuationResult(null);
    form.resetFields();
  };

  return (
    <Modal
      title={
        <Space align="center">
          <DollarOutlined style={{ color: '#10b981', fontSize: 22 }} />
          <span>Định Giá Xe Cũ & Đổi Xe Mới Trợ Giá (Trade-In)</span>
        </Space>
      }
      open={visible}
      onCancel={() => { setValuationResult(null); onClose(); }}
      footer={null}
      style={{ maxWidth: '720px' }}
      destroyOnClose
    >
      {!valuationResult ? (
        <>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Nhập thông tin chiếc xe hiện tại của bạn để thuật toán TuanAnh Auto thẩm định giá thị trường chính xác nhất và nhận ưu đãi thu cũ đổi mới.
          </Paragraph>

          <Form form={form} layout="vertical" onFinish={handleCalculate}>
            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="customer_name"
                  label="Họ và Tên Chủ Xe"
                  rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="Số Điện Thoại"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="0987 654 321" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="brand"
                  label="Hãng Xe Hiện Tại"
                  rules={[{ required: true, message: 'Vui lòng chọn hãng xe!' }]}
                >
                  <Select placeholder="Chọn hãng xe" style={{ width: '100%' }}>
                    <Option value="Mercedes-Benz">Mercedes-Benz</Option>
                    <Option value="BMW">BMW</Option>
                    <Option value="Porsche">Porsche</Option>
                    <Option value="Toyota">Toyota</Option>
                    <Option value="Ford">Ford</Option>
                    <Option value="Hyundai">Hyundai</Option>
                    <Option value="Kia">Kia</Option>
                    <Option value="Honda">Honda</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="model_name"
                  label="Tên Dòng Xe & Phiên Bản"
                  rules={[{ required: true, message: 'Vui lòng nhập dòng xe!' }]}
                >
                  <Input placeholder="Ví dụ: Camry 2.5Q, C200..." />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="manufacture_year"
                  label="Năm Sản Xuất"
                  rules={[{ required: true, message: 'Nhập năm sản xuất!' }]}
                  initialValue={2021}
                >
                  <InputNumber min={2010} max={2024} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="mileage_km"
                  label="Số KM Đã Đi (Odometer)"
                  rules={[{ required: true, message: 'Nhập số KM!' }]}
                  initialValue={30000}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                    addonAfter="KM"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="condition_rating"
                  label="Tình Trạng Xe"
                  rules={[{ required: true, message: 'Chọn tình trạng!' }]}
                  initialValue="Rất tốt"
                >
                  <Select style={{ width: '100%' }}>
                    <Option value="Xuất sắc">Xuất Sắc (Như mới)</Option>
                    <Option value="Rất tốt">Rất Tốt (Giữ gìn kỹ)</Option>
                    <Option value="Khá">Khá (Có trầy xước nhẹ)</Option>
                    <Option value="Trung bình">Trung Bình</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={submitting}
              icon={<DollarOutlined />}
              style={{ background: '#10b981', borderColor: '#10b981', fontWeight: 600, marginTop: 12 }}
            >
              Tính Giá Định Giá Ước Tính
            </Button>
          </Form>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <Result
            status="success"
            title="Kết Quả Định Giá Ước Tính Thị Trường"
            subTitle={`Mẫu xe ${valuationResult.brand} ${valuationResult.model_name} (Năm ${valuationResult.manufacture_year})`}
          />

          <Card style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', borderRadius: 12, borderColor: '#a7f3d0', marginBottom: 20 }}>
            <Text type="secondary" style={{ fontSize: '0.9rem', display: 'block' }}>KHOẢNG GIÁ THU MUA ƯỚC TÍNH DỰ KIẾN:</Text>
            <Title level={2} style={{ color: '#047857', margin: '8px 0', fontWeight: 800 }}>
              {formatPrice(valuationResult.estimated_value_min)} - {formatPrice(valuationResult.estimated_value_max)}
            </Title>
            <Tag color="green" icon={<CheckCircleOutlined />}>Tặng thêm 30 Triệu VNĐ voucher khi Thu cũ Đổi mới lấy Xe sang tại TuanAnh Auto</Tag>
          </Card>

          <Space size="middle">
            <Button size="large" onClick={handleReset}>
              Định Giá Xe Khác
            </Button>
            <Button type="primary" size="large" style={{ background: '#0284c7' }} onClick={onClose}>
              Xác Nhận & Đặt Hẹn Xem Xe
            </Button>
          </Space>
        </div>
      )}
    </Modal>
  );
};

export default UsedCarValuationModal;
