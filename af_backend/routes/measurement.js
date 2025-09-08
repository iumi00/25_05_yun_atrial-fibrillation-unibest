// af_backend/routes/measurement.js
const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController');
const auth = require('../middlewares/auth');

// 测量相关路由(需要认证)
router.post('/start', measurementController.startMeasurement);
router.post('/upload', measurementController.uploadMeasurementData);
router.post('/end', measurementController.endMeasurement);
router.get('/history', measurementController.getMeasurementHistory);
router.get(
  '/detail/:measurementId',
  measurementController.getMeasurementDetail,
);
router.delete('/:measurementId', measurementController.deleteMeasurement);

module.exports = router;
