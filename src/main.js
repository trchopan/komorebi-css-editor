import Vue from "vue";
import App from "./App.vue";
import VuePrismEditor from "vue-prism-editor";
import "prismjs";
import "prismjs/themes/prism.css";

Vue.config.productionTip = false;
Vue.component("prism-editor", VuePrismEditor);

new Vue({
  render: h => h(App),
}).$mount("#app");
