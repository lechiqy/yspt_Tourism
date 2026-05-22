<template>
	<view class="hongtuan-container">
		<!-- 标题介绍 -->
		<view class="intro-section">
			<text class="intro-title">莆韵红团</text>
			<text class="intro-subtitle">莆田非遗传统糕点 · 匠心手作</text>
			<text
				class="intro-desc">红团是莆田传统节庆必备美食，以糯米为皮，红豆、绿豆或糯米为馅，用木模印制而成，寓意团团圆圆、红红火火。莆韵红团传承百年工艺，精选优质食材，手工制作每一枚红团。</text>
		</view>

		<!-- 商品规格选择 -->
		<view class="products-section" v-if="products.length > 0">
			<text class="section-title">选择规格</text>
			<view class="product-list">
				<view v-for="(product, index) in products" :key="product.ProductID" class="product-card"
					:class="{ active: selectedIndex === index }" @click="selectProduct(index)">
					<image class="product-image" :src="product.image" mode="aspectFill" @click.stop="previewImage(product.image)"></image>
					<view class="product-info">
						<text class="product-name">{{ product.name }}</text>
						<text class="product-desc">{{ product.desc }}</text>
						<view class="product-price-row">
							<text class="product-price">¥{{ product.price }}</text>
							<text class="product-unit">/{{ product.unit }}</text>
						</view>
						<view v-if="product.status === 'display_only'" class="display-only-tag">仅供展示</view>
					</view>
					<view class="product-check" v-if="selectedIndex === index">
						<u-icon name="checkmark-circle-fill" size="24" color="#f56c6c"></u-icon>
					</view>
				</view>
			</view>
		</view>

		<!-- 加载中/空状态 -->
		<view class="empty-section" v-if="products.length === 0 && !loading">
			<u-icon name="info-circle" size="60" color="#ccc"></u-icon>
			<text class="empty-text">暂无商品信息</text>
		</view>

		<view class="loading-section" v-if="loading">
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 文化介绍 -->
		<view class="culture-section">
			<text class="section-title">红团文化</text>
			<view class="culture-item">
				<view class="culture-icon-wrap">
					<u-icon name="clock" size="24" color="#e6a23c"></u-icon>
				</view>
				<view class="culture-text-wrap">
					<text class="culture-name">百年传承</text>
					<text class="culture-desc">红团制作技艺代代相传，是莆田重要的非物质文化遗产</text>
				</view>
			</view>
			<view class="culture-item">
				<view class="culture-icon-wrap">
					<u-icon name="thumb-up" size="24" color="#e6a23c"></u-icon>
				</view>
				<view class="culture-text-wrap">
					<text class="culture-name">匠心手作</text>
					<text class="culture-desc">每一枚红团皆由师傅手工揉制、印模、蒸制而成</text>
				</view>
			</view>
			<view class="culture-item">
				<view class="culture-icon-wrap">
					<u-icon name="gift" size="24" color="#e6a23c"></u-icon>
				</view>
				<view class="culture-text-wrap">
					<text class="culture-name">节庆佳礼</text>
					<text class="culture-desc">婚嫁、乔迁、过年必备，寓意团圆美满</text>
				</view>
			</view>
		</view>

		<!-- 底部购买栏占位 -->
		<view class="bottom-placeholder" v-if="hasPurchasable"></view>

		<!-- 固定底部购买栏（仅在有可购买商品时显示） -->
		<view class="buy-bar" v-if="hasPurchasable">
			<view class="buy-left">
				<view class="buy-quantity">
					<text class="buy-label">数量</text>
					<u-number-box v-model="quantity" :min="1" :max="99" :button-size="36"
						:input-width="60"></u-number-box>
				</view>
				<view class="buy-total">
					<text class="total-label">合计</text>
					<text class="total-price">¥{{ totalPrice }}</text>
				</view>
			</view>
			<view class="buy-btn-wrap">
				<button class="buy-btn" :disabled="loading"
					@click="handleBuy">{{ loading ? '处理中...' : '立即购买' }}</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				selectedIndex: 0,
				quantity: 1,
				loading: false,
				products: []
			};
		},
		computed: {
			hasPurchasable() {
				return this.products.some(p => p.status === 'active');
			},
			totalPrice() {
				if (this.products.length === 0) return '0.00';
				return (this.products[this.selectedIndex].price * this.quantity).toFixed(2);
			}
		},
		methods: {
			selectProduct(index) {
				this.selectedIndex = index;
				this.quantity = 1;
			},
			previewImage(url) {
				uni.previewImage({
					urls: this.products.map(p => p.image),
					current: url
				});
			},
			async loadProducts() {
				this.loading = true;
				try {
					const res = await this.$api.getProducts();
					if (res && res.list) {
						this.products = res.list.map(p => ({
							id: p.ProductID,
							name: p.Name,
							desc: p.Desc || '',
							price: parseFloat(p.Price),
							unit: p.Unit,
							image: p.Image || '',
							status: p.Status
						}));
					}
				} catch (error) {
					console.log('加载商品失败:', error);
					uni.showToast({
						title: '加载商品失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			},
			async handleBuy() {
				const product = this.products[this.selectedIndex];
				if (product.status !== 'active') {
					uni.showToast({
						title: '该商品暂不可购买',
						icon: 'none'
					});
					return;
				}
				const token = uni.getStorageSync('token');
				if (!token) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					const pages = getCurrentPages();
					const currentPage = pages[pages.length - 1];
					uni.setStorageSync('redirectAfterLogin', '/' + currentPage.route);
					uni.navigateTo({
						url: '/pages/Login/login'
					});
					return;
				}
				this.loading = true;
				try {
					const res = await this.$api.createHongtuanOrder({
						productId: product.id,
						quantity: this.quantity
					});
					uni.showToast({
						title: '下单成功'
					});
					setTimeout(() => {
						uni.navigateTo({
							url: `/pages/pagesB/Order/order?id=${res.data.OrderID}`
						});
					}, 500);
				} catch (error) {
					const msg = error && error.message ? error.message : '';
					if (msg.includes('用户不存在') || msg.includes('重新登录')) {
						uni.showToast({
							title: '登录已过期，请重新登录',
							icon: 'none',
							duration: 3000
						});
						uni.removeStorageSync('token');
						setTimeout(() => {
							const pages = getCurrentPages();
							const currentPage = pages[pages.length - 1];
							uni.setStorageSync('redirectAfterLogin', '/' + currentPage.route);
							uni.navigateTo({
								url: '/pages/Login/login'
							});
						}, 3000);
					} else {
						console.log('购买失败:', error);
					}
				} finally {
					this.loading = false;
				}
			}
		},
		onLoad() {
			this.loadProducts();
		}
	};
</script>

<style scoped>
	.hongtuan-container {
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	/* 标题介绍 */
	.intro-section {
		background-color: #fff;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.intro-title {
		font-size: 40rpx;
		font-weight: bold;
		color: #f56c6c;
		display: block;
		margin-bottom: 8rpx;
	}

	.intro-subtitle {
		font-size: 28rpx;
		color: #999;
		display: block;
		margin-bottom: 20rpx;
	}

	.intro-desc {
		font-size: 28rpx;
		color: #666;
		line-height: 1.8;
		display: block;
	}

	/* 通用 section 标题 */
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 24rpx;
	}

	/* 商品规格 */
	.products-section {
		background-color: #fff;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.product-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.product-card {
		display: flex;
		align-items: center;
		padding: 20rpx;
		border-radius: 16rpx;
		border: 2rpx solid #eee;
		position: relative;
		transition: all 0.2s;
	}

	.product-card.active {
		border-color: #f56c6c;
		background-color: #fff5f5;
	}

	.product-image {
		width: 140rpx;
		height: 140rpx;
		border-radius: 12rpx;
		flex-shrink: 0;
	}

	.product-info {
		flex: 1;
		margin-left: 20rpx;
	}

	.product-name {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 6rpx;
	}

	.product-desc {
		font-size: 24rpx;
		color: #999;
		display: block;
		margin-bottom: 10rpx;
	}

	.product-price-row {
		display: flex;
		align-items: baseline;
	}

	.product-price {
		font-size: 36rpx;
		color: #f56c6c;
		font-weight: bold;
	}

	.product-unit {
		font-size: 24rpx;
		color: #999;
		margin-left: 4rpx;
	}

	.product-check {
		position: absolute;
		top: 10rpx;
		right: 10rpx;
	}

	.display-only-tag {
		display: inline-block;
		font-size: 20rpx;
		color: #e6a23c;
		background-color: #fdf6ec;
		border: 1rpx solid #e6a23c;
		border-radius: 6rpx;
		padding: 2rpx 10rpx;
		margin-top: 6rpx;
	}

	/* 空状态 / 加载中 */
	.empty-section,
	.loading-section {
		background-color: #fff;
		padding: 60rpx 30rpx;
		margin-bottom: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
	}

	.empty-text,
	.loading-text {
		font-size: 26rpx;
		color: #999;
	}

	/* 文化介绍 */
	.culture-section {
		background-color: #fff;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.culture-item {
		display: flex;
		align-items: flex-start;
		margin-bottom: 24rpx;
	}

	.culture-item:last-child {
		margin-bottom: 0;
	}

	.culture-icon-wrap {
		width: 60rpx;
		height: 60rpx;
		background-color: #fdf6ec;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.culture-text-wrap {
		margin-left: 20rpx;
		flex: 1;
	}

	.culture-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 6rpx;
	}

	.culture-desc {
		font-size: 24rpx;
		color: #999;
		line-height: 1.6;
		display: block;
	}

	/* 底部占位 */
	.bottom-placeholder {
		height: 160rpx;
	}

	/* 固定底部购买栏 */
	.buy-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #fff;
		padding: 12rpx 0 12rpx 30rpx;
		padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.08);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.buy-left {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		flex: 1;
		min-width: 0;
	}

	.buy-quantity {
		display: flex;
		align-items: center;
	}

	.buy-label {
		font-size: 24rpx;
		color: #999;
		margin-right: 12rpx;
	}

	.buy-total {
		display: flex;
		align-items: baseline;
	}

	.total-label {
		font-size: 24rpx;
		color: #999;
		margin-right: 8rpx;
	}

	.total-price {
		font-size: 40rpx;
		color: #f56c6c;
		font-weight: bold;
	}

	.buy-btn-wrap {
		flex-shrink: 0;
	}

	.buy-btn {
		height: 96rpx;
		line-height: 96rpx;
		padding: 0 48rpx;
		background: linear-gradient(135deg, #f56c6c, #e63e3e);
		color: #fff;
		font-size: 30rpx;
		font-weight: bold;
		border: none;
		border-radius: 48rpx 0 0 48rpx;
		text-align: center;
		margin: 0;
		box-shadow: 0 4rpx 12rpx rgba(245, 108, 108, 0.3);
	}

	.buy-btn:active {
		opacity: 0.85;
	}

	.buy-btn[disabled] {
		opacity: 0.6;
	}
</style>
