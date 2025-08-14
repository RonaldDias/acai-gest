<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import IMask from "imask";
import { Eye, EyeOff } from "lucide-vue-next";
import { useCadastroStore } from "../../stores/cadastroStore";

const atualizarDados = useCadastroStore().atualizarDados;
const emit = defineEmits(["next"]);

const senha = ref("");
const confirmaSenha = ref("");
const senhaVisivel = ref(false);
const confirmaSenhaVisivel = ref(false);

const dados = reactive({
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
});

const erros = reactive({
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  senha: "",
  confirmaSenha: "",
});

const cpfRef = ref(null);
const telefoneRef = ref(null);

onMounted(() => {
  if (cpfRef.value) {
    IMask(cpfRef.value, { mask: "000.000.000-00" });
  }
  if (telefoneRef.value) {
    IMask(telefoneRef.value, { mask: "(00) 00000-0000" });
  }
});

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarCPFFormato(cpf) {
  const regex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
  return regex.test(cpf);
}

function validarSenha(s) {
  const senhaValida = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return senhaValida.test(s);
}

function validarFormulario() {
  let valido = true;

  erros.nome = !dados.nome ? "Nome é obrigatório." : "";
  erros.cpf = !dados.cpf
    ? "CPF é obrigatório."
    : !validarCPFFormato(dados.cpf)
    ? "Formato de CPF inválido."
    : "";
  erros.telefone = !dados.telefone ? "Telefone é obrigatório." : "";
  erros.email = !dados.email
    ? "E-mail é obrigatório."
    : !validarEmail(dados.email)
    ? "E-mail inválido."
    : "";
  erros.senha = !senha.value
    ? "Senha é obrigatória."
    : !validarSenha(senha.value)
    ? "Senha inválida."
    : "";
  erros.confirmaSenha = !confirmaSenha.value
    ? "Confirmação é obrigatória."
    : senha.value !== confirmaSenha.value
    ? "As senhas não coincidem."
    : "";

  Object.values(erros).forEach((err) => {
    if (err) valido = false;
  });

  return valido;
}

function handleSubmit() {
  if (validarFormulario()) {
    atualizarDados({
      dadosPessoais: {
        nome: dados.nome,
        cpf: dados.cpf,
        telefone: dados.telefone,
        email: dados.email,
        senha: senha.value,
        confirmaSenha: confirmaSenha.value,
      },
    });
    emit("next");
  }
}

watch(
  () => dados.nome,
  (val) => {
    if (val) erros.nome = "";
  }
);

watch(
  () => dados.cpf,
  (val) => {
    if (val && validarCPFFormato(val)) erros.cpf = "";
  }
);

watch(
  () => dados.telefone,
  (val) => {
    if (val) erros.telefone = "";
  }
);

watch(
  () => dados.email,
  (val) => {
    if (val && validarEmail(val)) erros.email = "";
  }
);

watch(
  [() => senha.value, () => confirmaSenha.value],
  ([novaSenha, novaConfirmacao]) => {
    if (!novaConfirmacao) {
      erros.confirmaSenha = "Confirmação é obrigatória.";
    } else if (novaSenha !== novaConfirmacao) {
      erros.confirmaSenha = "As senhas não coincidem.";
    } else {
      erros.confirmaSenha = "";
    }
  }
);
</script>

<template>
  <form
    class="grid grid-cols-1 md:grid-cols-2 gap-6"
    @submit.prevent="handleSubmit"
  >
    <div>
      <label class="block mb-1 text-gray-700 text-sm">Nome completo</label>
      <input
        v-model="dados.nome"
        type="text"
        class="text-gray-700 w-full border-b py-3 focus:outline-none focus:border-purple-700"
        placeholder="Digite seu nome"
      />
      <p v-if="erros.nome" class="text-red-600 text-sm mt-1">
        {{ erros.nome }}
      </p>
    </div>

    <div>
      <label class="block mb-1 text-gray-700 text-sm">CPF</label>
      <input
        ref="cpfRef"
        v-model="dados.cpf"
        type="text"
        class="text-gray-700 w-full border-b py-3 focus:outline-none focus:border-purple-700"
        placeholder="000.000.000-00"
      />
      <p v-if="erros.cpf" class="text-red-600 text-sm mt-1">{{ erros.cpf }}</p>
    </div>

    <div>
      <label class="block mb-1 text-gray-700 text-sm">Telefone</label>
      <input
        ref="telefoneRef"
        v-model="dados.telefone"
        type="tel"
        class="text-gray-700 w-full border-b py-3 focus:outline-none focus:border-purple-700"
        placeholder="(99) 99999-9999"
      />
      <p v-if="erros.telefone" class="text-red-600 text-sm mt-1">
        {{ erros.telefone }}
      </p>
    </div>

    <div>
      <label class="block mb-1 text-gray-700 text-sm">E-mail</label>
      <input
        v-model="dados.email"
        type="email"
        class="text-gray-700 w-full border-b py-3 focus:outline-none focus:border-purple-700"
        placeholder="exemplo@email.com"
      />
      <p v-if="erros.email" class="text-red-600 text-sm mt-1">
        {{ erros.email }}
      </p>
    </div>

    <div class="relative">
      <label class="block mb-1 text-gray-700 text-sm">Senha</label>
      <input
        :type="senhaVisivel ? 'text' : 'password'"
        v-model="senha"
        class="text-gray-700 w-full border-b py-3 focus:outline-none focus:border-purple-700"
        placeholder="Crie uma senha forte"
      />
      <button
        type="button"
        @click="senhaVisivel = !senhaVisivel"
        class="absolute right-2 top-9 text-gray-500 hover:text-gray-700"
        tabindex="-1"
      >
        <component :is="senhaVisivel ? EyeOff : Eye" class="w-5 h-5" />
      </button>
      <p v-if="erros.senha" class="text-red-600 text-sm mt-1">
        {{ erros.senha }}
      </p>
    </div>

    <div class="relative">
      <label class="block mb-1 text-gray-700 text-sm">Confirme sua senha</label>
      <input
        :type="confirmaSenhaVisivel ? 'text' : 'password'"
        v-model="confirmaSenha"
        class="text-gray-700 w-full border-b py-3 focus:outline-none focus:border-purple-700 pr-10"
        placeholder="Repita a senha"
      />
      <button
        type="button"
        @click="confirmaSenhaVisivel = !confirmaSenhaVisivel"
        class="absolute right-2 top-9 text-gray-500 hover:text-gray-700"
        tabindex="-1"
      >
        <component :is="confirmaSenhaVisivel ? EyeOff : Eye" class="w-5 h-5" />
      </button>
      <p v-if="erros.confirmaSenha" class="text-red-600 text-sm mt-1">
        {{ erros.confirmaSenha }}
      </p>
    </div>

    <div class="md:col-span-2 flex justify-between items-center h-full mt-4">
      <router-link
        to="/"
        class="text-purple-700 font-semibold hover:underline inline-block px-2 py-2"
      >
        Cancelar
      </router-link>
      <button
        type="submit"
        class="bg-purple-700 text-white shadow-purple-950 shadow-md px-6 py-2 rounded-full cursor-pointer hover:bg-purple-800 transition"
      >
        Próximo
      </button>
    </div>
  </form>
</template>
