<template>
    <view class="search-container">
        <view class="custom-nav" :style="{ height: navHeight + 'px', paddingTop: statusBarHeight + 'px' }">
            <view class="nav-content" :style="{ paddingRight: rightPadding + 'px' }">
                <view class="nav-left" @click="goBack">
                    <u-icon name="arrow-left" size="22" color="#ffffff"></u-icon>
                </view>
                <view class="nav-center">
                    <view class="search-box">
                        <u-icon name="search" size="20" color="#999999"></u-icon>
                        <input class="search-input" v-model="keyword" placeholder="搜索景区、美食、路线..." placeholder-style="color:#666;font-size:14px" @confirm="doSearch" :focus="true" />
                    </view>
                </view>
                <view class="nav-right" @click="goBack">
                    <text class="cancel-text">取消</text>
                </view>
            </view>
        </view>
        <view class="search-body" :style="{ paddingTop: navHeight + 'px' }">
            <!-- 未搜索时的提示 -->
            <view v-if="!searched" class="search-hint">
                <text class="hint-text">输入关键词搜索</text>
                <view class="hot-section">
                    <text class="hot-title">热门搜索</text>
                    <view class="hot-tags">
                        <view class="hot-tag" @click="quickSearch('妈祖')">妈祖</view>
                        <view class="hot-tag" @click="quickSearch('莆田')">莆田</view>
                        <view class="hot-tag" @click="quickSearch('红团')">红团</view>
                        <view class="hot-tag" @click="quickSearch('非遗')">非遗</view>
                    </view>
                </view>
            </view>

            <!-- 加载中 -->
            <view v-else-if="loading" class="search-loading">
                <u-loading-icon mode="flower" size="40"></u-loading-icon>
                <text class="loading-text">搜索中...</text>
            </view>

            <!-- 空结果 -->
            <view v-else-if="resultList.length === 0" class="search-empty">
                <u-icon name="info-circle" size="60" color="#ccc"></u-icon>
                <text class="empty-text">没有找到相关内容</text>
                <text class="empty-hint">换个关键词试试</text>
            </view>

            <!-- 搜索结果 - 瀑布流 -->
            <view v-else class="result-section">
                <view class="result-count">共找到 {{ total }} 条结果</view>
                <view class="waterfall">
                    <!-- 左列 -->
                    <view class="waterfall-column">
                        <view class="result-card" v-for="(item, index) in leftList" :key="'sl-' + index" @click="goDetail(index, 'L')">
                            <image class="card-image" :src="item.CoverImage || 'https://picsum.photos/400/300?random=1'" mode="widthFix"></image>
                            <view class="card-content">
                                <text class="card-title">{{ item.Title || item.RouteName }}</text>
                                <view class="card-info">
                                    <view class="price-wrap" v-if="item.Price && item.Status !== 'display_only'">
                                        <text class="price-symbol">¥</text>
                                        <text class="price-num">{{ item.Price }}</text>
                                    </view>
                                    <view v-else-if="item.Status === 'display_only'">
                                        <text class="display-tag-sm">仅供展示</text>
                                    </view>
                                    <view class="tag-wrap" v-if="item.Days">
                                        <text class="days-tag">{{ item.Days }}天</text>
                                    </view>
                                    <view class="category-tag" v-if="item.Category">
                                        {{ getCategoryName(item.Category) }}
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                    <!-- 右列 -->
                    <view class="waterfall-column">
                        <view class="result-card" v-for="(item, index) in rightList" :key="'sr-' + index" @click="goDetail(index, 'R')">
                            <image class="card-image" :src="item.CoverImage || 'https://picsum.photos/400/300?random=1'" mode="widthFix"></image>
                            <view class="card-content">
                                <text class="card-title">{{ item.Title || item.RouteName }}</text>
                                <view class="card-info">
                                    <view class="price-wrap" v-if="item.Price && item.Status !== 'display_only'">
                                        <text class="price-symbol">¥</text>
                                        <text class="price-num">{{ item.Price }}</text>
                                    </view>
                                    <view v-else-if="item.Status === 'display_only'">
                                        <text class="display-tag-sm">仅供展示</text>
                                    </view>
                                    <view class="tag-wrap" v-if="item.Days">
                                        <text class="days-tag">{{ item.Days }}天</text>
                                    </view>
                                    <view class="category-tag" v-if="item.Category">
                                        {{ getCategoryName(item.Category) }}
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 加载更多 -->
                <view class="loadmore" v-if="hasMore" @click="loadMore">
                    <text>加载更多</text>
                </view>
                <view class="nomore" v-else>
                    <text>没有更多了</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            statusBarHeight: 0,
            navHeight: 0,
            rightPadding: 12,
            keyword: '',
            resultList: [],
            leftList: [],
            rightList: [],
            page: 1,
            limit: 20,
            total: 0,
            searched: false,
            loading: false,
            hasMore: true
        };
    },
    onLoad(options) {
        const sys = uni.getSystemInfoSync();
        // #ifdef H5
        this.statusBarHeight = 0;
        this.navHeight = 44;
        this.rightPadding = 12;
        // #endif
        // #ifndef H5
        this.statusBarHeight = sys.statusBarHeight || 20;
        this.navHeight = sys.statusBarHeight + 44;
        // #ifdef MP-WEIXIN
        const menuButton = uni.getMenuButtonBoundingClientRect();
        this.rightPadding = Math.round(sys.windowWidth - menuButton.left + 8);
        // #endif
        // #endif
        if (options.keyword) {
            this.keyword = options.keyword;
            this.doSearch();
        }
    },
    methods: {
        getCategoryName(category) {
            const names = {
                scenic: '景区',
                food: '美食',
                culture: '非遗'
            };
            return names[category] || '';
        },
        quickSearch(keyword) {
            this.keyword = keyword;
            this.doSearch();
        },
        async doSearch() {
            if (!this.keyword.trim()) {
                uni.showToast({ title: '请输入关键词', icon: 'none' });
                return;
            }
            this.searched = true;
            this.loading = true;
            this.page = 1;
            this.resultList = [];
            this.leftList = [];
            this.rightList = [];
            try {
                const res = await this.$api.searchContents({
                    keyword: this.keyword,
                    page: this.page,
                    limit: this.limit
                });
                this.resultList = res.list || [];
                this.total = res.total || 0;
                this.hasMore = this.resultList.length >= this.limit;
                this.distributeItems(this.resultList);
            } catch (error) {
                console.log('搜索失败:', error);
            } finally {
                this.loading = false;
            }
        },
        async loadMore() {
            if (!this.hasMore || this.loading) return;
            this.page++;
            this.loading = true;
            try {
                const res = await this.$api.searchContents({
                    keyword: this.keyword,
                    page: this.page,
                    limit: this.limit
                });
                const newList = res.list || [];
                this.resultList = [...this.resultList, ...newList];
                this.hasMore = newList.length >= this.limit;
                this.distributeItems(newList);
            } catch (error) {
                console.log('加载更多失败:', error);
            } finally {
                this.loading = false;
            }
        },
        distributeItems(items) {
            const startIndex = this.resultList.length - items.length;
            items.forEach((item, index) => {
                if ((startIndex + index) % 2 === 0) {
                    this.leftList.push(item);
                } else {
                    this.rightList.push(item);
                }
            });
        },
        goDetail(index, side) {
            const item = side === 'L' ? this.leftList[index] : this.rightList[index];
            if (!item) return;
            if (item.RouteID) {
                uni.navigateTo({ url: `/pages/pagesA/RouteDetail/routeDetail?id=${item.RouteID}` });
            } else if (item.ContentID) {
                uni.navigateTo({ url: `/pages/pagesA/ContentDetail/contentDetail?id=${item.ContentID}&category=${item.Category}` });
            }
        },
        goBack() {
            uni.navigateBack();
        }
    }
};
</script>

<style scoped>
.search-container {
    background-color: #f5f5f5;
    min-height: 100vh;
}
.custom-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #000000;
    z-index: 1000;
    box-sizing: border-box;
}
.nav-content {
    height: 44px;
    display: flex;
    align-items: center;
    padding-left: 12px;
    box-sizing: border-box;
}
.nav-left {
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
}
.nav-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
}
.nav-right {
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}
.cancel-text {
    font-size: 14px;
    color: #ffffff;
}
.search-box {
    width: 100%;
    max-width: 500px;
    display: flex;
    align-items: center;
    background-color: #ffffff;
    border-radius: 20px;
    padding: 0 16px;
    height: 32px;
    box-sizing: border-box;
}
.search-input {
    flex: 1;
    margin-left: 8px;
    font-size: 14px;
    color: #333;
    height: 32px;
    line-height: 32px;
}
.search-body {
    padding: 20rpx;
}

/* 未搜索提示 */
.search-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 100rpx;
}
.hint-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 40rpx;
}
.hot-section {
    width: 100%;
    padding: 0 30rpx;
}
.hot-title {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 20rpx;
    display: block;
}
.hot-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
}
.hot-tag {
    padding: 16rpx 32rpx;
    background-color: #fff;
    border-radius: 30rpx;
    font-size: 26rpx;
    color: #666;
}

/* 加载中 */
.search-loading {
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

/* 空结果 */
.search-empty {
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
.empty-hint {
    font-size: 24rpx;
    color: #ccc;
    margin-top: 10rpx;
}

/* 搜索结果 */
.result-section {
    padding: 0 10rpx;
}
.result-count {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 20rpx;
    padding: 0 10rpx;
}

/* 瀑布流 */
.waterfall {
    display: flex;
}
.waterfall-column {
    flex: 1;
    padding: 0 10rpx;
}

/* 卡片 */
.result-card {
    background-color: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
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
.category-tag {
    font-size: 22rpx;
    color: #ff2442;
    background-color: #fff1f0;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    margin-left: 16rpx;
}

/* 加载更多 */
.loadmore {
    text-align: center;
    padding: 30rpx;
    color: #3c9cff;
    font-size: 28rpx;
}
.nomore {
    text-align: center;
    padding: 30rpx;
    color: #999;
    font-size: 26rpx;
}
</style>
