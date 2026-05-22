<template>
    <view class="routes-container">
        <view class="main-content">
            <view class="search-box">
                <u-search placeholder="搜索旅游线路" v-model="keyword" @search="handleSearch" @custom="handleSearch"></u-search>
            </view>
            <view class="route-list">
                <view class="route-card" v-for="item in routeList" :key="item.RouteID" @click="toDetail(item.RouteID)">
                    <image class="route-image" :src="item.CoverImage || 'https://picsum.photos/400/300?random=2'" mode="aspectFill"></image>
                    <view class="route-info">
                        <text class="route-name">{{ item.RouteName }}</text>
                        <view class="route-meta">
                            <text class="meta-text">{{ item.Days }}天行程</text>
                            <text v-if="item.Status === 'display_only'" class="route-display-tag">仅供展示</text>
                            <text v-else class="route-price">¥{{ item.Price }}</text>
                        </view>
                        <text class="route-desc">{{ item.Description ? item.Description.substring(0, 50) + '...' : '' }}</text>
                    </view>
                </view>
            </view>
            <u-loadmore :status="loadStatus" @loadmore="loadMore"></u-loadmore>
        </view>
        <TabBar value="routes" />
    </view>
</template>

<script>
import TabBar from '@/components/TabBar.vue';
export default {
    components: { TabBar },
    data() {
        return {
            keyword: '',
            routeList: [],
            page: 1,
            limit: 10,
            loadStatus: 'loadmore'
        };
    },
    mounted() {
        this.loadData();
    },
    methods: {
        async loadData() {
            try {
                const res = await this.$api.getRoutesList({ page: this.page, limit: this.limit });
                if (this.page === 1) {
                    this.routeList = res.list || [];
                } else {
                    this.routeList = this.routeList.concat(res.list || []);
                }
                this.loadStatus = (res.list || []).length < this.limit ? 'nomore' : 'loadmore';
            } catch (error) {
                console.log('加载线路失败:', error);
            }
        },
        handleSearch() {
            this.page = 1;
            this.loadData();
        },
        loadMore() {
            if (this.loadStatus === 'nomore') return;
            this.page++;
            this.loadData();
        },
        toDetail(id) {
            uni.navigateTo({ url: `/pages/pagesA/RouteDetail/routeDetail?id=${id}` });
        }
    }
};
</script>

<style scoped>
.routes-container {
    background-color: #f5f5f5;
    min-height: 100vh;
}
.main-content {
    padding: 20rpx;
    padding-bottom: 20rpx;
}
.search-box {
    margin-bottom: 20rpx;
}
.route-card {
    background-color: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}
.route-image {
    width: 100%;
    height: 350rpx;
}
.route-info {
    padding: 24rpx;
}
.route-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 16rpx;
}
.route-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
}
.meta-text {
    font-size: 26rpx;
    color: #999;
}
.route-price {
    font-size: 36rpx;
    color: #f56c6c;
    font-weight: bold;
}
.route-desc {
    font-size: 24rpx;
    color: #999;
    display: block;
    line-height: 1.5;
}
</style>
