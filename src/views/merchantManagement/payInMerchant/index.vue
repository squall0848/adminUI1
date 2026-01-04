<!-- 代收商户页面 -->
<template>
  <div class="merchant-page art-full-height">
    <!-- 搜索栏 -->
    <MerchantSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></MerchantSearch>

    <!-- 统计数据栏 -->
    <ElCard class="stats-card" shadow="never">
      <div class="stats-row">
        <div class="stats-item">
          <span class="stats-label">商户数量：</span>
          <span class="stats-value">{{ statsData.merchantCount }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">余额总额：</span>
          <span class="stats-value">{{ statsData.totalBalance }}</span>
        </div>
        <!-- <div class="stats-item">
          <span class="stats-label">可用余额：</span>
          <span class="stats-value">{{ statsData.availableBalance }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">冻结余额：</span>
          <span class="stats-value">{{ statsData.frozenBalance }}</span>
        </div> -->
        <div class="stats-item">
          <span class="stats-label">总预付：</span>
          <span class="stats-value">{{ statsData.totalPrepay }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">剩余预付：</span>
          <span class="stats-value">{{ statsData.remainPrepay }}</span>
        </div>
      </div>
    </ElCard>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增商户</ElButton>
            <ElButton
              type="danger"
              @click="handleBatchDelete"
              :disabled="!selectedRows.length"
              v-ripple
              >批量删除</ElButton
            >
            <ElButton @click="handleBatchUpdateProduct" :disabled="!selectedRows.length" v-ripple
              >批量更新产品配置</ElButton
            >
            <ElButton @click="handleBatchLimit" :disabled="!selectedRows.length" v-ripple
              >批量限额</ElButton
            >
            <ElButton @click="handleBatchProductStatus" :disabled="!selectedRows.length" v-ripple
              >批量设置产品状态</ElButton
            >
            <ElButton @click="handleBatchSettle" :disabled="!selectedRows.length" v-ripple
              >批量结算</ElButton
            >
            <ElButton @click="handleDockingInfo" v-ripple>对接信息</ElButton>
            <ElButton @click="handleExport" v-ripple>导出</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        :border="true"
        :cell-style="{ textAlign: 'center' }"
        :header-cell-style="{ textAlign: 'center' }"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
        @sort-change="handleSortChange"
      >
      </ArtTable>

      <!-- 商户弹窗 -->
      <MerchantDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :merchant-data="currentMerchantData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { getMerchant, delMerchant } from '@/api/merchat'
  import MerchantSearch from './modules/merchant-search.vue'
  import MerchantDialog from './modules/merchant-dialog.vue'
  import {
    ElMessageBox,
    ElSwitch,
    ElButton,
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem
  } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'PayInMerchant' })

  // 统计数据
  const statsData = ref({
    merchantCount: 0,
    totalBalance: '0.00',
    availableBalance: '0.00',
    frozenBalance: '0.00',
    totalPrepay: '0.00',
    remainPrepay: '0.00'
  })

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentMerchantData = ref<Partial<Api.Merchant.MerchantInfo>>({})

  // 选中行
  const selectedRows = ref<Api.Merchant.MerchantInfo[]>([])

  // 搜索表单
  const searchForm = ref<Partial<Api.Merchant.MerchantListParams>>({
    type: '1', // 代收商户
    sort: 'id'
  })

  /**
   * 更新统计数据
   */
  const updateStatsData = (response: Api.Merchant.MerchantList) => {
    statsData.value = {
      merchantCount: response.total || 0,
      totalBalance: response.total_payin_balance?.toFixed(2) || '0.00',
      availableBalance: '0.00', // 待确定
      frozenBalance: '0.00', // 待确定
      totalPrepay: response.total_advance?.toFixed(2) || '0.00',
      remainPrepay: (response.total_payin_balance - response.total_advance)?.toFixed(2) || '0.00' // 待确定
    }
  }

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
      apiFn: getMerchant,
      apiParams: searchForm.value,
      // 分页字段映射
      paginationKey: {
        current: 'pageNo',
        size: 'pageSize'
      },
      columnsFactory: (): any[] => [
        { type: 'selection' }, // 勾选列
        {
          prop: 'name',
          label: '商户名称',
          minWidth: 150,
          formatter: (row: Api.Merchant.MerchantInfo) =>
            h('div', { class: 'flex items-center justify-between gap-2' }, [
              h('span', { class: 'truncate' }, row.name || '-'),
              h('div', { class: 'flex-shrink-0' }, [
                h(
                  ElButton,
                  { size: 'small', type: 'primary', link: true, onClick: () => handleTest(row) },
                  () => '测试'
                ),
                h(
                  ElButton,
                  { size: 'small', type: 'primary', link: true, onClick: () => handleDetail(row) },
                  () => '详情'
                )
              ])
            ])
        },
        {
          prop: 'code',
          label: '商户号',
          minWidth: 200,
          visible: false,
          formatter: (row: Api.Merchant.MerchantInfo) => row.code || '-'
        },
        // {
        //   prop: 'secret',
        //   label: '密钥',
        //   minWidth: 200,
        //   formatter: (row: Api.Merchant.MerchantInfo) => row.secret || '-'
        // },
        {
          prop: 'payin_balance',
          label: '余额',
          minWidth: 100,
          sortable: 'custom',
          formatter: (row: Api.Merchant.MerchantInfo) =>
            h('div', { class: 'flex items-center justify-between gap-2' }, [
              h('span', row.payin_balance?.toFixed(2) || '0.00'),
              h('div', { class: 'flex-shrink-0' }, [
                h(
                  ElButton,
                  {
                    size: 'small',
                    type: 'primary',
                    link: true,
                    onClick: () => handleAdjustBalance(row)
                  },
                  () => '调额'
                )
              ])
            ])
        },
        {
          prop: 'payin_advance',
          label: '总预付',
          minWidth: 150,
          sortable: 'custom',
          formatter: (row: Api.Merchant.MerchantInfo) =>
            h('div', { class: 'flex items-center justify-between gap-2' }, [
              h('span', row.payin_advance?.toFixed(2) || '0.00'),
              h('div', { class: 'flex-shrink-0' }, [
                h(
                  ElButton,
                  {
                    size: 'small',
                    type: 'primary',
                    link: true,
                    onClick: () => handleAdjustPrepay(row)
                  },
                  () => '调额'
                ),
                h(
                  ElButton,
                  {
                    size: 'small',
                    type: 'primary',
                    link: true,
                    onClick: () => handlePrepayDetail(row)
                  },
                  () => '明细'
                )
              ])
            ])
        },
        {
          prop: 'payout_balance',
          label: '剩余预付',
          minWidth: 150,
          sortable: 'custom',
          formatter: (row: Api.Merchant.MerchantInfo) =>
            h('div', { class: 'flex items-center justify-between gap-2' }, [
              h('span', row.payout_balance?.toFixed(2) || '0.00'),
              h('div', { class: 'flex-shrink-0' }, [
                h(
                  ElButton,
                  {
                    size: 'small',
                    type: 'primary',
                    link: true,
                    onClick: () => handleAdjustRemainPrepay(row)
                  },
                  () => '调额'
                ),
                h(
                  ElButton,
                  {
                    size: 'small',
                    type: 'primary',
                    link: true,
                    onClick: () => handleSettle(row)
                  },
                  () => '结算'
                )
              ])
            ])
        },
        {
          prop: 'status',
          label: '商户状态',
          minWidth: 120,
          sortable: 'custom',
          formatter: (row: Api.Merchant.MerchantInfo) => {
            return h(ElSwitch, {
              modelValue: row.status === 1,
              disabled: true
            })
          }
        },
        {
          prop: 'auto_settle',
          label: '自动结算',
          minWidth: 100,
          formatter: (row: Api.Merchant.MerchantInfo) => {
            return h(ElSwitch, {
              modelValue: row.auto_settle === 1,
              disabled: true
            })
          }
        },
        {
          prop: 'receive_group_notice',
          label: '接收群通知',
          minWidth: 100,
          formatter: (row: Api.Merchant.MerchantInfo) => {
            return h(ElSwitch, {
              modelValue: row.receive_group_notice === 1,
              disabled: true
            })
          }
        },
        {
          prop: 'settle_notice',
          label: '结算通知',
          minWidth: 100,
          formatter: (row: Api.Merchant.MerchantInfo) => {
            return h(ElSwitch, {
              modelValue: row.settle_notice === 1,
              disabled: true
            })
          }
        },
        {
          prop: 'rate_change_notice',
          label: '费率修改通知',
          minWidth: 120,
          formatter: (row: Api.Merchant.MerchantInfo) => {
            return h(ElSwitch, {
              modelValue: row.rate_change_notice === 1,
              disabled: true
            })
          }
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 100,
          showOverflowTooltip: true,
          formatter: (row: Api.Merchant.MerchantInfo) => row.remark || '-'
        },
        {
          prop: 'tg_group_id',
          label: '群组ID',
          minWidth: 100,
          formatter: (row: Api.Merchant.MerchantInfo) =>
            h('div', { class: 'flex items-center justify-between gap-2' }, [
              h('span', { class: 'truncate' }, row.tg_group_id || '-'),
              h('div', { class: 'flex-shrink-0' }, [
                h(ArtButtonTable, {
                  type: 'edit',
                  onClick: () => handleEditGroupId(row)
                })
              ])
            ])
        },
        {
          prop: 'agent',
          label: '代理名称',
          minWidth: 120,
          formatter: (row: Api.Merchant.MerchantInfo) => row.agent || '-'
        },
        {
          prop: 'class',
          label: '商户组',
          minWidth: 100,
          formatter: (row: Api.Merchant.MerchantInfo) => row.class || '-'
        },
        {
          prop: 'telegram_name',
          label: '群发@飞机号',
          minWidth: 120,
          formatter: (row: Api.Merchant.MerchantInfo) =>
            h('div', { class: 'flex items-center justify-between gap-2' }, [
              h('span', { class: 'truncate' }, row.telegram_name || '-'),
              h('div', { class: 'flex-shrink-0' }, [
                h(ArtButtonTable, {
                  type: 'edit',
                  onClick: () => handleEditTelegram(row)
                })
              ])
            ])
        },
        {
          prop: 'operation',
          label: '操作',
          width: 220,
          fixed: 'right',
          formatter: (row: Api.Merchant.MerchantInfo) =>
            h('div', { class: 'flex items-center gap-1' }, [
              h(
                ElButton,
                {
                  size: 'small',
                  type: 'primary',
                  link: true,
                  onClick: () => showDialog('edit', row)
                },
                () => '编辑'
              ),
              h(
                ElButton,
                {
                  size: 'small',
                  type: 'primary',
                  link: true,
                  onClick: () => handleRateConfig(row)
                },
                () => '费率配置'
              ),
              h(
                ElButton,
                {
                  size: 'small',
                  type: 'primary',
                  link: true,
                  onClick: () => handleBindChannel(row)
                },
                () => '绑定通道'
              ),
              h(
                ElDropdown,
                {
                  trigger: 'click',
                  onCommand: (command: string) => handleMoreCommand(command, row)
                },
                {
                  default: () =>
                    h(ElButton, { size: 'small', type: 'primary', link: true }, () => '更多'),
                  dropdown: () =>
                    h(ElDropdownMenu, null, () => [
                      h(ElDropdownItem, { command: 'resetPassword' }, () => '重置密码'),
                      h(ElDropdownItem, { command: 'resetSecret' }, () => '重置密钥'),
                      h(ElDropdownItem, { command: 'loginMerchant' }, () => '登录商户'),
                      h(ElDropdownItem, { command: 'delete', divided: true }, () =>
                        h('span', { class: 'text-red-500' }, '删除')
                      )
                    ])
                }
              )
            ])
        }
      ]
    },
    // 数据处理
    transform: {
      // 响应数据适配器 - 将 pageData 转换为标准 records 格式
      responseAdapter: (response): any => {
        // 更新统计数据
        updateStatsData(response)
        return {
          records: response.pageData || [],
          total: response.total || 0
        }
      }
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    console.log(params)
    // 搜索参数赋值
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 排序变化处理
   */
  const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
    console.log('排序变化:', prop, order)
    // 排序参数：sort-排序字段名，order-排序方向(0:asc, 1:desc)
    Object.assign(searchParams, {
      sort: prop,
      order: order === 'ascending' ? '0' : order === 'descending' ? '1' : undefined
    })
    getData()
  }

  /**
   * 调整余额
   */
  const handleAdjustBalance = (row: Api.Merchant.MerchantInfo): void => {
    console.log('调整余额:', row)
    // TODO: 实现调额逻辑
  }

  /**
   * 调整预付
   */
  const handleAdjustPrepay = (row: Api.Merchant.MerchantInfo): void => {
    console.log('调整预付:', row)
    // TODO: 实现预付调额逻辑
  }

  /**
   * 预付明细
   */
  const handlePrepayDetail = (row: Api.Merchant.MerchantInfo): void => {
    console.log('预付明细:', row)
    // TODO: 实现预付明细逻辑
  }

  /**
   * 调整剩余预付
   */
  const handleAdjustRemainPrepay = (row: Api.Merchant.MerchantInfo): void => {
    console.log('调整剩余预付:', row)
    // TODO: 实现剩余预付调额逻辑
  }

  /**
   * 结算
   */
  const handleSettle = (row: Api.Merchant.MerchantInfo): void => {
    console.log('结算:', row)
    // TODO: 实现结算逻辑
  }

  /**
   * 编辑群组ID
   */
  const handleEditGroupId = (row: Api.Merchant.MerchantInfo): void => {
    console.log('编辑群组ID:', row)
    // TODO: 实现编辑群组ID逻辑
  }

  /**
   * 编辑飞机号
   */
  const handleEditTelegram = (row: Api.Merchant.MerchantInfo): void => {
    console.log('编辑飞机号:', row)
    // TODO: 实现编辑飞机号逻辑
  }

  /**
   * 费率配置
   */
  const handleRateConfig = (row: Api.Merchant.MerchantInfo): void => {
    console.log('费率配置:', row)
    // TODO: 实现费率配置逻辑
  }

  /**
   * 绑定通道
   */
  const handleBindChannel = (row: Api.Merchant.MerchantInfo): void => {
    console.log('绑定通道:', row)
    // TODO: 实现绑定通道逻辑
  }

  /**
   * 更多操作命令处理
   */
  const handleMoreCommand = (command: string, row: Api.Merchant.MerchantInfo): void => {
    switch (command) {
      case 'resetPassword':
        handleResetPassword(row)
        break
      case 'resetSecret':
        handleResetSecret(row)
        break
      case 'loginMerchant':
        handleLoginMerchant(row)
        break
      case 'delete':
        deleteMerchant(row)
        break
    }
  }

  /**
   * 重置密码
   */
  const handleResetPassword = (row: Api.Merchant.MerchantInfo): void => {
    console.log('重置密码:', row)
    ElMessageBox.confirm(`确定要重置商户【${row.name}】的密码吗？`, '重置密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // TODO: 调用重置密码接口
      ElMessage.success('密码重置成功')
    })
  }

  /**
   * 重置密钥
   */
  const handleResetSecret = (row: Api.Merchant.MerchantInfo): void => {
    console.log('重置密钥:', row)
    ElMessageBox.confirm(`确定要重置商户【${row.name}】的密钥吗？`, '重置密钥', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // TODO: 调用重置密钥接口
      ElMessage.success('密钥重置成功')
    })
  }

  /**
   * 登录商户
   */
  const handleLoginMerchant = (row: Api.Merchant.MerchantInfo): void => {
    console.log('登录商户:', row)
    // TODO: 实现登录商户逻辑
  }

  /**
   * 测试商户
   */
  const handleTest = (row: Api.Merchant.MerchantInfo): void => {
    console.log('测试商户:', row)
    // TODO: 实现测试逻辑
  }

  /**
   * 查看商户详情
   */
  const handleDetail = (row: Api.Merchant.MerchantInfo): void => {
    console.log('查看详情:', row)
    // TODO: 实现查看详情逻辑
  }

  /**
   * 显示商户弹窗
   */
  const showDialog = (type: DialogType, row?: Api.Merchant.MerchantInfo): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentMerchantData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除商户
   */
  const deleteMerchant = (row: Api.Merchant.MerchantInfo): void => {
    console.log('删除商户:', row)
    ElMessageBox.confirm(`确定要删除商户【${row.name}】吗？`, '删除商户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        await delMerchant([row.id])
        ElMessage.success('删除成功')
        getData()
      } catch (error) {
        console.error('删除失败:', error)
      }
    })
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = (): void => {
    if (!selectedRows.value.length) {
      ElMessage.warning('请先选择要删除的商户')
      return
    }
    ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个商户吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        const ids = selectedRows.value.map((item) => item.id)
        await delMerchant(ids)
        ElMessage.success('删除成功')
        getData()
      } catch (error) {
        console.error('批量删除失败:', error)
      }
    })
  }

  /**
   * 批量更新产品配置
   */
  const handleBatchUpdateProduct = (): void => {
    if (!selectedRows.value.length) {
      ElMessage.warning('请先选择商户')
      return
    }
    // TODO: 实现批量更新产品配置逻辑
    console.log(
      '批量更新产品配置:',
      selectedRows.value.map((item) => item.id)
    )
  }

  /**
   * 批量限额
   */
  const handleBatchLimit = (): void => {
    if (!selectedRows.value.length) {
      ElMessage.warning('请先选择商户')
      return
    }
    // TODO: 实现批量限额逻辑
    console.log(
      '批量限额:',
      selectedRows.value.map((item) => item.id)
    )
  }

  /**
   * 批量设置产品状态
   */
  const handleBatchProductStatus = (): void => {
    if (!selectedRows.value.length) {
      ElMessage.warning('请先选择商户')
      return
    }
    // TODO: 实现批量设置产品状态逻辑
    console.log(
      '批量设置产品状态:',
      selectedRows.value.map((item) => item.id)
    )
  }

  /**
   * 批量结算
   */
  const handleBatchSettle = (): void => {
    if (!selectedRows.value.length) {
      ElMessage.warning('请先选择商户')
      return
    }
    // TODO: 实现批量结算逻辑
    console.log(
      '批量结算:',
      selectedRows.value.map((item) => item.id)
    )
  }

  /**
   * 对接信息
   */
  const handleDockingInfo = (): void => {
    console.log('对接信息')
    // TODO: 实现对接信息逻辑
  }

  /**
   * 导出
   */
  const handleExport = (): void => {
    // TODO: 实现导出逻辑
    console.log('导出数据')
    ElMessage.info('导出功能开发中')
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentMerchantData.value = {}
      getData()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: Api.Merchant.MerchantInfo[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>

<style scoped lang="scss">
  .merchant-page {
    .stats-card {
      margin-bottom: 16px;

      .stats-row {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;

        .stats-item {
          display: flex;
          align-items: center;

          .stats-label {
            font-size: 14px;
            color: var(--el-text-color-secondary);
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
