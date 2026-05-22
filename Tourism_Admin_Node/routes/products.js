const express = require('express');
const { Products } = require('../models');
const { authVerify } = require('../middleware/auth');
const productRoute = express.Router();

productRoute.use(express.json());

// 获取商品列表（管理员用，含全部状态）
productRoute.get('/admin/list', authVerify, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const where = {};
        if (req.query.Status) {
            where.Status = req.query.Status;
        }

        const { count, rows } = await Products.findAndCountAll({
            where,
            order: [['ProductID', 'ASC']],
            offset,
            limit
        });

        res.status(200).send({ list: rows, total: count, page, limit });
    } catch (error) {
        next(error);
    }
});

// 获取上架商品列表（用户端用，仅 active 和 display_only）
productRoute.get('/list', async (req, res, next) => {
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

// 添加商品
productRoute.post('/add', authVerify, async (req, res, next) => {
    try {
        const { Name, Desc, Price, Unit, Image, Status } = req.body;
        if (!Name || Price === undefined) {
            res.status(400).send({ message: '商品名称和价格不能为空' });
            return;
        }

        const product = await Products.create({
            Name,
            Desc: Desc || '',
            Price,
            Unit: Unit || '个',
            Image: Image || '',
            Status: Status || 'active'
        });

        console.log('商品创建成功:', product.ProductID);
        res.status(200).send({ message: '商品创建成功', data: product });
    } catch (error) {
        next(error);
    }
});

// 更新商品
productRoute.put('/update/:id', authVerify, async (req, res, next) => {
    try {
        const product = await Products.findByPk(req.params.id);
        if (!product) {
            res.status(404).send({ message: '商品不存在' });
            return;
        }

        const { Name, Desc, Price, Unit, Image, Status } = req.body;
        const updateData = {};
        if (Name !== undefined) updateData.Name = Name;
        if (Desc !== undefined) updateData.Desc = Desc;
        if (Price !== undefined) updateData.Price = Price;
        if (Unit !== undefined) updateData.Unit = Unit;
        if (Image !== undefined) updateData.Image = Image;
        if (Status !== undefined) updateData.Status = Status;

        await product.update(updateData);
        console.log('商品更新成功:', product.ProductID);
        res.status(200).send({ message: '商品更新成功', data: product });
    } catch (error) {
        next(error);
    }
});

// 删除商品
productRoute.delete('/delete/:id', authVerify, async (req, res, next) => {
    try {
        const product = await Products.findByPk(req.params.id);
        if (!product) {
            res.status(404).send({ message: '商品不存在' });
            return;
        }

        await product.destroy();
        console.log('商品删除成功:', req.params.id);
        res.status(200).send({ message: '商品删除成功' });
    } catch (error) {
        next(error);
    }
});

module.exports = productRoute;
