/**
 * 通用枚举定义
 */

/**
 * 通用状态
 */
export enum CommonStatus {
  /** 禁用/关闭 */
  DISABLED = 0,
  /** 启用/开启 */
  ENABLED = 1
}

/**
 * 订单类型
 */
export enum OrderType {
  /** 代收 */
  PAY_IN = 1,
  /** 代付 */
  PAY_OUT = 2
}

/**
 * 订单状态
 */
export enum OrderStatus {
  /** 待支付 */
  PENDING = 0,
  /** 支付成功 */
  SUCCESS = 1,
  /** 支付失败 */
  FAILED = 2,
  /** 冲正 */
  REVERSAL = 3,
  /** 未出码 */
  NO_CODE = 4,
  /** 超时关闭 */
  TIMEOUT = 5
}

/**
 * 回调状态
 */
export enum CallbackStatus {
  /** 未通知 */
  NOT_NOTIFIED = 0,
  /** 通知成功 */
  SUCCESS = 1,
  /** 通知中 */
  NOTIFYING = 2,
  /** 超过重试次数 */
  EXCEED_RETRY = 3
}

/**
 * 订单状态配置（用于表格显示）
 */
export interface OrderStatusConfig {
  /** 显示文本 */
  text: string
  /** Element Plus Tag 类型 */
  type: 'info' | 'success' | 'danger' | 'warning'
}

/**
 * 回调状态配置（用于表格显示）
 */
export interface CallbackStatusConfig {
  /** 显示文本 */
  text: string
  /** Element Plus Tag 类型 */
  type: 'info' | 'success' | 'danger' | 'warning'
}

/**
 * 订单状态映射表（用于表格显示）
 */
export const ORDER_STATUS_MAP: Record<OrderStatus, OrderStatusConfig> = {
  [OrderStatus.PENDING]: { text: '待支付', type: 'info' },
  [OrderStatus.SUCCESS]: { text: '支付成功', type: 'success' },
  [OrderStatus.FAILED]: { text: '支付失败', type: 'danger' },
  [OrderStatus.REVERSAL]: { text: '冲正', type: 'warning' },
  [OrderStatus.NO_CODE]: { text: '未出码', type: 'info' },
  [OrderStatus.TIMEOUT]: { text: '超时关闭', type: 'info' }
}

/**
 * 回调状态映射表（用于表格显示）
 */
export const CALLBACK_STATUS_MAP: Record<CallbackStatus, CallbackStatusConfig> = {
  [CallbackStatus.NOT_NOTIFIED]: { text: '未通知', type: 'info' },
  [CallbackStatus.SUCCESS]: { text: '通知成功', type: 'success' },
  [CallbackStatus.NOTIFYING]: { text: '通知中', type: 'warning' },
  [CallbackStatus.EXCEED_RETRY]: { text: '超过重试次数', type: 'danger' }
}

/**
 * 订单状态文本映射表（用于导出）
 */
export const ORDER_STATUS_TEXT_MAP: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '待支付',
  [OrderStatus.SUCCESS]: '支付成功',
  [OrderStatus.FAILED]: '支付失败',
  [OrderStatus.REVERSAL]: '冲正',
  [OrderStatus.NO_CODE]: '未出码',
  [OrderStatus.TIMEOUT]: '超时关闭'
}

/**
 * 回调状态文本映射表（用于导出）
 */
export const CALLBACK_STATUS_TEXT_MAP: Record<CallbackStatus, string> = {
  [CallbackStatus.NOT_NOTIFIED]: '未通知',
  [CallbackStatus.SUCCESS]: '通知成功',
  [CallbackStatus.NOTIFYING]: '通知中',
  [CallbackStatus.EXCEED_RETRY]: '超过重试次数'
}

/**
 * 获取订单状态配置
 * @param status 订单状态值
 * @returns 订单状态配置，如果不存在返回默认配置
 */
export function getOrderStatusConfig(status: number): OrderStatusConfig {
  return ORDER_STATUS_MAP[status as OrderStatus] || { text: '-', type: 'info' }
}

/**
 * 获取回调状态配置
 * @param status 回调状态值
 * @returns 回调状态配置，如果不存在返回默认配置
 */
export function getCallbackStatusConfig(status: number): CallbackStatusConfig {
  return CALLBACK_STATUS_MAP[status as CallbackStatus] || { text: '-', type: 'info' }
}

/**
 * 获取订单状态文本
 * @param status 订单状态值
 * @returns 订单状态文本，如果不存在返回 '-'
 */
export function getOrderStatusText(status: number): string {
  return ORDER_STATUS_TEXT_MAP[status as OrderStatus] || '-'
}

/**
 * 获取回调状态文本
 * @param status 回调状态值
 * @returns 回调状态文本，如果不存在返回 '-'
 */
export function getCallbackStatusText(status: number): string {
  return CALLBACK_STATUS_TEXT_MAP[status as CallbackStatus] || '-'
}

/**
 * 通用状态选项（用于下拉框）
 */
export const COMMON_STATUS_OPTIONS = [
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' }
] as const

/**
 * 通用状态选项（用于下拉框，关闭版本）
 */
export const COMMON_STATUS_OPTIONS_CLOSE = [
  { label: '启用', value: '1' },
  { label: '关闭', value: '0' }
] as const

/**
 * 获取通用状态文本
 * @param status 状态值
 * @param useClose 是否使用"关闭"而不是"禁用"，默认为 false
 * @returns 状态文本
 */
export function getCommonStatusText(status: number, useClose = false): string {
  if (status === CommonStatus.ENABLED) {
    return '启用'
  }
  return useClose ? '关闭' : '禁用'
}

/**
 * 判断是否为启用状态
 * @param status 状态值
 * @returns 是否为启用状态
 */
export function isEnabled(status: number): boolean {
  return status === CommonStatus.ENABLED
}

/**
 * 判断是否为禁用状态
 * @param status 状态值
 * @returns 是否为禁用状态
 */
export function isDisabled(status: number): boolean {
  return status === CommonStatus.DISABLED
}
