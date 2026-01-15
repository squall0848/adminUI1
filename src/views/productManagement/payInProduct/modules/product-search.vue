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

  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const rules = {}

  import { COMMON_STATUS_OPTIONS_CLOSE } from '@/utils/common/enums'

  const statusOptions = ref([...COMMON_STATUS_OPTIONS_CLOSE])

  const amountLimitOptions = ref([
    { label: '区间金额', value: '1' },
    { label: '固定金额', value: '2' }
  ])

  const formItems = computed(() => [
    {
      label: '产品',
      key: 'search',
      type: 'input',
      placeholder: '请输入产品名称或编码',
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
      label: '限额类型',
      key: 'amount_limit',
      type: 'select',
      props: {
        placeholder: '请选择限额类型',
        options: amountLimitOptions.value,
        clearable: true
      }
    }
  ])

  function handleReset() {
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }
</script>
