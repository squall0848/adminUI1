<template>
  <div class="product-page art-full-height">
    <ProductSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></ProductSearch>

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="tableLoading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" @click="showDialog('add')" v-ripple>新增产品</ElButton>
        </template>
      </ArtTableHeader>

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
        @sort-change="handleSortChange"
      >
      </ArtTable>

      <ProductDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :product-type="1"
        :product-data="currentProductData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { getChannelList, delProduct } from '@/api/product'
  import ProductSearch from './modules/product-search.vue'
  import ProductDialog from './modules/product-dialog.vue'
  import { ElMessageBox, ElSwitch, ElButton, ElMessage, ElTag } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'PayInProduct' })

  const showTableLoading = ref(true)
  const tableLoading = computed(() => loading.value && showTableLoading.value)

  const silentGetData = async () => {
    showTableLoading.value = false
    await getData()
    showTableLoading.value = true
  }

  const searchForm = ref<Partial<Api.Product.ProductParams>>({
    type: 1
  })

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentProductData = ref<Partial<Api.Product.ProductInfo>>({})

  const handleSwitchChange = async (
    row: Api.Product.ProductInfo,
    value: string | number | boolean
  ) => {
    const newValue = value ? 1 : 0
    row.status = newValue
    try {
      ElMessage.success('更新成功')
    } catch (error) {
      console.error('更新失败:', error)
    } finally {
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
    core: {
      apiFn: getChannelList,
      apiParams: searchForm.value,
      paginationKey: {
        current: 'pageNo',
        size: 'pageSize'
      },
      columnsFactory: (): any[] => [
        {
          prop: 'name',
          label: '产品名称',
          minWidth: 150
        },
        {
          prop: 'code',
          label: '产品编码',
          minWidth: 120
        },
        {
          prop: 'status',
          label: '产品状态',
          minWidth: 120,
          sortable: 'custom',
          formatter: (row: Api.Product.ProductInfo) => {
            return h(ElSwitch, {
              modelValue: row.status === 1,
              onChange: (val: string | number | boolean) => handleSwitchChange(row, val)
            })
          }
        },
        {
          prop: 'amount_limit',
          label: '单笔限额',
          minWidth: 200,
          formatter: (row: Api.Product.ProductInfo) => {
            if (row.amount_limit === 1) {
              return `${row.min_amount || 0} ~ ${row.max_amount || 0}`
            } else if (row.amount_limit === 2) {
              const fixedAmount = row.fixed_amount?.toString() || ''
              if (!fixedAmount) return '-'
              const amounts = fixedAmount.split('|').filter((item) => item.trim())
              if (amounts.length === 0) return '-'
              return h(
                'div',
                { class: 'flex flex-wrap gap-1 justify-center' },
                amounts.map((amount) =>
                  h(ElTag, { size: 'small', type: 'primary' }, () => amount.trim())
                )
              )
            }
            return '-'
          }
        },
        {
          prop: 'default_rate',
          label: '默认费率',
          minWidth: 120,
          formatter: (row: Api.Product.ProductInfo) => row.default_rate?.toFixed(2) || '0.00'
        },
        {
          prop: 'order_mode',
          label: '下单模式',
          minWidth: 120,
          formatter: (row: Api.Product.ProductInfo) =>
            row.order_mode === 1 ? '顺序' : row.order_mode === 2 ? '并发' : '-'
        },
        {
          prop: 'weight_mode',
          label: '权重模式',
          minWidth: 120,
          formatter: (row: Api.Product.ProductInfo) =>
            row.weight_mode === 1 ? '默认权重' : row.weight_mode === 2 ? '智能权重' : '-'
        },
        {
          prop: 'merchant_config',
          label: '商户配置',
          minWidth: 120,
          formatter: (row: Api.Product.ProductInfo) =>
            h(
              ElButton,
              {
                size: 'small',
                type: 'primary',
                link: true,
                onClick: () => handleOneClickRate(row)
              },
              () => '一键费率'
            )
        },
        {
          prop: 'channel_config',
          label: '通道配置',
          minWidth: 120,
          formatter: (row: Api.Product.ProductInfo) =>
            h(
              ElButton,
              {
                size: 'small',
                type: 'primary',
                link: true,
                onClick: () => handleOneClickWeight(row)
              },
              () => '一键权重'
            )
        },
        {
          prop: 'channel',
          label: '通道',
          minWidth: 100,
          formatter: (row: Api.Product.ProductInfo) =>
            h(
              ElButton,
              {
                size: 'small',
                type: 'primary',
                link: true,
                onClick: () => handleChannelJump(row)
              },
              () => '跳转'
            )
        },
        {
          prop: 'open_time',
          label: '开启时间',
          minWidth: 200,
          formatter: (row: Api.Product.ProductInfo) => {
            if (row.open_time && row.close_time) {
              return `${row.open_time} ~ ${row.close_time}`
            }
            return '-'
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 280,
          fixed: 'right',
          formatter: (row: Api.Product.ProductInfo) =>
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
                  type: 'primary',
                  link: true,
                  onClick: () => handleCopy(row)
                },
                () => '复制'
              ),
              h(
                ElButton,
                {
                  size: 'small',
                  type: 'primary',
                  link: true,
                  onClick: () => handleMode(row)
                },
                () => '模式'
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
      responseAdapter: (response): any => {
        return {
          records: response.pageData || [],
          total: response.total || 0
        }
      }
    }
  })

  const handleSearch = (params: Record<string, any>) => {
    const searchParamsCopy = { ...params }
    Object.assign(searchParams, searchParamsCopy)
    getData()
  }

  const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
    Object.assign(searchParams, {
      sort: prop,
      order: order === 'ascending' ? '0' : order === 'descending' ? '1' : undefined
    })
    silentGetData()
  }

  const showDialog = (type: DialogType, row?: Api.Product.ProductInfo): void => {
    dialogType.value = type
    currentProductData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const handleDialogSubmit = (): void => {
    dialogVisible.value = false
    currentProductData.value = {}
    silentGetData()
  }

  const handleOneClickRate = (row: Api.Product.ProductInfo): void => {
    console.log('一键费率:', row)
  }

  const handleOneClickWeight = (row: Api.Product.ProductInfo): void => {
    console.log('一键权重:', row)
  }

  const handleChannelJump = (row: Api.Product.ProductInfo): void => {
    console.log('通道跳转:', row)
  }

  const handleCopy = (row: Api.Product.ProductInfo): void => {
    console.log('复制产品:', row)
  }

  const handleMode = (row: Api.Product.ProductInfo): void => {
    console.log('模式:', row)
  }

  const handleDelete = (row: Api.Product.ProductInfo): void => {
    ElMessageBox.confirm(`确定要删除产品【${row.name}】吗？`, '删除产品', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        await delProduct([row.id])
        ElMessage.success('删除成功')
        silentGetData()
      } catch (error) {
        console.error('删除失败:', error)
      }
    })
  }
</script>
