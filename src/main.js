import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // 初始化css

import Element from 'element-ui'
import './styles/element-variables.scss'

import '@/styles/index.scss' // 全局scss

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // 权限控制
import './utils/error-log' // error log

import * as filters from './filters' // 全局过滤器

/**
 * 如果您不想使用mock-server
 * 希望使用MockJs作为模拟api
 * 可以执行: mockXHR()
 *
 * 目前MockJs将在生产环境中使用，
 * 请在上线前删除!!!
 */
import { mockXHR } from '../mock'
if (process.env.NODE_ENV === 'production') {
  mockXHR()
}

Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // 设置element-ui 默认大小
})

// 声明全局公用过滤器
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
