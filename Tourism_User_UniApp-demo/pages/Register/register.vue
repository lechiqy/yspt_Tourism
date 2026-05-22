<template>
    <view class="register-container">
        <view class="register-box">
            <view class="register-header">
                <text class="register-title">用户注册</text>
                <text class="register-subtitle">注册即享精彩旅行</text>
            </view>
            <u-form labelPosition="top" :model="registerForm">
                <u-form-item prop="Username" borderBottom>
                    <u-input v-model="registerForm.Username" placeholder="请输入用户名" prefixIcon="account" border="none"></u-input>
                </u-form-item>
                <u-form-item prop="Password" borderBottom>
                    <u-input v-model="registerForm.Password" type="password" placeholder="请输入密码" prefixIcon="lock" border="none"></u-input>
                </u-form-item>
                <u-form-item prop="Phone" borderBottom>
                    <u-input v-model="registerForm.Phone" placeholder="请输入手机号" prefixIcon="phone" border="none" type="number"></u-input>
                </u-form-item>
                <u-form-item prop="Email" borderBottom>
                    <u-input v-model="registerForm.Email" placeholder="请输入邮箱（选填）" prefixIcon="email" border="none"></u-input>
                </u-form-item>
            </u-form>
            <view class="privacy-row" @click="togglePrivacy">
                <view class="privacy-checkbox" :class="{ 'checked': privacyAgreed }">
                    <text v-if="privacyAgreed" class="checkmark">✓</text>
                </view>
                <text class="privacy-text">我已阅读并同意</text>
                <text class="privacy-link" @click.stop="showPrivacy">《隐私政策及服务协议》</text>
            </view>
            <u-button type="primary" size="large" :disabled="!privacyAgreed" :loading="loading" @click="handleRegister">注 册</u-button>
            <view class="register-footer">
                <text class="login-text" @click="toLogin">已有账号？立即登录</text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            registerForm: {
                Username: '',
                Password: '',
                Phone: '',
                Email: ''
            },
            privacyAgreed: false,
            loading: false
        };
    },
    methods: {
        async handleRegister() {
            console.log('运行注册函数', this.registerForm);
            this.loading = true;
            try {
                const res = await this.$api.userRegister(this.registerForm);
                console.log('注册成功:', res);
                uni.showToast({ title: '注册成功' });
                setTimeout(() => {
                    uni.navigateBack();
                }, 500);
            } catch (error) {
                console.log('注册失败:', error);
            } finally {
                this.loading = false;
            }
        },
        togglePrivacy() {
                this.privacyAgreed = !this.privacyAgreed;
            },
        showPrivacy() {
                uni.navigateTo({
                    url: '/pages/Privacy/privacy'
                });
            },
        toLogin() {
            const pages = getCurrentPages();
            if (pages.length > 1) {
                uni.navigateBack();
            } else {
                uni.redirectTo({ url: '/pages/Login/login' });
            }
        }
    }
};
</script>

<style scoped>
.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40rpx;
}
.register-box {
    width: 100%;
    background-color: #fff;
    border-radius: 30rpx;
    padding: 60rpx 40rpx;
}
.register-header {
    text-align: center;
    margin-bottom: 60rpx;
}
.register-title {
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
    display: block;
}
.register-subtitle {
    font-size: 28rpx;
    color: #999;
    margin-top: 20rpx;
    display: block;
}
.register-footer {
    text-align: center;
    margin-top: 40rpx;
}
.login-text {
    font-size: 26rpx;
    color: #3c9cff;
}
	.privacy-row {
	    display: flex;
	    align-items: center;
	    justify-content: center;
	    margin: 30rpx 0;
	    flex-wrap: wrap;
	}
	.privacy-checkbox {
	    width: 36rpx;
	    height: 36rpx;
	    border-radius: 50%;
	    border: 2rpx solid #ddd;
	    display: flex;
	    align-items: center;
	    justify-content: center;
	    margin-right: 8rpx;
	    flex-shrink: 0;
	}
	.privacy-checkbox.checked {
	    background-color: #3c9cff;
	    border-color: #3c9cff;
	}
	.checkmark {
	    color: #fff;
	    font-size: 22rpx;
	    font-weight: bold;
	}
	.privacy-text {
	    font-size: 24rpx;
	    color: #666;
	}
	.privacy-link {
	    font-size: 24rpx;
	    color: #3c9cff;
	    text-decoration: underline;
	}
</style>
