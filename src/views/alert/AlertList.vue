<template>
  <div class="alert-list">
    <div class="page-header">
      <h2>旅行安全提示</h2>
      <a-button type="primary" @click="handleCreate">
        <template #icon><plus-outlined /></template>
        新建安全提示
      </a-button>
    </div>

    <!-- 筛选表单 -->
    <a-card class="filter-card" :bordered="false">
      <a-form :model="queryParams" layout="inline" @finish="handleSearch">
        <a-form-item label="目的地">
          <a-input
            v-model:value="queryParams.destination"
            placeholder="请输入目的地"
            style="width: 150px"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="国家代码">
          <a-input
            v-model:value="queryParams.countryCode"
            placeholder="如：ISL"
            style="width: 120px"
            :maxlength="3"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="严重程度">
          <a-select
            v-model:value="queryParams.severity"
            placeholder="请选择"
            style="width: 120px"
            allow-clear
          >
            <a-select-option value="low">低</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="critical">严重</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="queryParams.status"
            placeholder="请选择"
            style="width: 120px"
            allow-clear
          >
            <a-select-option value="active">活跃</a-select-option>
            <a-select-option value="expired">已过期</a-select-option>
            <a-select-option value="archived">已归档</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="开始日期">
          <a-date-picker
            v-model:value="queryParams.startDate"
            placeholder="选择日期"
            style="width: 150px"
            format="YYYY-MM-DD"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="结束日期">
          <a-date-picker
            v-model:value="queryParams.endDate"
            placeholder="选择日期"
            style="width: 150px"
            format="YYYY-MM-DD"
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
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'severity'">
            <a-tag :color="getSeverityColor(record.severity)">
              {{ getSeverityLabel(record.severity) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'startDate' || column.key === 'endDate'">
            {{ record[column.key] ? formatDate(record[column.key]) : '-' }}
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 创建表单弹窗 -->
    <AlertFormModal v-model:open="formModalVisible" @success="handleFormSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import dayjs, { type Dayjs as DayjsType } from 'dayjs'
import { getAlerts } from '@/api/alert'
import type { Alert, AlertQueryParams } from '@/types/alert'
import AlertFormModal from './AlertFormModal.vue'

const loading = ref(false)
const dataSource = ref<Alert[]>([])
const formModalVisible = ref(false)

const queryParams = reactive<AlertQueryParams & { startDate?: DayjsType; endDate?: DayjsType }>({
  destination: undefined,
  countryCode: undefined,
  severity: undefined,
  status: undefined,
  startDate: undefined,
  endDate: undefined,
  page: 1,
  limit: 20,
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
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 200,
  },
  {
    title: '目的地',
    dataIndex: 'destination',
    key: 'destination',
    width: 120,
  },
  {
    title: '国家代码',
    dataIndex: 'countryCode',
    key: 'countryCode',
    width: 100,
  },
  {
    title: '严重程度',
    key: 'severity',
    width: 100,
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
  },
  {
    title: '生效开始日期',
    key: 'startDate',
    width: 150,
  },
  {
    title: '生效结束日期',
    key: 'endDate',
    width: 150,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 150,
    customRender: ({ record }: { record: Alert }) => formatDate(record.createdAt),
  },
]

const fetchData = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params: AlertQueryParams = {
      destination: queryParams.destination,
      countryCode: queryParams.countryCode,
      severity: queryParams.severity,
      status: queryParams.status,
      startDate: queryParams.startDate
        ? typeof queryParams.startDate === 'string'
          ? queryParams.startDate
          : (queryParams.startDate as DayjsType).format('YYYY-MM-DD')
        : undefined,
      endDate: queryParams.endDate
        ? typeof queryParams.endDate === 'string'
          ? queryParams.endDate
          : (queryParams.endDate as DayjsType).format('YYYY-MM-DD')
        : undefined,
      page: queryParams.page,
      limit: queryParams.limit,
    }

    const response = await getAlerts(params)
    dataSource.value = response.data
    pagination.total = response.total
    pagination.current = response.page
  } catch (error) {
    // 错误已在 API 拦截器中处理
    console.error('获取数据失败:', error)
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
    destination: undefined,
    countryCode: undefined,
    severity: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    page: 1,
    limit: 20,
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
  formModalVisible.value = true
}

const handleFormSuccess = (alert: Alert) => {
  formModalVisible.value = false
  message.success('创建成功')
  // 刷新列表
  fetchData()
}

const getSeverityLabel = (severity: string) => {
  const labels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重',
  }
  return labels[severity] || severity
}

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    critical: 'red',
  }
  return colors[severity] || 'default'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: '活跃',
    expired: '已过期',
    archived: '已归档',
  }
  return labels[status] || status
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'green',
    expired: 'orange',
    archived: 'default',
  }
  return colors[status] || 'default'
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.alert-list {
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

