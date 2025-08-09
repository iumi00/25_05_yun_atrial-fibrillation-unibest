require('dotenv').config();
const express = require('express');
const path = require('path'); // 【新增】引入 Node.js 路径处理模块
const fs = require('fs'); // 【新增】引入 Node.js 文件系统模块
const multer = require('multer'); // 【新增】引入 multer

require('./config/db.js'); // 导入并执行数据库连接逻辑'); // 导入并执行数据库连接逻辑
const morgan = require('morgan');
const winston = require('winston');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger.json');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const cors = require('cors');
const config = require('./config/config');

const app = express();

// 日志
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// --- 【新增】配置静态文件服务 ---
// 1. 确保 public/uploads 目录存在
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// 2. 将 public 目录作为静态资源目录
// 这样，外部就可以通过 http://localhost:3000/uploads/图片名.jpg 来访问图片
app.use(express.static(path.join(__dirname, 'public')));

// --- 【新增】文件上传配置和路由 ---
// 1. 配置 multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // 指定文件保存目录
  },
  filename: function (req, file, cb) {
    // 自定义文件名：时间戳-原文件名
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});
const upload = multer({ storage: storage });

// 2. 创建文件上传的路由
// 当有 POST 请求访问 /api/upload 时，使用 multer 的 'file' 策略处理
// 'file' 必须和前端 uni.uploadFile 的 name 参数一致
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '没有上传文件' });
  }
  // 【修改】手动将 http 替换为 https
  let fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  if (process.env.NODE_ENV === 'development') {
    fileUrl = fileUrl.replace('http://', 'https://');
  }

  res.status(200).json({
    success: true,
    message: '上传成功',
    data: {
      url: fileUrl,
    }
  });
});

// 路由
app.use('/api', routes);

// Swagger 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 错误处理中间件
app.use(errorHandler);

const PORT = config.server.port || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
}); 