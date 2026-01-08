import { AppRouteRecord } from '@/types/router'

export const productManagementRoutes: AppRouteRecord = {
  name: 'ProductManagement',
  path: '/productManagement',
  component: '/index/index',
  meta: {
    title: 'menus.productManagement.title',
    icon: 'ri:article-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'payInProduct',
      name: 'PayInProduct',
      component: '/productManagement/payInProduct',
      meta: {
        title: 'menus.productManagement.payInProduct',
        keepAlive: false,
        fixedTab: true
      }
    }
  ]
}
