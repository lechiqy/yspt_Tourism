/**
 * 数据库迁移脚本：为 Activities 表添加 LinkType 和 LinkValue 字段
 * 执行方式：node scripts/migrate_activities_linktype.js
 */

const { sequelize } = require('../models');

async function migrate() {
    console.log('开始迁移 Activities 表...');

    try {
        // 检查字段是否已存在
        const [results] = await sequelize.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Activities'
            AND COLUMN_NAME IN ('LinkType', 'LinkValue')
        `);

        const existingColumns = results.map(r => r.COLUMN_NAME);
        console.log('已存在的字段:', existingColumns);

        // 添加 LinkType 字段
        if (!existingColumns.includes('LinkType')) {
            console.log('添加 LinkType 字段...');
            await sequelize.query(`
                ALTER TABLE Activities ADD COLUMN LinkType ENUM('none', 'route', 'content', 'hongtuan', 'hongji', 'routes', 'activity', 'category', 'external') NULL COMMENT '链接类型：none-无跳转，route-线路详情，content-分类内容详情，hongtuan-莆韵红团，hongji-莆韵红迹，routes-旅游线路，activity-热门活动，category-分类页面，external-外部链接' AFTER JoinType
            `);
            console.log('LinkType 字段添加成功');
        } else {
            console.log('LinkType 字段已存在，跳过');
        }

        // 添加 LinkValue 字段
        if (!existingColumns.includes('LinkValue')) {
            console.log('添加 LinkValue 字段...');
            await sequelize.query(`
                ALTER TABLE Activities ADD COLUMN LinkValue VARCHAR(500) NULL COMMENT '链接值' AFTER LinkType
            `);
            console.log('LinkValue 字段添加成功');
        } else {
            console.log('LinkValue 字段已存在，跳过');
        }

        // 迁移旧数据
        console.log('迁移旧数据...');
        const [updateResult] = await sequelize.query(`
            UPDATE Activities SET LinkType = 'external', LinkValue = LinkUrl WHERE JoinType = 'link' AND LinkUrl IS NOT NULL AND LinkUrl != ''
        `);
        console.log('数据迁移完成:', updateResult.message || '成功');

        console.log('迁移完成！');
        process.exit(0);
    } catch (error) {
        console.error('迁移失败:', error);
        process.exit(1);
    }
}

migrate();
