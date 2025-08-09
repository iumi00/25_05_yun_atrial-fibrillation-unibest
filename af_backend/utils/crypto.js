const crypto = require('crypto');

/**
 * 微信数据解密工具
 * @param {string} appId - 小程序的 AppID
 * @param {string} sessionKey - 用户的 session_key
 * @param {string} encryptedData - 加密的敏感数据
 * @param {string} iv - 解密算法的初始向量
 * @returns {object} - 解密后的数据对象
 */
function decryptData(appId, sessionKey, encryptedData, iv) {
    const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');

    try {
        // 使用 aes-128-cbc 算法进行解密
        const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
        // 设置自动 padding 为 true，原数据的编码为 base64，输出为 utf8
        decipher.setAutoPadding(true);
        let decoded = decipher.update(encryptedDataBuffer, 'binary', 'utf8');
        decoded += decipher.final('utf8');

        const decodedData = JSON.parse(decoded);

        // 校验解密出的数据的 AppID 是否与当前小程序的 AppID 一致
        if (decodedData.watermark.appid !== appId) {
            throw new Error('Illegal Buffer: AppID not match');
        }

        return decodedData;
    } catch (err) {
        throw new Error('Illegal Buffer: Decrypt failed');
    }
}

module.exports = {
    decryptData
};