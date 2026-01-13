<template>
  <ElDialog
    v-model="dialogVisible"
    title="订单详情"
    width="1200px"
    align-center
    destroy-on-close
    class="order-detail-dialog"
  >
    <ElTabs v-model="activeTab" type="border-card">
      <!-- 基本信息 -->
      <ElTabPane label="基本信息" name="basic">
        <div class="detail-content" v-loading="loading">
          <ElRow :gutter="20" v-if="orderDetail">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">订单ID：</span>
                <span class="value">{{ orderDetail.order_id || '-' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">状态：</span>
                <span class="value">{{ orderDetail.order_status || '-' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">商户：</span>
                <span class="value"
                  >{{ orderDetail.merchant_name || '-' }}（{{
                    orderDetail.merchant_code || '-'
                  }}）</span
                >
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">产品/通道：</span>
                <span class="value"
                  >{{ orderDetail.product_name || '-' }}/{{
                    orderDetail.passageway_name || '-'
                  }}</span
                >
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">系统单号：</span>
                <span class="value">
                  {{ orderDetail.trade_no || '-' }}
                  <ElButton
                    v-if="orderDetail.trade_no"
                    type="primary"
                    link
                    size="small"
                    @click="handleCopy(orderDetail.trade_no)"
                  >
                    复制
                  </ElButton>
                </span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">商户单号：</span>
                <span class="value">
                  {{ orderDetail.out_trade_no || '-' }}
                  <ElButton
                    v-if="orderDetail.out_trade_no"
                    type="primary"
                    link
                    size="small"
                    @click="handleCopy(orderDetail.out_trade_no)"
                  >
                    复制
                  </ElButton>
                </span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">通道单号：</span>
                <span class="value">
                  {{ orderDetail.passageway_trade_no || '-' }}
                  <ElButton
                    v-if="orderDetail.passageway_trade_no"
                    type="primary"
                    link
                    size="small"
                    @click="handleCopy(orderDetail.passageway_trade_no)"
                  >
                    复制
                  </ElButton>
                </span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">创建时间：</span>
                <span class="value">{{ orderDetail.submit_time || '-' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">成功时间：</span>
                <span class="value">{{ orderDetail.success_time || '-' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">支付耗时：</span>
                <span class="value">{{ orderDetail.pay_duration_text || '-' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">用户IP：</span>
                <span class="value">
                  {{ orderDetail.submit_ip || '-' }}
                  <ElButton
                    v-if="orderDetail.submit_ip"
                    type="primary"
                    link
                    size="small"
                    @click="handleCopy(orderDetail.submit_ip)"
                  >
                    复制
                  </ElButton>
                </span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">支付链接：</span>
                <span class="value">
                  {{ orderDetail.pay_url || '-' }}
                  <ElButton
                    v-if="orderDetail.pay_url"
                    type="primary"
                    link
                    size="small"
                    @click="handleCopy(orderDetail.pay_url)"
                  >
                    复制
                  </ElButton>
                </span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">订单金额：</span>
                <span class="value">{{ orderDetail.trade_amount || '0.00' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">实际支付金额：</span>
                <span class="value">{{ orderDetail.actual_amount || '0.00' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">商户收入：</span>
                <span class="value">{{ orderDetail.merchant_income || '0.00' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">通道收入：</span>
                <span class="value">{{ orderDetail.passageway_income || '0.00' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">商户手续费：</span>
                <span class="value">{{ orderDetail.merchant_service_fee || '0.00' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">通道手续费：</span>
                <span class="value">{{ orderDetail.passageway_service_fee || '0.00' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">商户代理手续费：</span>
                <span class="value">{{ orderDetail.merchant_agent_service_fee || '0.00' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">通道代理手续费：</span>
                <span class="value">{{ orderDetail.passageway_agent_service_fee || '0.00' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">订单成本：</span>
                <span class="value">{{ orderDetail.order_cost || '0.00' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">订单利润：</span>
                <span class="value">{{ orderDetail.order_profit || '0.00' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">商户费率：</span>
                <span class="value">{{ orderDetail.merchant_rate || '0.00' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">通道费率：</span>
                <span class="value">{{ orderDetail.passageway_rate || '0.00' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">商户代理费率：</span>
                <span class="value">{{ orderDetail.merchant_agent_rate || '0.00' }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="label">通道代理费率：</span>
                <span class="value">{{ orderDetail.passageway_agent_rate || '0.00' }}</span>
              </div>
            </ElCol>
          </ElRow>
        </div>
      </ElTabPane>

      <!-- 回调与请求 -->
      <ElTabPane label="回调与请求" name="callback">
        <div class="detail-content" v-loading="loading">
          <div v-if="orderDetail" class="callback-content">
            <div class="detail-section">
              <div class="section-title">通知地址</div>
              <div class="section-content">
                <div class="detail-item">
                  <span class="value">
                    {{ orderDetail.notify_url || '-' }}
                    <ElButton
                      v-if="orderDetail.notify_url"
                      type="primary"
                      link
                      size="small"
                      @click="handleCopy(orderDetail.notify_url)"
                    >
                      复制
                    </ElButton>
                  </span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <div class="section-title">商户通知信息</div>
              <div class="section-content">
                <ElInput
                  v-model="orderDetail.merchant_notify_info"
                  type="textarea"
                  :rows="6"
                  readonly
                  class="readonly-textarea"
                />
              </div>
            </div>

            <div class="detail-section">
              <div class="section-title">请求日志</div>
              <div class="section-content">
                <ElInput
                  v-model="orderDetail.request_logs"
                  type="textarea"
                  :rows="6"
                  readonly
                  class="readonly-textarea"
                />
              </div>
            </div>

            <div class="detail-section">
              <div class="section-title">查询内容</div>
              <div class="section-content">
                <ElInput
                  v-model="orderDetail.query_content"
                  type="textarea"
                  :rows="6"
                  readonly
                  class="readonly-textarea"
                />
              </div>
            </div>

            <div class="detail-section">
              <div class="section-title">支付请求响应</div>
              <div class="section-content">
                <ElInput
                  v-model="orderDetail.payment_request_response"
                  type="textarea"
                  :rows="6"
                  readonly
                  class="readonly-textarea"
                />
              </div>
            </div>

            <div class="detail-section">
              <div class="section-title">通道回调内容</div>
              <div class="section-content">
                <ElInput
                  v-model="orderDetail.callback_content"
                  type="textarea"
                  :rows="6"
                  readonly
                  class="readonly-textarea"
                />
              </div>
            </div>

            <div class="detail-section">
              <div class="section-title">回调记录</div>
              <div class="section-content">
                <div class="detail-item">
                  <span class="label">回调状态：</span>
                  <span class="value">{{ orderDetail.callback_status_text || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">回调ID：</span>
                  <span class="value">{{ orderDetail.callback_id || '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ElTabPane>
    </ElTabs>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">关闭</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { getOrderDetails } from '@/api/order'
  import {
    ElDialog,
    ElTabs,
    ElTabPane,
    ElRow,
    ElCol,
    ElButton,
    ElInput,
    ElMessage
  } from 'element-plus'
  import { useClipboard } from '@vueuse/core'

  interface Props {
    visible: boolean
    orderId?: number
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const activeTab = ref('basic')
  const loading = ref(false)
  const orderDetail = ref<Api.Order.OrderDetails | null>(null)

  const { copy } = useClipboard()

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
   * 获取订单详情
   */
  const fetchOrderDetails = async () => {
    if (!props.orderId) return

    loading.value = true
    try {
      const res = await getOrderDetails({ id: props.orderId })
      orderDetail.value = res
    } catch (error) {
      console.error('获取订单详情失败', error)
      ElMessage.error('获取订单详情失败')
      orderDetail.value = null
    } finally {
      loading.value = false
    }
  }

  // 监听弹窗打开
  watch(
    () => props.visible,
    (visible) => {
      if (visible && props.orderId) {
        activeTab.value = 'basic'
        fetchOrderDetails()
      }
    }
  )
</script>

<style lang="scss" scoped>
  .order-detail-dialog {
    .detail-content {
      min-height: 400px;
      padding: 20px 0;

      .detail-item {
        display: flex;
        align-items: center;
        min-height: 32px;
        margin-bottom: 16px;

        .label {
          flex-shrink: 0;
          min-width: 120px;
          font-weight: 500;
          color: var(--el-text-color-regular);
        }

        .value {
          flex: 1;
          color: var(--el-text-color-primary);
          word-break: break-all;
        }
      }

      .callback-content {
        .detail-section {
          margin-bottom: 24px;

          .section-title {
            padding-bottom: 8px;
            margin-bottom: 12px;
            font-size: 16px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            border-bottom: 1px solid var(--el-border-color-light);
          }

          .section-content {
            .readonly-textarea {
              :deep(.el-textarea__inner) {
                cursor: default;
                background-color: var(--el-fill-color-light);
              }
            }
          }
        }
      }
    }
  }
</style>
