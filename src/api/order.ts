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
