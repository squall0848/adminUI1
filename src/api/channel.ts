import request from '@/utils/http'

/**
 * 通道列表列表
 * @param params 页面查询参数
 * @returns 通道列表数据
 */
export function getChannelList(params: Api.Channel.ChannelParams) {
  return request.get<Api.Channel.ChannelInfoList>({
    url: 'api/channel/get',
    params
  })
}
