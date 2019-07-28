import router from './router'
import store from './store' 
import { Message } from 'element-ui'
import NProgress from 'nprogress' // 进度条
import 'nprogress/nprogress.css' // 进度条样式
import { getToken } from '@/utils/auth' //从 cookie中获取token
import getPageTitle from '@/utils/get-page-title'//获取页面标题

NProgress.configure({ showSpinner: false }) // 进度配置
const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist,无重定向的白名单

router.beforeEach(async(to, from, next) => {
  // 启动机内条
  NProgress.start()

  // 设置页面标题
  document.title = getPageTitle(to.meta.title)

  // 确定用户是否已登录
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      //如果已登录，则重定向到主页
      next({ path: '/' })
      NProgress.done()
    } else {

      //确定用户是否通过getInfo获得了他的权限角色
      const hasRoles = store.getters.roles && store.getters.roles.length > 0

      if (hasRoles) {
        next()
      } else {
        try {
          // get user info
          //注意:角色必须是一个对象数组!例如:['admin']或['developer'，'editor']
          const { roles } = await store.dispatch('user/getInfo')

          // //根据角色生成可访问路由
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

          //动态添加可访问路由
          router.addRoutes(accessRoutes)

         // hack方法，以确保addRoutes是完整的 
          // set the replace: true,无浏览记录
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // 存在于白名单中直接进入
      next()
    } else {
      //其他没有访问权限的页面被重定向到登录页面。
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
