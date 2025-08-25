const express = require('express');
const userRoutes = require('./user');
const questionnaireRoutes = require('./questionnaire');
const measurementRoutes = require('./measurement'); 

const router = express.Router();
// 用户相关路由
router.use('/users', userRoutes);
// 问卷相关路由
router.use('/user', questionnaireRoutes); 
// 测量相关路由
router.use('/measurement', measurementRoutes);
module.exports = router; 