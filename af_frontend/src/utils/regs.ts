/**
 * 检验输入的电话号码是否为有效的中国手机号码
 * 此函数使用正则表达式来匹配中国手机号码的格式
 * 只有当电话号码以1开头，第二位是3-9之间的数字，且后面跟着9位数字时，才返回true
 *
 * @param {string} phone - 需要检验的电话号码
 * @returns {boolean} - 如果电话号码有效则返回true，否则返回false
 */
export function isValidPhoneNumber(phone) {
  // 正则表达式匹配中国手机号码
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}
