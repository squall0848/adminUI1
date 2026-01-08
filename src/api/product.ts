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

/**
 * 产品列表
 * @param params 页面查询参数
 * @returns 产品列表数据
 */
export function getChannelList(params: Api.Product.ProductParams) {
  return request.get<Api.Product.ProductInfoList>({
    url: 'api/product/get',
    params
  })
}

/**
 * 新增产品
 * @param params 新增产品参数
 * @returns 新增产品结果
 */
export function AddProduct(params: Api.Product.AddProductParams) {
  const formData = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value))
  })
  return request.post({
    url: '/api/product/add',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 批量删除产品
 * @param params 产品ID列表
 * @returns 删除结果
 */
export function delProduct(params: number[]) {
  return request.post({
    url: '/api/product/del',
    data: params
  })
}
