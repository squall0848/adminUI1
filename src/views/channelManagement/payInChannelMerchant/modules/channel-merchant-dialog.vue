<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增通道商' : '编辑通道商'"
    width="600px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <ElFormItem label="通道商名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入通道商名称" />
      </ElFormItem>

      <ElFormItem label="备注" prop="remark">
        <ElInput
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注（可选）"
        />
      </ElFormItem>

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
  import {
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElSwitch,
    ElButton,
    ElMessage
  } from 'element-plus'

  interface Props {
    visible: boolean
    type: string
    channelMerchantType: number
    channelMerchantData?: Partial<Api.Channel.ChannelMerchant>
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
    remark: '',
    status: 1
  })

  const rules = computed<FormRules>(() => ({
    name: [
      { required: true, message: '请输入通道商名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ]
  }))

  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.channelMerchantData
    const row = props.channelMerchantData

    Object.assign(formData, {
      name: isEdit && row ? row.name || '' : '',
      remark: isEdit && row ? row.remark || '' : '',
      status: isEdit && row ? (row.status ?? 1) : 1
    })
  }

  watch(
    () => [props.visible, props.type, props.channelMerchantData],
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
        // TODO: 调用新增接口
        // await addChannelMerchant({
        //   type: props.channelMerchantType,
        //   name: formData.name,
        //   remark: formData.remark,
        //   status: formData.status
        // })
        ElMessage.success('添加成功')
      } else {
        // TODO: 调用更新接口
        // await updateChannelMerchant({
        //   id: props.channelMerchantData?.id,
        //   name: formData.name,
        //   remark: formData.remark,
        //   status: formData.status
        // })
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
