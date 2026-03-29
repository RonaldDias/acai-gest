<script setup>
import { ref, onMounted } from "vue";
import { useToastStore } from "@/stores/toastStore";
import { vendedoresApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { Plus, Users, UserCircle, Trash2 } from "lucide-vue-next";

const authStore = useAuthStore();
const toast = useToastStore();

const mostrarFormulario = ref(false);
const novoVendedor = ref({
  nome: "",
  cpf: "",
});

const vendedores = ref([]);

const mostrarModalRemover = ref(false);
const vendedorParaRemover = ref(null);

function abrirFormulario() {
  mostrarFormulario.value = true;
}

function fecharFormulario() {
  mostrarFormulario.value = false;
  novoVendedor.value = {
    nome: "",
    cpf: "",
  };
}

function validarCPF(cpf) {
  const cpfLimpo = cpf.replace(/\D/g, "");
  return cpfLimpo.length === 11;
}

async function cadastrarVendedor() {
  if (!novoVendedor.value.nome.trim()) {
    toast.warning("Informe o nome do vendedor");
    return;
  }

  if (!validarCPF(novoVendedor.value.cpf)) {
    toast.warning("CPF inválido");
    return;
  }

  try {
    const data = await vendedoresApi.criar({
      nome: novoVendedor.value.nome,
      cpf: novoVendedor.value.cpf,
      pontoId: authStore.user?.pontoId,
    });

    vendedores.value.push({
      id: data.vendedor.id,
      nome: data.vendedor.nome,
      cpf: data.vendedor.cpf,
      dataCadastro: data.vendedor.createdAt,
      senha: data.senhaTemporaria,
    });

    toast.success(
      `Vendedor ${data.vendedor.nome} cadastrado! Senha: ${data.senhaTemporaria}`,
    );
    fecharFormulario();
  } catch (error) {
    toast.error("Erro ao cadastrar vendedor.");
  }
}

function confirmarRemocao(vendedor) {
  vendedorParaRemover.value = vendedor;
  mostrarModalRemover.value = true;
}

function cancelarRemocao() {
  vendedorParaRemover.value = null;
  mostrarModalRemover.value = false;
}

async function removerVendedor() {
  try {
    await vendedoresApi.desativar(vendedorParaRemover.value.id);

    vendedores.value = vendedores.value.filter(
      (v) => v.id !== vendedorParaRemover.value.id,
    );

    toast.success(
      `Vendedor ${vendedorParaRemover.value.nome} removido com sucesso!`,
    );
    cancelarRemocao();
  } catch (error) {
    toast.error("Erro ao remover vendedor.");
  }
}

function copiarSenha(senha) {
  navigator.clipboard.writeText(senha);
  toast.success("Senha copiada!");
}

onMounted(async () => {
  const pontoId = authStore.user?.pontoId;
  const data = await vendedoresApi.listar(pontoId);

  vendedores.value = data.vendedores.map((v) => ({
    id: v.id,
    nome: v.nome,
    cpf: v.cpf,
    dataCadastro: v.data_cadastro,
    senha: null,
  }));
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Gerenciar Vendedores</h1>
        <p class="text-gray-600 text-sm">
          Cadastre e gerencie sua equipe de vendas
        </p>
      </div>
      <button
        @click="abrirFormulario"
        class="bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-800 transition flex items-center"
      >
        <Plus :size="20" class="mr-2" />
        Novo Vendedor
      </button>
    </div>

    <div
      class="bg-purple-700 text-white rounded-lg p-6 flex items-center space-x-4"
    >
      <Users :size="40" />
      <div>
        <p class="text-sm opacity-90">Total de Vendedores</p>
        <p class="text-3xl font-bold">{{ vendedores.length }}</p>
      </div>
    </div>

    <div v-if="mostrarFormulario" class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">
          Cadastrar Novo Vendedor
        </h2>
        <button
          @click="fecharFormulario"
          class="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Nome Completo</label
          >
          <input
            v-model="novoVendedor.nome"
            type="text"
            placeholder="Ex: João Silva"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >CPF</label
          >
          <input
            v-model="novoVendedor.cpf"
            type="text"
            placeholder="000.000.000-00"
            maxlength="14"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          />
          <p class="text-xs text-gray-500 mt-1">
            O vendedor usará o CPF para fazer login
          </p>
        </div>

        <button
          @click="cadastrarVendedor"
          class="w-full bg-purple-700 text-white py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
        >
          Cadastrar Vendedor
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Vendedores Cadastrados</h2>

      <div
        v-if="vendedores.length === 0"
        class="text-center text-gray-500 py-8"
      >
        <Users :size="64" class="mx-auto mb-4 text-gray-300" />
        <p>Nenhum vendedor cadastrado</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="vendedor in vendedores"
          :key="vendedor.id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div
                class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"
              >
                <UserCircle :size="24" class="text-purple-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-800">{{ vendedor.nome }}</h3>
                <p class="text-sm text-gray-500">{{ vendedor.cpf }}</p>
              </div>
            </div>
            <button
              @click="confirmarRemocao(vendedor)"
              class="text-red-600 hover:bg-red-50 p-2 rounded transition"
            >
              <Trash2 :size="18" />
            </button>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Cadastrado em:</span>
              <span class="font-medium">{{
                new Date(vendedor.dataCadastro).toLocaleDateString("pt-BR")
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Senha:</span>
              <button
                @click="copiarSenha(vendedor.senha)"
                class="text-blue-600 hover:text-blue-800 font-mono text-xs bg-blue-50 px-2 py-1 rounded"
              >
                {{ vendedor.senha }} 📋
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="mostrarModalRemover"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Confirmar Remoção</h2>
        <p class="text-gray-600 mb-6">
          Tem certeza que deseja remover o vendedor
          <strong>{{ vendedorParaRemover?.nome }}</strong
          >? <br /><br />
          Esta ação não pode ser desfeita.
        </p>

        <div class="flex space-x-3">
          <button
            @click="cancelarRemocao"
            class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
          <button
            @click="removerVendedor"
            class="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
