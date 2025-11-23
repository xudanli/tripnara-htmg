<template>
  <a-modal
    v-model:open="modalVisible"
    title="导入行程模版（JSON）"
    :confirm-loading="loading"
    width="700px"
    ok-text="导入"
    cancel-text="取消"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-alert
      type="info"
      show-icon
      message="请粘贴或上传包含完整行程模版结构的 JSON。支持 itineraryData 和 tasks 格式。导入后将创建新的模版。"
      style="margin-bottom: 16px"
    />
    <a-form layout="vertical">
      <a-form-item label="上传 JSON 文件">
        <a-upload
          :before-upload="handleBeforeUpload"
          :show-upload-list="false"
          accept=".json,application/json"
        >
          <a-button>选择文件</a-button>
        </a-upload>
        <span v-if="fileName" class="upload-file-name">{{ fileName }}</span>
      </a-form-item>
      <a-form-item label="JSON 内容">
        <a-textarea
          v-model:value="jsonText"
          :rows="12"
          placeholder="请粘贴 JSON 内容"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { createItinerary } from '@/api/itinerary'
import type { ItineraryFormData } from '@/types/itinerary'

interface Props {
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const modalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const jsonText = ref('')
const fileName = ref('')
const loading = ref(false)

const handleBeforeUpload = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    jsonText.value = e.target?.result?.toString() || ''
    fileName.value = file.name
  }
  reader.readAsText(file)
  return false
}

const sanitizePayload = (data: any): ItineraryFormData => {
  // 支持新格式：如果顶层有 itineraryData，则提取其内容
  let sourceData = data
  let tasks = data?.tasks

  if (data?.itineraryData && typeof data.itineraryData === 'object') {
    sourceData = data.itineraryData
    tasks = tasks || data.tasks
  }

  // 先提取 days，避免被 rest 解构时丢失
  const days = sourceData?.days || []
  
  const {
    id,
    createdAt,
    updatedAt,
    lastUpdatedAt,
    itinerary,
    ...rest
  } = sourceData || {}

  // 确保 days 被正确提取
  const finalPayload: ItineraryFormData = {
    title: rest.title || '未命名行程',
    destination: rest.destination,
    duration: rest.duration,
    budget: rest.budget,
    preferences: rest.preferences || [],
    travelStyle: rest.travelStyle,
    recommendations: rest.recommendations,
    days: days, // 使用提取的 days
    totalCost: rest.totalCost,
    summary: rest.summary,
    status: 'draft',
    language: 'zh-CN',
    tasks: tasks || [],
  }

  console.log('sanitizePayload 调试:')
  console.log('- sourceData.days:', sourceData?.days)
  console.log('- 提取的 days:', days)
  console.log('- finalPayload.days:', finalPayload.days)

  return finalPayload
}

const handleSubmit = async () => {
  if (!jsonText.value.trim()) {
    message.warning('请先粘贴或上传 JSON 内容')
    return
  }
  try {
    loading.value = true
    const parsed = JSON.parse(jsonText.value)

    // 调试信息：检查是否识别了新格式
    if (parsed?.itineraryData) {
      console.log('检测到 itineraryData 格式，正在转换...')
    }

    const payload = sanitizePayload(parsed)

    // 调试信息：显示转换后的数据
    console.log('=== 导入调试信息 ===')
    console.log('1. 原始解析数据:', parsed)
    console.log('2. 转换后的 payload:', payload)
    console.log('3. days 数量:', payload.days?.length)
    if (payload.days && payload.days.length > 0) {
      console.log('4. 第一个 day:', JSON.stringify(payload.days[0], null, 2))
      console.log('5. 第一个 day 的 timeSlots 数量:', payload.days[0]?.timeSlots?.length)
      if (payload.days[0]?.timeSlots && payload.days[0].timeSlots.length > 0) {
        console.log('6. 第一个 timeSlot:', JSON.stringify(payload.days[0].timeSlots[0], null, 2))
      }
    } else {
      console.warn('⚠️ 警告：days 数组为空或未定义！')
      console.log('payload 完整内容:', JSON.stringify(payload, null, 2))
    }

    // 确保 days 数据被正确包含
    if (!payload.days || payload.days.length === 0) {
      message.warning('警告：导入的数据中没有找到行程安排（days），请检查 JSON 格式')
    }

    // 记录实际发送给后端的数据
    console.log('发送给后端的数据摘要:', {
      title: payload.title,
      destination: payload.destination,
      duration: payload.duration,
      daysCount: payload.days?.length || 0,
      daysIsArray: Array.isArray(payload.days),
      daysType: typeof payload.days
    })
    
    if (payload.days && payload.days.length > 0) {
      console.log('发送的完整 days 数据:', JSON.stringify(payload.days, null, 2))
    } else {
      console.error('❌ 错误：准备发送的 days 数据为空！')
      console.log('完整 payload:', JSON.stringify(payload, null, 2))
    }

    const result = await createItinerary(payload)
    console.log('7. 创建成功，返回的数据:', result)
    console.log('8. 返回数据的 days 数量:', result?.itineraryData?.days?.length)
    if (result?.itineraryData?.days && result.itineraryData.days.length > 0) {
      console.log('9. 返回的第一个 day:', JSON.stringify(result.itineraryData.days[0], null, 2))
      message.success('导入成功')
    } else {
      console.error('❌ 错误：后端返回的数据中没有 days！')
      console.log('返回的完整数据:', JSON.stringify(result, null, 2))
      console.log('返回的 itineraryData:', JSON.stringify(result?.itineraryData, null, 2))
      
      // 如果后端没有返回 days，但创建成功了，可能是后端延迟保存
      // 提示用户稍后刷新或跳转到详情页面查看
      message.warning('导入成功，但后端返回的数据中缺少行程安排（days）。如果数据已保存，请刷新页面查看。')
    }
    console.log('=== 导入调试信息结束 ===')
    
    // 导入成功后，传递创建的 ID，让调用方可以跳转到详情页面
    emit('success', result?.id)
    // 清空表单
    jsonText.value = ''
    fileName.value = ''
  } catch (error: any) {
    console.error('导入错误:', error)
    let errorMsg = error?.message || '导入失败，请检查 JSON 格式'
    if (error?.response?.data?.message) {
      errorMsg = error.response.data.message
    }
    message.error(errorMsg)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  modalVisible.value = false
}
</script>

<style scoped>
.upload-file-name {
  margin-left: 12px;
  color: #888;
  font-size: 12px;
}
</style>

