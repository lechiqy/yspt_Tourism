<template>
	<view class="privacy-container">
		<view class="privacy-section">
			<text class="section-title">信息收集与使用</text>
			<text class="section-content">
				为向您提供旅游服务，我们将收集您在使用本平台时主动提供的必要信息，包括但不限于：用户名、密码、手机号、邮箱地址等注册信息，以及您在预订路线、购买商品时提供的出行人数、出行日期等订单信息。以上信息仅用于为您提供对应的旅游服务、订单管理及客户支持。
			</text>
		</view>
		<view class="privacy-section">
			<text class="section-title">信息存储与保护</text>
			<text class="section-content">
				我们采取业内标准的安全措施保护您的个人信息，包括SSL加密传输、数据加密存储、访问权限控制等。您的个人信息将存储在中国境内的服务器上，我们仅在实现服务目的所必需的时间内保留您的个人信息。
			</text>
		</view>
		<view class="privacy-section">
			<text class="section-title">信息共享与披露</text>
			<text class="section-content">
				我们不会将您的个人信息出售给第三方。在以下情况下，我们可能共享您的信息：经您明确同意、为提供您所要求的服务所必需（如向旅行社提供出行信息）、法律法规要求、保护平台合法权益。
			</text>
		</view>
		<view class="privacy-section">
			<text class="section-title">用户权利</text>
			<text class="section-content">
				您有权查询、更正、删除您的个人信息，有权撤回同意，有权注销账户。如需行使上述权利，请通过平台个人中心或联系客服进行操作。我们将在合理时间内响应您的请求。
			</text>
		</view>
		<view class="privacy-section">
			<text class="section-title">服务协议摘要</text>
			<text class="section-content">
				使用本平台服务即表示您同意：遵守相关法律法规；提供真实准确的注册信息；妥善保管账户密码；对账户下所有活动负责。我们保留修改服务协议的权利，修改后的协议一经发布即生效。如您不同意修改内容，应停止使用本平台服务。
			</text>
		</view>
		<view class="privacy-footer">
			<text class="footer-text">更新日期：2026年5月</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {};
	}
};
</script>

<style scoped>
.privacy-container {
	background-color: #f5f5f5;
	min-height: 100vh;
	padding: 30rpx;
}
.privacy-section {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
}
.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 16rpx;
}
.section-content {
	font-size: 28rpx;
	color: #666;
	line-height: 1.8;
	display: block;
}
.privacy-footer {
	text-align: center;
	padding: 30rpx 0 60rpx;
}
.footer-text {
	font-size: 24rpx;
	color: #999;
}
</style>
