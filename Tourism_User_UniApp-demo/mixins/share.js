/**
 * 全局分享混入
 * 实现转发给朋友、转发到朋友圈功能
 */

export default {
    data() {
        return {
            // 默认分享配置
            shareConfig: {
                title: '莆韵红团',
                path: '/pages/index/index'
                // 不设置imageUrl，微信会自动截取当前页面作为分享图
            }
        }
    },
    // 转发给朋友
    onShareAppMessage(res) {
        // 如果是从按钮触发（页面内有share按钮）
        if (res.from === 'button') {
            console.log('分享来自按钮', res.target)
        }

        // 获取当前页面配置
        let config = this.getShareConfig()

        let shareData = {
            title: config.title,
            path: config.path,
            success(res) {
                uni.showToast({
                    title: '分享成功',
                    icon: 'success'
                })
            },
            fail(err) {
                console.log('分享失败', err)
            }
        }

        // 如果有自定义图片则使用，否则使用页面截图
        if (config.imageUrl) {
            shareData.imageUrl = config.imageUrl
        }

        return shareData
    },
    // 转发到朋友圈
    onShareTimeline() {
        let config = this.getShareConfig()

        let shareData = {
            title: config.title,
            query: config.query || '',
            success(res) {
                uni.showToast({
                    title: '分享成功',
                    icon: 'success'
                })
            },
            fail(err) {
                console.log('分享到朋友圈失败', err)
            }
        }

        // 如果有自定义图片则使用，否则使用页面截图
        if (config.imageUrl) {
            shareData.imageUrl = config.imageUrl
        }

        return shareData
    },
    methods: {
        // 获取分享配置，可在页面中覆盖此方法自定义配置
        getShareConfig() {
            let pages = getCurrentPages()
            let currentPage = pages[pages.length - 1]
            let url = '/' + currentPage.route

            // 默认配置（不设置imageUrl，微信自动截取页面）
            let config = {
                title: '莆韵红团 - 发现莆田之美',
                path: url
            }

            // 合并页面自定义配置
            if (this.shareConfig) {
                config = { ...config, ...this.shareConfig }
            }

            // 如果有参数，添加到path
            if (currentPage.options && Object.keys(currentPage.options).length > 0) {
                let query = Object.keys(currentPage.options)
                    .map(key => `${key}=${currentPage.options[key]}`)
                    .join('&')
                config.path = `${config.path}?${query}`
                config.query = query
            }

            return config
        }
    }
}
