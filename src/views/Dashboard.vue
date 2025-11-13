<template>
  <div class="dashboard">
    <a-page-header title="仪表盘" />
    <a-row :gutter="16" style="margin-top: 24px">
      <a-col :span="24">
        <a-card>
          <h3>欢迎使用 TripNara 旅行规划后台管理系统</h3>
          <p>这是一个多模块的后台管理系统，目前包含以下功能模块：</p>
          <a-list :data-source="modules" style="margin-top: 16px">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <router-link :to="item.path">{{ item.name }}</router-link>
                  </template>
                  <template #description>
                    {{ item.description }}
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const modules = ref([
  {
    name: '签证管理',
    path: '/visa',
    description: '管理签证政策信息，包括创建、编辑、删除和查看变更历史',
  },
  {
    name: '行程模版',
    path: '/templates',
    description: '管理旅行行程模版，包括创建、编辑、删除和查看详情',
  },
])
</script>

<style scoped>
.dashboard {
  width: 100%;
}
</style>

