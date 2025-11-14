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
      message="请粘贴或上传包含完整行程模版结构的 JSON。导入后将创建新的模版。"
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
import { createTemplate } from '@/api/template'
import type {
  TemplateFormData,
  TemplateDay,
  TemplateTimeSlot,
  TemplateLocation,
} from '@/types/template'

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

const templateKeyMap: Record<string, keyof TemplateFormData> = {
  title: 'title',
  status: 'status',
  mode: 'mode',
  modePrimary: 'modePrimary',
  mode_primary: 'modePrimary',
  modeTags: 'modeTags',
  mode_tags: 'modeTags',
  language: 'language',
  languageCode: 'language',
  language_code: 'language',
  coverImage: 'coverImage',
  cover_image: 'coverImage',
  durationDays: 'durationDays',
  duration_days: 'durationDays',
  summary: 'summary',
  description: 'description',
  coreInsight: 'coreInsight',
  core_insight: 'coreInsight',
  safetyNoticeDefault: 'safetyNoticeDefault',
  safety_notice_default: 'safetyNoticeDefault',
  journeyBackground: 'journeyBackground',
  journey_background: 'journeyBackground',
  personaProfile: 'personaProfile',
  persona_profile: 'personaProfile',
  journeyDesign: 'journeyDesign',
  journey_design: 'journeyDesign',
  tasksDefault: 'tasksDefault',
  tasks_default: 'tasksDefault',
}

const dayKeyMap: Record<string, keyof TemplateDay> = {
  dayNumber: 'dayNumber',
  day_number: 'dayNumber',
  title: 'title',
  summary: 'summary',
  detailsJson: 'detailsJson',
  details_json: 'detailsJson',
  description: 'description',
}

const slotKeyMap: Record<string, keyof TemplateTimeSlot | 'durationHours' | 'location'> = {
  sequence: 'sequence',
  startTime: 'startTime',
  start_time: 'startTime',
  durationMinutes: 'durationMinutes',
  duration_minutes: 'durationMinutes',
  durationHours: 'durationHours',
  duration_hours: 'durationHours',
  type: 'type',
  title: 'title',
  activityHighlights: 'activityHighlights',
  activity_highlights: 'activityHighlights',
  scenicIntro: 'scenicIntro',
  scenic_intro: 'scenicIntro',
  detailsJson: 'detailsJson',
  details_json: 'detailsJson',
  location: 'location',
  locationJson: 'locationJson',
  location_json: 'locationJson',
  localTip: 'activityHighlights', // legacy
}

const normalizeLocation = (location?: any): TemplateLocation | undefined => {
  if (!location || typeof location !== 'object') return undefined
  const {
    name,
    address,
    city,
    country,
    countryCode,
    country_code,
    region,
    regionCode,
    region_code,
    latitude,
    longitude,
    countryName,
    regionName,
  } = location
  const result: TemplateLocation = {
    name,
    address,
    city,
    countryCode: countryCode || country_code || country,
    countryName: countryName || location.countryName || location.country,
    regionCode: regionCode || region_code || region,
    regionName: regionName || location.regionName || location.region,
    latitude: latitude !== undefined ? Number(latitude) : undefined,
    longitude: longitude !== undefined ? Number(longitude) : undefined,
  }
  return result
}

const convertKeys = <T>(source: any, map: Record<string, keyof T | string>) => {
  const result: Record<string, any> = {}
  Object.entries(source || {}).forEach(([key, value]) => {
    const targetKey = map[key]
    if (!targetKey) return
    result[targetKey] = value
  })
  return result
}

const sanitizeSlot = (slot: any): TemplateTimeSlot => {
  const { id, dayId, createdAt, updatedAt, transport, day, ...rest } = slot || {}
  const normalized = convertKeys<TemplateTimeSlot>(rest, slotKeyMap)

  if (normalized.durationHours && !normalized.durationMinutes) {
    normalized.durationMinutes = Number(normalized.durationHours) * 60
  }
  delete normalized.durationHours

  const locationSource = rest.locationJson || rest.location_json || rest.location
  const loc = normalizeLocation(locationSource)
  if (loc) normalized.locationJson = loc

  if (typeof normalized.sequence === 'string') {
    normalized.sequence = Number(normalized.sequence)
  }

  return normalized as TemplateTimeSlot
}

const sanitizeDay = (day: any): TemplateDay => {
  const { id, templateId, createdAt, updatedAt, ...rest } = day || {}
  const normalized = convertKeys<TemplateDay>(rest, dayKeyMap)

  if (typeof normalized.dayNumber === 'string') {
    normalized.dayNumber = Number(normalized.dayNumber)
  }

  return {
    ...normalized,
    timeSlots: (day?.timeSlots || day?.slots)?.map(sanitizeSlot),
  } as TemplateDay
}

const sanitizePayload = (data: any): TemplateFormData => {
  const { id, createdAt, updatedAt, lastUpdatedAt, days, templateDays, ...rest } = data || {}
  const normalized = convertKeys<TemplateFormData>(rest, templateKeyMap)
  const finalPayload: TemplateFormData = {
    ...normalized,
    days: (days || templateDays)?.map(sanitizeDay),
  }
  if (!finalPayload.language) {
    finalPayload.language = 'zh-CN'
  }
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
    const payload = sanitizePayload(parsed)
    await createTemplate(payload)
    message.success('导入成功')
    emit('success')
  } catch (error: any) {
    console.error(error)
    message.error(error?.message || '导入失败，请检查 JSON 格式')
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

