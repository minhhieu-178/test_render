require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 

const app = express();
const PORT = 3001;

const MSSV = '20225317';  
const PASSWORD = '20225317';  
const COLLECTION_NAME = 'users';  
const CLUSTER_URL = 'cluster.4i3i6pi.mongodb.net';  

// Connection String
  const MONGODB_URI = `mongodb+srv://20225317:20225317@cluster.4i3i6pi.mongodb.net/IT4409`;

// Middleware
app.use(cors());
app.use(express.json());

//  USER SCHEMA 
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên là bắt buộc'],
    trim: true,
    minlength: [2, 'Tên phải có ít nhất 2 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  age: {
    type: Number,
    min: [0, 'Tuổi phải lớn hơn 0'],  
    max: [150, 'Tuổi không hợp lệ']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME 
});

const User = mongoose.model('User', userSchema);

//  ERROR HANDLING
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Lỗi xác thực dữ liệu',
      errors: errors
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Email đã tồn tại trong hệ thống'
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID không hợp lệ'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi server'
  });
};

// CRUD API ROUTES 

// CREATE 
app.post('/api/users', async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      data: user
    });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: "Email đã tồn tại" });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

// GET
app.get('/api/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    
    // ✅ Giới hạn page và limit
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100);
    
    const filter = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const skip = (validPage - 1) * validLimit;
    
    // ✅ PROMISE.ALL - QUERY SONG SONG
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(validLimit),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / validLimit);

    res.json({
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
      data: users
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE 
app.put('/api/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// DELETE 
app.delete('/api/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    next(error);
  }
});

// Route trang chủ
app.get('/', (req, res) => {
  res.json({
    message: 'User Management API',
    student: {
      mssv: MSSV,
      collection: COLLECTION_NAME
    },
    endpoints: {
      'POST /api/users': 'Tạo user mới',
      'GET /api/users': 'Lấy danh sách users',
      'GET /api/users/:id': 'Lấy user theo ID',
      'PUT /api/users/:id': 'Cập nhật user',
      'DELETE /api/users/:id': 'Xóa user'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// KẾT NỐI DATABASE & CHẠY SERVER 
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('='.repeat(50));
    console.log(' ĐÃ KẾT NỐI MONGODB THÀNH CÔNG');
    console.log('='.repeat(50));
    console.log(` MSSV: ${MSSV}`);
    console.log(` Collection: ${COLLECTION_NAME}`);
    console.log(` Database: userdb`);
    console.log('='.repeat(50));
    
    app.listen(PORT, () => {
      console.log(` Server đang chạy tại: http://localhost:${PORT}`);
      console.log(` Test API tại: http://localhost:${PORT}/api/users`);
      console.log('='.repeat(50));
    });
  })
  .catch(err => {
    console.error(' LỖI KẾT NỐI MONGODB:', err.message);
    console.error('Kiểm tra lại:');
    console.error('- MSSV và PASSWORD có đúng không?');
    console.error('- Network Access đã cho phép IP chưa?');
    console.error('- User đã được tạo trong Database Access chưa?');
  });