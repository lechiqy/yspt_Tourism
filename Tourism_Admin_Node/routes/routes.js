const express = require('express');
const { Routes, Admins, Spots, RouteSpots, Reviews } = require('../models');
const { authVerify } = require('../middleware/auth');
const routesRoute = express.Router();

routesRoute.use(express.json());

// 获取线路列表（游客端-只显示已发布的）
routesRoute.get('/list', async (req, res, next) => {
    console.log('运行获取线路列表');
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Routes.findAndCountAll({
            where: { Status: ['published', 'display_only'] },
            include: [{
                model: Admins,
                as: 'admin',
                attributes: ['AdminID', 'RealName']
            }],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).send({
            total: count,
            page: page,
            limit: limit,
            list: rows
        });
    } catch (error) {
        console.log('获取线路列表失败:', error);
        next(error);
    }
});

// 搜索线路
routesRoute.get('/search', async (req, res, next) => {
    console.log('运行搜索线路, 关键词:', req.query.keyword);
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const keyword = req.query.keyword || '';

        const { count, rows } = await Routes.findAndCountAll({
            where: {
                Status: ['published', 'display_only'],
                RouteName: {
                    [require('sequelize').Op.like]: '%' + keyword + '%'
                }
            },
            include: [{
                model: Admins,
                as: 'admin',
                attributes: ['AdminID', 'RealName']
            }],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).send({
            total: count,
            page: page,
            limit: limit,
            list: rows
        });
    } catch (error) {
        console.log('搜索线路失败:', error);
        next(error);
    }
});

// 获取线路详情
routesRoute.get('/detail/:id', async (req, res, next) => {
    console.log('运行获取线路详情');
    try {
        const result = await Routes.findByPk(req.params.id, {
            include: [
                {
                    model: Admins,
                    as: 'admin',
                    attributes: ['AdminID', 'RealName']
                },
                {
                    model: Spots,
                    as: 'spots',
                    attributes: ['SpotID', 'SpotName', 'City', 'TicketPrice']
                },
                {
                    model: Reviews,
                    as: 'reviews',
                    attributes: ['Rating']
                }
            ]
        });

        if (!result) {
            res.status(404).send({ message: '线路不存在' });
            return;
        }

        // 计算平均评分
        const avgRating = result.reviews && result.reviews.length > 0
            ? result.reviews.reduce((sum, r) => sum + r.Rating, 0) / result.reviews.length
            : 0;

        res.status(200).send({
            ...result.toJSON(),
            avgRating: avgRating.toFixed(1)
        });
    } catch (error) {
        console.log('获取线路详情失败:', error);
        next(error);
    }
});

// 添加线路（管理员）
routesRoute.post('/add', authVerify, async (req, res, next) => {
    console.log('运行添加线路');
    try {
        const result = await Routes.create({
            RouteName: req.body.RouteName,
            Days: req.body.Days,
            Price: req.body.Price,
            Description: req.body.Description || '',
            Status: 'draft',
            CoverImage: req.body.CoverImage || '',
            Images: req.body.Images || [],
            AdminID: req.user.AdminID
        });

        console.log('添加线路成功:', result);
        res.status(200).send({ message: '添加成功', data: result });
    } catch (error) {
        console.log('添加线路失败:', error);
        next(error);
    }
});

// 更新线路（管理员）
routesRoute.put('/update/:id', authVerify, async (req, res, next) => {
    console.log('运行更新线路');
    try {
        const route = await Routes.findByPk(req.params.id);
        if (!route) {
            res.status(404).send({ message: '线路不存在' });
            return;
        }

        await route.update(req.body);
        res.status(200).send({ message: '更新成功', data: route });
    } catch (error) {
        console.log('更新线路失败:', error);
        next(error);
    }
});

// 发布/下架线路（管理员）
routesRoute.put('/status/:id', authVerify, async (req, res, next) => {
    console.log('运行更新线路状态');
    try {
        const route = await Routes.findByPk(req.params.id);
        if (!route) {
            res.status(404).send({ message: '线路不存在' });
            return;
        }

        await route.update({ Status: req.body.Status });
        res.status(200).send({ message: '状态更新成功' });
    } catch (error) {
        console.log('更新线路状态失败:', error);
        next(error);
    }
});

// 删除线路（管理员）
routesRoute.delete('/delete/:id', authVerify, async (req, res, next) => {
    console.log('运行删除线路');
    try {
        const route = await Routes.findByPk(req.params.id);
        if (!route) {
            res.status(404).send({ message: '线路不存在' });
            return;
        }

        await route.destroy();
        res.status(200).send({ message: '删除成功' });
    } catch (error) {
        console.log('删除线路失败:', error);
        next(error);
    }
});

// 获取管理端的线路列表
routesRoute.get('/admin/list', authVerify, async (req, res, next) => {
    console.log('运行获取管理端线路列表');
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status;

        const where = {};
        if (status) {
            where.Status = status;
        }

        const { count, rows } = await Routes.findAndCountAll({
            where: where,
            include: [{
                model: Admins,
                as: 'admin',
                attributes: ['AdminID', 'RealName']
            }],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).send({
            total: count,
            page: page,
            limit: limit,
            list: rows
        });
    } catch (error) {
        console.log('获取管理端线路列表失败:', error);
        next(error);
    }
});

module.exports = routesRoute;
