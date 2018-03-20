import Vue from 'vue'
import VueRouter from 'vue-router'

// 引入组件
import sort from '../components/sort/sort'
import parallelBD from '../components/parallel/parallelBD'
import pie from '../components/pie/pie'
import scatter from '../components/scatter/scatter'
import treemap from '../components/treemap/treemap'
import multipleMap from '../components/multipleMap/multipleMap'
import dashboard from '../components/dashboard/dashboard'

// 使用vueRouter
Vue.use(VueRouter)

export default new VueRouter({
  routes: [{
    path: '/sort',
    component: sort
  }, {
    path: '/parallelBD',
    component: parallelBD
  }, {
    path: '/pie',
    component: pie
  }, {
    path: '/scatter',
    component: scatter
  }, {
    path: '/treemap',
    component: treemap
  }, {
    path: '/multipleMap',
    component: multipleMap
  }, {
    path: '/dashboard',
    component: dashboard
  }, { // 重定向
    path: '/',
    redirect: '/dashboard',
  }],
  linkActiveClass: 'active'
})
