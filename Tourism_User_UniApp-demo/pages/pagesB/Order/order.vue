<template>
    <view class="order-container">
        <view class="order-card">
            <view class="order-header">
                <text class="order-no">订单编号：{{ orderDetail.OrderNo }}</text>
                <u-tag :text="statusText" :type="statusType"></u-tag>
            </view>
            <view class="order-body">
                <view class="order-row">
                    <text class="label">商品名称</text>
                    <text class="value">{{ productName }}</text>
                </view>
                <view class="order-row">
                    <text class="label">{{ orderDetail.OrderType === 'hongtuan' ? '下单日期' : '出行日期' }}</text>
                    <text class="value">{{ orderDetail.TravelDate }}</text>
                </view>
                <view class="order-row">
                    <text class="label">{{ orderDetail.OrderType === 'hongtuan' ? '购买数量' : '出行人数' }}</text>
                    <text class="value">{{ orderDetail.OrderType === 'hongtuan' ? orderDetail.Travelers + '份' : orderDetail.Travelers + '人' }}</text>
                </view>
                <view class="order-row">
                    <text class="label">总金额</text>
                    <text class="value price">¥{{ orderDetail.TotalPrice }}</text>
                </view>
            </view>
            <view class="qr-section" v-if="orderDetail.Status === 'processing'">
                <view class="qr-title">
                    <text class="title-text">订单二维码</text>
                    <text class="title-desc">凭此二维码检票使用</text>
                </view>
                <view class="qr-container">
                    <canvas canvas-id="qrcode" id="qrcode" class="qr-canvas"></canvas>
                    <image v-if="qrCodeData" :src="qrCodeData" class="qr-image" mode="widthFix"></image>
                </view>
                <view class="qr-info">
                    <text class="qr-text">订单号：{{ orderDetail.OrderNo }}</text>
                </view>
            </view>
            <view class="order-footer">
                <u-button v-if="orderDetail.Status === 'pending'" type="primary" size="medium" :loading="paying" @click="handlePay">立即支付</u-button>
                <u-button v-if="orderDetail.Status === 'pending'" type="default" size="medium" @click="handleCancel">取消订单</u-button>
                <u-button v-if="orderDetail.Status === 'completed'" type="primary" size="medium" @click="toReview">去评价</u-button>
            </view>
        </view>
    </view>
</template>

<script>
import UQRCode from 'uqrcodejs';

export default {
    data() {
        return {
            orderId: null,
            orderDetail: { route: {} },
            qrCodeData: '',
            paying: false,
            statusMap: {
                pending: { text: '待支付', type: 'warning' },
                paid: { text: '已支付', type: 'primary' },
                processing: { text: '待使用', type: 'success' },
                completed: { text: '已完成', type: 'info' },
                cancelled: { text: '已取消', type: 'danger' }
            }
        };
    },
    computed: {
        productName() {
            if (this.orderDetail.OrderType === 'hongtuan' && this.orderDetail.ProductName) {
                return this.orderDetail.ProductName;
            }
            return this.orderDetail.route ? this.orderDetail.route.RouteName : '';
        },
        statusText() {
            return (this.statusMap[this.orderDetail.Status] || {}).text || '';
        },
        statusType() {
            return (this.statusMap[this.orderDetail.Status] || {}).type || 'default';
        }
    },
    onLoad(options) {
        if (options.id) {
            this.orderId = options.id;
            this.loadData(options.id);
        }
    },
    methods: {
        async loadData(id) {
            if (!id) return;
            try {
                const res = await this.$api.getOrderDetail(id);
                this.orderDetail = res;
                if (res.Status === 'processing') {
                    this.$nextTick(() => {
                        this.generateQRCode(res.OrderNo);
                    });
                }
            } catch (error) {
                console.log('加载订单失败:', error);
            }
        },
        generateQRCode(text) {
            const qr = new UQRCode();
            qr.data = text;
            qr.size = 200;
            qr.margin = 10;
            qr.make();

            const canvasContext = uni.createCanvasContext('qrcode', this);
            qr.canvasContext = canvasContext;
            qr.drawCanvas().then(() => {
                setTimeout(() => {
                    uni.canvasToTempFilePath({
                        canvasId: 'qrcode',
                        width: 200,
                        height: 200,
                        success: (res) => {
                            this.qrCodeData = res.tempFilePath;
                        },
                        fail: (err) => {
                            console.log('导出二维码失败:', err);
                        }
                    }, this);
                }, 300);
            }).catch(err => {
                console.log('生成二维码失败:', err);
            });
        },
        async handlePay() {
            try {
                uni.showLoading({ title: '模拟支付处理中...', mask: true });
                await new Promise(resolve => setTimeout(resolve, 3000));
                uni.hideLoading();
                await this.$api.payOrder(this.orderDetail.OrderID, { PaymentMethod: 'alipay' });
                uni.showToast({ title: '支付成功' });
                this.loadData(this.orderId);
            } catch (error) {
                uni.hideLoading();
                console.log('支付失败:', error);
                uni.showToast({ title: (error && error.message) || '支付失败', icon: 'none' });
                this.loadData(this.orderId);
            }
        },
        handleCancel() {
            uni.showModal({
                title: '提示',
                content: '确定取消该订单吗？',
                success: async (res) => {
                    if (res.confirm) {
                        try {
                            await this.$api.cancelOrder(this.orderDetail.OrderID);
                            uni.showToast({ title: '订单已取消' });
                            this.loadData(this.orderId);
                        } catch (error) {
                            console.log('取消失败:', error);
                        }
                    }
                }
            });
        },
        toReview() {
            uni.navigateTo({
                url: `/pages/pagesB/Review/review?orderId=${this.orderDetail.OrderID}&routeId=${this.orderDetail.RouteID}`
            });
        }
    }
};
</script>

<style scoped>
.order-container {
    padding: 30rpx;
    background-color: #f5f5f5;
    min-height: 100vh;
}
.order-card {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
}
.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    padding-bottom: 20rpx;
    border-bottom: 1px solid #f5f5f5;
}
.order-no {
    font-size: 24rpx;
    color: #999;
}
.order-body {
    margin-bottom: 30rpx;
}
.order-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
}
.label {
    font-size: 28rpx;
    color: #666;
}
.value {
    font-size: 28rpx;
    color: #333;
}
.price {
    color: #f56c6c;
    font-weight: bold;
    font-size: 36rpx;
}
.order-footer {
    display: flex;
    justify-content: flex-end;
    gap: 20rpx;
}

.qr-section {
    margin: 30rpx 0;
    padding: 30rpx;
    background-color: #fafafa;
    border-radius: 16rpx;
    text-align: center;
}
.qr-title {
    margin-bottom: 20rpx;
}
.title-text {
    display: block;
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 8rpx;
}
.title-desc {
    display: block;
    font-size: 24rpx;
    color: #999;
}
.qr-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20rpx;
    position: relative;
}
.qr-canvas {
    position: absolute;
    left: -9999rpx;
    width: 200px;
    height: 200px;
}
.qr-image {
    width: 300rpx;
    height: 300rpx;
    background-color: #ffffff;
    border-radius: 16rpx;
}
.qr-info {
    padding-top: 20rpx;
    border-top: 1px dashed #e5e5e5;
}
.qr-text {
    font-size: 24rpx;
    color: #666;
}
</style>
