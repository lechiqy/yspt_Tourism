import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import uView from 'uview-ui'
import api from './config/request'
import shareMixin from './mixins/share.js'

Vue.use(uView)
Vue.prototype.$api = api
Vue.config.productionTip = false

// 全局注册分享混入
Vue.mixin(shareMixin)

App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
    const app = createSSRApp(App)
    return {
        app
    }
}
// #endif
