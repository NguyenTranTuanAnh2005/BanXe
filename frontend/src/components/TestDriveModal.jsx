import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, message, Typography } from 'antd';
import { UserOutlined, PhoneOutlined, CarOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;

const TestDriveModal = ({ visible, onClose, car }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    if (!car) return;
    setSubmitting(true);
    try {
      const payload = {
        customer_name: values.customer_name,
        phone: values.phone,
        car_id: car.id,
        preferred_date: values.preferred_date ? values.preferred_date.format('YYYY-MM-DD') : '',
        note: values.note || ''
      };

      await axios.post('http://localhost:8000/api/test-drives', payload);
      message.success(`Đăng ký lái thử xe ${car.name} thành công! TuanAnh Auto sẽ liên hệ quý khách.`);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng kiểm tra lại kết nối Backend FastAPI.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CarOutlined style={{ color: '#0284c7', fontSize: 20 }} />
          <span>Đăng Ký Lái Thử Trải Nghiệm Xe</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText="Gửi Đăng Ký"
      cancelText="Hủy Bỏ"
      destroyOnClose
    >
      {car && (
        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 20, border: '1px solid #e2e8f0' }}>
          <Text type="secondary" style={{ display: 'block' }}>Mẫu xe chọn lái thử:</Text>
          <Text strong style={{ fontSize: '1.05rem', color: '#0284c7' }}>{car.name} ({car.brand} - {car.year})</Text>
        </div>
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="customer_name"
          label="Họ và Tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn A" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số Điện Thoại"
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="Ví dụ: 0987654321" />
        </Form.Item>

        <Form.Item
          name="preferred_date"
          label="Ngày Dự Kiến Lái Thử"
          rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
        >
          <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày" format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item name="note" label="Ghi Chú Thêm (Nếu Có)">
          <Input.TextArea rows={3} placeholder="Ví dụ: Lái thử vào buổi sáng..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TestDriveModal;
