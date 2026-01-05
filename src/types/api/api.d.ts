/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      username: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken: string
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      userId: number
      userName: string
      email: string
      avatar?: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams
    >
  }

  /** 商户数据类型 */
  namespace Merchant {
    /** 商户列表查询参数 */
    interface MerchantListParams {
      type?: string //类型 {系统菜单} (1:代收, 2:代付)
      pageNo: string //页数
      pageSize: string //每页数量
      sort?: string //排序字段名
      order: string //升序和降序 (0:asc, 1:desc)
      status?: string //商户状态(0:关闭, 1:启用)
      class?: string //商户组ID
      search?: string //查询关键词 商户名称/商户号
      agent?: string //代理ID
      remark?: string //备注
    }

    /** 商户数据 */
    interface MerchantInfo {
      id: number
      type: number
      class: number
      agent: number
      agent_rate: number
      code: string
      name: string
      password: string
      secret: string
      salt: number
      payin_balance: number
      payin_advance: number
      payout_balance: number
      status: number
      auto_settle: number
      receive_group_notice: number
      settle_notice: number
      rate_change_notice: number
      remark: string
      tg_group_id: number
      telegram_name: string
      last_login_time: string
      last_login_ip: string
      login_count: number
      update_time: string
      create_time: string
    }

    /** 商户列表数据 */
    interface MerchantList {
      total: number
      total_payin_balance: number
      total_advance: number
      pageData: MerchantInfo[]
    }

    /** 商户数据更新参数 */
    interface UpdateMerchantInfo {
      id: number //更新的商户ID
      class?: number //商户组
      agent?: number //代理
      agent_rate?: number //代理利润
      code?: string //商户号
      name?: string //商户名称
      password?: string //密码
      secret?: string //密钥
      collection_balance?: number //代收余额
      payment_balance?: number //代付余额
      status?: number //商户状态 {radio} (0:关闭, 1:启用)
      auto_settle?: number //自动结算 {radio} (0:关闭, 1:启用)
      receive_group_notice?: number //接收群通知 {radio} (0:关闭, 1:启用)
      settle_notice?: number //结算通知 {radio} (0:关闭, 1:启用)
      rate_change_notice?: number //费率修改通知 {radio} (0:关闭, 1:启用)
      remark?: string //备注
      tg_group_id?: number //群组ID
      telegram_name?: string //群发@飞机号
    }

    /** 商户组映射数据查询参数 */
    interface MerchantGroupParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
    }

    /** 商户组映射数据 */
    interface MerchantGroupInfo {
      id: number
      name: string
    }

    /** 商户组映射数据表 */
    interface MerchantGroupInfoList {
      total: number
      pageData: MerchantGroupInfo[]
    }

    /** 新增商户参数 */
    interface AddMerchantParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
      class?: number //商户组
      agent?: number //代理
      name: string //商户名称
    }

    /** 商户总预付调额参数 */
    interface MerchantChangeAdvanceParams {
      merchant_id: number //商户ID
      amount: number //变更的金额，增加是正数，减少是负数
      remark?: string //备注
    }

    /** 商户总预付调额参数返回结果 */
    interface MerchantChangeAdvanceInfo {
      id: number
      amount: number //变更后的金额
    }

    /** 商户产品绑定配置查询参数 */
    interface ProductBindingParams {
      type: number //商户类型 {系统菜单} (1:代收, 2:代付)
      merchant_id: number //商户ID
    }

    /** 商户产品信息*/
    interface ProductInfo {
      id: number //产品ID
      name: string //产品名称
      code: number //产品编码
      status: number //状态
      default_rate: number //默认费率
      binding: number //是否绑定
      merchant_rate: number //商户费率
      agent_rate: number //代理利润
    }

    /** 商户通道绑定配置查询参数 */
    interface ChannelBindingParams {
      type: number //商户类型 {系统菜单} (1:代收, 2:代付)
      merchant_id: number //商户ID
    }

    /** 商户通道绑定数据 */
    interface ChannelBindingInfoStatus {
      id: number
      name: string
      product: number
      channel_rate: number
      agent_rate: number
      status: number
      weight: number
      binding: number
    }

    /** 商户通道绑定配置数据 */
    interface ChannelBindingInfo {
      id: number
      name: string
      code: number
      merchant_rate: number
      agent_rate: number
      list: ChannelBindingInfoStatus[]
    }

    /** 商户余额调整参数 */
    interface MerchantBalanceChangeParams {
      merchant_id: number
      amount: string
      remark: number
    }
  }

  /** 代理数据类型 */
  namespace Agent {
    /** 代理映射数据查询参数 */
    interface AgentMapParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
    }

    /** 代理映射数据 */
    interface AgentMapInfo {
      id: number
      name: string
    }

    /** 代理映射数据表 */
    interface AgentMapInfoList {
      total: number
      pageData: AgentMapInfo[]
    }
  }
}
