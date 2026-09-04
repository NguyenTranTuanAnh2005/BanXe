import React, { useState } from 'react';
import { Layout, Tabs, Typography, Badge } from 'antd';
import { CarOutlined, DashboardOutlined, CalculatorOutlined, DollarOutlined } from '@ant-design/icons';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CarList from './components/CarList';
import AdminDashboard from './components/AdminDashboard';
import ChatbotWidget from './components/ChatbotWidget';

const { Content } = Layout;

const App = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [chatOpen, setChatOpen] = useState(false);

  const tabItems = [
    {
      key: '1',
      label: (
        <span style={{ fontWeight: 600, padding: '2px 8px' }}>
          <CarOutlined style={{ marginRight: 6, color: '#0284c7' }} />
          Showroom & Bộ Lọc
        </span>
      ),
      children: <CarList />,
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
      {/* Enhanced Header Banner */}
      <Navbar activeTab={activeTab} onTabChange={(key) => setActiveTab(key)} onOpenChat={() => setChatOpen(true)} />

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

      {/* Comprehensive Rich Footer */}
      <Footer />
    </Layout>
  );
};

export default App;
