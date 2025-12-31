<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  ShoppingCart,
  Package,
  BarChart2,
  LogOut,
  Menu,
  User,
  FileText,
  Users,
} from "lucide-vue-next";
import { useCadastroStore } from "../stores/cadastroStore";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const cadastro = useCadastroStore();
const authStore = useAuthStore();

const sidebarOpen = ref(false);

// Simulação de tipo de usuário: 'vendedor' ou 'dono'
// No futuro, isso deve vir do backend ou da store
const userRole = computed(() => cadastro.dados.tipoUsuario || "vendedor");

const mostrarModalSenha = ref(false);
const senhaModal = ref("");
const erroModal = ref("");

const menuItems = computed(() => {
  const base = [
    { name: "Vendas", icon: ShoppingCart, route: "/dashboard/vendas" },
    { name: "Estoque", icon: Package, route: "/dashboard/estoque" },
    {
      name: "Fluxo de Caixa",
      icon: BarChart2,
      route: "/dashboard/fluxo-caixa",
    },
    { name: "Relatórios", icon: FileText, route: "/dashboard/relatorios" },
  ];

  if (authStore.isDono) {
    base.push({
      name: "Vendedores",
      icon: Users,
      route: "/dashboard/vendedores",
    });
  }
  return base;
});

function goTo(route) {
  if (route === "/dashboard/fluxo-caixa") {
    mostrarModalSenha.value = true;
    senhaModal.value = "";
    erroModal.value = "";
  } else {
    router.push(route);
  }
}

function validarSenhaModal() {
  const senhaCorreta = "123456";
  if (senhaModal.value === senhaCorreta) {
    mostrarModalSenha.value = false;
    router.push("/dashboard/fluxo-caixa");
  } else {
    erroModal.value = "Senha incorreta. Tente novamente.";
  }
}

function logout() {
  authStore.logout();
  router.push("/");
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <div
      :class="[
        'bg-purple-700 text-white flex flex-col transition-all duration-300',
        sidebarOpen ? 'w-56' : 'w-16',
      ]"
    >
      <div
        class="flex items-center justify-between p-4 border-b border-purple-600"
      >
        <span v-if="sidebarOpen" class="font-bold text-lg">Açaí Gest</span>
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="p-1 hover:bg-purple-600 rounded"
        >
          <Menu size="20" />
        </button>
      </div>

      <nav class="flex-1 p-2 space-y-2">
        <div
          v-for="item in menuItems"
          :key="item.name"
          @click="goTo(item.route)"
          class="flex items-center space-x-3 p-2 rounded cursor-pointer hover:bg-purple-600"
        >
          <component :is="item.icon" size="20" />
          <span v-if="sidebarOpen">{{ item.name }}</span>
        </div>
      </nav>

      <!-- Sair -->
      <div class="p-2 border-t border-purple-600">
        <button
          @click="logout"
          class="flex items-center space-x-3 w-full p-2 rounded hover:bg-purple-600"
        >
          <LogOut size="20" />
          <span v-if="sidebarOpen">Sair</span>
        </button>
      </div>
    </div>

    <!-- Área Principal -->
    <div class="flex-1 p-6 overflow-y-auto">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar estilizada */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #a855f7;
  border-radius: 10px;
}
</style>
