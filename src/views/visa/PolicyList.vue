<template>
  <div class="policy-list">
    <div class="page-header">
      <h2>签证政策管理</h2>
      <a-button type="primary" @click="handleCreate">
        <template #icon><plus-outlined /></template>
        新建政策
      </a-button>
    </div>

    <!-- 筛选表单 -->
    <a-card class="filter-card" :bordered="false">
      <a-form :model="queryParams" layout="inline" @finish="handleSearch">
        <a-form-item label="目的地国家">
          <a-input
            v-model:value="queryParams.destinationCountryCode"
            placeholder="国家代码，如：JP"
            style="width: 150px"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="申请人类型">
          <a-select
            v-model:value="queryParams.applicantType"
            placeholder="请选择"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="nationality">国籍</a-select-option>
            <a-select-option value="permanent_resident">永久居民</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="申请人国家">
          <a-input
            v-model:value="queryParams.applicantCountryCode"
            placeholder="国家代码，如：CN"
            style="width: 150px"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="签证类型">
          <a-select
            v-model:value="queryParams.visaType"
            placeholder="请选择"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="visa-free">免签</a-select-option>
            <a-select-option value="visa-on-arrival">落地签</a-select-option>
            <a-select-option value="e-visa">电子签</a-select-option>
            <a-select-option value="visa-required">需要提前办理签证</a-select-option>
            <a-select-option value="permanent-resident-benefit">永久居民优惠</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="queryParams.isActive"
            placeholder="请选择"
            style="width: 120px"
            allow-clear
          >
            <a-select-option :value="true">生效</a-select-option>
            <a-select-option :value="false">失效</a-select-option>
          </a-select>
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
          <template v-if="column.key === 'visaType'">
            <a-tag :color="getVisaTypeColor(record.visaType)">
              {{ getVisaTypeLabel(record.visaType) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'isActive'">
            <a-tag :color="record.isActive ? 'green' : 'red'">
              {{ record.isActive ? '生效' : '失效' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" size="small" @click="handleViewHistory(record)">历史</a-button>
              <a-popconfirm
                title="确定要删除这条政策吗？"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 创建/编辑表单弹窗 -->
    <PolicyFormModal
      v-model:open="formModalVisible"
      :policy="currentPolicy"
      @success="handleFormSuccess"
    />

    <!-- 历史记录弹窗 -->
    <HistoryModal v-model:open="historyModalVisible" :policy-id="currentPolicyId" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getVisaPolicies, deleteVisaPolicy } from '@/api/visa'
import type { VisaPolicy, VisaPolicyQueryParams } from '@/types/visa'
import PolicyFormModal from './PolicyFormModal.vue'
import HistoryModal from './HistoryModal.vue'

const loading = ref(false)
const dataSource = ref<VisaPolicy[]>([])
const formModalVisible = ref(false)
const historyModalVisible = ref(false)
const currentPolicy = ref<VisaPolicy | null>(null)
const currentPolicyId = ref<number | null>(null)

const queryParams = reactive<VisaPolicyQueryParams>({
  page: 1,
  limit: 20,
  destinationCountryCode: undefined,
  applicantType: undefined,
  applicantCountryCode: undefined,
  visaType: undefined,
  isActive: undefined,
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
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '目的地国家',
    dataIndex: 'destinationCountryName',
    key: 'destinationCountryName',
    width: 120,
  },
  {
    title: '申请人类型',
    key: 'applicantType',
    width: 100,
    customRender: ({ record }: { record: VisaPolicy }) =>
      record.applicantType === 'nationality' ? '国籍' : '永久居民',
  },
  {
    title: '申请人',
    dataIndex: 'applicantDescription',
    key: 'applicantDescription',
    width: 150,
  },
  {
    title: '签证类型',
    key: 'visaType',
    width: 120,
  },
  {
    title: '停留期限',
    dataIndex: 'durationDays',
    key: 'durationDays',
    width: 100,
    customRender: ({ record }: { record: VisaPolicy }) =>
      record.durationDays ? `${record.durationDays} 天` : '-',
  },
  {
    title: '状态',
    key: 'isActive',
    width: 80,
  },
  {
    title: '生效日期',
    dataIndex: 'effectiveDate',
    key: 'effectiveDate',
    width: 120,
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right' as const,
  },
]

const fetchData = async () => {
  loading.value = true
  try {
    const response = await getVisaPolicies(queryParams)
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
    destinationCountryCode: undefined,
    applicantType: undefined,
    applicantCountryCode: undefined,
    visaType: undefined,
    isActive: undefined,
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
  currentPolicy.value = null
  formModalVisible.value = true
}

const handleEdit = (record: VisaPolicy) => {
  currentPolicy.value = record
  formModalVisible.value = true
}

const handleDelete = async (id: number) => {
  try {
    await deleteVisaPolicy(id)
    message.success('删除成功')
    fetchData()
  } catch (error) {
    message.error('删除失败')
  }
}

const handleViewHistory = (record: VisaPolicy) => {
  currentPolicyId.value = record.id
  historyModalVisible.value = true
}

const handleFormSuccess = () => {
  formModalVisible.value = false
  currentPolicy.value = null
  fetchData()
}

const getVisaTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'visa-free': '免签',
    'visa-on-arrival': '落地签',
    'e-visa': '电子签',
    'visa-required': '需要提前办理签证',
    'permanent-resident-benefit': '永久居民优惠',
  }
  return labels[type] || type
}

const getVisaTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'visa-free': 'green',
    'visa-on-arrival': 'blue',
    'e-visa': 'cyan',
    'visa-required': 'orange',
    'permanent-resident-benefit': 'purple',
  }
  return colors[type] || 'default'
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.policy-list {
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

