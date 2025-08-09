exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || '服务器内部错误' });
}; 