<template>
    <u-tabbar :value="value" @change="handleChange" :border="true" activeColor="#3c9cff" inactiveColor="#7d7e80">
        <u-tabbar-item text="首页" icon="home" name="index"></u-tabbar-item>
        <u-tabbar-item text="线路" icon="map" name="routes"></u-tabbar-item>
        <u-tabbar-item text="订单" icon="order" name="myOrders"></u-tabbar-item>
        <u-tabbar-item text="我的" icon="account" name="user"></u-tabbar-item>
    </u-tabbar>
</template>

<script>
export default {
    props: {
        value: {
            type: String,
            default: ''
        }
    },
    methods: {
        handleChange(name) {
            if (name === this.value) return;
            const pages = {
                index: '/pages/index/index',
                routes: '/pages/pagesA/Routes/routes',
                myOrders: '/pages/pagesB/Order/myOrders',
                user: '/pages/pagesB/User/user'
            };
            uni.reLaunch({ url: pages[name] || pages.index });
        }
    }
};
</script>
