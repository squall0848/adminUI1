<!-- 代收商户组页面 -->
<template>
  <div class="merchant-group-page art-full-height">
    <!-- 搜索栏 -->
    <ElCard class="search-card" shadow="never">
      <ElForm :inline="true" :model="searchForm" class="search-form">
        <ElFormItem label="商户组名称：">
          <ElInput
            v-model="searchForm.search"
            placeholder="请输入商户组名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch" :loading="tableLoading">查询</ElButton>
          <ElButton @click="resetSearchParams">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="tableLoading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增代收商户组</ElButton>
            <ElButton
              type="danger"
              @click="handleBatchDelete"
              :disabled="!selectedRows.length"
              v-ripple
              >批量删除</ElButton
            >
            <!-- <ElButton @click="handleBatchSettle" :disabled="!selectedRows.length" v-ripple
              >批量结算</ElButton
            > -->
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

      <!-- 商户组弹窗 -->
      <MerchantGroupDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :merchant-type="1"
        :merchant-group-data="currentMerchantGroupData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { getMerchantGroupList, delMerchantGroup } from '@/api/merchant'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import MerchantGroupDialog from './modules/merchant-group-dialog.vue'
  import { DialogType } from '@/types'
  import { h } from 'vue'
  import { ElButton } from 'element-plus'

  defineOptions({ name: 'PayInMerchantGroup' })

  // 表格配置
  const { data, loading, pagination, columns, columnChecks, getData, refreshData, searchParams } =
    useTable({
      core: {
        apiFn: getMerchantGroupList,
        apiParams: {
          type: 1,
          pageNo: 1,
          pageSize: 10
        },
        paginationKey: {
          current: 'pageNo',
          size: 'pageSize'
        },
        columnsFactory: () => [
          {
            type: 'selection',
            width: 55,
            fixed: 'left'
          },
          {
            prop: 'name',
            label: '商户组名称',
            minWidth: 150
          },
          {
            prop: 'merchant_count',
            label: '商户数',
            width: 100,
            formatter: (row: Api.Merchant.MerchantGroup) => row.merchant_count ?? 0
          },
          {
            prop: 'remark',
            label: '描述',
            minWidth: 200,
            formatter: (row: Api.Merchant.MerchantGroup) => row.remark || '-'
          },
          {
            prop: 'create_time',
            label: '创建时间',
            width: 180
          },
          {
            prop: 'update_time',
            label: '更新时间',
            width: 180
          },
          {
            prop: 'operation',
            label: '操作',
            width: 150,
            fixed: 'right',
            formatter: (row: Api.Merchant.MerchantGroup) =>
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
      transform: {
        responseAdapter: (response: Api.Merchant.MerchantGroupList): any => ({
          data: response.pageData || [],
          total: response.total || 0
        })
      }
    })

  // 控制是否显示表格 loading（用于静默刷新）
  const showTableLoading = ref(true)
  const tableLoading = computed(() => loading.value && showTableLoading.value)

  // 静默刷新数据（不显示 loading）
  const silentGetData = async () => {
    showTableLoading.value = false
    await getData()
    showTableLoading.value = true
  }

  // 搜索表单（用于UI显示）
  const searchForm = ref({
    search: ''
  })

  // 选中行
  const selectedRows = ref<Api.Merchant.MerchantGroup[]>([])

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentMerchantGroupData = ref<Partial<Api.Merchant.MerchantGroup>>({})

  /**
   * 显示弹窗
   */
  const showDialog = (type: DialogType, row?: Api.Merchant.MerchantGroup) => {
    dialogType.value = type
    currentMerchantGroupData.value = row ? { ...row } : {}
    dialogVisible.value = true
  }

  /**
   * 弹窗提交
   */
  const handleDialogSubmit = () => {
    silentGetData()
  }

  /**
   * 查询
   */
  const handleSearch = () => {
    if (searchParams) {
      searchParams.pageNo = 1
      searchParams.search = searchForm.value.search || undefined
      getData()
    }
  }

  /**
   * 重置搜索参数
   */
  const resetSearchParams = () => {
    searchForm.value.search = ''
    if (searchParams) {
      searchParams.pageNo = 1
      searchParams.search = undefined
      getData()
    }
  }

  /**
   * 分页大小变化
   */
  const handleSizeChange = (size: number) => {
    if (searchParams) {
      searchParams.pageSize = size
      searchParams.pageNo = 1
      getData()
    }
  }

  /**
   * 当前页变化
   */
  const handleCurrentChange = (current: number) => {
    if (searchParams) {
      searchParams.pageNo = current
      getData()
    }
  }

  /**
   * 选中行变化
   */
  const handleSelectionChange = (rows: Api.Merchant.MerchantGroup[]) => {
    selectedRows.value = rows
  }

  /**
   * 删除商户组
   */
  const handleDelete = async (row: Api.Merchant.MerchantGroup) => {
    try {
      await ElMessageBox.confirm(`确定要删除商户组"${row.name}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await delMerchantGroup([row.id])
      ElMessage.success('删除成功')
      silentGetData()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除失败', error)
        ElMessage.error('删除失败')
      }
    }
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的商户组')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个商户组吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      const ids = selectedRows.value.map((row) => row.id)
      await delMerchantGroup(ids)
      ElMessage.success('批量删除成功')
      selectedRows.value = [] // 清空选中项
      silentGetData()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('批量删除失败', error)
        ElMessage.error('批量删除失败')
      }
    }
  }

  /**
   * 批量结算
   */
  // const handleBatchSettle = async () => {
  //   if (selectedRows.value.length === 0) {
  //     ElMessage.warning('请选择要结算的商户组')
  //     return
  //   }

  //   try {
  //     await ElMessageBox.confirm(
  //       `确定要对选中的 ${selectedRows.value.length} 个商户组进行批量结算吗？`,
  //       '提示',
  //       {
  //         confirmButtonText: '确定',
  //         cancelButtonText: '取消',
  //         type: 'warning'
  //       }
  //     )
  //     // TODO: 调用批量结算接口
  //     ElMessage.success('批量结算成功')
  //     refreshData()
  //   } catch {
  //     // 用户取消操作
  //   }
  // }

  // 初始化时获取数据
  onMounted(() => {
    getData()
  })
</script>

<style scoped lang="scss">
  .merchant-group-page {
    padding: 16px;
  }

  .search-card {
    margin-bottom: 16px;
  }

  .search-form {
    margin-bottom: 0;
  }
</style>
