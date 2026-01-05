<template>
  <ElDialog
    v-model="dialogVisible"
    title="产品配置/费率设置"
    width="900px"
    align-center
    destroy-on-close
  >
    <!-- 顶部信息和操作 -->
    <div class="header-row">
      <span class="merchant-info">商户：{{ merchantName }}</span>
      <div class="header-actions">
        <ElButton type="primary" size="small" @click="handleEnableAll">一键开启</ElButton>
        <ElButton type="warning" size="small" @click="handleUnbindAll">一键解绑</ElButton>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-row">
      <ElInput
        v-model="filterCode"
        placeholder="搜索产品编号"
        clearable
        style="width: 200px"
        @input="handleFilter"
      />
      <ElSelect
        v-model="filterStatus"
        placeholder="状态筛选"
        clearable
        style="width: 150px; margin-left: 12px"
        @change="handleFilter"
      >
        <ElOption label="全部" value="" />
        <ElOption label="已绑定" :value="1" />
        <ElOption label="未绑定" :value="0" />
      </ElSelect>
    </div>

    <!-- 数据表格 -->
    <ElTable
      :data="filteredTableData"
      border
      style="width: 100%; margin-top: 16px"
      max-height="400"
    >
      <ElTableColumn prop="name" label="产品" min-width="180">
        <template #default="{ row }">
          <div class="product-name-cell">
            <span>{{ row.name }}</span>
            <ElTag v-if="row.status === 0" type="danger" size="small" effect="dark"> 关闭 </ElTag>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="code" label="编号" width="120" />
      <ElTableColumn prop="merchant_rate" label="商户费率" width="150">
        <template #default="{ row }">
          <ElInput
            v-model="row.merchant_rate"
            type="number"
            size="small"
            placeholder="请输入"
            @change="handleRateChange(row)"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn prop="agent_rate" label="代理利润" width="150">
        <template #default="{ row }">
          <ElInput
            v-model="row.agent_rate"
            type="number"
            size="small"
            placeholder="请输入"
            @change="handleRateChange(row)"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn prop="binding" label="状态" width="100" align="center">
        <template #default="{ row }">
          <ElSwitch
            v-model="row.binding"
            :active-value="1"
            :inactive-value="0"
            @change="handleBindingChange(row)"
          />
        </template>
      </ElTableColumn>
    </ElTable>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSaveConfig">
          保存配置
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { getMerchantProductList } from '@/api/merchat'

  interface Props {
    visible: boolean
    merchantType: number
    merchantData: Partial<Api.Merchant.MerchantInfo> | null
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 商户名称
  const merchantName = computed(() => props.merchantData?.name || '-')

  // 表格数据
  const tableData = ref<Api.Merchant.ProductInfo[]>([])
  // 原始数据（用于比对变更）
  const originalData = ref<Api.Merchant.ProductInfo[]>([])

  // 筛选条件
  const filterCode = ref('')
  const filterStatus = ref<number | ''>('')

  // 提交中状态
  const submitting = ref(false)

  // 筛选后的表格数据
  const filteredTableData = computed(() => {
    return tableData.value.filter((item) => {
      // 产品编号筛选
      if (filterCode.value && !String(item.code).includes(filterCode.value)) {
        return false
      }
      // 状态筛选
      if (filterStatus.value !== '' && item.binding !== filterStatus.value) {
        return false
      }
      return true
    })
  })

  // 获取产品列表
  const fetchProductList = async () => {
    if (!props.merchantData?.id) return

    try {
      const res = await getMerchantProductList({
        type: props.merchantType,
        merchant_id: props.merchantData.id
      })
      // 深拷贝数据
      tableData.value = (res || []).map((item) => ({ ...item }))
      originalData.value = (res || []).map((item) => ({ ...item }))
    } catch (error) {
      console.error('获取产品列表失败', error)
      tableData.value = []
      originalData.value = []
    }
  }

  // 监听弹窗打开
  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        filterCode.value = ''
        filterStatus.value = ''
        fetchProductList()
      }
    }
  )

  // 筛选处理
  const handleFilter = () => {
    // computed 会自动处理
  }

  // 一键开启
  const handleEnableAll = () => {
    tableData.value.forEach((item) => {
      item.binding = 1
    })
    ElMessage.success('已全部开启')
  }

  // 一键解绑
  const handleUnbindAll = () => {
    tableData.value.forEach((item) => {
      item.binding = 0
    })
    ElMessage.success('已全部解绑')
  }

  // 费率变更处理
  const handleRateChange = (row: Api.Merchant.ProductInfo) => {
    console.log('费率变更:', row)
  }

  // 绑定状态变更处理
  const handleBindingChange = (row: Api.Merchant.ProductInfo) => {
    console.log('绑定状态变更:', row)
  }

  // 获取变更的数据
  const getChangedData = () => {
    const changed: Api.Merchant.ProductInfo[] = []

    tableData.value.forEach((item) => {
      const original = originalData.value.find((o) => o.id === item.id)
      if (!original) return

      // 检查是否有变更
      if (
        item.binding !== original.binding ||
        Number(item.merchant_rate) !== Number(original.merchant_rate) ||
        Number(item.agent_rate) !== Number(original.agent_rate)
      ) {
        changed.push(item)
      }
    })

    return changed
  }

  // 保存配置
  const handleSaveConfig = async () => {
    const changedData = getChangedData()

    if (changedData.length === 0) {
      ElMessage.warning('没有修改任何内容')
      return
    }

    submitting.value = true

    try {
      // TODO: 调用保存接口
      console.log('保存配置，变更数据:', changedData)
      ElMessage.success('保存成功')
      dialogVisible.value = false
      emit('submit')
    } catch (error) {
      console.error('保存失败', error)
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped>
  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .merchant-info {
    font-size: 14px;
    font-weight: 500;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .filter-row {
    display: flex;
    align-items: center;
  }

  .product-name-cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
</style>
