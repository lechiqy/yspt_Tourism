const express = require('express');
const activitiesRoute = express.Router();
const db = require('../models');
const { Activities, ActivityRegistrations } = db;
const { authVerify, SECRET_KEY } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// 获取活动列表（公开接口，只返回非草稿状态）
activitiesRoute.get('/list', async (req, res, next) => {
    try {
        const { status } = req.query;
        const where = {};

        // 只返回已发布的活动
        where.Status = ['published', 'ongoing', 'ended'];

        if (status && status !== 'all' && ['published', 'ongoing', 'ended'].includes(status)) {
            where.Status = status;
        }

        const list = await Activities.findAll({
            where,
            order: [['Sort', 'ASC'], ['StartDate', 'DESC']]
        });

        res.json({ list });
    } catch (error) {
        console.log('获取活动列表失败:', error);
        next(error);
    }
});

// 获取活动详情（公开接口，附带当前用户报名状态）
activitiesRoute.get('/detail/:id', async (req, res, next) => {
    console.log('=== 获取活动详情 ===', req.params.id);
    console.log('Authorization header:', req.headers.authorization);
    try {
        const { id } = req.params;
        const activity = await Activities.findByPk(id);

        if (!activity) {
            return res.status(404).json({ message: '活动不存在' });
        }

        const result = {
            ...activity.toJSON(),
            hasJoined: false
        };

        // 如果携带了有效 token，顺带查报名状态
        const authHeader = req.headers.authorization;
        if (authHeader) {
            try {
                const decoded = jwt.verify(authHeader.replace('Bearer ', ''), SECRET_KEY);
                const UserID = decoded.UserID;
                console.log('Token 解码成功, UserID:', UserID);
                if (UserID) {
                    const existing = await ActivityRegistrations.findOne({
                        where: { ActivityID: id, UserID }
                    });
                    console.log('报名记录查询结果:', existing ? '已报名' : '未报名');
                    result.hasJoined = !!existing;
                }
            } catch (e) {
                console.log('Token 验证失败:', e.message);
                // token 无效或过期，忽略，hasJoined 保持 false
            }
        } else {
            console.log('未携带 token');
        }

        console.log('返回 hasJoined:', result.hasJoined);
        res.json({ data: result });
    } catch (error) {
        console.log('获取活动详情失败:', error);
        next(error);
    }
});

// 活动报名（需登录）
activitiesRoute.post('/join', authVerify, async (req, res, next) => {
    console.log('=== 活动报名请求 ===', req.body, '用户:', req.user);
    try {
        const { ActivityID } = req.body;
        const UserID = req.user.UserID;

        if (!ActivityID) {
            return res.status(400).json({ message: '活动ID不能为空' });
        }

        const activity = await Activities.findByPk(ActivityID);
        if (!activity) {
            return res.status(404).json({ message: '活动不存在' });
        }

        console.log('活动信息:', { JoinType: activity.JoinType, Status: activity.Status, CurrentParticipants: activity.CurrentParticipants, MaxParticipants: activity.MaxParticipants });

        // 检查活动类型（兼容旧数据 JoinType 为 null 的情况）
        if (activity.JoinType === 'link') {
            return res.status(400).json({ message: '该活动为跳转类型，无需报名' });
        }

        // 检查活动状态
        if (activity.Status === 'draft') {
            return res.status(400).json({ message: '活动未发布，无法报名' });
        }
        if (activity.Status === 'ended') {
            return res.status(400).json({ message: '活动已结束，无法报名' });
        }

        // 检查是否已报名
        const existing = await ActivityRegistrations.findOne({
            where: { ActivityID, UserID }
        });
        if (existing) {
            console.log('用户已报名, RegistrationID:', existing.RegistrationID);
            return res.status(400).json({ message: '您已报名该活动' });
        }

        // 检查名额
        if (activity.MaxParticipants && activity.CurrentParticipants >= activity.MaxParticipants) {
            return res.status(400).json({ message: '名额已满' });
        }

        // 创建报名记录并更新计数（事务保证原子性）
        await db.sequelize.transaction(async (t) => {
            await ActivityRegistrations.create(
                { ActivityID, UserID },
                { transaction: t }
            );

            // 使用 increment 原子递增，避免 sequelize.literal 的兼容问题
            const [affectedCount] = await Activities.increment(
                'CurrentParticipants',
                { where: { ActivityID }, transaction: t }
            );
            console.log('increment 结果, affectedCount:', affectedCount);
        });

        // 获取更新后的活动数据
        const updatedActivity = await Activities.findByPk(ActivityID);
        console.log('报名成功, 当前人数:', updatedActivity.CurrentParticipants);

        res.json({ message: '报名成功', data: { CurrentParticipants: updatedActivity.CurrentParticipants } });
    } catch (error) {
        console.log('活动报名失败:', error);
        next(error);
    }
});

// 检查用户是否已报名某活动
activitiesRoute.get('/check-joined/:id', authVerify, async (req, res, next) => {
    try {
        const { id } = req.params;
        const UserID = req.user.UserID;

        const existing = await ActivityRegistrations.findOne({
            where: { ActivityID: id, UserID }
        });

        res.json({ joined: !!existing });
    } catch (error) {
        console.log('检查报名状态失败:', error);
        next(error);
    }
});

// ========== 以下为管理员接口 ==========

// 获取所有活动列表（管理员）
activitiesRoute.get('/admin/list', authVerify, async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const where = {};

        if (status && status !== 'all') {
            where.Status = status;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await Activities.findAndCountAll({
            where,
            order: [['Sort', 'ASC'], ['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({ list: rows, total: count, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        console.log('获取活动列表失败:', error);
        next(error);
    }
});

// 添加活动（管理员）
activitiesRoute.post('/add', authVerify, async (req, res, next) => {
    console.log('添加活动:', req.body);
    try {
        const { Title, CoverImage, Description, Status, StartDate, EndDate, Location, Price, MaxParticipants, JoinType, LinkType, LinkValue, Sort } = req.body;

        if (!Title) {
            return res.status(400).json({ message: '活动标题不能为空' });
        }
        if (!CoverImage) {
            return res.status(400).json({ message: '封面图片不能为空' });
        }
        if (!StartDate || !EndDate) {
            return res.status(400).json({ message: '开始和结束日期不能为空' });
        }
        if (JoinType === 'link' && !LinkType) {
            return res.status(400).json({ message: '跳转类型活动必须选择跳转类型' });
        }

        const newActivity = await Activities.create({
            Title,
            CoverImage,
            Description: Description || '',
            Status: Status || 'draft',
            StartDate,
            EndDate,
            Location: Location || '',
            Price: Price || 0,
            MaxParticipants: MaxParticipants || null,
            CurrentParticipants: 0,
            JoinType: JoinType || 'register',
            LinkType: JoinType === 'link' ? LinkType : null,
            LinkValue: JoinType === 'link' ? LinkValue : null,
            Sort: Sort || 0
        });

        console.log('添加活动成功, ID:', newActivity.ActivityID);
        res.status(200).json({ message: '添加成功', data: newActivity });
    } catch (error) {
        console.log('添加活动失败:', error);
        next(error);
    }
});

// 更新活动（管理员）
activitiesRoute.put('/update/:id', authVerify, async (req, res, next) => {
    console.log('更新活动:', req.params.id, req.body);
    try {
        const { id } = req.params;
        const { Title, CoverImage, Description, Status, StartDate, EndDate, Location, Price, MaxParticipants, CurrentParticipants, JoinType, LinkType, LinkValue, Sort } = req.body;

        const activity = await Activities.findByPk(id);
        if (!activity) {
            return res.status(404).json({ message: '活动不存在' });
        }

        if (JoinType === 'link' && !LinkType) {
            return res.status(400).json({ message: '跳转类型活动必须选择跳转类型' });
        }

        const updateData = {};
        if (Title !== undefined) updateData.Title = Title;
        if (CoverImage !== undefined) updateData.CoverImage = CoverImage;
        if (Description !== undefined) updateData.Description = Description;
        if (Status !== undefined) updateData.Status = Status;
        if (StartDate !== undefined) updateData.StartDate = StartDate;
        if (EndDate !== undefined) updateData.EndDate = EndDate;
        if (Location !== undefined) updateData.Location = Location;
        if (Price !== undefined) updateData.Price = Price;
        if (MaxParticipants !== undefined) updateData.MaxParticipants = MaxParticipants;
        if (CurrentParticipants !== undefined) updateData.CurrentParticipants = CurrentParticipants;
        if (JoinType !== undefined) {
            updateData.JoinType = JoinType;
            updateData.LinkType = JoinType === 'link' ? LinkType : null;
            updateData.LinkValue = JoinType === 'link' ? LinkValue : null;
        }
        if (Sort !== undefined) updateData.Sort = Sort;

        await activity.update(updateData);

        console.log('更新活动成功, ID:', id);
        res.status(200).json({ message: '更新成功', data: activity });
    } catch (error) {
        console.log('更新活动失败:', error);
        next(error);
    }
});

// 删除活动（管理员）
activitiesRoute.delete('/delete/:id', authVerify, async (req, res, next) => {
    console.log('删除活动:', req.params.id);
    try {
        const { id } = req.params;

        const activity = await Activities.findByPk(id);
        if (!activity) {
            return res.status(404).json({ message: '活动不存在' });
        }

        await activity.destroy();

        console.log('删除活动成功');
        res.status(200).json({ message: '删除成功' });
    } catch (error) {
        console.log('删除活动失败:', error);
        next(error);
    }
});

module.exports = activitiesRoute;
