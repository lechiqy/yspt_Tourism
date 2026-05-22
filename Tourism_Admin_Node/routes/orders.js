const express = require('express');
const { Orders, Users, Routes, Payments } = require('../models');
const { authVerify } = require('../middleware/auth');
const dayjs = require('dayjs');
const ordersRoute = express.Router();

ordersRoute.use(express.json());

// 生成订单号
function generateOrderNo() {
    return 'ORD' + dayjs().format('YYYYMMDDHHmmss') + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// 创建订单
ordersRoute.post('/create', authVerify, async (req, res, next) => {
    console.log('运行创建订单');
    try {
        // 校验用户是否存在
        const user = await Users.findByPk(req.user.UserID);
        if (!user) {
            res.status(401).send({ message: '用户不存在，请重新登录' });
            return;
        }

        const route = await Routes.findByPk(req.body.RouteID);
        if (!route) {
            res.status(404).send({ message: '线路不存在' });
            return;
        }

        if (route.Status !== 'published') {
            res.status(400).send({ message: '该线路暂未开放预订' });
            return;
        }

        const orderNo = generateOrderNo();
        const totalPrice = route.Price * req.body.Travelers;

        const order = await Orders.create({
            OrderNo: orderNo,
            UserID: req.user.UserID,
            RouteID: req.body.RouteID,
            Travelers: req.body.Travelers,
            TotalPrice: totalPrice,
            Status: 'pending',
            TravelDate: req.body.TravelDate
        });

        console.log('创建订单成功:', order);
        res.status(200).send({ message: '订单创建成功', data: order });
    } catch (error) {
        console.log('创建订单失败:', error);
        next(error);
    }
});

// 支付订单
ordersRoute.post('/pay/:id', authVerify, async (req, res, next) => {
    console.log('运行支付订单');
    try {
        const order = await Orders.findByPk(req.params.id);
        if (!order) {
            res.status(404).send({ message: '订单不存在' });
            return;
        }

        if (order.UserID !== req.user.UserID) {
            res.status(403).send({ message: '无权操作此订单' });
            return;
        }

        // 创建支付记录
        const payment = await Payments.create({
            OrderID: order.OrderID,
            PaymentMethod: req.body.PaymentMethod || 'alipay',
            Amount: order.TotalPrice,
            Status: 'success',
            TransactionNo: 'TXN' + Date.now()
        });

        // 支付完成直接变为待使用状态
        await order.update({ Status: 'processing' });

        console.log('支付成功:', payment);
        res.status(200).send({ message: '支付成功，订单已生效', data: payment });
    } catch (error) {
        console.log('支付失败:', error);
        next(error);
    }
});

// 获取用户订单列表
ordersRoute.get('/user/list', authVerify, async (req, res, next) => {
    console.log('运行获取用户订单列表');
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status;

        const where = { UserID: req.user.UserID };
        if (status) {
            where.Status = status;
        }

        const { count, rows } = await Orders.findAndCountAll({
            where: where,
            include: [{
                model: Routes,
                as: 'route',
                attributes: ['RouteID', 'RouteName', 'Days', 'CoverImage']
            }],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'ASC']]
        });

        res.status(200).send({
            total: count,
            page: page,
            limit: limit,
            list: rows
        });
    } catch (error) {
        console.log('获取用户订单列表失败:', error);
        next(error);
    }
});

// 获取订单详情
ordersRoute.get('/detail/:id', authVerify, async (req, res, next) => {
    console.log('运行获取订单详情');
    try {
        const order = await Orders.findByPk(req.params.id, {
            include: [
                {
                    model: Routes,
                    as: 'route'
                },
                {
                    model: Payments,
                    as: 'payments'
                },
            ]
        });

        if (!order) {
            res.status(404).send({ message: '订单不存在' });
            return;
        }

        res.status(200).send(order);
    } catch (error) {
        console.log('获取订单详情失败:', error);
        next(error);
    }
});

// 取消订单
ordersRoute.put('/cancel/:id', authVerify, async (req, res, next) => {
    console.log('运行取消订单');
    try {
        const order = await Orders.findByPk(req.params.id);
        if (!order) {
            res.status(404).send({ message: '订单不存在' });
            return;
        }

        if (['completed', 'cancelled'].includes(order.Status)) {
            res.status(400).send({ message: '该订单无法取消' });
            return;
        }

        await order.update({ Status: 'cancelled' });
        console.log('订单已取消');
        res.status(200).send({ message: '订单已取消' });
    } catch (error) {
        console.log('取消订单失败:', error);
        next(error);
    }
});

// 退款（用户主动退款）
ordersRoute.put('/refund/:id', authVerify, async (req, res, next) => {
    console.log('运行退款');
    try {
        const order = await Orders.findByPk(req.params.id);
        if (!order) {
            res.status(404).send({ message: '订单不存在' });
            return;
        }

        if (order.UserID !== req.user.UserID) {
            res.status(403).send({ message: '无权操作此订单' });
            return;
        }

        if (order.Status !== 'processing') {
            res.status(400).send({ message: '只有待使用状态的订单才能退款' });
            return;
        }

        // 更新订单状态为已取消
        await order.update({ Status: 'cancelled' });

        console.log('退款成功，订单已取消');
        res.status(200).send({ message: '退款成功，订单已取消' });
    } catch (error) {
        console.log('退款失败:', error);
        next(error);
    }
});

// 管理员：获取所有订单
ordersRoute.get('/admin/list', authVerify, async (req, res, next) => {
    console.log('运行获取管理端订单列表');
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status;

        const where = {};
        if (status) {
            where.Status = status;
        }

        const { count, rows } = await Orders.findAndCountAll({
            where: where,
            include: [
                {
                    model: Users,
                    as: 'user',
                    attributes: ['UserID', 'Username', 'RealName', 'Phone']
                },
                {
                    model: Routes,
                    as: 'route',
                    attributes: ['RouteID', 'RouteName']
                }
            ],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'ASC']]
        });

        res.status(200).send({
            total: count,
            page: page,
            limit: limit,
            list: rows
        });
    } catch (error) {
        console.log('获取管理端订单列表失败:', error);
        next(error);
    }
});

// 管理员：审核订单
ordersRoute.put('/review/:id', authVerify, async (req, res, next) => {
    console.log('运行审核订单');
    try {
        const order = await Orders.findByPk(req.params.id);
        if (!order) {
            res.status(404).send({ message: '订单不存在' });
            return;
        }

        if (order.Status !== 'paid') {
            res.status(400).send({ message: '只有已支付订单才能审核' });
            return;
        }

        // 审核通过
        await order.update({ Status: 'processing' });

        console.log('订单审核通过');
        res.status(200).send({ message: '审核通过' });
    } catch (error) {
        console.log('审核订单失败:', error);
        next(error);
    }
});

module.exports = ordersRoute;
