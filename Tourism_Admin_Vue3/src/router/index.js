import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/login/login.vue')
    },
    {
        path: '/',
        name: 'Layout',
        redirect: '/home',
        children: [
            {
                path: '/home',
                name: 'Home',
                component: () => import('../views/home/home.vue'),
                meta: { title: '首页' }
            },
            {
                path: '/users',
                name: 'Users',
                component: () => import('../views/users/users.vue'),
                meta: { title: '用户管理' }
            },
            {
                path: '/routes',
                name: 'Routes',
                component: () => import('../views/routes/routes.vue'),
                meta: { title: '线路管理' }
            },
            {
                path: '/orders',
                name: 'Orders',
                component: () => import('../views/orders/orders.vue'),
                meta: { title: '订单管理' }
            },
{
                path: '/spots',
                name: 'Spots',
                component: () => import('../views/spots/spots.vue'),
                meta: { title: '景点管理' }
            },
            {
                path: '/reviews',
                name: 'Reviews',
                component: () => import('../views/reviews/reviews.vue'),
                meta: { title: '评价管理' }
            },
            {
                path: '/admins',
                name: 'Admins',
                component: () => import('../views/admins/admins.vue'),
                meta: { title: '管理员管理' }
            },
            {
                path: '/contents',
                name: 'Contents',
                component: () => import('../views/contents/contents.vue'),
                meta: { title: '分类内容管理' }
            },
            {
                path: '/products',
                name: 'Products',
                component: () => import('../views/products/products.vue'),
                meta: { title: '商品管理' }
            },
            {
                path: '/swipers',
                name: 'Swipers',
                component: () => import('../views/swipers/swipers.vue'),
                meta: { title: '轮播图管理' }
            },
            {
                path: '/activities',
                name: 'Activities',
                component: () => import('../views/activities/activities.vue'),
                meta: { title: '活动管理' }
            },
            {
                path: '/settings',
                name: 'Settings',
                component: () => import('../views/settings/settings.vue'),
                meta: { title: '系统设置' }
            }
        ],
        component: () => import('../views/layout/layout.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('adminToken');
    if (to.path !== '/login' && !token) {
        next('/login');
    } else {
        next();
    }
});

export default router;
