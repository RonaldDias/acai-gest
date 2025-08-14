import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import CadastroView from "../views/CadastroView.vue";
import DashboardView from "@/views/DashboardView.vue";
import Vendas from "@/components/dashboard/Vendas.vue";
import Estoque from "@/components/dashboard/Estoque.vue";
import FluxoCaixa from "@/components/dashboard/FluxoCaixa.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: LoginView,
    },
    {
      path: "/cadastro",
      name: "Cadastro",
      component: CadastroView,
    },
    {
      path: "/dashboard",
      component: DashboardView,
      children: [
        {
          path: "",
          name: "Dashboard",
          redirect: "vendas",
        },
        {
          path: "vendas",
          component: Vendas,
        },
        {
          path: "estoque",
          component: Estoque,
        },
        {
          path: "fluxo-caixa",
          component: FluxoCaixa,
        },
      ],
    },
  ],
});

export default router;
