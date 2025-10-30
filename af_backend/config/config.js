// 从环境变量读取配置
module.exports = {
    // MySQL 数据库配置
    mysql: {
        host: process.env.MYSQL_HOST || 'localhost',      // 数据库主机名，通常是 'localhost'
        user: process.env.MYSQL_USER || 'root',          // 您的 MySQL 用户名
        password: process.env.MYSQL_PASSWORD || 'root123456', // MySQL 密码
        database: process.env.MYSQL_DATABASE || 'atrial_fibrillation' // 数据库名
    },
    // 微信小程序配置
    wechat: {
        appId: process.env.WECHAT_APPID || 'wxd1346fd3211fdfe5',       // 小程序 AppID
        appSecret: process.env.WECHAT_APPSECRET || 'ba7b14705f24bfcd6f515b8a0cc38890' // 小程序 AppSecret
    },
    // JWT 配置
    jwt: {
        secret: process.env.JWT_SECRET || 'ba7b14705f24bfcd6f515b8a0cc38890', // JWT密钥
        expiresIn: process.env.JWT_EXPIRESIN || '7d' // token 有效期
    },
    // 服务器配置
    server: {
        port: process.env.SERVER_PORT || 8000 // 服务器运行的端口号
    }
};