<template>
    <view class="orders-container">
        <view class="main-content">
            <view class="tabs">
                <view
                    v-for="(tab, index) in tabs"
                    :key="index"
                    class="tab-item"
                    :class="{ active: currentTab === index }"
                    @click="tabChange(index)"
                >
                    <text class="tab-text">{{ tab.name }}</text>
                </view>
            </view>
            <view class="order-list">
                <view class="order-card" v-for="item in orderList" :key="item.OrderID" @click="toDetail(item.OrderID)">
                    <view class="card-header">
                        <text class="order-no">订单编号：{{ item.OrderNo }}</text>
                        <u-tag :text="getStatusText(item.Status)" :type="getStatusType(item.Status)" size="mini"></u-tag>
                    </view>
                    <view class="card-body">
                        <text class="route-name">{{ item.OrderType === 'hongtuan' ? item.ProductName : (item.route ? item.route.RouteName : '') }}</text>
                        <view class="card-meta">
                            <text class="meta-text">{{ item.OrderType === 'hongtuan' ? (item.TravelDate + ' | ' + item.Travelers + '份') : (item.TravelDate + ' | ' + item.Travelers + '人') }}</text>
                            <text class="order-price">¥{{ item.TotalPrice }}</text>
                        </view>
                    </view>
                </view>
                <u-empty v-if="orderList.length === 0" text="暂无订单" mode="order"></u-empty>
            </view>
            <u-loadmore :status="loadStatus" @loadmore="loadMore"></u-loadmore>
        </view>
        <TabBar value="myOrders" />
    </view>
</template>

<script>
import TabBar from '@/components/TabBar.vue';
export default {
    components: { TabBar },
    data() {
        return {
            tabs: [
                { name: '全部' },
                { name: '待支付' },
                { name: '待使用' },
                { name: '已完成' },
                { name: '已取消' }
            ],
            statusMap: {
                pending: { text: '待支付', type: 'warning' },
                paid: { text: '待使用', type: 'success' },
                processing: { text: '待使用', type: 'success' },
                completed: { text: '已完成', type: 'info' },
                cancelled: { text: '已取消', type: 'danger' }
            },
            statusKeys: ['', 'pending', 'processing', 'completed', 'cancelled'],
            currentTab: 0,
            orderList: [],
            page: 1,
            loadStatus: 'loadmore'
        };
    },
    onShow() {
        this.page = 1;
        this.loadData();
    },
    methods: {
        getStatusText(status) {
            return (this.statusMap[status] || {}).text || status;
        },
        getStatusType(status) {
            return (this.statusMap[status] || {}).type || 'default';
        },
        async loadData() {
            const status = this.statusKeys[this.currentTab];
            try {
                const res = await this.$api.getUserOrders({ page: this.page, limit: 10, status });
                if (this.page === 1) {
                    this.orderList = res.list || [];
                } else {
                    this.orderList = this.orderList.concat(res.list || []);
                }
                this.loadStatus = (res.list || []).length < 10 ? 'nomore' : 'loadmore';
            } catch (error) {
                console.log('加载订单失败:', error);
            }
        },
        tabChange(index) {
            this.currentTab = index;
            this.page = 1;
            this.loadData();
        },
        loadMore() {
            if (this.loadStatus === 'nomore') return;
            this.page++;
            this.loadData();
        },
        toDetail(id) {
            uni.navigateTo({ url: `/pages/pagesB/Order/orderDetail?id=${id}` });
        }
    }
};
</script>

<style scoped>
.orders-container {
    background-color: #f5f5f5;
    min-height: 100vh;
}
.main-content {
    padding-bottom: 20rpx;
}
.tabs {
    display: flex;
    background-color: #fff;
    padding: 20rpx;
    gap: 16rpx;
}
.tab-item {
    flex: 1;
    text-align: center;
    padding: 16rpx 0;
    border-radius: 30rpx;
    background-color: #f5f5f5;
}
.tab-item.active {
    background-color: #3c9cff;
}
.tab-text {
    font-size: 24rpx;
    color: #666;
}
.tab-item.active .tab-text {
    color: #fff;
}
.order-list {
    padding: 20rpx;
}
.order-card {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1px solid #f5f5f5;
}
.order-no {
    font-size: 24rpx;
    color: #999;
}
.card-body {
    margin-bottom: 10rpx;
}
.route-name {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 16rpx;
}
.card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.meta-text {
    font-size: 24rpx;
    color: #999;
}
.order-price {
    font-size: 32rpx;
    color: #f56c6c;
    font-weight: bold;
}
</style>
