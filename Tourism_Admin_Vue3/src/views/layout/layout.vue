<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="aside">
      <div class="logo">旅游管理</div>
      <el-menu
        :default-active="activeMenu"
        router
        class="menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/home">
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/routes">
          <span>线路管理</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <span>订单管理</span>
        </el-menu-item>
<el-menu-item index="/spots">
          <span>景点管理</span>
        </el-menu-item>
        <el-menu-item index="/reviews">
          <span>评价管理</span>
        </el-menu-item>
        <el-menu-item index="/contents">
          <span>分类内容管理</span>
        </el-menu-item>
        <el-menu-item index="/products">
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/swipers">
          <span>轮播图管理</span>
        </el-menu-item>
        <el-menu-item index="/activities">
          <span>活动管理</span>
        </el-menu-item>
        <el-menu-item index="/admins">
          <span>管理员管理</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 头部 -->
      <el-header class="header">
        <div class="header-left">
          <span class="page-title">{{ $route.meta.title }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              {{ adminInfo.Username }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const adminInfo = ref(JSON.parse(localStorage.getItem('adminInfo') || '{}'));

const activeMenu = computed(() => route.path);

const handleCommand = (command) => {
    if (command === 'logout') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        router.push('/login');
    }
};
</script>

<style scoped>
.layout-container {
    height: 100vh;
}

.aside {
    background-color: #304156;
}

.logo {
    height: 60px;
    line-height: 60px;
    text-align: center;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    background-color: #2b3a4a;
}

.menu {
    border-right: none;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
    font-size: 18px;
    font-weight: bold;
    color: #333;
}

.header-right {
    display: flex;
    align-items: center;
}

.user-info {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
}

.main {
    background-color: #f0f2f5;
    padding: 20px;
}
</style>
