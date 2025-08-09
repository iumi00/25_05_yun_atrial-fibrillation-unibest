const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // 引入改造后的 userController
const { authMiddleware } = require('../middlewares/auth.js');

/**
 * @route   POST /api/users/login
 * @desc    微信小程序用户登录
 * @access  Public
 */
router.post('/login', userController.login);

// 如果您未来需要其他用户相关的路由，可以继续在这里添加
// 例如:
// router.get('/profile', authMiddleware, userController.getUserProfile); // 获取用户资料，需要认证中间件
// router.put('/profile', authMiddleware, userController.updateUserProfile); // 更新用户资料

// 【新增】更新个人资料的路由
// 请注意，我们在这里使用了 authMiddleware
// 这意味着只有带了有效 token 的请求才能访问这个接口
router.put('/profile', authMiddleware, userController.updateProfile);

router.post('/phone', authMiddleware, userController.decryptPhone);

module.exports = router;