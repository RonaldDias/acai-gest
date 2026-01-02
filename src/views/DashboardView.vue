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

const mostrarModalSenha = ref(false);
const senhaModal = ref("");
const erroModal = ref("");
const tentativasRestantes = ref(3);

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
  if (route === "/dashboard/fluxo-caixa" && !authStore.isDono) {
    mostrarModalSenha.value = true;
    senhaModal.value = "";
    erroModal.value = "";
    tentativasRestantes.value = 3;
  } else {
    router.push(route);
  }
}

function validarSenhaModal() {
  const PIN_CORRETO = "1234"; // TODO: Backend gera e envia por email
  if (senhaModal.value === PIN_CORRETO) {
    mostrarModalSenha.value = false;
    router.push("/dashboard/fluxo-caixa");
    tentativasRestantes.value = 3;
  } else {
    tentativasRestantes.value--;

    if (tentativasRestantes.value > 0) {
      erroModal.value = `PIN incorreto. ${tentativasRestantes.value} tentativa(s) restante(s).`;
      senhaModal.value = "";
    } else {
      erroModal.value = "Tentativas esgotadas. VOltando para Vendas...";
      setTimeout(() => {
        mostrarModalSenha.value = false;
        router.push("/dashboard/vendas");
      }, 2000);
    }
  }
}

function cancelarModal() {
  mostrarModalSenha.value = false;
  senhaModal.value = "";
  erroModal.value = "";
  tentativasRestantes.value = 3;
  router.push("/dashboard/vendas");
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

    <div class="flex-1 p-6 overflow-y-auto">
      <router-view />
    </div>

    <div
      v-if="mostrarModalSenha"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
        <p class="text-gray-600 mb-4">
          Digite o PIN de segurança do dono para acessar o Fluxo de Caixa:
        </p>

        <input
          v-model="senhaModal"
          type="password"
          placeholder="Digite o PIN (1234)"
          maxlength="6"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
          @keyup.enter="validarSenhaModal"
        />

        <p v-if="erroModal" class="text-red-500 text-sm mb-4">
          {{ erroModal }}
        </p>

        <div class="flex space-x-3">
          <button
            @click="cancelarModal"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            :disabled="tentativasRestantes === 0"
          >
            Cancelar
          </button>
          <button
            @click="validarSenhaModal"
            class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            :disabled="tentativasRestantes === 0"
          >
            Confirmar
          </button>
        </div>

        <p class="text-xs text-gray-500 mt-4 text-center">
          Tentativas restantes: {{ tentativasRestantes }}/3
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #a855f7;
  border-radius: 10px;
}
</style>
