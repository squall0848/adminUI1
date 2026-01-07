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

/**
 * 请求商户绑定的产品列表
 * @param params 商户绑定的产品列表查询参数
 * @returns 商户绑定的产品列表
 */
export function getMerchantProductList(params: Api.Merchant.ProductBindingParams) {
  return request.get<Api.Merchant.ProductInfo[]>({
    url: '/api/merchant/product',
    params
  })
}

/**
 * 请求商户绑定的通道列表
 * @param params 商户绑定的通道列表查询参数
 * @returns 商户绑定的通道列表
 */
export function getMerchantChannelList(params: Api.Merchant.ChannelBindingParams) {
  return request.get<Api.Merchant.ChannelBindingInfo[]>({
    url: '/api/merchant/channel',
    params
  })
}

/**
 * 商户余额变更
 * @param params 商户余额变更参数
 * @returns 商户余额变更结果
 */
export function changeMerchantBalance(params: Api.Merchant.MerchantBalanceChangeParams) {
  const formData = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value))
  })
  return request.post<Api.Merchant.MerchantBalanceChangeInfo>({
    url: '/api/merchant/balance_add',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 重置商户密钥
 * @param params 重置商户密钥参数
 * @returns 重置商户密钥结果
 */
export function resetMerchantKey(params: Api.Merchant.ResetMerchantSecretKeyParams) {
  return request.get({
    url: '/api/merchant/reset_secret_key',
    params
  })
}

/**
 * 保存商户产品绑定配置
 * @param merchantId 商户ID
 * @param data 产品绑定更新数据
 * @returns 保存结果
 */
export function saveMerchantProduct(
  merchantId: number,
  data: Api.Merchant.MerchantProductBindingUpdate[]
) {
  return request.post({
    url: '/api/merchant/product_save',
    params: { merchant_id: merchantId },
    data
  })
}

/**
 * 保存商户通道绑定配置
 * @param merchantId 商户ID
 * @param data 通道绑定更新数据
 * @returns 保存结果
 */
export function saveMerchantChannel(
  merchantId: number,
  data: Api.Merchant.MerchantChannelBindingUpdate[]
) {
  return request.post({
    url: '/api/merchant/channel_save',
    params: { merchant_id: merchantId },
    data
  })
}

/**
 * 请求商户总预付明细
 * @param params 商户总预付明细查询参数
 * @returns 商户总预付明细列表数据
 */
export function getMerchantTotalPrepayDataList(params: Api.Merchant.MerchantTotalPrepayParams) {
  return request.get<Api.Merchant.MerchantTotalPrepayData[]>({
    url: '/api/merchant/advances',
    params
  })
}

/**
 * 一键处理商户通道绑定状态
 * @param merchantId 商户ID
 * @param data 通道绑定更新数据
 * @returns 保存结果
 */
export function dealMerchantChannel(params: Api.Merchant.MerchantDealChannelParams) {
  return request.post({
    url: '/api/merchant/channel_operation',
    params: params
  })
}
