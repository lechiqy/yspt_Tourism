const express = require('express');
const swipersRoute = express.Router();
const db = require('../models');
const { Swipers } = db;
const { authVerify } = require('../middleware/auth');

// 获取轮播图列表（公开接口，只返回启用的）
swipersRoute.get('/list', async (req, res, next) => {
    try {
        const list = await Swipers.findAll({
            where: { Status: 'active' },
            order: [['Sort', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json({ list });
    } catch (error) {
        console.log('获取轮播图列表失败:', error);
        next(error);
    }
});

// ========== 以下为管理员接口 ==========

// 获取所有轮播图列表（管理员）
swipersRoute.get('/admin/list', authVerify, async (req, res, next) => {
    try {
        const list = await Swipers.findAll({
            order: [['Sort', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json({ list });
    } catch (error) {
        console.log('获取轮播图列表失败:', error);
        next(error);
    }
});

// 添加轮播图（管理员）
swipersRoute.post('/add', authVerify, async (req, res, next) => {
    console.log('添加轮播图:', req.body);
    try {
        const { Title, Image, LinkType, LinkValue, Sort, Status } = req.body;

        if (!Image) {
            return res.status(400).json({ message: '图片不能为空' });
        }

        const newSwiper = await Swipers.create({
            Title: Title || '',
            Image,
            LinkType: LinkType || 'none',
            LinkValue: LinkValue || '',
            Sort: Sort || 0,
            Status: Status || 'active'
        });

        console.log('添加轮播图成功, ID:', newSwiper.SwiperID);
        res.status(200).json({ message: '添加成功', data: newSwiper });
    } catch (error) {
        console.log('添加轮播图失败:', error);
        next(error);
    }
});

// 更新轮播图（管理员）
swipersRoute.put('/update/:id', authVerify, async (req, res, next) => {
    console.log('更新轮播图:', req.params.id, req.body);
    try {
        const { id } = req.params;
        const { Title, Image, LinkType, LinkValue, Sort, Status } = req.body;

        const swiper = await Swipers.findByPk(id);
        if (!swiper) {
            return res.status(404).json({ message: '轮播图不存在' });
        }

        const updateData = {};
        if (Title !== undefined) updateData.Title = Title;
        if (Image !== undefined) updateData.Image = Image;
        if (LinkType !== undefined) updateData.LinkType = LinkType;
        if (LinkValue !== undefined) updateData.LinkValue = LinkValue;
        if (Sort !== undefined) updateData.Sort = Sort;
        if (Status !== undefined) updateData.Status = Status;

        await swiper.update(updateData);

        console.log('更新轮播图成功, ID:', id);
        res.status(200).json({ message: '更新成功', data: swiper });
    } catch (error) {
        console.log('更新轮播图失败:', error);
        next(error);
    }
});

// 删除轮播图（管理员）
swipersRoute.delete('/delete/:id', authVerify, async (req, res, next) => {
    console.log('删除轮播图:', req.params.id);
    try {
        const { id } = req.params;

        const swiper = await Swipers.findByPk(id);
        if (!swiper) {
            return res.status(404).json({ message: '轮播图不存在' });
        }

        await swiper.destroy();

        console.log('删除轮播图成功');
        res.status(200).json({ message: '删除成功' });
    } catch (error) {
        console.log('删除轮播图失败:', error);
        next(error);
    }
});

module.exports = swipersRoute;
