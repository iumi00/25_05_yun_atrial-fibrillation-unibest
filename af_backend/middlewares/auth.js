// af_backend/middlewares/auth.js - JWT 验证版

const jwt = require('jsonwebtoken');
const config = require('../config/config.js');

exports.authMiddleware = (req, res, next) => {
  console.log('🔴 [后端接收时] authMiddleware 收到的 Headers:', req.headers);

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '认证失败，无权访问' });
  }

  // 提取真正的 token 部分 (去掉 "Bearer " 前缀)
  const token = authHeader.substring(7);

  try {
    // 【修改】使用 jwt.verify 进行验证
    const decoded = jwt.verify(token, config.jwt.secret);

    // 如果验证成功，decoded 将是解密后的 payload 对象 { id: ..., nickname: ... }
    console.log('✅ JWT 验证成功，用户信息:', decoded);

    // 将解密出的用户信息附加到请求对象上
    req.user = decoded;

    next();
  } catch (err) {
    // 如果验证失败（比如 token 过期或签名不匹配），jwt.verify 会抛出错误
    console.error('❌ JWT 验证失败:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: '认证已过期，请重新登录' });
    }
    return res.status(401).json({ success: false, message: '认证失败，无效的凭证' });
  }
};