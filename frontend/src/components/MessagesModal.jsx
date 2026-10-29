import React, { useState, useEffect } from 'react';
import { Modal, List, Tag, Typography, Button, Space, Input, Empty, Spin, message, Badge, Card, Popconfirm } from 'antd';
import { 
  MessageOutlined, 
  PhoneOutlined, 
  SendOutlined, 
  CheckOutlined, 
  ReloadOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CarOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const MessagesModal = ({ visible, onClose, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyTextMap, setReplyTextMap] = useState({});
  const [replyingId, setReplyingId] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = {};
      // If seller or admin, fetch messages received
      if (currentUser?.role === 'seller') {
        params.seller_id = currentUser.id;
      } else if (currentUser?.role === 'customer') {
        params.sender_id = currentUser.id;
      }

      const response = await axios.get('http://localhost:8000/api/messages', { params });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      message.error('Không thể tải danh sách tin nhắn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchMessages();
    }
  }, [visible, currentUser]);

  const handleMarkRead = async (msgId) => {
    try {
      await axios.put(`http://localhost:8000/api/messages/${msgId}/read`);
      message.success('Đã đánh dấu đã đọc!');
      fetchMessages();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái tin nhắn.');
    }
  };

  const handleSendReply = async (msgId) => {
    const text = replyTextMap[msgId];
    if (!text || !text.trim()) {
      message.warning('Vui lòng nhập nội dung phản hồi!');
      return;
    }

    setReplyingId(msgId);
    try {
      await axios.put(`http://localhost:8000/api/messages/${msgId}/reply`, {
        reply: text
      });
      message.success('Đã gửi phản hồi đến khách hàng!');
      setReplyTextMap({ ...replyTextMap, [msgId]: '' });
      fetchMessages();
    } catch (error) {
      message.error('Lỗi khi gửi phản hồi.');
    } finally {
      setReplyingId(null);
    }
  };

  const handleDelete = async (msgId) => {
    try {
      await axios.delete(`http://localhost:8000/api/messages/${msgId}`);
      message.success('Đã xóa tin nhắn!');
      fetchMessages();
    } catch (error) {
      message.error('Lỗi khi xóa tin nhắn.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const isSellerOrAdmin = currentUser?.role === 'seller' || currentUser?.role === 'admin';

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchMessages} loading={loading}>
          Làm Mới
        </Button>
      ]}
      width={720}
      centered
      destroyOnClose
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>
            <MessageOutlined style={{ color: '#0284c7', marginRight: 8 }} />
            {isSellerOrAdmin ? "Hộp Thư Khách Hàng Hỏi Mua Xe" : "Tin Nhắn Của Bạn Đến Người Bán"}
          </Title>
          <Text type="secondary" style={{ fontSize: '0.85rem' }}>
            {isSellerOrAdmin 
              ? "Xem các tin nhắn quan tâm xe, số điện thoại khách hàng và gửi phản hồi"
              : "Theo dõi các câu hỏi bạn đã gửi và câu trả lời từ người bán"}
          </Text>
        </div>

        <Tag color="blue" style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: 12 }}>
          {messages.length} tin nhắn
        </Tag>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" tip="Đang tải tin nhắn..." />
        </div>
      ) : messages.length === 0 ? (
        <Empty 
          description={isSellerOrAdmin ? "Chưa có tin nhắn nào từ khách hàng." : "Bạn chưa gửi tin nhắn nào đến người bán."} 
          style={{ padding: '30px 0' }}
        />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={messages}
          renderItem={(item) => (
            <Card
              size="small"
              style={{
                marginBottom: 12,
                borderRadius: 10,
                border: item.is_read ? '1px solid #e2e8f0' : '1.5px solid #38bdf8',
                background: item.is_read ? '#ffffff' : '#f0f9ff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <Space align="center" size="small">
                  <UserOutlined style={{ color: '#0284c7', fontSize: 16 }} />
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{item.sender_name}</strong>
                  {item.sender_phone && (
                    <a href={`tel:${item.sender_phone}`} style={{ textDecoration: 'none' }}>
                      <Tag color="cyan" icon={<PhoneOutlined />} style={{ cursor: 'pointer' }}>
                        {item.sender_phone}
                      </Tag>
                    </a>
                  )}
                  {!item.is_read && isSellerOrAdmin && (
                    <Tag color="red">MỚI</Tag>
                  )}
                </Space>

                <Space size="small">
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {formatDate(item.created_at)}
                  </span>
                  
                  {isSellerOrAdmin && !item.is_read && (
                    <Button 
                      size="small" 
                      type="text" 
                      icon={<CheckOutlined style={{ color: '#10b981' }} />}
                      onClick={() => handleMarkRead(item.id)}
                      title="Đánh dấu đã đọc"
                    />
                  )}

                  <Popconfirm title="Xác nhận xóa tin nhắn này?" onConfirm={() => handleDelete(item.id)}>
                    <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </div>

              {/* Related Car Tag */}
              {item.car_name && (
                <div style={{ marginBottom: 6 }}>
                  <Tag color="blue" icon={<CarOutlined />}>
                    Mẫu xe: <strong>{item.car_name}</strong> (Mã xe #{item.car_id})
                  </Tag>
                </div>
              )}

              {/* Message Content */}
              <div style={{ 
                background: '#ffffff', 
                padding: '8px 12px', 
                borderRadius: 6, 
                border: '1px solid #f1f5f9',
                color: '#334155',
                fontSize: '0.9rem',
                marginBottom: 8
              }}>
                {item.content}
              </div>

              {/* Existing Seller Reply */}
              {item.reply && (
                <div style={{ 
                  background: '#f0fdf4', 
                  border: '1px solid #bbf7d0', 
                  borderRadius: 6, 
                  padding: '8px 12px',
                  marginBottom: 8
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534', marginBottom: 2 }}>
                    💬 Phản hồi từ Người Bán:
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#14532d' }}>
                    {item.reply}
                  </div>
                </div>
              )}

              {/* Seller Reply Form */}
              {isSellerOrAdmin && (
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <Input 
                    placeholder="Nhập nội dung phản hồi cho khách..."
                    value={replyTextMap[item.id] || ''}
                    onChange={(e) => setReplyTextMap({ ...replyTextMap, [item.id]: e.target.value })}
                    onPressEnter={() => handleSendReply(item.id)}
                    size="small"
                  />
                  <Button 
                    type="primary" 
                    size="small"
                    icon={<SendOutlined />}
                    loading={replyingId === item.id}
                    onClick={() => handleSendReply(item.id)}
                    style={{ background: '#0284c7', borderColor: '#0284c7' }}
                  >
                    Trả Lời
                  </Button>
                </div>
              )}
            </Card>
          )}
        />
      )}
    </Modal>
  );
};

export default MessagesModal;
