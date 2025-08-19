const db = require('../config/db');

// 获取问卷题目列表
exports.getQuestionnaireList = async (req, res) => {
  try {
    const { type } = req.query;
    
    // 验证问卷类型是否存在
    const [typeRows] = await db.query(
      'SELECT * FROM questionnaire_types WHERE id = ? AND is_active = TRUE',
      [type]
    );
    
    if (typeRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '问卷类型不存在'
      });
    }
    
    // 获取题目列表
    const [itemRows] = await db.query(
      `SELECT 
        qi.id,
        qi.item_title as itemTitle,
        qi.item_score as itemScore,
        qi.item_type as type,
        qi.is_required as required,
        qi.item_order as itemOrder
      FROM questionnaire_items qi
      WHERE qi.type_id = ?
      ORDER BY qi.item_order, qi.id`,
      [type]
    );
    
    // console.log('查询到的题目数量:', itemRows.length); // 添加日志
    
    // 获取题目选项
    const itemIds = itemRows.map(item => item.id);
    let questions = itemRows;
    
    if (itemIds.length > 0) {
      const [optionRows] = await db.query(
        `SELECT 
          qo.item_id,
          qo.option_value as value,
          qo.option_label as label,
          qo.option_score as score,
          qo.option_order as optionOrder
        FROM questionnaire_options qo
        WHERE qo.item_id IN (?)
        ORDER BY qo.item_id, qo.option_order`,
        [itemIds]
      );
      
      // 组装题目和选项
      questions = itemRows.map(item => {
        const options = optionRows
          .filter(option => option.item_id === item.id)
          .map(option => ({
            value: option.value,
            label: option.label,
            score: option.score
          }));
        
        return {
          ...item,
          options: options.length > 0 ? options : undefined
        };
      });
    }
    
    // console.log('返回的题目数据:', questions); // 添加日志
    
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('获取问卷题目失败:', error);
    res.status(500).json({
      success: false,
      message: '获取问卷题目失败'
    });
  }
};

// 获取所有问卷类型
exports.getQuestionnaireTypes = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM questionnaire_types WHERE is_active = TRUE ORDER BY display_name'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('获取问卷类型失败:', error);
    res.status(500).json({
      success: false,
      message: '获取问卷类型失败'
    });
  }
};

// 添加新问卷类型（管理员功能）
exports.addQuestionnaireType = async (req, res) => {
  try {
    const { id, name, display_name, description } = req.body;
    
    const [result] = await db.execute(
      'INSERT INTO questionnaire_types (id, name, display_name, description) VALUES (?, ?, ?, ?)',
      [id, name, display_name, description]
    );
    
    res.json({
      success: true,
      message: '问卷类型添加成功',
      data: { id }
    });
  } catch (error) {
    console.error('添加问卷类型失败:', error);
    res.status(500).json({
      success: false,
      message: '添加问卷类型失败'
    });
  }
};

// 添加问卷题目（管理员功能）
exports.addQuestionnaireItem = async (req, res) => {
  try {
    const { type_id, item_title, item_score, item_type, item_order, is_required, options } = req.body;
    
    await db.beginTransaction();
    
    // 插入题目
    const [result] = await db.execute(
      'INSERT INTO questionnaire_items (type_id, item_title, item_score, item_type, item_order, is_required) VALUES (?, ?, ?, ?, ?, ?)',
      [type_id, item_title, item_score, item_type, item_order, is_required]
    );
    
    const itemId = result.insertId;
    
    // 插入选项
    if (options && options.length > 0) {
      for (const option of options) {
        await db.execute(
          'INSERT INTO questionnaire_options (item_id, option_value, option_label, option_score, option_order) VALUES (?, ?, ?, ?, ?)',
          [itemId, option.value, option.label, option.score, option.order]
        );
      }
    }
    
    await db.commit();
    
    res.json({
      success: true,
      message: '问卷题目添加成功',
      data: { itemId }
    });
  } catch (error) {
    await db.rollback();
    console.error('添加问卷题目失败:', error);
    res.status(500).json({
      success: false,
      message: '添加问卷题目失败'
    });
  }
};

// 更新问卷题目（管理员功能）
exports.updateQuestionnaireItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_title, item_score, item_type, item_order, is_required, options } = req.body;
    
    await db.beginTransaction();
    
    // 更新题目
    await db.execute(
      'UPDATE questionnaire_items SET item_title = ?, item_score = ?, item_type = ?, item_order = ?, is_required = ? WHERE id = ?',
      [item_title, item_score, item_type, item_order, is_required, id]
    );
    
    // 删除旧选项
    await db.execute('DELETE FROM questionnaire_options WHERE item_id = ?', [id]);
    
    // 插入新选项
    if (options && options.length > 0) {
      for (const option of options) {
        await db.execute(
          'INSERT INTO questionnaire_options (item_id, option_value, option_label, option_score, option_order) VALUES (?, ?, ?, ?, ?)',
          [id, option.value, option.label, option.score, option.order]
        );
      }
    }
    
    await db.commit();
    
    res.json({
      success: true,
      message: '问卷题目更新成功'
    });
  } catch (error) {
    await db.rollback();
    console.error('更新问卷题目失败:', error);
    res.status(500).json({
      success: false,
      message: '更新问卷题目失败'
    });
  }
};

// 删除问卷题目（管理员功能）
exports.deleteQuestionnaireItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.execute('DELETE FROM questionnaire_items WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: '问卷题目删除成功'
    });
  } catch (error) {
    console.error('删除问卷题目失败:', error);
    res.status(500).json({
      success: false,
      message: '删除问卷题目失败'
    });
  }
};

// 提交问卷数据
exports.commitUserQuestionnaire = async (req, res) => {
  try {
    const { userId, questionnaireType, score, answers, submitTime, status } = req.body;
    
    console.log('接收到的问卷数据:', req.body);
    
    // 验证必填字段
    if (!userId || !questionnaireType || !answers) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段'
      });
    }

    // 插入主记录
    const [result] = await db.query(
      `INSERT INTO user_questionnaires 
       (user_id, questionnaire_type, score, answers, submit_time, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, questionnaireType, score, JSON.stringify(answers), submitTime, status]
    );
    
    const questionnaireId = result.insertId;
    
    // // 插入答案详情
    // for (const [questionId, answer] of Object.entries(answers)) {
    //   await db.execute(
    //     'INSERT INTO user_answer_details (answer_id, question_id, answer_value) VALUES (?, ?, ?)',
    //     [answerId, questionId, String(answer)]
    //   );
    // }
     console.log('问卷数据保存成功，ID:', questionnaireId);
    
    res.json({
      success: true,
      message: '问卷提交成功',
      data: { 
        id:questionnaireId,
        score:score
       }
    });
  } catch (error) {
    console.error('提交问卷失败:', error);
    res.status(500).json({
      success: false,
      message: '提交问卷失败'
    });
  }
};

exports.getUserQuestionnaireHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    
    console.log('获取用户问卷历史，用户ID:', userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID参数'
      });
    }
    
    // 查询用户的所有问卷记录
    const [rows] = await db.query(
      `SELECT 
        uq.id,
        uq.user_id as userId,
        uq.questionnaire_type as questionnaireType,
        uq.score,
        uq.answers,
        uq.submit_time as submitTime,
        uq.status,
        uq.created_at as createdAt,
        uq.updated_at as updatedAt
      FROM user_questionnaires uq
      LEFT JOIN questionnaire_types qt ON uq.questionnaire_type = qt.id
      WHERE uq.user_id = ?
      ORDER BY uq.submit_time DESC`,
      [userId]
    );
    
    console.log('查询到的历史记录数量:', rows.length);
    
    // 处理数据，格式化时间等
    const historyRecords = rows.map(record => ({
      id: record.id,
      userId: record.userId,
      questionnaireType: record.questionnaireType,
      questionnaireDisplayName: record.questionnaireDisplayName || record.questionnaireType,
      score: record.score,
      answers: record.answers ? record.answers : {},
      submitTime: record.submitTime,
      status: record.status,
      createdAt: record.createdAt
    }));
    console.log('historyRecords',historyRecords);
    res.json({
      success: true,
      data: historyRecords,
      total: historyRecords.length
    });
    
  } catch (error) {
    console.error('获取用户问卷历史失败:', error);
    res.status(500).json({
      success: false,
      message: '获取历史记录失败'
    });
  }
};

// 获取单个问卷记录的详细信息
exports.getQuestionnaireDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('获取问卷详情，记录ID:', id);
    
    const [rows] = await db.query(
      `SELECT 
        uq.id,
        uq.user_id as userId,
        uq.questionnaire_type as questionnaireType,
        uq.score,
        uq.answers,
        uq.submit_time as submitTime,
        uq.status,
        uq.created_at as createdAt,
        qt.display_name as questionnaireDisplayName
      FROM user_questionnaires uq
      LEFT JOIN questionnaire_types qt ON uq.questionnaire_type = qt.id
      WHERE uq.id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '问卷记录不存在'
      });
    }
    
    const record = rows[0];
    const detail = {
      id: record.id,
      userId: record.userId,
      questionnaireType: record.questionnaireType,
      questionnaireDisplayName: record.questionnaireDisplayName || record.questionnaireType,
      score: record.score,
      answers: record.answers ? JSON.parse(record.answers) : {},
      submitTime: record.submitTime,
      status: record.status,
      createdAt: record.createdAt
    };
    
    res.json({
      success: true,
      data: detail
    });
    
  } catch (error) {
    console.error('获取问卷详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取问卷详情失败'
    });
  }
};

// 删除问卷记录
exports.delAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 先删除详情记录
    await db.execute(
      'DELETE FROM user_answer_details WHERE answer_id = ?',
      [id]
    );
    
    // 再删除主记录
    await db.execute(
      'DELETE FROM user_answers WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除问卷记录失败:', error);
    res.status(500).json({
      success: false,
      message: '删除问卷记录失败'
    });
  }
};