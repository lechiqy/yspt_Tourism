# 综合旅游管理系统

一个基于 Node.js + Vue3 + UniApp 的综合性旅游管理平台，包含管理后台和微信小程序用户端。

## 项目简介

本系统为旅游企业提供完整的线上管理解决方案，支持旅游线路管理、订单处理、用户管理、内容运营等功能。

## 项目结构

```
yspt_Tourism/
├── Tourism_Admin_Node/        # Node.js 后端 API
├── Tourism_Admin_Vue3/        # Vue3 管理后台
└── Tourism_User_UniApp-demo/  # UniApp 用户端（微信小程序）
```

## 功能特性

### 管理后台
- 仪表盘数据统计
- 旅游线路管理（发布、编辑、上下架）
- 订单管理与审核
- 用户管理
- 景点管理
- 评价管理
- 内容运营（智慧景区、特色美食、非遗文化）
- 红团商品管理
- 轮播图配置
- 活动管理
- 系统设置

### 用户端（微信小程序）
- 旅游线路浏览与预订
- 在线下单与支付
- 订单管理
- 景点打卡
- 活动报名
- 个人中心
- 微信授权登录

## 技术栈

### 后端 (Tourism_Admin_Node)
- Node.js + Express
- MySQL + Sequelize ORM
- JWT 身份认证
- 微信登录集成

### 管理后台 (Tourism_Admin_Vue3)
- Vue 3 + Vite
- Vue Router
- Element Plus
- ECharts
- Axios

### 用户端 (Tourism_User_UniApp-demo)
- UniApp
- uView UI
- 微信小程序

## 快速开始

### 环境要求
- Node.js >= 16
- MySQL >= 5.7
- 微信开发者工具（用于小程序开发）

### 1. 克隆项目

```bash
git clone https://github.com/lechiqy/yspt_Tourism.git
cd yspt_Tourism
```

### 2. 后端配置与启动

```bash
cd Tourism_Admin_Node

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填写数据库和微信配置

# 初始化数据库
# 在 MySQL 中创建数据库，然后执行 database/init.sql

# 启动服务
npm run dev
```

### 3. 管理后台配置与启动

```bash
cd Tourism_Admin_Vue3

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 4. 小程序配置与运行

```bash
cd Tourism_User_UniApp-demo

# 安装依赖
npm install
```

1. 使用 HBuilderX 打开项目
2. 在 `manifest.json` 中配置微信小程序 AppID
3. 点击运行 -> 运行到小程序模拟器 -> 微信开发者工具

## 配置说明

### 后端环境变量 (.env)

```env
# 数据库配置
DB_NAME=tourism
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_DIALECT=mysql

# 微信小程序配置
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret

# 服务器配置
PORT=3001
HOST=0.0.0.0
```

### 微信小程序配置

在 `Tourism_User_UniApp-demo/manifest.json` 中配置：

```json
"mp-weixin": {
  "appid": "your_wechat_appid"
}
```

## API 接口

后端 API 运行在 `http://localhost:3001`

主要接口：
- `POST /login/login` - 用户登录
- `POST /login/register` - 用户注册
- `POST /login/wechat` - 微信登录
- `GET /routes/list` - 线路列表
- `GET /routes/detail/:id` - 线路详情
- `POST /orders/create` - 创建订单
- `GET /orders/user/list` - 用户订单列表
- ...

## 数据库初始化

1. 创建数据库
```sql
CREATE DATABASE tourism CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 执行初始化脚本
```bash
mysql -u root -p tourism < Tourism_Admin_Node/database/init.sql
mysql -u root -p tourism < Tourism_Admin_Node/database/seed.sql
```

## 默认账号

管理后台默认管理员账号请在 `seed.sql` 中查看。

## 项目预览

- 管理后台：`http://localhost:5173`
- API 文档：`http://localhost:3001`
- 小程序：使用微信开发者工具预览

## 许可证

MIT License

## 作者

lechiqy
