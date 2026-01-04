<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增商户' : '编辑商户'"
    width="600px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="商户名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入商户名称" />
      </ElFormItem>
      <ElFormItem label="登录账号" prop="secret">
        <ElInput v-model="formData.secret" placeholder="请输入登录账号" />
      </ElFormItem>
      <ElFormItem label="登录密码" prop="password" v-if="dialogType === 'add'">
        <ElInput
          v-model="formData.password"
          type="password"
          placeholder="请输入登录密码"
          show-password
        />
      </ElFormItem>
      <ElFormItem label="商户状态" prop="status">
        <ElSelect v-model="formData.status" placeholder="请选择商户状态">
          <ElOption label="启用" :value="1" />
          <ElOption label="禁用" :value="0" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="商户组" prop="class">
        <ElSelect v-model="formData.class" placeholder="请选择商户组">
          <ElOption label="默认组" :value="1" />
          <ElOption label="VIP组" :value="2" />
          <ElOption label="普通组" :value="3" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="代理" prop="agent">
        <ElSelect v-model="formData.agent" placeholder="请选择代理" clearable>
          <ElOption label="代理A" :value="1" />
          <ElOption label="代理B" :value="2" />
          <ElOption label="代理C" :value="3" />
        </ElSelect>
      </ElFormItem>
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
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'

  interface Props {
    visible: boolean
    type: string
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

  // 表单数据
  const formData = reactive({
    name: '',
    secret: '',
    password: '',
    status: 1,
    class: undefined as number | undefined,
    agent: undefined as number | undefined,
    auto_settle: 0,
    receive_group_notice: 0,
    settle_notice: 0,
    rate_change_notice: 0,
    tg_group_id: '',
    telegram_name: '',
    remark: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    name: [
      { required: true, message: '请输入商户名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    secret: [
      { required: true, message: '请输入登录账号', trigger: 'blur' },
      { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入登录密码', trigger: 'blur' },
      { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    status: [{ required: true, message: '请选择商户状态', trigger: 'change' }]
  }

  /**
   * 初始化表单数据
   * 根据对话框类型（新增/编辑）填充表单
   */
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.merchantData
    const row = props.merchantData

    Object.assign(formData, {
      name: isEdit && row ? row.name || '' : '',
      secret: isEdit && row ? row.secret || '' : '',
      password: '',
      status: isEdit && row ? (row.status ?? 1) : 1,
      class: isEdit && row ? row.class : undefined,
      agent: isEdit && row ? row.agent : undefined,
      auto_settle: isEdit && row ? (row.auto_settle ?? 0) : 0,
      receive_group_notice: isEdit && row ? (row.receive_group_notice ?? 0) : 0,
      settle_notice: isEdit && row ? (row.settle_notice ?? 0) : 0,
      rate_change_notice: isEdit && row ? (row.rate_change_notice ?? 0) : 0,
      tg_group_id: isEdit && row ? row.tg_group_id || '' : '',
      telegram_name: isEdit && row ? row.telegram_name || '' : '',
      remark: isEdit && row ? row.remark || '' : ''
    })
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
   * 提交表单
   * 验证通过后触发提交事件
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate((valid) => {
      if (valid) {
        ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
        dialogVisible.value = false
        emit('submit')
      }
    })
  }
</script>
