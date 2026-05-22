<template>
    <view class="login-container">
        <view class="login-box">
            <view class="login-header">
                <text class="login-title">欢迎登录</text>
                <text class="login-subtitle">综合旅游管理系统</text>
            </view>
            <u-form labelPosition="top" :model="loginForm" ref="formRef">
                <u-form-item prop="Username" borderBottom>
                    <u-input
                        v-model="loginForm.Username"
                        placeholder="请输入用户名"
                        prefixIcon="account"
                        border="none"
                    ></u-input>
                </u-form-item>
                <u-form-item prop="Password" borderBottom>
                    <u-input
                        v-model="loginForm.Password"
                        type="password"
                        placeholder="请输入密码"
                        prefixIcon="lock"
                        border="none"
                    ></u-input>
                </u-form-item>
            </u-form>
            <u-button type="primary" size="large" :loading="loading" @click="handleLogin">
                登 录
            </u-button>
            <view class="wx-login">
                <button class="wx-btn" @click="handleWechatLogin">
                    <u-icon name="weixin-fill" size="36" color="#07c160"></u-icon>
                    <text class="wx-btn-text">微信一键登录</text>
                </button>
            </view>
            <view class="login-footer">
                <text class="register-text" @click="toRegister">还没有账号？立即注册</text>
            </view>
        </view>

        <!-- 合并账号确认弹窗 -->
        <u-popup :show="showMergePopup" mode="center" :round="20">
            <view class="merge-popup">
                <view class="popup-title">检测到微信账号</view>
                <view class="popup-content">
                    <text>该手机号已绑定微信账号「{{ wechatAccountToMerge.Username }}」，是否合并账号？</text>
                    <text class="popup-desc">合并后可使用微信登录，也可使用用户名/手机号登录。</text>
                </view>
                <view class="popup-btns">
                    <view class="popup-btn cancel" @click="handleNoMerge">不合并</view>
                    <view class="popup-btn confirm" @click="showMergeWarning">合并账号</view>
                </view>
            </view>
        </u-popup>

        <!-- 合并警告确认弹窗 -->
        <u-popup :show="showWarningPopup" mode="center" :round="20">
            <view class="merge-popup warning">
                <view class="popup-title warning-title">⚠️ 合并提示</view>
                <view class="popup-content">
                    <text class="warning-text">合并后将：</text>
                    <text class="warning-item success">1. 保留微信账号，可使用微信登录</text>
                    <text class="warning-item success">2. 当前账号的订单将转移到微信账号</text>
                    <text class="warning-item success">3. 可使用当前用户名/手机号+密码登录</text>
                    <text class="warning-item">4. 当前账号将被删除，此操作不可撤销</text>
                </view>
                <view class="popup-btns">
                    <view class="popup-btn cancel" @click="showWarningPopup = false">取消</view>
                    <view class="popup-btn danger" @click="handleConfirmMerge">确认合并</view>
                </view>
            </view>
        </u-popup>
    </view>
</template>

<script>
export default {
    data() {
        return {
            loginForm: {
                Username: '',
                Password: ''
            },
            loading: false,
            showMergePopup: false,
            showWarningPopup: false,
            wechatAccountToMerge: {},
            currentLoginRes: null
        };
    },
    onLoad() {
        // 页面加载时重置状态
        this.loginForm = { Username: '', Password: '' };
        this.loading = false;
        this.showMergePopup = false;
        this.showWarningPopup = false;
        this.wechatAccountToMerge = {};
        this.currentLoginRes = null;
        console.log('登录页面加载，状态已重置');
    },
    methods: {
        async handleLogin() {
            console.log('运行登录函数', this.loginForm);
            if (!this.loginForm.Username || !this.loginForm.Password) {
                uni.showToast({ title: '请输入用户名和密码', icon: 'none' });
                return;
            }
            this.loading = true;
            try {
                const res = await this.$api.userLogin(this.loginForm);
                console.log('登录成功:', res);

                // 检查是否需要合并账号
                if (res.wechatAccountToMerge) {
                    this.currentLoginRes = res;
                    this.wechatAccountToMerge = res.wechatAccountToMerge;
                    this.loading = false;
                    this.showMergePopup = true;
                    return;
                }

                this.doLoginSuccess(res);
            } catch (error) {
                console.log('登录失败:', error);
                uni.showToast({ title: error.message || '登录失败', icon: 'none' });
            } finally {
                this.loading = false;
            }
        },
        handleNoMerge() {
            this.showMergePopup = false;
            if (this.currentLoginRes) {
                this.doLoginSuccess(this.currentLoginRes);
            }
        },
        showMergeWarning() {
            this.showMergePopup = false;
            this.showWarningPopup = true;
        },
        async handleConfirmMerge() {
            this.showWarningPopup = false;
            this.loading = true;
            try {
                // 先保存当前登录的token
                uni.setStorageSync('token', this.currentLoginRes.token);

                // 执行合并
                const mergeRes = await this.$api.mergeAccount(this.wechatAccountToMerge.UserID);

                // 如果返回了新token，更新token（合并到微信账户的情况）
                if (mergeRes.newToken) {
                    uni.setStorageSync('token', mergeRes.newToken);
                }

                uni.showToast({ title: '账号合并成功' });

                // 更新用户信息
                const userInfo = await this.$api.getUserInfo();
                uni.setStorageSync('userInfo', JSON.stringify(userInfo));

                setTimeout(() => {
                    const redirect = uni.getStorageSync('redirectAfterLogin') || '/pages/pagesB/User/user';
                    uni.removeStorageSync('redirectAfterLogin');
                    uni.reLaunch({ url: redirect });
                }, 500);
            } catch (error) {
                console.log('合并账号失败:', error);
                uni.showToast({ title: '合并失败，请重试', icon: 'none' });
            } finally {
                this.loading = false;
            }
        },
        doLoginSuccess(res) {
            uni.setStorageSync('token', res.token);
            uni.setStorageSync('userInfo', JSON.stringify({
                UserID: res.UserID,
                Username: res.Username,
                RealName: res.RealName,
                Phone: res.Phone
            }));
            uni.showToast({ title: '登录成功' });
            setTimeout(() => {
                const redirect = uni.getStorageSync('redirectAfterLogin') || '/pages/pagesB/User/user';
                uni.removeStorageSync('redirectAfterLogin');
                uni.reLaunch({ url: redirect });
            }, 500);
        },
        toRegister() {
            uni.navigateTo({ url: '/pages/Register/register' });
        },
        async handleWechatLogin() {
            this.loading = true;
            try {
                const { code } = await uni.login();
                if (!code) {
                    uni.showToast({ title: '微信登录失败', icon: 'none' });
                    return;
                }
                const res = await this.$api.wechatLogin({ code });
                uni.setStorageSync('token', res.token);
                uni.setStorageSync('userInfo', JSON.stringify({
                    UserID: res.UserID,
                    Username: res.Username,
                    RealName: res.RealName,
                    Phone: res.Phone
                }));
                uni.showToast({ title: '微信登录成功' });
                setTimeout(() => {
                    const redirect = uni.getStorageSync('redirectAfterLogin') || '/pages/pagesB/User/user';
                    uni.removeStorageSync('redirectAfterLogin');
                    uni.reLaunch({ url: redirect });
                }, 500);
            } catch (error) {
                console.log('微信登录失败:', error);
                uni.showToast({ title: error.message || '微信登录失败', icon: 'none' });
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40rpx;
}
.login-box {
    width: 100%;
    background-color: #fff;
    border-radius: 30rpx;
    padding: 60rpx 40rpx;
}
.login-header {
    text-align: center;
    margin-bottom: 60rpx;
}
.login-title {
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
    display: block;
}
.login-subtitle {
    font-size: 28rpx;
    color: #999;
    margin-top: 20rpx;
    display: block;
}
.login-footer {
    text-align: center;
    margin-top: 40rpx;
}
.register-text {
    font-size: 26rpx;
    color: #3c9cff;
}
.wx-login {
    margin-top: 40rpx;
    text-align: center;
}
.wx-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 88rpx;
    background-color: #ffffff;
    border: 2rpx solid #07c160;
    border-radius: 44rpx;
    line-height: 88rpx;
    padding: 0;
}
.wx-btn::after {
    border: none;
}
.wx-btn-text {
    font-size: 30rpx;
    color: #07c160;
    margin-left: 12rpx;
}

/* 弹窗样式 */
.merge-popup {
    width: 560rpx;
    background-color: #fff;
    border-radius: 20rpx;
    overflow: hidden;
}

.popup-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    padding: 30rpx;
    border-bottom: 1px solid #f0f0f0;
}

.warning-title {
    color: #f56c6c;
}

.popup-content {
    padding: 30rpx;
}

.popup-desc {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-top: 16rpx;
}

.warning-text {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 20rpx;
}

.warning-item {
    display: block;
    font-size: 26rpx;
    color: #f56c6c;
    margin-bottom: 12rpx;
}

.warning-item.success {
    color: #67c23a;
}

.popup-btns {
    display: flex;
    border-top: 1px solid #f0f0f0;
}

.popup-btn {
    flex: 1;
    text-align: center;
    padding: 28rpx 0;
    font-size: 30rpx;
}

.popup-btn.cancel {
    color: #666;
    border-right: 1px solid #f0f0f0;
}

.popup-btn.confirm {
    color: #3c9cff;
}

.popup-btn.danger {
    color: #f56c6c;
}
</style>
