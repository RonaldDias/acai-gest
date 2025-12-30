<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { useRouter } from "vue-router";

import { Mail, Facebook, Eye, EyeOff } from "lucide-vue-next";
import { useAuthStore } from "@/stores/authStore";

const email = ref("");
const senha = ref("");
const erro = ref("");
const mostrarSenha = ref(false);
const router = useRouter();
const authStore = useAuthStore();

function toggleSenha() {
  mostrarSenha.value = !mostrarSenha.value;
}

function irParaCadastro() {
  router.push("/cadastro");
}

async function handleSubmit() {
  if (!email.value || !senha.value) {
    erro.value = "Preencha todos os campos.";
    return;
  }

  erro.value = "";

  const resultado = await authStore.login(email.value, senha.value);

  if (resultado.success) {
    router.push("/dashboard/vendas");
  } else {
    erro.value = resultado.message || "Erro ao fazer login.";
  }
}

watch([email, senha], () => {
  if (email.value || senha.value) {
    erro.value = "";
  }
});
</script>

<template>
  <div class="flex h-screen bg-gradient-to-b from-purple-900 to-purple-700">
    <div class="w-1/2 text-white flex flex-col justify-center px-16">
      <h1 class="text-4xl font-light leading-snug">
        Sistema de Gestão para <br />
        <span class="font-semibold">Pontos de Açaí</span> 100% Web
      </h1>
      <p class="mt-6 italic text-sm max-w-md">"Faça seu negócio crescer."</p>
    </div>

    <div class="w-1/2 flex items-center justify-center">
      <form
        @submit.prevent="handleSubmit"
        class="bg-white rounded-lg shadow-lg p-10 w-full max-w-sm"
      >
        <h2 class="text-2xl font-semibold text-center text-purple-900 mb-6">
          Seja bem-vindo ao Açaí Gest!
        </h2>

        <p v-if="erro" class="text-red-600 mb-4 text-center text-sm">
          {{ erro }}
        </p>

        <div class="mb-2">
          <label class="block text-sm text-gray-700 mb-1">E-mail</label>
          <input
            type="email"
            v-model="email"
            class="w-full border-b py-3 focus:outline-none focus:border-purple-700 disabled:opacity-50"
            placeholder="seuemail@exemplo.com"
          />
        </div>

        <div class="relative w-full max-w-md mx-auto mb-2">
          <label class="block text-sm text-gray-700 mb-1">Senha</label>
          <div class="relative">
            <input
              :type="mostrarSenha ? 'text' : 'password'"
              v-model="senha"
              class="w-full border-b py-3 focus:outline-none focus:border-purple-700 disabled:opacity-50"
              placeholder="••••••••"
            />
            <button
              type="button"
              @click="mostrarSenha = !mostrarSenha"
              class="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer disabled:opacity-50"
            >
              <component :is="mostrarSenha ? EyeOff : Eye" />
            </button>
          </div>
        </div>

        <div class="text-right mt-4 text-sm mb-4">
          <a href="#" class="text-purple-700 hover:underline"
            >Esqueci minha senha</a
          >
        </div>

        <button
          type="submit"
          class="w-full bg-purple-600 shadow-purple-950 shadow-md text-white py-2 px-4 rounded-xl font-semibold hover:bg-purple-800 transition duration-300 disabled:cursor-not-allowed"
        >
          Entrar
        </button>

        <div class="mt-6 text-center text-sm">
          Não possui login?
          <router-link
            to="/cadastro"
            class="text-purple-700 font-semibold hover:underline"
          >
            Cadastre-se
          </router-link>
        </div>

        <div class="mt-6 text-center text-gray-600 text-sm">Ou entre com</div>

        <div class="flex justify-center mt-3 space-x-4">
          <button
            class="cursor-pointer text-purple-700 hover:text-purple-900 text-xl"
          >
            <Mail class="w-6 h-6" />
          </button>
          <button
            class="cursor-pointer text-purple-700 hover:text-purple-900 text-xl"
          >
            <Facebook class="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
