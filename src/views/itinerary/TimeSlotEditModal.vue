<template>
  <a-modal
    v-model:open="modalVisible"
    :title="timeSlot ? '编辑活动' : '新建活动'"
    :width="900"
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
          <a-form-item label="时间" name="time">
            <a-time-picker
              v-model:value="formState.time"
              format="HH:mm"
              style="width: 100%"
              placeholder="选择时间"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="类型" name="type">
            <a-select v-model:value="formState.type" placeholder="请选择类型" style="width: 100%">
              <a-select-option value="transport">交通</a-select-option>
              <a-select-option value="attraction">景点</a-select-option>
              <a-select-option value="meal">餐饮</a-select-option>
              <a-select-option value="hotel">酒店</a-select-option>
              <a-select-option value="shopping">购物</a-select-option>
              <a-select-option value="activity">活动</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="标题" name="title">
        <a-input v-model:value="formState.title" placeholder="请输入标题" :maxlength="255" />
      </a-form-item>

      <a-form-item label="活动描述" name="activity">
        <a-textarea
          v-model:value="formState.activity"
          :rows="2"
          placeholder="请输入活动描述"
        />
      </a-form-item>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="费用（美元）" name="cost">
            <a-input-number
              v-model:value="formState.cost"
              :min="0"
              :precision="2"
              style="width: 100%"
              placeholder="费用"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="时长（分钟）" name="duration">
            <a-input-number
              v-model:value="formState.duration"
              :min="0"
              :precision="0"
              style="width: 100%"
              placeholder="时长"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="备注" name="notes">
        <a-textarea
          v-model:value="formState.notes"
          :rows="3"
          placeholder="请输入备注"
        />
      </a-form-item>

      <a-divider>坐标信息</a-divider>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="纬度" name="lat">
            <a-input-number
              v-model:value="formState.coordinates.lat"
              :precision="6"
              style="width: 100%"
              placeholder="纬度"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="经度" name="lng">
            <a-input-number
              v-model:value="formState.coordinates.lng"
              :precision="6"
              style="width: 100%"
              placeholder="经度"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-divider>详细信息</a-divider>

      <a-form-item label="描述">
        <a-textarea
          v-model:value="formState.details.description"
          :rows="3"
          placeholder="详细描述"
        />
      </a-form-item>

      <a-divider orientation="left">名称信息</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="中文名称">
            <a-input
              v-model:value="formState.details.name.chinese"
              placeholder="中文名称"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="英文名称">
            <a-input
              v-model:value="formState.details.name.english"
              placeholder="英文名称"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="本地名称">
            <a-input
              v-model:value="formState.details.name.local"
              placeholder="本地名称"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-divider orientation="left">地址信息</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="中文地址">
            <a-textarea
              v-model:value="formState.details.address.chinese"
              :rows="2"
              placeholder="中文地址"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="英文地址">
            <a-textarea
              v-model:value="formState.details.address.english"
              :rows="2"
              placeholder="英文地址"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="本地地址">
            <a-textarea
              v-model:value="formState.details.address.local"
              :rows="2"
              placeholder="本地地址"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="交通信息">
        <a-textarea
          v-model:value="formState.details.transportation"
          :rows="3"
          placeholder="交通信息"
        />
      </a-form-item>

      <a-form-item label="开放时间">
        <a-textarea
          v-model:value="formState.details.openingHours"
          :rows="2"
          placeholder="开放时间"
        />
      </a-form-item>

      <a-form-item label="价格详情">
        <a-textarea
          v-model:value="formState.details.pricing.detail"
          :rows="3"
          placeholder="价格详情"
        />
      </a-form-item>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="评分">
            <a-input-number
              v-model:value="formState.details.rating"
              :min="0"
              :max="5"
              :precision="1"
              style="width: 100%"
              placeholder="评分（0-5）"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="类别">
            <a-input
              v-model:value="formState.details.category"
              placeholder="类别"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-divider orientation="left">推荐信息</a-divider>
      <a-form-item label="游览建议">
        <a-textarea
          v-model:value="formState.details.recommendations.visitTips"
          :rows="3"
          placeholder="游览建议"
        />
      </a-form-item>
      <a-form-item label="最佳游览时间">
        <a-input
          v-model:value="formState.details.recommendations.bestTimeToVisit"
          placeholder="最佳游览时间"
        />
      </a-form-item>
      <a-form-item label="附近景点">
        <a-textarea
          v-model:value="formState.details.recommendations.nearbyAttractions"
          :rows="2"
          placeholder="附近景点"
        />
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="建议游览时长（分钟）">
            <a-input-number
              v-model:value="formState.details.recommendations.visitDuration"
              :min="0"
              :precision="0"
              style="width: 100%"
              placeholder="建议游览时长"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="联系方式">
        <a-textarea
          v-model:value="formState.details.contact.info"
          :rows="2"
          placeholder="联系方式"
        />
      </a-form-item>

      <a-form-item label="无障碍设施">
        <a-textarea
          v-model:value="formState.details.accessibility"
          :rows="2"
          placeholder="无障碍设施信息"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
import type { TimeSlot, ActivityDetails, Coordinates, NameInfo, AddressInfo } from '@/types/itinerary'

interface Props {
  open: boolean
  timeSlot?: TimeSlot | null
}

const props = withDefaults(defineProps<Props>(), {
  timeSlot: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: [timeSlot: TimeSlot]
}>()

const modalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const formState = reactive<{
  time: Dayjs | null
  title: string
  activity: string
  type: string
  notes: string
  coordinates: Coordinates
  cost: number | undefined
  duration: number | undefined
  details: ActivityDetails
}>({
  time: null,
  title: '',
  activity: '',
  type: '',
  notes: '',
  coordinates: {
    lat: 0,
    lng: 0,
  },
  cost: undefined,
  duration: undefined,
  details: {
    notes: '',
    description: '',
    name: {
      chinese: '',
      english: '',
      local: '',
    },
    address: {
      chinese: '',
      english: '',
      local: '',
    },
    transportation: '',
    openingHours: '',
    pricing: {
      detail: '',
    },
    rating: undefined,
    recommendations: {
      visitTips: '',
      bestTimeToVisit: '',
      nearbyAttractions: '',
      visitDuration: undefined,
    },
    contact: {
      info: '',
    },
    accessibility: '',
    category: '',
  },
})

const rules = {
  time: [{ required: true, message: '请选择时间', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
}

// 初始化表单
const initForm = () => {
  if (props.timeSlot) {
    // 编辑模式：填充现有数据
    formState.time = props.timeSlot.time ? dayjs(props.timeSlot.time, 'HH:mm') : null
    formState.title = props.timeSlot.title || ''
    formState.activity = props.timeSlot.activity || ''
    formState.type = props.timeSlot.type || ''
    formState.notes = props.timeSlot.notes || ''
    formState.cost = props.timeSlot.cost
    formState.duration = props.timeSlot.duration
    formState.coordinates = props.timeSlot.coordinates || { lat: 0, lng: 0 }
    
    if (props.timeSlot.details) {
      const details = props.timeSlot.details as ActivityDetails
      formState.details = {
        notes: details.notes || '',
        description: details.description || '',
        name: {
          chinese: details.name?.chinese || '',
          english: details.name?.english || '',
          local: details.name?.local || '',
        },
        address: {
          chinese: details.address?.chinese || '',
          english: details.address?.english || '',
          local: details.address?.local || '',
        },
        transportation: details.transportation || '',
        openingHours: details.openingHours || '',
        pricing: {
          detail: details.pricing?.detail || '',
        },
        rating: details.rating,
        recommendations: {
          visitTips: details.recommendations?.visitTips || '',
          bestTimeToVisit: details.recommendations?.bestTimeToVisit || '',
          nearbyAttractions: details.recommendations?.nearbyAttractions || '',
          visitDuration: details.recommendations?.visitDuration,
        },
        contact: {
          info: details.contact?.info || '',
        },
        accessibility: details.accessibility || '',
        category: details.category || '',
      }
    }
  } else {
    // 新建模式：重置表单
    formState.time = null
    formState.title = ''
    formState.activity = ''
    formState.type = ''
    formState.notes = ''
    formState.cost = undefined
    formState.duration = undefined
    formState.coordinates = { lat: 0, lng: 0 }
    formState.details = {
      notes: '',
      description: '',
      name: { chinese: '', english: '', local: '' },
      address: { chinese: '', english: '', local: '' },
      transportation: '',
      openingHours: '',
      pricing: { detail: '' },
      rating: undefined,
      recommendations: {
        visitTips: '',
        bestTimeToVisit: '',
        nearbyAttractions: '',
        visitDuration: undefined,
      },
      contact: { info: '' },
      accessibility: '',
      category: '',
    }
  }
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

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    // 构建 TimeSlot 对象
    const timeSlotData: TimeSlot = {
      id: props.timeSlot?.id,
      time: formState.time ? formState.time.format('HH:mm') : '',
      title: formState.title,
      activity: formState.activity || undefined,
      type: formState.type as any,
      notes: formState.notes || undefined,
      coordinates: formState.coordinates.lat !== 0 || formState.coordinates.lng !== 0
        ? formState.coordinates
        : undefined,
      cost: formState.cost,
      duration: formState.duration,
      details: {
        ...formState.details,
        // 清理空值
        notes: formState.details.notes || undefined,
        description: formState.details.description || undefined,
        name: Object.values(formState.details.name).some(v => v)
          ? formState.details.name
          : undefined,
        address: Object.values(formState.details.address).some(v => v)
          ? formState.details.address
          : undefined,
        transportation: formState.details.transportation || undefined,
        openingHours: formState.details.openingHours || undefined,
        pricing: formState.details.pricing.detail
          ? formState.details.pricing
          : undefined,
        rating: formState.details.rating,
        recommendations: Object.values(formState.details.recommendations).some(v => v)
          ? formState.details.recommendations
          : undefined,
        contact: formState.details.contact.info
          ? formState.details.contact
          : undefined,
        accessibility: formState.details.accessibility || undefined,
        category: formState.details.category || undefined,
      },
    }

    emit('success', timeSlotData)
    message.success(props.timeSlot ? '更新成功' : '创建成功')
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

