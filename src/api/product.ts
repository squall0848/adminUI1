import request from '@/utils/http'

/**
 * 产品映射列表
 * @param params 页面查询参数
 * @returns 产品映射列表数据
 */
export function getProductMap(params: Api.Product.ProductMapParams) {
  return request.get<Api.Product.ProductMapInfoList>({
    url: '/api/product/get_pulldown',
    params
  })
}
