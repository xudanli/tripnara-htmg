<template>
  <div class="template-list">
    <div class="page-header">
      <h2>行程模版管理</h2>
      <a-space>
        <a-button @click="importModalVisible = true">
          导入 JSON
        </a-button>
        <a-button type="primary" @click="handleCreate">
          <template #icon><plus-outlined /></template>
          新建模版
        </a-button>
      </a-space>
    </div>

    <!-- 筛选表单 -->
    <a-card class="filter-card" :bordered="false">
      <a-form :model="queryParams" layout="inline" @finish="handleSearch">
        <a-form-item label="状态">
          <a-select
            v-model:value="queryParams.status"
            placeholder="请选择"
            style="width: 120px"
            allow-clear
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="draft">草稿</a-select-option>
            <a-select-option value="published">已发布</a-select-option>
            <a-select-option value="archived">已归档</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="模式">
          <a-select
            v-model:value="queryParams.mode"
            placeholder="请选择"
            style="width: 120px"
            allow-clear
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="inspiration">灵感</a-select-option>
            <a-select-option value="planner">规划</a-select-option>
            <a-select-option value="seeker">探索</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="主模式分类">
          <a-input
            v-model:value="queryParams.modePrimary"
            placeholder="主模式分类"
            style="width: 150px"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="标签">
          <a-input
            v-model:value="queryParams.modeTags"
            placeholder="逗号分隔，如：极光,北欧"
            style="width: 200px"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="语言">
          <a-select
            v-model:value="queryParams.language"
            placeholder="请选择"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="zh-CN">简体中文</a-select-option>
            <a-select-option value="en-US">English</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="关键字">
          <a-input
            v-model:value="queryParams.keyword"
            placeholder="搜索名称或摘要"
            style="width: 200px"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 数据表格 -->
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 1400, y: 'calc(100vh - 400px)' }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'coverImage'">
            <a-image
              v-if="record.coverImage"
              :src="record.coverImage"
              :width="80"
              :height="60"
              :preview="false"
              style="object-fit: cover; border-radius: 4px"
            />
            <span v-else style="color: #ccc">无封面</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'mode'">
            <a-tag :color="getModeColor(record.mode)">
              {{ getModeLabel(record.mode) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'modeTags'">
            <a-space v-if="record.modeTags" size="small" wrap>
              <a-tag v-for="tag in getTags(record.modeTags)" :key="tag" size="small">
                {{ tag }}
              </a-tag>
            </a-space>
            <span v-else style="color: #ccc">-</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)">查看</a-button>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" size="small" @click="handleExport(record)">导出</a-button>
              <a-button
                v-if="record.status !== 'published'"
                type="link"
                size="small"
                @click="handlePublish(record)"
              >
                发布
              </a-button>
              <a-button type="link" size="small" @click="handleClone(record)">复制</a-button>
              <a-popconfirm title="确定要删除这个模版吗？" @confirm="handleDelete(record.id)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 创建/编辑表单弹窗 -->
    <TemplateFormModal
      v-model:open="formModalVisible"
      :template="currentTemplate"
      @success="handleFormSuccess"
    />
    <ImportTemplateModal v-model:open="importModalVisible" @success="handleImportSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  getTemplates,
  deleteTemplate,
  publishTemplate,
  cloneTemplate,
  getTemplateById,
} from '@/api/template'
import type { Template, TemplateQueryParams, TemplateStatus, TemplateMode } from '@/types/template'
import TemplateFormModal from './TemplateFormModal.vue'
import ImportTemplateModal from './ImportTemplateModal.vue'

const router = useRouter()

const loading = ref(false)
const dataSource = ref<Template[]>([])
const formModalVisible = ref(false)
const currentTemplate = ref<Template | null>(null)
const importModalVisible = ref(false)

const queryParams = reactive<TemplateQueryParams>({
  page: 1,
  limit: 20,
  status: undefined,
  mode: undefined,
  modePrimary: undefined,
  modeTags: undefined,
  language: undefined,
  keyword: undefined,
})

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total: number) => `共 ${total} 条`,
  showSizeChanger: true,
  showQuickJumper: true,
})

const columns = [
  {
    title: '模版名称',
    dataIndex: 'title',
    key: 'title',
    width: 250,
    fixed: 'left' as const,
    ellipsis: true,
  },
  {
    title: '封面',
    key: 'coverImage',
    width: 100,
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
  },
  {
    title: '模式',
    key: 'mode',
    width: 120,
  },
  {
    title: '主模式分类',
    dataIndex: 'modePrimary',
    key: 'modePrimary',
    width: 150,
    ellipsis: true,
  },
  {
    title: '语言',
    dataIndex: 'language',
    key: 'language',
    width: 120,
      width: 280,
  },
  {
    title: '标签',
    key: 'modeTags',
    width: 200,
  },
  {
    title: '天数',
    dataIndex: 'durationDays',
    key: 'durationDays',
    width: 80,
    customRender: ({ record }: { record: Template }) =>
      record.durationDays ? `${record.durationDays} 天` : '-',
  },
  {
    title: '摘要',
    dataIndex: 'summary',
    key: 'summary',
    width: 250,
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
    customRender: ({ record }: { record: Template }) =>
      new Date(record.createdAt).toLocaleString('zh-CN'),
  },
  {
    title: '操作',
    key: 'action',
    width: 280,
    fixed: 'right' as const,
  },
]

const fetchData = async () => {
  loading.value = true
  try {
    const response = await getTemplates(queryParams)
    dataSource.value = response.data
    pagination.total = response.total
    pagination.current = response.page
  } catch (error) {
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  Object.assign(queryParams, {
    page: 1,
    limit: 20,
    status: undefined,
    mode: undefined,
    modePrimary: undefined,
    modeTags: undefined,
    language: undefined,
    keyword: undefined,
  })
  pagination.current = 1
  fetchData()
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  queryParams.page = pag.current
  queryParams.limit = pag.pageSize
  fetchData()
}

const handleCreate = () => {
  currentTemplate.value = null
  formModalVisible.value = true
}

const handleEdit = (record: Template) => {
  currentTemplate.value = record
  formModalVisible.value = true
}

const handleView = (record: Template) => {
  router.push(`/templates/${record.id}`)
}

const handleDelete = async (id: string) => {
  try {
    await deleteTemplate(id)
    message.success('删除成功')
    fetchData()
  } catch (error) {
    message.error('删除失败')
  }
}

const handlePublish = async (record: Template) => {
  try {
    await publishTemplate(record.id)
    message.success('发布成功')
    fetchData()
  } catch (error) {
    message.error('发布失败')
  }
}

const handleClone = async (record: Template) => {
  try {
    const result = await cloneTemplate(record.id)
    message.success('复制成功')
    fetchData()
    // 可选：跳转到新复制的模版详情页
    if (result.data?.id) {
      router.push(`/templates/${result.data.id}`)
    }
  } catch (error) {
    message.error('复制失败')
  }
}

const handleExport = async (record: Template) => {
  try {
    const detail = await getTemplateById(record.id)
    const blob = new Blob([JSON.stringify(detail, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${record.title || '行程模版'}.json`
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    message.error('导出失败')
  }
}

const handleFormSuccess = () => {
  formModalVisible.value = false
  currentTemplate.value = null
  fetchData()
}

const handleImportSuccess = () => {
  importModalVisible.value = false
  fetchData()
}

const getStatusLabel = (status: TemplateStatus) => {
  const labels: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档',
  }
  return labels[status] || status
}

const getStatusColor = (status: TemplateStatus) => {
  const colors: Record<string, string> = {
    draft: 'orange',
    published: 'green',
    archived: 'default',
  }
  return colors[status] || 'default'
}

const getModeLabel = (mode: TemplateMode) => {
  const labels: Record<string, string> = {
    inspiration: '灵感',
    planner: '规划',
    seeker: '探索',
  }
  return labels[mode] || mode
}

const getModeColor = (mode: TemplateMode) => {
  const colors: Record<string, string> = {
    inspiration: 'purple',
    planner: 'blue',
    seeker: 'cyan',
  }
  return colors[mode] || 'default'
}

const getTags = (tagsStr: string) => {
  if (!tagsStr) return []
  return tagsStr.split(',').map((tag) => tag.trim()).filter(Boolean)
}

const getLanguageLabel = (language?: string) => {
  if (language === 'en-US') return 'English'
  return '简体中文'
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.template-list {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.filter-card {
  margin-bottom: 16px;
}
</style>

