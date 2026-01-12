import { AppRouteRecord } from '@/types/router'

export const channelManagementRoutes: AppRouteRecord = {
  name: 'ChannelManagement',
  path: '/channelManagement',
  component: '/index/index',
  meta: {
    title: 'menus.channelManagement.title',
    icon: 'ri:archive-drawer-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'payInChannel',
      name: 'PayInChannel',
      component: '/channelManagement/payInChannel',
      meta: {
        title: 'menus.channelManagement.payInChannel',
        keepAlive: false,
        fixedTab: true
      }
    },
    {
      path: 'payOutChannel',
      name: 'PayOutChannel',
      component: '/channelManagement/payOutChannel',
      meta: {
        title: 'menus.channelManagement.payOutChanne',
        keepAlive: false,
        fixedTab: true
      }
    },
    {
      path: 'payInChannelMerchant',
      name: 'PayInChannelMerchant',
      component: '/channelManagement/payInChannelMerchant',
      meta: {
        title: 'menus.channelManagement.payInChannelMerchant',
        keepAlive: false,
        fixedTab: true
      }
    },
    {
      path: 'payOutChannelMerchant',
      name: 'PayOutChannelMerchant',
      component: '/channelManagement/payOutChannelMerchant',
      meta: {
        title: 'menus.channelManagement.payOutChanneMerchant',
        keepAlive: false,
        fixedTab: true
      }
    }
  ]
}
