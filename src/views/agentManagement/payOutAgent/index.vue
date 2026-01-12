<!-- 代付代理页面 -->
<template>
  <div class="agent-page art-full-height">
    <!-- 搜索栏 -->
    <AgentSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></AgentSearch>

    <!-- 统计数据栏 -->
    <ElCard class="stats-card" shadow="never">
      <div class="stats-row">
        <div class="stats-item">
          <span class="stats-label">代理数量：</span>
          <span class="stats-value">{{ statsData.agentCount }}</span>
        </div>
      </div>
    </ElCard>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="tableLoading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增代理</ElButton>
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
      >
      </ArtTable>

      <!-- 代理弹窗 -->
      <AgentDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :agent-type="2"
        :agent-data="currentAgentData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { getAgentList, delAgent, updateAgent } from '@/api/agent'
  import { exportToExcel, type ExportColumnConfig } from '@/utils/common/tools'
  import AgentSearch from '../payInAgent/modules/agent-search.vue'
  import AgentDialog from '../payInAgent/modules/agent-dialog.vue'
  import { ElMessageBox, ElSwitch, ElButton, ElMessage } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'PayOutAgent' })

  // 统计数据
  const statsData = ref({
    agentCount: 0
  })

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentAgentData = ref<Partial<Api.Agent.AgentInfo>>({})

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
  const selectedRows = ref<Api.Agent.AgentInfo[]>([])

  // 搜索表单
  const searchForm = ref<Partial<Api.Agent.AgentParams>>({
    type: 2 // 代付代理
  })

  /**
   * 更新统计数据
   */
  const updateStatsData = (response: Api.Agent.AgentInfoList) => {
    statsData.value = {
      agentCount: response.total || 0
    }
  }

  /**
   * 开关状态切换处理
   */
  const handleSwitchChange = async (row: Api.Agent.AgentInfo, value: string | number | boolean) => {
    const newValue = value ? 1 : 0

    // 先更新本地数据，避免闪烁
    row.status = newValue

    try {
      await updateAgent({
        id: row.id,
        status: newValue
      })
      ElMessage.success('更新成功')
    } catch (error) {
      // 恢复原值
      row.status = newValue === 1 ? 0 : 1
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
      apiFn: getAgentList,
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
          label: '代理名称',
          minWidth: 200,
          formatter: (row: Api.Agent.AgentInfo) => row.name || '-'
        },
        {
          prop: 'balance',
          label: '余额',
          minWidth: 200,
          formatter: (row: Api.Agent.AgentInfo) => row.balance?.toFixed(2) || '0.00'
        },
        {
          prop: 'create_time',
          label: '创建时间',
          minWidth: 200,
          formatter: (row: Api.Agent.AgentInfo) => row.create_time || '-'
        },
        {
          prop: 'status',
          label: '代理状态',
          minWidth: 120,
          formatter: (row: Api.Agent.AgentInfo) => {
            return h(ElSwitch, {
              modelValue: row.status === 1,
              onChange: (val: string | number | boolean) => handleSwitchChange(row, val)
            })
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 200,
          fixed: 'right',
          formatter: (row: Api.Agent.AgentInfo) =>
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
   * 显示代理弹窗
   */
  const showDialog = (type: DialogType, row?: Api.Agent.AgentInfo): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentAgentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除代理
   */
  const handleDelete = (row: Api.Agent.AgentInfo): void => {
    console.log('删除代理:', row)
    ElMessageBox.confirm(`确定要删除代理【${row.name}】吗？`, '删除代理', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        await delAgent([row.id])
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
      ElMessage.warning('请先选择要删除的代理')
      return
    }
    ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个代理吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        const ids = selectedRows.value.map((item) => item.id)
        await delAgent(ids)
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
      { label: '代理名称', prop: 'name', type: 'text', width: 20 },
      { label: '代理编号', prop: 'code', type: 'text', width: 20 },
      { label: '余额', prop: 'balance', type: 'number', width: 15 },
      { label: '代理状态', prop: 'status', type: 'switch', width: 12 },
      { label: '创建时间', prop: 'create_time', type: 'text', width: 25 }
    ]

    await exportToExcel({
      data: data.value,
      columns: exportColumns,
      filename: '代付代理列表',
      sheetName: '代理数据',
      autoIndex: true
    })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentAgentData.value = {}
      silentGetData()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: Api.Agent.AgentInfo[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>

<style scoped lang="scss">
  .agent-page {
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
