<script setup>
import { ref, reactive, computed } from "vue";

// Dados simulados/iniciais
const transacoes = ref([
  {
    id: 1,
    tipo: "entrada",
    categoria: "Venda de Açaí",
    descricao: "Venda no ponto de venda",
    valor: 150,
    data: "2025-08-10",
  },
  {
    id: 2,
    tipo: "saida",
    categoria: "Compra de Farinha",
    descricao: "Compra para estoque",
    valor: 50,
    data: "2025-08-11",
  },
]);

const novaTransacao = reactive({
  tipo: "saida",
  categoria: "",
  descricao: "",
  valor: 0,
  data: new Date().toISOString().slice(0, 10),
});

const showModal = ref(false);

// Categorias possíveis para nova transação
const categoriasSaida = [
  "Compra de Açaí",
  "Compra de Farinha",
  "Compra de Farinha de Tapioca",
  "Energia",
  "Equipamento",
  "Embalagens",
  "Pessoal",
];
const categoriasEntrada = [
  "Venda de Açaí",
  "Venda de Farinha",
  "Venda de Tapioca",
];

const categorias = computed(() =>
  novaTransacao.tipo === "entrada" ? categoriasEntrada : categoriasSaida
);

function abrirModal() {
  showModal.value = true;
  // Resetar campos
  novaTransacao.tipo = "saida";
  novaTransacao.categoria = "";
  novaTransacao.descricao = "";
  novaTransacao.valor = 0;
  novaTransacao.data = new Date().toISOString().slice(0, 10);
}

function fecharModal() {
  showModal.value = false;
}

function salvarTransacao() {
  if (
    !novaTransacao.categoria ||
    !novaTransacao.descricao ||
    novaTransacao.valor <= 0
  ) {
    alert("Preencha todos os campos corretamente.");
    return;
  }
  transacoes.value.push({
    id: Date.now(),
    tipo: novaTransacao.tipo,
    categoria: novaTransacao.categoria,
    descricao: novaTransacao.descricao,
    valor: novaTransacao.valor,
    data: novaTransacao.data,
  });
  fecharModal();
}

// Cálculos do resumo
const totalEntradas = computed(() =>
  transacoes.value
    .filter((t) => t.tipo === "entrada")
    .reduce((acc, cur) => acc + cur.valor, 0)
);

const totalSaidas = computed(() =>
  transacoes.value
    .filter((t) => t.tipo === "saida")
    .reduce((acc, cur) => acc + cur.valor, 0)
);

const lucroMensal = computed(() => totalEntradas.value - totalSaidas.value);
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">Fluxo de Caixa</h1>

    <!-- Resumo geral -->
    <div class="flex gap-6 mb-6">
      <div class="flex-1 bg-white p-4 rounded shadow text-center">
        <p class="text-gray-500">Entradas</p>
        <p class="text-green-600 text-3xl font-bold">
          R$ {{ totalEntradas.toFixed(2) }}
        </p>
      </div>
      <div class="flex-1 bg-white p-4 rounded shadow text-center">
        <p class="text-gray-500">Saídas</p>
        <p class="text-red-600 text-3xl font-bold">
          R$ {{ totalSaidas.toFixed(2) }}
        </p>
      </div>
      <div class="flex-1 bg-white p-4 rounded shadow text-center">
        <p class="text-gray-500">Lucro Mensal</p>
        <p
          :class="[
            'text-3xl font-bold',
            lucroMensal >= 0 ? 'text-green-700' : 'text-red-700',
          ]"
        >
          R$ {{ lucroMensal.toFixed(2) }}
        </p>
      </div>
    </div>

    <!-- Botão nova transação -->
    <button
      @click="abrirModal"
      class="mb-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
    >
      Nova Transação
    </button>

    <!-- Lista de transações -->
    <table class="w-full bg-white rounded shadow">
      <thead class="bg-purple-700 text-white">
        <tr>
          <th class="p-3 text-left">Data</th>
          <th class="p-3 text-left">Tipo</th>
          <th class="p-3 text-left">Categoria</th>
          <th class="p-3 text-left">Descrição</th>
          <th class="p-3 text-right">Valor (R$)</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="transacao in transacoes"
          :key="transacao.id"
          :class="transacao.tipo === 'entrada' ? 'bg-green-50' : 'bg-red-50'"
        >
          <td class="p-3">{{ transacao.data }}</td>
          <td class="p-3 capitalize">{{ transacao.tipo }}</td>
          <td class="p-3">{{ transacao.categoria }}</td>
          <td class="p-3">{{ transacao.descricao }}</td>
          <td class="p-3 text-right font-semibold">
            {{ transacao.valor.toFixed(2) }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal nova transação -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Nova Transação</h2>

        <form @submit.prevent="salvarTransacao" class="flex flex-col space-y-4">
          <label>
            Tipo:
            <select
              v-model="novaTransacao.tipo"
              class="w-full border p-2 rounded"
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </label>

          <label>
            Categoria:
            <select
              v-model="novaTransacao.categoria"
              class="w-full border p-2 rounded"
            >
              <option value="" disabled>Selecione a categoria</option>
              <option v-for="cat in categorias" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </label>

          <label>
            Descrição:
            <input
              v-model="novaTransacao.descricao"
              type="text"
              class="w-full border p-2 rounded"
              placeholder="Descrição da transação"
            />
          </label>

          <label>
            Valor (R$):
            <input
              v-model.number="novaTransacao.valor"
              type="number"
              min="0"
              step="0.01"
              class="w-full border p-2 rounded"
              placeholder="Valor"
            />
          </label>

          <label>
            Data:
            <input
              v-model="novaTransacao.data"
              type="date"
              class="w-full border p-2 rounded"
            />
          </label>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="fecharModal"
              class="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
