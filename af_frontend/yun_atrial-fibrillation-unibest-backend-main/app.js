require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const winston = require('winston');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger.json');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const cors = require('cors');

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

// 路由
app.use('/api', routes);

// Swagger 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 错误处理中间件
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
}); 