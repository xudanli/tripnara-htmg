<template>
  <a-modal
    v-model:open="modalVisible"
    :title="isEdit ? '编辑行程模版' : '新建行程模版'"
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
    >
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="模版名称" name="title">
            <a-input v-model:value="formState.title" placeholder="请输入模版名称" :maxlength="255" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="封面图链接" name="coverImage">
            <a-input
              v-model:value="formState.coverImage"
              placeholder="https://..."
              type="url"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="状态" name="status">
            <a-select v-model:value="formState.status" placeholder="请选择状态">
              <a-select-option value="draft">草稿</a-select-option>
              <a-select-option value="published">已发布</a-select-option>
              <a-select-option value="archived">已归档</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="模式" name="mode">
            <a-select v-model:value="formState.mode" placeholder="请选择模式">
              <a-select-option value="inspiration">灵感</a-select-option>
              <a-select-option value="planner">规划</a-select-option>
              <a-select-option value="seeker">探索</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="推荐天数" name="durationDays">
            <a-input-number
              v-model:value="formState.durationDays"
              :min="1"
              placeholder="天数"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="主模式分类" name="modePrimary">
            <a-input
              v-model:value="formState.modePrimary"
              placeholder="如：极光之旅"
              :maxlength="50"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="模式标签" name="modeTags">
            <a-input
              v-model:value="formState.modeTags"
              placeholder="逗号分隔，如：极光,北欧,冬季"
              :maxlength="255"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="模版摘要" name="summary">
        <a-textarea
          v-model:value="formState.summary"
          :rows="2"
          placeholder="请输入模版摘要"
        />
      </a-form-item>

      <a-form-item label="模版描述" name="description">
        <a-textarea
          v-model:value="formState.description"
          :rows="3"
          placeholder="请输入模版描述"
        />
      </a-form-item>

      <a-form-item label="核心洞察" name="coreInsight">
        <a-textarea
          v-model:value="formState.coreInsight"
          :rows="3"
          placeholder="请输入核心洞察"
        />
      </a-form-item>

      <a-divider>高级设置（JSON 格式）</a-divider>

      <a-form-item label="安全提示默认值">
        <a-textarea
          v-model:value="formState.safetyNoticeDefaultJson"
          :rows="3"
          placeholder='JSON 格式，如：{"notice": "注意安全"}'
        />
      </a-form-item>

      <a-form-item label="旅程背景">
        <a-textarea
          v-model:value="formState.journeyBackgroundJson"
          :rows="3"
          placeholder='JSON 数组格式，如：["背景1", "背景2"]'
        />
      </a-form-item>

      <a-form-item label="人格画像">
        <a-textarea
          v-model:value="formState.personaProfileJson"
          :rows="3"
          placeholder='JSON 格式，如：{"persona": "冒险家"}'
        />
      </a-form-item>

      <a-form-item label="旅程设计">
        <a-textarea
          v-model:value="formState.journeyDesignJson"
          :rows="3"
          placeholder='JSON 格式，如：{"design": "设计内容"}'
        />
      </a-form-item>

      <a-form-item label="默认任务列表">
        <a-textarea
          v-model:value="formState.tasksDefaultJson"
          :rows="3"
          placeholder='JSON 数组格式，如：["任务1", "任务2"]'
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import { createTemplate, updateTemplate } from '@/api/template'
import type { Template, TemplateFormData, TemplateStatus, TemplateMode } from '@/types/template'

interface Props {
  open: boolean
  template?: Template | null
}

const props = withDefaults(defineProps<Props>(), {
  template: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const formRef = ref()
const loading = ref(false)

const isEdit = computed(() => !!props.template)

const modalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const formState = reactive<{
  title: string
  coverImage?: string
  durationDays?: number
  summary?: string
  description?: string
  coreInsight?: string
  status: TemplateStatus
  mode: TemplateMode
  modePrimary?: string
  modeTags?: string
  safetyNoticeDefaultJson?: string
  journeyBackgroundJson?: string
  personaProfileJson?: string
  journeyDesignJson?: string
  tasksDefaultJson?: string
}>({
  title: '',
  coverImage: undefined,
  durationDays: undefined,
  summary: undefined,
  description: undefined,
  coreInsight: undefined,
  status: 'draft',
  mode: 'inspiration',
  modePrimary: undefined,
  modeTags: undefined,
  safetyNoticeDefaultJson: undefined,
  journeyBackgroundJson: undefined,
  personaProfileJson: undefined,
  journeyDesignJson: undefined,
  tasksDefaultJson: undefined,
})

const rules = {
  title: [{ required: true, message: '请输入模版名称', trigger: 'blur' }],
}

// 解析 JSON 字符串
const parseJson = (jsonStr?: string): any => {
  if (!jsonStr || !jsonStr.trim()) return undefined
  try {
    return JSON.parse(jsonStr)
  } catch (error) {
    return undefined
  }
}

// 将对象转换为 JSON 字符串
const stringifyJson = (obj: any): string => {
  if (!obj) return ''
  try {
    return JSON.stringify(obj, null, 2)
  } catch (error) {
    return ''
  }
}

// 监听 template 变化，填充表单
watch(
  () => props.template,
  (template) => {
    if (template) {
      Object.assign(formState, {
        title: template.title || '',
        coverImage: template.coverImage,
        durationDays: template.durationDays,
        summary: template.summary || '',
        description: template.description || '',
        coreInsight: template.coreInsight || '',
        status: template.status,
        mode: template.mode,
        modePrimary: template.modePrimary || '',
        modeTags: template.modeTags || '',
        safetyNoticeDefaultJson: stringifyJson(template.safetyNoticeDefault),
        journeyBackgroundJson: stringifyJson(template.journeyBackground),
        personaProfileJson: stringifyJson(template.personaProfile),
        journeyDesignJson: stringifyJson(template.journeyDesign),
        tasksDefaultJson: stringifyJson(template.tasksDefault),
      })
    } else {
      // 重置表单
      Object.assign(formState, {
        title: '',
        coverImage: undefined,
        durationDays: undefined,
        summary: undefined,
        description: undefined,
        coreInsight: undefined,
        status: 'draft',
        mode: 'inspiration',
        modePrimary: undefined,
        modeTags: undefined,
        safetyNoticeDefaultJson: undefined,
        journeyBackgroundJson: undefined,
        personaProfileJson: undefined,
        journeyDesignJson: undefined,
        tasksDefaultJson: undefined,
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

    const submitData: TemplateFormData = {
      title: formState.title,
      coverImage: formState.coverImage,
      durationDays: formState.durationDays,
      summary: formState.summary,
      description: formState.description,
      coreInsight: formState.coreInsight,
      status: formState.status,
      mode: formState.mode,
      modePrimary: formState.modePrimary,
      modeTags: formState.modeTags,
      safetyNoticeDefault: parseJson(formState.safetyNoticeDefaultJson),
      journeyBackground: parseJson(formState.journeyBackgroundJson),
      personaProfile: parseJson(formState.personaProfileJson),
      journeyDesign: parseJson(formState.journeyDesignJson),
      tasksDefault: parseJson(formState.tasksDefaultJson),
    }

    if (isEdit.value && props.template) {
      await updateTemplate(props.template.id, submitData)
      message.success('更新成功')
    } else {
      await createTemplate(submitData)
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

