// af_backend/routes/measurement.js
const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController');
const { authMiddleware: auth } = require('../middlewares/auth');

// 测量相关路由(需要认证)
router.post('/start', auth, measurementController.startMeasurement);
router.post('/upload', auth, measurementController.uploadMeasurementData);
router.post('/end', auth, measurementController.endMeasurement);
router.get('/history', auth, measurementController.getMeasurementHistory);
router.get('/detail/:measurementId', auth, measurementController.getMeasurementDetail);
router.delete('/:measurementId', auth, measurementController.deleteMeasurement);

module.exports = router;