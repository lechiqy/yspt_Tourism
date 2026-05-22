<template>
    <view class="webview-container">
        <web-view :src="url" @message="handleMessage"></web-view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            url: ''
        };
    },
    onLoad(options) {
        if (options.url) {
            this.url = decodeURIComponent(options.url);
        } else {
            uni.showToast({ title: '链接无效', icon: 'none' });
            setTimeout(() => uni.navigateBack(), 1000);
        }
    },
    methods: {
        handleMessage(e) {
            console.log('webview message:', e.detail);
        }
    }
};
</script>

<style scoped>
.webview-container {
    width: 100%;
    height: 100vh;
}
</style>
