<!-- 代收通道商页面 -->
<template>
  <div class="channel-merchant-page art-full-height">
    <!-- 搜索栏 -->
    <ChannelMerchantSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></ChannelMerchantSearch>

    <!-- 统计数据栏 -->
    <ElCard class="stats-card" shadow="never">
      <div class="stats-row">
        <div class="stats-item">
          <span class="stats-label">通道商数量：</span>
          <span class="stats-value">{{ statsData.merchantCount }}</span>
        </div>
        <!-- 预留其他统计字段 -->
      </div>
    </ElCard>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="tableLoading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增通道商</ElButton>
            <ElButton
              type="danger"
              @click="handleBatchDelete"
              :disabled="!selectedRows.length"
              v-ripple
              >批量删除</ElButton
            >
            <ElButton @click="handleExport" v-ripple>导出</ElButton>
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
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
        @sort-change="handleSortChange"
      >
      </ArtTable>

      <!-- 通道商弹窗 -->
      <ChannelMerchantDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :channel-merchant-type="1"
        :channel-merchant-data="currentChannelMerchantData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { getChannelMerchantList } from '@/api/channel'
  import { exportToExcel, type ExportColumnConfig } from '@/utils/common/tools'
  import ChannelMerchantSearch from './modules/channel-merchant-search.vue'
  import ChannelMerchantDialog from './modules/channel-merchant-dialog.vue'
  import {
    ElCard,
    ElSpace,
    ElMessageBox,
    ElSwitch,
    ElButton,
    ElMessage,
    ElInputNumber
  } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'PayInChannelMerchant' })

  // 控制是否显示表格 loading（用于静默刷新）
  const showTableLoading = ref(true)
  const tableLoading = computed(() => loading.value && showTableLoading.value)

  // 静默刷新数据（不显示 loading）
  const silentGetData = async () => {
    showTableLoading.value = false
    await getData()
    showTableLoading.value = true
  }

  // 选中行
  const selectedRows = ref<Api.Channel.ChannelMerchant[]>([])

  // 搜索表单
  const searchForm = ref<Partial<Api.Channel.ChannelMerchantListParams>>({
    type: 1, // 代收通道商
    sort: 'id'
  })

  // 统计数据
  const statsData = reactive({
    merchantCount: 0
  })

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentChannelMerchantData = ref<Partial<Api.Channel.ChannelMerchant>>({})

  // 开关字段类型
  type SwitchField = 'status' | 'accept_callback' | 'auto_settle'

  /**
   * 开关状态切换处理
   */
  const handleSwitchChange = async (
    row: Api.Channel.ChannelMerchant,
    field: SwitchField,
    value: string | number | boolean
  ) => {
    const newValue = value ? 1 : 0

    // 先更新本地数据，避免闪烁
    row[field] = newValue

    try {
      // TODO: 调用更新接口
      // await updateChannelMerchant({
      //   id: row.id,
      //   [field]: newValue
      // })
      ElMessage.success('更新成功')
    } catch (error) {
      console.error('更新失败:', error)
    } finally {
      // 静默刷新数据（不显示 loading）
      await silentGetData()
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
      apiFn: getChannelMerchantList,
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
          label: '通道商名称',
          minWidth: 150,
          formatter: (row: Api.Channel.ChannelMerchant) => row.name || '-'
        },
        {
          prop: 'balance',
          label: '余额',
          minWidth: 120,
          sortable: 'custom',
          formatter: (row: Api.Channel.ChannelMerchant) => row.balance?.toFixed(2) || '0.00'
        },
        {
          prop: 'advance',
          label: '预付',
          minWidth: 120,
          sortable: 'custom',
          formatter: (row: Api.Channel.ChannelMerchant) => row.advance?.toFixed(2) || '0.00'
        },
        {
          prop: 'accept_callback',
          label: '接收回调',
          minWidth: 120,
          formatter: (row: Api.Channel.ChannelMerchant) => {
            return h(ElSwitch, {
              modelValue: row.accept_callback === 1,
              onChange: (val: string | number | boolean) =>
                handleSwitchChange(row, 'accept_callback', val)
            })
          }
        },
        {
          prop: 'status',
          label: '状态',
          minWidth: 100,
          sortable: 'custom',
          formatter: (row: Api.Channel.ChannelMerchant) => {
            return h(ElSwitch, {
              modelValue: row.status === 1,
              onChange: (val: string | number | boolean) => handleSwitchChange(row, 'status', val)
            })
          }
        },
        {
          prop: 'auto_settle',
          label: '自动结算',
          minWidth: 120,
          formatter: (row: Api.Channel.ChannelMerchant) => {
            return h(ElSwitch, {
              modelValue: row.auto_settle === 1,
              onChange: (val: string | number | boolean) =>
                handleSwitchChange(row, 'auto_settle', val)
            })
          }
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 150,
          formatter: (row: Api.Channel.ChannelMerchant) => row.remark || '-'
        },
        {
          prop: 'tg_group_id',
          label: '群组ID',
          minWidth: 120,
          formatter: (row: Api.Channel.ChannelMerchant) =>
            h('div', { class: 'flex items-center justify-center gap-2' }, [
              h('span', row.tg_group_id?.toString() || '-'),
              h(
                ElButton,
                {
                  size: 'small',
                  type: 'primary',
                  link: true,
                  onClick: () => handleEditGroupId(row)
                },
                () => h('i', { class: 'ri:pencil-line' })
              )
            ])
        },
        {
          prop: 'create_time',
          label: '创建时间',
          minWidth: 180,
          sortable: 'custom',
          formatter: (row: Api.Channel.ChannelMerchant) => row.create_time || '-'
        },
        {
          prop: 'update_time',
          label: '更新时间',
          minWidth: 180,
          sortable: 'custom',
          formatter: (row: Api.Channel.ChannelMerchant) => row.update_time || '-'
        },
        {
          prop: 'operation',
          label: '操作',
          width: 150,
          fixed: 'right',
          formatter: (row: Api.Channel.ChannelMerchant) =>
            h('div', { class: 'flex items-center justify-center gap-1' }, [
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
                  type: 'danger',
                  link: true,
                  onClick: () => handleDelete(row)
                },
                () => '删除'
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
        statsData.merchantCount = response.total || 0
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
    const searchParamsCopy = { ...params }
    // 搜索参数赋值
    Object.assign(searchParams, searchParamsCopy)
    getData()
  }

  /**
   * 排序变化处理
   */
  const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
    // 排序参数：sort-排序字段名，order-排序方向(0:asc, 1:desc)
    Object.assign(searchParams, {
      sort: prop,
      order: order === 'ascending' ? '0' : order === 'descending' ? '1' : undefined
    })
    silentGetData()
  }

  /**
   * 编辑群组ID
   */
  const handleEditGroupId = async (row: Api.Channel.ChannelMerchant): Promise<void> => {
    const formData = reactive({
      tg_group_id: row.tg_group_id || 0
    })

    try {
      await ElMessageBox({
        title: `编辑群组ID - ${row.name}`,
        message: () =>
          h('div', { style: 'padding: 10px 0' }, [
            h('div', { style: 'margin-bottom: 8px; font-weight: 500' }, '群组ID'),
            h(ElInputNumber, {
              modelValue: formData.tg_group_id,
              'onUpdate:modelValue': (val: number | undefined) => {
                formData.tg_group_id = val ?? 0
              },
              min: 0,
              step: 1,
              controlsPosition: 'right',
              style: 'width: 100%'
            })
          ]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            if (formData.tg_group_id === row.tg_group_id) {
              ElMessage.warning('群组ID未修改')
              return
            }
            instance.confirmButtonLoading = true
            try {
              // TODO: 调用更新接口
              // await updateChannelMerchant({
              //   id: row.id,
              //   tg_group_id: formData.tg_group_id
              // })
              ElMessage.success('群组ID更新成功')
              silentGetData()
              done()
            } catch (error) {
              console.error('群组ID更新失败', error)
            } finally {
              instance.confirmButtonLoading = false
            }
          } else {
            done()
          }
        }
      })
    } catch {
      // 用户取消操作
    }
  }

  /**
   * 显示通道商弹窗
   */
  const showDialog = (type: DialogType, row?: Api.Channel.ChannelMerchant): void => {
    dialogType.value = type
    currentChannelMerchantData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 弹窗提交回调
   */
  const handleDialogSubmit = (): void => {
    dialogVisible.value = false
    currentChannelMerchantData.value = {}
    silentGetData()
  }

  /**
   * 删除通道商
   */
  const handleDelete = (row: Api.Channel.ChannelMerchant): void => {
    ElMessageBox.confirm(`确定要删除通道商【${row.name}】吗？`, '删除通道商', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        // TODO: 调用删除接口
        // await delChannelMerchant([row.id])
        ElMessage.success('删除成功')
        silentGetData()
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
      ElMessage.warning('请先选择要删除的通道商')
      return
    }
    ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个通道商吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        // TODO: 调用批量删除接口
        // const ids = selectedRows.value.map((item) => item.id)
        // await delChannelMerchant(ids)
        ElMessage.success('删除成功')
        silentGetData()
      } catch (error) {
        console.error('批量删除失败:', error)
      }
    })
  }

  /**
   * 导出表格数据
   */
  const handleExport = async (): Promise<void> => {
    // 定义导出列配置
    const exportColumns: ExportColumnConfig[] = [
      { label: '通道商名称', prop: 'name', type: 'text', width: 20 },
      { label: '余额', prop: 'balance', type: 'number', width: 15 },
      { label: '预付', prop: 'advance', type: 'number', width: 15 },
      { label: '接收回调', prop: 'accept_callback', type: 'switch', width: 12 },
      { label: '状态', prop: 'status', type: 'switch', width: 10 },
      { label: '自动结算', prop: 'auto_settle', type: 'switch', width: 12 },
      { label: '备注', prop: 'remark', type: 'text', width: 20 },
      { label: '群组ID', prop: 'tg_group_id', type: 'text', width: 12 },
      { label: '创建时间', prop: 'create_time', type: 'text', width: 20 },
      { label: '更新时间', prop: 'update_time', type: 'text', width: 20 }
    ]

    await exportToExcel({
      data: data.value,
      columns: exportColumns,
      filename: '代收通道商列表',
      sheetName: '通道商数据',
      autoIndex: true
    })
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: Api.Channel.ChannelMerchant[]): void => {
    selectedRows.value = selection
  }
</script>

<style scoped lang="scss">
  .channel-merchant-page {
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
            margin-right: 8px;
            font-size: 14px;
            color: #606266;
          }

          .stats-value {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
        }
      }
    }
  }
</style>
