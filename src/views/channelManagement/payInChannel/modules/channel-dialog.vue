<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增通道' : '编辑通道'"
    width="600px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <!-- 通道商 -->
      <ElFormItem label="通道商" prop="class">
        <ElSelect v-model="formData.class" placeholder="请选择通道商" clearable>
          <ElOption
            v-for="item in props.channelMerchantOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <!-- 通道名称 -->
      <ElFormItem label="通道名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入通道名称" />
      </ElFormItem>

      <!-- 通道编码 -->
      <ElFormItem label="通道编码" prop="channel_code">
        <ElInput v-model="formData.channel_code" placeholder="请输入通道编码（三方编码）" />
      </ElFormItem>

      <!-- 代理 -->
      <ElFormItem label="代理" prop="agent">
        <ElSelect
          v-model="formData.agent"
          placeholder="请选择代理"
          clearable
          @change="handleAgentChange"
        >
          <ElOption
            v-for="item in props.agentOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <!-- 代理费率 - 根据代理选中状态显示 -->
      <ElFormItem v-if="formData.agent" label="代理费率" prop="agent_rate">
        <ElInputNumber
          v-model="formData.agent_rate"
          :precision="2"
          :step="0.01"
          :min="0"
          placeholder="请输入代理费率"
          controls-position="right"
        />
      </ElFormItem>

      <!-- 通道费率 -->
      <ElFormItem label="通道费率" prop="channel_rate">
        <ElInputNumber
          v-model="formData.channel_rate"
          :precision="2"
          :step="0.01"
          :min="0"
          placeholder="请输入通道费率"
          controls-position="right"
        />
      </ElFormItem>

      <!-- 主产品 -->
      <ElFormItem label="主产品" prop="product">
        <ElSelect v-model="formData.product" placeholder="请选择主产品" clearable>
          <ElOption
            v-for="item in props.productOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <!-- 权重 -->
      <ElFormItem label="权重" prop="weight">
        <ElInputNumber
          v-model="formData.weight"
          :min="0"
          :step="1"
          placeholder="请输入权重"
          controls-position="right"
        />
      </ElFormItem>

      <!-- 限额类型 -->
      <ElFormItem label="限额类型" prop="amount_limit">
        <ElRadioGroup v-model="formData.amount_limit">
          <ElRadio :value="1">区间金额</ElRadio>
          <ElRadio :value="2">固定金额</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <!-- 区间金额 - 当限额类型为1时显示 -->
      <template v-if="formData.amount_limit === 1">
        <ElFormItem label="最小金额" prop="min_amount">
          <ElInputNumber
            v-model="formData.min_amount"
            :precision="2"
            :step="1"
            :min="0"
            placeholder="请输入最小金额"
            controls-position="right"
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
          />
        </ElFormItem>
      </template>

      <!-- 固定金额 - 当限额类型为2时显示 -->
      <ElFormItem v-if="formData.amount_limit === 2" label="固定金额" prop="fixed_amount">
        <ElInput
          v-model="formData.fixed_amount"
          placeholder="请输入固定金额，多个金额用空格隔开，如：100.00 200.00"
        />
        <div class="el-form-item__tip" style="margin-top: 4px; font-size: 12px; color: #909399">
          金额保留两位小数，多个金额用空格隔开
        </div>
      </ElFormItem>

      <!-- 状态 -->
      <ElFormItem label="状态" prop="status">
        <ElSwitch v-model="formData.status" :active-value="1" :inactive-value="0" />
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
  import { addChannel } from '@/api/channel'

  interface Props {
    visible: boolean
    type: string
    /** 通道类型：1-代收 2-代付 */
    channelType: number
    /** 通道商选项列表 */
    channelMerchantOptions: { label: string; value: number }[]
    /** 代理选项列表 */
    agentOptions: { label: string; value: number }[]
    /** 产品选项列表 */
    productOptions: { label: string; value: number }[]
    channelData?: Partial<Api.Channel.ChannelInfo>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()

  // 提交中状态
  const submitting = ref(false)

  // 表单数据
  const formData = reactive({
    class: undefined as number | undefined,
    name: '',
    channel_code: '',
    agent: undefined as number | undefined,
    agent_rate: undefined as number | undefined,
    channel_rate: undefined as number | undefined,
    product: undefined as number | undefined,
    weight: 1, // 默认权重为1
    amount_limit: 1, // 默认区间金额
    min_amount: undefined as number | undefined,
    max_amount: undefined as number | undefined,
    fixed_amount: '', // 固定金额，多个金额用空格隔开显示，存储时用 | 分隔
    status: 1
  })

  // 表单验证规则
  const rules = computed<FormRules>(() => ({
    name: [
      { required: true, message: '请输入通道名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    product: [{ required: true, message: '请选择主产品', trigger: 'change' }],
    amount_limit: [{ required: true, message: '请选择限额类型', trigger: 'change' }]
  }))

  /**
   * 代理选择变化处理
   */
  const handleAgentChange = (val: number | undefined) => {
    if (!val) {
      // 清空代理费率
      formData.agent_rate = undefined
    }
  }

  /**
   * 初始化表单数据
   */
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.channelData
    const row = props.channelData

    // 固定金额：编辑时将 | 转换为空格显示
    const fixedAmountDisplay =
      isEdit && row && row.fixed_amount ? String(row.fixed_amount).replace(/\|/g, ' ') : ''

    Object.assign(formData, {
      class: isEdit && row && row.class ? row.class : undefined,
      name: isEdit && row ? row.name || '' : '',
      channel_code: isEdit && row ? (row.channel_code ? String(row.channel_code) : '') : '',
      agent: isEdit && row && row.agent ? row.agent : undefined,
      agent_rate: isEdit && row ? row.agent_rate : undefined,
      channel_rate: isEdit && row ? row.channel_rate : undefined,
      product: isEdit && row && row.product ? row.product : undefined,
      weight: isEdit && row ? (row.weight ?? 1) : 1,
      amount_limit: isEdit && row ? row.amount_limit || 1 : 1,
      min_amount: isEdit && row ? row.min_amount : undefined,
      max_amount: isEdit && row ? row.max_amount : undefined,
      fixed_amount: fixedAmountDisplay,
      status: isEdit && row ? (row.status ?? 1) : 1
    })
  }

  /**
   * 监听对话框状态变化
   */
  watch(
    () => [props.visible, props.type, props.channelData],
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

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    submitting.value = true

    try {
      if (dialogType.value === 'add') {
        // 新增通道
        const params: Api.Channel.AddChannelParams = {
          type: props.channelType,
          name: formData.name,
          product: formData.product!,
          amount_limit: formData.amount_limit
        }

        // 可选字段
        if (formData.class) {
          params.class = formData.class
        }
        if (formData.channel_code) {
          params.channel_code = Number(formData.channel_code)
        }
        if (formData.agent) {
          params.agent = formData.agent
        }
        if (formData.agent_rate !== undefined) {
          params.agent_rate = formData.agent_rate
        }
        if (formData.channel_rate !== undefined) {
          params.channel_rate = formData.channel_rate
        }
        if (formData.weight !== undefined) {
          params.weight = formData.weight
        }

        // 根据限额类型设置金额
        if (formData.amount_limit === 1) {
          if (formData.min_amount !== undefined) {
            params.min_amount = formData.min_amount
          }
          if (formData.max_amount !== undefined) {
            params.max_amount = formData.max_amount
          }
        } else if (formData.amount_limit === 2) {
          if (formData.fixed_amount) {
            // 将空格转换为 |，多个空格只保留一个 |
            params.fixed_amount = formData.fixed_amount.trim().replace(/\s+/g, '|')
          }
        }

        await addChannel(params)
        ElMessage.success('添加成功')
      } else {
        // 编辑通道 - TODO: 后续补充编辑接口
        ElMessage.warning('编辑功能待实现')
        return
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
