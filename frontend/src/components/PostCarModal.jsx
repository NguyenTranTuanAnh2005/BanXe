import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Typography, Space, Row, Col, message, Card, Divider } from 'antd';
import { 
  PlusCircleOutlined, 
  CarOutlined, 
  FileTextOutlined, 
  PictureOutlined, 
  PhoneOutlined, 
  UserOutlined,
  ThunderboltOutlined,
  DollarOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Preset sample photos for fast car listing
const PRESET_CAR_IMAGES = [
  { label: 'Mercedes Đen', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800' },
  { label: 'BMW Xanh', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800' },
  { label: 'Porsche Trắng', url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800' },
  { label: 'Toyota Đỏ', url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=800' },
  { label: 'Ford Bán Tải', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800' },
  { label: 'Audi Xám', url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=800' },
];

// Description templates for quick auto-fill
const DESCRIPTION_TEMPLATES = [
  {
    title: 'Mẫu 1: Xe Sang Full Option',
    content: 'Xe chính chủ đứng tên từ đầu, bảo dưỡng định kỳ 100% tại hãng. Trang bị đầy đủ gói phụ kiện cao cấp, nội thất da Nappa sang trọng, cửa sổ trời toàn cảnh, hệ thống loa âm thanh vòm cao cấp và camera 360 độ sắc nét. Cam kết không đâm đụng, không ngập nước thủy kích.'
  },
  {
    title: 'Mẫu 2: Xe Lướt Gia Đình Giữ Gìn',
    content: 'Xe gia đình sử dụng cẩn thận, sơn zin 98%, nội thất thơm mùi xe mới. Đã dán phim cách nhiệt cao cấp, camera hành trình và lót sàn 6D. Lốp sơ cua chưa hạ, đầy đủ sổ bảo hành và 2 chìa khóa thông minh. Bao check hãng toàn quốc trước khi giao dịch.'
  },
  {
    title: 'Mẫu 3: Động Cơ Tiết Kiệm - Hỗ Trợ Trả Góp',
    content: 'Xe vận hành cực kỳ êm ái và tiết kiệm nhiên liệu tối ưu (khoảng 5L/100km). Không gian khoang lái rộng rãi, điều hòa tự động làm mát sâu. Đại lý hỗ trợ thủ tục sang tên đổi chủ trong ngày và hỗ trợ vay trả góp ngân hàng 70-80% giá trị xe với lãi suất ưu đãi.'
  }
];

const PostCarModal = ({ visible, onClose, currentUser, onCarPosted }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Initialize seller contact info when opening
  React.useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        fuel_type: 'Xăng',
        body_type: 'Sedan',
        year: 2024,
        status: 'Có sẵn',
        contact_name: currentUser?.full_name || currentUser?.username || 'Tuấn Anh Auto Showroom',
        contact_phone: currentUser?.phone || '0988 776 655',
        image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800'
      });
    }
  }, [visible, currentUser, form]);

  const handleApplyTemplate = (content) => {
    form.setFieldsValue({ description: content });
    message.success('Đã áp dụng mẫu mô tả xe!');
  };

  const handleSelectPresetImage = (url) => {
    form.setFieldsValue({ image_url: url });
    message.info('Đã chọn hình ảnh mẫu!');
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        brand: values.brand,
        price: Number(values.price),
        year: Number(values.year),
        fuel_type: values.fuel_type,
        body_type: values.body_type,
        image_url: values.image_url,
        status: values.status || 'Có sẵn',
        description: values.description, // User provided description
        seller_id: currentUser ? currentUser.id : null,
        contact_name: values.contact_name,
        contact_phone: values.contact_phone
      };

      await axios.post('http://localhost:8000/api/cars', payload);
      message.success(`Đăng bài bán xe "${values.name}" thành công! Bài đăng đã hiển thị trên Showroom.`);
      
      form.resetFields();
      if (onCarPosted) onCarPosted();
      onClose();
    } catch (error) {
      console.error('Error posting car:', error);
      message.error('Không thể đăng bài bán xe. Vui lòng kiểm tra lại thông tin!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      destroyOnClose
    >
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>
          <CarOutlined style={{ color: '#0284c7', marginRight: 8 }} />
          Đăng Bài Bán Xe Mới
        </Title>
        <Text type="secondary" style={{ fontSize: '0.88rem' }}>
          Đăng thông tin xe kèm thông số kỹ thuật và <strong>Mô tả chi tiết (Description)</strong> để tiếp cận hàng ngàn khách hàng
        </Text>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Row 1: Car Name & Brand */}
        <Row gutter={[12, 8]}>
          <Col xs={24} sm={14}>
            <Form.Item
              name="name"
              label="Tên Mẫu Xe Ô Tô"
              rules={[{ required: true, message: 'Vui lòng nhập tên mẫu xe!' }]}
            >
              <Input placeholder="VD: Mercedes-Benz E300 AMG, Toyota Camry 2.5Q..." size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item
              name="brand"
              label="Hãng Xe"
              rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập hãng xe!' }]}
            >
              <Select placeholder="Chọn hãng xe" size="large">
                <Option value="Mercedes-Benz">Mercedes-Benz</Option>
                <Option value="BMW">BMW</Option>
                <Option value="Porsche">Porsche</Option>
                <Option value="Audi">Audi</Option>
                <Option value="Lexus">Lexus</Option>
                <Option value="Toyota">Toyota</Option>
                <Option value="Honda">Honda</Option>
                <Option value="Ford">Ford</Option>
                <Option value="Hyundai">Hyundai</Option>
                <Option value="Kia">Kia</Option>
                <Option value="Mazda">Mazda</Option>
                <Option value="VinFast">VinFast</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Row 2: Price, Year, Fuel & Body */}
        <Row gutter={[12, 8]}>
          <Col xs={24} sm={7}>
            <Form.Item
              name="price"
              label="Giá Bán (VND)"
              rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="2,000,000,000"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={5}>
            <Form.Item name="year" label="Năm SX" rules={[{ required: true }]}>
              <InputNumber min={2000} max={2030} style={{ width: '100%' }} size="large" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="fuel_type" label="Nhiên Liệu" rules={[{ required: true }]}>
              <Select size="large">
                <Option value="Xăng">Động cơ Xăng</Option>
                <Option value="Dầu">Động cơ Dầu</Option>
                <Option value="Điện">Thuần Điện 100%</Option>
                <Option value="Hybrid">Hybrid Tiết Kiệm</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="body_type" label="Kiểu Dáng Xe" rules={[{ required: true }]}>
              <Select size="large">
                <Option value="Sedan">Sedan</Option>
                <Option value="SUV">SUV / Crossover</Option>
                <Option value="Thể thao">Xe Thể Thao</Option>
                <Option value="Bán tải">Xe Bán Tải</Option>
                <Option value="Hatchback">Hatchback</Option>
                <Option value="MPV">MPV Đa Dụng</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Row 3: Image URL & Presets */}
        <Form.Item
          name="image_url"
          label="URL Hình Ảnh Xe (Link ảnh hoặc chọn ảnh mẫu bên dưới)"
          rules={[{ required: true, message: 'Vui lòng cung cấp link hình ảnh xe!' }]}
        >
          <Input 
            prefix={<PictureOutlined style={{ color: '#0284c7' }} />} 
            placeholder="https://images.unsplash.com/..." 
          />
        </Form.Item>

        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block', marginBottom: 6 }}>
            CHỌN NHANH ẢNH MẪU XE ĐẸP:
          </Text>
          <Space size="xs" wrap>
            {PRESET_CAR_IMAGES.map((img, i) => (
              <Button 
                key={i} 
                size="small" 
                style={{ fontSize: '0.75rem', borderRadius: 12 }}
                onClick={() => handleSelectPresetImage(img.url)}
              >
                📷 {img.label}
              </Button>
            ))}
          </Space>
        </div>

        {/* Row 4: Contact Info */}
        <Row gutter={[12, 8]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="contact_name"
              label="Tên Người Bán / Đại Lý"
              rules={[{ required: true, message: 'Vui lòng nhập tên người bán!' }]}
            >
              <Input prefix={<UserOutlined style={{ color: '#0284c7' }} />} placeholder="VD: Anh Tuấn / Auto Showroom" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="contact_phone"
              label="Số Điện Thoại Liên Hệ"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
              <Input prefix={<PhoneOutlined style={{ color: '#0284c7' }} />} placeholder="VD: 0988 776 655" />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 5: PHẦN MÔ TẢ CHI TIẾT (DESCRIPTION) - ĐIỂM NHẤN QUAN TRỌNG */}
        <div style={{ 
          background: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          borderRadius: 8, 
          padding: '12px 14px', 
          marginBottom: 16 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontWeight: 700, color: '#0369a1', fontSize: '0.9rem' }}>
              <FileTextOutlined style={{ marginRight: 6 }} />
              PHẦN MÔ TẢ CHI TIẾT XE (DESCRIPTION):
            </span>
            <Text type="secondary" style={{ fontSize: '0.75rem' }}>
              Mô tả càng chi tiết càng tăng uy tín và thu hút khách mua
            </Text>
          </div>

          <div style={{ marginBottom: 10 }}>
            <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>
              ⚡ CHÈN NHANH MẪU MÔ TẢ CHUẨN CHUYÊN NGHIỆP:
            </Text>
            <Space wrap size="small">
              {DESCRIPTION_TEMPLATES.map((tmpl, idx) => (
                <Button 
                  key={idx} 
                  size="small" 
                  type="dashed"
                  style={{ borderColor: '#0284c7', color: '#0284c7', fontSize: '0.75rem', borderRadius: 12 }}
                  onClick={() => handleApplyTemplate(tmpl.content)}
                >
                  📝 {tmpl.title}
                </Button>
              ))}
            </Space>
          </div>

          <Form.Item
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập phần mô tả xe để khách hàng nắm rõ!' }]}
            style={{ margin: 0 }}
          >
            <TextArea
              rows={4}
              placeholder="Nhập chi tiết về tình trạng xe, lịch sử bảo dưỡng, số km đã đi, các gói trang bị độ thêm, phụ kiện đi kèm, cam kết chất lượng..."
              style={{ borderRadius: 6 }}
            />
          </Form.Item>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={loading}
          icon={<PlusCircleOutlined />}
          style={{
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            borderColor: '#0284c7',
            fontWeight: 700,
            fontSize: '1rem',
            height: 48,
            borderRadius: 8,
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
          }}
        >
          Đăng Bài Bán Xe Lên Showroom
        </Button>
      </Form>
    </Modal>
  );
};

export default PostCarModal;
