import "./assets/main.css";
import router from "./router";
import * as lucide from "lucide-vue-next";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const app = createApp(App);

Object.entries(lucide).forEach(([name, component]) => {
  app.component(name, component);
});

app.use(router);
app.use(createPinia());
app.mount("#app");
