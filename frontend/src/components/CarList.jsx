import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Select, Button, Tag, Typography, Spin, Empty, Space, Badge, Checkbox, Tooltip, FloatButton, message, Switch } from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  CarOutlined, 
  SwapOutlined, 
  CalculatorOutlined, 
  DollarOutlined, 
  SortAscendingOutlined, 
  ThunderboltOutlined,
  CloseOutlined,
  CheckOutlined,
  PrinterOutlined,
  MessageOutlined,
  UserOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import axios from 'axios';
import TestDriveModal from './TestDriveModal';
import CarCompareModal from './CarCompareModal';
import OnRoadCalculatorModal from './OnRoadCalculatorModal';
import UsedCarValuationModal from './UsedCarValuationModal';
import PrintCarModal from './PrintCarModal';
import SendMessageModal from './SendMessageModal';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CarList = ({ currentUser, refreshTrigger }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Smart Search & Filter States
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedFuel, setSelectedFuel] = useState(null);
  const [selectedBody, setSelectedBody] = useState(null);
  const [priceRange, setPriceRange] = useState(null); // 'under1b', '1b-2b', '2b-5b', 'above5b'
  const [sortBy, setSortBy] = useState('newest');
  const [onlyMyCars, setOnlyMyCars] = useState(false);

  // Modals & Tools States
  const [selectedCarForDrive, setSelectedCarForDrive] = useState(null);
  const [driveModalVisible, setDriveModalVisible] = useState(false);

  const [selectedCarForOnRoad, setSelectedCarForOnRoad] = useState(null);
  const [onRoadModalVisible, setOnRoadModalVisible] = useState(false);

  const [valuationModalVisible, setValuationModalVisible] = useState(false);

  // Print Car Modal State
  const [selectedCarForPrint, setSelectedCarForPrint] = useState(null);
  const [printModalVisible, setPrintModalVisible] = useState(false);

  // Message Seller Modal State
  const [selectedCarForMessage, setSelectedCarForMessage] = useState(null);
  const [messageModalVisible, setMessageModalVisible] = useState(false);

  // Compare List State (max 3 cars)
  const [compareCars, setCompareCars] = useState([]);
  const [compareModalVisible, setCompareModalVisible] = useState(false);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedBrand) params.brand = selectedBrand;
      if (selectedFuel) params.fuel_type = selectedFuel;
      if (selectedBody) params.body_type = selectedBody;

      // Price Range filtering
      if (priceRange === 'under1b') {
        params.max_price = 1000000000;
      } else if (priceRange === '1b-2b') {
        params.min_price = 1000000000;
        params.max_price = 2000000000;
      } else if (priceRange === '2b-5b') {
        params.min_price = 2000000000;
        params.max_price = 5000000000;
      } else if (priceRange === 'above5b') {
        params.min_price = 5000000000;
      }

      // Filter only current seller's cars if requested
      if (onlyMyCars && currentUser?.id) {
        params.seller_id = currentUser.id;
      }

      // Sorting
      if (sortBy) params.sort_by = sortBy;

      const response = await axios.get('http://localhost:8000/api/cars', { params });
      setCars(response.data);
    } catch (error) {
      console.error('Error fetching cars:', error);
      message.error('Không thể kết nối đến Backend FastAPI. Hãy kiểm tra server http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [search, selectedBrand, selectedFuel, selectedBody, priceRange, sortBy, onlyMyCars, refreshTrigger]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Compare car toggle logic
  const handleToggleCompare = (car) => {
    const exists = compareCars.some(c => c.id === car.id);
    if (exists) {
      setCompareCars(compareCars.filter(c => c.id !== car.id));
      message.info(`Đã bỏ ${car.name} khỏi danh sách so sánh.`);
    } else {
      if (compareCars.length >= 3) {
        message.warning('Bạn chỉ có thể chọn tối đa 3 xe để so sánh cùng lúc.');
        return;
      }
      setCompareCars([...compareCars, car]);
      message.success(`Đã thêm ${car.name} vào danh sách so sánh!`);
    }
  };

  // Handle open print modal
  const handleOpenPrint = (car) => {
    setSelectedCarForPrint(car);
    setPrintModalVisible(true);
  };

  // Handle open send message modal
  const handleOpenMessage = (car) => {
    setSelectedCarForMessage(car);
    setMessageModalVisible(true);
  };

  const isSeller = currentUser?.role === 'seller' || currentUser?.role === 'admin';

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <Row justify="space-between" align="middle" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Col xs={24} md={15}>
            <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
              Tìm Kiếm, Đăng Bán & Trải Nghiệm Mẫu Xe Ước Mơ
            </Title>
            <Paragraph style={{ color: '#e0f2fe', fontSize: '1rem', marginTop: 8, marginBottom: 0 }}>
              TuanAnh Auto tích hợp: Đăng bài bán xe kèm <strong>Mô tả chi tiết</strong>, In bài đăng xuất phiếu, Nhắn tin trực tiếp người bán, Tính chi phí lăn bánh & Lái thử xe.
            </Paragraph>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'right', marginTop: 16 }}>
            <Space wrap size="middle">
              <Button 
                size="large"
                icon={<DollarOutlined />}
                style={{ 
                  borderRadius: 8, 
                  fontWeight: 600, 
                  background: 'rgba(255,255,255,0.15)', 
                  color: '#fff', 
                  borderColor: 'rgba(255,255,255,0.4)',
                  backdropFilter: 'blur(5px)'
                }}
                onClick={() => setValuationModalVisible(true)}
              >
                Định Giá Xe Cũ
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Body Types Quick Category Buttons */}
      <Card style={{ marginBottom: 16, borderRadius: 12, border: '1px solid #e2e8f0' }} bodyStyle={{ padding: '12px 16px' }}>
        <Space wrap size="middle" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space wrap size="small">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginRight: 4 }}>DÒNG XE:</span>
            {[
              { label: 'Tất Cả', value: null },
              { label: 'Sedan Sang Trọng', value: 'Sedan' },
              { label: 'SUV Gầm Cao', value: 'SUV' },
              { label: 'Xe Thể Thao', value: 'Thể thao' },
              { label: 'Bán Tải Đa Dụng', value: 'Bán tải' },
            ].map((cat, idx) => {
              const isActive = selectedBody === cat.value;
              return (
                <Button
                  key={idx}
                  size="small"
                  type={isActive ? 'primary' : 'default'}
                  style={{
                    borderRadius: 20,
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    background: isActive ? '#0284c7' : '#ffffff',
                    borderColor: isActive ? '#0284c7' : '#cbd5e1',
                    color: isActive ? '#ffffff' : '#475569'
                  }}
                  onClick={() => setSelectedBody(cat.value)}
                >
                  {cat.label}
                </Button>
              );
            })}
          </Space>

          {/* Seller Filter Toggle */}
          {isSeller && (
            <Space align="center" size="small" style={{ background: '#faf5ff', padding: '4px 12px', borderRadius: 20, border: '1px solid #e9d5ff' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#7e22ce' }}>Chỉ xem xe tôi đăng:</span>
              <Switch checked={onlyMyCars} onChange={(checked) => setOnlyMyCars(checked)} />
            </Space>
          )}
        </Space>
      </Card>

      {/* 1. Smart Search & Multi-criteria Filter Bar */}
      <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={7}>
            <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>TÌM KIẾM TỪ KHÓA</Text>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Tên xe, phiên bản, mô tả..."
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="large"
            />
          </Col>

          <Col xs={12} sm={12} md={4}>
            <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>HÃNG XE</Text>
            <Select
              placeholder="Tất cả hãng"
              style={{ width: '100%' }}
              allowClear
              value={selectedBrand}
              onChange={(val) => setSelectedBrand(val)}
              size="large"
            >
              <Option value="Mercedes-Benz">Mercedes-Benz</Option>
              <Option value="BMW">BMW</Option>
              <Option value="Porsche">Porsche</Option>
              <Option value="Audi">Audi</Option>
              <Option value="Toyota">Toyota</Option>
              <Option value="Ford">Ford</Option>
              <Option value="Honda">Honda</Option>
              <Option value="Hyundai">Hyundai</Option>
              <Option value="Kia">Kia</Option>
            </Select>
          </Col>

          <Col xs={12} sm={12} md={4}>
            <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>LOẠI NHIÊN LIỆU</Text>
            <Select
              placeholder="Tất cả"
              style={{ width: '100%' }}
              allowClear
              value={selectedFuel}
              onChange={(val) => setSelectedFuel(val)}
              size="large"
            >
              <Option value="Xăng">Động cơ Xăng</Option>
              <Option value="Dầu">Động cơ Dầu</Option>
              <Option value="Điện">Thuần Điện 100%</Option>
              <Option value="Hybrid">Hybrid Tiết Kiệm</Option>
            </Select>
          </Col>

          <Col xs={12} sm={12} md={5}>
            <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>KHOẢNG GIÁ</Text>
            <Select
              placeholder="Tất cả khoảng giá"
              style={{ width: '100%' }}
              allowClear
              value={priceRange}
              onChange={(val) => setPriceRange(val)}
              size="large"
            >
              <Option value="under1b">Dưới 1 Tỷ VNĐ</Option>
              <Option value="1b-2b">Từ 1 - 2 Tỷ VNĐ</Option>
              <Option value="2b-5b">Từ 2 - 5 Tỷ VNĐ</Option>
              <Option value="above5b">Trên 5 Tỷ VNĐ</Option>
            </Select>
          </Col>

          <Col xs={12} sm={12} md={4}>
            <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>SẮP XẾP</Text>
            <Select
              value={sortBy}
              onChange={(val) => setSortBy(val)}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="newest">Mới Nhất</Option>
              <Option value="price_asc">Giá: Thấp đến Cao</Option>
              <Option value="price_desc">Giá: Cao đến Thấp</Option>
              <Option value="year_desc">Năm SX Mới Nhất</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Sticky Bottom Comparison Bar */}
      {compareCars.length > 0 && (
        <div className="sticky-compare-bar">
          <Space align="center">
            <SwapOutlined style={{ color: '#38bdf8', fontSize: 20 }} />
            <span>Đã chọn <strong>{compareCars.length}/3</strong> xe</span>
          </Space>
          <Space>
            <Button 
              type="primary" 
              style={{ background: '#0284c7', borderColor: '#0284c7', fontWeight: 600 }}
              onClick={() => setCompareModalVisible(true)}
            >
              So Sánh Ngay
            </Button>
            <Button type="text" style={{ color: '#94a3b8' }} onClick={() => setCompareCars([])}>
              Xóa hết
            </Button>
          </Space>
        </div>
      )}

      {/* Car Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Đang lọc danh sách ô tô..." />
        </div>
      ) : cars.length === 0 ? (
        <Empty 
          description={onlyMyCars ? "Bạn chưa đăng bài bán xe nào. Hãy bấm 'Đăng Tin Bán Xe' ở trên!" : "Không tìm thấy mẫu xe ô tô nào theo bộ lọc của bạn."} 
          style={{ padding: '40px 0' }} 
        />
      ) : (
        <Row gutter={[24, 24]}>
          {cars.map((car) => {
            const isCompared = compareCars.some(c => c.id === car.id);

            return (
              <Col xs={24} sm={12} lg={8} key={car.id}>
                <Card
                  className="car-card"
                  cover={
                    <div style={{ position: 'relative' }}>
                      <img
                        alt={car.name}
                        src={car.image_url || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800"}
                      />
                      <Tag 
                        color={car.fuel_type === 'Điện' ? 'green' : car.fuel_type === 'Hybrid' ? 'cyan' : 'blue'}
                        style={{ position: 'absolute', top: 12, right: 12, borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}
                      >
                        {car.fuel_type}
                      </Tag>

                      {/* Compare Checkbox Badge */}
                      <div style={{ position: 'absolute', top: 12, left: 12 }}>
                        <Button
                          size="small"
                          type={isCompared ? 'primary' : 'default'}
                          icon={isCompared ? <CheckOutlined /> : <SwapOutlined />}
                          onClick={() => handleToggleCompare(car)}
                          style={{
                            borderRadius: 16,
                            fontSize: '0.75rem',
                            background: isCompared ? '#0284c7' : 'rgba(255,255,255,0.95)',
                            borderColor: isCompared ? '#0284c7' : '#cbd5e1',
                            color: isCompared ? '#fff' : '#334155'
                          }}
                        >
                          {isCompared ? 'Đã chọn so sánh' : 'So sánh'}
                        </Button>
                      </div>
                    </div>
                  }
                >
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size="xs">
                      <Tag color="volcano">{car.brand}</Tag>
                      <Tag color="geekblue">{car.body_type || 'Sedan'}</Tag>
                      <Tag color="purple">Đời {car.year}</Tag>
                    </Space>

                    <Tag color="success" style={{ margin: 0 }}>{car.status || 'Có sẵn'}</Tag>
                  </div>
                  
                  <Title level={4} style={{ margin: '0 0 6px 0', fontSize: '1.15rem' }} ellipsis={{ rows: 1 }}>
                    {car.name}
                  </Title>
                  
                  {/* Car Description (Phần Mô Tả Xe) */}
                  <Paragraph 
                    type="secondary" 
                    ellipsis={{ rows: 2, tooltip: car.description }} 
                    style={{ height: 42, fontSize: '0.85rem', marginBottom: 10, lineHeight: 1.5 }}
                  >
                    {car.description || "Xe sang chính hãng, trang bị đầy đủ tính năng an toàn hàng đầu, bảo dưỡng chính hãng."}
                  </Paragraph>

                  {/* Seller & Hotline info */}
                  <div style={{ 
                    fontSize: '0.78rem', 
                    color: '#64748b', 
                    background: '#f8fafc', 
                    padding: '4px 8px', 
                    borderRadius: 6, 
                    marginBottom: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>
                      <UserOutlined style={{ marginRight: 4, color: '#0284c7' }} />
                      {car.contact_name || "Tuấn Anh Auto Showroom"}
                    </span>
                    {car.contact_phone && (
                      <span style={{ color: '#0284c7', fontWeight: 600 }}>
                        <PhoneOutlined style={{ marginRight: 2 }} />
                        {car.contact_phone}
                      </span>
                    )}
                  </div>
                  
                  {/* Listed Price */}
                  <div style={{ marginBottom: 14 }}>
                    <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block' }}>Giá niêm yết</Text>
                    <Text className="price-tag">{formatPrice(car.price)}</Text>
                  </div>

                  {/* Functional Action Buttons: 2 rows */}
                  <Space direction="vertical" style={{ width: '100%' }} size={8}>
                    {/* Row 1: Giá lăn bánh & Lái thử */}
                    <Row gutter={8}>
                      <Col span={12}>
                        <Button 
                          block 
                          type="default" 
                          icon={<CalculatorOutlined style={{ color: '#0284c7' }} />}
                          onClick={() => { setSelectedCarForOnRoad(car); setOnRoadModalVisible(true); }}
                          style={{ fontSize: '0.8rem', borderRadius: 6 }}
                        >
                          Lăn Bánh
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button 
                          block 
                          type="primary" 
                          icon={<CarOutlined />} 
                          onClick={() => { setSelectedCarForDrive(car); setDriveModalVisible(true); }}
                          style={{ fontSize: '0.8rem', borderRadius: 6, background: '#0284c7', borderColor: '#0284c7' }}
                        >
                          Lái Thử
                        </Button>
                      </Col>
                    </Row>

                    {/* Row 2: In bài đăng & Gửi tin nhắn đến người bán */}
                    <Row gutter={8}>
                      <Col span={12}>
                        <Button 
                          block 
                          icon={<PrinterOutlined style={{ color: '#475569' }} />}
                          onClick={() => handleOpenPrint(car)}
                          style={{ fontSize: '0.8rem', borderRadius: 6, borderColor: '#cbd5e1' }}
                        >
                          In Bài Đăng
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button 
                          block 
                          icon={<MessageOutlined style={{ color: '#10b981' }} />}
                          onClick={() => handleOpenMessage(car)}
                          style={{ 
                            fontSize: '0.8rem', 
                            borderRadius: 6, 
                            borderColor: '#10b981', 
                            color: '#059669',
                            background: '#ecfdf5',
                            fontWeight: 600
                          }}
                        >
                          Nhắn Người Bán
                        </Button>
                      </Col>
                    </Row>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Integrated Feature Modals */}
      <TestDriveModal
        visible={driveModalVisible}
        onClose={() => setDriveModalVisible(false)}
        car={selectedCarForDrive}
      />

      <CarCompareModal
        visible={compareModalVisible}
        onClose={() => setCompareModalVisible(false)}
        compareCars={compareCars}
        onRemoveCar={(id) => setCompareCars(compareCars.filter(c => c.id !== id))}
      />

      <OnRoadCalculatorModal
        visible={onRoadModalVisible}
        onClose={() => setOnRoadModalVisible(false)}
        car={selectedCarForOnRoad}
      />

      <UsedCarValuationModal
        visible={valuationModalVisible}
        onClose={() => setValuationModalVisible(false)}
      />

      {/* New Required Modals */}
      <PrintCarModal
        visible={printModalVisible}
        onClose={() => setPrintModalVisible(false)}
        car={selectedCarForPrint}
      />

      <SendMessageModal
        visible={messageModalVisible}
        onClose={() => setMessageModalVisible(false)}
        car={selectedCarForMessage}
        currentUser={currentUser}
      />
    </div>
  );
};

export default CarList;
