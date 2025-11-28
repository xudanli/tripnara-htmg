<template>
  <a-modal
    v-model:open="modalVisible"
    title="新建旅行安全提示"
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
    >
      <a-form-item label="通知标题" name="title">
        <a-input v-model:value="formState.title" placeholder="请输入通知标题" :maxlength="255" />
      </a-form-item>
      <a-form-item label="通知内容" name="content">
        <a-textarea
          v-model:value="formState.content"
          :rows="4"
          placeholder="请输入通知内容"
        />
      </a-form-item>
      <a-form-item label="目的地" name="destination">
        <a-input v-model:value="formState.destination" placeholder="请输入目的地" :maxlength="255" />
      </a-form-item>
      <a-form-item label="国家代码" name="countryCode">
        <a-input
          v-model:value="formState.countryCode"
          placeholder="ISO 3166-1 alpha-3，如：ISL"
          :maxlength="3"
        />
      </a-form-item>
      <a-form-item label="严重程度" name="severity">
        <a-select v-model:value="formState.severity" placeholder="请选择严重程度">
          <a-select-option value="low">低</a-select-option>
          <a-select-option value="medium">中</a-select-option>
          <a-select-option value="high">高</a-select-option>
          <a-select-option value="critical">严重</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="状态" name="status">
        <a-select v-model:value="formState.status" placeholder="请选择状态">
          <a-select-option value="active">活跃</a-select-option>
          <a-select-option value="expired">已过期</a-select-option>
          <a-select-option value="archived">已归档</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="生效开始日期" name="startDate">
        <a-date-picker
          v-model:value="formState.startDate"
          placeholder="选择生效开始日期"
          style="width: 100%"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
        />
      </a-form-item>
      <a-form-item label="生效结束日期" name="endDate">
        <a-date-picker
          v-model:value="formState.endDate"
          placeholder="选择生效结束日期（可选）"
          style="width: 100%"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
        />
      </a-form-item>
      <a-form-item label="元数据" name="metadata">
        <a-textarea
          v-model:value="metadataText"
          :rows="3"
          placeholder='请输入 JSON 格式的元数据，如：{"source": "government", "region": "south"}'
          @blur="handleMetadataBlur"
        />
        <div class="form-item-help">可选，JSON 格式的额外信息</div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import dayjs, { type Dayjs as DayjsType } from 'dayjs'
import { createAlert } from '@/api/alert'
import type { Alert, AlertFormData } from '@/types/alert'
import { AlertSeverity, AlertStatus } from '@/types/alert'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: [alert: Alert]
}>()

const formRef = ref()
const loading = ref(false)
const metadataText = ref('')

const modalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const formState = reactive<{
  title: string
  content: string
  destination: string
  countryCode?: string
  severity: AlertSeverity
  status?: AlertStatus
  startDate?: DayjsType
  endDate?: DayjsType
  metadata?: Record<string, any>
}>({
  title: '',
  content: '',
  destination: '',
  countryCode: undefined,
  severity: AlertSeverity.MEDIUM,
  status: AlertStatus.ACTIVE,
  startDate: undefined,
  endDate: undefined,
  metadata: undefined,
})

const validateEndDate = (_rule: any, value: any) => {
  if (value && formState.startDate) {
    if (dayjs(value).isBefore(dayjs(formState.startDate))) {
      return Promise.reject(new Error('结束日期不能早于开始日期'))
    }
  }
  return Promise.resolve()
}

const rules = {
  title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }],
  destination: [{ required: true, message: '请输入目的地', trigger: 'blur' }],
  severity: [{ required: true, message: '请选择严重程度', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择生效开始日期', trigger: 'change' }],
  endDate: [{ validator: validateEndDate, trigger: 'change' }],
}

// 监听弹窗打开，重置表单
watch(
  () => props.open,
  (open) => {
    if (open) {
      // 重置表单
      Object.assign(formState, {
        title: '',
        content: '',
        destination: '',
        countryCode: undefined,
        severity: AlertSeverity.MEDIUM,
        status: AlertStatus.ACTIVE,
        startDate: undefined,
        endDate: undefined,
        metadata: undefined,
      })
      metadataText.value = ''
      formRef.value?.resetFields()
    }
  }
)

const handleMetadataBlur = () => {
  if (metadataText.value.trim()) {
    try {
      formState.metadata = JSON.parse(metadataText.value)
    } catch (error) {
      message.warning('元数据格式错误，请输入有效的 JSON 格式')
      formState.metadata = undefined
    }
  } else {
    formState.metadata = undefined
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    // 处理日期格式
    if (!formState.startDate) {
      message.error('请选择生效开始日期')
      loading.value = false
      return
    }

    // 验证结束日期不能早于开始日期
    if (formState.endDate && dayjs(formState.endDate).isBefore(dayjs(formState.startDate))) {
      message.error('结束日期不能早于开始日期')
      loading.value = false
      return
    }

    const submitData: AlertFormData = {
      title: formState.title,
      content: formState.content,
      destination: formState.destination,
      countryCode: formState.countryCode,
      severity: formState.severity,
      status: formState.status || AlertStatus.ACTIVE,
      startDate: (formState.startDate as DayjsType).toISOString(),
      endDate: formState.endDate ? (formState.endDate as DayjsType).toISOString() : undefined,
      metadata: formState.metadata,
    }

    const response = await createAlert(submitData)
    if (response.success && response.data) {
      message.success('创建成功')
      emit('success', response.data)
    } else {
      message.error(response.message || '创建失败')
    }
  } catch (error: any) {
    if (error?.errorFields) {
      message.error('请填写完整信息')
    } else {
      message.error(error?.message || '创建失败')
    }
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  modalVisible.value = false
}
</script>

<style scoped>
.form-item-help {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}
</style>

