module.exports = (req, res, next) => {
  // 简单示例：检查是否有 token
  if (!req.headers.authorization) {
    return res.status(401).json({ message: '未授权' });
  }
  next();
}; 