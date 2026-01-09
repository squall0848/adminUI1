<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增代收商户组' : '编辑代收商户组'"
    width="600px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <!-- 商户组名称 -->
      <ElFormItem label="商户组名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入商户组名称" />
      </ElFormItem>

      <!-- 描述 -->
      <ElFormItem label="描述" prop="remark">
        <ElInput
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入描述（可选）"
        />
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
  import { ElMessage } from 'element-plus'
  import { addMerchantGroup } from '@/api/merchant'

  interface Props {
    visible: boolean
    type: string
    /** 商户类型：1-代收 2-代付 */
    merchantType: number
    merchantGroupData?: Partial<Api.Merchant.MerchantGroup>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogType = computed(() => props.type)

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 表单引用
  const formRef = ref<FormInstance>()

  // 提交状态
  const submitting = ref(false)

  // 表单数据
  const formData = reactive({
    name: '',
    remark: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    name: [{ required: true, message: '请输入商户组名称', trigger: 'blur' }]
  }

  // 初始化表单数据
  const initFormData = () => {
    if (props.merchantGroupData && dialogType.value === 'edit') {
      formData.name = props.merchantGroupData.name || ''
      formData.remark = props.merchantGroupData.remark || ''
    } else {
      formData.name = ''
      formData.remark = ''
    }
  }

  // 监听弹窗打开
  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    }
  )

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      submitting.value = true

      try {
        if (dialogType.value === 'add') {
          await addMerchantGroup({
            type: props.merchantType,
            name: formData.name,
            remark: formData.remark || undefined
          })
          ElMessage.success('新增成功')
        } else {
          // TODO: 调用编辑接口
          // await updateMerchantGroup({
          //   id: props.merchantGroupData?.id,
          //   name: formData.name,
          //   remark: formData.remark || ''
          // })
          ElMessage.success('编辑成功')
        }

        dialogVisible.value = false
        emit('submit')
      } catch (error) {
        console.error('提交失败', error)
        ElMessage.error('提交失败，请重试')
      } finally {
        submitting.value = false
      }
    } catch {
      // 表单验证失败
    }
  }
</script>

<style scoped>
  .dialog-footer {
    text-align: right;
  }
</style>
