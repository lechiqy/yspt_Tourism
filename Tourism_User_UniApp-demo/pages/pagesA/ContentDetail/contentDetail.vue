<template>
    <view class="detail-container">
        <view v-if="loading" class="loading">
            <u-loading-icon mode="flower" size="40"></u-loading-icon>
            <text class="loading-text">加载中...</text>
        </view>

        <view v-else-if="detail" class="content">
            <!-- 轮播图 -->
            <view class="swiper-section" v-if="images.length > 0">
                <swiper
                    class="swiper"
                    :indicator-dots="images.length > 1"
                    indicator-color="rgba(255,255,255,0.5)"
                    indicator-active-color="#fff"
                    :autoplay="false"
                    :circular="true"
                >
                    <swiper-item v-for="(img, index) in images" :key="index">
                        <image
                            class="swiper-image"
                            :src="img"
                            mode="aspectFill"
                            @click="previewImage(index)"
                        ></image>
                    </swiper-item>
                </swiper>
                <view class="image-count" v-if="images.length > 1">
                    <text>{{ images.length }}张图片</text>
                </view>
            </view>

            <!-- 单图展示（无轮播图时显示封面） -->
            <image
                v-else-if="detail.CoverImage"
                class="cover-image"
                :src="detail.CoverImage"
                mode="aspectFill"
                @click="previewCover"
            ></image>

            <view class="info-section">
                <text class="title">{{ detail.Title }}</text>

                <view class="meta-section" v-if="detail.Address || detail.Phone">
                    <view class="meta-item" v-if="detail.Address" @click="openMap">
                        <u-icon name="map" size="18" color="#3c9cff"></u-icon>
                        <text class="meta-text">{{ detail.Address }}</text>
                    </view>
                    <view class="meta-item" v-if="detail.Phone" @click="callPhone">
                        <u-icon name="phone" size="18" color="#67c23a"></u-icon>
                        <text class="meta-text">{{ detail.Phone }}</text>
                    </view>
                </view>

                <!-- 富文本内容展示 -->
                <view class="rich-content" v-if="richContent.length > 0">
                    <view v-for="(block, index) in richContent" :key="index" class="content-block">
                        <text v-if="block.type === 'text'" class="text-block">{{ block.content }}</text>
                        <image
                            v-else-if="block.type === 'image' && block.url"
                            class="content-image"
                            :src="block.url"
                            mode="widthFix"
                            @click="previewRichImage(block.url)"
                        ></image>
                    </view>
                </view>

                <!-- 描述（无富文本时显示） -->
                <view class="desc-section" v-else-if="detail.Description">
                    <text class="section-title">详细介绍</text>
                    <text class="desc-text">{{ detail.Description }}</text>
                </view>
            </view>
        </view>

        <view v-else class="empty">
            <u-icon name="info-circle" size="60" color="#ccc"></u-icon>
            <text class="empty-text">内容不存在</text>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            id: null,
            category: '',
            detail: null,
            loading: false
        };
    },
    computed: {
        images() {
            if (!this.detail) return [];
            const imgs = this.detail.Images || [];
            return imgs.length > 0 ? imgs : [];
        },
        richContent() {
            if (!this.detail) return [];
            return this.detail.RichContent || [];
        }
    },
    onLoad(options) {
        this.id = options.id;
        this.category = options.category || '';
        this.loadDetail();
    },
    methods: {
        async loadDetail() {
            this.loading = true;
            try {
                const res = await this.$api.getContentDetail(this.id);
                this.detail = res;
                if (res.Title) {
                    uni.setNavigationBarTitle({ title: res.Title });
                }
            } catch (error) {
                console.log('加载详情失败:', error);
                uni.showToast({ title: '加载失败', icon: 'none' });
            } finally {
                this.loading = false;
            }
        },
        previewImage(index) {
            uni.previewImage({
                urls: this.images,
                current: index
            });
        },
        previewCover() {
            if (this.detail.CoverImage) {
                uni.previewImage({
                    urls: [this.detail.CoverImage]
                });
            }
        },
        previewRichImage(url) {
            // 收集所有富文本中的图片
            const richImages = this.richContent
                .filter(block => block.type === 'image' && block.url)
                .map(block => block.url);
            uni.previewImage({
                urls: richImages,
                current: url
            });
        },
        openMap() {
            if (this.detail && this.detail.Address) {
                uni.openLocation({
                    address: this.detail.Address,
                    name: this.detail.Title,
                    latitude: 25.0,
                    longitude: 119.0,
                    fail: () => {
                        uni.showToast({ title: '打开地图失败', icon: 'none' });
                    }
                });
            }
        },
        callPhone() {
            if (this.detail && this.detail.Phone) {
                uni.makePhoneCall({
                    phoneNumber: this.detail.Phone,
                    fail: () => {
                        uni.showToast({ title: '拨打电话失败', icon: 'none' });
                    }
                });
            }
        }
    }
};
</script>

<style scoped>
.detail-container {
    background-color: #f5f5f5;
    min-height: 100vh;
}
.loading {
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

/* 轮播图样式 */
.swiper-section {
    position: relative;
}
.swiper {
    width: 100%;
    height: 500rpx;
}
.swiper-image {
    width: 100%;
    height: 100%;
}
.image-count {
    position: absolute;
    right: 20rpx;
    bottom: 20rpx;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
}
.image-count text {
    font-size: 24rpx;
    color: #fff;
}

/* 单图封面样式 */
.cover-image {
    width: 100%;
    height: 500rpx;
}

.info-section {
    background-color: #fff;
    margin: 20rpx;
    border-radius: 20rpx;
    padding: 30rpx;
}
.title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 24rpx;
}
.meta-section {
    padding-bottom: 24rpx;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 24rpx;
}
.meta-item {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
}
.meta-item:last-child {
    margin-bottom: 0;
}
.meta-text {
    font-size: 28rpx;
    color: #666;
    margin-left: 12rpx;
}

/* 富文本内容样式 */
.rich-content {
    margin-top: 20rpx;
}
.content-block {
    margin-bottom: 30rpx;
}
.content-block:last-child {
    margin-bottom: 0;
}
.text-block {
    font-size: 30rpx;
    color: #333;
    line-height: 1.8;
    display: block;
}
.content-image {
    width: 100%;
    border-radius: 12rpx;
    margin: 20rpx 0;
}

/* 描述样式 */
.section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 16rpx;
}
.desc-text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
    display: block;
}
</style>
