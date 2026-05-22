<template>
    <view class="detail-container">
        <!-- 封面图 -->
        <view class="cover-section">
            <image class="cover-image" :src="activityDetail.CoverImage" mode="aspectFill"></image>
            <view class="status-badge" :class="{
                'status-ongoing': displayStatus === 'ongoing',
                'status-upcoming': displayStatus === 'upcoming',
                'status-ended': displayStatus === 'ended'
            }">
                <text class="status-text">{{ statusText }}</text>
            </view>
        </view>

        <!-- 活动信息 -->
        <view class="info-section">
            <view class="info-header">
                <text class="info-title">{{ activityDetail.Title }}</text>
                <view class="price-wrap">
                    <text class="price-label" v-if="activityDetail.Price > 0">¥</text>
                    <text class="price-value" v-if="activityDetail.Price > 0">{{ activityDetail.Price }}</text>
                    <text class="free-text" v-else>免费</text>
                </view>
            </view>

            <!-- 时间地点 -->
            <view class="info-card">
                <view class="card-item">
                    <u-icon name="calendar" size="20" color="#3c9cff"></u-icon>
                    <view class="item-content">
                        <text class="item-label">活动时间</text>
                        <text class="item-value">{{ activityDetail.StartDate }} ~ {{ activityDetail.EndDate }}</text>
                    </view>
                </view>
                <view class="card-item" v-if="activityDetail.Location">
                    <u-icon name="map" size="20" color="#3c9cff"></u-icon>
                    <view class="item-content">
                        <text class="item-label">活动地点</text>
                        <text class="item-value">{{ activityDetail.Location }}</text>
                    </view>
                </view>
                <!-- 报名类型才显示报名人数 -->
                <view class="card-item" v-if="activityDetail.JoinType === 'register' || !activityDetail.JoinType">
                    <u-icon name="account" size="20" color="#3c9cff"></u-icon>
                    <view class="item-content">
                        <text class="item-label">报名人数</text>
                        <text class="item-value">
                            {{ activityDetail.CurrentParticipants || 0 }}人已报名
                            <text v-if="activityDetail.MaxParticipants" class="max-participants">/ 限额{{ activityDetail.MaxParticipants }}人</text>
                        </text>
                    </view>
                </view>
                <!-- 跳转类型显示参与方式 -->
                <view class="card-item" v-if="activityDetail.JoinType === 'link'">
                    <u-icon name="share-square" size="20" color="#3c9cff"></u-icon>
                    <view class="item-content">
                        <text class="item-label">参与方式</text>
                        <text class="item-value">点击跳转参与</text>
                    </view>
                </view>
            </view>

            <!-- 活动简介 -->
            <view class="desc-section" v-if="activityDetail.Description">
                <text class="section-title">活动简介</text>
                <text class="desc-content">{{ activityDetail.Description }}</text>
            </view>
        </view>

        <!-- 底部操作栏 - 报名类型 -->
        <view class="bottom-bar" v-if="activityDetail.JoinType !== 'link' && displayStatus !== 'ended'">
            <view class="participants-info">
                <u-icon name="account-fill" size="18" color="#3c9cff"></u-icon>
                <text class="participants-text">{{ activityDetail.CurrentParticipants || 0 }}人已报名</text>
            </view>
            <u-button
                type="primary"
                size="large"
                :disabled="!canJoin"
                @click="handleJoin"
            >
                {{ joinButtonText }}
            </u-button>
        </view>

        <!-- 底部操作栏 - 跳转类型 -->
        <view class="bottom-bar" v-if="activityDetail.JoinType === 'link' && displayStatus !== 'ended'">
            <view style="flex: 1;">
                <u-button
                    type="primary"
                    size="large"
                    @click="handleLink"
                >
                    立即参与
                </u-button>
            </view>
        </view>

        <!-- 已结束 -->
        <view class="bottom-bar-ended" v-if="displayStatus === 'ended'">
            <text class="ended-text">活动已结束</text>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            activityDetail: {
                ActivityID: null,
                Title: '',
                CoverImage: '',
                Description: '',
                Status: 'draft',
                StartDate: '',
                EndDate: '',
                Location: '',
                Price: 0,
                MaxParticipants: null,
                CurrentParticipants: 0,
                JoinType: 'register',
                LinkType: 'external',
                LinkValue: ''
            },
            hasJoined: false,
            loading: false
        };
    },
    computed: {
        displayStatus() {
            if (this.activityDetail.Status === 'published') {
                return 'upcoming';
            }
            return this.activityDetail.Status;
        },
        statusText() {
            const map = {
                ongoing: '进行中',
                upcoming: '即将开始',
                ended: '已结束'
            };
            return map[this.displayStatus] || '';
        },
        canJoin() {
            if (this.loading) return false;
            if (this.displayStatus === 'ended') return false;
            if (this.hasJoined) return false;
            if (this.activityDetail.MaxParticipants &&
                this.activityDetail.CurrentParticipants >= this.activityDetail.MaxParticipants) {
                return false;
            }
            return true;
        },
        joinButtonText() {
            if (this.hasJoined) return '已报名';
            if (!this.canJoin) {
                if (this.activityDetail.MaxParticipants &&
                    this.activityDetail.CurrentParticipants >= this.activityDetail.MaxParticipants) {
                    return '名额已满';
                }
                return '无法报名';
            }
            if (this.activityDetail.Price > 0) {
                return `立即报名 ¥${this.activityDetail.Price}`;
            }
            return '免费报名';
        }
    },
    onLoad(options) {
        const id = options.id;
        if (id) {
            this.loadData(id);
        } else {
            uni.showToast({ title: '参数错误', icon: 'none' });
            setTimeout(() => uni.navigateBack(), 1000);
        }
    },
    methods: {
        async loadData(id) {
            uni.showLoading({ title: '加载中' });
            console.log('=== 加载活动详情 ===');
            console.log('当前 token:', uni.getStorageSync('token'));
            try {
                const res = await this.$api.getActivityDetail(id);
                uni.hideLoading();
                console.log('活动详情返回:', res);
                const detail = res.data || res;
                console.log('detail.hasJoined:', detail.hasJoined);
                // 兼容旧数据：JoinType 为空时默认为 register
                if (!detail.JoinType) detail.JoinType = 'register';
                this.activityDetail = detail;
                // 从详情接口中直接获取报名状态
                this.hasJoined = detail.hasJoined || false;
                console.log('设置 hasJoined:', this.hasJoined);
            } catch (error) {
                uni.hideLoading();
                console.log('加载活动详情失败:', error);
                uni.showToast({ title: '加载失败', icon: 'none' });
            }
        },
        handleJoin() {
            const token = uni.getStorageSync('token');
            if (!token) {
                uni.showToast({ title: '请先登录', icon: 'none' });
                const pages = getCurrentPages();
                const currentPage = pages[pages.length - 1];
                uni.setStorageSync('redirectAfterLogin', '/' + currentPage.route + '?id=' + this.activityDetail.ActivityID);
                uni.navigateTo({ url: '/pages/Login/login' });
                return;
            }

            uni.showModal({
                title: '确认报名',
                content: `确定要报名参加「${this.activityDetail.Title}」吗？`,
                success: (res) => {
                    if (res.confirm) {
                        this.submitJoin();
                    }
                }
            });
        },
        async submitJoin() {
            this.loading = true;
            uni.showLoading({ title: '提交中' });
            try {
                const res = await this.$api.joinActivity({ ActivityID: this.activityDetail.ActivityID });
                uni.hideLoading();
                uni.showToast({ title: '报名成功', icon: 'success' });
                this.hasJoined = true;
                // 用服务端返回的最新报名人数更新
                if (res.data && res.data.CurrentParticipants !== undefined) {
                    this.activityDetail.CurrentParticipants = res.data.CurrentParticipants;
                } else {
                    this.activityDetail.CurrentParticipants = (this.activityDetail.CurrentParticipants || 0) + 1;
                }
            } catch (error) {
                uni.hideLoading();
                console.log('报名失败:', error);
            } finally {
                this.loading = false;
            }
        },
        handleLink() {
            const { LinkType, LinkValue } = this.activityDetail;

            if (!LinkType || LinkType === 'none') {
                uni.showToast({ title: '跳转配置无效', icon: 'none' });
                return;
            }

            switch (LinkType) {
                case 'external':
                    if (!LinkValue) {
                        uni.showToast({ title: '跳转链接未配置', icon: 'none' });
                        return;
                    }
                    // #ifdef H5
                    window.open(LinkValue, '_blank');
                    // #endif
                    // #ifndef H5
                    uni.navigateTo({
                        url: '/pages/webview/webview?url=' + encodeURIComponent(LinkValue)
                    });
                    // #endif
                    break;
                case 'route':
                    if (!LinkValue) {
                        uni.showToast({ title: '线路信息无效', icon: 'none' });
                        return;
                    }
                    uni.navigateTo({
                        url: '/pages/pagesA/RouteDetail/routeDetail?id=' + LinkValue
                    });
                    break;
                case 'content':
                    if (!LinkValue) {
                        uni.showToast({ title: '内容信息无效', icon: 'none' });
                        return;
                    }
                    uni.navigateTo({
                        url: '/pages/pagesB/ContentDetail/contentDetail?id=' + LinkValue
                    });
                    break;
                case 'hongtuan':
                    uni.switchTab({
                        url: '/pages/pagesB/Hongtuan/hongtuan'
                    });
                    break;
                case 'hongji':
                    uni.navigateTo({
                        url: '/pages/pagesB/Hongji/hongji'
                    });
                    break;
                case 'routes':
                    uni.switchTab({
                        url: '/pages/pagesA/Route/route'
                    });
                    break;
                case 'activity':
                    uni.switchTab({
                        url: '/pages/pagesA/Activity/activity'
                    });
                    break;
                case 'category':
                    if (!LinkValue) {
                        uni.showToast({ title: '分类信息无效', icon: 'none' });
                        return;
                    }
                    uni.navigateTo({
                        url: '/pages/pagesB/Category/category?type=' + LinkValue
                    });
                    break;
                default:
                    uni.showToast({ title: '跳转类型无效', icon: 'none' });
            }
        }
    }
};
</script>

<style scoped>
.detail-container {
    background-color: #f5f5f5;
    min-height: 100vh;
    padding-bottom: 140rpx;
}

.cover-section {
    position: relative;
    width: 100%;
    height: 400rpx;
}

.cover-image {
    width: 100%;
    height: 100%;
}

.status-badge {
    position: absolute;
    top: 30rpx;
    right: 30rpx;
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
}

.status-ongoing {
    background-color: rgba(103, 194, 58, 0.9);
}

.status-upcoming {
    background-color: rgba(60, 156, 255, 0.9);
}

.status-ended {
    background-color: rgba(153, 153, 153, 0.9);
}

.status-text {
    font-size: 24rpx;
    color: #fff;
}

.info-section {
    background-color: #fff;
    margin: -40rpx 20rpx 20rpx;
    border-radius: 20rpx;
    padding: 30rpx;
    position: relative;
    z-index: 1;
}

.info-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f5f5f5;
}

.info-title {
    flex: 1;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-right: 20rpx;
}

.price-wrap {
    display: flex;
    align-items: baseline;
}

.price-label {
    font-size: 28rpx;
    color: #f56c6c;
    font-weight: bold;
}

.price-value {
    font-size: 44rpx;
    color: #f56c6c;
    font-weight: bold;
}

.free-text {
    font-size: 36rpx;
    color: #67c23a;
    font-weight: bold;
}

.info-card {
    background-color: #f8f9fa;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 30rpx;
}

.card-item {
    display: flex;
    align-items: flex-start;
    padding: 16rpx 0;
}

.card-item:not(:last-child) {
    border-bottom: 1rpx solid #eee;
}

.item-content {
    flex: 1;
    margin-left: 16rpx;
}

.item-label {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-bottom: 6rpx;
}

.item-value {
    display: block;
    font-size: 28rpx;
    color: #333;
}

.max-participants {
    color: #f56c6c;
    font-size: 24rpx;
}

.desc-section {
    margin-top: 20rpx;
}

.section-title {
    display: block;
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
}

.desc-content {
    display: block;
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
}

.bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 20rpx 30rpx;
    display: flex;
    align-items: center;
    gap: 30rpx;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.participants-info {
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.participants-text {
    font-size: 24rpx;
    color: #3c9cff;
}

.bottom-bar .u-button {
    flex: 1;
}

.bottom-bar-ended {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 30rpx;
    text-align: center;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.ended-text {
    font-size: 28rpx;
    color: #999;
}
</style>
