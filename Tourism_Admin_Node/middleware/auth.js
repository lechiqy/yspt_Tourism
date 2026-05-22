// JWT验证中间件
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'tourism_secret_key_2024';

function authVerify(req, res, next) {
    console.log('运行JWT验证');
    try {
        // 获取请求头中的token
        const token = req.headers.authorization;
        console.log('token:', token);

        if (!token) {
            console.log('token不存在');
            res.status(401).send({ message: '未登录' });
            return;
        }

        // 验证token
        const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
        console.log('解码后的数据:', decoded);

        // 将用户信息挂在到req上
        req.user = decoded;
        next();
    } catch (error) {
        console.log('JWT验证失败:', error);
        res.status(401).send({ message: '登录已过期' });
    }
}

// 生成token
function generateToken(data) {
    const token = jwt.sign(data, SECRET_KEY, { expiresIn: '7d' });
    return token;
}

module.exports = {
    authVerify,
    generateToken,
    SECRET_KEY
};
