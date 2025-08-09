module.exports = {
    // MySQL 数据库配置
    mysql: {
        host: 'localhost',      // 数据库主机名，通常是 'localhost'
        user: 'root',          // 您的 MySQL 用户名
        password: '20060203xiwen', // !!! 在这里替换成您自己的 MySQL 密码 !!!
        database: 'atrial_fibrillation' // 我们之前创建的数据库名
    },
    // 微信小程序配置
    wechat: {
        appId: 'wxd1346fd3211fdfe5',       // !!! 在这里替换成您的小程序 AppID !!!
        appSecret: 'ba7b14705f24bfcd6f515b8a0cc38890' // !!! 在这里替换成您的小程序 AppSecret !!!
    },
    // 【新增】JWT 配置
    jwt: {
        secret: 'ba7b14705f24bfcd6f515b8a0cc38890', // !!! 这是一个密钥，请务必修改为一个复杂的、随机的字符串
        expiresIn: '7d' // token 有效期，例如 '7d' (7天), '24h' (24小时), '60s' (60秒)
    },
    // 服务器配置
    server: {
        port: 3000 // 服务器运行的端口号，可以根据需要修改
    }
};