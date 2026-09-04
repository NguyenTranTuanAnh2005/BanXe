import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, message, Card, Tag, Typography, Row, Col, Statistic, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, DatabaseOutlined, CarOutlined, DollarOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminDashboard = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [form] = Form.useForm();

  // Fetch cars list directly from MySQL via FastAPI Backend
  const fetchCarsData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/cars');
      setCars(response.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu từ MySQL:', error);
      message.error('Không thể kết nối đến Backend FastAPI. Hãy kiểm tra server http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarsData();
  }, []);

  // Handle Open Create/Edit Modal
  const handleOpenModal = (car = null) => {
    setEditingCar(car);
    if (car) {
      form.setFieldsValue({
        name: car.name,
        brand: car.brand,
        price: car.price,
        year: car.year,
        fuel_type: car.fuel_type,
        body_type: car.body_type || 'Sedan',
        status: car.status,
        image_url: car.image_url,
        description: car.description
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        fuel_type: 'Xăng',
        body_type: 'Sedan',
        status: 'Có sẵn',
        year: new Date().getFullYear()
      });
    }
    setIsModalOpen(true);
  };

  // Save (Create or Update) to MySQL
  const handleFormSubmit = async (values) => {
    try {
      if (editingCar) {
        // UPDATE (PUT)
        await axios.put(`http://localhost:8000/api/cars/${editingCar.id}`, values);
        message.success(`Đã cập nhật dữ liệu xe "${values.name}" trong MySQL!`);
      } else {
        // CREATE (POST)
        await axios.post('http://localhost:8000/api/cars', values);
        message.success(`Thêm mới thành công xe "${values.name}" vào Database!`);
      }
      setIsModalOpen(false);
      fetchCarsData();
    } catch (error) {
      console.error('Lỗi lưu dữ liệu:', error);
      message.error('Lỗi khi thực hiện lưu dữ liệu vào MySQL.');
    }
  };

  // DELETE row from MySQL
  const handleDeleteCar = async (carId, carName) => {
    try {
      await axios.delete(`http://localhost:8000/api/cars/${carId}`);
      message.success(`Đã xóa xe "${carName}" (ID: ${carId}) khỏi MySQL!`);
      fetchCarsData();
    } catch (error) {
      console.error('Lỗi xóa dữ liệu:', error);
      message.error('Không thể xóa bản ghi này từ Database.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Ant Design Table Columns Configuration
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Hình Ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 100,
      render: (url) => (
        <img
          src={url || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800"}
          alt="Car Thumbnail"
          style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid #e2e8f0' }}
        />
      ),
    },
    {
      title: 'Tên Mẫu Xe',
      dataIndex: 'name',
      key: 'name',
      fontWeight: 600,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Hãng Xe',
      dataIndex: 'brand',
      key: 'brand',
      render: (brand) => <Tag color="blue">{brand}</Tag>,
    },
    {
      title: 'Dòng Xe',
      dataIndex: 'body_type',
      key: 'body_type',
      render: (body) => <Tag color="purple">{body || 'Sedan'}</Tag>,
    },
    {
      title: 'Năm SX',
      dataIndex: 'year',
      key: 'year',
      width: 90,
    },
    {
      title: 'Nhiên Liệu',
      dataIndex: 'fuel_type',
      key: 'fuel_type',
      render: (fuel) => (
        <Tag color={fuel === 'Điện' ? 'green' : fuel === 'Hybrid' ? 'cyan' : 'orange'}>
          {fuel}
        </Tag>
      ),
    },
    {
      title: 'Giá Niêm Yết',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (price) => <Text strong style={{ color: '#0284c7' }}>{formatPrice(price)}</Text>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Có sẵn' ? 'success' : status === 'Đã đặt' ? 'warning' : 'default'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Thao Tác (MySQL CRUD)',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Sửa thông tin xe">
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa xe khỏi MySQL?"
            description={`Bạn có chắc muốn xóa vĩnh viễn "${record.name}" khỏi Database?`}
            onConfirm={() => handleDeleteCar(record.id, record.name)}
            okText="Xóa Trực Tiếp"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa trực tiếp dòng này khỏi DB">
              <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Dashboard Top Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title="Tổng Số Mẫu Xe Trong DB"
              value={cars.length}
              prefix={<CarOutlined style={{ color: '#0284c7' }} />}
              valueStyle={{ color: '#0f172a', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title="Xe Đang Có Sẵn Tại Showroom"
              value={cars.filter(c => c.status === 'Có sẵn').length}
              prefix={<DatabaseOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title="Giá Trị Trung Bình Mẫu Xe"
              value={cars.length > 0 ? Math.round(cars.reduce((acc, curr) => acc + curr.price, 0) / cars.length / 1e6) : 0}
              suffix="Triệu VNĐ"
              prefix={<DollarOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#0284c7', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Controls */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '4px 0' }}>
            <Space align="center">
              <DatabaseOutlined style={{ color: '#0284c7', fontSize: 20 }} />
              <span style={{ fontWeight: 600 }}>Quản Lý Dữ Liệu MySQL (`cars`)</span>
            </Space>
            <Space flexWrap="wrap">
              <Button icon={<ReloadOutlined />} onClick={fetchCarsData} size="middle">
                Tải Lại DB
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal()}
                style={{ background: '#0284c7' }}
                size="middle"
              >
                Thêm Xe Mới
              </Button>
            </Space>
          </div>
        }
        style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}
      >
        <Table
          columns={columns}
          dataSource={cars}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 6 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Modal Form for Add/Edit Car */}
      <Modal
        title={
          <Space wrap>
            {editingCar ? <EditOutlined style={{ color: '#0284c7' }} /> : <PlusOutlined style={{ color: '#10b981' }} />}
            <span>{editingCar ? `Chỉnh Sửa Xe (ID: ${editingCar.id})` : 'Thêm Xe Mới Vào Database MySQL'}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingCar ? 'Cập Nhật DB' : 'Thêm Vào MySQL'}
        cancelText="Hủy Bỏ"
        style={{ maxWidth: '650px' }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit} style={{ marginTop: 16 }}>
          <Row gutter={[16, 8]}>
            <Col xs={24} sm={14}>
              <Form.Item
                name="name"
                label="Tên Xe Ô Tô"
                rules={[{ required: true, message: 'Vui lòng nhập tên xe!' }]}
              >
                <Input placeholder="Ví dụ: Mercedes-Benz E300 AMG" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item
                name="brand"
                label="Hãng Xe"
                rules={[{ required: true, message: 'Vui lòng nhập hãng xe!' }]}
              >
                <Input placeholder="Ví dụ: Mercedes-Benz, BMW..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 8]}>
            <Col xs={24} sm={6}>
              <Form.Item
                name="price"
                label="Giá Niêm Yết (VND)"
                rules={[{ required: true, message: 'Vui lòng nhập giá xe!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="2000000000"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item
                name="year"
                label="Năm Sản Xuất"
                rules={[{ required: true, message: 'Vui lòng nhập năm SX!' }]}
              >
                <InputNumber style={{ width: '100%' }} min={2000} max={2030} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="fuel_type" label="Loại Nhiên Liệu">
                <Select style={{ width: '100%' }}>
                  <Option value="Xăng">Xăng</Option>
                  <Option value="Dầu">Dầu</Option>
                  <Option value="Điện">Điện</Option>
                  <Option value="Hybrid">Hybrid</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="body_type" label="Dòng Xe / Kiểu Dáng">
                <Select style={{ width: '100%' }}>
                  <Option value="Sedan">Sedan</Option>
                  <Option value="SUV">SUV / Crossover</Option>
                  <Option value="Thể thao">Xe Thể Thao</Option>
                  <Option value="Bán tải">Xe Bán Tải</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 8]}>
            <Col xs={24} sm={12}>
              <Form.Item name="status" label="Trạng Thái">
                <Select style={{ width: '100%' }}>
                  <Option value="Có sẵn">Có sẵn</Option>
                  <Option value="Đã đặt">Đã đặt</Option>
                  <Option value="Hết hàng">Hết hàng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="image_url" label="URL Hình Ảnh Xe">
                <Input placeholder="https://domain.com/image.jpg" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô Tả Chi Tiết Mẫu Xe">
            <Input.TextArea rows={3} placeholder="Nhập mô tả tính năng, động cơ, trang bị nội thất..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
