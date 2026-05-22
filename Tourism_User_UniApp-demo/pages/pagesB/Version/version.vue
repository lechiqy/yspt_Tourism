<template>
		<view class="version-container">
			<view class="version-header">
				<view class="app-logo">
					<u-icon name="map" size="60" color="#667eea"></u-icon>
				</view>
				<text class="app-name">莆韵红团</text>
				<text class="version-num">当前版本 1.0.5</text>
			</view>

			<view class="version-content">
				<view class="section">
					<text class="section-title">版本更新日志</text>
					<view class="update-list">
						<view class="update-item">
							<view class="update-header">
								<text class="update-version">v1.0.5</text>
								<text class="update-date">2026-05-22</text>
							</view>
							<view class="update-desc">
								<text>1. 新增分享功能，支持转发给朋友</text>
								<text>2. 新增分享到朋友圈功能</text>
								<text>3. 优化全局分享配置</text>
							</view>
						</view>
						<view class="update-item">
							<view class="update-header">
								<text class="update-version">v1.0.4</text>
								<text class="update-date">2026-05-22</text>
							</view>
							<view class="update-desc">
								<text>1. 新增首页轮播图动态管理功能</text>
								<text>2. 新增版本信息页面</text>
								<text>3. 新增热门活动在线报名功能</text>
								<text>4. 优化活动列表返回刷新逻辑</text>
								<text>5. 修复已知问题，提升用户体验</text>
							</view>
						</view>
						<view class="update-item">
							<view class="update-header">
								<text class="update-version">v1.0.3</text>
								<text class="update-date">2026-05-21</text>
							</view>
							<view class="update-desc">
								<text>1. 新增莆韵红团、莆韵红迹功能模块</text>
								<text>2. 优化搜索功能</text>
								<text>3. 修复部分页面显示问题</text>
							</view>
						</view>
						<view class="update-item">
							<view class="update-header">
								<text class="update-version">v1.0.2</text>
								<text class="update-date">2026-05-20</text>
							</view>
							<view class="update-desc">
								<text>1. 新增分类内容浏览功能</text>
								<text>2. 优化订单流程</text>
								<text>3. 提升应用稳定性</text>
							</view>
						</view>
						<view class="update-item">
							<view class="update-header">
								<text class="update-version">v1.0.1</text>
								<text class="update-date">2026-05-19</text>
							</view>
							<view class="update-desc">
								<text>1. 新增线路浏览与预订功能</text>
								<text>2. 新增用户中心模块</text>
								<text>3. 完善基础功能</text>
							</view>
						</view>
						<view class="update-item">
							<view class="update-header">
								<text class="update-version">v1.0.0</text>
								<text class="update-date">2026-05-18</text>
							</view>
							<view class="update-desc">
								<text>1. 莆韵红团小程序首次发布</text>
								<text>2. 支持用户注册登录</text>
								<text>3. 支持线路浏览与搜索</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="version-footer">
				<text class="copyright">Copyright 2026 莆韵红团</text>
			</view>
		</view>
	</template>

	<script>
		export default {
			data() {
				return {};
			},
			methods: {}
		};
	</script>

	<style scoped>
		.version-container {
			min-height: 100vh;
			background-color: #f5f5f5;
		}

		.version-header {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 60rpx 0 40rpx;
			background-color: #fff;
		}

		.app-logo {
			width: 120rpx;
			height: 120rpx;
			margin-bottom: 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #f0f2ff;
			border-radius: 24rpx;
		}

		.app-name {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 10rpx;
		}

		.version-num {
			font-size: 26rpx;
			color: #999;
		}

		.version-content {
			padding: 20rpx;
		}

		.section {
			background-color: #fff;
			border-radius: 16rpx;
			padding: 30rpx;
		}

		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 30rpx;
			display: block;
		}

		.update-list {
			display: flex;
			flex-direction: column;
			gap: 30rpx;
		}

		.update-item {
			padding-bottom: 30rpx;
			border-bottom: 1rpx solid #f0f0f0;
		}

		.update-item:last-child {
			padding-bottom: 0;
			border-bottom: none;
		}

		.update-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 16rpx;
		}

		.update-version {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
		}

		.update-date {
			font-size: 24rpx;
			color: #999;
		}

		.update-desc {
			display: flex;
			flex-direction: column;
			gap: 10rpx;
		}

		.update-desc text {
			font-size: 26rpx;
			color: #666;
			line-height: 1.6;
		}

		.version-footer {
			text-align: center;
			padding: 40rpx 0;
		}

		.copyright {
			font-size: 24rpx;
			color: #999;
			display: block;
		}
	</style>
