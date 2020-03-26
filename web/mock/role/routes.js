// Just a mock data

export const constantRoutes = [
  {
    path: '/redirect',
    component: 'layout/Layout',
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: 'views/redirect/index'
      }
    ]
  },
  {
    path: '/login',
    component: 'views/login/index',
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: 'views/login/authredirect',
    hidden: true
  },
  {
    path: '/404',
    component: 'views/errorPage/404',
    hidden: true
  },
  {
    path: '/401',
    component: 'views/errorPage/401',
    hidden: true
  },
  {
    path: '',
    component: 'layout/Layout',
    redirect: 'project',
    children: [
      {
        path: 'project',
        component: 'views/project/index',
        name: 'Project',
        meta: { title: 'project', icon: 'edit', noCache: true, affix: true }
      }
    ]
  }
]

export const asyncRoutes = []
