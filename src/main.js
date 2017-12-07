// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store.js'
import * as chevrotain from 'chevrotain'

const getTokenConstructor = chevrotain.getTokenConstructor

Vue.config.productionTip = false

Vue.filter('tokenName', function (token) {
  return getTokenConstructor(token).tokenName
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
