// 引入 crypto
const crypto = require('crypto');

// 定义 md5Encrypt 函数
function md5Encrypt(text) {
    const hash = crypto.createHash('md5');
    hash.update(text);
    const md5Encrypted = hash.digest('hex');
    return md5Encrypted;
}

module.exports = md5Encrypt; // 导出函数
