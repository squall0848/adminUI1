<!-- 代收通道页面 -->
<template>
  <div class="channel-page art-full-height">
    <!-- 搜索栏 -->
    <ChannelSearch
      v-model="searchForm"
      :channel-merchant-options="channelMerchantOptions"
      :product-options="productOptions"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></ChannelSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="tableLoading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增通道</ElButton>
            <ElButton
              type="danger"
              @click="handleBatchDelete"
              :disabled="!selectedRows.length"
              v-ripple
              >批量删除</ElButton
            >
            <ElButton @click="handleBatchUpdateRate" :disabled="!selectedRows.length" v-ripple
              >批量更新费率</ElButton
            >
            <!-- <ElButton @click="handleBatchLimit" :disabled="!selectedRows.length" v-ripple
              >批量限额配置</ElButton
            > -->
            <ElButton @click="handleBatchCallback" :disabled="!selectedRows.length" v-ripple
              >批量回调</ElButton
            >
            <ElButton @click="handleBatchOpen" :disabled="!selectedRows.length" v-ripple
              >批量开启</ElButton
            >
            <ElButton @click="handleBatchClose" :disabled="!selectedRows.length" v-ripple
              >批量关闭</ElButton
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

      <!-- 通道弹窗 -->
      <ChannelDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :channel-type="1"
        :channel-merchant-options="channelMerchantOptions"
        :agent-options="agentOptions"
        :product-options="productOptions"
        :channel-data="currentChannelData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import {
    getChannelList,
    delChannel,
    updateChannel,
    getChannelMerchantInfoList
  } from '@/api/channel'
  import { getProductMap } from '@/api/product'
  import { getAgentMap } from '@/api/agent'
  import { exportToExcel, type ExportColumnConfig } from '@/utils/common/tools'
  import ChannelSearch from './modules/channel-search.vue'
  import ChannelDialog from './modules/channel-dialog.vue'
  import {
    ElMessageBox,
    ElSwitch,
    ElButton,
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem,
    ElMessage,
    ElTag,
    ElInputNumber,
    ElRadioGroup,
    ElRadio
  } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'PayInChannel' })

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
  const selectedRows = ref<Api.Channel.ChannelInfo[]>([])

  // 搜索表单
  const searchForm = ref<Partial<Api.Channel.ChannelParams>>({
    type: 1, // 代收通道
    sort: 'id'
  })

  // 通道商映射 (id -> name)
  const channelMerchantMap = ref<Map<number, string>>(new Map())

  // 通道商选项列表（用于下拉框）
  const channelMerchantOptions = computed(() =>
    Array.from(channelMerchantMap.value.entries()).map(([id, name]) => ({
      label: name,
      value: id
    }))
  )

  // 获取通道商映射数据
  const fetchChannelMerchantMap = async () => {
    try {
      const res = await getChannelMerchantInfoList({ type: 1 })
      const map = new Map<number, string>()
      ;(res.pageData || []).forEach((item) => {
        map.set(item.id, item.name)
      })
      channelMerchantMap.value = map
    } catch (error) {
      console.error('获取通道商数据失败', error)
    }
  }

  // 产品映射 (id -> name)
  const productMap = ref<Map<number, string>>(new Map())

  // 产品选项列表（用于下拉框）
  const productOptions = computed(() =>
    Array.from(productMap.value.entries()).map(([id, name]) => ({
      label: name,
      value: id
    }))
  )

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

  // 代理映射 (id -> name)
  const agentMap = ref<Map<number, string>>(new Map())

  // 代理选项列表（用于下拉框）
  const agentOptions = computed(() =>
    Array.from(agentMap.value.entries()).map(([id, name]) => ({
      label: name,
      value: id
    }))
  )

  // 获取代理映射数据
  const fetchAgentMap = async () => {
    try {
      const res = await getAgentMap({ type: 1 }) // type: 1 代收
      const map = new Map<number, string>()
      ;(res.pageData || []).forEach((item) => {
        map.set(item.id, item.name)
      })
      agentMap.value = map
    } catch (error) {
      console.error('获取代理数据失败', error)
    }
  }

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentChannelData = ref<Partial<Api.Channel.ChannelInfo>>({})

  // 初始化获取映射数据
  fetchChannelMerchantMap()
  fetchProductMap()
  fetchAgentMap()

  /**
   * 开关状态切换处理
   */
  const handleSwitchChange = async (
    row: Api.Channel.ChannelInfo,
    field: 'status' | 'allow_negative_profit',
    value: string | number | boolean
  ) => {
    const newValue = value ? 1 : 0

    // 先更新本地数据，避免闪烁
    row[field] = newValue

    try {
      await updateChannel({
        id: row.id,
        [field]: newValue
      })
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
      apiFn: getChannelList,
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
          label: '通道名称',
          minWidth: 200,
          formatter: (row: Api.Channel.ChannelInfo) =>
            h('div', { class: 'flex items-center justify-between gap-2' }, [
              h('span', { class: 'truncate' }, row.name || '-'),
              h('div', { class: 'flex-shrink-0' }, [
                h(
                  ElButton,
                  { size: 'small', type: 'primary', link: true, onClick: () => handleTest(row) },
                  () => '测试'
                )
              ])
            ])
        },
        {
          prop: 'product',
          label: '主产品',
          minWidth: 150,
          formatter: (row: Api.Channel.ChannelInfo) => {
            const productName = row.product ? productMap.value.get(row.product) || '-' : '-'
            return productName !== '-' ? `[${row.product}]${productName}` : '-'
          }
        },
        {
          prop: 'class',
          label: '通道商',
          minWidth: 120,
          formatter: (row: Api.Channel.ChannelInfo) =>
            row.class ? channelMerchantMap.value.get(row.class) || '-' : '-'
        },
        {
          prop: 'channel_code',
          label: '三方编码',
          minWidth: 120,
          formatter: (row: Api.Channel.ChannelInfo) => row.channel_code || '-'
        },
        {
          prop: 'channel_rate',
          label: '费率',
          minWidth: 120,
          formatter: (row: Api.Channel.ChannelInfo) =>
            h('div', { class: 'flex items-center justify-between gap-2' }, [
              h('span', row.channel_rate?.toFixed(2) || '0.00'),
              h('div', { class: 'flex-shrink-0' }, [
                h(
                  ElButton,
                  {
                    size: 'small',
                    type: 'primary',
                    link: true,
                    onClick: () => handleAdjustRate(row)
                  },
                  () => '调整费率'
                )
              ])
            ])
        },
        {
          prop: 'status',
          label: '状态',
          minWidth: 100,
          sortable: 'custom',
          formatter: (row: Api.Channel.ChannelInfo) => {
            return h(ElSwitch, {
              modelValue: row.status === 1,
              onChange: (val: string | number | boolean) => handleSwitchChange(row, 'status', val)
            })
          }
        },
        // {
        //   prop: 'allow_negative_profit',
        //   label: '允许负利润',
        //   minWidth: 120,
        //   formatter: (row: Api.Channel.ChannelInfo) => {
        //     return h(ElSwitch, {
        //       modelValue: row.allow_negative_profit === 1,
        //       onChange: (val: string | number | boolean) =>
        //         handleSwitchChange(row, 'allow_negative_profit', val)
        //     })
        //   }
        // },
        {
          prop: 'balance',
          label: '余额',
          minWidth: 150,
          sortable: 'custom',
          formatter: (row: Api.Channel.ChannelInfo) =>
            h('div', { class: 'flex items-center justify-between gap-2' }, [
              h('span', row.balance?.toFixed(2) || '0.00'),
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
          prop: 'hour_success_rate',
          label: '每小时成功率',
          minWidth: 120,
          formatter: (row: Api.Channel.ChannelInfo) =>
            row.hour_success_rate !== undefined && row.hour_success_rate !== null
              ? `${row.hour_success_rate}%`
              : '-'
        },
        {
          prop: 'day_success_rate',
          label: '每天成功率',
          minWidth: 120,
          formatter: (row: Api.Channel.ChannelInfo) =>
            row.day_success_rate !== undefined && row.day_success_rate !== null
              ? `${row.day_success_rate}%`
              : '-'
        },
        {
          prop: 'weight',
          label: '权重',
          minWidth: 120,
          formatter: (row: Api.Channel.ChannelInfo) =>
            h('div', { class: 'flex items-center justify-between gap-2' }, [
              h('span', row.weight?.toString() || '0'),
              h('div', { class: 'flex-shrink-0' }, [
                h(
                  ElButton,
                  {
                    size: 'small',
                    type: 'primary',
                    link: true,
                    onClick: () => handleAdjustWeight(row)
                  },
                  () => '调整权重'
                )
              ])
            ])
        },
        {
          prop: 'amount_limit',
          label: '收款规则',
          minWidth: 200,
          formatter: (row: Api.Channel.ChannelInfo) => {
            // 根据限额类型处理，区间金额就显示 min_amount ~max_amount，固定金额就显示 fixed_amount
            if (row.amount_limit === 1) {
              // 区间金额
              return `${row.min_amount || 0} ~ ${row.max_amount || 0}`
            } else if (row.amount_limit === 2) {
              // 固定金额，用 tag 样式显示每个金额
              const fixedAmount = row.fixed_amount?.toString() || ''
              if (!fixedAmount) return '-'
              // 按 | 分隔成数组
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
          prop: 'create_time',
          label: '创建时间',
          minWidth: 180,
          sortable: 'custom',
          formatter: (row: Api.Channel.ChannelInfo) => row.create_time || '-'
        },
        {
          prop: 'operation',
          label: '操作',
          width: 280,
          fixed: 'right',
          formatter: (row: Api.Channel.ChannelInfo) =>
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
              // h(
              //   ElButton,
              //   {
              //     size: 'small',
              //     type: 'primary',
              //     link: true,
              //     onClick: () => handleLimit(row)
              //   },
              //   () => '限额'
              // ),
              h(
                ElButton,
                {
                  size: 'small',
                  type: 'primary',
                  link: true,
                  onClick: () => handleDevelop(row)
                },
                () => '开发'
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
                      h(ElDropdownItem, { command: 'bindMerchant' }, () => '绑定商户'),
                      h(ElDropdownItem, { command: 'selectType' }, () => '选择类型'),
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
    // 处理搜索参数：将通道名称和三方编码合并到 search 字段
    const searchParamsCopy = { ...params }
    const channelName = searchParamsCopy.channel_name || ''
    const channelCode = searchParamsCopy.channel_code || ''
    // 合并通道名称和三方编码到 search 字段
    if (channelName || channelCode) {
      searchParamsCopy.search = [channelName, channelCode].filter(Boolean).join(' ') || undefined
    }
    delete searchParamsCopy.channel_name
    delete searchParamsCopy.channel_code
    // 搜索参数赋值
    Object.assign(searchParams, searchParamsCopy)
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
    silentGetData()
  }

  /**
   * 调整费率
   */
  const handleAdjustRate = async (row: Api.Channel.ChannelInfo): Promise<void> => {
    const formData = reactive({
      channel_rate: row.channel_rate || 0
    })

    try {
      await ElMessageBox({
        title: `调整费率 - ${row.name}`,
        message: () =>
          h('div', { style: 'padding: 10px 0' }, [
            h('div', { style: 'margin-bottom: 8px; font-weight: 500' }, '通道费率'),
            h(ElInputNumber, {
              modelValue: formData.channel_rate,
              'onUpdate:modelValue': (val: number | undefined) => {
                formData.channel_rate = val ?? 0
              },
              precision: 2,
              step: 0.01,
              min: 0,
              controlsPosition: 'right',
              style: 'width: 100%'
            }),
            h(
              'div',
              { style: 'margin-top: 8px; color: #909399; font-size: 12px' },
              `当前费率：${row.channel_rate?.toFixed(2) || '0.00'}`
            )
          ]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            if (formData.channel_rate === row.channel_rate) {
              ElMessage.warning('费率未修改')
              return
            }
            instance.confirmButtonLoading = true
            try {
              await updateChannel({
                id: row.id,
                channel_rate: formData.channel_rate
              })
              ElMessage.success('费率调整成功')
              silentGetData()
              done()
            } catch (error) {
              console.error('费率调整失败', error)
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
   * 调整余额
   */
  const handleAdjustBalance = async (row: Api.Channel.ChannelInfo): Promise<void> => {
    // 使用响应式数据存储表单值
    const formData = reactive({
      type: 'increase' as 'increase' | 'decrease', // 增加或减少
      amount: '',
      remark: ''
    })

    // 加减按钮样式
    const stepBtnStyle =
      'width: 32px; height: 32px; border: 1px solid #dcdfe6; background: #f5f7fa; cursor: pointer; font-size: 16px; font-weight: bold; color: #606266; display: flex; align-items: center; justify-content: center;'

    // 步进操作
    const handleStep = (step: number) => {
      const current = Number(formData.amount) || 0
      const newValue = Math.max(0, current + step)
      formData.amount = newValue.toString()
    }

    try {
      await ElMessageBox({
        title: `余额调额 - ${row.name}`,
        message: () =>
          h('div', { class: 'balance-form' }, [
            h('div', { class: 'form-item', style: 'margin-bottom: 16px' }, [
              h(
                'label',
                { style: 'display: block; margin-bottom: 8px; font-weight: 500' },
                '操作类型'
              ),
              h(
                ElRadioGroup,
                {
                  modelValue: formData.type,
                  'onUpdate:modelValue': (val: string | number | boolean | undefined) => {
                    formData.type = val as 'increase' | 'decrease'
                  }
                },
                () => [
                  h(ElRadio, { value: 'increase' }, () => '增加'),
                  h(ElRadio, { value: 'decrease' }, () => '减少')
                ]
              )
            ]),
            h('div', { class: 'form-item', style: 'margin-bottom: 16px' }, [
              h(
                'label',
                { style: 'display: block; margin-bottom: 8px; font-weight: 500' },
                '调额金额'
              ),
              h('div', { style: 'display: flex; align-items: center;' }, [
                // 减号按钮
                h('button', {
                  type: 'button',
                  style: stepBtnStyle + 'border-radius: 4px 0 0 4px; border-right: none;',
                  onClick: () => handleStep(-1),
                  innerHTML: '−'
                }),
                // 输入框
                h('input', {
                  type: 'number',
                  min: '0',
                  class: 'el-input__inner',
                  style:
                    'flex: 1; padding: 8px 12px; border: 1px solid #dcdfe6; border-radius: 0; outline: none; text-align: center; height: 32px; box-sizing: border-box; -moz-appearance: textfield;',
                  placeholder: '请输入金额',
                  value: formData.amount,
                  onInput: (e: Event) => {
                    const value = (e.target as HTMLInputElement).value
                    if (Number(value) >= 0 || value === '') {
                      formData.amount = value
                    }
                  }
                }),
                // 加号按钮
                h('button', {
                  type: 'button',
                  style: stepBtnStyle + 'border-radius: 0 4px 4px 0; border-left: none;',
                  onClick: () => handleStep(1),
                  innerHTML: '+'
                })
              ])
            ]),
            h('div', { class: 'form-item', style: 'margin-bottom: 16px' }, [
              h('label', { style: 'display: block; margin-bottom: 8px; font-weight: 500' }, '备注'),
              h('input', {
                type: 'text',
                class: 'el-input__inner',
                style:
                  'width: 100%; padding: 8px 12px; border: 1px solid #dcdfe6; border-radius: 4px; outline: none;',
                placeholder: '请输入备注（可选）',
                value: formData.remark,
                onInput: (e: Event) => {
                  formData.remark = (e.target as HTMLInputElement).value
                }
              })
            ]),
            h(
              'div',
              { style: 'margin-top: 12px; color: #909399; font-size: 12px' },
              `当前余额：${row.balance?.toFixed(2) || '0.00'}`
            )
          ]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            if (!formData.amount || Number(formData.amount) <= 0) {
              ElMessage.warning('请输入有效的调额金额')
              return
            }
            instance.confirmButtonLoading = true
            try {
              // 根据操作类型计算新余额
              const changeAmount =
                formData.type === 'decrease'
                  ? -Math.abs(Number(formData.amount))
                  : Math.abs(Number(formData.amount))
              const newBalance = (row.balance || 0) + changeAmount

              await updateChannel({
                id: row.id,
                balance: newBalance
              })
              ElMessage.success('余额调整成功')
              silentGetData()
              done()
            } catch (error) {
              console.error('余额调整失败', error)
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
   * 调整权重
   */
  const handleAdjustWeight = async (row: Api.Channel.ChannelInfo): Promise<void> => {
    const formData = reactive({
      weight: row.weight || 1
    })

    try {
      await ElMessageBox({
        title: `调整权重 - ${row.name}`,
        message: () =>
          h('div', { style: 'padding: 10px 0' }, [
            h('div', { style: 'margin-bottom: 8px; font-weight: 500' }, '权重'),
            h(ElInputNumber, {
              modelValue: formData.weight,
              'onUpdate:modelValue': (val: number | undefined) => {
                formData.weight = val ?? 1
              },
              min: 0,
              step: 1,
              controlsPosition: 'right',
              style: 'width: 100%'
            }),
            h(
              'div',
              { style: 'margin-top: 8px; color: #909399; font-size: 12px' },
              `当前权重：${row.weight || 0}`
            )
          ]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            if (formData.weight === row.weight) {
              ElMessage.warning('权重未修改')
              return
            }
            instance.confirmButtonLoading = true
            try {
              await updateChannel({
                id: row.id,
                weight: formData.weight
              })
              ElMessage.success('权重调整成功')
              silentGetData()
              done()
            } catch (error) {
              console.error('权重调整失败', error)
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
   * 显示通道弹窗
   */
  const showDialog = (type: DialogType, row?: Api.Channel.ChannelInfo): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentChannelData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 弹窗提交回调
   */
  const handleDialogSubmit = (): void => {
    dialogVisible.value = false
    currentChannelData.value = {}
    silentGetData()
  }

  /**
   * 测试通道
   */
  const handleTest = (row: Api.Channel.ChannelInfo): void => {
    console.log('测试通道:', row)
    // TODO: 实现测试通道逻辑
  }

  /**
   * 查看详情
   */
  const handleDetail = (row: Api.Channel.ChannelInfo): void => {
    console.log('查看详情:', row)
    // TODO: 实现查看详情逻辑
  }

  /**
   * 复制通道
   */
  const handleCopy = (row: Api.Channel.ChannelInfo): void => {
    console.log('复制通道:', row)
    // TODO: 实现复制通道逻辑
  }

  /**
   * 限额配置
   */
  // const handleLimit = (row: Api.Channel.ChannelInfo): void => {
  //   console.log('限额配置:', row)
  //   // TODO: 实现限额配置逻辑
  // }

  /**
   * 开发配置
   */
  const handleDevelop = (row: Api.Channel.ChannelInfo): void => {
    console.log('开发配置:', row)
    // TODO: 实现开发配置逻辑
  }

  /**
   * 更多操作命令处理
   */
  const handleMoreCommand = (command: string, row: Api.Channel.ChannelInfo): void => {
    switch (command) {
      case 'bindMerchant':
        handleBindMerchant(row)
        break
      case 'selectType':
        handleSelectType(row)
        break
      case 'delete':
        handleDelete(row)
        break
    }
  }

  /**
   * 绑定商户
   */
  const handleBindMerchant = (row: Api.Channel.ChannelInfo): void => {
    console.log('绑定商户:', row)
    // TODO: 实现绑定商户逻辑
  }

  /**
   * 选择类型
   */
  const handleSelectType = (row: Api.Channel.ChannelInfo): void => {
    console.log('选择类型:', row)
    // TODO: 实现选择类型逻辑
  }

  /**
   * 删除通道
   */
  const handleDelete = (row: Api.Channel.ChannelInfo): void => {
    ElMessageBox.confirm(`确定要删除通道【${row.name}】吗？`, '删除通道', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        await delChannel([row.id])
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
      ElMessage.warning('请先选择要删除的通道')
      return
    }
    ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个通道吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        const ids = selectedRows.value.map((item) => item.id)
        await delChannel(ids)
        ElMessage.success('删除成功')
        silentGetData()
      } catch (error) {
        console.error('批量删除失败:', error)
      }
    })
  }

  /**
   * 批量更新费率
   */
  const handleBatchUpdateRate = (): void => {
    if (!selectedRows.value.length) {
      ElMessage.warning('请先选择通道')
      return
    }
    console.log(
      '批量更新费率:',
      selectedRows.value.map((item) => item.id)
    )
    // TODO: 后续补充批量更新费率接口
  }

  /**
   * 批量限额配置
   */
  // const handleBatchLimit = (): void => {
  //   if (!selectedRows.value.length) {
  //     ElMessage.warning('请先选择通道')
  //     return
  //   }
  //   console.log(
  //     '批量限额配置:',
  //     selectedRows.value.map((item) => item.id)
  //   )
  //   // TODO: 后续补充批量限额配置接口
  // }

  /**
   * 批量回调
   */
  const handleBatchCallback = (): void => {
    if (!selectedRows.value.length) {
      ElMessage.warning('请先选择通道')
      return
    }
    console.log(
      '批量回调:',
      selectedRows.value.map((item) => item.id)
    )
    // TODO: 后续补充批量回调接口
  }

  /**
   * 批量开启
   */
  const handleBatchOpen = (): void => {
    if (!selectedRows.value.length) {
      ElMessage.warning('请先选择通道')
      return
    }
    console.log(
      '批量开启:',
      selectedRows.value.map((item) => item.id)
    )
    // TODO: 后续补充批量开启接口
  }

  /**
   * 批量关闭
   */
  const handleBatchClose = (): void => {
    if (!selectedRows.value.length) {
      ElMessage.warning('请先选择通道')
      return
    }
    console.log(
      '批量关闭:',
      selectedRows.value.map((item) => item.id)
    )
    // TODO: 后续补充批量关闭接口
  }

  /**
   * 导出表格数据
   */
  const handleExport = async (): Promise<void> => {
    // 定义导出列配置
    const exportColumns: ExportColumnConfig[] = [
      { label: '通道名称', prop: 'name', type: 'text', width: 20 },
      {
        label: '主产品',
        prop: 'product',
        type: 'computed',
        width: 20,
        getValue: (row: Api.Channel.ChannelInfo) => {
          const productName = row.product ? productMap.value.get(row.product) || '-' : '-'
          return productName !== '-' ? `[${row.product}]${productName}` : '-'
        }
      },
      {
        label: '通道商',
        prop: 'class',
        type: 'computed',
        width: 15,
        getValue: (row: Api.Channel.ChannelInfo) =>
          row.class ? channelMerchantMap.value.get(row.class) || '-' : '-'
      },
      { label: '三方编码', prop: 'channel_code', type: 'text', width: 15 },
      { label: '费率', prop: 'channel_rate', type: 'number', width: 12 },
      { label: '状态', prop: 'status', type: 'switch', width: 10 },
      { label: '允许负利润', prop: 'allow_negative_profit', type: 'switch', width: 12 },
      { label: '余额', prop: 'balance', type: 'number', width: 15 },
      {
        label: '每小时成功率',
        prop: 'hour_success_rate',
        type: 'computed',
        width: 15,
        getValue: (row: Api.Channel.ChannelInfo) =>
          row.hour_success_rate !== undefined && row.hour_success_rate !== null
            ? `${row.hour_success_rate}%`
            : '-'
      },
      {
        label: '每天成功率',
        prop: 'day_success_rate',
        type: 'computed',
        width: 15,
        getValue: (row: Api.Channel.ChannelInfo) =>
          row.day_success_rate !== undefined && row.day_success_rate !== null
            ? `${row.day_success_rate}%`
            : '-'
      },
      { label: '权重', prop: 'weight', type: 'text', width: 10 },
      {
        label: '收款规则',
        prop: 'amount_limit',
        type: 'computed',
        width: 25,
        getValue: (row: Api.Channel.ChannelInfo) => {
          if (row.amount_limit === 1) {
            return `${row.min_amount || 0} ~ ${row.max_amount || 0}`
          } else if (row.amount_limit === 2) {
            // 固定金额，将 | 转换为空格显示
            const fixedAmount = row.fixed_amount?.toString() || ''
            return fixedAmount ? fixedAmount.replace(/\|/g, ' ') : '-'
          }
          return '-'
        }
      },
      { label: '创建时间', prop: 'create_time', type: 'text', width: 20 }
    ]

    await exportToExcel({
      data: data.value,
      columns: exportColumns,
      filename: '代收通道列表',
      sheetName: '通道数据',
      autoIndex: true
    })
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: Api.Channel.ChannelInfo[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>
