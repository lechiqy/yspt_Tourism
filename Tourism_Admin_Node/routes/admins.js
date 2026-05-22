const express = require('express');
const { Admins } = require('../models');
const { authVerify } = require('../middleware/auth');
const md5Encrypt = require('../middleware/MD5');
const adminsRoute = express.Router();

adminsRoute.use(express.json());

// 获取管理员信息
adminsRoute.get('/info', authVerify, async (req, res, next) => {
    console.log('运行获取管理员信息');
    try {
        const admin = await Admins.findByPk(req.user.AdminID, {
            attributes: { exclude: ['Password'] }
        });
        if (!admin) {
            res.status(404).send({ message: '管理员不存在' });
            return;
        }
        res.status(200).send(admin);
    } catch (error) {
        console.log('获取管理员信息失败:', error);
        next(error);
    }
});

// 获取管理员列表（仅超级管理员）
adminsRoute.get('/list', authVerify, async (req, res, next) => {
    console.log('运行获取管理员列表');
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Admins.findAndCountAll({
            attributes: { exclude: ['Password'] },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).send({ total: count, page, limit, list: rows });
    } catch (error) {
        console.log('获取管理员列表失败:', error);
        next(error);
    }
});

// 添加管理员
adminsRoute.post('/add', authVerify, async (req, res, next) => {
    console.log('运行添加管理员');
    try {
        const exist = await Admins.findOne({ where: { Username: req.body.Username } });
        if (exist) {
            res.status(402).send({ message: '用户名已存在' });
            return;
        }

        const admin = await Admins.create({
            Username: req.body.Username,
            Password: md5Encrypt(req.body.Password),
            RealName: req.body.RealName,
            Role: req.body.Role || 'admin',
            Phone: req.body.Phone || ''
        });

        console.log('添加管理员成功:', admin);
        res.status(200).send({ message: '添加成功', data: admin });
    } catch (error) {
        console.log('添加管理员失败:', error);
        next(error);
    }
});

// 更新管理员
adminsRoute.put('/update/:id', authVerify, async (req, res, next) => {
    console.log('运行更新管理员');
    try {
        const admin = await Admins.findByPk(req.params.id);
        if (!admin) {
            res.status(404).send({ message: '管理员不存在' });
            return;
        }

        const updateData = { ...req.body };
        if (req.body.Password) {
            updateData.Password = md5Encrypt(req.body.Password);
        }

        await admin.update(updateData);
        res.status(200).send({ message: '更新成功' });
    } catch (error) {
        console.log('更新管理员失败:', error);
        next(error);
    }
});

// 删除管理员
adminsRoute.delete('/delete/:id', authVerify, async (req, res, next) => {
    console.log('运行删除管理员');
    try {
        const admin = await Admins.findByPk(req.params.id);
        if (!admin) {
            res.status(404).send({ message: '管理员不存在' });
            return;
        }

        await admin.destroy();
        res.status(200).send({ message: '删除成功' });
    } catch (error) {
        console.log('删除管理员失败:', error);
        next(error);
    }
});

module.exports = adminsRoute;
