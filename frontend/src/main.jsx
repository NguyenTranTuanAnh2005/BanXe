import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#0284c7', // Elegant ocean blue primary color
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif",
          colorBgContainer: '#ffffff',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
