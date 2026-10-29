import React, { useState, useEffect } from 'react';
import { Layout, Tabs, Typography, Badge, message } from 'antd';
import { CarOutlined, DashboardOutlined, PlusCircleOutlined, MessageOutlined } from '@ant-design/icons';
import axios from 'axios';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CarList from './components/CarList';
import AdminDashboard from './components/AdminDashboard';
import ChatbotWidget from './components/ChatbotWidget';
import AuthModal from './components/AuthModal';
import PostCarModal from './components/PostCarModal';
import MessagesModal from './components/MessagesModal';

const { Content } = Layout;

const App = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [chatOpen, setChatOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tuananh_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Modal Visibility States
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState('login');
  const [postCarModalVisible, setPostCarModalVisible] = useState(false);
  const [messagesModalVisible, setMessagesModalVisible] = useState(false);

  // Unread messages counter
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch unread messages count for logged-in seller or user
  const fetchUnreadCount = async () => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }
    try {
      const params = {};
      if (currentUser.role === 'seller') {
        params.seller_id = currentUser.id;
      } else if (currentUser.role === 'customer') {
        params.sender_id = currentUser.id;
      }
      const res = await axios.get('http://localhost:8000/api/messages', { params });
      const unread = res.data.filter(m => !m.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      // Quiet fail if backend message route temporarily busy
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [currentUser]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('tuananh_auth_user');
    localStorage.removeItem('tuananh_auth_token');
    setCurrentUser(null);
    setUnreadCount(0);
    message.info('Đã đăng xuất khỏi hệ thống.');
  };

  // Open Post Car Modal with Auth Check
  const handleOpenPostCar = () => {
    if (!currentUser) {
      message.info('Vui lòng đăng ký hoặc đăng nhập tài khoản Người Bán Xe để đăng bài!');
      setAuthInitialTab('login');
      setAuthModalVisible(true);
      return;
    }
    setPostCarModalVisible(true);
  };

  // Open Messages Modal with Auth Check
  const handleOpenMessages = () => {
    if (!currentUser) {
      message.info('Vui lòng đăng nhập để xem hộp thư tin nhắn!');
      setAuthInitialTab('login');
      setAuthModalVisible(true);
      return;
    }
    setMessagesModalVisible(true);
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <span style={{ fontWeight: 600, padding: '2px 8px' }}>
          <CarOutlined style={{ marginRight: 6, color: '#0284c7' }} />
          Showroom & Bộ Lọc
        </span>
      ),
      children: (
        <CarList 
          currentUser={currentUser} 
          refreshTrigger={refreshTrigger} 
        />
      ),
    },
    {
      key: '2',
      label: (
        <span style={{ fontWeight: 600, padding: '2px 8px' }}>
          <Badge dot color="blue">
            <DashboardOutlined style={{ marginRight: 6, color: '#10b981' }} />
          </Badge>
          Quản Trị Admin (MySQL)
        </span>
      ),
      children: <AdminDashboard />,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Enhanced Header Banner with User Profile & Post Car */}
      <Navbar 
        activeTab={activeTab} 
        onTabChange={(key) => setActiveTab(key)} 
        onOpenChat={() => setChatOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => { setAuthInitialTab('login'); setAuthModalVisible(true); }}
        onOpenPostCar={handleOpenPostCar}
        onOpenMessages={handleOpenMessages}
        unreadCount={unreadCount}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <Content style={{ padding: '16px', maxWidth: 1240, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={tabItems}
          size="middle"
          type="card"
          tabBarStyle={{ marginBottom: 20 }}
        />
      </Content>

      {/* Floating AI Chatbot Widget (Gemma 3:1B) */}
      <ChatbotWidget openFromParent={chatOpen} onCloseParent={() => setChatOpen(false)} />

      {/* Modals for Auth, Post Car, Messages */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        initialTab={authInitialTab}
        onSuccess={(user) => {
          setCurrentUser(user);
          fetchUnreadCount();
        }}
      />

      <PostCarModal
        visible={postCarModalVisible}
        onClose={() => setPostCarModalVisible(false)}
        currentUser={currentUser}
        onCarPosted={() => {
          setRefreshTrigger(prev => prev + 1);
        }}
      />

      <MessagesModal
        visible={messagesModalVisible}
        onClose={() => {
          setMessagesModalVisible(false);
          fetchUnreadCount();
        }}
        currentUser={currentUser}
      />

      {/* Comprehensive Rich Footer */}
      <Footer />
    </Layout>
  );
};

export default App;
