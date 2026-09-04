import React, { useState, useEffect, useRef } from 'react';
import { Button, Drawer, Input, Space, Tag, Typography, Avatar, Card, Spin, Alert, Tooltip, Badge, message } from 'antd';
import { 
  RobotOutlined, 
  SendOutlined, 
  CloseOutlined, 
  ThunderboltOutlined, 
  ReloadOutlined, 
  InfoCircleOutlined,
  UserOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Text, Title, Paragraph } = Typography;

const ChatbotWidget = ({ openFromParent, onCloseParent }) => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là Trợ Lý AI của TuanAnh Auto (vận hành bởi mô hình **Gemma 3:1B**). Bạn cần tôi tư vấn mẫu xe ô tô nào hôm nay?'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState({ online: false, gemma3_ready: false, message: 'Đang kiểm tra...' });
  const [checkingStatus, setCheckingStatus] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (openFromParent) {
      setVisible(true);
    }
  }, [openFromParent]);

  const checkStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await axios.get('http://localhost:8000/api/chat/status');
      setOllamaStatus(res.data);
    } catch (err) {
      setOllamaStatus({
        online: false,
        gemma3_ready: false,
        message: 'Chưa kết nối Backend FastAPI hoặc Ollama. Hãy chạy lệnh CMD: ollama run gemma3:1b'
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000); // Re-check every 15s
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (visible) {
      scrollToBottom();
    }
  }, [messages, visible]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMsg;
    if (!text || !text.trim()) return;

    const userMessage = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMsg('');
    setLoading(true);

    try {
      const historyPayload = newMessages.slice(1, -1).map(m => ({ role: m.role, content: m.content }));
      
      const response = await axios.post('http://localhost:8000/api/chat', {
        message: text.trim(),
        history: historyPayload
      });

      if (response.data && response.data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: response.data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Không nhận được phản hồi từ AI.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: '⚠️ Không thể gửi yêu cầu đến Ollama. Hãy đảm bảo bạn đã mở CMD và chạy lệnh: `ollama run gemma3:1b`'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (q) => {
    handleSend(q);
  };

  const handleClose = () => {
    setVisible(false);
    if (onCloseParent) onCloseParent();
  };

  return (
    <>
      {/* Floating Action Button (FAB) for AI Chatbot */}
      {!visible && (
        <Tooltip title="Trợ Lý AI Gemma 3:1B Tư Vấn Ô Tô" placement="left">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<RobotOutlined style={{ fontSize: 26 }} />}
            onClick={() => setVisible(true)}
            style={{
              position: 'fixed',
              bottom: 80,
              right: 24,
              zIndex: 999,
              width: 58,
              height: 58,
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              borderColor: '#0284c7',
              boxShadow: '0 6px 20px rgba(2, 132, 199, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </Tooltip>
      )}

      {/* AI Chat Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Space align="center">
              <div style={{
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                width: 36,
                height: 36,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <RobotOutlined style={{ fontSize: 20 }} />
              </div>
              <div>
                <Text strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block' }}>
                  AI Advisor <span style={{ color: '#0284c7' }}>(Gemma 3:1B)</span>
                </Text>
                <Text type="secondary" style={{ fontSize: '0.72rem' }}>Ollama Local Model</Text>
              </div>
            </Space>

            <Tooltip title="Kiểm tra lại kết nối Ollama">
              <Button size="small" type="text" icon={<ReloadOutlined spin={checkingStatus} />} onClick={checkStatus} />
            </Tooltip>
          </div>
        }
        placement="right"
        onClose={handleClose}
        open={visible}
        width={420}
        style={{ maxWidth: '100vw' }}
        bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}
      >
        {/* Status Bar */}
        <div style={{ background: '#0f172a', padding: '8px 16px', color: '#fff', fontSize: '0.78rem' }}>
          {ollamaStatus.online && ollamaStatus.gemma3_ready ? (
            <Space>
              <Tag color="success" style={{ margin: 0, borderRadius: 10 }}>● Gemma3:1b Active</Tag>
              <Text style={{ color: '#38bdf8', fontSize: '0.75rem' }}>Đã kết nối Ollama local</Text>
            </Space>
          ) : ollamaStatus.online ? (
            <Space>
              <Tag color="warning" style={{ margin: 0, borderRadius: 10 }}>● Ollama Online</Tag>
              <Text style={{ color: '#fbbf24', fontSize: '0.75rem' }}>Cần chạy `ollama run gemma3:1b` trong CMD</Text>
            </Space>
          ) : (
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <Space>
                <Tag color="error" style={{ margin: 0, borderRadius: 10 }}>● Ollama Offline</Tag>
                <Text style={{ color: '#f87171', fontSize: '0.75rem' }}>Chưa bật Ollama local</Text>
              </Space>
              <Text style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>
                👉 Gõ trong CMD: <code style={{ color: '#38bdf8', background: '#1e293b', padding: '1px 4px', borderRadius: 4 }}>ollama run gemma3:1b</code>
              </Text>
            </Space>
          )}
        </div>

        {/* Message Log Container */}
        <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 16
              }}
            >
              <div style={{ display: 'flex', gap: 8, maxWidth: '85%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar
                  icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                  style={{
                    background: msg.role === 'user' ? '#0284c7' : '#0f172a',
                    flexShrink: 0
                  }}
                />

                <div
                  style={{
                    background: msg.role === 'user' ? '#0284c7' : '#ffffff',
                    color: msg.role === 'user' ? '#ffffff' : '#334155',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Avatar icon={<RobotOutlined />} style={{ background: '#0f172a' }} />
              <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '14px 14px 14px 2px', border: '1px solid #e2e8f0' }}>
                <Spin size="small" tip="Gemma 3:1B đang suy nghĩ..." />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ padding: '8px 16px', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
          <Text type="secondary" style={{ fontSize: '0.72rem', display: 'block', marginBottom: 6 }}>
            💡 Gợi ý câu hỏi nhanh:
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Tag
              color="blue"
              style={{ cursor: 'pointer', borderRadius: 12, fontSize: '0.75rem', margin: 0 }}
              onClick={() => handleQuickQuestion('Tư vấn xe Mercedes-Benz E300 AMG')}
            >
              Mercedes E300 AMG
            </Tag>
            <Tag
              color="green"
              style={{ cursor: 'pointer', borderRadius: 12, fontSize: '0.75rem', margin: 0 }}
              onClick={() => handleQuickQuestion('Các dòng xe điện có ưu đãi gì?')}
            >
              Xe Điện & Ưu Đãi
            </Tag>
            <Tag
              color="volcano"
              style={{ cursor: 'pointer', borderRadius: 12, fontSize: '0.75rem', margin: 0 }}
              onClick={() => handleQuickQuestion('Tư vấn gói vay trả góp 0%')}
            >
              Trả Góp 0%
            </Tag>
            <Tag
              color="purple"
              style={{ cursor: 'pointer', borderRadius: 12, fontSize: '0.75rem', margin: 0 }}
              onClick={() => handleQuickQuestion('Làm sao để đăng ký lái thử?')}
            >
              Đăng Ký Lái Thử
            </Tag>
          </div>
        </div>

        {/* Input Controls Area */}
        <div style={{ padding: 12, background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
          <Input.Group compact style={{ display: 'flex' }}>
            <Input
              placeholder="Nhập câu hỏi tư vấn xe..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onPressEnter={() => handleSend()}
              disabled={loading}
              style={{ flex: 1, borderRadius: '8px 0 0 8px' }}
              size="large"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleSend()}
              loading={loading}
              style={{ background: '#0284c7', borderColor: '#0284c7', borderRadius: '0 8px 8px 0' }}
              size="large"
            >
              Gửi
            </Button>
          </Input.Group>
        </div>
      </Drawer>
    </>
  );
};

export default ChatbotWidget;
