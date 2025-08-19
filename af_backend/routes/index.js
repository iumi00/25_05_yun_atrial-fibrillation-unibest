const express = require('express');
const userRoutes = require('./user');
const questionnaireRoutes = require('./questionnaire');
const router = express.Router();

router.use('/users', userRoutes);
router.use('/user', questionnaireRoutes); // 添加问卷路由

module.exports = router; 