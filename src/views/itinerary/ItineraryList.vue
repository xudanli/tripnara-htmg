<template>
  <div class="itinerary-list">
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
        <a-form-item label="目的地">
          <a-input
            v-model:value="queryParams.destination"
            placeholder="目的地"
            style="width: 150px"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="预算">
          <a-select
            v-model:value="queryParams.budget"
            placeholder="请选择"
            style="width: 120px"
            allow-clear
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="low">低</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="economy">经济</a-select-option>
            <a-select-option value="comfort">舒适</a-select-option>
            <a-select-option value="luxury">奢华</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="旅行风格">
          <a-select
            v-model:value="queryParams.travelStyle"
            placeholder="请选择"
            style="width: 120px"
            allow-clear
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="relaxed">轻松</a-select-option>
            <a-select-option value="moderate">适中</a-select-option>
            <a-select-option value="active">活跃</a-select-option>
            <a-select-option value="adventurous">冒险</a-select-option>
            <a-select-option value="intensive">紧凑</a-select-option>
          </a-select>
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
            placeholder="搜索标题或摘要"
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
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'duration'">
            {{ record.itineraryData?.duration || 0 }} 天
          </template>
          <template v-else-if="column.key === 'destination'">
            {{ record.itineraryData?.destination || '-' }}
          </template>
          <template v-else-if="column.key === 'budget'">
            {{ getBudgetLabel(record.itineraryData?.budget) }}
          </template>
          <template v-else-if="column.key === 'totalCost'">
            {{ record.itineraryData?.totalCost ? `$${record.itineraryData.totalCost}` : '-' }}
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
                  <a-popconfirm 
                    title="确定要删除这个模版吗？" 
                    description="删除后无法恢复，请谨慎操作。"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="handleDelete(record.id)"
                  >
                    <a-button type="link" size="small" danger>删除</a-button>
                  </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 导入模态框 -->
    <ImportItineraryModal v-model:open="importModalVisible" @success="handleImportSuccess" />

    <!-- 创建/编辑表单弹窗 -->
    <ItineraryFormModal
      v-model:open="formModalVisible"
      :itinerary="currentItinerary"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  getItineraries,
  getItineraryById,
  deleteItinerary,
  publishItinerary,
  cloneItinerary,
} from '@/api/itinerary'
import type {
  ItineraryTemplate,
  ItineraryQueryParams,
  ItineraryStatus,
  Budget,
  TravelStyle,
} from '@/types/itinerary'
import ImportItineraryModal from './ImportItineraryModal.vue'
import ItineraryFormModal from './ItineraryFormModal.vue'

const router = useRouter()
const loading = ref(false)
const dataSource = ref<ItineraryTemplate[]>([])
const formModalVisible = ref(false)
const importModalVisible = ref(false)
const currentItinerary = ref<ItineraryTemplate | null>(null)

const queryParams = reactive<ItineraryQueryParams>({
  page: 1,
  limit: 10,
  status: 'all',
  keyword: '',
  language: '',
  destination: '',
  budget: 'all',
  travelStyle: 'all',
})

const totalRecords = ref(0)

const pagination = computed(() => ({
  current: queryParams.page || 1,
  pageSize: queryParams.limit || 10,
  total: totalRecords.value,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100'],
}))

const columns = [
  {
    title: '标题',
    dataIndex: ['itineraryData', 'title'],
    key: 'title',
    width: 250,
    fixed: 'left' as const,
    ellipsis: true,
  },
  {
    title: '目的地',
    key: 'destination',
    width: 150,
  },
  {
    title: '天数',
    key: 'duration',
    width: 100,
  },
  {
    title: '预算',
    key: 'budget',
    width: 100,
  },
  {
    title: '总费用',
    key: 'totalCost',
    width: 120,
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
  },
  {
    title: '语言',
    dataIndex: 'language',
    key: 'language',
    width: 120,
    customRender: ({ record }: { record: ItineraryTemplate }) =>
      getLanguageLabel(record.language),
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 400,
    fixed: 'right' as const,
  },
]

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'published':
      return 'green'
    case 'draft':
      return 'orange'
    case 'archived':
      return 'default'
    default:
      return 'default'
  }
}

const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'published':
      return '已发布'
    case 'draft':
      return '草稿'
    case 'archived':
      return '已归档'
    default:
      return '未知'
  }
}

const getBudgetLabel = (budget?: Budget | string) => {
  switch (budget) {
    case 'low':
      return '低'
    case 'medium':
      return '中'
    case 'high':
      return '高'
    case 'economy':
      return '经济'
    case 'comfort':
      return '舒适'
    case 'luxury':
      return '奢华'
    default:
      return budget || '-'
  }
}

const getLanguageLabel = (language?: string) => {
  switch (language) {
    case 'zh-CN':
      return '简体中文'
    case 'en-US':
      return 'English'
    default:
      return language || '-'
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    // 直接传递查询参数，API 层会处理 'all' 值的过滤
    const params: ItineraryQueryParams = { ...queryParams }

    const response = await getItineraries(params)
    
    // 处理响应数据：{ data: [], total: number, page: number, limit: number }
    if (response && typeof response === 'object') {
      // 如果响应包含 data 字段
      if ('data' in response && Array.isArray(response.data)) {
        dataSource.value = response.data
        totalRecords.value = response.total || 0
        // 更新查询参数中的页码，确保与后端返回的一致
        if (response.page) {
          queryParams.page = response.page
        }
        if (response.limit) {
          queryParams.limit = response.limit
        }
      } else if (Array.isArray(response)) {
        // 如果直接返回数组（兼容旧格式）
        dataSource.value = response
        totalRecords.value = response.length
      }
    }
  } catch (error: any) {
    console.error('获取列表失败:', error)
    // 错误信息已经在 request 拦截器中处理，这里只记录
    if (error?.message && !error.message.includes('网络错误')) {
      message.error(error.message)
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  Object.assign(queryParams, {
    page: 1,
    limit: 10,
    status: 'all',
    keyword: '',
    language: '',
    destination: '',
    budget: 'all',
    travelStyle: 'all',
  })
  // 重置后立即查询
  fetchData()
}

const handleTableChange = (pag: any) => {
  // 确保 limit 不超过最大值 100
  const limit = Math.min(pag.pageSize || 10, 100)
  queryParams.page = pag.current || 1
  queryParams.limit = limit
  fetchData()
}

const handleCreate = () => {
  currentItinerary.value = null
  formModalVisible.value = true
}

const handleEdit = (record: ItineraryTemplate) => {
  currentItinerary.value = record
  formModalVisible.value = true
}

const handleView = (record: ItineraryTemplate) => {
  router.push(`/itineraries/${record.id}`)
}

const handleDelete = async (id: string) => {
  try {
    const result = await deleteItinerary(id)
    if (result?.success) {
      message.success(result.message || '删除成功')
      fetchData()
    } else {
      message.error(result?.message || '删除失败')
    }
  } catch (error: any) {
    console.error('删除失败:', error)
    // 处理不同的错误状态码
    if (error?.statusCode === 404) {
      message.error('行程模版不存在')
    } else if (error?.statusCode === 403) {
      message.error('无权删除此行程模版')
    } else if (error?.statusCode === 401) {
      message.error('未授权，请重新登录')
    } else {
      const errorMsg = error?.message || '删除失败'
      message.error(errorMsg)
    }
  }
}

const handlePublish = async (record: ItineraryTemplate) => {
  try {
    const result = await publishItinerary(record.id)
    // 根据接口文档，发布后状态会更新为 published
    message.success('发布成功')
    fetchData()
  } catch (error: any) {
    console.error('发布失败:', error)
    // 处理不同的错误状态码
    if (error?.statusCode === 404) {
      message.error('行程模版不存在')
    } else if (error?.statusCode === 403) {
      message.error('无权发布此行程模版')
    } else if (error?.statusCode === 401) {
      message.error('未授权，请重新登录')
    } else {
      const errorMsg = error?.message || '发布失败'
      message.error(errorMsg)
    }
  }
}

const handleClone = async (record: ItineraryTemplate) => {
  try {
    const result = await cloneItinerary(record.id)
    // 根据接口文档，复制后会生成新的ID，状态自动设置为 draft，标题会自动添加"（副本）"后缀
    message.success('复制成功')
    fetchData() // 刷新列表，显示新复制的模版
  } catch (error: any) {
    console.error('复制失败:', error)
    // 处理不同的错误状态码
    if (error?.statusCode === 404) {
      message.error('行程模版不存在')
    } else if (error?.statusCode === 403) {
      message.error('无权访问此行程模版')
    } else if (error?.statusCode === 401) {
      message.error('未授权，请重新登录')
    } else {
      const errorMsg = error?.message || '复制失败'
      message.error(errorMsg)
    }
  }
}

const handleExport = async (record: ItineraryTemplate) => {
  try {
    loading.value = true
    // 获取完整数据
    const fullData = await getItineraryById(record.id)
    const data = {
      itineraryData: fullData.itineraryData,
      tasks: fullData.tasks || [],
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fullData.itineraryData?.title || 'itinerary'}.json`
    link.click()
    URL.revokeObjectURL(url)
    message.success('导出成功')
  } catch (error: any) {
    message.error(error?.message || '导出失败')
  } finally {
    loading.value = false
  }
}

const handleImportSuccess = (id?: string) => {
  // 刷新列表数据
  fetchData()
  
  // 如果返回了 ID，自动跳转到详情页面
  if (id) {
    message.success('导入成功，正在跳转到详情页面...')
    // 延迟一下，确保后端数据已保存
    setTimeout(() => {
      router.push(`/itineraries/${id}`)
    }, 500)
  } else {
    message.info('导入成功，请刷新页面查看最新数据')
  }
}

const handleFormSuccess = () => {
  formModalVisible.value = false
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.itinerary-list {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
}

.filter-card {
  margin-bottom: 16px;
}
</style>


