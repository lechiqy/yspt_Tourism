const express = require('express');
const { Spots } = require('../models');
const { authVerify } = require('../middleware/auth');
const spotsRoute = express.Router();

spotsRoute.use(express.json());

// 获取景点列表
spotsRoute.get('/list', async (req, res, next) => {
    console.log('运行获取景点列表');
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const city = req.query.city;

        const where = {};
        if (city) {
            where.City = city;
        }

        const { count, rows } = await Spots.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            order: [['SpotID', 'ASC']]
        });

        res.status(200).send({ total: count, page, limit, list: rows });
    } catch (error) {
        console.log('获取景点列表失败:', error);
        next(error);
    }
});

// 获取景点详情
spotsRoute.get('/detail/:id', async (req, res, next) => {
    console.log('运行获取景点详情');
    try {
        const spot = await Spots.findByPk(req.params.id);
        if (!spot) {
            res.status(404).send({ message: '景点不存在' });
            return;
        }
        res.status(200).send(spot);
    } catch (error) {
        console.log('获取景点详情失败:', error);
        next(error);
    }
});

// 添加景点（管理员）
spotsRoute.post('/add', authVerify, async (req, res, next) => {
    console.log('运行添加景点');
    try {
        const spot = await Spots.create(req.body);
        console.log('添加景点成功:', spot);
        res.status(200).send({ message: '添加成功', data: spot });
    } catch (error) {
        console.log('添加景点失败:', error);
        next(error);
    }
});

// 更新景点（管理员）
spotsRoute.put('/update/:id', authVerify, async (req, res, next) => {
    console.log('运行更新景点');
    try {
        const spot = await Spots.findByPk(req.params.id);
        if (!spot) {
            res.status(404).send({ message: '景点不存在' });
            return;
        }
        await spot.update(req.body);
        res.status(200).send({ message: '更新成功', data: spot });
    } catch (error) {
        console.log('更新景点失败:', error);
        next(error);
    }
});

// 删除景点（管理员）
spotsRoute.delete('/delete/:id', authVerify, async (req, res, next) => {
    console.log('运行删除景点');
    try {
        const spot = await Spots.findByPk(req.params.id);
        if (!spot) {
            res.status(404).send({ message: '景点不存在' });
            return;
        }
        await spot.destroy();
        res.status(200).send({ message: '删除成功' });
    } catch (error) {
        console.log('删除景点失败:', error);
        next(error);
    }
});

module.exports = spotsRoute;
