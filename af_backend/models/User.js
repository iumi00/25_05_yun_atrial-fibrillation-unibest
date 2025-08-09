/**
 * User 类
 * 这个类不再是一个与数据库直接绑定的 Mongoose 模型。
 * 它的作用是作为一个清晰的数据结构定义，让我们知道一个“用户”对象应该包含哪些属性。
 * 这与我们在 MySQL 中创建的 'users' 表结构是对应的。
 */
class User {
  constructor(id, openid, session_key, nickname, avatar_url, created_at, updated_at) {
    this.id = id;
    this.openid = openid;
    this.session_key = session_key;
    this.nickname = nickname;
    this.avatar_url = avatar_url;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

module.exports = User;