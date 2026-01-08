<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  interface Props {
    modelValue: Record<string, any>
    /** 通道商选项列表 */
    channelMerchantOptions: { label: string; value: number }[]
    /** 产品选项列表 */
    productOptions: { label: string; value: number }[]
  }
  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 校验规则
  const rules = {}

  // 动态 options - 状态选项
  const statusOptions = ref<{ label: string; value: string; disabled?: boolean }[]>([])

  // 接口类型选项（暂时用接口1和接口2代替）
  const interfaceTypeOptions = ref([
    { label: '接口1', value: '1' },
    { label: '接口2', value: '2' }
  ])

  // 限额类型选项
  const amountTypeOptions = ref([
    { label: '区间金额', value: '1' },
    { label: '固定金额', value: '2' }
  ])

  // 模拟接口返回状态数据
  function fetchStatusOptions(): Promise<typeof statusOptions.value> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: '启用', value: '1' },
          { label: '禁用', value: '0' }
        ])
      }, 500)
    })
  }

  onMounted(async () => {
    statusOptions.value = await fetchStatusOptions()
  })

  // 表单配置
  const formItems = computed(() => [
    {
      label: '通道名称',
      key: 'channel_name',
      type: 'input',
      placeholder: '请输入通道名称',
      clearable: true
    },
    {
      label: '三方编码',
      key: 'channel_code',
      type: 'input',
      props: { placeholder: '请输入三方编码', clearable: true }
    },
    {
      label: '通道商',
      key: 'class',
      type: 'select',
      props: {
        placeholder: '请选择通道商',
        options: props.channelMerchantOptions.map((item) => ({
          label: item.label,
          value: String(item.value)
        })),
        clearable: true
      }
    },
    {
      label: '接口类型',
      key: 'interface_type',
      type: 'select',
      props: {
        placeholder: '请选择接口类型',
        options: interfaceTypeOptions.value,
        clearable: true
      }
    },
    {
      label: '产品',
      key: 'product',
      type: 'select',
      props: {
        placeholder: '请选择产品',
        options: props.productOptions.map((item) => ({
          label: item.label,
          value: String(item.value)
        })),
        clearable: true
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        options: statusOptions.value,
        clearable: true
      }
    },
    {
      label: '限额类型',
      key: 'amount_type',
      type: 'select',
      props: {
        placeholder: '请选择限额类型',
        options: amountTypeOptions.value,
        clearable: true
      }
    }
  ])

  // 事件
  function handleReset() {
    console.log('重置表单')
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
    console.log('表单数据', formData.value)
  }
</script>
