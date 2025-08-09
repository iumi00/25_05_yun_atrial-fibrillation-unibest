const mysql = require('mysql2/promise');
const config = require('./config.js'); // 引入我们创建的配置文件

// 创建一个数据库连接池，而不是每次都创建新连接
// 连接池可以提高性能和复用性
const pool = mysql.createPool(config.mysql);

// 尝试从连接池获取一个连接，以测试数据库连接是否成功
pool.getConnection()
  .then(connection => {
    console.log('MySQL 数据库连接成功！');
    // 连接成功后，必须释放连接，让其返回连接池
    connection.release();
  })
  .catch(err => {
    console.error('MySQL 数据库连接失败:', err);
    // 如果连接失败，最好是退出程序，因为后续所有操作都无法进行
    process.exit(1);
  });

// 导出创建好的连接池，以便其他文件（如控制器）可以使用它来查询数据库
module.exports = pool;