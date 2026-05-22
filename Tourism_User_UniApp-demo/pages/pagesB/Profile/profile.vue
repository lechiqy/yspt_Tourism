<template>
    <view class="profile-container">
        <view class="main-content">
            <!-- 头像 -->
            <view class="avatar-section" @click="chooseAvatar">
                <u-avatar :src="formData.Avatar || ''" size="100"></u-avatar>
                <text class="avatar-tip">点击更换头像</text>
            </view>

            <!-- 表单 -->
            <view class="form-section">
                <view class="form-item">
                    <text class="form-label">用户名</text>
                    <text class="form-value">{{ formData.Username }}</text>
                </view>
                <view class="form-item">
                    <text class="form-label">真实姓名</text>
                    <input
                        class="form-input"
                        type="text"
                        v-model="formData.RealName"
                        placeholder="请输入真实姓名"
                        maxlength="20"
                    />
                </view>
                <view class="form-item">
                    <text class="form-label">手机号</text>
                    <input
                        class="form-input"
                        type="number"
                        v-model="formData.Phone"
                        placeholder="请输入手机号"
                        maxlength="11"
                    />
                </view>
                <view class="form-item">
                    <text class="form-label">邮箱</text>
                    <input
                        class="form-input"
                        type="text"
                        v-model="formData.Email"
                        placeholder="请输入邮箱"
                    />
                </view>
            </view>

            <!-- 保存按钮 -->
            <view class="btn-section">
                <u-button type="primary" @click="handleSave" :loading="loading">保存修改</u-button>
            </view>
        </view>

        <!-- 合并账号确认弹窗 -->
        <u-popup :show="showMergePopup" mode="center" :round="20">
            <view class="merge-popup">
                <view class="popup-title">提示</view>
                <view class="popup-content">
                    <text>该手机号已绑定账号「{{ mergeTargetUser.Username }}」，是否合并账号？</text>
                    <text class="popup-desc" v-if="isWechatUser">合并后可使用微信登录，也可使用用户名/手机号登录。</text>
                    <text class="popup-desc" v-else>合并后将获得该账号的微信登录能力。</text>
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
                    <text class="warning-item success" v-if="isWechatUser">1. 保留当前微信账号，可继续微信登录</text>
                    <text class="warning-item success" v-if="isWechatUser">2. 获得该账号的用户名，可用用户名登录</text>
                    <text class="warning-item success" v-if="!isWechatUser && mergeTargetUser.isWechat">1. 获得微信登录能力，可用微信登录</text>
                    <text class="warning-item success" v-if="!isWechatUser && mergeTargetUser.isWechat">2. 保留当前用户名，可继续使用用户名登录</text>
                    <text class="warning-item success">3. 该账号的订单将转移到当前账号</text>
                    <text class="warning-item">4. 该账号将被删除，此操作不可撤销</text>
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
            loading: false,
            isWechatUser: false,
            originalPhone: '',
            formData: {
                Avatar: '',
                Username: '',
                RealName: '',
                Phone: '',
                Email: ''
            },
            showMergePopup: false,
            showWarningPopup: false,
            mergeTargetUser: {}
        };
    },
    onLoad() {
        this.loadUserInfo();
    },
    methods: {
        async loadUserInfo() {
            try {
                const res = await this.$api.getUserInfo();
                console.log('获取用户信息返回:', res);
                console.log('OpenID:', res.OpenID);
                this.formData = {
                    Avatar: res.Avatar || '',
                    Username: res.Username || '',
                    RealName: res.RealName || '',
                    Phone: res.Phone || '',
                    Email: res.Email || ''
                };
                this.originalPhone = res.Phone || '';
                // 判断是否为微信用户（有OpenID）
                this.isWechatUser = !!res.OpenID;
                console.log('isWechatUser:', this.isWechatUser);
            } catch (error) {
                console.log('加载用户信息失败:', error);
            }
        },
        chooseAvatar() {
            uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
                success: (res) => {
                    const tempFilePath = res.tempFilePaths[0];
                    this.uploadAvatar(tempFilePath);
                }
            });
        },
        async uploadAvatar(filePath) {
            uni.showLoading({ title: '上传中...' });
            try {
                const uploadRes = await new Promise((resolve, reject) => {
                    uni.uploadFile({
                        url: 'https://yspt-api.lechiqy.com/upload',
                        filePath: filePath,
                        name: 'file',
                        header: {
                            'Authorization': 'Bearer ' + uni.getStorageSync('token')
                        },
                        success: (res) => {
                            if (res.statusCode === 200) {
                                const data = JSON.parse(res.data);
                                resolve(data);
                            } else {
                                reject(new Error('上传失败'));
                            }
                        },
                        fail: reject
                    });
                });
                this.formData.Avatar = uploadRes.url;
                uni.hideLoading();
            } catch (error) {
                uni.hideLoading();
                uni.showToast({ title: '上传失败，请重试', icon: 'none' });
            }
        },
        async handleSave() {
            console.log('handleSave - isWechatUser:', this.isWechatUser);
            console.log('handleSave - formData.Phone:', this.formData.Phone);
            console.log('handleSave - originalPhone:', this.originalPhone);

            if (this.formData.Phone && !/^1[3-9]\d{9}$/.test(this.formData.Phone)) {
                uni.showToast({ title: '手机号格式不正确', icon: 'none' });
                return;
            }
            if (this.formData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.Email)) {
                uni.showToast({ title: '邮箱格式不正确', icon: 'none' });
                return;
            }

            // 绑定手机号时，检查是否需要合并账号
            if (this.formData.Phone && this.formData.Phone !== this.originalPhone) {
                this.loading = true;
                try {
                    console.log('检查手机号:', this.formData.Phone);
                    console.log('当前用户是否微信用户:', this.isWechatUser);
                    const checkRes = await this.$api.checkPhone(this.formData.Phone);
                    console.log('检查手机号返回:', checkRes);
                    if (checkRes.exists) {
                        this.mergeTargetUser = checkRes.targetUser;
                        // 如果当前是微信用户，可以合并普通账户
                        // 如果当前是普通用户，可以合并微信账户
                        if (this.isWechatUser || checkRes.targetUser.isWechat) {
                            this.showMergePopup = true;
                            this.loading = false;
                            return;
                        }
                    }
                } catch (error) {
                    console.log('检查手机号失败:', error);
                } finally {
                    this.loading = false;
                }
            }

            await this.doSave();
        },
        handleNoMerge() {
            this.showMergePopup = false;
            this.doSave();
        },
        showMergeWarning() {
            this.showMergePopup = false;
            this.showWarningPopup = true;
        },
        async handleConfirmMerge() {
            this.showWarningPopup = false;
            this.loading = true;
            try {
                const mergeRes = await this.$api.mergeAccount(this.mergeTargetUser.UserID);

                // 如果返回了新token，更新token
                if (mergeRes.newToken) {
                    uni.setStorageSync('token', mergeRes.newToken);
                }

                uni.showToast({ title: '账号合并成功' });
                // 重新加载用户信息
                await this.loadUserInfo();
            } catch (error) {
                console.log('合并账号失败:', error);
                uni.showToast({ title: '合并失败，请重试', icon: 'none' });
            } finally {
                this.loading = false;
            }
        },
        async doSave() {
            this.loading = true;
            try {
                await this.$api.updateUserInfo({
                    RealName: this.formData.RealName,
                    Phone: this.formData.Phone,
                    Email: this.formData.Email,
                    Avatar: this.formData.Avatar
                });
                uni.showToast({ title: '保存成功' });
                setTimeout(() => {
                    uni.navigateBack();
                }, 1500);
            } catch (error) {
                console.log('保存失败:', error);
                uni.showToast({ title: '保存失败', icon: 'none' });
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped>
.profile-container {
    background-color: #f5f5f5;
    min-height: 100vh;
}

.main-content {
    padding: 20rpx;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx 0;
    background-color: #fff;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
}

.avatar-tip {
    font-size: 24rpx;
    color: #999;
    margin-top: 16rpx;
}

.form-section {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 20rpx 30rpx;
    margin-bottom: 40rpx;
}

.form-item {
    display: flex;
    align-items: center;
    padding: 30rpx 0;
    border-bottom: 1px solid #f5f5f5;
}

.form-item:last-child {
    border-bottom: none;
}

.form-label {
    width: 160rpx;
    font-size: 28rpx;
    color: #333;
    flex-shrink: 0;
}

.form-value {
    flex: 1;
    font-size: 28rpx;
    color: #999;
    text-align: right;
}

.form-input {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    text-align: right;
}

.btn-section {
    padding: 0 20rpx;
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
