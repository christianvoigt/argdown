// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import router from "./router";
import store from "./store.js";

Vue.config.productionTip = false;

Vue.filter("tokenName", function(token) {
  return token.tokenType.tokenName;
});

/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  store,
  render: h => h(App),
  components: { App }
});
