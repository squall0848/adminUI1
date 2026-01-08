<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增商户' : '编辑商户'"
    width="600px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <!-- 商户名称 - 新增和编辑都有 -->
      <ElFormItem label="商户名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入商户名称" />
      </ElFormItem>

      <!-- 密码 - 仅新增 -->
      <ElFormItem v-if="dialogType === 'add'" label="密码" prop="password">
        <ElInput
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </ElFormItem>

      <!-- 商户状态 - 仅编辑 -->
      <ElFormItem v-if="dialogType === 'edit'" label="商户状态">
        <ElSwitch v-model="formData.status" :active-value="1" :inactive-value="0" />
      </ElFormItem>

      <!-- 商户组 - 新增和编辑都有 -->
      <ElFormItem label="商户组" prop="class">
        <ElSelect v-model="formData.class" placeholder="请选择商户组" clearable>
          <ElOption
            v-for="item in props.classOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <!-- 代理 - 新增和编辑都有 -->
      <ElFormItem label="代理" prop="agent">
        <ElSelect v-model="formData.agent" placeholder="请选择代理" clearable>
          <ElOption
            v-for="item in props.agentOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <!-- 代理利润 - 仅编辑 -->
      <ElFormItem v-if="dialogType === 'edit'" label="代理利润" prop="agent_rate">
        <ElInput v-model="formData.agent_rate" type="number" placeholder="请输入代理利润" />
      </ElFormItem>

      <!-- 以下仅编辑页面显示 -->
      <template v-if="dialogType === 'edit'">
        <ElFormItem label="自动结算">
          <ElSwitch v-model="formData.auto_settle" :active-value="1" :inactive-value="0" />
        </ElFormItem>
        <ElFormItem label="接收群通知">
          <ElSwitch v-model="formData.receive_group_notice" :active-value="1" :inactive-value="0" />
        </ElFormItem>
        <ElFormItem label="结算通知">
          <ElSwitch v-model="formData.settle_notice" :active-value="1" :inactive-value="0" />
        </ElFormItem>
        <ElFormItem label="费率修改通知">
          <ElSwitch v-model="formData.rate_change_notice" :active-value="1" :inactive-value="0" />
        </ElFormItem>
        <ElFormItem label="群组ID" prop="tg_group_id">
          <ElInput v-model="formData.tg_group_id" placeholder="请输入群组ID" />
        </ElFormItem>
        <ElFormItem label="群发@飞机号" prop="telegram_name">
          <ElInput v-model="formData.telegram_name" placeholder="请输入群发@飞机号" />
        </ElFormItem>
        <ElFormItem label="备注" prop="remark">
          <ElInput v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </ElFormItem>
      </template>
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
  import { addMerchant, updateMerchant } from '@/api/merchant'

  interface Props {
    visible: boolean
    type: string
    /** 商户类型：1-代收 2-代付 */
    merchantType: number
    /** 代理选项列表 */
    agentOptions: { label: string; value: number }[]
    /** 商户组选项列表 */
    classOptions: { label: string; value: number }[]
    merchantData?: Partial<Api.Merchant.MerchantInfo>
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
    name: '',
    password: '',
    status: 1,
    class: undefined as number | undefined,
    agent: undefined as number | undefined,
    agent_rate: '',
    auto_settle: 0,
    receive_group_notice: 0,
    settle_notice: 0,
    rate_change_notice: 0,
    tg_group_id: '',
    telegram_name: '',
    remark: ''
  })

  // 原始数据（用于编辑时比对变更）
  const originalData = ref<typeof formData | null>(null)

  // 表单验证规则
  const rules = computed<FormRules>(() => ({
    name: [
      { required: true, message: '请输入商户名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    password:
      dialogType.value === 'add'
        ? [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
          ]
        : []
  }))

  /**
   * 初始化表单数据
   * 根据对话框类型（新增/编辑）填充表单
   */
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.merchantData
    const row = props.merchantData

    const data = {
      name: isEdit && row ? row.name || '' : '',
      password: '', // 密码仅用于新增，编辑时不显示
      status: isEdit && row ? (row.status ?? 1) : 1,
      class: isEdit && row && row.class ? row.class : undefined,
      agent: isEdit && row && row.agent ? row.agent : undefined,
      agent_rate: isEdit && row ? (row.agent_rate ? String(row.agent_rate) : '') : '',
      auto_settle: isEdit && row ? (row.auto_settle ?? 0) : 0,
      receive_group_notice: isEdit && row ? (row.receive_group_notice ?? 0) : 0,
      settle_notice: isEdit && row ? (row.settle_notice ?? 0) : 0,
      rate_change_notice: isEdit && row ? (row.rate_change_notice ?? 0) : 0,
      tg_group_id: isEdit && row ? (row.tg_group_id ? String(row.tg_group_id) : '') : '',
      telegram_name: isEdit && row ? row.telegram_name || '' : '',
      remark: isEdit && row ? row.remark || '' : ''
    }

    Object.assign(formData, data)

    // 保存原始数据用于编辑时比对
    if (isEdit) {
      originalData.value = { ...data }
    } else {
      originalData.value = null
    }
  }

  /**
   * 监听对话框状态变化
   * 当对话框打开时初始化表单数据并清除验证状态
   */
  watch(
    () => [props.visible, props.type, props.merchantData],
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
   * 获取编辑时变更的字段
   * 只返回有修改的字段
   */
  const getChangedFields = (): Partial<Api.Merchant.UpdateMerchantInfo> => {
    if (!originalData.value || !props.merchantData) return {}

    const changed: Partial<Api.Merchant.UpdateMerchantInfo> = {
      id: props.merchantData.id!
    }

    // 商户名称
    if (formData.name !== originalData.value.name) {
      changed.name = formData.name || ''
    }

    // 商户状态
    if (formData.status !== originalData.value.status) {
      changed.status = formData.status
    }

    // 商户组
    if (formData.class !== originalData.value.class) {
      changed.class = formData.class || 0
    }

    // 代理
    if (formData.agent !== originalData.value.agent) {
      changed.agent = formData.agent || 0
    }

    // 代理利润
    if (formData.agent_rate !== originalData.value.agent_rate) {
      changed.agent_rate = formData.agent_rate ? Number(formData.agent_rate) : 0
    }

    // 自动结算
    if (formData.auto_settle !== originalData.value.auto_settle) {
      changed.auto_settle = formData.auto_settle
    }

    // 接收群通知
    if (formData.receive_group_notice !== originalData.value.receive_group_notice) {
      changed.receive_group_notice = formData.receive_group_notice
    }

    // 结算通知
    if (formData.settle_notice !== originalData.value.settle_notice) {
      changed.settle_notice = formData.settle_notice
    }

    // 费率修改通知
    if (formData.rate_change_notice !== originalData.value.rate_change_notice) {
      changed.rate_change_notice = formData.rate_change_notice
    }

    // 群组ID
    if (formData.tg_group_id !== originalData.value.tg_group_id) {
      changed.tg_group_id = formData.tg_group_id ? Number(formData.tg_group_id) : 0
    }

    // 群发@飞机号
    if (formData.telegram_name !== originalData.value.telegram_name) {
      changed.telegram_name = formData.telegram_name || ''
    }

    // 备注
    if (formData.remark !== originalData.value.remark) {
      changed.remark = formData.remark || ''
    }

    return changed
  }

  /**
   * 提交表单
   * 验证通过后调用相应接口
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    submitting.value = true

    try {
      if (dialogType.value === 'add') {
        // 新增商户
        const params: Api.Merchant.AddMerchantParams = {
          type: props.merchantType,
          name: formData.name,
          password: formData.password
        }
        if (formData.class) {
          params.class = formData.class
        }
        if (formData.agent) {
          params.agent = formData.agent
        }

        await addMerchant(params)
        ElMessage.success('添加成功')
      } else {
        // 编辑商户
        const changedFields = getChangedFields()

        // 检查是否有修改
        if (Object.keys(changedFields).length <= 1) {
          ElMessage.warning('没有修改任何内容')
          return
        }

        await updateMerchant(changedFields)
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
