const express = require('express');
const userRoutes = require('./user');
const questionnaireRoutes = require('./questionnaire');
const measurementRoutes = require('./measurement'); 

const router = express.Router();
// 用户相关路由 - 保持原有路径兼容性
router.use('/users', userRoutes);
// 用户相关路由 - 用于兼容前端新路径格式
router.use('/user', userRoutes);
// 问卷相关路由
router.use('/questionnaire', questionnaireRoutes); 
// 测量相关路由
router.use('/measurement', measurementRoutes);
module.exports = router;