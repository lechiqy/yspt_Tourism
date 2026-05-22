const express = require('express');
const { Reviews, Users, Routes, Orders } = require('../models');
const { authVerify } = require('../middleware/auth');
const reviewsRoute = express.Router();

reviewsRoute.use(express.json());

// 添加评价
reviewsRoute.post('/add', authVerify, async (req, res, next) => {
    console.log('运行添加评价');
    try {
        // 检查订单是否已完成
        const order = await Orders.findByPk(req.body.OrderID);
        if (!order) {
            res.status(404).send({ message: '订单不存在' });
            return;
        }

        if (order.Status !== 'completed') {
            res.status(400).send({ message: '只有已完成的订单才能评价' });
            return;
        }

        const review = await Reviews.create({
            UserID: req.user.UserID,
            RouteID: req.body.RouteID,
            OrderID: req.body.OrderID,
            Rating: req.body.Rating,
            Content: req.body.Content || ''
        });

        console.log('添加评价成功:', review);
        res.status(200).send({ message: '评价成功', data: review });
    } catch (error) {
        console.log('添加评价失败:', error);
        next(error);
    }
});

// 获取线路的评价列表
reviewsRoute.get('/list/:routeId', async (req, res, next) => {
    console.log('运行获取评价列表');
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Reviews.findAndCountAll({
            where: { RouteID: req.params.routeId },
            include: [{
                model: Users,
                as: 'user',
                attributes: ['UserID', 'Username', 'RealName', 'Avatar']
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
        console.log('获取评价列表失败:', error);
        next(error);
    }
});

module.exports = reviewsRoute;
