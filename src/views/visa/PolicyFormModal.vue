<template>
  <a-modal
    v-model:open="modalVisible"
    :title="isEdit ? '编辑签证政策' : '新建签证政策'"
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
      <a-form-item label="目的地国家代码" name="destinationCountryCode">
        <a-input
          v-model:value="formState.destinationCountryCode"
          placeholder="如：JP"
          :maxlength="2"
        />
      </a-form-item>
      <a-form-item label="语言">
        <a-select v-model:value="formState.language">
          <a-select-option value="zh-CN">简体中文</a-select-option>
          <a-select-option value="en-US">English</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="目的地国家名称" name="destinationCountryName">
        <a-input v-model:value="formState.destinationCountryName" placeholder="如：日本" />
      </a-form-item>
      <a-form-item label="申请人类型" name="applicantType">
        <a-radio-group v-model:value="formState.applicantType">
          <a-radio value="nationality">国籍</a-radio>
          <a-radio value="permanent_resident">永久居民</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="申请人国家代码" name="applicantCountryCode">
        <a-input
          v-model:value="formState.applicantCountryCode"
          placeholder="如：CN"
          :maxlength="2"
        />
      </a-form-item>
      <a-form-item label="申请人描述" name="applicantDescription">
        <a-input v-model:value="formState.applicantDescription" placeholder="如：中国护照" />
      </a-form-item>
      <a-form-item label="签证类型" name="visaType">
        <a-select v-model:value="formState.visaType" placeholder="请选择签证类型">
          <a-select-option value="visa-free">免签</a-select-option>
          <a-select-option value="visa-on-arrival">落地签</a-select-option>
          <a-select-option value="e-visa">电子签</a-select-option>
          <a-select-option value="visa-required">需要提前办理签证</a-select-option>
          <a-select-option value="permanent-resident-benefit">永久居民优惠</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="详细说明" name="description">
        <a-textarea
          v-model:value="formState.description"
          :rows="3"
          placeholder="请输入详细说明"
        />
      </a-form-item>
      <a-form-item label="停留期限（天）" name="durationDays">
        <a-input-number
          v-model:value="formState.durationDays"
          :min="1"
          placeholder="请输入天数"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="申请链接" name="applicationUrl">
        <a-input
          v-model:value="formState.applicationUrl"
          placeholder="https://..."
          type="url"
        />
      </a-form-item>
      <a-form-item label="生效日期" name="effectiveDate">
        <a-date-picker
          v-model:value="formState.effectiveDate"
          placeholder="选择生效日期"
          style="width: 100%"
          format="YYYY-MM-DD"
        />
      </a-form-item>
      <a-form-item label="失效日期" name="expiryDate">
        <a-date-picker
          v-model:value="formState.expiryDate"
          placeholder="选择失效日期（可选）"
          style="width: 100%"
          format="YYYY-MM-DD"
        />
      </a-form-item>
      <a-form-item label="是否生效" name="isActive">
        <a-switch v-model:checked="formState.isActive" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import type { Dayjs as DayjsType } from 'dayjs'
import { createVisaPolicy, updateVisaPolicy } from '@/api/visa'
import type { VisaPolicy, VisaPolicyFormData } from '@/types/visa'

interface Props {
  open: boolean
  policy?: VisaPolicy | null
}

const props = withDefaults(defineProps<Props>(), {
  policy: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const formRef = ref()
const loading = ref(false)

const isEdit = computed(() => !!props.policy)

const modalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const formState = reactive<{
  destinationCountryCode: string
  destinationCountryName: string
  applicantType: string
  applicantCountryCode: string
  applicantDescription: string
  visaType: string
  description: string
  durationDays?: number
  applicationUrl: string
  isActive: boolean
  effectiveDate?: DayjsType | string
  expiryDate?: DayjsType | string | null
  updatedBy: string
  language?: string
}>({
  destinationCountryCode: '',
  destinationCountryName: '',
  applicantType: 'nationality',
  applicantCountryCode: '',
  applicantDescription: '',
  visaType: 'visa-required',
  description: '',
  durationDays: undefined,
  applicationUrl: '',
  isActive: true,
  effectiveDate: undefined,
  expiryDate: null,
  updatedBy: 'admin',
  language: 'zh-CN',
})

const rules = {
  destinationCountryCode: [{ required: true, message: '请输入目的地国家代码', trigger: 'blur' }],
  destinationCountryName: [{ required: true, message: '请输入目的地国家名称', trigger: 'blur' }],
  applicantType: [{ required: true, message: '请选择申请人类型', trigger: 'change' }],
  applicantCountryCode: [{ required: true, message: '请输入申请人国家代码', trigger: 'blur' }],
  applicantDescription: [{ required: true, message: '请输入申请人描述', trigger: 'blur' }],
  visaType: [{ required: true, message: '请选择签证类型', trigger: 'change' }],
}

// 监听 policy 变化，填充表单
watch(
  () => props.policy,
  (policy) => {
    if (policy) {
      Object.assign(formState, {
        destinationCountryCode: policy.destinationCountryCode,
        destinationCountryName: policy.destinationCountryName,
        applicantType: policy.applicantType,
        applicantCountryCode: policy.applicantCountryCode,
        applicantDescription: policy.applicantDescription,
        visaType: policy.visaType,
        description: policy.description || '',
        durationDays: policy.durationDays,
        applicationUrl: policy.applicationUrl || '',
        isActive: policy.isActive,
        effectiveDate: policy.effectiveDate ? dayjs(policy.effectiveDate) : undefined,
        expiryDate: policy.expiryDate ? dayjs(policy.expiryDate) : null,
        updatedBy: 'admin',
        language: policy.language || 'zh-CN',
      })
    } else {
      // 重置表单
      Object.assign(formState, {
        destinationCountryCode: '',
        destinationCountryName: '',
        applicantType: 'nationality',
        applicantCountryCode: '',
        applicantDescription: '',
        visaType: 'visa-required',
        description: '',
        durationDays: undefined,
        applicationUrl: '',
        isActive: true,
        effectiveDate: undefined,
        expiryDate: null,
        updatedBy: 'admin',
        language: 'zh-CN',
      })
    }
    formRef.value?.resetFields()
  },
  { immediate: true }
)

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    const submitData: VisaPolicyFormData = {
      destinationCountryCode: formState.destinationCountryCode,
      destinationCountryName: formState.destinationCountryName,
      applicantType: formState.applicantType as any,
      applicantCountryCode: formState.applicantCountryCode,
      applicantDescription: formState.applicantDescription,
      visaType: formState.visaType as any,
      description: formState.description,
      durationDays: formState.durationDays,
      applicationUrl: formState.applicationUrl,
      isActive: formState.isActive,
      effectiveDate: formState.effectiveDate
        ? typeof formState.effectiveDate === 'string'
          ? formState.effectiveDate
          : (formState.effectiveDate as DayjsType).format('YYYY-MM-DD')
        : undefined,
      expiryDate: formState.expiryDate
        ? typeof formState.expiryDate === 'string'
          ? formState.expiryDate
          : formState.expiryDate === null
          ? null
          : (formState.expiryDate as DayjsType).format('YYYY-MM-DD')
        : null,
      updatedBy: formState.updatedBy,
      language: formState.language,
    }

    if (isEdit.value && props.policy) {
      await updateVisaPolicy(props.policy.id, submitData)
      message.success('更新成功')
    } else {
      await createVisaPolicy(submitData)
      message.success('创建成功')
    }

    emit('success')
  } catch (error: any) {
    if (error?.errorFields) {
      message.error('请填写完整信息')
    } else {
      message.error(isEdit.value ? '更新失败' : '创建失败')
    }
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  modalVisible.value = false
}
</script>

