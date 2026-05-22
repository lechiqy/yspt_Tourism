<template>
  <div class="home-container">
    <h2>欢迎使用综合旅游管理系统</h2>
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon users-icon">
            <el-icon :size="30"><User /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-num">{{ stats.users }}</p>
            <p class="stat-label">用户总数</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon routes-icon">
            <el-icon :size="30"><Location /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-num">{{ stats.routes }}</p>
            <p class="stat-label">线路总数</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon orders-icon">
            <el-icon :size="30"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-num">{{ stats.orders }}</p>
            <p class="stat-label">订单总数</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon revenue-icon">
            <el-icon :size="30"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-num">¥{{ Number(stats.revenue).toLocaleString('zh-CN') }}</p>
            <p class="stat-label">总收入</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getDashboardStats } from '../../api';

const stats = ref({
    users: 0,
    routes: 0,
    orders: 0,
    revenue: 0
});

onMounted(async () => {
    try {
        const res = await getDashboardStats();
        stats.value = res;
    } catch (error) {
        console.log('获取统计数据失败:', error);
    }
});
</script>

<style scoped>
.home-container {
    padding: 20px;
}

h2 {
    margin-bottom: 30px;
    color: #333;
}

.stats-row {
    margin-bottom: 20px;
}

.stat-card {
    display: flex;
    align-items: center;
    padding: 20px;
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    margin-right: 20px;
}

.users-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.routes-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.orders-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.revenue-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stat-info {
    flex: 1;
}

.stat-num {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin: 0;
}

.stat-label {
    font-size: 14px;
    color: #999;
    margin: 5px 0 0;
}
</style>
