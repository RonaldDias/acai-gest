<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { ChevronLeft } from "lucide-vue-next";
import { api } from "@/services/api";

const authStore = useAuthStore();
const toast = useToastStore();

const tela = ref(null);

const novoPinAtual = ref("");
const novoPin = ref("");
const novoPinConfirm = ref("");

async function salvarPin() {
  if (novoPinAtual.value !== authStore.user?.pin) {
    toast.warning("PIN atual incorreto");
    return;
  }
  if (novoPin.value.length < 4 || novoPin.value.length > 6) {
    toast.warning("PIN deve ter entre 4 e 6 dígitos");
    return;
  }
  if (novoPin.value !== novoPinConfirm.value) {
    toast.warning("Os PINs não coincidem");
    return;
  }

  await api.put("/usuarios/pin", { pin: novoPin.value });
  authStore.user.pin = novoPin.value;
  toast.success("PIN atualizado com sucesso!");
  novoPinAtual.value = "";
  novoPin.value = "";
  novoPinConfirm.value = "";
}
</script>

<template>
  <div class="max-w-lg mx-auto p-6">
    <div v-if="!tela">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Configurações</h1>
      <div class="space-y-3">
        <div
          @click="tela = 'conta'"
          class="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50 transition flex items-center justify-between"
        >
          <span class="font-medium text-gray-800">Minha Conta</span>
          <ChevronLeft class="rotate-180 text-gray-400" :size="20" />
        </div>
        <div
          @click="tela = 'assinatura'"
          class="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50 transition flex items-center justify-between"
        >
          <span class="font-medium text-gray-800">Assinatura</span>
          <ChevronLeft class="rotate-180 text-gray-400" :size="20" />
        </div>
      </div>
    </div>

    <div v-else-if="tela === 'conta'">
      <button
        @click="tela = null"
        class="flex items-center text-purple-600 mb-6 hover:underline"
      >
        <ChevronLeft :size="20" /> Voltar
      </button>
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Minha Conta</h1>

      <div class="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <p class="text-sm text-gray-500">Nome</p>
          <p class="font-medium text-gray-800">{{ authStore.user?.nome }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">E-mail</p>
          <p class="font-medium text-gray-800">{{ authStore.user?.email }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">PIN atual</p>
          <p class="font-medium text-gray-800">
            {{ authStore.user?.pin ?? "Não definido" }}
          </p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mt-4 space-y-4">
        <h2 class="font-semibold text-gray-800">Alterar PIN</h2>
        <input
          v-model="novoPinAtual"
          type="password"
          placeholder="PIN atual"
          maxlength="6"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
        />
        <input
          v-model="novoPin"
          type="password"
          placeholder="Novo PIN"
          maxlength="6"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
        />
        <input
          v-model="novoPinConfirm"
          type="password"
          placeholder="Confirmar novo PIN"
          maxlength="6"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
        />
        <button
          @click="salvarPin"
          class="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
        >
          Salvar PIN
        </button>
      </div>
    </div>

    <div v-else-if="tela === 'assinatura'">
      <button
        @click="tela = null"
        class="flex items-center text-purple-600 mb-6 hover:underline"
      >
        <ChevronLeft :size="20" /> Voltar
      </button>
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Assinatura</h1>
      <div class="bg-white rounded-lg shadow p-6">
        <p class="text-sm text-gray-500">Plano atual</p>
        <p class="font-medium text-gray-800 capitalize">
          {{ authStore.user?.empresa?.plano ?? "—" }}
        </p>
      </div>
    </div>
  </div>
</template>
