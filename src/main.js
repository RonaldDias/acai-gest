import "./assets/main.css";
import router from "./router";
import * as lucide from "lucide-vue-next";

import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPersistedState from "pinia-plugin-persistedstate";
import App from "./App.vue";

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPersistedState);

Object.entries(lucide).forEach(([name, component]) => {
  app.component(name, component);
});

app.use(pinia);
app.use(router);

app.mount("#app");
