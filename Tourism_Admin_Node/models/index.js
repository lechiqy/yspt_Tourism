require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// 数据库连接（从环境变量读取）
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || 'mysql',
    define: {
        timestamps: true // 时间戳
    },
    dialectOptions: {
        charset: 'utf8mb4',
        dateStrings: true,
        typeCast: true
    },
    timezone: '+08:00' // 东八区
});

// 游客模型
const Users = sequelize.define('Users', {
    UserID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '用户ID',
        field: 'UserID'
    },
    Username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '用户名',
        field: 'Username'
    },
    Password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '密码',
        field: 'Password'
    },
    RealName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '真实姓名',
        field: 'RealName'
    },
    Phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: '手机号',
        field: 'Phone'
    },
    Email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '邮箱',
        field: 'Email'
    },
    Avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '头像',
        field: 'Avatar'
    },
    OpenID: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        comment: '微信OpenID',
        field: 'OpenID'
    }
}, {
    tableName: 'Users',
    comment: '游客信息表'
});

// 管理员模型
const Admins = sequelize.define('Admins', {
    AdminID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '管理员ID',
        field: 'AdminID'
    },
    Username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '用户名',
        field: 'Username'
    },
    Password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '密码',
        field: 'Password'
    },
    RealName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '真实姓名',
        field: 'RealName'
    },
    Role: {
        type: DataTypes.ENUM('admin', 'route_admin'),
        allowNull: false,
        defaultValue: 'admin',
        comment: '角色：admin-系统管理员，route_admin-线路管理员',
        field: 'Role'
    },
    Phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: '联系电话',
        field: 'Phone'
    }
}, {
    tableName: 'Admins',
    comment: '管理员信息表'
});

// 景点模型
const Spots = sequelize.define('Spots', {
    SpotID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '景点ID',
        field: 'SpotID'
    },
    SpotName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '景点名称',
        field: 'SpotName'
    },
    City: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '所在城市',
        field: 'City'
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '景点描述',
        field: 'Description'
    },
    OpenTime: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '开放时间',
        field: 'OpenTime'
    },
    TicketPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: '门票价格',
        field: 'TicketPrice'
    },
    CoverImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '封面图片',
        field: 'CoverImage'
    }
}, {
    tableName: 'Spots',
    comment: '景点信息表'
});

// 线路模型
const Routes = sequelize.define('Routes', {
    RouteID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '线路ID',
        field: 'RouteID'
    },
    RouteName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '线路名称',
        field: 'RouteName'
    },
    Days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '行程天数',
        field: 'Days'
    },
    Price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '价格',
        field: 'Price'
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '线路描述',
        field: 'Description'
    },
    Status: {
        type: DataTypes.ENUM('draft', 'published', 'offline', 'display_only'),
        allowNull: false,
        defaultValue: 'draft',
        comment: '状态：draft-待发布，published-已发布可购买，display_only-仅展示(不可购买)，offline-已下架',
        field: 'Status'
    },
    CoverImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '封面图片',
        field: 'CoverImage'
    },
    AdminID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '管理员ID',
        field: 'AdminID'
    },
    Images: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '图片列表(JSON数组)',
        field: 'Images',
        get() {
            const value = this.getDataValue('Images');
            return value ? JSON.parse(value) : [];
        },
        set(value) {
            this.setDataValue('Images', JSON.stringify(value || []));
        }
    }
}, {
    tableName: 'Routes',
    comment: '线路信息表'
});

// 订单模型
const Orders = sequelize.define('Orders', {
    OrderID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '订单ID',
        field: 'OrderID'
    },
    OrderNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '订单编号',
        field: 'OrderNo'
    },
    UserID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '用户ID',
        field: 'UserID'
    },
    RouteID: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: '线路ID',
        field: 'RouteID'
    },
    OrderType: {
        type: DataTypes.ENUM('route', 'hongtuan'),
        allowNull: false,
        defaultValue: 'route',
        comment: '订单类型：route-线路订单，hongtuan-红团订单',
        field: 'OrderType'
    },
    ProductName: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: '商品名称（红团订单用）',
        field: 'ProductName'
    },
    Travelers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '出行人数',
        field: 'Travelers'
    },
    TotalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '总金额',
        field: 'TotalPrice'
    },
    Status: {
        type: DataTypes.ENUM('pending', 'paid', 'processing', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
        comment: '状态：pending-待支付，paid-已支付，processing-待出行，completed-已完成，cancelled-已取消',
        field: 'Status'
    },
    TravelDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '出行日期',
        field: 'TravelDate'
    }
}, {
    tableName: 'Orders',
    comment: '订单信息表'
});

// 评价模型
const Reviews = sequelize.define('Reviews', {
    ReviewID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '评价ID',
        field: 'ReviewID'
    },
    UserID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '用户ID',
        field: 'UserID'
    },
    RouteID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '线路ID',
        field: 'RouteID'
    },
    OrderID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '订单ID',
        field: 'OrderID'
    },
    Rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '评分(1-5)',
        field: 'Rating'
    },
    Content: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '评价内容',
        field: 'Content'
    }
}, {
    tableName: 'Reviews',
    comment: '评价信息表'
});

// 支付记录模型
const Payments = sequelize.define('Payments', {
    PaymentID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '支付ID',
        field: 'PaymentID'
    },
    OrderID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '订单ID',
        field: 'OrderID'
    },
    PaymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '支付方式',
        field: 'PaymentMethod'
    },
    Amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '支付金额',
        field: 'Amount'
    },
    Status: {
        type: DataTypes.ENUM('pending', 'success', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
        comment: '支付状态',
        field: 'Status'
    },
    TransactionNo: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '交易流水号',
        field: 'TransactionNo'
    }
}, {
    tableName: 'Payments',
    comment: '支付记录表'
});

// 分类内容模型（智慧景区、特色美食、非遗文化等）
const Contents = sequelize.define('Contents', {
    ContentID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '内容ID',
        field: 'ContentID'
    },
    Category: {
        type: DataTypes.ENUM('scenic', 'food', 'culture'),
        allowNull: false,
        comment: '分类：scenic-智慧景区，food-特色美食，culture-非遗文化',
        field: 'Category'
    },
    Title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '标题',
        field: 'Title'
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '描述',
        field: 'Description'
    },
    CoverImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '封面图片',
        field: 'CoverImage'
    },
    Images: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '图片列表(JSON数组)',
        field: 'Images',
        get() {
            const value = this.getDataValue('Images');
            return value ? JSON.parse(value) : [];
        },
        set(value) {
            this.setDataValue('Images', JSON.stringify(value || []));
        }
    },
    RichContent: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        comment: '富文本内容(JSON格式，支持图文混排)',
        field: 'RichContent',
        get() {
            const value = this.getDataValue('RichContent');
            return value ? JSON.parse(value) : [];
        },
        set(value) {
            this.setDataValue('RichContent', JSON.stringify(value || []));
        }
    },
    Address: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '地址',
        field: 'Address'
    },
    Phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '联系电话',
        field: 'Phone'
    }
}, {
    tableName: 'Contents',
    comment: '分类内容信息表'
});

// 线路-景点关联表
const RouteSpots = sequelize.define('RouteSpots', {
    RouteID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        comment: '线路ID',
        field: 'RouteID'
    },
    SpotID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        comment: '景点ID',
        field: 'SpotID'
    }
}, {
    tableName: 'RouteSpots',
    comment: '线路景点关联表',
    timestamps: false
});

// 打卡记录模型
const Checkins = sequelize.define('Checkins', {
    CheckinID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '打卡记录ID',
        field: 'CheckinID'
    },
    UserID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '用户ID',
        field: 'UserID'
    },
    SpotName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '景点名称',
        field: 'SpotName'
    }
}, {
    tableName: 'Checkins',
    comment: '景点打卡记录表'
});

// 红团商品模型
const Products = sequelize.define('Products', {
    ProductID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '商品ID',
        field: 'ProductID'
    },
    Name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '商品名称',
        field: 'Name'
    },
    Desc: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '商品描述',
        field: 'Desc'
    },
    Price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '单价',
        field: 'Price'
    },
    Unit: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: '个',
        comment: '单位',
        field: 'Unit'
    },
    Image: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '商品图片URL',
        field: 'Image'
    },
    Status: {
        type: DataTypes.ENUM('active', 'display_only', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
        comment: '状态: active-上架可购买, display_only-仅展示(不可购买), inactive-下架不显示',
        field: 'Status'
    }
}, {
    tableName: 'Products',
    comment: '红团商品信息表'
});

// 轮播图模型
const Swipers = sequelize.define('Swipers', {
    SwiperID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '轮播图ID',
        field: 'SwiperID'
    },
    Title: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: '标题',
        field: 'Title'
    },
    Image: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: '图片URL',
        field: 'Image'
    },
    LinkType: {
        type: DataTypes.ENUM('none', 'route', 'content', 'hongtuan', 'hongji', 'routes', 'activity', 'category', 'external'),
        allowNull: false,
        defaultValue: 'none',
        comment: '链接类型：none-无跳转，route-线路详情，content-分类内容详情，hongtuan-莆韵红团，hongji-莆韵红迹，routes-旅游线路，activity-热门活动，category-分类页面，external-外部链接',
        field: 'LinkType'
    },
    LinkValue: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '链接值',
        field: 'LinkValue'
    },
    Sort: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序（数字越小越靠前）',
        field: 'Sort'
    },
    Status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
        comment: '状态：active-启用，inactive-禁用',
        field: 'Status'
    }
}, {
    tableName: 'Swipers',
    comment: '首页轮播图表'
});

// 活动模型
const Activities = sequelize.define('Activities', {
    ActivityID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '活动ID',
        field: 'ActivityID'
    },
    Title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '活动标题',
        field: 'Title'
    },
    CoverImage: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: '封面图片URL',
        field: 'CoverImage'
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '活动简介',
        field: 'Description'
    },
    Status: {
        type: DataTypes.ENUM('draft', 'published', 'ongoing', 'ended'),
        allowNull: false,
        defaultValue: 'draft',
        comment: '状态：draft-草稿，published-已发布(未开始)，ongoing-进行中，ended-已结束',
        field: 'Status'
    },
    StartDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '开始日期',
        field: 'StartDate'
    },
    EndDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '结束日期',
        field: 'EndDate'
    },
    Location: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '活动地点',
        field: 'Location'
    },
    Price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: '活动价格(0表示免费)',
        field: 'Price'
    },
    MaxParticipants: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '最大参与人数(null表示不限)',
        field: 'MaxParticipants'
    },
    CurrentParticipants: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '当前报名人数',
        field: 'CurrentParticipants'
    },
    JoinType: {
        type: DataTypes.ENUM('register', 'link'),
        allowNull: false,
        defaultValue: 'register',
        comment: '参与方式：register-报名，link-点击跳转',
        field: 'JoinType'
    },
    LinkType: {
        type: DataTypes.ENUM('none', 'route', 'content', 'hongtuan', 'hongji', 'routes', 'activity', 'category', 'external'),
        allowNull: true,
        comment: '链接类型：none-无跳转，route-线路详情，content-分类内容详情，hongtuan-莆韵红团，hongji-莆韵红迹，routes-旅游线路，activity-热门活动，category-分类页面，external-外部链接',
        field: 'LinkType'
    },
    LinkValue: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '链接值',
        field: 'LinkValue'
    },
    Sort: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序(数字越小越靠前)',
        field: 'Sort'
    }
}, {
    tableName: 'Activities',
    comment: '活动信息表'
});

// 活动报名记录模型
const ActivityRegistrations = sequelize.define('ActivityRegistrations', {
    RegistrationID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '报名记录ID',
        field: 'RegistrationID'
    },
    ActivityID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '活动ID',
        field: 'ActivityID'
    },
    UserID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '用户ID',
        field: 'UserID'
    }
}, {
    tableName: 'ActivityRegistrations',
    comment: '活动报名记录表',
    indexes: [
        { unique: true, fields: ['ActivityID', 'UserID'] }
    ]
});

// 系统设置模型
const Settings = sequelize.define('Settings', {
    SettingID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '设置ID',
        field: 'SettingID'
    },
    SettingKey: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: '设置键名',
        field: 'SettingKey'
    },
    SettingValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '设置值',
        field: 'SettingValue'
    },
    SettingType: {
        type: DataTypes.ENUM('string', 'number', 'boolean', 'json', 'image'),
        allowNull: false,
        defaultValue: 'string',
        comment: '值类型',
        field: 'SettingType'
    },
    Description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '设置说明',
        field: 'Description'
    }
}, {
    tableName: 'Settings',
    comment: '系统设置表'
});

// 设置关联关系
// 管理员管理线路（一对多）
Admins.hasMany(Routes, { foreignKey: 'AdminID', targetKey: 'AdminID' });
Routes.belongsTo(Admins, { foreignKey: 'AdminID', targetKey: 'AdminID', as: 'admin' });

// 游客下单（一对多）
Users.hasMany(Orders, { foreignKey: 'UserID', targetKey: 'UserID' });
Orders.belongsTo(Users, { foreignKey: 'UserID', targetKey: 'UserID', as: 'user' });

// 线路有订单（一对多，禁用物理外键以支持红团订单RouteID为null）
Routes.hasMany(Orders, { foreignKey: 'RouteID', targetKey: 'RouteID', constraints: false });
Orders.belongsTo(Routes, { foreignKey: 'RouteID', targetKey: 'RouteID', as: 'route', constraints: false });

// 游客评价（一对多）
Users.hasMany(Reviews, { foreignKey: 'UserID', targetKey: 'UserID' });
Reviews.belongsTo(Users, { foreignKey: 'UserID', targetKey: 'UserID', as: 'user' });

// 游客打卡（一对多）
Users.hasMany(Checkins, { foreignKey: 'UserID', targetKey: 'UserID' });
Checkins.belongsTo(Users, { foreignKey: 'UserID', targetKey: 'UserID', as: 'user' });

// 线路被评价（一对多）
Routes.hasMany(Reviews, { foreignKey: 'RouteID', targetKey: 'RouteID', as: 'reviews' });
Reviews.belongsTo(Routes, { foreignKey: 'RouteID', targetKey: 'RouteID', as: 'route' });

// 订单支付（一对一）
Orders.hasOne(Payments, { foreignKey: 'OrderID', targetKey: 'OrderID', as: 'payments' });
Payments.belongsTo(Orders, { foreignKey: 'OrderID', targetKey: 'OrderID', as: 'order' });

// 线路包含景点（多对多）
Routes.belongsToMany(Spots, { through: RouteSpots, foreignKey: 'RouteID', otherKey: 'SpotID', as: 'spots' });
Spots.belongsToMany(Routes, { through: RouteSpots, foreignKey: 'SpotID', otherKey: 'RouteID', as: 'routes' });

// 活动报名记录关联
Activities.hasMany(ActivityRegistrations, { foreignKey: 'ActivityID', targetKey: 'ActivityID', as: 'registrations' });
ActivityRegistrations.belongsTo(Activities, { foreignKey: 'ActivityID', targetKey: 'ActivityID', as: 'activity' });
Users.hasMany(ActivityRegistrations, { foreignKey: 'UserID', targetKey: 'UserID', as: 'activityRegistrations' });
ActivityRegistrations.belongsTo(Users, { foreignKey: 'UserID', targetKey: 'UserID', as: 'user' });

module.exports = {
    sequelize,
    Users,
    Admins,
    Spots,
    Routes,
    Orders,
    Reviews,
    Payments,
    RouteSpots,
    Contents,
    Checkins,
    Products,
    Swipers,
    Activities,
    ActivityRegistrations,
    Settings
};
