<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import {
  ShoppingCart,
  Package,
  BarChart2,
  LogOut,
  Menu,
  FileText,
  Users,
  Settings,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const authStore = useAuthStore();

const sidebarOpen = ref(false);
const mostrarModalLogout = ref(false);

const pontos = ref([]);
const dropdownPontos = ref(false);

async function carregarPontos() {
  if (authStore.user?.empresa?.plano === "top") {
    try {
      const data = await api.get("/pontos");
      pontos.value = data.data;
    } catch (error) {
      console.error("Erro ao carregar pontos:", error);
    }
  }
}

function selecionarPonto(ponto) {
  authStore.trocarPonto(ponto.id);
  dropDownPontos.value = false;
}

const mostrarModalSenha = ref(false);
const senhaModal = ref("");
const erroModal = ref("");
const tentativasRestantes = ref(3);
const destinoModal = ref("");

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
    {
      name: "Vendedores",
      route: "/dashboard/vendedores",
      icon: Users,
      onlyDono: true,
    },
  ];
  return base;
});

function goTo(route) {
  if ((route === "/dashboard/fluxo-caixa" || route === "/dashboard/relatorios") && !authStore.isDono) {
    mostrarModalSenha.value = true;
    senhaModal.value = "";
    erroModal.value = "";
    tentativasRestantes.value = 3;
    destinoModal.value = route;
  } else {
    router.push(route);
  }
}

async function validarSenhaModal() {
  try {
    const data = await api.post("/auth/validar-pin", {
      pin: senhaModal.value,
    });
  
    if (data.success) {
      console.log("destino:", destinoModal.value);
      authStore.validarPin();
      mostrarModalSenha.value = false;
      router.push(destinoModal.value);
      tentativasRestantes.value = 3;
    } else {
      tentativasRestantes.value--;
      senhaModal.value = "";

      if (tentativasRestantes.value > 0) {
        erroModal.value = `PIN incorreto. ${tentativasRestantes.value} tentativa(s) restante(s).`;
        senhaModal.value = "";
      } else {
        erroModal.value = "Tentativas esgotadas. Voltando para Vendas...";
        setTimeout(() => {
          mostrarModalSenha.value = false;
          router.push("/dashboard/vendas");
        }, 2000);
      }
    }
  } catch (error) {
    console.error("Erro ao validar PIN:", error);
    erroModal.value = "Erro ao validar PIN. Tente novamente.";
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
  mostrarModalLogout.value = true;
}

function confirmarLogout() {
  authStore.logout();
  router.push("/login");
}

function cancelarLogout() {
  mostrarModalLogout.value = false;
}

onMounted(() => {
  carregarPontos();
})
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

      <div v-if="sidebarOpen" class="px-4 py-3 border-b border-purple-600">
        <p class="text-sm font-medium truncate">
          Olá, {{ authStore.user?.empresa?.nome }}!
        </p>
        <p class="text-xs text-purple-300 capitalize">
          {{ authStore.user?.role === 'dono' ? 'Proprietário' : authStore.user?.nome }}
        </p>
      </div>

      <div v-if="pontos.length > 1 && sidebarOpen" class="px-4 py-2 border-b border-purple-600">
        <div @click="dropdownPontos = !dropdownPontos" class="flex items-center justify-between cursor-pointer text-sm">
          <span class="truncate">{{ pontos.find(p => p.id === authStore.pontoAtivo)?.nome || 'Selecionar ponto' }}</span>
          <ChevronLeft :class="dropdownPontos ? 'rotate-90' : '-rotate-90'" class="transition-transform" :size="16" />
        </div>
        <div v-if="dropdownPontos" class="mt-2 space-y-1">
          <div
            v-for="ponto in pontos"
            :key="ponto.id"
            @click="selecionarPonto(ponto)"
            :class="ponto.id === authStore.pontoAtivo ? 'bg-purple-800' : 'hover:bg-purple-600'"
            class="px-2 py-1 rounded cursor-pointer text-sm truncate"
          >
            {{ ponto.nome }}
          </div>
        </div>
      </div>
      
      <nav class="flex-1 p-2 space-y-2">
        <template v-for="item in menuItems" :key="item.name">
          <div
            v-if="!item.onlyDono || authStore.user?.role === 'dono'"
            @click="goTo(item.route)"
            class="flex items-center space-x-3 p-2 rounded cursor-pointer hover:bg-purple-600"
          >
            <component :is="item.icon" size="20" />
            <span v-if="sidebarOpen">{{ item.name }}</span>
          </div>
        </template>
      </nav>

      <div class="p-2 border-t border-purple-600">
        <div
          v-if="authStore.user?.role === 'dono'"
          @click="router.push('/dashboard/configuracoes')"
          class="flex items-center space-x-3 w-full p-2 rounded hover:bg-purple-600 cursor-pointer mb-1"
        >
          <Settings size="20" />
          <span v-if="sidebarOpen">Configurações</span>
        </div>
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
          Digite o PIN de segurança do dono para acessar o {{ destinoModal === '/dashboard/fluxo-caixa' ? 'Fluxo de Caixa' : 'Relatórios' }}:
        </p>

        <input
          v-model="senhaModal"
          type="password"
          placeholder="Digite o PIN:"
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

    <div
      v-if="mostrarModalLogout"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Sair</h2>
        <p class="text-gray-600 mb-6">Deseja realmente sair do sistema?</p>
        <div class="flex space-x-3">
          <button
            @click="cancelarLogout"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            @click="confirmarLogout"
            class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Sair
          </button>
        </div>
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
