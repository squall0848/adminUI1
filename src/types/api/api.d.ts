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

    /** 修改密码参数 */
    interface ModifyPasswordParams {
      old_password: string
      new_password: string
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
      type?: number //类型 {系统菜单} (1:代收, 2:代付)
      pageNo: number //页数
      pageSize: number //每页数量
      sort?: string //排序字段名
      order: number //升序和降序 (0:asc, 1:desc)
      status?: number //商户状态(0:关闭, 1:启用)
      class?: number //商户组ID
      agent?: number //代理ID
      remark?: string //备注
      search?: string //查询关键词 商户名称/商户号
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
      total_payout_balance: number
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
    interface MerchantGroupInfoParams {
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
      password: string //密码
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
      amount: number
      remark?: string
    }

    /** 商户余额调整返回 */
    interface MerchantBalanceChangeInfo {
      id: number
    }

    /** 重置商户密钥参数 */
    interface ResetMerchantSecretKeyParams {
      merchant_id: number
    }

    /** 单条商户产品绑定更新数据 */
    interface MerchantProductBindingUpdate {
      product_id: number
      merchant_rate: number
      agent_rate: number
      binding: number
    }

    /** 单条商户通道绑定更新数据 */
    interface MerchantChannelBindingUpdate {
      channel_id: number
      product_id: number
      weight: number
      binding: number
    }

    /** 商户总预付明细请求参数 */
    interface MerchantTotalPrepayParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
      merchant_id: number //商户ID
      time_type: number //时间(1:今天, 2:昨天, 3:前天, 4:近三天, 5:近七天, 6:本周, 7:本月)
    }

    /** 商户总预付明细数据 */
    interface MerchantTotalPrepayData {
      id: number
      merchant_id: number
      balance: number //变更前余额
      change_amount: number //变更金额
      type: number //(1:商户总预付减少(清算), 2:商户总预付)
      remark: string
      create_time: string
    }

    /** 商户一键处理通道请求参数 */
    interface MerchantDealChannelParams {
      merchant_id: number //商户ID
      save: number //保存状态(0:全部解绑, 1:全部绑定)
    }

    /** 商户下单测试请求参数 */
    interface MerchantTestPayParams {
      merchant_id: number //商户ID
      amount: number //金额
      product_id: number //产品ID
    }

    /** 商户下单测试通道数据 */
    interface MerchantTestPayChannel {
      id: number
      channel_name: string
      channel_code: string
      biz_type: string
      fee_type: number
      fee_rate: number
      single_fee: number
      fee_config: string
      agent_rate: number
      amount_limit_low: number
      amount_limit_high: number
      amount_limit_text: string
      status: number
      pay_method: string
      currency: string
      currency_mark: string
      show_currency: string
      product_name: string
      product_code: string
      provider_name: string
    }

    /** 商户下单测试返回数据 */
    interface MerchantTestPayInfo {
      test_success: boolean //测试是否成功
      error_type_code: string //错误类型代码
      error_type_msg: string //错误信息
      request_url: string //请求URL
      request_headers: string //请求头
      request_body: string //请求体
      response_body: string //响应体
      pay_url: string //支付地址
      remark: string //备注
      trade_no: string //商户订单号
      channel: MerchantTestPayChannel //通道信息
    }

    /** 商户组列表请求参数 */
    interface MerchantGroupParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
      pageNo: number //页数
      pageSize: number //每页数量
      search?: string //查询关键词 商户组名称
    }

    /** 商户组数据 */
    interface MerchantGroup {
      id: number
      type: number //类型 {系统菜单} (1:代收, 2:代付)
      name: string
      remark: string
      update_time: string
      create_time: string
      merchant_count: number
    }

    /** 商户组数据 */
    interface MerchantGroupList {
      total: number
      pageData: MerchantGroup[]
    }

    /** 新增商户组参数 */
    interface AddMerchantGroupParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
      name: string //商户名称
      remark?: string //描述
    }

    /** 更新商户组参数 */
    interface UpdateMerchantGroupParams {
      id: number //商户组ID
      name?: string //商户名称
      remark?: string //描述
    }

    /** 商户对接信息请求参数 */
    interface MerchantDockingParams {
      merchant_id: number
    }

    /** 商户对接信息中的登录信息 */
    interface MerchantDockingLoginInfo {
      merchant_name: string
      login_password: string
      login_url: string
    }

    /** 商户对接信息中的API信息 */
    interface MerchantDockingApiInfo {
      merchant_no: string
      merchant_key: string
      pay_url: string
      query_url: string
      balance_url: string
      api_docs_url: string
      callback_server_ips: string
      pay_test_code: string
    }

    /** 商户对接信息中的登录信息 */
    interface MerchantDockingInfo {
      merchant_id: number
      login_info: MerchantDockingLoginInfo
      api_info: MerchantDockingApiInfo
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

    /** 代理数据查询参数 */
    interface AgentParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
      pageNo: number //页数
      pageSize: number //每页数量
      status?: string //代理状态 (0:禁用, 1:启用) 不提交：显示所有代理
      search?: string //按名称或编码搜索
    }

    /** 代理数据 */
    interface AgentInfo {
      id: number
      type: number
      name: string
      password: string
      code: number
      balance: number
      status: number
      update_time: string
      create_time: string
    }

    /** 代理数据列表 */
    interface AgentInfoList {
      total: number
      pageData: AgentInfo[]
    }

    /** 更新代理参数 */
    interface UpdateAgentInfo {
      id: number //更新的代理ID
      name?: string //代理名称
      status?: number //代理状态 (0:禁用, 1:启用)
      code?: number //编码
    }

    /** 新增代理参数 */
    interface AddAgentParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
      name: string //代理名称
    }
  }

  /** 产品数据类型 */
  namespace Product {
    /** 产品映射数据查询参数 */
    interface ProductMapParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
    }

    /** 产品映射数据 */
    interface ProductMapInfo {
      id: number
      name: string
    }

    /** 产品映射数据表 */
    interface ProductMapInfoList {
      total: number
      pageData: ProductMapInfo[]
    }

    /** 产品数据查询参数 */
    interface ProductParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
      pageNo: number //页数
      pageSize: number //每页数量
      status?: number //商户状态(0:关闭, 1:启用)  不提交：显示所有产品
      amount_limit?: number //限额类型 (1:区间金额, 2:固定金额) 不提交：显示所有产品
      search?: string //按名称或编码搜索
    }

    /** 产品数据 */
    interface ProductInfo {
      id: number
      type: number
      name: string //产品名称
      code: number //产品编码
      status: number //产品状态 {radio} (0:关闭, 1:启用)
      amount_limit: number //限额类型 {radio} (1:区间金额, 2:固定金额)
      min_amount: number //单笔最小限额
      max_amount: number //单笔最大限额
      fixed_amount: string //固定金额（固定金额，例如：499|599|699|799）
      merchant_rate: number //默认费率
      order_mode: number //下单模式 {radio} (1:顺序, 2:并发)
      weight_mode: number //权重模式 {radio} (1:默认权重, 2:智能权重)
      channel_index: number //通道索引 (当前使用的通道序号)
      open_time: string //交易时间
      close_time: string //关闭时间
      remark: string //规则备注
      update_time: string
      create_time: string
    }

    /** 产品数据列表 */
    interface ProductInfoList {
      total: number
      pageData: ProductInfo[]
    }

    /** 新增产品数据参数 */
    interface AddProductParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
      name: string //产品名称
      code: number //产品编码
      amount_limit: number //限额类型 {radio} (1:区间金额, 2:固定金额)
      min_amount?: number //单笔最小限额
      max_amount?: number //单笔最大限额
      fixed_amount?: string //固定金额（固定金额，例如：499|599|699|799）
      merchant_rate: number //默认费率
      order_mode: number //下单模式 {radio} (1:顺序, 2:并发)
      weight_mode: number //权重模式 {radio} (1:默认权重, 2:智能权重)
      open_time?: string //交易时间
      close_time?: string //关闭时间
      remark?: string //规则备注
    }

    /** 新增产品数据返回 */
    interface AddProductInfo {
      id: number
    }

    /** 更新产品数据参数 */
    interface UpdateProductParams {
      id: number //产品ID
      name?: string //产品名称
      code?: number //产品编码
      amount_limit?: number //限额类型 {radio} (1:区间金额, 2:固定金额)
      min_amount?: number //单笔最小限额
      max_amount?: number //单笔最大限额
      fixed_amount?: string //固定金额（固定金额，例如：499|599|699|799）
      status?: number //产品状态 {radio} (0:关闭, 1:启用)
      merchant_rate?: number //默认费率
      order_mode?: number //下单模式 {radio} (1:顺序, 2:并发)
      weight_mode?: number //权重模式 {radio} (1:默认权重, 2:智能权重)
      open_time?: string //交易时间
      close_time?: string //关闭时间
      remark?: string //规则备注
    }
  }

  /** 通道数据类型 */
  namespace Channel {
    /** 通道数据查询参数 */
    interface ChannelParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
      pageNo: number //页数
      pageSize: number //每页数量
      sort: string //排序字段名
      order: number //升序和降序 (0:asc, 1:desc)
      status?: number //通道状态(0:关闭, 1:启用)
      class?: number //通道组ID
      search?: string //查询关键词 通道名称或三方编码
      agent?: number //代理ID
      product?: number //产品ID
      pay_interface?: string //接口类型
      amount_limit?: number //限额类型 (1:区间金额, 2:固定金额)
    }

    /** 通道数据 */
    interface ChannelInfo {
      id: number
      type: number ////类型 {系统菜单} (1:代收, 2:代付)
      class: number //通道商
      agent: number //代理
      name: string
      product: number //产品
      channel_rate: number //通道汇率
      agent_rate: number //代理汇率
      status: number
      allow_negative_profit: number //允许负利润
      balance: number //余额
      hour_success_rate: number //每小时成功率(%)
      day_success_rate: number //每天成功率(%)
      weight: number //权重
      amount_limit: number //限额类型 {radio} (1:区间金额, 2:固定金额)
      min_amount: number //单笔最小限额
      max_amount: number //单笔最大限额
      fixed_amount: string //固定金额，多个金额用|分隔
      group_id: number
      pay_interface: string //接口类型
      channel_code: number //三方编码
      channelmerchant_no: number //通道商户号
      channel_key: string //通道密钥
      order_url: string //下单地址
      query_url: string //查询地址
      balance_url: string //余额地址
      allow_ips: string //允许回调IP
      appid_pubkey: string //APPID/公钥
      public_key: string //公钥
      private_key: string //私钥
      update_time: string
      create_time: string
    }

    /** 通道数据列表 */
    interface ChannelInfoList {
      total: number
      pageData: ChannelInfo[]
    }

    /** 添加通道数据参数 */
    interface AddChannelParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
      class?: number //通道商
      agent?: number //代理
      name: string //名称
      channel_code?: number //通道编码（三方编码）
      product: number //产品（主产品）
      channel_rate?: number //通道汇率
      agent_rate?: number //代理汇率
      weight?: number //权重
      amount_limit: number //限额类型 {radio} (1:区间金额, 2:固定金额)
      min_amount?: number //单笔最小限额
      max_amount?: number //单笔最大限额
      fixed_amount?: string //固定金额，多个金额用|分隔
      group_id?: number //群组ID
    }

    /** 更新通道数据参数 */
    interface UpdateChannelParams {
      id: number //通道ID
      class?: number //通道商ID
      agent?: number //代理ID
      name?: string //名称
      product?: number //产品（主产品）
      channel_rate?: number //通道汇率
      agent_rate?: number //代理汇率
      status?: number //通道状态 {radio} (0:关闭, 1:启用)
      allow_negative_profit?: number //允许负利润 {radio} (0:不允许, 1:允许)
      balance?: number //余额
      weight?: number //权重
      amount_limit?: number //限额类型 {radio} (1:区间金额, 2:固定金额)
      min_amount?: number //单笔最小限额
      max_amount?: number //单笔最大限额
      fixed_amount?: string //固定金额，多个金额用|分隔
      group_id?: number //群组ID
      pay_interface?: string //接口类型
      channel_code?: number //三方编码
      channelmerchant_no?: number //通道商户号
      channel_key?: string //通道密钥
      order_url?: string //下单地址
      query_url?: string //查询地址
      balance_url?: string //余额地址
      allow_ips?: string //允许回调IP
    }

    /** 更新通道数据返回 */
    interface UpdateChannelInfo {
      id: number
    }

    /** 通道商映射表查询参数 */
    interface ChannelMerchantParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
    }

    /** 通道商映射表数据 */
    interface ChannelMerchantInfo {
      id: number
      name: string
    }

    /** 通道商映射表列表 */
    interface ChannelMerchantInfoList {
      total: number
      pageData: ChannelMerchantInfo[]
    }

    /** 通道余额调整参数 */
    interface ChannelBalanceChangeParams {
      channel_id: number
      amount: number
      remark?: string
    }

    /**通道余额调整返回 */
    interface ChannelBalanceChangeInfo {
      id: number
    }

    /** 通道商列表查询参数 */
    interface ChannelMerchantListParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
      pageNo: number //页数
      pageSize: number //每页数量
      sort: string //排序字段名
      order: number //升序和降序 (0:asc, 1:desc)
      status: number //状态 {radio} (0:关闭, 1:启用)
      search: string //查询关键词 通道商名称
    }

    /** 通道商数据 */
    interface ChannelMerchant {
      id: number
      type: number
      name: string
      balance: number //余额
      advance: number //预付
      accept_callback: number //接收回调
      status: number //状态
      auto_settle: number //自动结算
      tg_group_id: number //群组ID
      remark: string //备注
      update_time: string
      create_time: string
    }

    /** 通道商数据列表 */
    interface ChannelMerchantList {
      total: number
      pageData: ChannelMerchant[]
    }

    /** 新增通道商参数 */
    interface AddChannelMerchantParams {
      type: number //类型 {系统菜单} (1:代收, 2:代付)
      name: string //通道商名称
    }

    /** 新增通道商返回结果 */
    interface AddChannelMerchantInfo {
      id: number
    }

    /** 更新通道商参数 */
    interface UpdateChannelMerchantParams {
      id: number
      name?: string
      accept_callback?: number
      status?: number
      auto_settle?: number
      tg_group_id?: number
      remark?: string
    }

    /** 新增通道商返回结果 */
    interface UpdateChannelMerchantInfo {
      id: number
    }
  }
}
