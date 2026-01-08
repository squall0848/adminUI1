<template>
  <ElDialog v-model="dialogVisible" title="测试支付" width="800px" align-center destroy-on-close>
    <!-- 商户名称 -->
    <div class="form-item">
      <label class="form-label">商户名称：</label>
      <ElInput v-model="merchantName" disabled />
    </div>

    <!-- 支付金额 -->
    <div class="form-item">
      <label class="form-label"> <span class="required">*</span>支付金额： </label>
      <ElInput
        v-model="formData.amount"
        type="number"
        placeholder="请输入支付金额"
        :min="0"
        step="0.01"
      />
    </div>

    <!-- 选择产品 -->
    <div class="form-item">
      <label class="form-label"> <span class="required">*</span>选择产品： </label>
      <ElSelect
        v-model="formData.product_id"
        placeholder="请选择产品"
        style="width: 100%"
        :loading="productLoading"
      >
        <ElOption
          v-for="item in productOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </ElSelect>
    </div>

    <!-- 发起支付按钮 -->
    <div class="form-item">
      <ElButton type="primary" :loading="submitting" @click="handleTestPay" style="width: 100%">
        发起支付
      </ElButton>
    </div>

    <!-- 测试结果 -->
    <div class="form-item">
      <label class="form-label">测试结果：</label>
      <div class="test-result">
        <ElTag :type="resultTagType" size="large" :effect="resultTagEffect">
          {{ testResult }}
        </ElTag>
      </div>
    </div>

    <!-- 上游通道 -->
    <div class="form-item">
      <label class="form-label">上游通道：</label>
      <ElInput v-model="channelName" disabled />
    </div>

    <!-- 下单参数 -->
    <div class="form-item">
      <label class="form-label">下单参数：</label>
      <ElInput
        v-model="requestBody"
        type="textarea"
        :rows="6"
        readonly
        placeholder="暂未测试"
        class="readonly-textarea"
      />
    </div>

    <!-- 返回结果 -->
    <div class="form-item">
      <label class="form-label">返回结果：</label>
      <ElInput
        v-model="responseBody"
        type="textarea"
        :rows="6"
        readonly
        placeholder="暂未测试"
        class="readonly-textarea"
      />
    </div>

    <!-- 支付地址 -->
    <div class="form-item">
      <label class="form-label">支付地址：</label>
      <ElInput v-model="payUrl" readonly />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">关闭</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { getProductMap } from '@/api/product'
  import { merchantTestPay } from '@/api/merchant'
  import { ElMessage } from 'element-plus'

  interface Props {
    visible: boolean
    merchantType: number
    merchantData: Partial<Api.Merchant.MerchantInfo> | null
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 商户名称
  const merchantName = computed(() => props.merchantData?.name || '-')

  // 表单数据
  const formData = reactive({
    amount: '',
    product_id: undefined as number | undefined
  })

  // 产品选项
  const productOptions = ref<Array<{ label: string; value: number }>>([])
  const productLoading = ref(false)

  // 提交状态
  const submitting = ref(false)

  // 测试结果
  const testResult = ref('暂未测试')
  const resultTagType = ref<'info' | 'success' | 'danger'>('info')
  const resultTagEffect = ref<'dark' | 'light' | 'plain'>('plain')

  // 上游通道
  const channelName = ref('')

  // 下单参数
  const requestBody = ref('')

  // 返回结果
  const responseBody = ref('')

  // 支付地址
  const payUrl = ref('')

  // 获取产品列表
  const fetchProductList = async () => {
    if (!props.merchantType) return

    productLoading.value = true
    try {
      const res = await getProductMap({ type: props.merchantType })
      productOptions.value = (res.pageData || []).map((item) => ({
        label: item.name,
        value: item.id
      }))
    } catch (error) {
      console.error('获取产品列表失败', error)
      ElMessage.error('获取产品列表失败')
      productOptions.value = []
    } finally {
      productLoading.value = false
    }
  }

  // 发起支付
  const handleTestPay = async () => {
    // 验证表单
    if (!formData.amount || Number(formData.amount) <= 0) {
      ElMessage.warning('请输入有效的支付金额')
      return
    }

    if (!formData.product_id) {
      ElMessage.warning('请选择产品')
      return
    }

    if (!props.merchantData?.id) {
      ElMessage.error('商户信息不存在')
      return
    }

    submitting.value = true

    try {
      const res = await merchantTestPay({
        merchant_id: props.merchantData.id,
        amount: Number(formData.amount),
        product_id: formData.product_id
      })

      // 更新测试结果
      if (res.test_success) {
        testResult.value = '请求成功'
        resultTagType.value = 'success'
        resultTagEffect.value = 'dark'
      } else {
        testResult.value = '请求失败'
        resultTagType.value = 'danger'
        resultTagEffect.value = 'dark'
      }

      // 更新上游通道
      channelName.value = res.channel?.channel_name || ''

      // 更新下单参数
      requestBody.value = res.request_body || ''

      // 更新返回结果
      responseBody.value = res.response_body || ''

      // 更新支付地址
      payUrl.value = res.pay_url || ''

      if (res.test_success) {
        ElMessage.success('测试支付成功')
      } else {
        ElMessage.error(res.error_type_msg || '测试支付失败')
      }
    } catch (error: any) {
      console.error('测试支付失败', error)
      testResult.value = '请求失败'
      resultTagType.value = 'danger'
      resultTagEffect.value = 'dark'
      ElMessage.error(error?.message || '测试支付失败')
    } finally {
      submitting.value = false
    }
  }

  // 重置表单
  const resetForm = () => {
    formData.amount = ''
    formData.product_id = undefined
    testResult.value = '暂未测试'
    resultTagType.value = 'info'
    resultTagEffect.value = 'plain'
    channelName.value = ''
    requestBody.value = ''
    responseBody.value = ''
    payUrl.value = ''
  }

  // 监听弹窗打开
  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        resetForm()
        fetchProductList()
      }
    }
  )
</script>

<style scoped>
  .form-item {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #606266;
  }

  .required {
    margin-right: 4px;
    color: #f56c6c;
  }

  .test-result {
    display: flex;
    align-items: center;
  }

  .readonly-textarea {
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }

  .readonly-textarea :deep(.el-textarea__inner) {
    cursor: default;
    background-color: #f5f7fa;
  }

  .dialog-footer {
    text-align: right;
  }
</style>
