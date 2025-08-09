const axios = require('axios');
const db = require('../config/db'); // 引入我们改造后的 MySQL 连接池
const config = require('../config/config'); // 引入我们的配置文件
const jwt = require('jsonwebtoken'); // 【新增】引入 jwt 库

const { decryptData } = require('../utils/crypto.js');

/**
 * 微信小程序登录处理
 * POST /api/users/login  (我们等下会在路由文件中定义这个路径)
 */
exports.login = async (req, res, next) => {
  // 1. 从请求体中获取小程序端发送过来的 code
  const { code } = req.body;
  if (!code) {
    // 如果没有 code，返回错误信息
    return res.status(400).json({
      success: false,
      message: '登录失败，缺少必要参数 code'
    });
  }

  try {
    // 2. 构造请求 URL，向微信服务器换取 openid 和 session_key
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.wechat.appId}&secret=${config.wechat.appSecret}&js_code=${code}&grant_type=authorization_code`;

    // 3. 使用 axios 发送 GET 请求到微信服务器
    const wechatResponse = await axios.get(url);
    const { openid, session_key, errcode, errmsg } = wechatResponse.data;

    // 4. 判断从微信服务器获取 openid 是否成功
    if (errcode || !openid) {
      console.error('从微信服务器换取 openid 失败:', errmsg);
      // 将微信的错误信息也返回给前端，方便调试
      return res.status(500).json({
        success: false,
        message: '登录凭证校验失败',
        error: { errcode, errmsg }
      });
    }

    // 5. 使用获取到的 openid 查询数据库，判断用户是否存在
    // 注意：db.query 返回的是一个数组 [rows, fields]，我们只需要 rows
    const [rows] = await db.query('SELECT * FROM users WHERE openid = ?', [openid]);
    let user = rows[0];

    // 6. 判断用户是否存在于我们的数据库中
    if (!user) {
      // 6.1. 如果用户不存在，则在数据库中创建新用户
      console.log(`新用户，openid: ${openid}，正在创建...`);
      const [result] = await db.execute(
        'INSERT INTO users (openid, session_key) VALUES (?, ?)',
        [openid, session_key]
      );
      // 再次查询以获取完整的用户信息 (包括数据库自动生成的 id, created_at 等)
      const [newRows] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = newRows[0];
    } else {
      // 6.2. 如果用户已存在，则更新 session_key (这是一个好习惯)
      console.log(`老用户，openid: ${openid}，正在更新 session_key...`);
      await db.execute(
        'UPDATE users SET session_key = ? WHERE openid = ?',
        [session_key, openid]
      );
      // 【新增】对于老用户，也要把最新的用户信息赋值给 user 变量
      user = rows[0];
    }

    // 【修改】将后端返回的 userInfo 结构调整得更清晰
    const userInfoForFrontend = {
      id: user.id,
      nickname: user.nickname,
      phone: user.phone,
      avatar: user.avatar_url,
    }

    // 7. 生成自定义登录态 (token)。
    // 【修改】使用 JWT 生成 token
    const payload = { id: user.id, nickname: user.nickname }; // 1. 定义荷载，可以包含用户的基本信息
    const token = jwt.sign(
      payload,                        // 2. 荷载
      config.jwt.secret,              // 3. 我们的密钥
      { expiresIn: config.jwt.expiresIn } // 4. 设置过期时间
    );

    // 8. 登录成功，将 token 和用户基本信息返回给小程序端
    res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        token: token,
        // 这里可以只返回一些安全的信息给前端
        userInfo: userInfoForFrontend, // 【修改】返回清晰的 userInfo 对象
      }
    });

  } catch (err) {
    // 9. 如果过程中发生任何其他错误（如数据库查询失败），则交由错误处理中间件处理
    console.error('登录流程中发生错误:', err);
    next(err);
  }
};

// af_backend/controllers/userController.js

// ... exports.login 的代码保持不变 ...

/**
 * 更新用户个人资料
 * PUT /api/users/profile
 */
exports.updateProfile = async (req, res, next) => {
  // 1. 从认证中间件中获取用户ID
  const userId = req.user.id;

  // 2. 从请求体中获取新的昵称和电话
  const { nickname, phone } = req.body;

  if (!nickname || !phone) {
    return res.status(400).json({ success: false, message: '昵称和电话不能为空' });
  }

  try {
    // 3. 构造并执行 SQL UPDATE 语句
    const [result] = await db.execute(
      'UPDATE users SET nickname = ?, phone = ? WHERE id = ?',
      [nickname, phone, userId]
    );

    // 4. 检查是否真的更新了数据
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 5. 返回成功响应
    res.status(200).json({
      success: true,
      message: '个人资料更新成功！'
    });

  } catch (err) {
    console.error('更新个人资料时发生错误:', err);
    next(err);
  }
};

/**
 * 解密并更新用户手机号 - 【已使用本地解密工具】
 * POST /api/users/phone
 */
exports.decryptPhone = async (req, res, next) => {
  const userId = req.user.id;
  const { encryptedData, iv } = req.body;

  if (!encryptedData || !iv) {
    return res.status(400).json({ success: false, message: '缺少加密数据' });
  }

  try {
    const [rows] = await db.query('SELECT session_key FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    const session_key = rows[0].session_key;
    const appId = config.wechat.appId;

    // 【修改】调用我们自己封装的 decryptData 函数
    const decryptedInfo = decryptData(appId, session_key, encryptedData, iv);

    console.log('✅ 成功解密出手机号信息:', decryptedInfo);

    const phoneNumber = decryptedInfo.phoneNumber;

    await db.execute(
      'UPDATE users SET phone = ? WHERE id = ?',
      [phoneNumber, userId]
    );

    res.status(200).json({
      success: true,
      message: '手机号获取并更新成功！',
      data: {
        phone: phoneNumber
      }
    });

  } catch (err) {
    console.error('解密手机号时发生错误:', err);
    if (err.message.includes('Illegal Buffer')) {
      return res.status(401).json({ success: false, message: '解密失败，请重新登录后再试' });
    }
    next(err);
  }
};