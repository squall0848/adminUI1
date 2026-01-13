import request from '@/utils/http'

/**
 * 订单列表
 * @param params 页面查询参数
 * @returns 订单列表数据
 */
export function getOrderList(params: Api.Order.OrderListParams) {
  return request.get<Api.Order.OrderList>({
    url: '/api/order/get',
    params
  })
}

/**
 * 订单详情
 * @param params 订单详情查询参数
 * @returns 订单详情数据
 */
export function getOrderDetails(params: Api.Order.OrderDetailsParams) {
  return request.get<Api.Order.OrderDetails>({
    url: '/api/order/details',
    params
  })
}
