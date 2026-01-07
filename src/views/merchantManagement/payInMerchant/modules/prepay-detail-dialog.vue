<template>
  <ElDialog
    v-model="dialogVisible"
    title="商户总预付明细"
    width="800px"
    align-center
    destroy-on-close
  >
    <!-- 商户信息 -->
    <div class="merchant-info">
      <span class="info-item">
        <span class="label">商户ID：</span>
        <span class="value">{{ merchantData?.id || '-' }}</span>
      </span>
      <span class="info-item">
        <span class="label">商户名称：</span>
        <span class="value">{{ merchantData?.name || '-' }}</span>
      </span>
      <span class="info-item">
        <span class="label">总预付：</span>
        <span class="value">{{ merchantData?.payin_advance?.toFixed(2) || '0.00' }}</span>
      </span>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-row">
      <ElSelect v-model="timeType" placeholder="选择时间范围" style="width: 150px">
        <ElOption
          v-for="item in timeTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </ElSelect>
      <div class="filter-actions">
        <ElButton @click="handleReset">重置</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSearch">查询</ElButton>
      </div>
    </div>

    <!-- 数据表格 -->
    <ElTable
      :data="tableData"
      border
      style="width: 100%; margin-top: 16px"
      :max-height="350"
      v-loading="loading"
    >
      <ElTableColumn prop="create_time" label="操作时间" width="180" align="center" />
      <ElTableColumn prop="amount" label="变更金额" width="150" align="center">
        <template #default="{ row }">
          <span :class="row.amount >= 0 ? 'amount-positive' : 'amount-negative'">
            {{ row.amount >= 0 ? '+' : '' }}{{ row.amount?.toFixed(2) || '0.00' }}
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="type" label="类型" width="180" align="center">
        <template #default="{ row }">
          {{ typeMap[row.type] || '-' }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="remark"
        label="备注"
        min-width="200"
        align="center"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ row.remark || '-' }}
        </template>
      </ElTableColumn>
    </ElTable>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">关闭</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { getMerchantTotalPrepayDataList } from '@/api/merchat'

  interface Props {
    visible: boolean
    merchantType: number
    merchantData: Partial<Api.Merchant.MerchantInfo> | null
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 时间类型选项
  const timeTypeOptions = [
    { label: '今天', value: 1 },
    { label: '昨天', value: 2 },
    { label: '前天', value: 3 },
    { label: '近三天', value: 4 },
    { label: '近七天', value: 5 },
    { label: '本周', value: 6 },
    { label: '本月', value: 7 }
  ]

  // 筛选条件
  const timeType = ref(1) // 默认今天

  // 表格数据
  const tableData = ref<Api.Merchant.MerchantTotalPrepayData[]>([])

  // 加载状态
  const loading = ref(false)

  // 类型映射
  const typeMap: Record<number, string> = {
    1: '商户总预付减少(清算)',
    2: '商户总预付'
  }

  // 获取明细数据
  const fetchData = async () => {
    if (!props.merchantData?.id) return

    loading.value = true
    try {
      const res = await getMerchantTotalPrepayDataList({
        type: props.merchantType,
        merchant_id: props.merchantData.id,
        time_type: timeType.value
      })
      tableData.value = res || []
    } catch (error) {
      console.error('获取总预付明细失败', error)
      tableData.value = []
    } finally {
      loading.value = false
    }
  }

  // 重置
  const handleReset = () => {
    timeType.value = 1
    fetchData()
  }

  // 查询
  const handleSearch = () => {
    fetchData()
  }

  // 监听弹窗打开
  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        timeType.value = 1 // 重置为今天
        fetchData()
      }
    }
  )
</script>

<style scoped>
  .merchant-info {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    padding: 12px 16px;
    margin-bottom: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  .info-item {
    font-size: 14px;
  }

  .info-item .label {
    color: #606266;
  }

  .info-item .value {
    font-weight: 500;
    color: #303133;
  }

  .filter-row {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .filter-actions {
    display: flex;
    gap: 12px;
    margin-left: auto;
  }

  .amount-positive {
    font-weight: 500;
    color: #67c23a;
  }

  .amount-negative {
    font-weight: 500;
    color: #f56c6c;
  }
</style>
