<template>
  <a-modal
    v-model:open="modalVisible"
    :title="task ? '编辑任务' : '新建任务'"
    :width="700"
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
      <a-form-item label="任务标题" name="title">
        <a-input v-model:value="formState.title" placeholder="请输入任务标题" :maxlength="255" />
      </a-form-item>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="类别" name="category">
            <a-input v-model:value="formState.category" placeholder="任务类别" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="目的地" name="destination">
            <a-input v-model:value="formState.destination" placeholder="目的地" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="完成状态">
        <a-checkbox v-model:checked="formState.completed">已完成</a-checkbox>
      </a-form-item>

      <a-divider>相关链接</a-divider>
      <a-form-item label="链接">
        <div v-for="(link, index) in formState.links" :key="index" style="margin-bottom: 12px">
          <a-space style="width: 100%">
            <a-input
              v-model:value="link.label"
              placeholder="链接标签"
              style="width: 200px"
            />
            <a-input
              v-model:value="link.url"
              placeholder="链接地址（URL）"
              style="flex: 1"
            />
            <a-button type="link" danger @click="removeLink(index)">
              <template #icon>
                <DeleteOutlined />
              </template>
              删除
            </a-button>
          </a-space>
        </div>
        <a-button type="dashed" @click="addLink" style="width: 100%">
          <template #icon>
            <PlusOutlined />
          </template>
          添加链接
        </a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import type { Task } from '@/types/itinerary'

interface Props {
  open: boolean
  task?: Task | null
}

const props = withDefaults(defineProps<Props>(), {
  task: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: [task: Task]
}>()

const modalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const formState = reactive<{
  title: string
  category: string
  destination: string
  completed: boolean
  links: Array<{ label: string; url: string }>
}>({
  title: '',
  category: '',
  destination: '',
  completed: false,
  links: [],
})

const rules = {
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
}

// 初始化表单
const initForm = () => {
  if (props.task) {
    // 编辑模式：填充现有数据
    formState.title = props.task.title || ''
    formState.category = props.task.category || ''
    formState.destination = props.task.destination || ''
    formState.completed = props.task.completed || false
    formState.links = props.task.links ? JSON.parse(JSON.stringify(props.task.links)) : []
  } else {
    // 新建模式：重置表单
    formState.title = ''
    formState.category = ''
    formState.destination = ''
    formState.completed = false
    formState.links = []
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

const addLink = () => {
  formState.links.push({ label: '', url: '' })
}

const removeLink = (index: number) => {
  formState.links.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    // 构建 Task 对象
    const taskData: Task = {
      id: props.task?.id,
      title: formState.title,
      category: formState.category || undefined,
      destination: formState.destination || undefined,
      completed: formState.completed,
      links: formState.links.filter(link => link.label && link.url).length > 0
        ? formState.links.filter(link => link.label && link.url)
        : undefined,
    }

    emit('success', taskData)
    message.success(props.task ? '更新成功' : '创建成功')
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

