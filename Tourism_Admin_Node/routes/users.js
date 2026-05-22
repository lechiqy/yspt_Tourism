const express = require('express');
const { Users, Orders, Reviews, sequelize } = require('../models');
const { authVerify } = require('../middleware/auth');
const usersRoute = express.Router();

usersRoute.use(express.json());

// 获取用户信息
usersRoute.get('/info', authVerify, async (req, res, next) => {
    console.log('运行获取用户信息');
    try {
        const result = await Users.findByPk(req.user.UserID, {
            attributes: { exclude: ['Password'] }
        });
        if (!result) {
            res.status(404).send({ message: '用户不存在' });
            return;
        }
        res.status(200).send(result);
    } catch (error) {
        console.log('获取用户信息失败:', error);
        next(error);
    }
});

// 检查手机号是否已被绑定
usersRoute.get('/check-phone', authVerify, async (req, res, next) => {
    console.log('运行检查手机号');
    try {
        const { phone } = req.query;
        console.log('检查手机号:', phone, '当前用户ID:', req.user.UserID);
        if (!phone) {
            return res.status(400).send({ message: '请提供手机号' });
        }

        const existingUser = await Users.findOne({
            where: { Phone: phone },
            attributes: ['UserID', 'Username', 'Phone', 'OpenID']
        });

        console.log('查询结果 - existingUser:', existingUser ? existingUser.toJSON() : null);

        // 获取当前用户信息
        const currentUser = await Users.findByPk(req.user.UserID, {
            attributes: ['UserID', 'OpenID']
        });

        console.log('当前用户:', currentUser ? currentUser.toJSON() : null);

        if (existingUser && existingUser.UserID !== req.user.UserID) {
            console.log('检测到手机号已被其他用户绑定');
            res.status(200).send({
                exists: true,
                currentUserIsWechat: !!currentUser.OpenID,
                targetUser: {
                    UserID: existingUser.UserID,
                    Username: existingUser.Username,
                    isWechat: !!existingUser.OpenID
                }
            });
        } else {
            console.log('手机号未被其他用户绑定');
            res.status(200).send({ exists: false });
        }
    } catch (error) {
        console.log('检查手机号失败:', error);
        next(error);
    }
});

// 合并账号
usersRoute.post('/merge', authVerify, async (req, res, next) => {
    console.log('运行合并账号');
    const t = await sequelize.transaction();
    try {
        const { targetUserId } = req.body;
        const currentUserId = req.user.UserID;

        if (!targetUserId) {
            return res.status(400).send({ message: '请提供目标用户ID' });
        }

        // 获取当前用户
        const currentUser = await Users.findByPk(currentUserId, { transaction: t });
        // 获取目标用户（要被合并的用户）
        const targetUser = await Users.findByPk(targetUserId, { transaction: t });

        if (!currentUser || !targetUser) {
            await t.rollback();
            return res.status(404).send({ message: '用户不存在' });
        }

        // 判断合并方向：优先保留有OpenID的账户（微信账户）
        let mainAccount, subAccount;
        if (currentUser.OpenID && !targetUser.OpenID) {
            // 当前用户是微信账户，目标用户是普通账户
            mainAccount = currentUser;
            subAccount = targetUser;
        } else if (!currentUser.OpenID && targetUser.OpenID) {
            // 当前用户是普通账户，目标是微信账户
            mainAccount = targetUser;
            subAccount = currentUser;
        } else {
            // 都有OpenID或都没有OpenID，保留当前用户
            mainAccount = currentUser;
            subAccount = targetUser;
        }

        console.log(`合并方向：主账户 ${mainAccount.Username}(${mainAccount.UserID})，从账户 ${subAccount.Username}(${subAccount.UserID})`);

        // 转移订单到主账户
        await Orders.update(
            { UserID: mainAccount.UserID },
            { where: { UserID: subAccount.UserID }, transaction: t }
        );

        // 转移评价到主账户
        await Reviews.update(
            { UserID: mainAccount.UserID },
            { where: { UserID: subAccount.UserID }, transaction: t }
        );

        // 更新主账户的信息（只补充主账户没有的信息）
        const updateData = {};
        if (!mainAccount.Username && subAccount.Username) {
            updateData.Username = subAccount.Username;
        }
        if (!mainAccount.Password && subAccount.Password) {
            updateData.Password = subAccount.Password;
        }
        if (!mainAccount.Phone && subAccount.Phone) {
            updateData.Phone = subAccount.Phone;
        }
        if (!mainAccount.RealName && subAccount.RealName) {
            updateData.RealName = subAccount.RealName;
        }
        if (!mainAccount.Email && subAccount.Email) {
            updateData.Email = subAccount.Email;
        }
        if (!mainAccount.Avatar && subAccount.Avatar) {
            updateData.Avatar = subAccount.Avatar;
        }

        if (Object.keys(updateData).length > 0) {
            await mainAccount.update(updateData, { transaction: t });
        }

        // 删除从账户
        await subAccount.destroy({ transaction: t });

        await t.commit();

        // 生成新token（如果主账户不是当前登录的账户）
        let newToken = null;
        if (mainAccount.UserID !== currentUserId) {
            newToken = require('../middleware/auth').generateToken({
                UserID: mainAccount.UserID,
                Username: mainAccount.Username,
                Role: 'user'
            });
        }

        // 返回更新后的用户信息
        const updatedUser = await Users.findByPk(mainAccount.UserID, {
            attributes: { exclude: ['Password'] }
        });

        res.status(200).send({
            message: '账号合并成功',
            data: updatedUser,
            newToken: newToken
        });
    } catch (error) {
        await t.rollback();
        console.log('合并账号失败:', error);
        next(error);
    }
});

// 更新用户信息
usersRoute.put('/update', authVerify, async (req, res, next) => {
    console.log('运行更新用户信息');
    try {
        const [updated] = await Users.update(req.body, {
            where: { UserID: req.user.UserID }
        });
        if (updated) {
            const result = await Users.findByPk(req.user.UserID, {
                attributes: { exclude: ['Password'] }
            });
            res.status(200).send({ message: '更新成功', data: result });
        } else {
            res.status(404).send({ message: '更新失败' });
        }
    } catch (error) {
        console.log('更新用户信息失败:', error);
        next(error);
    }
});

// 获取所有用户列表（管理员）
usersRoute.get('/list', authVerify, async (req, res, next) => {
    console.log('运行获取用户列表');
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Users.findAndCountAll({
            attributes: { exclude: ['Password'] },
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
        console.log('获取用户列表失败:', error);
        next(error);
    }
});

module.exports = usersRoute;
