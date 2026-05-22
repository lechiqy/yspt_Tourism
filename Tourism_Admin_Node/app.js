const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const db = require('./models');

// 导入路由
const loginRoute = require('./routes/login');
const usersRoute = require('./routes/users');
const routesRoute = require('./routes/routes');
const ordersRoute = require('./routes/orders');
const reviewsRoute = require('./routes/reviews');
const spotsRoute = require('./routes/spots');
const adminsRoute = require('./routes/admins');
const dashboardRoute = require('./routes/dashboard');
const contentsRoute = require('./routes/contents');
const uploadRoute = require('./routes/upload');
const hongtuanRoute = require('./routes/hongtuan');
const checkinsRoute = require('./routes/checkins');
const productRoute = require('./routes/products');
const swipersRoute = require('./routes/swipers');
const activitiesRoute = require('./routes/activities');
const settingsRoute = require('./routes/settings');

// CORS 配置
const corsOptions = {
    origin: function (origin, callback) {
        callback(null, origin || '*');
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions)); // 允许跨域
app.use(express.json()); // 解析JSON
app.use(express.urlencoded({ extended: true })); // 解析URL编码
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 静态文件

// 接口路由
app.use('/login', loginRoute); // 登录路由
app.use('/users', usersRoute); // 用户路由
app.use('/routes', routesRoute); // 线路路由
app.use('/orders', ordersRoute); // 订单路由
app.use('/reviews', reviewsRoute); // 评价路由
app.use('/spots', spotsRoute); // 景点路由
app.use('/admins', adminsRoute); // 管理员路由
app.use('/dashboard', dashboardRoute); // 首页统计路由
app.use('/contents', contentsRoute); // 分类内容路由
app.use('/upload', uploadRoute); // 上传路由
app.use('/hongtuan', hongtuanRoute); // 红团路由
app.use('/checkins', checkinsRoute); // 打卡路由
app.use('/products', productRoute); // 商品路由
app.use('/swipers', swipersRoute); // 轮播图路由
app.use('/activities', activitiesRoute); // 活动路由
app.use('/settings', settingsRoute); // 设置路由

// 首页接口
app.get('/', (req, res) => {
    res.send({ message: '综合旅游管理系统API', version: '1.0.0' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.log('发生错误:', err.message || err);
    console.log('错误详情:', err.stack || '');
    res.status(500).send({ message: err.message || '服务器内部错误' });
});

// 同步数据库并启动服务器
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// 全局未捕获异常处理
process.on('uncaughtException', (err) => {
    console.log('未捕获的异常:', err.message, err.stack);
});

process.on('unhandledRejection', (reason) => {
    console.log('未处理的 Promise 拒绝:', reason);
});

// 先删除Orders表上RouteID的旧外键约束，再同步
async function startServer() {
    try {
        // 查找并删除 Orders 表的 RouteID 外键（保留 UserID 外键以保证数据完整性）
        const [results] = await db.sequelize.query(
            `SELECT CONSTRAINT_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Orders' AND CONSTRAINT_NAME LIKE '%ibfk%' AND COLUMN_NAME = 'RouteID'`
        );
        for (const row of results) {
            await db.sequelize.query(`ALTER TABLE Orders DROP FOREIGN KEY \`${row.CONSTRAINT_NAME}\``);
            console.log('已删除 RouteID 外键:', row.CONSTRAINT_NAME);
        }

        // 给 Routes.Status 增加 display_only 枚举值（兼容已有数据库）
        await db.sequelize.query(
            "ALTER TABLE Routes MODIFY COLUMN Status ENUM('draft','published','offline','display_only') NOT NULL DEFAULT 'draft'"
        ).catch(() => console.log('Routes.Status 枚举已包含 display_only'));

        // 扩展 Swipers.LinkType 枚举值（兼容已有数据库）
        await db.sequelize.query(
            "ALTER TABLE Swipers MODIFY COLUMN LinkType ENUM('none','route','content','hongtuan','hongji','routes','activity','category','external') NOT NULL DEFAULT 'none'"
        ).catch(() => console.log('Swipers.LinkType 枚举已扩展'));

        // 给 Activities 表添加 JoinType 和 LinkUrl 字段（兼容已有数据库）
        await db.sequelize.query(
            "ALTER TABLE Activities ADD COLUMN JoinType ENUM('register','link') NOT NULL DEFAULT 'register' COMMENT '参与方式：register-报名，link-点击跳转'"
        ).catch(() => console.log('Activities.JoinType 字段已存在'));

        await db.sequelize.query(
            "ALTER TABLE Activities ADD COLUMN LinkUrl VARCHAR(500) NULL COMMENT '跳转链接(JoinType为link时使用)'"
        ).catch(() => console.log('Activities.LinkUrl 字段已存在'));

        // 将旧数据中 JoinType 为 NULL 的行更新为默认值 register
        await db.sequelize.query(
            "UPDATE Activities SET JoinType = 'register' WHERE JoinType IS NULL"
        ).catch(() => console.log('Activities.JoinType 更新跳过'));

        await db.sequelize.sync();
        console.log('数据库同步成功');
        app.listen(PORT, HOST, () => {
            console.log(`服务器运行在 ${HOST}:${PORT}`);
        });
    } catch (err) {
        console.log('启动失败:', err.message);
        console.log('错误详情:', err.stack || '');
    }
}

startServer();

module.exports = app;
