import request from '@/utils/http'

/**
 * 代理映射列表
 * @param params 页面查询参数
 * @returns 代理映射列表数据
 */
export function getAgentMap(params: Api.Agent.AgentMapParams) {
  return request.get<Api.Agent.AgentMapInfoList>({
    url: '/api/agent/get_pulldown',
    params
  })
}
