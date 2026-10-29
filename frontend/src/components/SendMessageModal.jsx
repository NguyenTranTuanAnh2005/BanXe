import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, Space, Tag, message, Card, Row, Col } from 'antd';
import { 
  MessageOutlined, 
  SendOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const QUICK_QUESTIONS = [
  "Xe này hiện tại còn sẵn ở showroom không ạ?",
  "Tôi muốn hẹn đến xem xe và lái thử cuối tuần này.",
  "Giá xe này có thể thương lượng hoặc bớt lộc thêm không bạn?",
  "Đại lý có hỗ trợ vay trả góp ngân hàng 0% cho xe này không?",
  "Tôi có xe cũ muốn đổi lấy xe này, thủ tục thế nào ạ?"
];

const SendMessageModal = ({ visible, onClose, car, currentUser, onMessageSent }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && car) {
      form.setFieldsValue({
        sender_name: currentUser?.full_name || currentUser?.username || '',
        sender_phone: currentUser?.phone || '',
        sender_email: currentUser?.email || '',
        content: `Chào bạn, tôi đang quan tâm đến mẫu xe ${car.name} (giá ${new Intl.NumberFormat('vi-VN').format(car.price)} VND). Xin vui lòng tư vấn thêm cho tôi.`
      });
    }
  }, [visible, car, currentUser, form]);

  const handleSelectQuickQuestion = (question) => {
    form.setFieldsValue({ content: question });
  };

  const handleSend = async (values) => {
    if (!car) return;

    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/messages', {
        car_id: car.id,
        sender_id: currentUser ? currentUser.id : null,
        sender_name: values.sender_name,
        sender_phone: values.sender_phone,
        sender_email: values.sender_email,
        content: values.content,
        seller_id: car.seller_id || null
      });

      message.success(`Đã gửi tin nhắn đến người bán xe "${car.name}" thành công! Người bán sẽ phản hồi sớm qua SĐT của bạn.`);
      if (onMessageSent) onMessageSent();
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Không thể gửi tin nhắn. Vui lòng kiểm tra lại kết nối!');
    } finally {
      setLoading(false);
    }
  };

  if (!car) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      destroyOnClose
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>
          <MessageOutlined style={{ color: '#0284c7', marginRight: 8 }} />
          Gửi Tin Nhắn Đến Người Bán Xe
        </Title>
        <Text type="secondary" style={{ fontSize: '0.85rem' }}>
          Trao đổi trực tiếp với người bán hoặc showroom về mẫu xe bạn quan tâm
        </Text>
      </div>

      {/* Target Car Summary Card */}
      <Card 
        size="small" 
        style={{ 
          marginBottom: 16, 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: 8 
        }}
      >
        <Row gutter={12} align="middle">
          <Col span={6}>
            <img 
              src={car.image_url || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800"} 
              alt={car.name}
              style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 6 }}
            />
          </Col>
          <Col span={18}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              {car.name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
              <span style={{ color: '#0284c7', fontWeight: 700, fontSize: '0.9rem' }}>
                {formatPrice(car.price)}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Người bán: <strong>{car.contact_name || "TuanAnh Auto"}</strong>
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      <Form form={form} layout="vertical" onFinish={handleSend}>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="sender_name"
              label="Họ và Tên của Bạn"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
            >
              <Input prefix={<UserOutlined style={{ color: '#0284c7' }} />} placeholder="VD: Nguyễn Văn A" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="sender_phone"
              label="Số Điện Thoại Nhận Phản Hồi"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
              <Input prefix={<PhoneOutlined style={{ color: '#0284c7' }} />} placeholder="VD: 0912 345 678" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="sender_email" label="Email (Không bắt buộc)">
          <Input prefix={<MailOutlined style={{ color: '#0284c7' }} />} placeholder="email@gmail.com" />
        </Form.Item>

        {/* Quick Suggestion Chips */}
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary" style={{ fontSize: '0.78rem', display: 'block', marginBottom: 6 }}>
            💡 GỢI Ý CÂU HỎI NHANH (BẤM ĐỂ CHỌN):
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {QUICK_QUESTIONS.map((q, idx) => (
              <Tag 
                key={idx} 
                color="blue" 
                style={{ cursor: 'pointer', padding: '3px 8px', borderRadius: 12, fontSize: '0.75rem', margin: 0 }}
                onClick={() => handleSelectQuickQuestion(q)}
              >
                + {q}
              </Tag>
            ))}
          </div>
        </div>

        <Form.Item
          name="content"
          label="Nội Dung Tin Nhắn"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung tin nhắn!' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Nhập nội dung bạn muốn hỏi người bán (tình trạng xe, giá cả, thời gian xem xe, thủ tục vay mua...)" 
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={loading}
          icon={<SendOutlined />}
          style={{
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            borderColor: '#0284c7',
            fontWeight: 600,
            borderRadius: 8
          }}
        >
          Gửi Tin Nhắn Đến Người Bán
        </Button>
      </Form>
    </Modal>
  );
};

export default SendMessageModal;
