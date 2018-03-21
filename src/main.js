// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

// 全局引用ElementUI组件
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-default/index.css'
// Vue.use(ElementUI)


// 引入路由
import router from "./router"

// 引入数据
// import data from '../static/data/trouble-data.js'

// 只引入日历组件
import 'element-ui/lib/theme-chalk/index.css'
import {DatePicker} from 'element-ui'
Vue.component(DatePicker.name, DatePicker)

// Vue.use(VueRouter)
Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    color: ['#9CC2B0', '#C98769','#6D9EA8', '#9CC2B0', '#C98769'],
    arr: [{name: '中国银行'},{name: '建设银行'},{name: '邮储银行'}],
    areaArr: [{name: '石景山区'},{name: '西城区'},{name: '东城区'},{name: '朝阳区'},{name: '通州区'}],
  }
})

// 设置为 false 以阻止 vue 在启动时生成生产提示
// Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router, // 注入到根实例
  store,
  components: { App },
  template: '<App/>'
})

console.log('env', process.env.NODE_ENV)
