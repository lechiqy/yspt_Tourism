import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建axios实例
const service = axios.create({
    baseURL: 'https://yspt-api.lechiqy.com',
    timeout: 10000
});

// 请求拦截器
service.interceptors.request.use(
    config => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('发送请求:', config.url, config.data || config.params || '');
        return config;
    },
    error => {
        console.log('请求错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    response => {
        console.log('响应数据:', response.data);
        return response.data;
    },
    error => {
        console.log('响应错误:', error);
        if (error.response) {
            if (error.response.status === 401) {
                ElMessage.error('登录已过期，请重新登录');
                localStorage.removeItem('adminToken');
                window.location.href = '/login';
            } else {
                ElMessage.error(error.response.data.message || '请求失败');
            }
        } else {
            ElMessage.error('网络错误');
        }
        return Promise.reject(error);
    }
);

export default service;

// 登录接口
export const login = (data) => service.post('/login/admin', data);

// 用户接口
export const getUserList = (params) => service.get('/users/list', { params });

// 线路接口
export const getRouteList = (params) => service.get('/routes/admin/list', { params });
export const getRouteDetail = (id) => service.get(`/routes/detail/${id}`);
export const addRoute = (data) => service.post('/routes/add', data);
export const updateRoute = (id, data) => service.put(`/routes/update/${id}`, data);
export const updateRouteStatus = (id, data) => service.put(`/routes/status/${id}`, data);
export const deleteRoute = (id) => service.delete(`/routes/delete/${id}`);

// 订单接口
export const getOrderList = (params) => service.get('/orders/admin/list', { params });
export const getOrderDetail = (id) => service.get(`/orders/detail/${id}`);
export const reviewOrder = (id) => service.put(`/orders/review/${id}`);

// 景点接口
export const getSpotList = (params) => service.get('/spots/list', { params });
export const addSpot = (data) => service.post('/spots/add', data);
export const updateSpot = (id, data) => service.put(`/spots/update/${id}`, data);
export const deleteSpot = (id) => service.delete(`/spots/delete/${id}`);

// 首页统计
export const getDashboardStats = () => service.get('/dashboard/stats');

// 管理员接口
export const getAdminInfo = () => service.get('/admins/info');
export const getAdminList = (params) => service.get('/admins/list', { params });
export const addAdmin = (data) => service.post('/admins/add', data);
export const updateAdmin = (id, data) => service.put(`/admins/update/${id}`, data);
export const deleteAdmin = (id) => service.delete(`/admins/delete/${id}`);

// 分类内容接口
export const getContentsList = (params) => service.get('/contents/admin/list', { params });
export const addContent = (data) => service.post('/contents/add', data);
export const updateContent = (id, data) => service.put(`/contents/update/${id}`, data);
export const deleteContent = (id) => service.delete(`/contents/delete/${id}`);

// 商品接口
export const getProductList = (params) => service.get('/products/admin/list', { params });
export const addProduct = (data) => service.post('/products/add', data);
export const updateProduct = (id, data) => service.put(`/products/update/${id}`, data);
export const deleteProduct = (id) => service.delete(`/products/delete/${id}`);

// 轮播图接口
export const getSwiperList = () => service.get('/swipers/admin/list');
export const addSwiper = (data) => service.post('/swipers/add', data);
export const updateSwiper = (id, data) => service.put(`/swipers/update/${id}`, data);
export const deleteSwiper = (id) => service.delete(`/swipers/delete/${id}`);

// 活动接口
export const getActivityList = (params) => service.get('/activities/admin/list', { params });
export const getActivityDetail = (id) => service.get(`/activities/detail/${id}`);
export const addActivity = (data) => service.post('/activities/add', data);
export const updateActivity = (id, data) => service.put(`/activities/update/${id}`, data);
export const deleteActivity = (id) => service.delete(`/activities/delete/${id}`);

// 设置接口
export const getSettingsList = () => service.get('/settings/admin/list');
export const updateSettings = (data) => service.put('/settings/admin/update', data);
export const initSettings = () => service.post('/settings/admin/init');
