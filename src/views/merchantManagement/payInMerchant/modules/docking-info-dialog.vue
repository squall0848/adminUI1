<!-- 对接信息弹窗 -->
<template>
  <ElDialog v-model="dialogVisible" title="账号信息" width="600px" align-center>
    <div v-loading="loading" class="docking-info-content">
      <div v-if="dockingInfo" class="info-list">
        <!-- 商户后台 -->
        <div class="info-item">
          <span class="info-label">商户后台：</span>
          <span class="info-value">{{ dockingInfo.login_info?.login_url || '-' }}</span>
          <ElIcon
            v-if="dockingInfo.login_info?.login_url"
            class="copy-icon"
            @click="handleCopy(dockingInfo.login_info.login_url)"
          >
            <DocumentCopy />
          </ElIcon>
        </div>

        <!-- 登录账号 -->
        <div class="info-item">
          <span class="info-label">登录账号：</span>
          <span class="info-value">{{ dockingInfo.login_info?.merchant_name || '-' }}</span>
          <ElIcon
            v-if="dockingInfo.login_info?.merchant_name"
            class="copy-icon"
            @click="handleCopy(dockingInfo.login_info.merchant_name)"
          >
            <DocumentCopy />
          </ElIcon>
        </div>

        <!-- 密码 -->
        <div class="info-item">
          <span class="info-label">密码：</span>
          <div class="info-value-with-action">
            <ElInput
              v-model="passwordDisplay"
              :type="showPassword ? 'text' : 'password'"
              readonly
              class="password-input"
            >
              <template #suffix>
                <ElIcon class="password-toggle-icon" @click="showPassword = !showPassword">
                  <View v-if="showPassword" />
                  <Hide v-else />
                </ElIcon>
              </template>
            </ElInput>
            <ElIcon
              v-if="dockingInfo.login_info?.login_password"
              class="copy-icon"
              @click="handleCopy(dockingInfo.login_info.login_password)"
            >
              <DocumentCopy />
            </ElIcon>
          </div>
        </div>

        <!-- 商户号 -->
        <div class="info-item">
          <span class="info-label">商户号：</span>
          <span class="info-value">{{ dockingInfo.api_info?.merchant_no || '-' }}</span>
          <ElIcon
            v-if="dockingInfo.api_info?.merchant_no"
            class="copy-icon"
            @click="handleCopy(dockingInfo.api_info.merchant_no)"
          >
            <DocumentCopy />
          </ElIcon>
        </div>

        <!-- 商户密钥 -->
        <div class="info-item">
          <span class="info-label">商户密钥：</span>
          <span class="info-value">{{ dockingInfo.api_info?.merchant_key || '-' }}</span>
          <ElIcon
            v-if="dockingInfo.api_info?.merchant_key"
            class="copy-icon"
            @click="handleCopy(dockingInfo.api_info.merchant_key)"
          >
            <DocumentCopy />
          </ElIcon>
        </div>

        <!-- 回调IP -->
        <div class="info-item">
          <span class="info-label">回调IP：</span>
          <span class="info-value">{{ dockingInfo.api_info?.callback_server_ips || '-' }}</span>
          <ElIcon
            v-if="dockingInfo.api_info?.callback_server_ips"
            class="copy-icon"
            @click="handleCopy(dockingInfo.api_info.callback_server_ips)"
          >
            <DocumentCopy />
          </ElIcon>
        </div>

        <!-- 对接文档 -->
        <div class="info-item">
          <span class="info-label">对接文档：</span>
          <span class="info-value">{{ dockingInfo.api_info?.api_docs_url || '-' }}</span>
          <ElIcon
            v-if="dockingInfo.api_info?.api_docs_url"
            class="copy-icon"
            @click="handleCopy(dockingInfo.api_info.api_docs_url)"
          >
            <DocumentCopy />
          </ElIcon>
        </div>

        <!-- 下单地址 -->
        <div class="info-item">
          <span class="info-label">下单地址：</span>
          <span class="info-value">{{ dockingInfo.api_info?.pay_url || '-' }}</span>
          <ElIcon
            v-if="dockingInfo.api_info?.pay_url"
            class="copy-icon"
            @click="handleCopy(dockingInfo.api_info.pay_url)"
          >
            <DocumentCopy />
          </ElIcon>
        </div>

        <!-- 查单地址 -->
        <div class="info-item">
          <span class="info-label">查单地址：</span>
          <span class="info-value">{{ dockingInfo.api_info?.query_url || '-' }}</span>
          <ElIcon
            v-if="dockingInfo.api_info?.query_url"
            class="copy-icon"
            @click="handleCopy(dockingInfo.api_info.query_url)"
          >
            <DocumentCopy />
          </ElIcon>
        </div>

        <!-- 余额查询 -->
        <div class="info-item">
          <span class="info-label">余额查询：</span>
          <span class="info-value">{{ dockingInfo.api_info?.balance_url || '-' }}</span>
          <ElIcon
            v-if="dockingInfo.api_info?.balance_url"
            class="copy-icon"
            @click="handleCopy(dockingInfo.api_info.balance_url)"
          >
            <DocumentCopy />
          </ElIcon>
        </div>

        <!-- 支付测试编码 -->
        <div class="info-item">
          <span class="info-label">支付测试编码：</span>
          <span class="info-value">{{ dockingInfo.api_info?.pay_test_code || '-' }}</span>
          <ElIcon
            v-if="dockingInfo.api_info?.pay_test_code"
            class="copy-icon"
            @click="handleCopy(dockingInfo.api_info.pay_test_code)"
          >
            <DocumentCopy />
          </ElIcon>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton type="primary" @click="handleCopyAll">点我复制</ElButton>
        <ElButton @click="dialogVisible = false">关闭</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElDialog, ElInput, ElIcon, ElButton, ElMessage } from 'element-plus'
  import { DocumentCopy, View, Hide } from '@element-plus/icons-vue'
  import { getMerchantDockingInfo } from '@/api/merchant'
  import { useClipboard } from '@vueuse/core'

  defineOptions({ name: 'DockingInfoDialog' })

  interface Props {
    visible: boolean
    merchantId?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    merchantId: undefined
  })

  const emit = defineEmits<{
    'update:visible': [value: boolean]
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const loading = ref(false)
  const dockingInfo = ref<Api.Merchant.MerchantDockingInfo | null>(null)
  const showPassword = ref(false)
  const { copy } = useClipboard()

  const passwordDisplay = computed(() => {
    return dockingInfo.value?.login_info?.login_password || ''
  })

  /**
   * 复制文本
   */
  const handleCopy = async (text: string) => {
    if (!text) return
    try {
      await copy(text)
      ElMessage.success('复制成功')
    } catch (error) {
      console.error('复制失败', error)
      ElMessage.error('复制失败')
    }
  }

  /**
   * 复制全部信息
   */
  const handleCopyAll = async () => {
    if (!dockingInfo.value) return

    const lines: string[] = []
    lines.push('账号信息')
    lines.push('')

    // 登录信息
    if (dockingInfo.value.login_info) {
      const loginInfo = dockingInfo.value.login_info
      if (loginInfo.login_url) lines.push(`商户后台：${loginInfo.login_url}`)
      if (loginInfo.merchant_name) lines.push(`登录账号：${loginInfo.merchant_name}`)
      if (loginInfo.login_password) lines.push(`密码：${loginInfo.login_password}`)
    }

    lines.push('')

    // API信息
    if (dockingInfo.value.api_info) {
      const apiInfo = dockingInfo.value.api_info
      if (apiInfo.merchant_no) lines.push(`商户号：${apiInfo.merchant_no}`)
      if (apiInfo.merchant_key) lines.push(`商户密钥：${apiInfo.merchant_key}`)
      if (apiInfo.callback_server_ips) lines.push(`回调IP：${apiInfo.callback_server_ips}`)
      if (apiInfo.api_docs_url) lines.push(`对接文档：${apiInfo.api_docs_url}`)
      if (apiInfo.pay_url) lines.push(`下单地址：${apiInfo.pay_url}`)
      if (apiInfo.query_url) lines.push(`查单地址：${apiInfo.query_url}`)
      if (apiInfo.balance_url) lines.push(`余额查询：${apiInfo.balance_url}`)
      if (apiInfo.pay_test_code) lines.push(`支付测试编码：${apiInfo.pay_test_code}`)
    }

    const allText = lines.join('\n')
    try {
      await copy(allText)
      ElMessage.success('复制成功')
    } catch (error) {
      console.error('复制失败', error)
      ElMessage.error('复制失败')
    }
  }

  /**
   * 获取对接信息
   */
  const fetchDockingInfo = async () => {
    if (!props.merchantId) return

    loading.value = true
    try {
      const res = await getMerchantDockingInfo({ merchant_id: props.merchantId })
      dockingInfo.value = res
    } catch (error) {
      console.error('获取对接信息失败', error)
      ElMessage.error('获取对接信息失败')
    } finally {
      loading.value = false
    }
  }

  // 监听弹窗显示状态和商户ID
  watch(
    () => [dialogVisible.value, props.merchantId],
    ([visible, merchantId]) => {
      if (visible && merchantId) {
        fetchDockingInfo()
      } else if (!visible) {
        // 关闭时重置状态
        dockingInfo.value = null
        showPassword.value = false
      }
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  .docking-info-content {
    min-height: 200px;
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .info-item {
    display: flex;
    gap: 8px;
    align-items: center;
    min-height: 32px;

    .info-label {
      min-width: 120px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .info-value {
      flex: 1;
      color: var(--el-text-color-regular);
      word-break: break-all;
    }

    .info-value-with-action {
      display: flex;
      flex: 1;
      gap: 8px;
      align-items: center;

      .password-input {
        flex: 1;
      }

      .password-toggle-icon {
        font-size: 16px;
        color: var(--el-text-color-secondary);
        cursor: pointer;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }

    .copy-icon {
      flex-shrink: 0;
      font-size: 18px;
      color: var(--el-text-color-secondary);
      cursor: pointer;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
</style>
