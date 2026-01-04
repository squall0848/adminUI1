import request from '@/utils/http'

/**
 * 商户列表
 * @param params 页面查询参数
 * @returns 商户列表数据
 */
export function getMerchant(params: Api.Merchant.MerchantListParams) {
  return request.get<Api.Merchant.MerchantList>({
    url: '/api/merchant/get',
    params
  })
}

/**
 * 批量删除商户
 * @param params 商户ID列表
 * @returns 商户列表数据
 */
export function delMerchant(params: number[]) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/merchant/del',
    data: params
  })
}
