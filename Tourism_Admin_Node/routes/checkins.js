const express = require('express');
const { Checkins, Users } = require('../models');
const { authVerify } = require('../middleware/auth');
const checkinsRoute = express.Router();

checkinsRoute.use(express.json());

// 打卡
checkinsRoute.post('/add', authVerify, async (req, res, next) => {
    try {
        const { spotName } = req.body;
        if (!spotName) {
            return res.status(400).send({ message: '请提供景点名称' });
        }

        // 检查是否已打卡
        const existing = await Checkins.findOne({
            where: { UserID: req.user.UserID, SpotName: spotName }
        });
        if (existing) {
            return res.status(400).send({ message: '已打卡过该景点' });
        }

        const checkin = await Checkins.create({
            UserID: req.user.UserID,
            SpotName: spotName
        });

        res.status(200).send({ message: '打卡成功', data: checkin });
    } catch (error) {
        console.log('打卡失败:', error);
        next(error);
    }
});

// 获取用户打卡列表
checkinsRoute.get('/list', authVerify, async (req, res, next) => {
    try {
        const list = await Checkins.findAll({
            where: { UserID: req.user.UserID },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).send(list);
    } catch (error) {
        console.log('获取打卡列表失败:', error);
        next(error);
    }
});

// 获取用户对指定景点的打卡状态
checkinsRoute.get('/status', authVerify, async (req, res, next) => {
    try {
        const list = await Checkins.findAll({
            where: { UserID: req.user.UserID },
            attributes: ['SpotName']
        });
        const checkedSpots = list.map(item => item.SpotName);
        res.status(200).send({ checkedSpots });
    } catch (error) {
        console.log('获取打卡状态失败:', error);
        next(error);
    }
});

module.exports = checkinsRoute;
