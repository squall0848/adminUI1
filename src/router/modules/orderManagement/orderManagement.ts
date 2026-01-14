import { AppRouteRecord } from '@/types/router'

export const orderManagementRoutes: AppRouteRecord = {
  name: 'OrderManagement',
  path: '/orderManagement',
  component: '/index/index',
  meta: {
    title: 'menus.orderManagement.title',
    icon: 'ri:file-list-3-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'payInOrder',
      name: 'PayInOrder',
      component: '/orderManagement/payInOrder',
      meta: {
        title: 'menus.orderManagement.payInOrder',
        keepAlive: false,
        fixedTab: true
      }
    },
    {
      path: 'payOutOrder',
      name: 'PayOutOrder',
      component: '/orderManagement/payOutOrder',
      meta: {
        title: 'menus.orderManagement.payOutOrder',
        keepAlive: false,
        fixedTab: true
      }
    }
  ]
}
