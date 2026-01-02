import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import CadastroView from "../views/CadastroView.vue";
import DashboardView from "@/views/DashboardView.vue";
import Vendas from "@/components/dashboard/Vendas.vue";
import Estoque from "@/components/dashboard/Estoque.vue";
import FluxoCaixa from "@/components/dashboard/FluxoCaixa.vue";
import { useAuthStore } from "@/stores/authStore";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      path: "/cadastro",
      name: "Cadastro",
      component: CadastroView,
      meta: { requiresAuth: false },
    },
    {
      path: "/dashboard",
      component: DashboardView,
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "Dashboard",
          redirect: "vendas",
        },
        {
          path: "vendas",
          name: "Vendas",
          component: Vendas,
          meta: { requiresAuth: true },
        },
        {
          path: "estoque",
          name: "Estoque",
          component: Estoque,
          meta: { requiresAuth: true },
        },
        {
          path: "fluxo-caixa",
          name: "FluxoCaixa",
          component: FluxoCaixa,
          meta: { requiresAuth: true, requiresOwner: true },
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.checkAuth();

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "login" });
    return;
  }

  if (isAuthenticated && (to.name === "login" || to.name === "Cadastro")) {
    next({ name: "Vendas" });
    return;
  }

  next();
});

export default router;
