<template>
		<view class="index-container">
			<view class="custom-nav" :style="{ height: navHeight + 'px', paddingTop: statusBarHeight + 'px' }">
				<view class="nav-content">
					<view class="nav-left" @click="goToSearch">
						<u-icon name="search" size="22" color="#ffffff"></u-icon>
					</view>
					<view class="nav-center">
						<text class="nav-title">莆韵红团</text>
					</view>
					<view class="nav-right"></view>
				</view>
			</view>
			<view class="main-content" :style="{ paddingTop: navHeight + 'px' }">
				<view class="swiper-wrap">
					<u-swiper :list="swiperList" :height="swiperHeight" circular autoplay imgMode="aspectFill"
						radius="20" @click="handleSwiperClick"></u-swiper>
				</view>

				<view class="ad-banner" @click="toHongji">
					<image :src="adImage" mode="widthFix" class="ad-image"></image>
				</view>

				<view class="category-section">
					<view class="category-item" @click="toHongtuan">
						<u-icon name="gift" size="36" color="#f56c6c"></u-icon>
						<text class="category-text">莆韵红团</text>
					</view>
					<view class="category-item" @click="toHongji">
						<u-icon name="calendar" size="36" color="#e63e3e"></u-icon>
						<text class="category-text">莆韵红迹</text>
					</view>
					<view class="category-item" @click="toRoutes">
						<u-icon name="map" size="36" color="#3c9cff"></u-icon>
						<text class="category-text">研学路线</text>
					</view>
					<view class="category-item" @click="toActivity">
						<u-icon name="star" size="36" color="#e6a23c"></u-icon>
						<text class="category-text">热门活动</text>
					</view>
				</view>

				<view class="image-section">
					<view class="image-card" v-for="(item, index) in imageList" :key="index"
						@click="handleImageClick(item)">
						<image :src="item.url" mode="aspectFill" class="image-item"></image>
					</view>
				</view>

				<view class="section">
					<view class="section-title">
						<text class="title-text">热门线路推荐</text>
						<text class="title-more" @click="toRoutes">查看更多 ></text>
					</view>
					<view class="route-list">
						<view class="route-card" v-for="item in routeList" :key="item.RouteID"
							@click="toRouteDetail(item.RouteID)">
							<image class="route-image" :src="item.CoverImage || 'https://picsum.photos/400/300?random=1'"
								mode="aspectFill"></image>
							<view class="route-info">
								<text class="route-name">{{ item.RouteName }}</text>
								<text class="route-meta">{{ item.Days }}天</text>
								<text v-if="item.Status === 'display_only'" class="route-display-tag">仅供展示</text>
									<text v-else class="route-price">¥{{ item.Price }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<TabBar value="index" />
		</view>
	</template>

	<script>
		import TabBar from '@/components/TabBar.vue';
		export default {
			components: {
				TabBar
			},
			data() {
				return {
					statusBarHeight: 0,
					navHeight: 0,
					swiperHeight: 250,
					swiperList: [],
					swiperData: [],
					// 自定义分享配置
					shareConfig: {
						title: '莆韵红团 - 发现莆田之美'
					},
					imageList: [{
							url: 'http://yspt.lechiqy.com/wp-content/uploads/2026/04/df905f272930c126a6ad3126929d4be4-768x576.jpg',
							category: 'scenic',
							label: '智慧景区'
						},
						{
							url: 'http://yspt.lechiqy.com/wp-content/uploads/2026/04/2229537acc449d8bde889fdc82f8a0b8-768x576.jpg',
							category: 'culture',
							label: '特色美食'
						},
						{
							url: 'http://yspt.lechiqy.com/wp-content/uploads/2026/04/0d658dc387e28745ebbe755f0619c6de-768x576.jpg',
							category: 'food',
							label: '文旅路线'
						},
						{
							url: 'http://yspt.lechiqy.com/wp-content/uploads/2026/04/df87019ea19249c0834691aeacf6b199-768x571.jpg',
							category: 'routes',
							label: '非遗文化'
						}
					],
					routeList: [],
					adImage: 'http://yspt-img.lechiqy.com/a1e41762cccc4f4efd8ad1cd4b0fe92d.jpg'
				};
			},
			mounted() {
				const sys = uni.getSystemInfoSync();
				// #ifdef H5
				this.statusBarHeight = 0;
				this.navHeight = 44;
				// #endif
				// #ifndef H5
				this.statusBarHeight = sys.statusBarHeight || 20;
				this.navHeight = sys.statusBarHeight + 44;
				// #endif
				this.swiperHeight = Math.round((sys.windowWidth - 40) * 9 / 16);
				this.loadData();
			},
			methods: {
				async loadData() {
					this.loadSwipers();
					try {
						const res = await this.$api.getRoutesList({
							page: 1,
							limit: 4
						});
						this.routeList = res.list || [];
					} catch (error) {
						console.log('加载线路失败:', error);
					}
				},
				async loadSwipers() {
					try {
						const res = await this.$api.getSwiperList();
						const list = res.list || [];
						this.swiperData = list;
						this.swiperList = list.map(item => ({ url: item.Image }));
					} catch (error) {
						console.log('加载轮播图失败:', error);
					}
				},
				handleSwiperClick(index) {
					const item = this.swiperData[index];
					if (!item || item.LinkType === 'none') return;

					if (item.LinkType === 'route') {
						uni.navigateTo({
							url: `/pages/pagesA/RouteDetail/routeDetail?id=${item.LinkValue}`
						});
					} else if (item.LinkType === 'content') {
						uni.navigateTo({
							url: `/pages/pagesA/ContentDetail/contentDetail?id=${item.LinkValue}`
						});
					} else if (item.LinkType === 'hongtuan') {
						uni.navigateTo({
							url: '/pages/pagesB/Hongtuan/hongtuan'
						});
					} else if (item.LinkType === 'hongji') {
						uni.navigateTo({
							url: '/pages/pagesB/Hongji/hongji'
						});
					} else if (item.LinkType === 'routes') {
						uni.reLaunch({
							url: '/pages/pagesA/Routes/routes'
						});
					} else if (item.LinkType === 'activity') {
						uni.navigateTo({
							url: '/pages/pagesA/Activity/activity'
						});
					} else if (item.LinkType === 'category') {
						uni.navigateTo({
							url: `/pages/pagesA/Category/category?category=${item.LinkValue}`
						});
					} else if (item.LinkType === 'external') {
						uni.navigateTo({
							url: `/pages/pagesA/Webview/webview?url=${encodeURIComponent(item.LinkValue)}`
						});
					}
				},
				goToSearch() {
					uni.navigateTo({
						url: '/pages/pagesA/Search/search'
					});
				},
				toRoutes() {
					uni.reLaunch({
						url: '/pages/pagesA/Routes/routes'
					});
				},
				toHongtuan() {
					uni.navigateTo({
						url: '/pages/pagesB/Hongtuan/hongtuan'
					});
				},
				toHongji() {
					uni.navigateTo({
						url: '/pages/pagesB/Hongji/hongji'
					});
				},
				toActivity() {
					uni.navigateTo({
						url: '/pages/pagesA/Activity/activity'
					});
				},
				toUser() {
					uni.reLaunch({
						url: '/pages/pagesB/User/user'
					});
				},
				handleImageClick(item) {
					uni.navigateTo({
						url: `/pages/pagesA/Category/category?category=${item.category}`
					});
				},
				toRouteDetail(id) {
					uni.navigateTo({
						url: `/pages/pagesA/RouteDetail/routeDetail?id=${id}`
					});
				},
				handleAdClick() {
					uni.showToast({
						title: '功能开发中',
						icon: 'none'
					});
				}
			}
		};
	</script>

	<style scoped>
		.index-container {
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
			padding: 0 12px;
			box-sizing: border-box;
		}

		.nav-left {
			width: 80px;
			display: flex;
			align-items: center;
			justify-content: flex-start;
		}

		.nav-center {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.nav-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #ffffff;
		}

		.nav-right {
			width: 80px;
		}

		.main-content {
			padding-bottom: 20rpx;
		}

		.swiper-wrap {
			margin: 20rpx;
		}

		.category-section {
			margin: 20rpx;
			background-color: #fff;
			border-radius: 20rpx;
			padding: 20rpx 10rpx;
			display: flex;
			justify-content: space-around;
		}

		.category-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 10rpx;
			border-radius: 16rpx;
			transition: background-color 0.3s;
		}

		.category-item:active {
			background-color: #f5f5f5;
		}

		.category-text {
			font-size: 22rpx;
			color: #333;
			margin-top: 8rpx;
			text-align: center;
		}

		.image-section {
			margin: 20rpx;
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
		}

		.image-card {
			width: 48%;
			border-radius: 20rpx;
			overflow: hidden;
			margin-bottom: 16rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		}

		.image-item {
			width: 100%;
			height: 220rpx;
		}

		.ad-banner {
			margin: 20rpx 20rpx 20rpx;
			border-radius: 20rpx;
			overflow: hidden;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		}

		.ad-image {
			width: 100%;
			display: block;
		}

		.section {
			margin: 20rpx;
			background-color: #fff;
			border-radius: 20rpx;
			padding: 30rpx;
		}

		.section-title {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;
		}

		.title-text {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}

		.title-more {
			font-size: 26rpx;
			color: #3c9cff;
		}

		.route-list {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
		}

		.route-card {
			width: 48%;
			margin-bottom: 30rpx;
			border-radius: 16rpx;
			overflow: hidden;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		}

		.route-image {
			width: 100%;
			height: 200rpx;
		}

		.route-info {
			padding: 16rpx;
		}

		.route-name {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
			display: block;
			margin-bottom: 8rpx;
		}

		.route-meta {
			font-size: 22rpx;
			color: #999;
			display: block;
			margin-bottom: 8rpx;
		}

		.route-price {
			font-size: 28rpx;
			color: #f56c6c;
			font-weight: bold;
			display: block;
		}
	</style>
