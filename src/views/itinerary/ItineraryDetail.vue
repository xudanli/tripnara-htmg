<template>
  <div class="itinerary-detail" v-if="itinerary">
    <a-page-header :title="itinerary.itineraryData?.title || '行程详情'" @back="handleBack">
      <template #extra>
        <a-space>
          <a-button @click="fetchData" :loading="loading" title="刷新数据">
            <template #icon>
              <ReloadOutlined />
            </template>
            刷新
          </a-button>
          <a-button
            v-if="itinerary.status !== 'published'"
            @click="handlePublish"
            :loading="publishLoading"
          >
            发布
          </a-button>
          <a-button @click="handleClone" :loading="cloneLoading">复制</a-button>
          <a-button type="primary" @click="handleEdit">编辑</a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-row :gutter="16" style="margin-top: 24px">
      <!-- 左侧：基本信息 -->
      <a-col :span="8">
        <a-card title="基本信息" :bordered="false">
          <a-descriptions :column="1" bordered>
            <a-descriptions-item label="标题">
              {{ itinerary.itineraryData?.title || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="目的地">
              {{ itinerary.itineraryData?.destination || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="天数">
              {{ itinerary.itineraryData?.duration || 0 }} 天
            </a-descriptions-item>
            <a-descriptions-item label="预算">
              {{ getBudgetLabel(itinerary.itineraryData?.budget) }}
            </a-descriptions-item>
            <a-descriptions-item label="旅行风格">
              {{ getTravelStyleLabel(itinerary.itineraryData?.travelStyle) }}
            </a-descriptions-item>
            <a-descriptions-item label="偏好" v-if="itinerary.itineraryData?.preferences && itinerary.itineraryData.preferences.length > 0">
              <a-space>
                <a-tag v-for="(pref, index) in itinerary.itineraryData.preferences" :key="index">
                  {{ pref }}
                </a-tag>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="总费用">
              {{ itinerary.itineraryData?.totalCost ? `$${itinerary.itineraryData.totalCost}` : '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="getStatusColor(itinerary.status)">
                {{ getStatusLabel(itinerary.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="语言">
              {{ getLanguageLabel(itinerary.language) }}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ formatDate(itinerary.createdAt) }}
            </a-descriptions-item>
            <a-descriptions-item label="更新时间">
              {{ formatDate(itinerary.updatedAt) }}
            </a-descriptions-item>
          </a-descriptions>

          <a-divider>摘要</a-divider>
          <p>{{ itinerary.itineraryData?.summary || '暂无摘要' }}</p>

          <a-divider v-if="itinerary.itineraryData?.recommendations">推荐信息</a-divider>
          <div v-if="itinerary.itineraryData?.recommendations">
            <div v-if="itinerary.itineraryData.recommendations.accommodation" style="margin-bottom: 12px">
              <strong>住宿推荐：</strong>
              <p style="margin: 4px 0 0 0; color: #666">{{ itinerary.itineraryData.recommendations.accommodation }}</p>
            </div>
            <div v-if="itinerary.itineraryData.recommendations.transportation" style="margin-bottom: 12px">
              <strong>交通推荐：</strong>
              <p style="margin: 4px 0 0 0; color: #666">{{ itinerary.itineraryData.recommendations.transportation }}</p>
            </div>
            <div v-if="itinerary.itineraryData.recommendations.food" style="margin-bottom: 12px">
              <strong>美食推荐：</strong>
              <p style="margin: 4px 0 0 0; color: #666">{{ itinerary.itineraryData.recommendations.food }}</p>
            </div>
            <div v-if="itinerary.itineraryData.recommendations.tips">
              <strong>建议：</strong>
              <p style="margin: 4px 0 0 0; color: #666">{{ itinerary.itineraryData.recommendations.tips }}</p>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 右侧：行程安排 -->
      <a-col :span="16">
        <a-card title="行程安排" :bordered="false">
          <template #extra>
            <a-button type="primary" @click="handleAddDay" v-if="itinerary.status !== 'published'">
              <template #icon>
                <PlusOutlined />
              </template>
              添加行程
            </a-button>
          </template>
          <a-timeline v-if="itinerary.itineraryData?.days && itinerary.itineraryData.days.length > 0">
            <a-timeline-item v-for="day in itinerary.itineraryData.days" :key="day.day">
              <a-card size="small" :bordered="true">
                <template #title>
                  <div style="display: flex; justify-content: space-between; align-items: center">
                    <div>
                      <strong>第 {{ day.day }} 天</strong>
                      <span v-if="day.date" style="margin-left: 12px; color: #666; font-size: 12px">
                        {{ day.date }}
                      </span>
                    </div>
                    <a-button type="link" size="small" @click="handleEditDay(day)">
                      <template #icon>
                        <EditOutlined />
                      </template>
                      编辑
                    </a-button>
                  </div>
                </template>

                <div v-if="day.timeSlots && day.timeSlots.length > 0" style="margin-top: 12px">
                  <div
                    v-for="(slot, slotIndex) in day.timeSlots"
                    :key="slotIndex"
                    style="margin-bottom: 12px; padding: 12px; background: #f5f5f5; border-radius: 4px; position: relative"
                  >
                    <a-button
                      type="link"
                      size="small"
                      style="position: absolute; top: 8px; right: 8px; z-index: 10"
                      @click="handleEditTimeSlot(day, slotIndex)"
                    >
                      <template #icon>
                        <EditOutlined />
                      </template>
                      编辑
                    </a-button>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding-right: 60px">
                      <div>
                        <strong>{{ slot.title || '未命名活动' }}</strong>
                        <a-tag v-if="slot.type" size="small" style="margin-left: 8px">
                          {{ getTimeSlotTypeLabel(slot.type) }}
                        </a-tag>
                      </div>
                      <span v-if="slot.time" style="color: #666; font-size: 12px; margin-left: 8px">
                        {{ slot.time }}
                      </span>
                    </div>
                    <div v-if="slot.activity" style="color: #666; font-size: 12px; margin-bottom: 8px">
                      {{ slot.activity }}
                    </div>
                    <div style="color: #666; font-size: 12px">
                      <span v-if="slot.duration">时长：{{ slot.duration }} 分钟</span>
                      <span v-if="slot.cost" style="margin-left: 12px">
                        费用：${{ slot.cost }}
                      </span>
                    </div>
                    <div v-if="slot.coordinates" style="margin-top: 8px; color: #666; font-size: 12px">
                      <strong>坐标：</strong>{{ slot.coordinates.lat }}, {{ slot.coordinates.lng }}
                    </div>
                    <p v-if="slot.notes" style="margin-top: 8px; color: #666; font-size: 12px">
                      {{ slot.notes }}
                    </p>
                    <div v-if="slot.details" style="margin-top: 8px; color: #666; font-size: 12px">
                      <div v-if="slot.details.description" style="margin-bottom: 4px">
                        <strong>描述：</strong>{{ slot.details.description }}
                      </div>
                      <div v-if="slot.details.name">
                        <strong>名称：</strong>
                        <span v-if="slot.details.name.chinese">{{ slot.details.name.chinese }}</span>
                        <span v-if="slot.details.name.english" style="margin-left: 8px">
                          ({{ slot.details.name.english }})
                        </span>
                        <span v-if="slot.details.name.local" style="margin-left: 8px; color: #999">
                          [{{ slot.details.name.local }}]
                        </span>
                      </div>
                      <div v-if="slot.details.address?.chinese" style="margin-top: 4px">
                        <strong>地址：</strong>
                        <span>{{ slot.details.address.chinese }}</span>
                        <span v-if="slot.details.address.english" style="margin-left: 8px; color: #999">
                          ({{ slot.details.address.english }})
                        </span>
                      </div>
                      <div v-if="slot.details.transportation" style="margin-top: 4px">
                        <strong>交通：</strong>{{ slot.details.transportation }}
                      </div>
                      <div v-if="slot.details.openingHours" style="margin-top: 4px">
                        <strong>开放时间：</strong>{{ slot.details.openingHours }}
                      </div>
                      <div v-if="slot.details.pricing?.detail" style="margin-top: 4px">
                        <strong>价格：</strong>{{ slot.details.pricing.detail }}
                      </div>
                      <div v-if="slot.details.rating" style="margin-top: 4px">
                        <strong>评分：</strong>{{ slot.details.rating }}/5
                      </div>
                      <div v-if="slot.details.category" style="margin-top: 4px">
                        <strong>类别：</strong>
                        <a-tag size="small">{{ slot.details.category }}</a-tag>
                      </div>
                      <div v-if="slot.details.recommendations" style="margin-top: 8px; padding: 8px; background: #fafafa; border-radius: 4px">
                        <div v-if="slot.details.recommendations.visitTips" style="margin-bottom: 4px">
                          <strong>游览提示：</strong>{{ slot.details.recommendations.visitTips }}
                        </div>
                        <div v-if="slot.details.recommendations.bestTimeToVisit" style="margin-bottom: 4px">
                          <strong>最佳时间：</strong>{{ slot.details.recommendations.bestTimeToVisit }}
                        </div>
                        <div v-if="slot.details.recommendations.nearbyAttractions" style="margin-bottom: 4px">
                          <strong>附近景点：</strong>{{ slot.details.recommendations.nearbyAttractions }}
                        </div>
                        <div v-if="slot.details.recommendations.visitDuration">
                          <strong>建议游览时长：</strong>{{ slot.details.recommendations.visitDuration }} 分钟
                        </div>
                      </div>
                      <div v-if="slot.details.contact?.info" style="margin-top: 4px">
                        <strong>联系方式：</strong>{{ slot.details.contact.info }}
                      </div>
                      <div v-if="slot.details.accessibility" style="margin-top: 4px">
                        <strong>无障碍设施：</strong>{{ slot.details.accessibility }}
                      </div>
                    </div>
                  </div>
                </div>
                <a-empty
                  v-else
                  description="该天暂无安排"
                  :image="false"
                  style="padding: 20px"
                />
              </a-card>
            </a-timeline-item>
          </a-timeline>
          <a-empty
            v-else
            description="暂无行程安排"
            :image="false"
            style="padding: 40px"
          >
            <template #description>
              <div>
                <p>暂无行程安排</p>
                <a-alert
                  v-if="itinerary.itineraryData?.duration && itinerary.itineraryData.duration > 0"
                  message="数据异常"
                  description="行程天数已设置，但未找到行程安排数据。可能是后端未正确保存或返回 days 数据。请检查后端代码或联系管理员。"
                  type="warning"
                  show-icon
                  style="margin-bottom: 16px; margin-top: 16px"
                />
                <a-space>
                  <a-button
                    v-if="itinerary.status !== 'published'"
                    type="primary"
                    @click="handleAddDay"
                  >
                    <template #icon>
                      <PlusOutlined />
                    </template>
                    添加第一天行程
                  </a-button>
                  <a-button @click="fetchData" :loading="loading">
                    <template #icon>
                      <ReloadOutlined />
                    </template>
                    刷新数据
                  </a-button>
                </a-space>
              </div>
            </template>
          </a-empty>
        </a-card>

        <!-- 任务列表 -->
        <a-card
          title="准备任务"
          :bordered="false"
          style="margin-top: 16px"
        >
          <template #extra>
            <a-button
              type="primary"
              @click="handleAddTask"
              v-if="itinerary.status !== 'published'"
            >
              <template #icon>
                <PlusOutlined />
              </template>
              添加任务
            </a-button>
          </template>
          <a-list
            v-if="itinerary.tasks && itinerary.tasks.length > 0"
            :data-source="itinerary.tasks"
            :bordered="false"
          >
            <template #renderItem="{ item, index }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <div style="display: flex; justify-content: space-between; align-items: center">
                      <div style="flex: 1">
                        <a-checkbox
                          v-model:checked="item.completed"
                          :disabled="true"
                          style="margin-right: 8px"
                        />
                        {{ item.title }}
                      </div>
                      <a-space v-if="itinerary.status !== 'published'">
                        <a-button type="link" size="small" @click="handleEditTask(item, index)">
                          <template #icon>
                            <EditOutlined />
                          </template>
                          编辑
                        </a-button>
                        <a-button type="link" size="small" danger @click="handleDeleteTask(index)">
                          <template #icon>
                            <DeleteOutlined />
                          </template>
                          删除
                        </a-button>
                      </a-space>
                    </div>
                  </template>
                  <template #description>
                    <div>
                      <div style="margin-bottom: 8px">
                        <span v-if="item.category" style="margin-right: 8px">
                          <a-tag size="small">{{ item.category }}</a-tag>
                        </span>
                        <span v-if="item.destination" style="margin-right: 8px; color: #666">
                          目的地：{{ item.destination }}
                        </span>
                      </div>
                      <div v-if="item.links && item.links.length > 0" style="margin-top: 8px">
                        <div style="margin-bottom: 4px; color: #666; font-size: 12px">
                          <strong>相关链接：</strong>
                        </div>
                        <a-space wrap>
                          <a
                            v-for="(link, linkIndex) in item.links"
                            :key="linkIndex"
                            :href="link.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="color: #1890ff; text-decoration: none"
                          >
                            <template v-if="link.label">
                              <LinkOutlined style="margin-right: 4px" />
                              {{ link.label }}
                            </template>
                            <template v-else>
                              <LinkOutlined style="margin-right: 4px" />
                              {{ link.url }}
                            </template>
                          </a>
                        </a-space>
                      </div>
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
          <a-empty
            v-else
            description="暂无准备任务"
            :image="false"
            style="padding: 40px"
          >
            <template #description>
              <div>
                <p>暂无准备任务</p>
                <a-button
                  v-if="itinerary.status !== 'published'"
                  type="primary"
                  @click="handleAddTask"
                  style="margin-top: 16px"
                >
                  <template #icon>
                    <PlusOutlined />
                  </template>
                  添加第一个任务
                </a-button>
              </div>
            </template>
          </a-empty>
        </a-card>
      </a-col>
    </a-row>

    <!-- 编辑表单弹窗 -->
    <ItineraryFormModal
      v-model:open="formModalVisible"
      :itinerary="itinerary"
      @success="handleFormSuccess"
    />

    <!-- 编辑某一天的弹窗 -->
    <DayEditModal
      v-model:open="dayModalVisible"
      :day="currentDay"
      @success="handleDaySuccess"
    />

    <!-- 直接编辑时间段弹窗 -->
    <TimeSlotEditModal
      v-model:open="timeSlotModalVisible"
      :time-slot="currentTimeSlot"
      @success="handleTimeSlotSuccess"
    />

    <!-- 编辑任务弹窗 -->
    <TaskEditModal
      v-model:open="taskModalVisible"
      :task="currentTask"
      @success="handleTaskSuccess"
    />
  </div>
  <a-spin v-else :spinning="loading" style="width: 100%; padding: 100px 0">
    <div></div>
  </a-spin>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { EditOutlined, PlusOutlined, ReloadOutlined, LinkOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { getItineraryById, publishItinerary, cloneItinerary, updateItinerary } from '@/api/itinerary'
import type { ItineraryTemplate, Day, TimeSlot, Task } from '@/types/itinerary'
import ItineraryFormModal from './ItineraryFormModal.vue'
import DayEditModal from './DayEditModal.vue'
import TimeSlotEditModal from './TimeSlotEditModal.vue'
import TaskEditModal from './TaskEditModal.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const itinerary = ref<ItineraryTemplate | null>(null)
const formModalVisible = ref(false)
const publishLoading = ref(false)
const cloneLoading = ref(false)
const dayModalVisible = ref(false)
const currentDay = ref<Day | null>(null)
const currentDayIndex = ref<number>(-1)
const timeSlotModalVisible = ref(false)
const currentTimeSlot = ref<TimeSlot | null>(null)
const currentTimeSlotDayIndex = ref<number>(-1)
const currentTimeSlotIndex = ref<number>(-1)
const taskModalVisible = ref(false)
const currentTask = ref<Task | null>(null)
const currentTaskIndex = ref<number>(-1)

const fetchData = async () => {
  const id = route.params.id as string
  if (!id) {
    message.error('模版 ID 不存在')
    router.back()
    return
  }

  loading.value = true
  try {
    // 可以根据需要传递 language 参数
    // 例如：从路由查询参数获取，或者使用默认值
    const language = (route.query.language as string) || undefined
    const data = await getItineraryById(id, language)
    console.log('=== 详情页数据获取 ===')
    console.log('获取到的行程数据:', data)
    console.log('itineraryData:', data?.itineraryData)
    
    // 同时检查 days 和 tasks 数据结构（API 层已经处理，这里做二次验证）
    if (data) {
      console.log('=== 详情页数据结构二次验证 ===')
      console.log('- 顶层 keys:', Object.keys(data))
      console.log('- 是否有顶层 days:', 'days' in data)
      console.log('- 是否有顶层 tasks:', 'tasks' in data)
      console.log('- 是否有 itineraryData.tasks:', 'tasks' in (data.itineraryData || {}))
      
      // 检查 days 数据（如果 API 层没有处理，这里再次处理）
      if ('days' in data && Array.isArray((data as any).days)) {
        const topLevelDays = (data as any).days
        console.warn('⚠️ 发现：days 仍在顶层，API 层可能未处理，正在修复...')
        if (topLevelDays.length > 0) {
          if (!data.itineraryData) {
            data.itineraryData = {} as any
          }
          data.itineraryData.days = topLevelDays
          delete (data as any).days
          console.log('✅ days 已修复')
        }
      }
      
      // 检查 tasks 数据（确保 tasks 在顶层）
      let tasksFound = false
      
      // 1. 检查顶层 tasks
      if ('tasks' in data && Array.isArray((data as any).tasks)) {
        console.log('✅ tasks 在顶层，数量:', (data as any).tasks.length)
        tasksFound = true
      }
      
      // 2. 如果顶层没有，检查 itineraryData 中
      if (!tasksFound && data.itineraryData && 'tasks' in data.itineraryData) {
        const itineraryDataTasks = (data.itineraryData as any).tasks
        if (Array.isArray(itineraryDataTasks)) {
          console.warn('⚠️ tasks 在 itineraryData 中，正在移动到顶层...')
          data.tasks = itineraryDataTasks
          delete (data.itineraryData as any).tasks
          console.log('✅ tasks 已从 itineraryData 移动到顶层')
          tasksFound = true
        }
      }
      
      // 3. 如果都没找到，确保 tasks 字段存在
      if (!tasksFound) {
        console.warn('⚠️ 未找到 tasks 数据，初始化为空数组')
        if (!data.tasks) {
          data.tasks = []
        }
      }
      
      console.log('=== 详情页数据结构二次验证结束 ===')
    }
    
    // 同时验证 days 和 tasks 数据
    console.log('数据验证:')
    console.log('- days 数据:', data?.itineraryData?.days)
    console.log('- days 数量:', data?.itineraryData?.days?.length || 0)
    console.log('- days 是否为数组:', Array.isArray(data?.itineraryData?.days))
    console.log('- tasks 数据:', data?.tasks)
    console.log('- tasks 数量:', data?.tasks?.length || 0)
    console.log('- tasks 是否为数组:', Array.isArray(data?.tasks))
    
    if (data?.itineraryData?.days && data.itineraryData.days.length > 0) {
      console.log('✅ 成功获取到 days 数据')
      console.log('第一个 day:', JSON.stringify(data.itineraryData.days[0], null, 2))
      console.log('第一个 day 的 timeSlots 数量:', data.itineraryData.days[0]?.timeSlots?.length)
    } else {
      console.error('❌ 错误：获取到的数据中没有 days 或 days 为空！')
      console.error('可能的原因：')
      console.error('1. 后端没有保存 days 数据到数据库')
      console.error('2. 后端返回数据时没有包含 days 字段')
      console.error('3. 数据结构不匹配（days 在顶层但为空）')
      
      // 显示用户友好的错误提示
      if (data?.itineraryData?.duration && data.itineraryData.duration > 0) {
        message.error('行程天数已设置，但未找到行程安排数据。请检查后端是否正确保存了 days 数据。', 5)
      }
    }
    
    if (data?.tasks && data.tasks.length > 0) {
      console.log('✅ 成功获取到 tasks 数据')
      console.log('tasks 数量:', data.tasks.length)
      data.tasks.forEach((task, index) => {
        console.log(`任务 ${index + 1}:`, {
          title: task.title,
          category: task.category,
          destination: task.destination,
          completed: task.completed,
          linksCount: task.links?.length || 0,
          links: task.links,
        })
      })
    } else {
      console.warn('⚠️ 警告：没有任务数据或任务数组为空')
      console.warn('可能的原因：')
      console.warn('1. 后端没有保存 tasks 数据到数据库')
      console.warn('2. 后端返回数据时没有包含 tasks 字段')
      console.warn('3. tasks 数组为空（这是正常的，如果没有任务）')
    }
    
    console.log('=== 详情页数据获取结束 ===')
    itinerary.value = data
  } catch (error: any) {
    console.error('获取模版详情失败:', error)
    // 处理不同的错误状态码
    if (error?.statusCode === 404) {
      message.error('行程模版不存在')
    } else if (error?.statusCode === 403) {
      message.error('无权访问此行程模版')
    } else if (error?.statusCode === 401) {
      message.error('未授权，请重新登录')
    } else {
      const errorMsg = error?.message || '获取模版详情失败'
      message.error(errorMsg)
    }
    router.back()
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.push('/itineraries')
}

const handleEdit = () => {
  formModalVisible.value = true
}

const handleFormSuccess = () => {
  formModalVisible.value = false
  fetchData()
}

const handlePublish = async () => {
  if (!itinerary.value) return
  
  // 可选：发布前检查状态（如果已经是已发布状态，提示用户）
  if (itinerary.value.status === 'published') {
    message.info('行程模版已经是已发布状态')
    return
  }
  
  try {
    publishLoading.value = true
    const result = await publishItinerary(itinerary.value.id)
    // 根据接口文档，发布后状态会更新为 published，updatedAt 会自动更新
    message.success('发布成功')
    fetchData() // 刷新数据以获取更新后的状态
  } catch (error: any) {
    console.error('发布失败:', error)
    // 处理不同的错误状态码
    if (error?.statusCode === 404) {
      message.error('行程模版不存在')
    } else if (error?.statusCode === 403) {
      message.error('无权发布此行程模版')
    } else if (error?.statusCode === 401) {
      message.error('未授权，请重新登录')
    } else {
      const errorMsg = error?.message || '发布失败'
      message.error(errorMsg)
    }
  } finally {
    publishLoading.value = false
  }
}

const handleClone = async () => {
  if (!itinerary.value) return
  try {
    cloneLoading.value = true
    const result = await cloneItinerary(itinerary.value.id)
    // 根据接口文档，复制后会生成新的ID，状态自动设置为 draft，标题会自动添加"（副本）"后缀
    // 可以选择跳转到新复制的模版详情页，或者跳转到列表页
    message.success('复制成功')
    // 跳转到新复制的模版详情页
    if (result?.id) {
      router.push(`/itineraries/${result.id}`)
    } else {
      // 如果没有返回新ID，跳转到列表页
      router.push('/itineraries')
    }
  } catch (error: any) {
    console.error('复制失败:', error)
    // 处理不同的错误状态码
    if (error?.statusCode === 404) {
      message.error('行程模版不存在')
    } else if (error?.statusCode === 403) {
      message.error('无权访问此行程模版')
    } else if (error?.statusCode === 401) {
      message.error('未授权，请重新登录')
    } else {
      const errorMsg = error?.message || '复制失败'
      message.error(errorMsg)
    }
  } finally {
    cloneLoading.value = false
  }
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'published':
      return 'green'
    case 'draft':
      return 'orange'
    case 'archived':
      return 'default'
    default:
      return 'default'
  }
}

const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'published':
      return '已发布'
    case 'draft':
      return '草稿'
    case 'archived':
      return '已归档'
    default:
      return '未知'
  }
}

const getBudgetLabel = (budget?: string) => {
  switch (budget) {
    case 'low':
      return '低'
    case 'medium':
      return '中'
    case 'high':
      return '高'
    case 'economy':
      return '经济'
    case 'comfort':
      return '舒适'
    case 'luxury':
      return '奢华'
    default:
      return budget || '-'
  }
}

const getTravelStyleLabel = (style?: string) => {
  switch (style) {
    case 'relaxed':
      return '轻松'
    case 'moderate':
      return '适中'
    case 'active':
      return '活跃'
    case 'adventurous':
      return '冒险'
    case 'intensive':
      return '紧凑'
    default:
      return style || '-'
  }
}

const getLanguageLabel = (language?: string) => {
  switch (language) {
    case 'zh-CN':
      return '简体中文'
    case 'en-US':
      return 'English'
    default:
      return language || '-'
  }
}

const getTimeSlotTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    transport: '交通',
    attraction: '景点',
    meal: '用餐',
    hotel: '住宿',
    shopping: '购物',
    activity: '活动',
  }
  return labels[type] || type
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const handleAddDay = () => {
  // 计算新的天数
  const existingDays = itinerary.value?.itineraryData?.days || []
  const maxDay = existingDays.length > 0 
    ? Math.max(...existingDays.map(d => d.day))
    : 0
  const newDay: Day = {
    day: maxDay + 1,
    date: undefined,
    timeSlots: [],
  }
  currentDayIndex.value = -1
  currentDay.value = newDay
  dayModalVisible.value = true
}

const handleEditDay = (day: Day) => {
  const dayIndex = itinerary.value?.itineraryData?.days?.findIndex((d) => d.day === day.day) ?? -1
  currentDayIndex.value = dayIndex
  currentDay.value = { ...day }
  dayModalVisible.value = true
}

const handleEditTimeSlot = (day: Day, slotIndex: number) => {
  // 直接打开时间段编辑弹窗
  const dayIndex = itinerary.value?.itineraryData?.days?.findIndex((d) => d.day === day.day) ?? -1
  currentTimeSlotDayIndex.value = dayIndex
  currentTimeSlotIndex.value = slotIndex
  currentTimeSlot.value = day.timeSlots?.[slotIndex] ? { ...day.timeSlots[slotIndex] } : null
  timeSlotModalVisible.value = true
}

const handleDaySuccess = async (updatedDay: Day) => {
  if (!itinerary.value) return

  try {
    loading.value = true
    
    // 更新本地的days数组
    const days = [...(itinerary.value.itineraryData?.days || [])]
    
    if (currentDayIndex.value >= 0) {
      // 编辑模式：更新现有天数
      days[currentDayIndex.value] = updatedDay
    } else {
      // 新建模式：添加新天数
      days.push(updatedDay)
      // 按天数排序
      days.sort((a, b) => a.day - b.day)
    }

    // 调用API更新行程
    await updateItinerary(itinerary.value.id, {
      days,
    })

    message.success(currentDayIndex.value >= 0 ? '更新成功' : '添加成功')
    dayModalVisible.value = false
    fetchData() // 刷新数据
  } catch (error: any) {
    console.error('更新失败:', error)
    if (error?.statusCode === 404) {
      message.error('行程模版不存在')
    } else if (error?.statusCode === 403) {
      message.error('无权修改此行程模版')
    } else if (error?.statusCode === 400) {
      const errorMsg = error?.message || '参数验证失败'
      message.error(errorMsg)
    } else {
      const errorMsg = error?.message || error?.response?.data?.message || '更新失败'
      message.error(errorMsg)
    }
  } finally {
    loading.value = false
  }
}

const handleTimeSlotSuccess = async (updatedTimeSlot: TimeSlot) => {
  if (!itinerary.value || currentTimeSlotDayIndex.value < 0 || currentTimeSlotIndex.value < 0) {
    console.error('更新失败：缺少必要参数', {
      hasItinerary: !!itinerary.value,
      dayIndex: currentTimeSlotDayIndex.value,
      slotIndex: currentTimeSlotIndex.value,
    })
    return
  }

  try {
    loading.value = true
    
    console.log('=== 更新时间段开始 ===')
    console.log('当前行程 ID:', itinerary.value.id)
    console.log('要更新的时间段:', updatedTimeSlot)
    console.log('Day 索引:', currentTimeSlotDayIndex.value)
    console.log('TimeSlot 索引:', currentTimeSlotIndex.value)
    
    // 深拷贝 days 数组，确保不会影响原始数据
    const days = JSON.parse(JSON.stringify(itinerary.value.itineraryData?.days || []))
    const day = days[currentTimeSlotDayIndex.value]
    
    if (!day) {
      console.error('更新失败：找不到对应的 day')
      message.error('更新失败：找不到对应的行程天数')
      return
    }
    
    // 确保 timeSlots 数组存在
    if (!day.timeSlots) {
      day.timeSlots = []
    }
    
    // 深拷贝 timeSlots 数组
    day.timeSlots = JSON.parse(JSON.stringify(day.timeSlots))
    
    // 更新时间段
    if (currentTimeSlotIndex.value >= 0 && currentTimeSlotIndex.value < day.timeSlots.length) {
      // 编辑模式：更新现有时间段
      day.timeSlots[currentTimeSlotIndex.value] = JSON.parse(JSON.stringify(updatedTimeSlot))
      console.log('✅ 更新现有时间段，索引:', currentTimeSlotIndex.value)
    } else {
      // 新建模式：添加新时间段
      day.timeSlots.push(JSON.parse(JSON.stringify(updatedTimeSlot)))
      console.log('✅ 添加新时间段')
    }
    
    // 按时间排序
    day.timeSlots.sort((a, b) => {
      if (!a.time || !b.time) return 0
      return a.time.localeCompare(b.time)
    })
    
    console.log('更新后的 days 数据:', JSON.stringify(days, null, 2))
    console.log('更新后的 day.timeSlots 数量:', day.timeSlots.length)
    
    // 调用API更新行程
    console.log('调用 API 更新...')
    const result = await updateItinerary(itinerary.value.id, {
      days,
    })
    
    console.log('API 更新成功，返回结果:', result)
    console.log('=== 更新时间段结束 ===')
    
    message.success('更新成功')
    timeSlotModalVisible.value = false
    
    // 刷新数据
    await fetchData()
  } catch (error: any) {
    console.error('❌ 更新失败:', error)
    console.error('错误详情:', {
      message: error?.message,
      statusCode: error?.statusCode,
      response: error?.response,
    })
    
    if (error?.statusCode === 404) {
      message.error('行程模版不存在')
    } else if (error?.statusCode === 403) {
      message.error('无权修改此行程模版')
    } else if (error?.statusCode === 400) {
      const errorMsg = error?.message || '参数验证失败'
      message.error(errorMsg)
    } else {
      const errorMsg = error?.message || error?.response?.data?.message || '更新失败'
      message.error(errorMsg)
    }
  } finally {
    loading.value = false
  }
}

const handleAddTask = () => {
  currentTaskIndex.value = -1
  currentTask.value = null
  taskModalVisible.value = true
}

const handleEditTask = (task: Task, index: number) => {
  currentTaskIndex.value = index
  currentTask.value = { ...task }
  taskModalVisible.value = true
}

const handleDeleteTask = async (index: number) => {
  if (!itinerary.value) return

  try {
    loading.value = true
    
    // 深拷贝 tasks 数组
    const tasks = JSON.parse(JSON.stringify(itinerary.value.tasks || []))
    tasks.splice(index, 1)

    // 调用API更新行程
    await updateItinerary(itinerary.value.id, {
      tasks,
    })

    message.success('删除成功')
    await fetchData() // 刷新数据
  } catch (error: any) {
    console.error('删除失败:', error)
    if (error?.statusCode === 404) {
      message.error('行程模版不存在')
    } else if (error?.statusCode === 403) {
      message.error('无权修改此行程模版')
    } else if (error?.statusCode === 400) {
      const errorMsg = error?.message || '参数验证失败'
      message.error(errorMsg)
    } else {
      const errorMsg = error?.message || error?.response?.data?.message || '删除失败'
      message.error(errorMsg)
    }
  } finally {
    loading.value = false
  }
}

const handleTaskSuccess = async (updatedTask: Task) => {
  if (!itinerary.value) return

  try {
    loading.value = true
    
    // 深拷贝 tasks 数组
    const tasks = JSON.parse(JSON.stringify(itinerary.value.tasks || []))
    
    if (currentTaskIndex.value >= 0) {
      // 编辑模式：更新现有任务
      tasks[currentTaskIndex.value] = JSON.parse(JSON.stringify(updatedTask))
    } else {
      // 新建模式：添加新任务
      tasks.push(JSON.parse(JSON.stringify(updatedTask)))
    }

    // 调用API更新行程
    await updateItinerary(itinerary.value.id, {
      tasks,
    })

    message.success(currentTaskIndex.value >= 0 ? '更新成功' : '添加成功')
    taskModalVisible.value = false
    await fetchData() // 刷新数据
  } catch (error: any) {
    console.error('保存失败:', error)
    if (error?.statusCode === 404) {
      message.error('行程模版不存在')
    } else if (error?.statusCode === 403) {
      message.error('无权修改此行程模版')
    } else if (error?.statusCode === 400) {
      const errorMsg = error?.message || '参数验证失败'
      message.error(errorMsg)
    } else {
      const errorMsg = error?.message || error?.response?.data?.message || '保存失败'
      message.error(errorMsg)
    }
  } finally {
    loading.value = false
  }
}

// 监听路由变化，重新获取数据
watch(
  () => route.params.id,
  () => {
    if (route.params.id) {
      fetchData()
    }
  }
)

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.itinerary-detail {
  padding: 24px;
}
</style>

