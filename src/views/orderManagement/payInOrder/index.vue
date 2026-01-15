<!-- 代收订单列表页面 -->
<template>
  <div class="order-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      ref="searchBarRef"
      v-model="searchForm"
      :items="formItems"
      :rules="rules"
      @reset="handleReset"
      @search="handleSearch"
    >
    </ArtSearchBar>

    <!-- 总订单数 -->
    <ElCard class="stats-card" shadow="never">
      <div class="stats-row">
        <div class="stats-item">
          <span class="stats-label">总订单数：</span>
          <span class="stats-value">{{ totalOrderCount }}</span>
        </div>
      </div>
    </ElCard>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="tableLoading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="handleExport" v-ripple>导出</ElButton>
            <ElButton @click="handleBatchConvertOrderNo" v-ripple>一键转单号</ElButton>
          </ElSpace>
        </template>
        <template #right>
          <ElSpace wrap>
            <ElSelect
              v-model="refreshInterval"
              style="width: 100px"
              :disabled="!autoRefreshEnabled"
              @change="handleRefreshIntervalChange"
            >
              <ElOption label="5秒" :value="5" />
              <ElOption label="15秒" :value="15" />
              <ElOption label="30秒" :value="30" />
              <ElOption label="60秒" :value="60" />
            </ElSelect>
            <ElSwitch
              v-model="autoRefreshEnabled"
              active-text="自动刷新"
              @change="handleAutoRefreshChange"
            />
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="tableLoading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        :border="true"
        :cell-style="{ textAlign: 'center' }"
        :header-cell-style="{ textAlign: 'center' }"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 订单详情弹窗 -->
      <OrderDetailDialog v-model:visible="orderDetailVisible" :order-id="currentOrderId" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { getOrderList } from '@/api/order'
  import { getProductMap } from '@/api/product'
  import { exportToExcel, type ExportColumnConfig } from '@/utils/common/tools'
  import OrderDetailDialog from './modules/order-detail-dialog.vue'
  import { ElButton, ElSpace, ElSelect, ElOption, ElSwitch, ElMessage, ElTag } from 'element-plus'
  import { h, ref, computed, onUnmounted, onMounted } from 'vue'

  defineOptions({ name: 'PayInOrder' })

  // 控制是否显示表格 loading（用于静默刷新）
  const showTableLoading = ref(true)
  const tableLoading = computed(() => loading.value && showTableLoading.value)

  // 静默刷新数据（不显示 loading）
  const silentGetData = async () => {
    showTableLoading.value = false
    await getData()
    showTableLoading.value = true
  }

  // 总订单数
  const totalOrderCount = ref(0)

  // 搜索表单
  const searchForm = ref<Partial<Api.Order.OrderListParams>>({
    type: 1, // 代收订单
    pageNo: 1,
    pageSize: 10
  })

  // 搜索栏引用
  const searchBarRef = ref()

  // 校验规则
  const rules = {}

  // 表单配置
  const formItems = computed(() => [
    {
      label: '订单号',
      key: 'search',
      type: 'input',
      placeholder: '请输入商户订单号/通道订单号/系统订单号',
      clearable: true
    }
  ])

  // 产品映射 (id -> name)
  const productMap = ref<Map<number, string>>(new Map())

  // 获取产品映射数据
  const fetchProductMap = async () => {
    try {
      const res = await getProductMap({ type: 1 }) // type: 1 代收
      const map = new Map<number, string>()
      ;(res.pageData || []).forEach((item) => {
        map.set(item.id, item.name)
      })
      productMap.value = map
    } catch (error) {
      console.error('获取产品数据失败', error)
    }
  }

  // 初始化获取产品映射数据
  onMounted(() => {
    fetchProductMap()
  })

  // 自动刷新相关
  const autoRefreshEnabled = ref(false)
  const refreshInterval = ref(30) // 默认30秒
  let refreshTimer: ReturnType<typeof setInterval> | null = null

  // 处理自动刷新开关变化
  const handleAutoRefreshChange = (value: string | number | boolean) => {
    const boolValue = !!value
    if (boolValue) {
      startAutoRefresh()
    } else {
      stopAutoRefresh()
    }
  }

  // 处理刷新频率变化
  const handleRefreshIntervalChange = () => {
    if (autoRefreshEnabled.value) {
      stopAutoRefresh()
      startAutoRefresh()
    }
  }

  // 开始自动刷新
  const startAutoRefresh = () => {
    stopAutoRefresh()
    refreshTimer = setInterval(() => {
      silentGetData()
    }, refreshInterval.value * 1000)
  }

  // 停止自动刷新
  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  // 组件卸载时清理定时器
  onUnmounted(() => {
    stopAutoRefresh()
  })

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: getOrderList,
      apiParams: searchForm.value,
      // 分页字段映射
      paginationKey: {
        current: 'pageNo',
        size: 'pageSize'
      },
      columnsFactory: (): any[] => [
        {
          prop: 'merchant_order_no',
          label: '商户单号',
          minWidth: 250,
          formatter: (row: Api.Order.OrderInfo) => row.merchant_order_no || '-'
        },
        {
          prop: 'system_order_no',
          label: '系统单号',
          minWidth: 250,
          formatter: (row: Api.Order.OrderInfo) => row.system_order_no || '-'
        },
        {
          prop: 'merchant_name',
          label: '商户信息',
          minWidth: 150,
          formatter: (row: Api.Order.OrderInfo) => row.merchant_name || '-'
        },
        {
          prop: 'rate',
          label: '商户/通道',
          minWidth: 150,
          formatter: (row: Api.Order.OrderInfo) =>
            `${row.merchant_rate || 0}/${row.channel_rate || 0}`
        },
        {
          prop: 'channel_name',
          label: '通道名称',
          minWidth: 150,
          formatter: (row: Api.Order.OrderInfo) => row.channel_name || '-'
        },
        {
          prop: 'product_id',
          label: '产品信息',
          minWidth: 150,
          formatter: (row: Api.Order.OrderInfo) => {
            if (!row.product_id) return '-'
            // 优先使用接口返回的 product_name，如果没有则使用 productMap
            const productName = row.product_name || productMap.value.get(row.product_id) || '-'
            // 格式：【code/id】name，由于getProductMap只返回id和name，使用id作为code
            return productName !== '-'
              ? `【${row.product_id}】${productName}`
              : `【${row.product_id}】-`
          }
        },
        {
          prop: 'order_amount',
          label: '订单金额',
          minWidth: 120,
          formatter: (row: Api.Order.OrderInfo) => row.order_amount?.toFixed(2) || '0.00'
        },
        {
          prop: 'status',
          label: '订单状态',
          minWidth: 100,
          formatter: (row: Api.Order.OrderInfo) => {
            const statusMap: Record<number, { text: string; type: string }> = {
              0: { text: '待支付', type: 'info' },
              1: { text: '支付成功', type: 'success' },
              2: { text: '支付失败', type: 'danger' },
              3: { text: '冲正', type: 'warning' },
              4: { text: '未出码', type: 'info' },
              5: { text: '超时关闭', type: 'info' }
            }
            const status = statusMap[row.status] || { text: '-', type: 'info' }
            return h(ElTag, { type: status.type as any }, () => status.text)
          }
        },
        {
          prop: 'callback_status',
          label: '回调状态',
          minWidth: 100,
          formatter: (row: Api.Order.OrderInfo) => {
            const statusMap: Record<number, { text: string; type: string }> = {
              0: { text: '未通知', type: 'info' },
              1: { text: '通知成功', type: 'success' },
              2: { text: '通知中', type: 'warning' },
              3: { text: '超过重试次数', type: 'danger' }
            }
            const status = statusMap[row.callback_status] || { text: '-', type: 'info' }
            return h(ElTag, { type: status.type as any }, () => status.text)
          }
        },
        {
          prop: 'create_time',
          label: '创建时间',
          minWidth: 180,
          formatter: (row: Api.Order.OrderInfo) => row.create_time || '-'
        },
        {
          prop: 'pay_time',
          label: '支付时间',
          minWidth: 180,
          formatter: (row: Api.Order.OrderInfo) => row.pay_time || '-'
        },
        {
          prop: 'user_ip',
          label: '用户IP',
          minWidth: 130,
          formatter: (row: Api.Order.OrderInfo) => row.user_ip || '-'
        },
        {
          prop: 'channel_order_no',
          label: '通道单号',
          minWidth: 250,
          formatter: (row: Api.Order.OrderInfo) => (row.channel_order_no || '-').toString()
        },
        {
          prop: 'operation',
          label: '操作',
          width: 400,
          fixed: 'right',
          formatter: (row: Api.Order.OrderInfo) =>
            h('div', { class: 'flex items-center justify-center gap-1' }, [
              h(
                ElButton,
                {
                  size: 'small',
                  type: 'primary',
                  link: true,
                  onClick: () => handleDetail(row)
                },
                () => '详情'
              ),
              h(
                ElButton,
                {
                  size: 'small',
                  type: 'primary',
                  link: true,
                  onClick: () => handleQueryOrder(row)
                },
                () => '查单'
              ),
              h(
                ElButton,
                {
                  size: 'small',
                  type: 'primary',
                  link: true,
                  onClick: () => handleChargeback(row)
                },
                () => '冲销'
              ),
              h(
                ElButton,
                {
                  size: 'small',
                  type: 'primary',
                  link: true,
                  onClick: () => handleSupplementOrder(row)
                },
                () => '补单'
              ),
              h(
                ElButton,
                {
                  size: 'small',
                  type: 'primary',
                  link: true,
                  onClick: () => handleAdjust(row)
                },
                () => '调账'
              ),
              h(
                ElButton,
                {
                  size: 'small',
                  type: 'primary',
                  link: true,
                  onClick: () => handleCreateOrder(row)
                },
                () => '创单'
              )
            ])
        }
      ]
    },
    // 数据处理
    transform: {
      // 响应数据适配器 - 将 pageData 转换为标准 records 格式
      responseAdapter: (response): any => {
        // 更新总订单数
        totalOrderCount.value = response.total || 0
        return {
          records: response.pageData || [],
          total: response.total || 0
        }
      }
    },
    // 生命周期钩子
    hooks: {
      onSuccess: (data, response) => {
        // 更新总订单数
        totalOrderCount.value = response.total || 0
      }
    }
  })

  /**
   * 搜索处理
   */
  const handleSearch = () => {
    // 搜索参数赋值
    Object.assign(searchParams, searchForm.value)
    getData()
  }

  /**
   * 重置搜索
   */
  const handleReset = () => {
    resetSearchParams()
    getData()
  }

  /**
   * 导出
   */
  const handleExport = async () => {
    if (!data.value || data.value.length === 0) {
      ElMessage.warning('没有可导出的数据')
      return
    }

    const exportColumns: ExportColumnConfig[] = [
      { label: '商户单号', prop: 'merchant_order_no', width: 20 },
      { label: '系统单号', prop: 'system_order_no', width: 20 },
      { label: '商户名', prop: 'merchant_name', width: 15 },
      { label: '商户费率', prop: 'merchant_rate', type: 'number', width: 15 },
      { label: '通道费率', prop: 'channel_rate', type: 'number', width: 15 },
      { label: '通道名', prop: 'channel_name', width: 15 },
      { label: '产品ID', prop: 'product_id', width: 15 },
      { label: '订单金额', prop: 'order_amount', type: 'number', width: 15 },
      { label: '订单状态', prop: 'status', width: 12 },
      { label: '回调状态', prop: 'callback_status', width: 12 },
      { label: '创建时间', prop: 'create_time', width: 20 },
      { label: '支付时间', prop: 'pay_time', width: 20 },
      { label: '用户IP', prop: 'user_ip', width: 15 },
      { label: '通道单号', prop: 'channel_order_no', width: 20 }
    ]

    try {
      await exportToExcel({
        data: data.value,
        columns: exportColumns,
        filename: '代收订单列表',
        autoIndex: true
      })
    } catch (error) {
      console.error('导出失败:', error)
    }
  }

  /**
   * 一键转单号
   */
  const handleBatchConvertOrderNo = () => {
    ElMessage.info('一键转单号功能待实现')
  }

  // 订单详情弹窗相关
  const orderDetailVisible = ref(false)
  const currentOrderId = ref<number | undefined>(undefined)

  /**
   * 详情
   */
  const handleDetail = (row: Api.Order.OrderInfo) => {
    currentOrderId.value = row.id
    orderDetailVisible.value = true
  }

  /**
   * 查单
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleQueryOrder = (_row: Api.Order.OrderInfo) => {
    ElMessage.info('查单功能待实现')
  }

  /**
   * 冲销
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChargeback = (_row: Api.Order.OrderInfo) => {
    ElMessage.info('冲销功能待实现')
  }

  /**
   * 补单
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSupplementOrder = (_row: Api.Order.OrderInfo) => {
    ElMessage.info('补单功能待实现')
  }

  /**
   * 调账
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAdjust = (_row: Api.Order.OrderInfo) => {
    ElMessage.info('调账功能待实现')
  }

  /**
   * 创单
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreateOrder = (_row: Api.Order.OrderInfo) => {
    ElMessage.info('创单功能待实现')
  }
</script>

<style lang="scss" scoped>
  .order-page {
    .stats-card {
      margin-bottom: 16px;

      .stats-row {
        display: flex;
        flex-wrap: wrap;
        gap: 32px;
        align-items: center;

        .stats-item {
          display: flex;
          gap: 8px;
          align-items: center;

          .stats-label {
            font-size: 14px;
            color: var(--el-text-color-regular);
          }

          .stats-value {
            font-size: 16px;
            font-weight: 600;
            color: var(--el-color-primary);
          }
        }
      }
    }
  }
</style>
