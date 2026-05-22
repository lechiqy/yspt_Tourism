const express = require('express');
const dashboardRoute = express.Router();
const db = require('../models');
const { Op } = require('sequelize');

dashboardRoute.get('/stats', async (req, res, next) => {
    try {
        const usersCount = await db.Users.count();
        const routesCount = await db.Routes.count();
        const ordersCount = await db.Orders.count();

        const revenueResult = await db.Orders.sum('TotalPrice', {
            where: {
                Status: {
                    [Op.not]: 'cancelled'
                }
            }
        });

        res.status(200).send({
            users: usersCount,
            routes: routesCount,
            orders: ordersCount,
            revenue: revenueResult || 0
        });
    } catch (error) {
        console.log('获取统计数据失败:', error);
        next(error);
    }
});

module.exports = dashboardRoute;
