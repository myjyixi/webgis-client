import Vue from 'vue'
import VueRouter from 'vue-router'
import store from 'src/vuex/store'
import utils from 'src/misc/utils'
import login from 'src/views/login/login.router.js'
import homepage from 'src/views/homepage/homepage.router.js'
import eventDetail from 'src/views/homepage/eventDetail/eventDetail.router.js'
import eventManager from 'src/views/eventManager/eventManager.router.js'

Vue.use(VueRouter)

// 路由汇总
const Router = {
  routes: [
    {
      path: '/',
      redirect: '/homepage'
    },
    login,
    homepage,
    eventDetail,
    eventManager
  ]
}

const router = new VueRouter({
  mode: 'history',
  routes: Router.routes
})

// 验证用户是否登录
router.beforeEach((to, from, next) => {
  if (to.path === '/login') { // 用户访问登录页面
    next()
  } else { // 用户访问其他页面
    var token = to.query.token
    if (token) {
      // 获取用户信息
      store.dispatch('getUserData', token).then(user => {
        // 将token存入本地
        utils.setLocalStore(user.user_id, token)
        // 跳转到主页
        next({
          path: 'homepage',
          query: {
            // 在url上追加用户id，用于多用户登录身份识别
            tokenKey: user.user_id
          }
        })
      })
    } else {
      // 获取上一个url，在url上追加用户id，用于多用户登录身份识别
      var from_tokenKey = from.query.tokenKey
      var to_tokenKey = to.query.tokenKey
      // 刷新或路由跳转
      if (to_tokenKey) {
        next()
        return
      }
      // 刷新
      if (!from_tokenKey) {
        next()
        return
      }
      // url上有用户id，则根据id获取对应用户token
      var tokenObj = JSON.parse(window.localStorage.getItem(from_tokenKey) || '[]')
      // URl上的参数
      var params = to.query
      if (tokenObj.data && tokenObj.data.length) { // 存在token
        // 将用户id追加到url上
        params['tokenKey'] = from_tokenKey
        // 继续跳转
        next({
          path: to.path,
          query: params
        })
      } else {
        next({ path: '/login' })
      }
    }
  }
})

export default router
