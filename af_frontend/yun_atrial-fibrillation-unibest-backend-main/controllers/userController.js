// controllers/userController.js
// 用户控制器，处理用户相关业务逻辑
const User = require('../models/User');

/**
 * 获取所有用户
 * GET /api/users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    // 查询所有用户
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err); // 交由统一错误处理中间件处理
  }
};

/**
 * 创建新用户
 * POST /api/users
 */
exports.createUser = async (req, res, next) => {
  try {
    // 创建并保存新用户
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}; 