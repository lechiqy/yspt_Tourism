<template>
    <view class="activity-container">
        <view class="main-content">
            <view class="tabs">
                <view
                    v-for="(tab, index) in tabs"
                    :key="index"
                    class="tab-item"
                    :class="{ active: currentTab === index }"
                    @click="switchTab(index)"
                >
                    <text class="tab-text">{{ tab.name }}</text>
                </view>
            </view>

            <view class="activity-list">
                <view v-if="loading" class="loading">
                    <u-loading-icon mode="flower" size="40"></u-loading-icon>
                    <text class="loading-text">加载中...</text>
                </view>

                <view v-else-if="activityList.length === 0" class="empty">
                    <u-icon name="info-circle" size="60" color="#ccc"></u-icon>
                    <text class="empty-text">暂无活动</text>
                </view>

                <view v-else>
                    <view
                        class="activity-card"
                        v-for="item in activityList"
                        :key="item.ActivityID"
                        @click="toActivityDetail(item)"
                    >
                        <image
                            class="card-image"
                            :src="item.CoverImage || 'https://picsum.photos/400/300?random=1'"
                            mode="aspectFill"
                        ></image>
                        <view class="card-info">
                            <view class="card-header">
                                <text class="card-title">{{ item.Title }}</text>
                                <view class="card-status" :class="{
                                    'status-ongoing': item.Status === 'ongoing',
                                    'status-upcoming': item.Status === 'upcoming',
                                    'status-ended': item.Status === 'ended'
                                }">
                                    <text class="status-text">{{ statusTexts[item.Status] || '' }}</text>
                                </view>
                            </view>
                            <view class="card-meta">
                                <view class="meta-item">
                                    <u-icon name="calendar" size="14" color="#999"></u-icon>
                                    <text class="meta-text">{{ item.StartDate }} ~ {{ item.EndDate }}</text>
                                </view>
                                <view class="meta-item" v-if="item.Location">
                                    <u-icon name="map" size="14" color="#999"></u-icon>
                                    <text class="meta-text">{{ item.Location }}</text>
                                </view>
                            </view>
                            <view class="card-footer">
                                <view class="price-wrap">
                                    <text class="price-label" v-if="item.Price > 0">¥</text>
                                    <text class="price-value" v-if="item.Price > 0">{{ item.Price }}</text>
                                    <text class="free-text" v-else>免费</text>
                                </view>
                                <view class="join-info">
                                    <!-- 报名类型：显示报名人数 -->
                                    <template v-if="item.JoinType === 'register' || !item.JoinType">
                                        <text class="join-text">{{ item.CurrentParticipants || 0 }}人已报名</text>
                                    </template>
                                    <!-- 跳转类型：显示参与人数 -->
                                    <template v-else-if="item.JoinType === 'link'">
                                        <text class="join-text">{{ item.CurrentParticipants || 0 }}人已参与</text>
                                    </template>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            loading: false,
            currentTab: 0,
            tabs: [
                { name: '全部', status: 'all' },
                { name: '进行中', status: 'ongoing' },
                { name: '即将开始', status: 'upcoming' },
                { name: '已结束', status: 'ended' }
            ],
            statusTexts: {
                ongoing: '进行中',
                upcoming: '即将开始',
                ended: '已结束'
            },
            activityList: []
        };
    },
    mounted() {
        this.loadActivities();
    },
    onShow() {
        // 页面显示时刷新数据（从详情页返回时触发）
        this.loadActivities();
    },
    methods: {
        switchTab(index) {
            this.currentTab = index;
            this.loadActivities();
        },
        async loadActivities() {
            this.loading = true;
            try {
                const status = this.tabs[this.currentTab].status;
                const params = status === 'all' ? {} : { status };
                const res = await this.$api.getActivitiesList(params);
                // 将 published 状态映射为 upcoming 显示，兼容旧数据 JoinType 默认为 register
                const list = (res.list || []).map(item => ({
                    ...item,
                    Status: item.Status === 'published' ? 'upcoming' : item.Status,
                    JoinType: item.JoinType || 'register'
                }));
                // 前端再次根据状态筛选（确保数据正确）
                if (status === 'all') {
                    this.activityList = list;
                } else {
                    const mappedStatus = status === 'upcoming' ? 'published' : status;
                    this.activityList = list.filter(item => {
                        if (status === 'upcoming') {
                            return item.Status === 'upcoming' || item.Status === 'published';
                        }
                        return item.Status === status;
                    });
                }
            } catch (error) {
                console.log('加载活动失败:', error);
                uni.showToast({ title: '加载失败', icon: 'none' });
            } finally {
                this.loading = false;
            }
        },
        getStatusClass(status) {
            const classMap = {
                ongoing: 'status-ongoing',
                upcoming: 'status-upcoming',
                ended: 'status-ended'
            };
            return classMap[status] || '';
        },
        getStatusText(status) {
            const textMap = {
                ongoing: '进行中',
                upcoming: '即将开始',
                ended: '已结束'
            };
            return textMap[status] || '';
        },
        toActivityDetail(item) {
            // 所有活动都进入详情页
            uni.navigateTo({
                url: `/pages/pagesA/ActivityDetail/activityDetail?id=${item.ActivityID}`
            });
        }
    }
};
</script>

<style scoped>
.activity-container {
    background-color: #f5f5f5;
    min-height: 100vh;
}

.main-content {
    padding: 20rpx;
    padding-bottom: 40rpx;
}

.tabs {
    display: flex;
    background-color: #fff;
    padding: 20rpx;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
}

.tab-item {
    flex: 1;
    text-align: center;
    padding: 16rpx 0;
    border-radius: 30rpx;
}

.tab-item.active {
    background-color: #3c9cff;
}

.tab-text {
    font-size: 26rpx;
    color: #666;
}

.tab-item.active .tab-text {
    color: #fff;
}

.activity-list {
    margin-top: 10rpx;
}

.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 200rpx;
}

.loading-text {
    font-size: 28rpx;
    color: #999;
    margin-top: 20rpx;
}

.empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 200rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
    margin-top: 20rpx;
}

.activity-card {
    background-color: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.card-image {
    width: 100%;
    height: 350rpx;
}

.card-info {
    padding: 24rpx;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;
}

.card-title {
    flex: 1;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-right: 20rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.card-status {
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    flex-shrink: 0;
}

.status-ongoing {
    background-color: #e8f5e9;
}

.status-ongoing .status-text {
    color: #67c23a;
}

.status-upcoming {
    background-color: #e3f2fd;
}

.status-upcoming .status-text {
    color: #3c9cff;
}

.status-ended {
    background-color: #f5f5f5;
}

.status-ended .status-text {
    color: #999;
}

.status-text {
    font-size: 22rpx;
}

.card-meta {
    margin-bottom: 16rpx;
}

.meta-item {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;
}

.meta-text {
    font-size: 24rpx;
    color: #999;
    margin-left: 10rpx;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16rpx;
    border-top: 1px solid #f5f5f5;
}

.price-wrap {
    display: flex;
    align-items: baseline;
}

.price-label {
    font-size: 26rpx;
    color: #f56c6c;
    font-weight: bold;
}

.price-value {
    font-size: 36rpx;
    color: #f56c6c;
    font-weight: bold;
}

.free-text {
    font-size: 32rpx;
    color: #67c23a;
    font-weight: bold;
}

.join-text {
    font-size: 24rpx;
    color: #3c9cff;
}
</style>
