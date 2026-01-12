import { AppRouteRecord } from '@/types/router'

export const agentManagementRoutes: AppRouteRecord = {
  name: 'AgentManagement',
  path: '/agentManagement',
  component: '/index/index',
  meta: {
    title: 'menus.agentManagement.title',
    icon: 'ri:contacts-book-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'payInAgent',
      name: 'PayInAgent',
      component: '/agentManagement/payInAgent',
      meta: {
        title: 'menus.agentManagement.payInAgent',
        keepAlive: false,
        fixedTab: true
      }
    }
  ]
}
