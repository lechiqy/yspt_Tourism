@echo off
echo ========================================
echo  综合旅游管理系统 - 数据库初始化批处理
echo  服务器: YOUR_DB_HOST
echo  数据库: tourism
echo  用户: Tourism
echo ========================================
echo.

echo 步骤1: 创建表结构...
mysql -h YOUR_DB_HOST -u Tourism -pYOUR_DB_PASSWORD tourism < "%~dp0init.sql"
if %ERRORLEVEL% EQU 0 (
    echo [成功] 表结构创建完成
) else (
    echo [失败] 表结构创建出错
    goto end
)

echo.
echo 步骤2: 插入测试数据...
mysql -h YOUR_DB_HOST -u Tourism -pYOUR_DB_PASSWORD tourism < "%~dp0seed.sql"
if %ERRORLEVEL% EQU 0 (
    echo [成功] 测试数据插入完成
) else (
    echo [失败] 测试数据插入出错
    goto end
)

echo.
echo ========================================
echo  数据库初始化全部完成！
echo  管理员账号: admin / admin123
echo  测试用户: zhangsan / user123
echo ========================================

:end
pause
