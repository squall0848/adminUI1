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
  // 动态 options - 商户组选项
  const classOptions = ref<{ label: string; value: string; disabled?: boolean }[]>([])
  // 动态 options - 代理选项
  const agentOptions = ref<{ label: string; value: string; disabled?: boolean }[]>([])

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

  // 模拟接口返回商户组数据
  function fetchClassOptions(): Promise<typeof classOptions.value> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: '默认组', value: '1' },
          { label: 'VIP组', value: '2' },
          { label: '普通组', value: '3' }
        ])
      }, 500)
    })
  }

  // 模拟接口返回代理数据
  function fetchAgentOptions(): Promise<typeof agentOptions.value> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: '代理A', value: '1' },
          { label: '代理B', value: '2' },
          { label: '代理C', value: '3' }
        ])
      }, 500)
    })
  }

  onMounted(async () => {
    const [status, classOpts, agent] = await Promise.all([
      fetchStatusOptions(),
      fetchClassOptions(),
      fetchAgentOptions()
    ])
    statusOptions.value = status
    classOptions.value = classOpts
    agentOptions.value = agent
  })

  // 表单配置
  const formItems = computed(() => [
    {
      label: '商户',
      key: 'search',
      type: 'input',
      placeholder: '请输入用户名/商户名称/商户号',
      clearable: true
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
      label: '商户组',
      key: 'class',
      type: 'select',
      props: {
        placeholder: '请选择商户组',
        options: classOptions.value,
        clearable: true
      }
    },
    {
      label: '代理',
      key: 'agent',
      type: 'select',
      props: {
        placeholder: '请选择代理',
        options: agentOptions.value,
        clearable: true
      }
    },
    {
      label: '备注',
      key: 'remark',
      type: 'input',
      props: { placeholder: '请输入备注', clearable: true }
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
