<template>
  <a-modal
    v-model:open="modalVisible"
    title="政策变更历史"
    :width="900"
    :footer="null"
  >
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="false"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-tag :color="getActionColor(record.action)">
            {{ getActionLabel(record.action) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'changes'">
          <a-button type="link" size="small" @click="handleViewChanges(record)">查看变更</a-button>
        </template>
      </template>
    </a-table>

    <!-- 变更详情弹窗 -->
    <a-modal
      v-model:open="changesModalVisible"
      title="变更详情"
      :width="700"
      :footer="null"
    >
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="操作类型">
          <a-tag :color="getActionColor(currentRecord?.action || '')">
            {{ getActionLabel(currentRecord?.action || '') }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="操作人">{{ currentRecord?.changedBy }}</a-descriptions-item>
        <a-descriptions-item label="操作时间">
          {{ formatDate(currentRecord?.changedAt) }}
        </a-descriptions-item>
      </a-descriptions>
      <a-divider>变更内容</a-divider>
      <a-row :gutter="16">
        <a-col :span="12">
          <h4>变更前</h4>
          <pre v-if="currentRecord?.oldData" class="json-view">{{
            JSON.stringify(currentRecord.oldData, null, 2)
          }}</pre>
          <a-empty v-else description="无数据" />
        </a-col>
        <a-col :span="12">
          <h4>变更后</h4>
          <pre v-if="currentRecord?.newData" class="json-view">{{
            JSON.stringify(currentRecord.newData, null, 2)
          }}</pre>
          <a-empty v-else description="无数据" />
        </a-col>
      </a-row>
    </a-modal>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getPolicyHistory } from '@/api/visa'
import type { PolicyHistory } from '@/types/visa'

interface Props {
  open: boolean
  policyId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  policyId: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const loading = ref(false)
const dataSource = ref<PolicyHistory[]>([])
const changesModalVisible = ref(false)
const currentRecord = ref<PolicyHistory | null>(null)

const modalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const columns = [
  {
    title: '操作类型',
    key: 'action',
    width: 120,
  },
  {
    title: '操作人',
    dataIndex: 'changedBy',
    key: 'changedBy',
    width: 120,
  },
  {
    title: '操作时间',
    dataIndex: 'changedAt',
    key: 'changedAt',
    width: 180,
    customRender: ({ record }: { record: PolicyHistory }) => formatDate(record.changedAt),
  },
  {
    title: '操作',
    key: 'changes',
    width: 100,
  },
]

// 监听 policyId 变化，加载历史记录
watch(
  () => [props.open, props.policyId],
  ([open, id]) => {
    if (open && id) {
      fetchHistory(id)
    }
  },
  { immediate: true }
)

const fetchHistory = async (id: number) => {
  loading.value = true
  try {
    const response = await getPolicyHistory(id)
    if (response.success && response.data) {
      dataSource.value = response.data
    }
  } catch (error) {
    message.error('获取历史记录失败')
  } finally {
    loading.value = false
  }
}

const handleViewChanges = (record: PolicyHistory) => {
  currentRecord.value = record
  changesModalVisible.value = true
}

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    created: '创建',
    updated: '更新',
    deleted: '删除',
  }
  return labels[action] || action
}

const getActionColor = (action: string) => {
  const colors: Record<string, string> = {
    created: 'green',
    updated: 'blue',
    deleted: 'red',
  }
  return colors[action] || 'default'
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
.json-view {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 400px;
  overflow: auto;
  margin: 0;
}
</style>

