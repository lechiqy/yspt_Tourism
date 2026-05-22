const express = require('express');
const { Orders, Payments, Users, Products } = require('../models');
const { authVerify } = require('../middleware/auth');
const dayjs = require('dayjs');
const hongtuanRoute = express.Router();

hongtuanRoute.use(express.json());

function generateOrderNo() {
    return 'HT' + dayjs().format('YYYYMMDDHHmmss') + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// 获取红团商品列表（仅返回上架和仅展示的商品）
hongtuanRoute.get('/products', async (req, res, next) => {
    try {
        const products = await Products.findAll({
            where: {
                Status: ['active', 'display_only']
            },
            order: [['ProductID', 'ASC']]
        });
        res.status(200).send({ list: products });
    } catch (error) {
        next(error);
    }
});

// 创建红团订单（仅 active 状态的商品可购买）
hongtuanRoute.post('/order', authVerify, async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;

        const product = await Products.findByPk(productId);
        if (!product) {
            res.status(400).send({ message: '商品不存在' });
            return;
        }

        if (product.Status !== 'active') {
            res.status(400).send({ message: '该商品暂未上架，无法购买' });
            return;
        }

        // 校验用户是否存在
        const user = await Users.findByPk(req.user.UserID);
        if (!user) {
            res.status(401).send({ message: '用户不存在，请重新登录' });
            return;
        }

        const qty = quantity || 1;
        const totalPrice = parseFloat(product.Price) * qty;
        const orderNo = generateOrderNo();

        const order = await Orders.create({
            OrderNo: orderNo,
            UserID: req.user.UserID,
            RouteID: null,
            OrderType: 'hongtuan',
            ProductName: product.Name,
            Travelers: qty,
            TotalPrice: totalPrice,
            Status: 'pending',
            TravelDate: dayjs().format('YYYY-MM-DD')
        });

        console.log('红团订单创建成功:', order.OrderNo);
        res.status(200).send({ message: '订单创建成功', data: order });
    } catch (error) {
        console.log('红团订单创建失败:', error);
        next(error);
    }
});

// 支付红团订单
hongtuanRoute.post('/pay/:id', authVerify, async (req, res, next) => {
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

        if (order.OrderType !== 'hongtuan') {
            res.status(400).send({ message: '非红团订单' });
            return;
        }

        const payment = await Payments.create({
            OrderID: order.OrderID,
            PaymentMethod: req.body.PaymentMethod || 'alipay',
            Amount: order.TotalPrice,
            Status: 'success',
            TransactionNo: 'TXN' + Date.now()
        });

        await order.update({ Status: 'processing' });

        console.log('红团订单支付成功:', payment);
        res.status(200).send({ message: '支付成功', data: payment });
    } catch (error) {
        console.log('红团支付失败:', error);
        next(error);
    }
});

module.exports = hongtuanRoute;
