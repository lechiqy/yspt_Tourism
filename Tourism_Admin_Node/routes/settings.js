const express = require('express');
const settingsRoute = express.Router();
const db = require('../models');
const { Settings } = db;
const { authVerify } = require('../middleware/auth');

// 获取公开设置（公开接口）
settingsRoute.get('/public', async (req, res, next) => {
    try {
        const publicKeys = ['site_name', 'site_logo', 'contact_phone', 'contact_email', 'contact_address'];
        const settings = await Settings.findAll({
            where: { SettingKey: publicKeys }
        });

        const result = {};
        settings.forEach(item => {
            result[item.SettingKey] = item.SettingValue;
        });

        res.json({ data: result });
    } catch (error) {
        console.log('获取公开设置失败:', error);
        next(error);
    }
});

// ========== 以下为管理员接口 ==========

// 获取所有设置（管理员）
settingsRoute.get('/admin/list', authVerify, async (req, res, next) => {
    try {
        const list = await Settings.findAll({
            order: [['SettingID', 'ASC']]
        });

        const result = {};
        list.forEach(item => {
            result[item.SettingKey] = {
                value: item.SettingValue,
                type: item.SettingType,
                description: item.Description
            };
        });

        res.json({ data: result, list });
    } catch (error) {
        console.log('获取设置列表失败:', error);
        next(error);
    }
});

// 批量更新设置（管理员）
settingsRoute.put('/admin/update', authVerify, async (req, res, next) => {
    console.log('批量更新设置:', req.body);
    try {
        const updates = req.body;

        for (const [key, value] of Object.entries(updates)) {
            const setting = await Settings.findOne({ where: { SettingKey: key } });
            if (setting) {
                await setting.update({ SettingValue: value });
            } else {
                // 如果设置项不存在，创建新的
                await Settings.create({
                    SettingKey: key,
                    SettingValue: value,
                    SettingType: 'string',
                    Description: ''
                });
            }
        }

        res.status(200).json({ message: '更新成功' });
    } catch (error) {
        console.log('更新设置失败:', error);
        next(error);
    }
});

// 更新单个设置（管理员）
settingsRoute.put('/admin/update/:key', authVerify, async (req, res, next) => {
    console.log('更新设置:', req.params.key, req.body);
    try {
        const { key } = req.params;
        const { value, type, description } = req.body;

        const setting = await Settings.findOne({ where: { SettingKey: key } });

        if (!setting) {
            // 创建新设置
            const newSetting = await Settings.create({
                SettingKey: key,
                SettingValue: value,
                SettingType: type || 'string',
                Description: description || ''
            });
            return res.status(200).json({ message: '创建成功', data: newSetting });
        }

        const updateData = {};
        if (value !== undefined) updateData.SettingValue = value;
        if (type !== undefined) updateData.SettingType = type;
        if (description !== undefined) updateData.Description = description;

        await setting.update(updateData);

        res.status(200).json({ message: '更新成功', data: setting });
    } catch (error) {
        console.log('更新设置失败:', error);
        next(error);
    }
});

// 初始化默认设置（管理员）
settingsRoute.post('/admin/init', authVerify, async (req, res, next) => {
    try {
        const defaultSettings = [
            { SettingKey: 'site_name', SettingValue: '莆韵红团', SettingType: 'string', Description: '系统名称' },
            { SettingKey: 'site_logo', SettingValue: '', SettingType: 'image', Description: '系统Logo' },
            { SettingKey: 'contact_phone', SettingValue: '', SettingType: 'string', Description: '联系电话' },
            { SettingKey: 'contact_email', SettingValue: '', SettingType: 'string', Description: '联系邮箱' },
            { SettingKey: 'contact_address', SettingValue: '', SettingType: 'string', Description: '联系地址' }
        ];

        for (const setting of defaultSettings) {
            const existing = await Settings.findOne({ where: { SettingKey: setting.SettingKey } });
            if (!existing) {
                await Settings.create(setting);
            }
        }

        res.status(200).json({ message: '初始化成功' });
    } catch (error) {
        console.log('初始化设置失败:', error);
        next(error);
    }
});

module.exports = settingsRoute;
