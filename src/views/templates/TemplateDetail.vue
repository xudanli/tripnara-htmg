<template>
  <div class="template-detail" v-if="template">
    <a-page-header :title="template.title" @back="handleBack">
      <template #extra>
        <a-space>
          <a-button
            v-if="template.status !== 'published'"
            @click="handlePublish"
            :loading="publishLoading"
          >
            发布
          </a-button>
          <a-button @click="handleClone" :loading="cloneLoading">复制</a-button>
          <a-button type="primary" @click="handleEdit">编辑</a-button>
        </a-space>
      </template>
      <template #tags>
        <a-tag :color="getStatusColor(template.status)">
          {{ getStatusLabel(template.status) }}
        </a-tag>
        <a-tag :color="getModeColor(template.mode)">
          {{ getModeLabel(template.mode) }}
        </a-tag>
      </template>
    </a-page-header>

    <a-row :gutter="24" style="margin-top: 24px">
      <!-- 左侧：基本信息 -->
      <a-col :span="8">
        <a-card title="基本信息" :bordered="false">
          <a-descriptions :column="1" bordered>
            <a-descriptions-item label="封面图">
              <a-image
                v-if="template.coverImage"
                :src="template.coverImage"
                :width="200"
                :preview="true"
              />
              <span v-else style="color: #ccc">无封面</span>
            </a-descriptions-item>
            <a-descriptions-item label="模版名称">{{ template.title }}</a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="getStatusColor(template.status)">
                {{ getStatusLabel(template.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="模式">
              <a-tag :color="getModeColor(template.mode)">
                {{ getModeLabel(template.mode) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="主模式分类">
              {{ template.modePrimary || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="模式标签">
              <a-space v-if="template.modeTags" size="small" wrap>
                <a-tag v-for="tag in getTags(template.modeTags)" :key="tag" size="small">
                  {{ tag }}
                </a-tag>
              </a-space>
              <span v-else>-</span>
            </a-descriptions-item>
            <a-descriptions-item label="推荐天数">
              {{ template.durationDays ? `${template.durationDays} 天` : '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ formatDate(template.createdAt) }}
            </a-descriptions-item>
            <a-descriptions-item label="更新时间">
              {{ formatDate(template.updatedAt) }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card title="模版摘要" :bordered="false" style="margin-top: 16px">
          <p v-if="template.summary">{{ template.summary }}</p>
          <span v-else style="color: #ccc">无摘要</span>
        </a-card>

        <a-card title="模版描述" :bordered="false" style="margin-top: 16px">
          <p v-if="template.description">{{ template.description }}</p>
          <span v-else style="color: #ccc">无描述</span>
        </a-card>

        <a-card title="核心洞察" :bordered="false" style="margin-top: 16px">
          <p v-if="template.coreInsight">{{ template.coreInsight }}</p>
          <span v-else style="color: #ccc">无核心洞察</span>
        </a-card>
      </a-col>

      <!-- 右侧：行程安排 -->
      <a-col :span="16">
        <a-card title="行程安排" :bordered="false">
          <a-empty v-if="!template.days || template.days.length === 0" description="暂无行程安排" />
          <a-timeline v-else>
            <a-timeline-item
              v-for="day in template.days"
              :key="day.id"
              :color="getDayColor(day.dayNumber)"
            >
              <a-card
                :title="`第 ${day.dayNumber} 天${day.title ? '：' + day.title : ''}`"
                size="small"
                style="margin-bottom: 16px"
              >
                <template #extra>
                  <a-button type="link" size="small" @click="handleEditDay(day)">编辑</a-button>
                </template>
                <p v-if="day.summary" style="margin-bottom: 12px; color: #666">
                  {{ day.summary }}
                </p>
                <div v-if="day.timeSlots && day.timeSlots.length > 0">
                  <a-divider style="margin: 12px 0" />
                  <div
                    v-for="slot in day.timeSlots"
                    :key="slot.id"
                    style="margin-bottom: 12px; padding: 12px; background: #f5f5f5; border-radius: 4px"
                  >
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
                      <strong>{{ slot.title || '未命名活动' }}</strong>
                      <a-tag v-if="slot.type" size="small">{{ slot.type }}</a-tag>
                    </div>
                    <div style="color: #666; font-size: 12px">
                      <span v-if="slot.startTime">时间：{{ slot.startTime }}</span>
                      <span v-if="slot.durationMinutes" style="margin-left: 12px">
                        时长：{{ slot.durationMinutes }} 分钟
                      </span>
                    </div>
                    <div v-if="slot.locationJson?.name" style="margin-top: 8px; color: #666">
                      <strong>地点：</strong>{{ slot.locationJson.name }}
                      <span v-if="slot.locationJson.address" style="margin-left: 8px; font-size: 12px">
                        ({{ slot.locationJson.address }})
                      </span>
                    </div>
                    <p v-if="slot.scenicIntro" style="margin-top: 8px; color: #666; font-size: 12px">
                      {{ slot.scenicIntro }}
                    </p>
                  </div>
                </div>
                <a-empty
                  v-else
                  description="该天暂无时段安排"
                  :image="false"
                  style="padding: 20px"
                />
              </a-card>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row>

    <!-- 编辑表单弹窗 -->
    <TemplateFormModal
      v-model:open="formModalVisible"
      :template="template"
      @success="handleFormSuccess"
    />

    <!-- 天数编辑弹窗 -->
    <DayEditModal
      v-model:open="dayEditModalVisible"
      :template-id="template?.id || ''"
      :day="currentDay"
      @success="handleDayEditSuccess"
    />
  </div>
  <a-spin v-else :spinning="loading" style="width: 100%; padding: 100px 0">
    <div></div>
  </a-spin>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getTemplateById, publishTemplate, cloneTemplate } from '@/api/template'
import type { Template, TemplateStatus, TemplateMode, TemplateDay } from '@/types/template'
import TemplateFormModal from './TemplateFormModal.vue'
import DayEditModal from './DayEditModal.vue'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const template = ref<Template | null>(null)
const formModalVisible = ref(false)
const dayEditModalVisible = ref(false)
const currentDay = ref<TemplateDay | null>(null)
const publishLoading = ref(false)
const cloneLoading = ref(false)

const fetchData = async () => {
  const id = route.params.id as string
  if (!id) {
    message.error('模版 ID 不存在')
    router.back()
    return
  }

  loading.value = true
  try {
    const data = await getTemplateById(id)
    template.value = data
  } catch (error) {
    message.error('获取模版详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.push('/templates')
}

const handleEdit = () => {
  formModalVisible.value = true
}

const handleFormSuccess = () => {
  formModalVisible.value = false
  fetchData()
}

const handleEditDay = (day: TemplateDay) => {
  currentDay.value = day
  dayEditModalVisible.value = true
}

const handleDayEditSuccess = () => {
  dayEditModalVisible.value = false
  currentDay.value = null
  fetchData()
}

const handlePublish = async () => {
  if (!template.value) return
  publishLoading.value = true
  try {
    const result = await publishTemplate(template.value.id)
    if (result.data) {
      template.value = result.data
    }
    message.success('发布成功')
  } catch (error) {
    message.error('发布失败')
  } finally {
    publishLoading.value = false
  }
}

const handleClone = async () => {
  if (!template.value) return
  cloneLoading.value = true
  try {
    const result = await cloneTemplate(template.value.id)
    if (result.data?.id) {
      message.success('复制成功，正在跳转...')
      router.push(`/templates/${result.data.id}`)
    } else {
      message.success('复制成功')
      fetchData()
    }
  } catch (error) {
    message.error('复制失败')
  } finally {
    cloneLoading.value = false
  }
}

const getStatusLabel = (status: TemplateStatus) => {
  const labels: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档',
  }
  return labels[status] || status
}

const getStatusColor = (status: TemplateStatus) => {
  const colors: Record<string, string> = {
    draft: 'orange',
    published: 'green',
    archived: 'default',
  }
  return colors[status] || 'default'
}

const getModeLabel = (mode: TemplateMode) => {
  const labels: Record<string, string> = {
    inspiration: '灵感',
    planner: '规划',
    seeker: '探索',
  }
  return labels[mode] || mode
}

const getModeColor = (mode: TemplateMode) => {
  const colors: Record<string, string> = {
    inspiration: 'purple',
    planner: 'blue',
    seeker: 'cyan',
  }
  return colors[mode] || 'default'
}

const getTags = (tagsStr: string) => {
  if (!tagsStr) return []
  return tagsStr.split(',').map((tag) => tag.trim()).filter(Boolean)
}

const getDayColor = (dayNumber: number) => {
  const colors = ['blue', 'green', 'red', 'orange', 'purple', 'cyan']
  return colors[(dayNumber - 1) % colors.length]
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.template-detail {
  width: 100%;
}
</style>

