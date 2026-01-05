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
 * @returns 删除结果
 */
export function delMerchant(params: number[]) {
  return request.post({
    url: '/api/merchant/del',
    data: params
  })
}

/**
 * 商户更新
 * @param params 商户更新参数
 * @returns 更新结果
 */
export function updateMerchant(params: Api.Merchant.UpdateMerchantInfo) {
  const formData = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value))
  })
  return request.post({
    url: '/api/merchant/update',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 商户组映射列表
 * @param params 页面查询参数
 * @returns 商户组映射列表数据
 */
export function getMerchantGroupMap(params: Api.Merchant.MerchantGroupParams) {
  return request.get<Api.Merchant.MerchantGroupInfoList>({
    url: '/api/merchant/class_pulldown',
    params
  })
}

/**
 * 新增商户
 * @param params 新增商户参数
 * @returns 新增商户结果
 */
export function addMerchant(params: Api.Merchant.AddMerchantParams) {
  const formData = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value))
  })
  return request.post({
    url: '/api/merchant/add',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 商户总预付调额
 * @param params 商户总预付调额参数
 * @returns 变更结果
 */
export function changeMerchantAdvance(params: Api.Merchant.MerchantChangeAdvanceParams) {
  const formData = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value))
  })
  return request.post<Api.Merchant.MerchantChangeAdvanceInfo>({
    url: '/api/merchant/advance_add',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}
