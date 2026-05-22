<template>
    <view class="user-container">
        <view class="user-header">
            <view class="avatar-box">
                <u-avatar :src="userInfo.Avatar" size="120"></u-avatar>
            </view>
            <text class="user-name">{{ userInfo.Username || '未登录' }}</text>
            <text class="user-phone">{{ userInfo.Phone || '' }}</text>
        </view>
        <view class="user-stats">
            <view class="stat-item" @click="toMyOrders">
                <text class="stat-num">{{ stats.orders }}</text>
                <text class="stat-label">订单</text>
            </view>
            <view class="stat-item">
                <text class="stat-num">{{ stats.reviews }}</text>
                <text class="stat-label">评价</text>
            </view>
        </view>
        <view class="user-menu">
            <u-cell-group>
                <u-cell icon="order" title="我的订单" isLink @click="toMyOrders">
                    <template #value>
                        <text class="menu-badge" v-if="stats.orders > 0">{{ stats.orders }}</text>
                    </template>
                </u-cell>
                <u-cell icon="edit-pen" title="修改资料" isLink @click="toEditProfile"></u-cell>
            </u-cell-group>
        </view>
        <view class="logout-btn">
            <u-button v-if="isLoggedIn" type="default" @click="handleLogout">退出登录</u-button>
            <u-button v-else type="primary" @click="toLogin">登录 / 注册</u-button>
        </view>
        <view class="version-info" @click="toVersionDetail">
            <text class="version-text">版本 1.0.5</text>
        </view>
        <TabBar value="user" />
    </view>
</template>

<script>
import TabBar from '@/components/TabBar.vue';
export default {
    components: { TabBar },
    data() {
        return {
            userInfo: {},
            stats: { orders: 0, reviews: 0 },
            isLoggedIn: !!uni.getStorageSync('token')
        };
    },
    onShow() {
        this.loadData();
    },
    methods: {
        async loadData() {
            this.isLoggedIn = !!uni.getStorageSync('token');
            if (this.isLoggedIn) {
                try {
                    const res = await this.$api.getUserInfo();
                    this.userInfo = res;
                    this.loadStats();
                } catch (error) {
                    console.log('加载用户信息失败:', error);
                }
            } else {
                this.userInfo = {};
                this.stats = { orders: 0, reviews: 0 };
            }
        },
        async loadStats() {
            try {
                const ordersRes = await this.$api.getUserOrders({ page: 1, limit: 1 });
                this.stats.orders = ordersRes.total || 0;
                this.stats.reviews = 0;
            } catch (error) {
                console.log('加载统计数据失败:', error);
            }
        },
        toMyOrders() {
            if (!this.isLoggedIn) { this.toLogin(); return; }
            uni.reLaunch({ url: '/pages/pagesB/Order/myOrders' });
        },
        toEditProfile() {
            if (!this.isLoggedIn) { this.toLogin(); return; }
            uni.navigateTo({ url: '/pages/pagesB/Profile/profile' });
        },
        toLogin() {
            uni.navigateTo({ url: '/pages/Login/login' });
        },
        handleLogout() {
            uni.showModal({
                title: '提示',
                content: '确定退出登录吗？',
                success: (res) => {
                    if (res.confirm) {
                        uni.removeStorageSync('token');
                        uni.removeStorageSync('userInfo');
                        this.userInfo = {};
                        this.isLoggedIn = false;
                        this.stats = { orders: 0, reviews: 0 };
                        uni.showToast({ title: '已退出' });
                    }
                }
            });
        },
        toVersionDetail() {
            uni.navigateTo({ url: '/pages/pagesB/Version/version' });
        }
    }
};
</script>

<style scoped>
.user-container {
    background-color: #f5f5f5;
    min-height: 100vh;
}
.user-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 60rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.avatar-box {
    margin-bottom: 20rpx;
}
.user-name {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    display: block;
}
.user-phone {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 10rpx;
    display: block;
}
.user-stats {
    display: flex;
    justify-content: space-around;
    background-color: #fff;
    padding: 30rpx 20rpx;
    margin-bottom: 20rpx;
}
.stat-item {
    text-align: center;
}
.stat-num {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    display: block;
}
.stat-label {
    font-size: 24rpx;
    color: #999;
    margin-top: 10rpx;
    display: block;
}
.user-menu {
    margin-bottom: 40rpx;
}
.logout-btn {
    padding: 20rpx 40rpx;
    margin-bottom: 120rpx;
}
.menu-badge {
    background-color: #f56c6c;
    color: #fff;
    font-size: 22rpx;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
    margin-right: 10rpx;
}
.version-info {
    text-align: center;
    padding: 30rpx 0 20rpx;
}
.version-text {
    font-size: 24rpx;
    color: #999;
}
</style>
