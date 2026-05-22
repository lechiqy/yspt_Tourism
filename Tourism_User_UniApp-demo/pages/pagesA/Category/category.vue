<template>
    <view class="category-container">
        <!-- 顶部标签栏 -->
        <view class="tabs-bar">
            <view
                class="tab-item"
                :class="{ active: category === 'scenic' }"
                @click="switchCategory('scenic')"
            >
                <text>智慧景区</text>
            </view>
            <view
                class="tab-item"
                :class="{ active: category === 'food' }"
                @click="switchCategory('food')"
            >
                <text>特色美食</text>
            </view>
            <view
                class="tab-item"
                :class="{ active: category === 'culture' }"
                @click="switchCategory('culture')"
            >
                <text>非遗文化</text>
            </view>
            <view
                class="tab-item"
                :class="{ active: category === 'routes' }"
                @click="switchCategory('routes')"
            >
                <text>文旅路线</text>
            </view>
        </view>

        <!-- 瀑布流列表 -->
        <scroll-view
            scroll-y
            class="scroll-container"
            @scrolltolower="loadMore"
            :refresher-enabled="true"
            :refresher-triggered="refreshing"
            @refresherrefresh="onRefresh"
        >
            <view class="waterfall">
                <!-- 左列 -->
                <view class="waterfall-column">
                    <view
                        class="card"
                        v-for="(item, index) in colLeft"
                        :key="'colL-' + index"
                        @click="goDetail(index, 'L')"
                    >
                        <image
                            class="card-image"
                            :src="getImageUrl(item)"
                            mode="widthFix"
                        ></image>
                        <view class="card-content">
                            <text class="card-title">{{ getTitle(item) }}</text>
                            <view class="card-info">
                                <view class="price-wrap" v-if="item.Status === 'display_only'">
                                    <text class="display-tag">仅供展示</text>
                                </view>
                                <view class="price-wrap" v-else-if="getPrice(item) > 0">
                                    <text class="price-symbol">¥</text>
                                    <text class="price-num">{{ getPrice(item) }}</text>
                                    <text class="price-unit">起</text>
                                </view>
                                <view class="price-wrap" v-else-if="category === 'routes'">
                                    <text class="free-tag">免费</text>
                                </view>
                                <view class="tag-wrap" v-if="item.Days">
                                    <text class="days-tag">{{ item.Days }}天</text>
                                </view>
                            </view>
                            <view class="card-footer">
                                <text class="location" v-if="item.Address">{{ formatAddress(item.Address) }}</text>
                                <view class="like-btn">
                                    <u-icon name="heart" size="14" color="#ccc"></u-icon>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
                <!-- 右列 -->
                <view class="waterfall-column">
                    <view
                        class="card"
                        v-for="(item, index) in colRight"
                        :key="'colR-' + index"
                        @click="goDetail(index, 'R')"
                    >
                        <image
                            class="card-image"
                            :src="getImageUrl(item)"
                            mode="widthFix"
                        ></image>
                        <view class="card-content">
                            <text class="card-title">{{ getTitle(item) }}</text>
                            <view class="card-info">
                                <view class="price-wrap" v-if="item.Status === 'display_only'">
                                    <text class="display-tag">仅供展示</text>
                                </view>
                                <view class="price-wrap" v-else-if="getPrice(item) > 0">
                                    <text class="price-symbol">¥</text>
                                    <text class="price-num">{{ getPrice(item) }}</text>
                                    <text class="price-unit">起</text>
                                </view>
                                <view class="price-wrap" v-else-if="category === 'routes'">
                                    <text class="free-tag">免费</text>
                                </view>
                                <view class="tag-wrap" v-if="item.Days">
                                    <text class="days-tag">{{ item.Days }}天</text>
                                </view>
                            </view>
                            <view class="card-footer">
                                <text class="location" v-if="item.Address">{{ formatAddress(item.Address) }}</text>
                                <view class="like-btn">
                                    <u-icon name="heart" size="14" color="#ccc"></u-icon>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 加载状态 -->
            <view class="loading-status" v-if="loading || !hasMore">
                <u-loading-icon v-if="loading" mode="flower" size="24"></u-loading-icon>
                <text v-if="loading">加载中...</text>
                <text v-else-if="!hasMore && list.length > 0">没有更多了</text>
            </view>

            <!-- 空状态 -->
            <view v-if="!loading && list.length === 0" class="empty">
                <u-icon name="info-circle" size="60" color="#ccc"></u-icon>
                <text class="empty-text">暂无内容</text>
            </view>
        </scroll-view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            category: 'scenic',
            categoryName: '智慧景区',
            list: [],
            colLeft: [],
            colRight: [],
            loading: false,
            refreshing: false,
            page: 1,
            hasMore: true
        };
    },
    onLoad(options) {
        if (options.category) {
            this.category = options.category;
        }
        this.updateCategoryName();
        uni.setNavigationBarTitle({ title: '发现' });
        this.loadData();
    },
    methods: {
        updateCategoryName() {
            const names = {
                scenic: '智慧景区',
                food: '特色美食',
                culture: '非遗文化',
                routes: '文旅路线'
            };
            this.categoryName = names[this.category] || '内容';
        },
        switchCategory(cat) {
            if (this.category === cat) return;
            this.category = cat;
            this.updateCategoryName();
            this.page = 1;
            this.list = [];
            this.colLeft = [];
            this.colRight = [];
            this.hasMore = true;
            this.loadData();
        },
        getTitle(item) {
            return item.Title || item.SpotName || item.RouteName || '';
        },
        getImageUrl(item) {
            return item.CoverImage || 'https://picsum.photos/400/300?random=1';
        },
        getPrice(item) {
            return item.Price || item.TicketPrice || 0;
        },
        async loadData() {
            if (this.loading) return;
            this.loading = true;
            try {
                const res = await this.$api.getCategoryContents({
                    category: this.category,
                    page: this.page,
                    limit: 20
                });
                const newList = res.list || [];
                if (this.page === 1) {
                    this.list = newList;
                    this.colLeft = [];
                    this.colRight = [];
                    this.distributeItems(newList);
                } else {
                    this.list = [...this.list, ...newList];
                    this.distributeItems(newList);
                }
                this.hasMore = newList.length >= 20;
            } catch (error) {
                console.log('加载失败:', error);
            } finally {
                this.loading = false;
                this.refreshing = false;
            }
        },
        distributeItems(items) {
            items.forEach((item, index) => {
                if ((this.list.length - items.length + index) % 2 === 0) {
                    this.colLeft.push(item);
                } else {
                    this.colRight.push(item);
                }
            });
        },
        async onRefresh() {
            this.refreshing = true;
            this.page = 1;
            this.list = [];
            this.colLeft = [];
            this.colRight = [];
            await this.loadData();
        },
        loadMore() {
            if (this.hasMore && !this.loading) {
                this.page++;
                this.loadData();
            }
        },
        formatAddress(address) {
            if (!address) return '';
            const parts = address.split(/[省市]/);
            return parts.length > 1 ? parts[1] : address;
        },
        goDetail(index, side) {
            const item = side === 'L' ? this.colLeft[index] : this.colRight[index];
            const id = item.ContentID || item.SpotID || item.RouteID;
            if (this.category === 'routes') {
                uni.navigateTo({ url: `/pages/pagesA/RouteDetail/routeDetail?id=${id}` });
            } else {
                uni.navigateTo({ url: `/pages/pagesA/ContentDetail/contentDetail?id=${id}&category=${this.category}` });
            }
        }
    }
};
</script>

<style scoped>
.category-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f8f8f8;
}

/* 顶部标签栏 */
.tabs-bar {
    display: flex;
    background-color: #fff;
    padding: 20rpx 16rpx;
}

.tab-item {
    flex: 1;
    text-align: center;
    padding: 16rpx 0;
    font-size: 28rpx;
    color: #666;
    position: relative;
}

.tab-item.active {
    color: #ff2442;
    font-weight: bold;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40rpx;
    height: 6rpx;
    background-color: #ff2442;
    border-radius: 3rpx;
}

/* 滚动容器 */
.scroll-container {
    flex: 1;
    height: 0;
}

/* 瀑布流布局 */
.waterfall {
    display: flex;
    padding: 16rpx;
}

.waterfall-column {
    flex: 1;
    padding: 0 8rpx;
}

/* 卡片样式 */
.card {
    background-color: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.card-image {
    width: 100%;
    min-height: 200rpx;
    background-color: #f5f5f5;
}

.card-content {
    padding: 16rpx;
}

.card-title {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    display: block;
    line-height: 1.4;
    margin-bottom: 12rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.card-info {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
}

.price-wrap {
    display: flex;
    align-items: baseline;
}

.price-symbol {
    font-size: 24rpx;
    color: #ff2442;
    font-weight: bold;
}

.price-num {
    font-size: 36rpx;
    color: #ff2442;
    font-weight: bold;
}

.price-unit {
    font-size: 22rpx;
    color: #999;
    margin-left: 4rpx;
}

.free-tag {
    font-size: 26rpx;
    color: #52c41a;
    font-weight: 500;
}

.display-tag {
    font-size: 22rpx;
    color: #ff9800;
    background-color: #fff3e0;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
}

.tag-wrap {
    margin-left: 16rpx;
}

.days-tag {
    font-size: 22rpx;
    color: #1890ff;
    background-color: #e6f7ff;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
}

.card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.location {
    font-size: 22rpx;
    color: #999;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.like-btn {
    padding: 8rpx;
}

/* 加载状态 */
.loading-status {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30rpx;
    color: #999;
    font-size: 26rpx;
}

/* 空状态 */
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
</style>
