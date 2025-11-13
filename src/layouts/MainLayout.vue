<template>
  <a-layout class="main-layout">
    <a-layout-sider v-model:collapsed="collapsed" :width="200" theme="light">
      <div class="logo">
        <h2 v-if="!collapsed">TripNara</h2>
        <h2 v-else>T</h2>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        theme="light"
        :items="menuItems"
        @click="handleMenuClick"
      />
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">
        <div class="header-left">
          <menu-unfold-outlined
            v-if="collapsed"
            class="trigger"
            @click="collapsed = !collapsed"
          />
          <menu-fold-outlined v-else class="trigger" @click="collapsed = !collapsed" />
        </div>
        <div class="header-right">
          <span class="username">{{ username }}</span>
          <a-button type="text" @click="handleLogout">退出</a-button>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  GlobalOutlined,
  DashboardOutlined,
} from '@ant-design/icons-vue'
import { logout, getUsername } from '@/utils/auth'
import { message } from 'ant-design-vue'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
const selectedKeys = ref<string[]>([])

const username = computed(() => getUsername() || 'Admin')

const menuItems = [
  {
    key: '/dashboard',
    icon: () => h(DashboardOutlined),
    label: '仪表盘',
    title: '仪表盘',
  },
  {
    key: '/visa',
    icon: () => h(GlobalOutlined),
    label: '签证管理',
    title: '签证管理',
  },
  {
    key: '/templates',
    icon: () => h(FileTextOutlined),
    label: '行程模版',
    title: '行程模版',
  },
]

const handleMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}

const handleLogout = () => {
  logout()
  message.success('已退出登录')
  router.push('/login')
}

onMounted(() => {
  selectedKeys.value = [route.path]
})
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f0f0f0;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
}

.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  color: #666;
}

.content {
  margin: 24px;
  padding: 24px;
  background: #fff;
  min-height: calc(100vh - 112px);
  border-radius: 4px;
}
</style>

