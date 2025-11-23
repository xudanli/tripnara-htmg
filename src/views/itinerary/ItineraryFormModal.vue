<template>
  <a-modal
    v-model:open="modalVisible"
    :title="itinerary ? '编辑行程模版' : '新建行程模版'"
    :width="800"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
      label-align="left"
    >
      <a-form-item label="标题" name="title">
        <a-input v-model:value="formState.title" placeholder="请输入标题" :maxlength="255" />
      </a-form-item>
      <a-form-item label="目的地" name="destination">
        <a-input v-model:value="formState.destination" placeholder="请输入目的地" />
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="天数" name="duration">
            <a-input-number
              v-model:value="formState.duration"
              :min="1"
              :max="30"
              style="width: 100%"
              placeholder="天数（1-30）"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="预算" name="budget">
            <a-select v-model:value="formState.budget" placeholder="请选择预算" style="width: 100%">
              <a-select-option value="low">低</a-select-option>
              <a-select-option value="medium">中</a-select-option>
              <a-select-option value="high">高</a-select-option>
              <a-select-option value="economy">经济</a-select-option>
              <a-select-option value="comfort">舒适</a-select-option>
              <a-select-option value="luxury">奢华</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="旅行风格" name="travelStyle">
            <a-select
              v-model:value="formState.travelStyle"
              placeholder="请选择旅行风格"
              style="width: 100%"
            >
              <a-select-option value="relaxed">轻松</a-select-option>
              <a-select-option value="moderate">适中</a-select-option>
              <a-select-option value="active">活跃</a-select-option>
              <a-select-option value="adventurous">冒险</a-select-option>
              <a-select-option value="intensive">紧凑</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="语言" name="language">
            <a-select v-model:value="formState.language" placeholder="请选择语言">
              <a-select-option value="zh-CN">中文 (zh-CN)</a-select-option>
              <a-select-option value="en-US">英文 (en-US)</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item label="总费用" name="totalCost">
        <a-input-number
          v-model:value="formState.totalCost"
          :min="0"
          :precision="0"
          style="width: 100%"
          placeholder="总费用（美元）"
        />
      </a-form-item>
      <a-form-item label="偏好" name="preferences">
        <a-select
          v-model:value="formState.preferences"
          mode="tags"
          placeholder="请输入偏好（可输入多个，按回车添加）"
          style="width: 100%"
          :token-separators="[',']"
        />
      </a-form-item>
      <a-form-item label="摘要" name="summary">
        <a-textarea
          v-model:value="formState.summary"
          :rows="3"
          placeholder="请输入行程摘要"
        />
      </a-form-item>
      <a-divider>推荐信息</a-divider>
      <a-form-item label="住宿推荐">
        <a-textarea
          v-model:value="formState.recommendations.accommodation"
          :rows="2"
          placeholder="请输入住宿推荐"
        />
      </a-form-item>
      <a-form-item label="交通推荐">
        <a-textarea
          v-model:value="formState.recommendations.transportation"
          :rows="2"
          placeholder="请输入交通推荐"
        />
      </a-form-item>
      <a-form-item label="美食推荐">
        <a-textarea
          v-model:value="formState.recommendations.food"
          :rows="2"
          placeholder="请输入美食推荐"
        />
      </a-form-item>
      <a-form-item label="行程建议">
        <a-textarea
          v-model:value="formState.recommendations.tips"
          :rows="3"
          placeholder="请输入行程建议和提示"
        />
      </a-form-item>
      <a-form-item label="状态" name="status">
        <a-select v-model:value="formState.status" placeholder="请选择状态" style="width: 100%">
          <a-select-option value="draft">草稿</a-select-option>
          <a-select-option value="published">已发布</a-select-option>
          <a-select-option value="archived">已归档</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { createItinerary, updateItinerary } from '@/api/itinerary'
import type { ItineraryTemplate, ItineraryFormData } from '@/types/itinerary'

interface Props {
  open: boolean
  itinerary?: ItineraryTemplate | null
}

const props = withDefaults(defineProps<Props>(), {
  itinerary: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const modalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const formState = reactive<ItineraryFormData>({
  title: '',
  destination: '',
  duration: undefined,
  budget: undefined,
  preferences: [],
  travelStyle: undefined,
  recommendations: {
    accommodation: '',
    transportation: '',
    food: '',
    tips: '',
  },
  days: [],
  totalCost: undefined,
  summary: '',
  status: 'draft',
  language: 'zh-CN',
  tasks: [],
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
}

// 监听 itinerary 变化，填充表单
watch(
  () => props.itinerary,
  (itinerary) => {
    if (itinerary) {
      Object.assign(formState, {
        title: itinerary.itineraryData?.title || '',
        destination: itinerary.itineraryData?.destination || '',
        duration: itinerary.itineraryData?.duration,
        budget: itinerary.itineraryData?.budget,
        preferences: itinerary.itineraryData?.preferences || [],
        travelStyle: itinerary.itineraryData?.travelStyle,
        recommendations: itinerary.itineraryData?.recommendations || {
          accommodation: '',
          transportation: '',
          food: '',
          tips: '',
        },
        days: itinerary.itineraryData?.days || [],
        totalCost: itinerary.itineraryData?.totalCost,
        summary: itinerary.itineraryData?.summary || '',
        status: itinerary.status || 'draft',
        language: itinerary.language || 'zh-CN',
        tasks: itinerary.tasks || [],
      })
    } else {
      // 重置表单
      Object.assign(formState, {
        title: '',
        destination: '',
        duration: undefined,
        budget: undefined,
        preferences: [],
        travelStyle: undefined,
        recommendations: {
          accommodation: '',
          transportation: '',
          food: '',
          tips: '',
        },
        days: [],
        totalCost: undefined,
        summary: '',
        status: 'draft',
        language: 'zh-CN',
        tasks: [],
      })
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    if (props.itinerary?.id) {
      // 更新模式：根据接口文档，所有字段都是可选的，只传入需要更新的字段
      // 发送表单中所有字段的值（包括空值），由后端决定是否更新
      // 注意：这里发送完整表单数据，实际使用时可以根据需要只发送变更的字段
      const payload: Partial<ItineraryFormData> = {}
      
      // 必填字段
      if (formState.title !== undefined) payload.title = formState.title
      
      // 可选字段：发送所有有定义的值（包括空字符串和空数组）
      if (formState.destination !== undefined) payload.destination = formState.destination
      if (formState.duration !== undefined) payload.duration = formState.duration
      if (formState.budget !== undefined) payload.budget = formState.budget
      if (formState.preferences !== undefined) payload.preferences = formState.preferences
      if (formState.travelStyle !== undefined) payload.travelStyle = formState.travelStyle
      if (formState.recommendations !== undefined) payload.recommendations = formState.recommendations
      if (formState.days !== undefined) payload.days = formState.days
      if (formState.totalCost !== undefined) payload.totalCost = formState.totalCost
      if (formState.summary !== undefined) payload.summary = formState.summary
      if (formState.status !== undefined) payload.status = formState.status
      if (formState.language !== undefined) payload.language = formState.language
      if (formState.tasks !== undefined) payload.tasks = formState.tasks

      try {
        await updateItinerary(props.itinerary.id, payload)
        message.success('更新成功')
        emit('success')
      } catch (error: any) {
        console.error('更新失败:', error)
        // 处理不同的错误状态码
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
      }
    } else {
      // 创建模式：发送完整的表单数据
      const payload: ItineraryFormData = {
        title: formState.title,
        destination: formState.destination,
        duration: formState.duration,
        budget: formState.budget,
        preferences: formState.preferences || [],
        travelStyle: formState.travelStyle,
        recommendations: Object.values(formState.recommendations || {}).some(v => v)
          ? formState.recommendations
          : undefined,
        days: formState.days || [],
        totalCost: formState.totalCost,
        summary: formState.summary,
        status: formState.status || 'draft',
        language: formState.language || 'zh-CN',
        tasks: formState.tasks || [],
      }

      await createItinerary(payload)
      message.success('创建成功')
      emit('success')
    }
  } catch (error: any) {
    // 表单验证错误
    if (error?.errorFields) {
      return
    }
    console.error('保存失败:', error)
    const errorMsg = error?.message || '保存失败'
    message.error(errorMsg)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  modalVisible.value = false
}
</script>

