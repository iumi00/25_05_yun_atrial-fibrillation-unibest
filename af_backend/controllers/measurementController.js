// af_backend/controllers/measurementController.js
const db = require('../config/db');

// 开始测量 - 创建测量记录
exports.startMeasurement = async (req, res) => {
  try {
    const { userId, measurementType = 'accelerometer', durationSeconds = 60 } = req.body;
    
    console.log('开始测量请求:', { userId, measurementType, durationSeconds });
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }
    
    // 创建测量记录
    const [result] = await db.query(
      `INSERT INTO measurement_records 
       (user_id, measurement_type, start_time, end_time, duration_seconds, data_points_count, status) 
       VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? SECOND), ?, 0, 'completed')`,
      [userId, measurementType, durationSeconds, durationSeconds]
    );
    
    const measurementId = result.insertId;
    
    console.log('测量记录创建成功，ID:', measurementId);
    
    res.json({
      success: true,
      message: '测量开始',
      data: {
        measurementId,
        startTime: new Date().toISOString(),
        durationSeconds
      }
    });
    
  } catch (error) {
    console.error('开始测量失败:', error);
    res.status(500).json({
      success: false,
      message: '开始测量失败',
      error: error.message
    });
  }
};

// 上传测量数据 - 批量保存加速度计数据
exports.uploadMeasurementData = async (req, res) => {
  try {
    const { measurementId, data } = req.body;
    
    console.log('上传测量数据:', { measurementId, dataPoints: data?.length });
    
    if (!measurementId || !data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: '缺少测量ID或数据'
      });
    }
    
    // 验证测量记录是否存在
    const [records] = await db.query(
      'SELECT id FROM measurement_records WHERE id = ?',
      [measurementId]
    );
    
    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        message: '测量记录不存在'
      });
    }
    
    // 批量插入数据
    const values = data.map(item => [
      measurementId,
      item.timestamp,
      item.x,
      item.y,
      item.z
    ]);
    
    const [result] = await db.query(
      `INSERT INTO measurement_data 
       (record_id, timestamp, x_value, y_value, z_value) 
       VALUES ?`,
      [values]
    );
    
    // 更新测量记录的数据点数量
    await db.query(
      'UPDATE measurement_records SET data_points_count = ? WHERE id = ?',
      [data.length, measurementId]
    );
    
    console.log('数据上传成功，插入记录数:', result.affectedRows);
    
    res.json({
      success: true,
      message: '数据上传成功',
      data: {
        insertedCount: result.affectedRows
      }
    });
    
  } catch (error) {
    console.error('数据上传失败:', error);
    res.status(500).json({
      success: false,
      message: '数据上传失败',
      error: error.message
    });
  }
};

// 结束测量 - 更新状态并分析数据
exports.endMeasurement = async (req, res) => {
  try {
    const { measurementId } = req.body;
    
    console.log('结束测量:', measurementId);
    
    if (!measurementId) {
      return res.status(400).json({
        success: false,
        message: '缺少测量ID'
      });
    }
    
    // 更新测量记录状态
    await db.query(
      'UPDATE measurement_records SET end_time = NOW(), status = ? WHERE id = ?',
      ['completed', measurementId]
    );
    
    // 获取测量数据进行分析
    const [dataRows] = await db.query(
      `SELECT timestamp, x_value, y_value, z_value 
       FROM measurement_data 
       WHERE record_id = ? 
       ORDER BY timestamp`,
      [measurementId]
    );
    
    // 简单的数据分析（示例）
    const analysisResult = await analyzeMeasurementData(dataRows);
    
    // 保存分析结果
    await db.query(
      `INSERT INTO measurement_results 
       (record_id, result_type, result_value, confidence_score) 
       VALUES (?, ?, ?, ?)`,
      [
        measurementId,
        'af_detection',
        JSON.stringify(analysisResult),
        analysisResult.confidence || 0.5
      ]
    );
    
    console.log('测量结束，分析完成');
    
    res.json({
      success: true,
      message: '测量结束',
      data: {
        measurementId,
        analysisResult,
        dataPoints: dataRows.length
      }
    });
    
  } catch (error) {
    console.error('结束测量失败:', error);
    res.status(500).json({
      success: false,
      message: '结束测量失败',
      error: error.message
    });
  }
};

// 获取测量历史
exports.getMeasurementHistory = async (req, res) => {
  try {
    const { userId, page = 1, limit = 10 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }
    
    const offset = (page - 1) * limit;
    
    // 获取测量记录列表
    const [records] = await db.query(
      `SELECT 
        mr.id,
        mr.measurement_type,
        mr.start_time,
        mr.end_time,
        mr.duration_seconds,
        mr.data_points_count,
        mr.status,
        mr.created_at,
        mr.result_type,
        mr.confidence_score
       FROM measurement_records mr
       LEFT JOIN measurement_results mr2 ON mr.id = mr2.record_id
       WHERE mr.user_id = ?
       ORDER BY mr.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    );
    
    // 获取总数
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM measurement_records WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      data: {
        records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total
        }
      }
    });
    
  } catch (error) {
    console.error('获取测量历史失败:', error);
    res.status(500).json({
      success: false,
      message: '获取测量历史失败',
      error: error.message
    });
  }
};

// 获取测量详情
exports.getMeasurementDetail = async (req, res) => {
  try {
    const { measurementId } = req.params;
    
    if (!measurementId) {
      return res.status(400).json({
        success: false,
        message: '缺少测量ID'
      });
    }
    
    // 获取测量记录
    const [records] = await db.query(
      'SELECT * FROM measurement_records WHERE id = ?',
      [measurementId]
    );
    
    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        message: '测量记录不存在'
      });
    }
    
    const record = records[0];
    
    // 获取测量数据
    const [dataRows] = await db.query(
      'SELECT * FROM measurement_data WHERE record_id = ? ORDER BY timestamp',
      [measurementId]
    );
    
    // 获取分析结果
    const [resultRows] = await db.query(
      'SELECT * FROM measurement_results WHERE record_id = ?',
      [measurementId]
    );
    
    res.json({
      success: true,
      data: {
        record,
        data: dataRows,
        results: resultRows
      }
    });
    
  } catch (error) {
    console.error('获取测量详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取测量详情失败',
      error: error.message
    });
  }
};

// 删除测量记录
exports.deleteMeasurement = async (req, res) => {
  try {
    const { measurementId } = req.params;
    
    if (!measurementId) {
      return res.status(400).json({
        success: false,
        message: '缺少测量ID'
      });
    }
    
    // 删除测量记录（级联删除相关数据）
    const [result] = await db.query(
      'DELETE FROM measurement_records WHERE id = ?',
      [measurementId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '测量记录不存在'
      });
    }
    
    res.json({
      success: true,
      message: '删除成功'
    });
    
  } catch (error) {
    console.error('删除测量记录失败:', error);
    res.status(500).json({
      success: false,
      message: '删除测量记录失败',
      error: error.message
    });
  }
};

// 简单的数据分析函数（示例）
async function analyzeMeasurementData(data) {
  if (!data || data.length === 0) {
    return {
      status: 'no_data',
      message: '没有数据可分析'
    };
  }
  
  // 计算基本统计信息
  const xValues = data.map(d => d.x_value);
  const yValues = data.map(d => d.y_value);
  const zValues = data.map(d => d.z_value);
  
  const stats = {
    x: {
      mean: xValues.reduce((a, b) => a + b, 0) / xValues.length,
      variance: calculateVariance(xValues),
      range: Math.max(...xValues) - Math.min(...xValues)
    },
    y: {
      mean: yValues.reduce((a, b) => a + b, 0) / yValues.length,
      variance: calculateVariance(yValues),
      range: Math.max(...yValues) - Math.min(...yValues)
    },
    z: {
      mean: zValues.reduce((a, b) => a + b, 0) / zValues.length,
      variance: calculateVariance(zValues),
      range: Math.max(...zValues) - Math.min(...zValues)
    }
  };
  
  // 简单的异常检测（示例）
  const totalVariance = stats.x.variance + stats.y.variance + stats.z.variance;
  const isAbnormal = totalVariance > 100; // 阈值需要根据实际情况调整
  
  return {
    status: 'completed',
    dataPoints: data.length,
    statistics: stats,
    anomalyDetected: isAbnormal,
    confidence: isAbnormal ? 0.8 : 0.6,
    message: isAbnormal ? '检测到异常模式' : '数据正常'
  };
}

function calculateVariance(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
}