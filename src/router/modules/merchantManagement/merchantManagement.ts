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
    {
      path: 'payInMerchant',
      name: 'PayInMerchant',
      component: '/merchantManagement/payInMerchant',
      meta: {
        title: 'menus.merchantManagement.payInMerchant',
        keepAlive: false,
        fixedTab: true
      }
    },
    {
      path: 'payOutMerchant',
      name: 'PayOutMerchant',
      component: '/merchantManagement/payOutMerchant',
      meta: {
        title: 'menus.merchantManagement.payOutMerchant',
        keepAlive: false,
        fixedTab: true
      }
    },
    {
      path: 'payInMerchantGroup',
      name: 'PayInMerchantGroup',
      component: '/merchantManagement/payInMerchantGroup',
      meta: {
        title: 'menus.merchantManagement.payInMerchantGroup',
        keepAlive: false,
        fixedTab: true
      }
    }
    // {
    //   path: 'payOutMerchantGroup',
    //   name: 'PayOutMerchantGroup',
    //   component: '/merchantManagement/payOutMerchantGroup',
    //   meta: {
    //     title: 'menus.merchantManagement.payOutMerchantGroup',
    //     keepAlive: false,
    //     fixedTab: true
    //   }
    // }
  ]
}
