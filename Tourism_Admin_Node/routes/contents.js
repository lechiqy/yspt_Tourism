const express = require('express');
const contentsRoute = express.Router();
const db = require('../models');
const { Contents, Spots, Routes } = db;
const { Op } = require('sequelize');
const { authVerify } = require('../middleware/auth');

// 获取分类内容列表（公开接口）
contentsRoute.get('/list', async (req, res, next) => {
    try {
        const { category, page = 1, limit = 20 } = req.query;
        if (!category) {
            return res.status(400).json({ message: '请指定分类参数 category' });
        }

        // 文旅路线 - 从 Routes 表获取（包含published和display_only状态）
        if (category === 'routes') {
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const { count, rows } = await Routes.findAndCountAll({
                where: { Status: { [Op.in]: ['published', 'display_only'] } },
                offset,
                limit: parseInt(limit),
                order: [['createdAt', 'DESC']]
            });
            return res.json({ list: rows, total: count });
        }

        // 景点 - 从 Spots 表获取（作为智慧景区的一部分）
        if (category === 'spots') {
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const { count, rows } = await Spots.findAndCountAll({
                offset,
                limit: parseInt(limit),
                order: [['createdAt', 'DESC']]
            });
            return res.json({ list: rows, total: count });
        }

        // 验证分类参数
        if (!['scenic', 'food', 'culture'].includes(category)) {
            return res.status(400).json({ message: '无效的分类参数' });
        }

        // 智慧景区、特色美食、非遗文化 - 从 Contents 表获取
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await Contents.findAndCountAll({
            where: { Category: category },
            offset,
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']]
        });
        res.json({ list: rows, total: count });
    } catch (error) {
        console.log('获取分类内容失败:', error);
        next(error);
    }
});

// 获取内容详情（公开接口）
contentsRoute.get('/detail/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const detail = await Contents.findByPk(id);
        if (!detail) {
            return res.status(404).json({ message: '内容不存在' });
        }
        res.json(detail);
    } catch (error) {
        console.log('获取内容详情失败:', error);
        next(error);
    }
});

// 搜索内容（公开接口）
contentsRoute.get('/search', async (req, res, next) => {
    console.log('=== 搜索请求 ===');
    console.log('查询参数:', req.query);
    try {
        const { keyword, category, page = 1, limit = 20 } = req.query;

        if (!keyword) {
            return res.status(400).json({ message: '请输入搜索关键词' });
        }

        console.log('搜索关键词:', keyword);
        console.log('分类:', category);

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { Op } = require('sequelize');

        // 根据分类搜索
        if (category === 'routes') {
            console.log('搜索线路...');
            const whereCondition = {
                Status: 'published',
                [Op.or]: [
                    { RouteName: { [Op.like]: `%${keyword}%` } },
                    { Description: { [Op.like]: `%${keyword}%` } }
                ]
            };
            console.log('线路搜索条件:', JSON.stringify(whereCondition, null, 2));

            const { count, rows } = await Routes.findAndCountAll({
                where: whereCondition,
                offset,
                limit: parseInt(limit),
                order: [['createdAt', 'DESC']]
            });
            console.log('线路搜索结果:', count, '条');
            return res.json({ list: rows, total: count });
        }

        if (category === 'spots') {
            console.log('搜索景点...');
            const { count, rows } = await Spots.findAndCountAll({
                where: {
                    [Op.or]: [
                        { SpotName: { [Op.like]: `%${keyword}%` } },
                        { Description: { [Op.like]: `%${keyword}%` } },
                        { City: { [Op.like]: `%${keyword}%` } }
                    ]
                },
                offset,
                limit: parseInt(limit),
                order: [['createdAt', 'DESC']]
            });
            console.log('景点搜索结果:', count, '条');
            return res.json({ list: rows, total: count });
        }

        // 搜索智慧景区、特色美食、非遗文化
        console.log('搜索分类内容...');

        // 先查看该分类下有多少数据
        const totalCount = await Contents.count({
            where: category && ['scenic', 'food', 'culture'].includes(category)
                ? { Category: category }
                : {}
        });
        console.log('该分类总数据量:', totalCount);

        const whereClause = {};
        if (category && ['scenic', 'food', 'culture'].includes(category)) {
            whereClause.Category = category;
        }
        whereClause[Op.or] = [
            { Title: { [Op.like]: `%${keyword}%` } },
            { Description: { [Op.like]: `%${keyword}%` } },
            { Address: { [Op.like]: `%${keyword}%` } }
        ];

        console.log('搜索条件:', JSON.stringify(whereClause, null, 2));

        const { count, rows } = await Contents.findAndCountAll({
            where: whereClause,
            offset,
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        console.log('搜索结果:', count, '条');
        console.log('结果数据:', JSON.stringify(rows.map(r => ({
            id: r.ContentID,
            title: r.Title,
            category: r.Category
        })), null, 2));

        res.json({ list: rows, total: count });
    } catch (error) {
        console.log('搜索内容失败:', error);
        next(error);
    }
});

// ========== 以下为管理员接口 ==========

// 获取所有分类内容列表（管理员）
contentsRoute.get('/admin/list', authVerify, async (req, res, next) => {
    try {
        const { category, page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = {};
        if (category && ['scenic', 'food', 'culture'].includes(category)) {
            whereClause.Category = category;
        }

        const { count, rows } = await Contents.findAndCountAll({
            where: whereClause,
            offset,
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        res.json({ list: rows, total: count, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        console.log('获取分类内容列表失败:', error);
        next(error);
    }
});

// 添加分类内容（管理员）
contentsRoute.post('/add', authVerify, async (req, res, next) => {
    console.log('运行添加分类内容');
    console.log('接收到的数据:', JSON.stringify(req.body, null, 2));
    try {
        const { Category, Title, Description, CoverImage, Images, RichContent, Address, Phone } = req.body;

        if (!Category || !Title) {
            return res.status(400).json({ message: '分类和标题不能为空' });
        }

        if (!['scenic', 'food', 'culture'].includes(Category)) {
            return res.status(400).json({ message: '无效的分类类型' });
        }

        const createData = {
            Category,
            Title,
            Description: Description || '',
            CoverImage: CoverImage || '',
            Images: Images || [],
            RichContent: RichContent || [],
            Address: Address || '',
            Phone: Phone || ''
        };

        console.log('准备创建的数据:', JSON.stringify(createData, null, 2));

        const newContent = await Contents.create(createData);

        console.log('添加分类内容成功, ID:', newContent.ContentID);
        console.log('保存的 Images:', newContent.Images);
        console.log('保存的 RichContent:', newContent.RichContent);

        res.status(200).json({ message: '添加成功', data: newContent });
    } catch (error) {
        console.log('添加分类内容失败:', error);
        next(error);
    }
});

// 更新分类内容（管理员）
contentsRoute.put('/update/:id', authVerify, async (req, res, next) => {
    console.log('运行更新分类内容');
    console.log('接收到的数据:', JSON.stringify(req.body, null, 2));
    try {
        const { id } = req.params;
        const { Category, Title, Description, CoverImage, Images, RichContent, Address, Phone } = req.body;

        const content = await Contents.findByPk(id);
        if (!content) {
            return res.status(404).json({ message: '内容不存在' });
        }

        if (Category && !['scenic', 'food', 'culture'].includes(Category)) {
            return res.status(400).json({ message: '无效的分类类型' });
        }

        const updateData = {};
        if (Category) updateData.Category = Category;
        if (Title) updateData.Title = Title;
        if (Description !== undefined) updateData.Description = Description;
        if (CoverImage !== undefined) updateData.CoverImage = CoverImage;
        if (Images !== undefined) updateData.Images = Images;
        if (RichContent !== undefined) updateData.RichContent = RichContent;
        if (Address !== undefined) updateData.Address = Address;
        if (Phone !== undefined) updateData.Phone = Phone;

        console.log('准备更新的数据:', JSON.stringify(updateData, null, 2));

        await content.update(updateData);

        // 重新查询确认保存结果
        const updated = await Contents.findByPk(id);
        console.log('更新分类内容成功, ID:', id);
        console.log('更新后的 Images:', updated.Images);
        console.log('更新后的 RichContent:', updated.RichContent);

        res.status(200).json({ message: '更新成功', data: updated });
    } catch (error) {
        console.log('更新分类内容失败:', error);
        next(error);
    }
});

// 删除分类内容（管理员）
contentsRoute.delete('/delete/:id', authVerify, async (req, res, next) => {
    console.log('运行删除分类内容');
    try {
        const { id } = req.params;

        const content = await Contents.findByPk(id);
        if (!content) {
            return res.status(404).json({ message: '内容不存在' });
        }

        await content.destroy();

        console.log('删除分类内容成功');
        res.status(200).json({ message: '删除成功' });
    } catch (error) {
        console.log('删除分类内容失败:', error);
        next(error);
    }
});

module.exports = contentsRoute;
