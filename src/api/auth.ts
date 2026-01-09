import request from '@/utils/http'
import { useUserStore } from '@/store/modules/user'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  // 使用 URLSearchParams 将数据转换为 x-www-form-urlencoded 格式
  // PHP 后端使用 $_POST 获取数据，需要此格式
  const formData = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value))
  })

  return request.post<Api.Auth.LoginResponse>({
    url: '/api/user/adminlogin',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    // showSuccessMessage: true // 显示成功消息
    // showErrorMessage: false // 不显示错误消息
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/api/user/info'
    // 自定义请求头
    // headers: {
    //   'X-Custom-Header': 'your-custom-value'
    // }
  })
}

/**
 * 修改密码
 * @param params 修改密码参数
 * @returns 修改密码响应
 */
export function fetchModifyPassword(params: Api.Auth.ModifyPasswordParams) {
  const userStore = useUserStore()
  const token = userStore.accessToken

  // 使用 URLSearchParams 将数据转换为 x-www-form-urlencoded 格式
  const formData = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value))
  })

  return request.post({
    url: '/api/user/adminModifyPwd',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: token
    }
  })
}
