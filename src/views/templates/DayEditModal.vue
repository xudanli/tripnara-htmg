<template>
  <a-modal
    v-model:open="modalVisible"
    :title="`编辑第 ${dayData?.dayNumber || 0} 天行程`"
    :width="1000"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
    >
      <a-form-item label="天数标题">
        <a-input v-model:value="formState.title" placeholder="如：第一天：抵达奥斯陆" :maxlength="255" />
      </a-form-item>

      <a-form-item label="天数摘要">
        <a-textarea
          v-model:value="formState.summary"
          :rows="2"
          placeholder="简要描述这一天的行程安排"
        />
      </a-form-item>

      <a-divider>时段安排</a-divider>

      <div class="time-slots-container">
        <a-empty
          v-if="formState.timeSlots.length === 0"
          description="暂无时段，点击下方按钮添加"
          :image="false"
          style="padding: 20px"
        />
        <div v-else class="time-slots-list">
          <div
            v-for="(slot, index) in formState.timeSlots"
            :key="slot.tempId || slot.id"
            class="time-slot-item"
          >
            <a-card size="small" :bordered="true">
              <template #title>
                <span>时段 {{ index + 1 }}</span>
                <a-button
                  type="text"
                  danger
                  size="small"
                  style="float: right"
                  @click="handleRemoveSlot(index)"
                >
                  删除
                </a-button>
              </template>
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="序号" style="margin-bottom: 12px">
                    <a-input-number
                      v-model:value="slot.sequence"
                      :min="1"
                      style="width: 100%"
                      placeholder="序号"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="类型" style="margin-bottom: 12px">
                    <a-select v-model:value="slot.type" placeholder="请选择类型" style="width: 100%">
                      <a-select-option value="transport">交通</a-select-option>
                      <a-select-option value="activity">活动</a-select-option>
                      <a-select-option value="meal">用餐</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="开始时间" style="margin-bottom: 12px">
                    <a-time-picker
                      v-model:value="slot.startTimeValue"
                      format="HH:mm"
                      style="width: 100%"
                      placeholder="选择时间"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="持续时间（分钟）" style="margin-bottom: 12px">
                    <a-input-number
                      v-model:value="slot.durationMinutes"
                      :min="0"
                      style="width: 100%"
                      placeholder="分钟"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-form-item label="标题" style="margin-bottom: 12px">
                <a-input
                  v-model:value="slot.title"
                  placeholder="如：参观奥斯陆大教堂"
                  :maxlength="255"
                />
              </a-form-item>
              <a-form-item label="地点名称" style="margin-bottom: 12px">
                <a-input
                  v-model:value="slot.locationName"
                  placeholder="地点名称"
                  :maxlength="255"
                />
              </a-form-item>
              <a-form-item label="地点地址" style="margin-bottom: 12px">
                <a-input
                  v-model:value="slot.locationAddress"
                  placeholder="详细地址"
                  :maxlength="500"
                />
              </a-form-item>
              <a-form-item label="风景介绍" style="margin-bottom: 12px">
                <a-textarea
                  v-model:value="slot.scenicIntro"
                  :rows="2"
                  placeholder="介绍这个地点的特色和亮点"
                />
              </a-form-item>
            </a-card>
          </div>
        </div>

        <div style="margin-top: 16px; text-align: center">
          <a-button type="dashed" block @click="handleAddSlot">
            <template #icon><plus-outlined /></template>
            添加时段
          </a-button>
        </div>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import {
  updateTemplateDay,
  createTemplateDay,
  createTemplateTimeSlot,
  updateTemplateTimeSlot,
  deleteTemplateTimeSlot,
} from '@/api/template'
import type { TemplateDay, TemplateTimeSlot } from '@/types/template'

interface Props {
  open: boolean
  templateId: string
  day?: TemplateDay | null
}

const props = withDefaults(defineProps<Props>(), {
  day: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const formRef = ref()
const loading = ref(false)
const dayData = computed(() => props.day)

const modalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

interface TimeSlotFormItem extends Partial<TemplateTimeSlot> {
  tempId?: string
  startTimeValue?: Dayjs | string
  locationName?: string
  locationAddress?: string
}

const formState = reactive<{
  title?: string
  summary?: string
  timeSlots: TimeSlotFormItem[]
}>({
  title: '',
  summary: '',
  timeSlots: [],
})

// 生成临时 ID
let tempIdCounter = 0
const generateTempId = () => `temp-${Date.now()}-${++tempIdCounter}`

// 监听 day 变化，填充表单
watch(
  () => props.day,
  (day) => {
    if (day) {
      formState.title = day.title || ''
      formState.summary = day.summary || ''
      formState.timeSlots = (day.timeSlots || []).map((slot) => ({
        ...slot,
        tempId: slot.id || generateTempId(),
        startTimeValue: slot.startTime ? dayjs(slot.startTime, 'HH:mm') : undefined,
        locationName: slot.locationJson?.name || '',
        locationAddress: slot.locationJson?.address || '',
      }))
    } else {
      formState.title = ''
      formState.summary = ''
      formState.timeSlots = []
    }
  },
  { immediate: true }
)

const handleAddSlot = () => {
  const maxSequence =
    formState.timeSlots.length > 0
      ? Math.max(...formState.timeSlots.map((s) => s.sequence || 0))
      : 0
  formState.timeSlots.push({
    tempId: generateTempId(),
    sequence: maxSequence + 1,
    type: 'activity',
    title: '',
    startTimeValue: undefined,
    durationMinutes: undefined,
    locationName: '',
    locationAddress: '',
    scenicIntro: '',
  })
}

const handleRemoveSlot = (index: number) => {
  formState.timeSlots.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    loading.value = true

    // 准备天数数据
    const dayData: Partial<TemplateDay> = {
      title: formState.title,
      summary: formState.summary,
    }

    // 保存或更新天数
    let savedDay: TemplateDay
    if (props.day?.id) {
      // 更新天数
      const result = await updateTemplateDay(props.templateId, props.day.id, dayData)
      savedDay = result.data || props.day
    } else {
      // 创建天数（需要 dayNumber）
      if (!props.day?.dayNumber) {
        message.error('缺少天数序号')
        return
      }
      const result = await createTemplateDay(props.templateId, {
        ...dayData,
        dayNumber: props.day.dayNumber,
      })
      savedDay = result.data!
    }

    const dayId = savedDay.id!
    const existingSlots = props.day?.timeSlots || []

    // 处理时段：新增、更新、删除
    const slotsToCreate: TimeSlotFormItem[] = []
    const slotsToUpdate: Array<{ slot: TimeSlotFormItem; id: string }> = []
    const slotIdsToKeep = new Set<string>()

    formState.timeSlots.forEach((slot) => {
      if (slot.id) {
        // 已存在的时段，需要更新
        slotsToUpdate.push({ slot, id: slot.id })
        slotIdsToKeep.add(slot.id)
      } else {
        // 新时段，需要创建
        slotsToCreate.push(slot)
      }
    })

    // 找出需要删除的时段
    const slotsToDelete = existingSlots
      .filter((s) => s.id && !slotIdsToKeep.has(s.id))
      .map((s) => s.id!)

    // 执行删除
    for (const slotId of slotsToDelete) {
      await deleteTemplateTimeSlot(props.templateId, dayId, slotId)
    }

    // 执行更新
    for (const { slot, id } of slotsToUpdate) {
      const slotData: Partial<TemplateTimeSlot> = {
        sequence: slot.sequence,
        type: slot.type,
        title: slot.title,
        startTime:
          slot.startTimeValue instanceof dayjs
            ? slot.startTimeValue.format('HH:mm')
            : slot.startTimeValue,
        durationMinutes: slot.durationMinutes,
        scenicIntro: slot.scenicIntro,
        locationJson: {
          name: slot.locationName,
          address: slot.locationAddress,
        },
      }
      await updateTemplateTimeSlot(props.templateId, dayId, id, slotData)
    }

    // 执行创建
    for (const slot of slotsToCreate) {
      const slotData: Partial<TemplateTimeSlot> = {
        sequence: slot.sequence!,
        type: slot.type,
        title: slot.title,
        startTime:
          slot.startTimeValue instanceof dayjs
            ? slot.startTimeValue.format('HH:mm')
            : slot.startTimeValue,
        durationMinutes: slot.durationMinutes,
        scenicIntro: slot.scenicIntro,
        locationJson: {
          name: slot.locationName,
          address: slot.locationAddress,
        },
      }
      await createTemplateTimeSlot(props.templateId, dayId, slotData)
    }

    message.success('保存成功')
    emit('success')
  } catch (error: any) {
    message.error(error?.message || '保存失败')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  modalVisible.value = false
}
</script>

<style scoped>
.time-slots-container {
  max-height: 600px;
  overflow-y: auto;
}

.time-slots-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.time-slot-item {
  position: relative;
}

.time-slot-item :deep(.ant-card-head) {
  min-height: 40px;
  padding: 0 12px;
}

.time-slot-item :deep(.ant-card-body) {
  padding: 12px;
}
</style>

