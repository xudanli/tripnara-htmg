import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { isAuthenticated } from '@/utils/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘' },
      },
      {
        path: '/visa',
        name: 'VisaManagement',
        component: () => import('@/views/visa/PolicyList.vue'),
        meta: { title: '签证管理' },
      },
      {
        path: '/itineraries',
        name: 'ItineraryManagement',
        component: () => import('@/views/itinerary/ItineraryList.vue'),
        meta: { title: '行程模版管理' },
      },
      {
        path: '/itineraries/:id',
        name: 'ItineraryDetail',
        component: () => import('@/views/itinerary/ItineraryDetail.vue'),
        meta: { title: '行程模版详情' },
      },
      {
        path: '/alerts',
        name: 'AlertManagement',
        component: () => import('@/views/alert/AlertList.vue'),
        meta: { title: '旅行安全提示' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated()) {
    next('/')
  } else {
    next()
  }
})

export default router

