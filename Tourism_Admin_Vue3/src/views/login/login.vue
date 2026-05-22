<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">综合旅游管理系统</h2>
      <p class="login-subtitle">管理员登录</p>
      <el-form :model="loginForm" class="login-form">
        <el-form-item>
          <el-input
            v-model="loginForm.Username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="loginForm.Password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { login } from '../../api';

const router = useRouter();

const loginForm = ref({
    Username: '',
    Password: ''
});

const loading = ref(false);

const handleLogin = async () => {
    console.log('运行登录函数', loginForm.value);
    if (!loginForm.value.Username || !loginForm.value.Password) {
        ElMessage.warning('请输入用户名和密码');
        return;
    }

    loading.value = true;
    try {
        const res = await login(loginForm.value);
        console.log('登录成功:', res);

        localStorage.setItem('adminToken', res.token);
        localStorage.setItem('adminInfo', JSON.stringify({
            AdminID: res.AdminID,
            Username: res.Username,
            RealName: res.RealName,
            Role: res.Role
        }));

        ElMessage.success('登录成功');
        router.push('/');
    } catch (error) {
        console.log('登录失败:', error);
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
    width: 400px;
    padding: 40px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-title {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
}

.login-subtitle {
    text-align: center;
    font-size: 14px;
    color: #999;
    margin-bottom: 30px;
}

.login-form {
    margin-top: 20px;
}

.login-button {
    width: 100%;
    font-size: 16px;
}
</style>
