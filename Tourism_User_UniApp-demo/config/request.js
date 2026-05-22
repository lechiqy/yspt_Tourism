// API 基础地址
// 生产环境：https://yspt-api.lechiqy.com
// 开发环境：http://192.168.10.123:3001
const BASE_URL = 'https://yspt-api.lechiqy.com';

function request(config) {
	console.log('=== 发起请求 ===');
	console.log('URL:', BASE_URL + config.url);
	console.log('Method:', config.method || 'GET');
	console.log('Data:', config.data);
	console.log('Token:', uni.getStorageSync('token') || '无');

	return new Promise((resolve, reject) => {
		const requestTask = uni.request({
			url: BASE_URL + config.url,
			method: config.method || 'GET',
			data: config.data || {},
			timeout: 30000,
			header: {
				'content-type': 'application/json',
				'Authorization': 'Bearer ' + (config.token || uni.getStorageSync('token') || '')
			},
			success: (res) => {
				console.log('请求成功:', config.url, res.statusCode, res.data);
				if (res.statusCode >= 200 && res.statusCode < 300) {
					resolve(res.data);
				} else {
					uni.showToast({ title: res.data.message || '请求失败', icon: 'none' });
					reject(res.data);
				}
			},
			fail: (err) => {
				console.log('请求失败详情:', config.url, JSON.stringify(err));
				uni.showToast({
					title: '网络错误: ' + (err.errMsg || '未知错误'),
					icon: 'none'
				});
				reject(err);
			}
		});

		console.log('请求任务已创建:', requestTask ? '成功' : '失败');
	});
}

// 登录注册
const userLogin = (data) => request({ url: '/login/login', method: 'POST', data });
const userRegister = (data) => request({ url: '/login/register', method: 'POST', data });
const wechatLogin = (data) => request({ url: '/login/wechat', method: 'POST', data });

// 线路
const getRoutesList = (params) => request({ url: '/routes/list', method: 'GET', data: params });
const getRouteDetail = (id) => request({ url: `/routes/detail/${id}`, method: 'GET' });
const searchRoutes = (params) => request({ url: '/routes/search', method: 'GET', data: params });

// 订单
const createOrder = (data) => request({ url: '/orders/create', method: 'POST', data });
const payOrder = (id, data) => request({ url: `/orders/pay/${id}`, method: 'POST', data });
const getUserOrders = (params) => request({ url: '/orders/user/list', method: 'GET', data: params });
const getOrderDetail = (id) => request({ url: `/orders/detail/${id}`, method: 'GET' });
const cancelOrder = (id) => request({ url: `/orders/cancel/${id}`, method: 'PUT' });
const refundOrder = (id) => request({ url: `/orders/refund/${id}`, method: 'PUT' });

// 评价
const addReview = (data) => request({ url: '/reviews/add', method: 'POST', data });
const getRouteReviews = (routeId, params) => request({ url: `/reviews/list/${routeId}`, method: 'GET', data: params });

// 分类内容
const getCategoryContents = (params) => request({ url: '/contents/list', method: 'GET', data: params });
const getContentDetail = (id) => request({ url: `/contents/detail/${id}`, method: 'GET' });
const searchContents = (params) => request({ url: '/contents/search', method: 'GET', data: params });

// 红团
const getProducts = () => request({ url: '/hongtuan/products', method: 'GET' });
const createHongtuanOrder = (data) => request({ url: '/hongtuan/order', method: 'POST', data });

// 打卡
const checkinAdd = (data) => request({ url: '/checkins/add', method: 'POST', data });
const checkinList = () => request({ url: '/checkins/list', method: 'GET' });
const checkinStatus = () => request({ url: '/checkins/status', method: 'GET' });

// 轮播图
const getSwiperList = () => request({ url: '/swipers/list', method: 'GET' });

// 活动
const getActivitiesList = (params) => request({ url: '/activities/list', method: 'GET', data: params });
const getActivityDetail = (id) => request({ url: `/activities/detail/${id}`, method: 'GET' });
const joinActivity = (data) => request({ url: '/activities/join', method: 'POST', data });
const checkActivityJoined = (id) => request({ url: `/activities/check-joined/${id}`, method: 'GET' });

// 用户
const getUserInfo = () => request({ url: '/users/info', method: 'GET' });
const updateUserInfo = (data) => request({ url: '/users/update', method: 'PUT', data });
const checkPhone = (phone) => request({ url: '/users/check-phone', method: 'GET', data: { phone } });
const mergeAccount = (targetUserId) => request({ url: '/users/merge', method: 'POST', data: { targetUserId } });

export default {
	userLogin,
	userRegister,
	wechatLogin,
	getRoutesList,
	getRouteDetail,
	searchRoutes,
	createOrder,
	payOrder,
	getUserOrders,
	getOrderDetail,
	cancelOrder,
	refundOrder,
	addReview,
	getRouteReviews,
	getCategoryContents,
	getContentDetail,
	searchContents,
	getUserInfo,
	updateUserInfo,
	checkPhone,
	mergeAccount,
	getProducts,
	createHongtuanOrder,
	checkinAdd,
	checkinList,
	checkinStatus,
	getSwiperList,
	getActivitiesList,
	getActivityDetail,
	joinActivity,
	checkActivityJoined
};
