<template>
  <ElDialog
    v-model="dialogVisible"
    :title="props.type === 'add' ? '新增代理' : '编辑代理'"
    width="600px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <!-- 代理名称 - 新增和编辑都有 -->
      <ElFormItem label="代理名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入代理名称" />
      </ElFormItem>

      <!-- 代理状态 - 仅编辑 -->
      <ElFormItem v-if="props.type === 'edit'" label="代理状态">
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
  import { addAgent, updateAgent } from '@/api/agent'
  import { ElMessage } from 'element-plus'

  interface Props {
    visible: boolean
    type: string
    /** 代理类型：1-代收 2-代付 */
    agentType: number
    agentData?: Partial<Api.Agent.AgentInfo>
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
    status: 1
  })

  // 原始数据（用于编辑时比对变更）
  const originalData = ref<typeof formData | null>(null)

  // 表单验证规则
  const rules = computed<FormRules>(() => ({
    name: [
      { required: true, message: '请输入代理名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ]
  }))

  /**
   * 初始化表单数据
   * 根据对话框类型（新增/编辑）填充表单
   */
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.agentData
    const row = props.agentData

    const data = {
      name: isEdit && row ? row.name || '' : '',
      status: isEdit && row ? (row.status ?? 1) : 1
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
    () => [props.visible, props.type, props.agentData],
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
  const getChangedFields = (): (Partial<Api.Agent.UpdateAgentInfo> & { id: number }) | null => {
    if (!originalData.value || !props.agentData || !props.agentData.id) return null

    const changed: Partial<Api.Agent.UpdateAgentInfo> & { id: number } = {
      id: props.agentData.id
    }

    // 代理名称
    if (formData.name !== originalData.value.name) {
      changed.name = formData.name || ''
    }

    // 代理状态
    if (formData.status !== originalData.value.status) {
      changed.status = formData.status
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
        // 新增代理
        const params: Api.Agent.AddAgentParams = {
          type: props.agentType,
          name: formData.name
        }

        await addAgent(params)
        ElMessage.success('添加成功')
      } else {
        // 编辑代理
        const changedFields = getChangedFields()

        if (!changedFields) {
          ElMessage.warning('无法获取变更数据')
          submitting.value = false
          return
        }

        // 检查是否有修改（除了 id 之外）
        if (Object.keys(changedFields).length <= 1) {
          ElMessage.warning('没有修改任何内容')
          submitting.value = false
          return
        }

        await updateAgent(changedFields)
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
