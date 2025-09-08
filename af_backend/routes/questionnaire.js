// af_backend/routes/questionnaire.js
const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaireController');
const { authMiddleware } = require('../middlewares/auth.js');

// 公开接口
router.get('/question', questionnaireController.getQuestionnaireList);
router.get('/types', questionnaireController.getQuestionnaireTypes);

// 需要认证的接口
router.post('/commit', questionnaireController.commitUserQuestionnaire);
router.get('/history', questionnaireController.getUserQuestionnaireHistory);
router.get('/detail/:id', questionnaireController.getQuestionnaireDetail);
router.delete('/answer/:id', authMiddleware, questionnaireController.delAnswer);

// 管理员接口（可以添加管理员权限中间件）
// router.post('/types', authMiddleware, questionnaireController.addQuestionnaireType);
// router.post('/items', authMiddleware, questionnaireController.addQuestionnaireItem);
// router.put('/items/:id', authMiddleware, questionnaireController.updateQuestionnaireItem);
// router.delete('/items/:id', authMiddleware, questionnaireController.deleteQuestionnaireItem);

module.exports = router;
