import { AppRouteRecord } from '@/types/router'

export const merchantManagementRoutes: AppRouteRecord = {
  name: 'MerchantManagement',
  path: '/merchantManagement',
  component: '/index/index',
  meta: {
    title: 'menus.merchantManagement.title',
    icon: 'ri:account-box-2-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    // {
    //   path: 'console',
    //   name: 'Console',
    //   component: '/dashboard/console',
    //   meta: {
    //     title: 'menus.merchantManagement.console',
    //     keepAlive: false,
    //     fixedTab: true
    //   }
    // }
  ]
}
