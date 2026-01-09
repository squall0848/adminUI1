import { AppRouteRecord } from '@/types/router'
// import { dashboardRoutes } from './dashboard'
// import { systemRoutes } from './system'
// import { resultRoutes } from './result'
// import { exceptionRoutes } from './exception'
import { merchantManagementRoutes } from './merchantManagement/merchantManagement'
import { channelManagementRoutes } from './channelManagement/channelManagement'
import { productManagementRoutes } from './productManagement/productManagement'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  // dashboardRoutes,
  // systemRoutes,
  // resultRoutes,
  // exceptionRoutes,
  merchantManagementRoutes,
  channelManagementRoutes,
  productManagementRoutes
]
