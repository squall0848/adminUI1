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
