<template>
	<view class="hongji-container">
		<!-- 顶部横幅 -->
		<view class="hero-section">
			<view class="hero-bg"></view>
			<view class="hero-content">
				<text class="hero-title">莆韵红迹</text>
				<text class="hero-subtitle">红色文化街区智慧导览</text>
				<text class="hero-desc">追寻革命足迹，传承红色基因。漫步莆田红色街区，重温那段峥嵘岁月。</text>
			</view>
		</view>

		<!-- 街区导览地图概览 -->
		<view class="map-section">
			<view class="section-header">
				<text class="section-title">街区导览</text>
				<text class="section-badge">{{ spots.length }}个景点</text>
			</view>
			<view class="map-card">
				<image class="map-image" :src="mapImage" mode="aspectFill" @click="previewMap"></image>
				<view class="map-overlay">
					<view class="map-tag" v-for="(tag, idx) in mapTags" :key="idx" :style="{ top: tag.top, left: tag.left }">
						<view class="tag-dot"></view>
						<text class="tag-name">{{ tag.name }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 景点分类筛选 -->
		<view class="filter-section">
			<scroll-view scroll-x class="filter-scroll">
				<view class="filter-item" :class="{ active: activeFilter === 'all' }" @click="setFilter('all')">
					<text>全部</text>
				</view>
				<view class="filter-item" :class="{ active: activeFilter === 'site' }" @click="setFilter('site')">
					<text>古建筑遗址</text>
				</view>
				<view class="filter-item" :class="{ active: activeFilter === 'culture' }" @click="setFilter('culture')">
					<text>人文民俗</text>
				</view>
				<view class="filter-item" :class="{ active: activeFilter === 'memorial' }" @click="setFilter('memorial')">
					<text>纪念场馆</text>
				</view>
			</scroll-view>
		</view>

		<!-- 景点列表 -->
		<view class="spots-section">
			<view class="spot-card" v-for="(spot, index) in filteredSpots" :key="index" @click="showSpotDetail(spot)">
				<image class="spot-image" :src="spot.image" mode="aspectFill"></image>
				<view class="spot-info">
					<view class="spot-header">
						<text class="spot-name">{{ spot.name }}</text>
						<view class="spot-tag" :class="'tag-' + spot.type">
							<text>{{ spot.typeName }}</text>
						</view>
					</view>
					<text class="spot-desc">{{ spot.desc }}</text>
					<view class="spot-actions">
						<view class="action-btn" @click.stop="openNavigation(spot)">
							<u-icon name="map-fill" size="14" color="#f56c6c"></u-icon>
							<text class="action-text">导航</text>
						</view>
						<view class="action-btn" @click.stop="playAudio(spot)" v-if="spot.audioDesc">
							<u-icon name="volume" size="14" color="#3c9cff"></u-icon>
							<text class="action-text">语音</text>
						</view>
						<view class="action-btn" :class="{ checked: checkedSpots.includes(spot.name) }" @click.stop="handleCheckin(spot)">
							<u-icon :name="checkedSpots.includes(spot.name) ? 'checkmark-circle-fill' : 'map'" size="14" :color="checkedSpots.includes(spot.name) ? '#67c23a' : '#e6a23c'"></u-icon>
							<text class="action-text" :class="{ 'checked-text': checkedSpots.includes(spot.name) }">{{ checkedSpots.includes(spot.name) ? '已打卡' : '打卡' }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="filteredSpots.length === 0" class="empty">
				<u-icon name="info-circle" size="60" color="#ccc"></u-icon>
				<text class="empty-text">暂无该分类景点</text>
			</view>
		</view>

		<!-- 推荐路线 -->
		<view class="routes-section">
			<view class="section-header">
				<text class="section-title">推荐路线</text>
			</view>
			<scroll-view scroll-x class="routes-scroll">
				<view class="route-card" v-for="(route, index) in routes" :key="index">
					<view class="route-icon-wrap">
						<u-icon :name="route.icon" size="28" color="#f56c6c"></u-icon>
					</view>
					<view class="route-info">
						<text class="route-name">{{ route.name }}</text>
						<text class="route-meta">{{ route.spots }}个景点 · 约{{ route.duration }}</text>
					</view>
					<u-icon name="arrow-right" size="16" color="#ccc"></u-icon>
				</view>
			</scroll-view>
		</view>

		<!-- 街区服务 -->
		<view class="service-section">
			<view class="section-header">
				<text class="section-title">街区服务</text>
			</view>
			<view class="service-grid">
				<view class="service-item" @click="handleService('guide')">
					<view class="service-icon-wrap" style="background-color: #fff0f0;">
						<u-icon name="account" size="24" color="#f56c6c"></u-icon>
					</view>
					<text class="service-name">讲解预约</text>
				</view>
				<view class="service-item" @click="handleService('parking')">
					<view class="service-icon-wrap" style="background-color: #e6f7ff;">
						<u-icon name="car" size="24" color="#3c9cff"></u-icon>
					</view>
					<text class="service-name">停车指引</text>
				</view>
				<view class="service-item" @click="handleService('rest')">
					<view class="service-icon-wrap" style="background-color: #f0f9eb;">
						<u-icon name="reload" size="24" color="#67c23a"></u-icon>
					</view>
					<text class="service-name">休息区</text>
				</view>
				<view class="service-item" @click="handleService('shop')">
					<view class="service-icon-wrap" style="background-color: #fdf6ec;">
						<u-icon name="gift" size="24" color="#e6a23c"></u-icon>
					</view>
					<text class="service-name">文创商店</text>
				</view>
			</view>
		</view>

		<!-- 景点详情弹窗 -->
		<u-popup :show="spotPopupShow" mode="bottom" round="20" @close="spotPopupShow = false">
			<view class="popup-content" v-if="currentSpot">
				<image class="popup-image" :src="currentSpot.image" mode="aspectFill"></image>
				<view class="popup-body">
					<view class="popup-header">
						<text class="popup-name">{{ currentSpot.name }}</text>
						<view class="popup-tag" :class="'tag-' + currentSpot.type">
							<text>{{ currentSpot.typeName }}</text>
						</view>
					</view>
					<text class="popup-desc">{{ currentSpot.desc }}</text>
					<view class="popup-actions">
						<view class="popup-action-btn" @click="openNavigation(currentSpot)">
							<u-icon name="map-fill" size="18" color="#f56c6c"></u-icon>
							<text class="popup-action-text">导航</text>
						</view>
						<view class="popup-action-btn" @click="playAudio(currentSpot)" v-if="currentSpot.audioDesc">
							<u-icon name="volume" size="18" color="#3c9cff"></u-icon>
							<text class="popup-action-text">语音讲解</text>
						</view>
						<view class="popup-action-btn" :class="{ popupChecked: checkedSpots.includes(currentSpot.name) }" @click="handleCheckin(currentSpot)">
							<u-icon :name="checkedSpots.includes(currentSpot.name) ? 'checkmark-circle-fill' : 'map'" size="18" :color="checkedSpots.includes(currentSpot.name) ? '#67c23a' : '#e6a23c'"></u-icon>
							<text class="popup-action-text">{{ checkedSpots.includes(currentSpot.name) ? '已打卡' : '打卡' }}</text>
						</view>
					</view>
				</view>
			</view>
		</u-popup>

		<!-- 底部占位 -->
		<view class="bottom-placeholder"></view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				activeFilter: 'all',
				checkedSpots: [],
				playingSpot: null,
				innerAudio: null,
				spotPopupShow: false,
				currentSpot: null,
				mapImage: 'http://yspt-img.lechiqy.com/d0ad0a2b18811bd761198ccbe55556e4.jpg',
				mapTags: [{
						name: '大宗伯第',
						top: '12%',
						left: '15%'
					},
					{
						name: '原氏民居',
						top: '12%',
						left: '60%'
					},
					{
						name: '林扬祖故居',
						top: '30%',
						left: '38%'
					},
					{
						name: '文献崇功祠',
						top: '50%',
						left: '18%'
					},
					{
						name: '长寿社',
						top: '50%',
						left: '68%'
					},
					{
						name: '伯棠医院',
						top: '72%',
						left: '30%'
					},
					{
						name: '衙后邮局',
						top: '72%',
						left: '72%'
					}
				],
				spots: [{
						id: 1,
						name: '大宗伯第',
						type: 'site',
						typeName: '古建筑遗址',
						desc: '明代礼部尚书陈经邦故居，始建于明嘉靖年间，是莆田城内规模最大的明代官员宅第，建筑布局典型，雕梁画栋精美。',
						image: 'http://yspt-img.lechiqy.com/a908fb9d1a9a1dae15477b9d4c7cbcdd.jpg',
						lat: 25.432,
						lng: 119.007,
						audioDesc: true,
						audioUrl: 'http://yspt-img.lechiqy.com/tts/%E5%A4%A7%E5%AE%97%E4%BC%AF%E7%AC%AC.mp3'
					},
					{
						id: 2,
						name: '原氏民居',
						type: 'site',
						typeName: '古建筑遗址',
						desc: '莆田传统民居典型代表，保留了完整的闽南传统建筑风貌，天井、出砖入石等细节精巧，展示了当年名门望族的家府风范。',
						image: 'http://yspt-img.lechiqy.com/c17f010c55b116723f7acf9b906a1be0.png',
						lat: 25.433,
						lng: 119.010,
						audioDesc: true,
						audioUrl: 'http://yspt-img.lechiqy.com/tts/%E5%8E%9F%E6%B0%8F%E6%B0%91%E5%B1%85.mp3'
					},
					{
						id: 3,
						name: '林扬祖故居',
						type: 'culture',
						typeName: '名人故居',
						desc: '清代名臣林扬祖故居，其人历任云贵总督，故居保留清代建筑风格，是研究莆田历史人物与建筑艺术的重要实物。',
						image: 'http://yspt-img.lechiqy.com/6085d1d3a5fddd9832d21b1dd63f2296.jpg',
						lat: 25.431,
						lng: 119.009,
						audioDesc: true,
						audioUrl: 'http://yspt-img.lechiqy.com/tts/%E6%9E%97%E6%89%AC%E7%A5%96%E6%95%85%E5%B1%85.mp3'
					},
					{
						id: 4,
						name: '文献崇功祠',
						type: 'memorial',
						typeName: '纪念场馆',
						desc: '始建于明代，为纪念莆田文献名邦而建，内供奉历代乡贤忠烈，是莆田崇德祭贤的重要场所。',
						image: 'http://yspt-img.lechiqy.com/55f12ce5a71e56768e0705dfc048dda5.png',
						lat: 25.430,
						lng: 119.006,
						audioDesc: true,
						audioUrl: 'http://yspt-img.lechiqy.com/tts/%E6%96%87%E7%8C%AE%E5%B4%87%E5%8A%9F%E7%A5%A0.mp3'
					},
					{
						id: 5,
						name: '长寿社',
						type: 'culture',
						typeName: '民俗文化',
						desc: '莆田古街区内传统社坛建筑，是当地居民祭祀祈福的重要场所，见证了莆田民间信仰与社区生活的渊源。',
						image: 'http://yspt-img.lechiqy.com/7a32d7cd26b8b0d047d51996fbfdf1ad.jpg',
						lat: 25.429,
						lng: 119.011,
						audioDesc: true,
						audioUrl: 'http://yspt-img.lechiqy.com/tts/%E9%95%BF%E5%AF%BF%E7%A4%BE.mp3'
					},
					{
						id: 6,
						name: '伯棠医院',
						type: 'site',
						typeName: '红色遗址',
						desc: '民国时期创办的莆田早期西医机构，在革命战争时期曾为游击队提供医疗救护，是红色医疗史的重要见证。',
						image: 'http://yspt-img.lechiqy.com/239385e904c0b5851f54d79231b95f92.jpg',
						lat: 25.428,
						lng: 119.008,
						audioDesc: true,
						audioUrl: 'http://yspt-img.lechiqy.com/tts/%E4%BC%AF%E6%A3%A0%E5%8C%BB%E9%99%A2.mp3'
					},
					{
						id: 7,
						name: '衙后邮局',
						type: 'site',
						typeName: '红色遗址',
						desc: '晚清至民国时期的邮政机构旧址，保留了当年的建筑风貌与邮政设施，曾是地下党传递情报的秘密联络点。',
						image: 'http://yspt-img.lechiqy.com/f3755aade49f4228243762cd7a19fac7.png',
						lat: 25.429,
						lng: 119.012,
						audioDesc: true,
						audioUrl: 'http://yspt-img.lechiqy.com/tts/%E8%A1%99%E5%90%8E%E9%82%AE%E5%B1%80.mp3'
					}
				],
				routes: [{
						id: 1,
						name: '峥嵘岁月线',
						icon: 'level',
						spots: 4,
						duration: '3小时'
					},
					{
						id: 2,
						name: '红色记忆线',
						icon: 'heart-fill',
						spots: 3,
						duration: '2小时'
					},
					{
						id: 3,
						name: '研学体验线',
						icon: 'file-text',
						spots: 5,
						duration: '4小时'
					}
				]
			};
		},
		onLoad() {
			this.loadCheckinStatus();
		},
		onHide() {
			if (this.innerAudio) {
				this.innerAudio.stop();
				this.playingSpot = null;
			}
		},
		computed: {
			filteredSpots() {
				if (this.activeFilter === 'all') return this.spots;
				return this.spots.filter(s => s.type === this.activeFilter);
			}
		},
		methods: {
			setFilter(type) {
				this.activeFilter = type;
			},
			previewMap() {
				uni.previewImage({
					urls: [this.mapImage],
					current: this.mapImage
				});
			},
			showSpotDetail(spot) {
				this.currentSpot = spot;
				this.spotPopupShow = true;
			},
			openNavigation(spot) {
				uni.openLocation({
					latitude: spot.lat,
					longitude: spot.lng,
					name: spot.name,
					address: spot.address,
					scale: 18,
					fail: () => {
						uni.showToast({
							title: '打开导航失败',
							icon: 'none'
						});
					}
				});
			},
			playAudio(spot) {
				if (!spot.audioUrl) {
					uni.showToast({ title: '暂无语音讲解', icon: 'none' });
					return;
				}
				if (this.playingSpot && this.playingSpot.name === spot.name) {
					if (this.innerAudio) {
						this.innerAudio.stop();
					}
					this.playingSpot = null;
					return;
				}
				if (this.innerAudio) {
					this.innerAudio.stop();
				}
				this.innerAudio = uni.createInnerAudioContext();
				this.innerAudio.src = spot.audioUrl;
				this.playingSpot = spot;
				this.innerAudio.onEnded = () => {
					this.playingSpot = null;
				};
				this.innerAudio.onError = () => {
					this.playingSpot = null;
					uni.showToast({ title: '播放失败', icon: 'none' });
				};
				this.innerAudio.play();
			},
			handleService(type) {
				const messages = {
					guide: '讲解预约功能开发中',
					parking: '停车指引功能开发中',
					rest: '休息区指引功能开发中',
					shop: '文创商店功能开发中'
				};
				uni.showToast({
					title: messages[type] || '功能开发中',
					icon: 'none'
				});
			},
			async loadCheckinStatus() {
				const token = uni.getStorageSync('token');
				if (!token) {
					this.checkedSpots = [];
					return;
				}
				try {
					const res = await this.$api.checkinStatus();
					this.checkedSpots = res.checkedSpots || [];
				} catch (e) {
					console.log('获取打卡状态失败:', e);
				}
			},
			async handleCheckin(spot) {
				const token = uni.getStorageSync('token');
				if (!token) {
					uni.showModal({
						title: '提示',
						content: '请先登录后再打卡',
						confirmText: '去登录',
						success: (res) => {
							if (res.confirm) {
								uni.setStorageSync('redirectAfterLogin', '/pages/pagesB/Hongji/hongji');
								uni.navigateTo({ url: '/pages/Login/login' });
							}
						}
					});
					return;
				}
				if (this.checkedSpots.includes(spot.name)) {
					uni.showToast({ title: '已打卡过该景点', icon: 'none' });
					return;
				}
				try {
					await this.$api.checkinAdd({ spotName: spot.name });
					this.checkedSpots.push(spot.name);
					uni.showToast({ title: '打卡成功', icon: 'success' });
				} catch (e) {
					uni.showToast({ title: e.message || '打卡失败', icon: 'none' });
				}
			}
		}
	};
</script>

<style scoped>
	.hongji-container {
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	/* 顶部横幅 */
	.hero-section {
		position: relative;
		height: 350rpx;
		overflow: hidden;
	}

	.hero-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, #c62828, #e53935, #ef5350);
	}

	.hero-content {
		position: relative;
		z-index: 1;
		padding: 0 40rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 100%;
	}

	.hero-title {
		font-size: 52rpx;
		font-weight: bold;
		color: #ffffff;
		display: block;
		margin-bottom: 8rpx;
		letter-spacing: 8rpx;
	}

	.hero-subtitle {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.85);
		display: block;
		margin-bottom: 20rpx;
	}

	.hero-desc {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.6;
		display: block;
	}

	/* 通用 section header */
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.section-badge {
		font-size: 24rpx;
		color: #f56c6c;
		background-color: #fff0f0;
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
	}

	/* 街区导览地图 */
	.map-section {
		margin: 20rpx;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
	}

	.map-card {
		position: relative;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.map-image {
		width: 100%;
		height: 360rpx;
		background-color: #f0e6e6;
	}

	.map-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.map-tag {
		position: absolute;
		display: flex;
		align-items: center;
	}

	.tag-dot {
		width: 16rpx;
		height: 16rpx;
		background-color: #f56c6c;
		border-radius: 50%;
		border: 3rpx solid #fff;
		box-shadow: 0 2rpx 8rpx rgba(245, 108, 108, 0.5);
		flex-shrink: 0;
	}

	.tag-name {
		font-size: 20rpx;
		color: #fff;
		background-color: rgba(198, 40, 40, 0.85);
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		margin-left: 6rpx;
		white-space: nowrap;
	}

	/* 分类筛选 */
	.filter-section {
		margin: 0 20rpx 10rpx;
	}

	.filter-scroll {
		white-space: nowrap;
	}

	.filter-item {
		display: inline-flex;
		padding: 14rpx 28rpx;
		background-color: #fff;
		border-radius: 30rpx;
		margin-right: 16rpx;
		font-size: 26rpx;
		color: #666;
	}

	.filter-item.active {
		background: linear-gradient(135deg, #f56c6c, #e63e3e);
		color: #fff;
		font-weight: 500;
	}

	/* 景点列表 */
	.spots-section {
		margin: 20rpx;
	}

	.spot-card {
		display: flex;
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
	}

	.spot-image {
		width: 220rpx;
		height: 220rpx;
		flex-shrink: 0;
		background-color: #f5f5f5;
	}

	.spot-info {
		flex: 1;
		padding: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-width: 0;
	}

	.spot-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10rpx;
	}

	.spot-name {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.spot-tag {
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		flex-shrink: 0;
		margin-left: 12rpx;
	}

	.tag-memorial {
		background-color: #fff0f0;
		color: #f56c6c;
	}

	.tag-site {
		background-color: #e6f7ff;
		color: #3c9cff;
	}

	.tag-culture {
		background-color: #fdf6ec;
		color: #e6a23c;
	}

	.spot-desc {
		font-size: 24rpx;
		color: #999;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		margin-bottom: 12rpx;
	}

	.spot-actions {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.action-btn {
		display: flex;
		align-items: center;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		background-color: #f9f9f9;
	}

	.action-text {
		font-size: 22rpx;
		color: #666;
		margin-left: 4rpx;
	}

	.action-btn.checked {
		background-color: #f0f9eb;
	}

	.checked-text {
		color: #67c23a !important;
	}

	/* 空状态 */
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 80rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
		margin-top: 20rpx;
	}

	/* 推荐路线 */
	.routes-section {
		margin: 0 20rpx 20rpx;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
	}

	.routes-scroll {
		white-space: nowrap;
	}

	.route-card {
		display: inline-flex;
		align-items: center;
		background-color: #fafafa;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-right: 20rpx;
		width: 380rpx;
		box-sizing: border-box;
	}

	.route-icon-wrap {
		width: 80rpx;
		height: 80rpx;
		background-color: #fff0f0;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.route-info {
		flex: 1;
		margin-left: 20rpx;
		min-width: 0;
	}

	.route-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 6rpx;
	}

	.route-meta {
		font-size: 22rpx;
		color: #999;
		display: block;
	}

	/* 街区服务 */
	.service-section {
		margin: 0 20rpx 20rpx;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
	}

	.service-grid {
		display: flex;
		flex-wrap: wrap;
	}

	.service-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.service-icon-wrap {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 12rpx;
	}

	.service-name {
		font-size: 24rpx;
		color: #333;
	}

	/* 景点详情弹窗 */
	.popup-content {
		max-height: 80vh;
		overflow-y: auto;
	}

	.popup-image {
		width: 100%;
		height: 400rpx;
		background-color: #f5f5f5;
	}

	.popup-body {
		padding: 30rpx;
	}

	.popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.popup-name {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		flex: 1;
	}

	.popup-tag {
		font-size: 22rpx;
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
		flex-shrink: 0;
		margin-left: 16rpx;
	}

	.popup-desc {
		font-size: 28rpx;
		color: #666;
		line-height: 1.8;
		margin-bottom: 30rpx;
	}

	.popup-actions {
		display: flex;
		gap: 24rpx;
	}

	.popup-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16rpx 40rpx;
		border-radius: 40rpx;
		background-color: #f9f9f9;
	}

	.popup-action-text {
		font-size: 26rpx;
		color: #333;
		margin-left: 8rpx;
	}

	.popupChecked {
		background-color: #f0f9eb !important;
	}

	/* 底部占位 */
	.bottom-placeholder {
		height: 40rpx;
	}
</style>
