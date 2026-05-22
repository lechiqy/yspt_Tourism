const express = require('express');
const { Users, Admins } = require('../models');
const md5Encrypt = require('../middleware/MD5');
const jwt = require('jsonwebtoken');
const { generateToken, SECRET_KEY } = require('../middleware/auth');
const loginRoute = express.Router();

loginRoute.use(express.json());

// 用户注册
loginRoute.post('/register', async (req, res, next) => {
    console.log('运行用户注册');
    console.log('req.body:', req.body);
    try {
        // 检查用户是否已存在
        const existUser = await Users.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { Username: req.body.Username },
                    { Phone: req.body.Phone }
                ]
            }
        });

        if (existUser) {
            console.log('用户名或手机号已存在');
            res.status(402).send({ message: '用户名或手机号已存在' });
            return;
        }

        // 创建新用户
        const newUser = await Users.create({
            Username: req.body.Username,
            Password: md5Encrypt(req.body.Password),
            RealName: req.body.RealName || '',
            Phone: req.body.Phone,
            Email: req.body.Email || ''
        });

        console.log('注册成功:', newUser);
        res.status(200).send({ message: '注册成功', data: newUser });
    } catch (error) {
        console.log('注册失败:', error);
        next(error);
    }
});

// 用户登录
loginRoute.post('/login', async (req, res, next) => {
    console.log('运行用户登录');
    console.log('req.body:', req.body);
    try {
        const result = await Users.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { Username: req.body.Username },
                    { Phone: req.body.Username }
                ]
            }
        });

        if (!result) {
            console.log('用户不存在');
            res.status(401).send({ message: '用户不存在' });
            return;
        }

        console.log('用户存在:', result.Username);
        console.log('开始验证密码');

        // 验证密码
        if (result.Password === md5Encrypt(req.body.Password) || result.Password === req.body.Password) {
            console.log('密码正确');
            const token = generateToken({ UserID: result.UserID, Username: result.Username, Role: 'user' });

            // 检查是否有微信用户也绑定了这个手机号（用于账号合并提示）
            let wechatAccountToMerge = null;
            if (result.Phone) {
                const wechatUser = await Users.findOne({
                    where: {
                        Phone: result.Phone,
                        OpenID: { [require('sequelize').Op.ne]: null },
                        UserID: { [require('sequelize').Op.ne]: result.UserID }
                    },
                    attributes: ['UserID', 'Username', 'OpenID']
                });
                if (wechatUser) {
                    wechatAccountToMerge = {
                        UserID: wechatUser.UserID,
                        Username: wechatUser.Username
                    };
                }
            }

            res.status(200).send({
                token: token,
                UserID: result.UserID,
                Username: result.Username,
                Phone: result.Phone,
                RealName: result.RealName,
                wechatAccountToMerge: wechatAccountToMerge
            });
        } else {
            res.status(402).send({ message: '密码错误' });
        }
    } catch (error) {
        console.log('登录失败:', error);
        next(error);
    }
});

// 管理员登录
loginRoute.post('/admin', async (req, res, next) => {
    console.log('运行管理员登录');
    console.log('req.body:', req.body);
    try {
        const result = await Admins.findOne({
            where: {
                Username: req.body.Username
            }
        });

        console.log('result:', result);
        if (!result) {
            console.log('管理员不存在');
            res.status(401).send({ message: '管理员不存在' });
            return;
        }

        console.log('管理员存在:', result.Username);
        console.log('开始验证密码');

        // 验证密码
        if (result.Password === md5Encrypt(req.body.Password) || result.Password === req.body.Password) {
            console.log('密码正确');
            const token = generateToken({ AdminID: result.AdminID, Username: result.Username, Role: result.Role });

            res.status(200).send({
                token: token,
                AdminID: result.AdminID,
                Username: result.Username,
                RealName: result.RealName,
                Role: result.Role
            });
        } else {
            res.status(402).send({ message: '密码错误' });
        }
    } catch (error) {
        console.log('登录失败:', error);
        next(error);
    }
});

// 微信登录
loginRoute.post('/wechat', async (req, res, next) => {
    console.log('========== 微信登录请求开始 ==========');
    console.log('请求参数:', req.body);
    try {
        const { code } = req.body;
        if (!code) {
            console.log('错误: 缺少微信登录code');
            res.status(400).send({ message: '缺少微信登录code' });
            return;
        }

        const wechatConfig = require('../config/wechat');
        console.log('使用的微信配置 AppID:', wechatConfig.appid);
        const https = require('https');

        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${wechatConfig.appid}&secret=${wechatConfig.secret}&js_code=${code}&grant_type=authorization_code`;
        console.log('请求微信API URL:', url);

        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', async () => {
                try {
                    console.log('微信API响应:', data);
                    const result = JSON.parse(data);
                    if (result.errcode) {
                        console.log('微信API返回错误:', result);
                        res.status(400).send({ message: '微信登录失败: ' + (result.errmsg || '未知错误') });
                        return;
                    }

                    const { openid, session_key } = result;
                    console.log('获取到 openid:', openid);

                    let user = await Users.findOne({ where: { OpenID: openid } });
                    console.log('查找用户结果:', user ? '找到用户' : '未找到用户');

                    if (!user) {
                        console.log('开始创建新用户...');
                        user = await Users.create({
                            Username: 'wx_' + openid.substring(0, 8),
                            Password: md5Encrypt('wechat_' + openid),
                            OpenID: openid,
                            RealName: '',
                            Phone: ''
                        });
                        console.log('微信新用户创建成功:', user.Username);
                    }

                    const token = generateToken({ UserID: user.UserID, Username: user.Username, Role: 'user' });
                    console.log('生成 token 成功');

                    console.log('========== 微信登录成功 ==========');
                    res.status(200).send({
                        token: token,
                        UserID: user.UserID,
                        Username: user.Username,
                        Phone: user.Phone,
                        RealName: user.RealName
                    });
                } catch (e) {
                    console.log('微信登录解析失败:', e);
                    res.status(500).send({ message: '微信登录失败' });
                }
            });
        }).on('error', (e) => {
            console.log('微信API请求失败:', e);
            res.status(500).send({ message: '微信服务器请求失败' });
        });
    } catch (error) {
        console.log('微信登录失败:', error);
        next(error);
    }
});

module.exports = loginRoute;
