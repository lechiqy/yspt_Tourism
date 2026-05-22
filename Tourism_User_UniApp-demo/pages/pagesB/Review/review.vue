<template>
    <view class="review-container">
        <view class="review-box">
            <view class="review-header">
                <text class="review-title">线路评价</text>
            </view>
            <view class="rating-section">
                <text class="rating-label">评分</text>
                <u-rate v-model="rating" count="5" activeColor="#f7b731"></u-rate>
            </view>
            <view class="content-section">
                <u-textarea v-model="content" placeholder="请输入您的评价内容..." count></u-textarea>
            </view>
            <u-button type="primary" size="large" :loading="loading" @click="handleSubmit">提交评价</u-button>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            rating: 5,
            content: '',
            loading: false,
            params: {}
        };
    },
    onLoad(options) {
        this.params = options || {};
    },
    methods: {
        async handleSubmit() {
            if (!this.content.trim()) {
                uni.showToast({ title: '请输入评价内容', icon: 'none' });
                return;
            }
            this.loading = true;
            try {
                const params = this.params;
                await this.$api.addReview({
                    OrderID: params.orderId,
                    RouteID: params.routeId,
                    Rating: this.rating,
                    Content: this.content
                });
                uni.showToast({ title: '评价成功' });
                setTimeout(() => {
                    uni.navigateBack();
                }, 500);
            } catch (error) {
                console.log('提交评价失败:', error);
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped>
.review-container {
    padding: 30rpx;
    background-color: #f5f5f5;
    min-height: 100vh;
}
.review-box {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 40rpx;
}
.review-header {
    margin-bottom: 40rpx;
}
.review-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
}
.rating-section {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
}
.rating-label {
    font-size: 28rpx;
    color: #333;
    margin-right: 30rpx;
}
.content-section {
    margin-bottom: 40rpx;
}
</style>
