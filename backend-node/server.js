const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Storage configuration for uploaded vehicle images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'TuanAnh Auto Node.js Secondary Service (Upload & Realtime Notifications)',
    port: PORT
  });
});

// Image Upload Endpoint
app.post('/api/upload', (req, res) => {
  // Mock image upload response
  const sampleImages = [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800",
    "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=800",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800"
  ];
  const randomImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];
  
  res.status(200).json({
    success: true,
    message: "Tải ảnh xe lên thành công!",
    imageUrl: randomImg
  });
});

// Real-time Notification Webhook Mock
app.post('/api/notifications/notify', (req, res) => {
  const { title, message } = req.body;
  console.log(`[REALTIME NOTIFICATION] ${title}: ${message}`);
  
  res.status(200).json({
    success: true,
    sentAt: new Date().toISOString(),
    details: { title, message }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Node.js Secondary Backend Service listening on http://localhost:${PORT}`);
});
