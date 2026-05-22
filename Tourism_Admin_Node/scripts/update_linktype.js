require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: console.log
    }
);

async function updateLinkType() {
    try {
        await sequelize.query(`
            ALTER TABLE Swipers
            MODIFY COLUMN LinkType ENUM('none', 'route', 'content', 'hongtuan', 'hongji', 'routes', 'activity', 'category', 'external')
            NOT NULL DEFAULT 'none'
            COMMENT '链接类型'
        `);
        console.log('LinkType 枚举更新成功！');
    } catch (error) {
        console.log('更新失败:', error.message);
    } finally {
        await sequelize.close();
    }
}

updateLinkType();
