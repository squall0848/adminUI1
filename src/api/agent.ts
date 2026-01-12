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

/**
 * 代理列表
 * @param params 页面查询参数
 * @returns 代理列表数据
 */
export function getAgentList(params: Api.Agent.AgentParams) {
  return request.get<Api.Agent.AgentInfoList>({
    url: '/api/agent/get',
    params
  })
}

/**
 * 批量删除代理
 * @param params 代理ID列表
 * @returns 删除结果
 */
export function delAgent(params: number[]) {
  return request.post({
    url: '/api/agent/del',
    data: params
  })
}

/**
 * 更新代理
 * @param params 代理更新参数
 * @returns 更新结果
 */
export function updateAgent(params: Api.Agent.UpdateAgentInfo) {
  const formData = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })
  return request.post({
    url: '/api/agent/update',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 新增代理
 * @param params 新增代理参数
 * @returns 新增代理结果
 */
export function addAgent(params: Api.Agent.AddAgentParams) {
  const formData = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })
  return request.post({
    url: '/api/agent/add',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}
