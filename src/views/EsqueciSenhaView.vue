<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Eye, EyeOff } from "lucide-vue-next";
import api from "@/services/api";
import { useToastStore } from "@/stores/toastStore";

const router = useRouter();
const toast = useToastStore();

const etapa = ref(1);
const email = ref("");
const token = ref("");
const novaSenha = ref("");
const confirmaSenha = ref("");
const carregando = ref(false);
const mostrarSenha = ref(false);
const mostrarConfirma = ref(false);

async function handleEnviarEmail() {
  if (!email.value) {
    toast.warning("Informe seu e-mail.");
    return;
  }

  carregando.value = true;

  try {
    await api.post("/auth/esqueci-senha", { email: email.value });
    toast.success("Código enviado para o seu e-mail!");
    etapa.value = 2;
  } catch (e) {
    toast.error(e.message || "Erro ao enviar e-mail.");
  } finally {
    carregando.value = false;
  }
}

async function handleRedefinir() {
  if (!token.value || !novaSenha.value || !confirmaSenha.value) {
    toast.warning("Preencha todos os campos");
    return;
  }

  if (novaSenha.value !== confirmaSenha.value) {
    toast.error("As senhas não conferem.");
    return;
  }

  if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(novaSenha.value)) {
    toast.error(
      "A senha deve ter pelo menos 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial.",
    );
    return;
  }

  carregando.value = true;

  try {
    await api.post("/auth/redefinir-senha", {
      email: email.value,
      token: token.value,
      novaSenha: novaSenha.value,
    });
    etapa.value = 3;
  } catch (e) {
    toast.error(e.message || "Token inválido ou expirado.");
  } finally {
    carregando.value = false;
  }
}
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
      <div class="bg-white rounded-lg shadow-lg p-10 w-full max-w-sm">
        <template v-if="etapa === 1">
          <h2 class="text-2xl font-semibold text-center text-purple-900 mb-2">
            Recuperar senha
          </h2>
          <p class="text-sm text-gray-500 text-center mb-6">
            Informe seu e-mail e enviaremos um código de recuperação.
          </p>

          <div class="mb-6">
            <label class="block text-sm text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              v-model="email"
              class="w-full border-b py-3 focus:outline-none focus:border-purple-700"
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <button
            @click="handleEnviarEmail"
            :disabled="carregando"
            class="w-full bg-purple-600 shadow-purple-950 shadow-md text-white py-2 px-4 rounded-xl font-semibold hover:bg-purple-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ carregando ? "Enviando..." : "Enviar código" }}
          </button>

          <div class="mt-4 text-center text-sm">
            <router-link to="/" class="text-purple-700 hover:underline"
              >Voltar ao login</router-link
            >
          </div>
        </template>

        <template v-if="etapa === 2">
          <h2 class="text-2xl font-semibold text-center text-purple-900 mb-2">
            Redefinir senha
          </h2>
          <p class="text-sm text-gray-500 text-center mb-6">
            Digite o código enviado para <strong>{{ email }}</strong> e escolha
            uma nova senha.
          </p>

          <div class="mb-4">
            <label class="block text-sm text-gray-700 mb-1"
              >Código de verificação</label
            >
            <input
              type="text"
              v-model="token"
              maxlength="6"
              class="w-full border-b py-3 focus:outline-none focus:border-purple-700 tracking-widest text-center text-lg"
              placeholder="000000"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm text-gray-700 mb-1">Nova senha</label>
            <div class="relative">
              <input
                :type="mostrarSenha ? 'text' : 'password'"
                v-model="novaSenha"
                class="w-full border-b py-3 focus:outline-none focus:border-purple-700"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="mostrarSenha = !mostrarSenha"
                class="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <component :is="mostrarSenha ? EyeOff : Eye" />
              </button>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm text-gray-700 mb-1"
              >Confirmar nova senha</label
            >
            <div class="relative">
              <input
                :type="mostrarConfirma ? 'text' : 'password'"
                v-model="confirmaSenha"
                class="w-full border-b py-3 focus:outline-none focus:border-purple-700"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="mostrarConfirma = !mostrarConfirma"
                class="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <component :is="mostrarConfirma ? EyeOff : Eye" />
              </button>
            </div>
          </div>

          <button
            @click="handleRedefinir"
            :disabled="carregando"
            class="w-full bg-purple-600 shadow-purple-950 shadow-md text-white py-2 px-4 rounded-xl font-semibold hover:bg-purple-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ carregando ? "Salvando..." : "Redefinir senha" }}
          </button>

          <div class="mt-4 text-center text-sm">
            <button @click="etapa = 1" class="text-purple-700 hover:underline">
              Voltar
            </button>
          </div>
        </template>

        <template v-if="etapa === 3">
          <div class="text-center">
            <div class="text-5xl mb-4">✅</div>
            <h2 class="text-2xl font-semibold text-purple-900 mb-2">
              Senha redefinida!
            </h2>
            <p class="text-sm text-gray-500 mb-8">
              Sua senha foi alterada com sucesso. Você já pode fazer login.
            </p>
            <button
              @click="router.push('/')"
              class="w-full bg-purple-600 shadow-purple-950 shadow-md text-white py-2 px-4 rounded-xl font-semibold hover:bg-purple-800 transition duration-300"
            >
              Ir para o login
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
