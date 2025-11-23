<template>
  <a-modal
    v-model:open="modalVisible"
    :title="day ? `编辑第 ${day.day} 天行程` : '新建行程'"
    :width="1000"
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
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="天数" name="day">
            <a-input-number
              v-model:value="formState.day"
              :min="1"
              :max="30"
              style="width: 100%"
              placeholder="天数"
              :disabled="!!day"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="日期" name="date">
            <a-date-picker
              v-model:value="formState.date"
              style="width: 100%"
              placeholder="选择日期"
              format="YYYY-MM-DD"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-divider>时间段列表</a-divider>
      <div style="margin-bottom: 16px">
        <a-button type="primary" @click="handleAddTimeSlot" style="margin-bottom: 16px">
          <template #icon>
            <PlusOutlined />
          </template>
          添加活动
        </a-button>
      </div>

      <div v-if="formState.timeSlots.length === 0" style="text-align: center; padding: 40px">
        <a-empty description="暂无活动，请添加" :image="false" />
      </div>

      <div v-else>
        <a-list
          :data-source="formState.timeSlots"
          :bordered="true"
          style="max-height: 500px; overflow-y: auto"
        >
          <template #renderItem="{ item, index }">
            <a-list-item>
              <template #actions>
                <a-button type="link" size="small" @click="handleEditTimeSlot(index)">
                  编辑
                </a-button>
                <a-button type="link" size="small" danger @click="handleRemoveTimeSlot(index)">
                  删除
                </a-button>
              </template>
              <a-list-item-meta>
                <template #title>
                  <div style="display: flex; align-items: center; gap: 8px">
                    <span style="font-weight: bold">{{ item.time || '未设置时间' }}</span>
                    <a-tag v-if="item.type" size="small">{{ getTimeSlotTypeLabel(item.type) }}</a-tag>
                    <span>{{ item.title || '未命名活动' }}</span>
                  </div>
                </template>
                <template #description>
                  <div v-if="item.activity" style="color: #666; font-size: 12px; margin-top: 4px">
                    {{ item.activity }}
                  </div>
                  <div style="color: #666; font-size: 12px; margin-top: 4px">
                    <span v-if="item.duration">时长：{{ item.duration }} 分钟</span>
                    <span v-if="item.cost" style="margin-left: 12px">费用：${{ item.cost }}</span>
                  </div>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </a-form>

    <!-- 时间段编辑弹窗 -->
    <TimeSlotEditModal
      v-model:open="timeSlotModalVisible"
      :time-slot="currentTimeSlot"
      @success="handleTimeSlotSuccess"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { Day, TimeSlot } from '@/types/itinerary'
import TimeSlotEditModal from './TimeSlotEditModal.vue'

interface Props {
  open: boolean
  day?: Day | null
}

const props = withDefaults(defineProps<Props>(), {
  day: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: [day: Day]
}>()

const modalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const timeSlotModalVisible = ref(false)
const currentTimeSlotIndex = ref<number>(-1)
const currentTimeSlot = ref<TimeSlot | null>(null)

const formState = reactive<{
  day: number
  date: Dayjs | null
  timeSlots: TimeSlot[]
}>({
  day: 1,
  date: null,
  timeSlots: [],
})

const rules = {
  day: [{ required: true, message: '请输入天数', trigger: 'blur' }],
}

// 获取时间段类型标签
const getTimeSlotTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    transport: '交通',
    attraction: '景点',
    meal: '餐饮',
    hotel: '酒店',
    shopping: '购物',
    activity: '活动',
  }
  return labels[type] || type
}

// 初始化表单
const initForm = () => {
  if (props.day) {
    // 编辑模式：填充现有数据
    formState.day = props.day.day
    formState.date = props.day.date ? dayjs(props.day.date) : null
    formState.timeSlots = props.day.timeSlots ? [...props.day.timeSlots] : []
  } else {
    // 新建模式：重置表单
    formState.day = 1
    formState.date = null
    formState.timeSlots = []
  }
  currentTimeSlotIndex.value = -1
  currentTimeSlot.value = null
}

// 监听 open 变化，初始化表单
watch(
  () => props.open,
  (open) => {
    if (open) {
      initForm()
    }
  },
  { immediate: true }
)

const handleAddTimeSlot = () => {
  currentTimeSlotIndex.value = -1
  currentTimeSlot.value = null
  timeSlotModalVisible.value = true
}

const handleEditTimeSlot = (index: number) => {
  currentTimeSlotIndex.value = index
  currentTimeSlot.value = { ...formState.timeSlots[index] }
  timeSlotModalVisible.value = true
}

const handleRemoveTimeSlot = (index: number) => {
  formState.timeSlots.splice(index, 1)
  message.success('删除成功')
}

const handleTimeSlotSuccess = (timeSlot: TimeSlot) => {
  if (currentTimeSlotIndex.value >= 0) {
    // 编辑模式：更新现有时间段
    formState.timeSlots[currentTimeSlotIndex.value] = timeSlot
  } else {
    // 新建模式：添加新时间段
    formState.timeSlots.push(timeSlot)
  }
  // 按时间排序
  formState.timeSlots.sort((a, b) => {
    if (!a.time || !b.time) return 0
    return a.time.localeCompare(b.time)
  })
  timeSlotModalVisible.value = false
  currentTimeSlotIndex.value = -1
  currentTimeSlot.value = null
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    const dayData: Day = {
      id: props.day?.id,
      day: formState.day,
      date: formState.date ? formState.date.format('YYYY-MM-DD') : undefined,
      timeSlots: formState.timeSlots,
    }

    emit('success', dayData)
    message.success(props.day ? '更新成功' : '创建成功')
    modalVisible.value = false
  } catch (error: any) {
    if (error?.errorFields) {
      return
    }
    console.error('保存失败:', error)
    message.error('保存失败')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  modalVisible.value = false
}
</script>

