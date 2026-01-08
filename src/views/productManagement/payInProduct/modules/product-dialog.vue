<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增产品' : '编辑产品'"
    width="600px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <ElFormItem label="产品名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入产品名称" />
      </ElFormItem>

      <ElFormItem label="产品编码" prop="code">
        <ElInputNumber
          v-model="formData.code"
          :min="0"
          :step="1"
          placeholder="请输入产品编码"
          controls-position="right"
          style="width: 100%"
        />
      </ElFormItem>

      <ElFormItem label="限额类型" prop="amount_limit">
        <ElRadioGroup v-model="formData.amount_limit">
          <ElRadio :value="1">区间金额</ElRadio>
          <ElRadio :value="2">固定金额</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <template v-if="formData.amount_limit === 1">
        <ElFormItem label="最小金额" prop="min_amount">
          <ElInputNumber
            v-model="formData.min_amount"
            :precision="2"
            :step="1"
            :min="0"
            placeholder="请输入最小金额"
            controls-position="right"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="最大金额" prop="max_amount">
          <ElInputNumber
            v-model="formData.max_amount"
            :precision="2"
            :step="1"
            :min="0"
            placeholder="请输入最大金额"
            controls-position="right"
            style="width: 100%"
          />
        </ElFormItem>
      </template>

      <ElFormItem v-if="formData.amount_limit === 2" label="固定金额" prop="fixed_amount">
        <ElInput
          v-model="formData.fixed_amount"
          placeholder="请输入固定金额，多个金额用空格隔开，如：100.00 200.00"
        />
        <div class="el-form-item__tip" style="margin-top: 4px; font-size: 12px; color: #909399">
          金额保留两位小数，多个金额用空格隔开
        </div>
      </ElFormItem>

      <ElFormItem label="默认费率" prop="merchant_rate">
        <ElInputNumber
          v-model="formData.merchant_rate"
          :precision="2"
          :step="0.01"
          :min="0"
          placeholder="请输入默认费率"
          controls-position="right"
          style="width: 100%"
        />
      </ElFormItem>

      <ElFormItem label="交易时间" prop="timeRange">
        <ElTimePicker
          v-model="formData.timeRange"
          is-range
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="HH:mm:ss"
          style="width: 100%"
        />
      </ElFormItem>

      <ElFormItem label="下单模式" prop="order_mode">
        <ElRadioGroup v-model="formData.order_mode">
          <ElRadio :value="1">顺序</ElRadio>
          <ElRadio :value="2">并发</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="通道权重模式" prop="weight_mode">
        <ElRadioGroup v-model="formData.weight_mode">
          <ElRadio :value="1">默认权重</ElRadio>
          <ElRadio :value="2">智能权重</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="规则备注" prop="remark">
        <ElInput v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入规则备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { AddProduct, updateProduct } from '@/api/product'
  import { ElMessage } from 'element-plus'

  interface Props {
    visible: boolean
    type: string
    productType: number
    productData?: Partial<Api.Product.ProductInfo>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  const formData = reactive({
    name: '',
    code: undefined as number | undefined,
    amount_limit: 1,
    min_amount: undefined as number | undefined,
    max_amount: undefined as number | undefined,
    fixed_amount: '',
    merchant_rate: undefined as number | undefined,
    timeRange: null as [string, string] | null,
    order_mode: 1,
    weight_mode: 1,
    remark: ''
  })

  const rules = computed<FormRules>(() => {
    const baseRules: FormRules = {
      name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
      code: [{ required: true, message: '请输入产品编码', trigger: 'blur' }],
      amount_limit: [{ required: true, message: '请选择限额类型', trigger: 'change' }],
      merchant_rate: [{ required: true, message: '请输入默认费率', trigger: 'blur' }]
    }

    if (formData.amount_limit === 1) {
      baseRules.min_amount = [{ required: true, message: '请输入最小金额', trigger: 'blur' }]
      baseRules.max_amount = [{ required: true, message: '请输入最大金额', trigger: 'blur' }]
    } else if (formData.amount_limit === 2) {
      baseRules.fixed_amount = [{ required: true, message: '请输入固定金额', trigger: 'blur' }]
    }

    return baseRules
  })

  const originalData = ref<typeof formData | null>(null)

  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.productData
    const hasData = props.productData && Object.keys(props.productData).length > 0
    const row = props.productData

    const fixedAmountDisplay =
      hasData && row && row.fixed_amount ? String(row.fixed_amount).replace(/\|/g, ' ') : ''

    const timeRangeValue: [string, string] | null =
      hasData && row && row.open_time && row.close_time ? [row.open_time, row.close_time] : null

    const data = {
      name: hasData && row ? row.name || '' : '',
      code: hasData && row ? row.code : undefined,
      amount_limit: hasData && row ? row.amount_limit || 1 : 1,
      min_amount: hasData && row ? row.min_amount : undefined,
      max_amount: hasData && row ? row.max_amount : undefined,
      fixed_amount: fixedAmountDisplay,
      merchant_rate: hasData && row ? row.merchant_rate : undefined,
      timeRange: timeRangeValue,
      order_mode: hasData && row ? row.order_mode || 1 : 1,
      weight_mode: hasData && row ? row.weight_mode || 1 : 1,
      remark: hasData && row ? row.remark || '' : ''
    }

    Object.assign(formData, data)

    if (isEdit) {
      originalData.value = { ...data }
    } else {
      originalData.value = null
    }
  }

  const getChangedFields = (): Partial<Api.Product.UpdateProductParams> => {
    if (!originalData.value || !props.productData) return {}

    const changed: Partial<Api.Product.UpdateProductParams> = {
      id: props.productData.id!
    }

    if (formData.name !== originalData.value.name) {
      changed.name = formData.name
    }

    if (formData.code !== originalData.value.code) {
      changed.code = formData.code
    }

    if (formData.amount_limit !== originalData.value.amount_limit) {
      changed.amount_limit = formData.amount_limit
    }

    if (formData.min_amount !== originalData.value.min_amount) {
      changed.min_amount = formData.min_amount
    }

    if (formData.max_amount !== originalData.value.max_amount) {
      changed.max_amount = formData.max_amount
    }

    const originalFixed = originalData.value.fixed_amount || ''
    const currentFixed = formData.fixed_amount || ''
    if (currentFixed !== originalFixed) {
      changed.fixed_amount = currentFixed.trim().replace(/\s+/g, '|') || undefined
    }

    if (formData.merchant_rate !== originalData.value.merchant_rate) {
      changed.merchant_rate = formData.merchant_rate
    }

    const originalTimeRange = originalData.value.timeRange
    const currentTimeRange = formData.timeRange
    if (
      (originalTimeRange?.[0] !== currentTimeRange?.[0] ||
        originalTimeRange?.[1] !== currentTimeRange?.[1]) &&
      currentTimeRange &&
      currentTimeRange.length === 2
    ) {
      changed.open_time = currentTimeRange[0]
      changed.close_time = currentTimeRange[1]
    }

    if (formData.order_mode !== originalData.value.order_mode) {
      changed.order_mode = formData.order_mode
    }

    if (formData.weight_mode !== originalData.value.weight_mode) {
      changed.weight_mode = formData.weight_mode
    }

    if (formData.remark !== originalData.value.remark) {
      changed.remark = formData.remark
    }

    return changed
  }

  watch(
    () => [props.visible, props.type, props.productData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    submitting.value = true

    try {
      if (dialogType.value === 'add') {
        const params: Api.Product.AddProductParams = {
          type: props.productType,
          name: formData.name,
          code: formData.code!,
          amount_limit: formData.amount_limit,
          merchant_rate: formData.merchant_rate!,
          order_mode: formData.order_mode,
          weight_mode: formData.weight_mode
        }

        if (formData.amount_limit === 1) {
          if (formData.min_amount !== undefined) {
            params.min_amount = formData.min_amount
          }
          if (formData.max_amount !== undefined) {
            params.max_amount = formData.max_amount
          }
        } else if (formData.amount_limit === 2) {
          if (formData.fixed_amount) {
            params.fixed_amount = formData.fixed_amount.trim().replace(/\s+/g, '|')
          }
        }

        if (formData.timeRange && formData.timeRange.length === 2) {
          params.open_time = formData.timeRange[0]
          params.close_time = formData.timeRange[1]
        }

        if (formData.remark) {
          params.remark = formData.remark
        }

        await AddProduct(params)
        ElMessage.success('添加成功')
      } else {
        const changedFields = getChangedFields()

        if (Object.keys(changedFields).length <= 1) {
          ElMessage.warning('没有修改任何内容')
          return
        }

        await updateProduct(changedFields as Api.Product.UpdateProductParams)
        ElMessage.success('更新成功')
      }

      dialogVisible.value = false
      emit('submit')
    } catch (error) {
      console.error('提交失败', error)
    } finally {
      submitting.value = false
    }
  }
</script>
