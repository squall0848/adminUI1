<template>
  <ElDialog v-model="dialogVisible" title="绑定通道" width="1000px" align-center destroy-on-close>
    <!-- 顶部信息和操作 -->
    <div class="header-row">
      <span class="merchant-info">商户名称：{{ merchantName }}</span>
      <ElInput
        v-model="filterKeyword"
        placeholder="搜索产品编码或名称"
        clearable
        style="width: 200px; margin-left: 16px"
      />
      <div class="header-actions">
        <ElButton type="primary" size="small" @click="handleEnableAll">全部开启</ElButton>
        <ElButton type="warning" size="small" @click="handleUnbindAll">全部解绑</ElButton>
      </div>
    </div>

    <!-- 主体内容：左侧标签栏 + 右侧表格 -->
    <div class="main-content">
      <!-- 左侧标签栏 -->
      <div class="tab-list">
        <div
          v-for="item in filteredChannelList"
          :key="item.id"
          class="tab-item"
          :class="{ active: activeTabId === item.id }"
          @click="handleTabClick(item)"
        >
          【{{ item.code }}】{{ item.name }}
        </div>
        <div v-if="filteredChannelList.length === 0" class="tab-empty">暂无数据</div>
      </div>

      <!-- 右侧内容 -->
      <div class="content-area">
        <template v-if="activeChannel">
          <!-- 顶部费率信息和全选 -->
          <div class="content-header">
            <div class="rate-info">
              <span>商户费率：{{ activeChannel.merchant_rate }}</span>
              <span style="margin-left: 24px">商户代理费率：{{ activeChannel.agent_rate }}</span>
            </div>
            <ElCheckbox v-model="isAllSelected" @change="handleSelectAll">全选</ElCheckbox>
          </div>

          <!-- 通道表格 -->
          <ElTable
            :data="activeChannel.list"
            border
            style="width: 100%"
            :max-height="300"
            scrollbar-always-on
          >
            <ElTableColumn width="60" align="center">
              <template #default="{ row }">
                <ElCheckbox
                  v-model="row.binding"
                  :true-value="1"
                  :false-value="0"
                  @change="handleBindingChange"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="name" label="通道名称" min-width="180">
              <template #default="{ row }">
                <div class="channel-name-cell">
                  <span>{{ row.name }}</span>
                  <ElTag :type="row.status === 1 ? 'success' : 'danger'" size="small" effect="dark">
                    {{ row.status === 1 ? '开启' : '关闭' }}
                  </ElTag>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="weight" label="权重" width="100" align="center">
              <template #default="{ row }">
                <ElInput
                  v-model="row.weight"
                  type="number"
                  size="small"
                  placeholder="请输入"
                  @input="handleWeightChange"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="channel_rate" label="通道费率" width="120" align="center" />
            <ElTableColumn prop="agent_rate" label="通道代理费率" width="120" align="center" />
            <ElTableColumn label="利润率" width="120" align="center">
              <template #default="{ row }">
                {{ (activeChannel!.merchant_rate - row.channel_rate - row.agent_rate).toFixed(4) }}
              </template>
            </ElTableColumn>
          </ElTable>
        </template>
        <div v-else class="content-empty">请选择左侧产品</div>
      </div>
    </div>

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
  import { getMerchantChannelList, saveMerchantChannel, dealMerchantChannel } from '@/api/merchat'

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

  // 通道列表数据
  const channelList = ref<Api.Merchant.ChannelBindingInfo[]>([])
  // 原始数据（用于比对变更）
  const originalData = ref<Api.Merchant.ChannelBindingInfo[]>([])

  // 筛选关键字
  const filterKeyword = ref('')

  // 当前激活的标签ID
  const activeTabId = ref<number | null>(null)

  // 提交中状态
  const submitting = ref(false)

  // 批量操作类型：null-无批量操作, 'enable'-全部开启, 'unbind'-全部解绑
  // 用于判断保存时是否使用一键处理接口
  const batchOperationType = ref<'enable' | 'unbind' | null>(null)

  // 筛选后的通道列表
  const filteredChannelList = computed(() => {
    if (!filterKeyword.value) {
      return channelList.value
    }
    const keyword = filterKeyword.value.toLowerCase()
    return channelList.value.filter((item) => {
      const matchCode = String(item.code).includes(filterKeyword.value)
      const matchName = item.name.toLowerCase().includes(keyword)
      return matchCode || matchName
    })
  })

  // 当前激活的通道数据
  const activeChannel = computed(() => {
    if (!activeTabId.value) return null
    return channelList.value.find((item) => item.id === activeTabId.value) || null
  })

  // 是否全选
  const isAllSelected = computed({
    get: () => {
      if (!activeChannel.value || activeChannel.value.list.length === 0) return false
      return activeChannel.value.list.every((item) => item.binding === 1)
    },
    set: () => {
      // 通过 handleSelectAll 处理
    }
  })

  // 获取通道列表
  const fetchChannelList = async () => {
    if (!props.merchantData?.id) return

    try {
      const res = await getMerchantChannelList({
        type: props.merchantType,
        merchant_id: props.merchantData.id
      })
      // 处理 list 可能不存在的情况
      const processedData = (res || []).map((item) => ({
        ...item,
        list: item.list || []
      }))
      // 深拷贝数据 - 使用 JSON 方式确保完全独立
      channelList.value = JSON.parse(JSON.stringify(processedData))
      originalData.value = JSON.parse(JSON.stringify(processedData))

      // 默认选中第一个
      if (channelList.value.length > 0) {
        activeTabId.value = channelList.value[0].id
      }
    } catch (error) {
      console.error('获取通道列表失败', error)
      channelList.value = []
      originalData.value = []
    }
  }

  // 监听弹窗打开
  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        filterKeyword.value = ''
        activeTabId.value = null
        batchOperationType.value = null // 重置批量操作状态
        fetchChannelList()
      }
    }
  )

  // 点击标签
  const handleTabClick = (item: Api.Merchant.ChannelBindingInfo) => {
    activeTabId.value = item.id
  }

  // 全部开启（所有产品的所有通道）
  const handleEnableAll = () => {
    channelList.value.forEach((channel) => {
      channel.list.forEach((item) => {
        item.binding = 1
      })
    })
    batchOperationType.value = 'enable' // 标记为全部开启
    ElMessage.success('已全部开启')
  }

  // 全部解绑（所有产品的所有通道）
  const handleUnbindAll = () => {
    channelList.value.forEach((channel) => {
      channel.list.forEach((item) => {
        item.binding = 0
      })
    })
    batchOperationType.value = 'unbind' // 标记为全部解绑
    ElMessage.success('已全部解绑')
  }

  // 全选/取消全选当前产品的通道
  const handleSelectAll = (val: boolean | string | number) => {
    if (!activeChannel.value) return
    activeChannel.value.list.forEach((item) => {
      item.binding = val ? 1 : 0
    })
    // 手动操作后清除批量操作标记
    batchOperationType.value = null
  }

  // 绑定状态变更
  const handleBindingChange = () => {
    // 手动操作后清除批量操作标记
    batchOperationType.value = null
  }

  // 权重变更
  const handleWeightChange = () => {
    // 手动操作后清除批量操作标记
    batchOperationType.value = null
  }

  // 获取变更的数据
  const getChangedData = (): Api.Merchant.MerchantChannelBindingUpdate[] => {
    const changed: Api.Merchant.MerchantChannelBindingUpdate[] = []

    channelList.value.forEach((product) => {
      const originalProduct = originalData.value.find((o) => o.id === product.id)
      if (!originalProduct) return

      product.list.forEach((channel) => {
        const originalChannel = originalProduct.list.find((o) => o.id === channel.id)
        if (!originalChannel) return

        // 使用字符串比较避免精度问题
        const currentWeight = String(channel.weight ?? '')
        const originalWeight = String(originalChannel.weight ?? '')

        if (channel.binding !== originalChannel.binding || currentWeight !== originalWeight) {
          changed.push({
            channel_id: channel.id || 0,
            product_id: product.id || 0,
            weight: Number(channel.weight) || 0,
            binding: channel.binding ?? 0
          })
        }
      })
    })

    return changed
  }

  // 保存配置
  const handleSaveConfig = async () => {
    if (!props.merchantData?.id) {
      ElMessage.error('商户信息不存在')
      return
    }

    // 检查是否使用一键处理接口
    if (batchOperationType.value !== null) {
      // 使用一键处理接口
      submitting.value = true
      try {
        await dealMerchantChannel({
          merchant_id: props.merchantData.id,
          save: batchOperationType.value === 'enable' ? 1 : 0
        })
        ElMessage.success('保存成功')
        dialogVisible.value = false
        emit('submit')
      } catch (error) {
        console.error('保存失败', error)
      } finally {
        submitting.value = false
      }
      return
    }

    // 使用常规保存接口
    const changedData = getChangedData()

    if (changedData.length === 0) {
      ElMessage.warning('没有修改任何内容')
      return
    }

    submitting.value = true

    try {
      await saveMerchantChannel(props.merchantData.id, changedData)
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
    margin-bottom: 16px;
  }

  .merchant-info {
    font-size: 14px;
    font-weight: 500;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }

  .main-content {
    display: flex;
    min-height: 400px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
  }

  .tab-list {
    width: 200px;
    max-height: 400px;
    overflow-y: auto;
    border-right: 1px solid #ebeef5;
  }

  .tab-item {
    padding: 12px 16px;
    overflow: hidden;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    border-bottom: 1px solid #ebeef5;
    transition: background-color 0.2s;
  }

  .tab-item:hover {
    background-color: #f5f7fa;
  }

  .tab-item.active {
    font-weight: 500;
    color: #409eff;
    background-color: #ecf5ff;
  }

  .tab-empty {
    padding: 24px;
    font-size: 13px;
    color: #909399;
    text-align: center;
  }

  .content-area {
    flex: 1;
    padding: 16px;
    overflow: hidden;
  }

  .content-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .rate-info {
    font-size: 14px;
    color: #606266;
  }

  .content-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 14px;
    color: #909399;
  }

  .channel-name-cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
</style>
