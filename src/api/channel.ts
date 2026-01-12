import request from '@/utils/http'

/**
 * 通道列表
 * @param params 页面查询参数
 * @returns 通道列表数据
 */
export function getChannelList(params: Api.Channel.ChannelParams) {
  return request.get<Api.Channel.ChannelInfoList>({
    url: 'api/channel/get',
    params
  })
}

/**
 * 新增通道
 * @param params 新增通道参数
 * @returns 新增通道结果
 */
export function addChannel(params: Api.Channel.AddChannelParams) {
  const formData = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value))
  })
  return request.post({
    url: '/api/channel/add',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 批量删除通道
 * @param params 通道ID列表
 * @returns 删除结果
 */
export function delChannel(params: number[]) {
  return request.post({
    url: '/api/channel/del',
    data: params
  })
}

/**
 * 更新通道
 * @param params 更新通道参数
 * @returns 更新通道结果
 */
export function updateChannel(params: Api.Channel.UpdateChannelParams) {
  const formData = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value))
  })
  return request.post({
    url: '/api/channel/update',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 通道商映射列表
 * @param params 页面查询参数
 * @returns 通道列表数据
 */
export function getChannelMerchantInfoList(params: Api.Channel.ChannelMerchantParams) {
  return request.get<Api.Channel.ChannelMerchantInfoList>({
    url: 'api/channel/class_pulldown',
    params
  })
}

/**
 * 通道调额
 * @param params 通道调额参数
 * @returns 变更结果
 */
export function changeChannelBalance(params: Api.Channel.ChannelBalanceChangeParams) {
  const formData = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value))
  })
  return request.post<Api.Channel.ChannelBalanceChangeInfo>({
    url: '/api/channel/balance_add',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 通道商列表
 * @param params 页面查询参数
 * @returns 通道商列表数据
 */
export function getChannelMerchantList(params: Api.Channel.ChannelMerchantListParams) {
  return request.get<Api.Channel.ChannelMerchantList>({
    url: 'api/channel/get_class',
    params
  })
}

/**
 * 新增通道商
 * @param params 新增通道参数
 * @returns 新增结果
 */
export function addChannelMerchant(params: Api.Channel.AddChannelMerchantParams) {
  const formData = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value))
  })
  return request.post<Api.Channel.AddChannelMerchantInfo>({
    url: '/api/channel/class_add',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 更新通道商
 * @param params 更新参数
 * @returns 变更结果
 */
export function updateChannelMerchant(params: Api.Channel.UpdateChannelMerchantParams) {
  const formData = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value))
  })
  return request.post<Api.Channel.UpdateChannelMerchantInfo>({
    url: '/api/channel/class_update',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 批量删除通道商
 * @param params 通道商ID列表
 * @returns 删除结果
 */
export function delChannelMerchant(params: number[]) {
  return request.post({
    url: '/api/channel/class_del',
    data: params
  })
}
