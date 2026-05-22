<template>
    <view class="detail-container">
        <u-swiper :list="swiperImages" height="200" circular autoplay></u-swiper>
        <view class="detail-info">
            <view class="info-header">
                <view class="info-title-row">
                    <text class="info-title">{{ routeDetail.RouteName }}</text>
                    <text v-if="routeDetail.Status === 'display_only'" class="display-tag">仅供展示</text>
                </view>
                <text class="info-price">¥{{ routeDetail.Price }}</text>
            </view>
            <view class="info-meta">
                <text class="info-meta-item">行程天数：{{ routeDetail.Days }}天</text>
                <text class="info-meta-item">评分：{{ routeDetail.avgRating || '暂无' }}</text>
            </view>
            <view class="info-desc">
                <text class="desc-title">线路描述</text>
                <text class="desc-content">{{ routeDetail.Description || '暂无描述' }}</text>
            </view>
            <view class="info-spots">
                <text class="spots-title">途经景点</text>
                <view class="spot-item" v-for="item in routeDetail.spots" :key="item.SpotID">
                    <text class="spot-name">{{ item.SpotName }}</text>
                    <text class="spot-city">{{ item.City }}</text>
                </view>
            </view>
        </view>
        <view class="book-section" v-if="routeDetail.Status === 'published'">
            <view class="book-row">
                <text class="book-label">出行人数</text>
                <u-number-box v-model="travelers" :min="1" :max="10"></u-number-box>
            </view>
            <view class="book-row">
                <text class="book-label">出行日期</text>
                <text class="book-date" @click="showDate = true">{{ travelDate || '请选择日期' }}</text>
            </view>
            <u-button type="primary" size="large" :loading="loading" @click="handleBook">立即预订 ¥{{ totalPrice }}</u-button>
        </view>
        <view class="book-section-display" v-else-if="routeDetail.Status === 'display_only'">
            <text class="display-notice">该线路仅供展示，暂未开放预订</text>
        </view>
        <u-datetime-picker :show="showDate" v-model="dateValue" mode="date" @confirm="confirmDate" @cancel="showDate = false"></u-datetime-picker>
    </view>
</template>

<script>
export default {
    data() {
        return {
            routeDetail: {
                RouteName: '',
                Days: 0,
                Price: 0,
                Description: '',
                spots: [],
                avgRating: '',
                Status: ''
            },
            travelers: 1,
            travelDate: '',
            dateValue: Number(new Date()),
            showDate: false,
            loading: false,
            swiperImages: [],
            // 自定义分享配置
            shareConfig: {
                title: '莆韵红团 - 精选线路'
            }
        };
    },
    computed: {
        totalPrice() {
            return (this.travelers * (this.routeDetail.Price || 0)).toFixed(2);
        }
    },
    onLoad(options) {
        const id = options.id || 1;
        this.routeId = id;
        this.loadData(id);
    },
    methods: {
        async loadData(id) {
            try {
                const res = await this.$api.getRouteDetail(id);
                this.routeDetail = res;
                const images = [];
                if (res.CoverImage) images.push(res.CoverImage);
                if (res.Images && Array.isArray(res.Images) && res.Images.length > 0) {
                    images.push(...res.Images);
                }
                this.swiperImages = images;
                // 动态更新分享配置
                this.shareConfig = {
                    title: `${res.RouteName} - 莆韵红团`,
                    path: `/pages/pagesA/RouteDetail/routeDetail?id=${id}`
                };
                // 如果有封面图则使用
                if (res.CoverImage) {
                    this.shareConfig.imageUrl = res.CoverImage;
                }
            } catch (error) {
                console.log('加载线路详情失败:', error);
            }
        },
        confirmDate(e) {
            const date = new Date(e.value);
            this.travelDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            this.showDate = false;
        },
        async handleBook() {
            const token = uni.getStorageSync('token');
            if (!token) {
                uni.showToast({ title: '请先登录', icon: 'none' });
                const pages = getCurrentPages();
                const currentPage = pages[pages.length - 1];
                uni.setStorageSync('redirectAfterLogin', '/' + currentPage.route);
                uni.navigateTo({ url: '/pages/Login/login' });
                return;
            }
            if (!this.travelDate) {
                uni.showToast({ title: '请选择出行日期', icon: 'none' });
                return;
            }
            this.loading = true;
            try {
                const res = await this.$api.createOrder({
                    RouteID: this.routeDetail.RouteID,
                    Travelers: this.travelers,
                    TravelDate: this.travelDate
                });
                console.log('预订成功:', res);
                uni.showToast({ title: '预订成功' });
                setTimeout(() => {
                    uni.navigateTo({ url: `/pages/pagesB/Order/order?id=${res.data.OrderID}` });
                }, 500);
            } catch (error) {
                const msg = error && error.message ? error.message : '';
                if (msg.includes('用户不存在') || msg.includes('重新登录')) {
                    uni.showToast({ title: '登录已过期，请重新登录', icon: 'none', duration: 3000 });
                    uni.removeStorageSync('token');
                    setTimeout(() => {
                        const pages = getCurrentPages();
                        const currentPage = pages[pages.length - 1];
                        uni.setStorageSync('redirectAfterLogin', '/' + currentPage.route);
                        uni.navigateTo({ url: '/pages/Login/login' });
                    }, 3000);
                } else {
                    console.log('预订失败:', error);
                }
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped>
.detail-container {
    background-color: #f5f5f5;
    min-height: 100vh;
    padding-bottom: 120rpx;
}
.detail-info {
    background-color: #fff;
    padding: 30rpx;
    margin-bottom: 20rpx;
}
.info-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20rpx;
}
.info-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
}
.info-price {
    font-size: 40rpx;
    color: #f56c6c;
    font-weight: bold;
}
.info-meta {
    display: flex;
    gap: 30rpx;
    margin-bottom: 30rpx;
}
.info-meta-item {
    font-size: 26rpx;
    color: #999;
}
.desc-title, .spots-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 16rpx;
}
.desc-content {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
    display: block;
    margin-bottom: 30rpx;
}
.spot-item {
    display: flex;
    justify-content: space-between;
    padding: 16rpx 0;
    border-bottom: 1px solid #f5f5f5;
}
.spot-name {
    font-size: 28rpx;
    color: #333;
}
.spot-city {
    font-size: 24rpx;
    color: #999;
}
.book-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 20rpx 30rpx;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}
.book-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}
.book-label {
    font-size: 28rpx;
    color: #333;
}
.book-date {
    font-size: 28rpx;
    color: #3c9cff;
}
.info-title-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    flex: 1;
}
.display-tag {
    font-size: 22rpx;
    color: #e6a23c;
    background-color: #fdf6ec;
    border: 1rpx solid #e6a23c;
    border-radius: 6rpx;
    padding: 2rpx 12rpx;
    white-space: nowrap;
}
.book-section-display {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 30rpx;
    text-align: center;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}
.display-notice {
    font-size: 28rpx;
    color: #999;
}
</style>
