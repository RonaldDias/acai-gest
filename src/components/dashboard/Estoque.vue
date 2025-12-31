<script setup>
import { ref, computed, onMounted } from "vue";
import { Package, DollarSign, Plus, Minus, Search } from "lucide-vue-next";

// TODO backend: dados vindos da API
const produtos = ref([
  {
    id: 1,
    nome: "Açaí",
    quantidade: 45,
    estoqueMaximo: 100,
    unidade: "L",
    precoUnitario: 28.5,
  },
  {
    id: 2,
    nome: "Farinha",
    quantidade: 18,
    estoqueMaximo: 50,
    unidade: "L",
    precoUnitario: 22.0,
  },
  {
    id: 3,
    nome: "Tapioca",
    quantidade: 12,
    estoqueMaximo: 80,
    unidade: "L",
    precoUnitario: 15.0,
  },
]);

const mostrarFormulario = ref(false);
const novoItem = ref({
  nome: "",
  outroNome: "",
  quantidade: 0,
  estoqueMaximo: 0,
  unidade: "L",
  precoUnitario: 0,
});

const produtosBase = [
  "Açaí",
  "Farinha de Tapioca",
  "Farinha de Mandioca",
  "Outro",
];
const unidades = ["L", "Kg", "un"];

const carregandoProdutos = ref(false);

function abrirFormAdicionarItem() {
  mostrarFormulario.value = true;
}

function fecharForm() {
  mostrarFormulario.value = false;
  novoItem.value = {
    nome: "",
    outroNome: "",
    quantidade: 0,
    unidade: "L",
    precoUnitario: 0,
  };
}

function adicionarItem() {
  // TODO: Validação e envio para API
  // Registrar entrada no fluxo de caixa
  alert("Adicionar item - implementar backend");
  fecharForm();
}

const buscaTexto = ref("");

const totalItens = computed(() => produtos.value.length);

const valorTotal = computed(() => {
  return produtos.value.reduce(
    (sum, p) => sum + p.quantidade * p.precoUnitario,
    0,
  );
});

const produtosFiltrados = computed(() => {
  return produtos.value.filter((p) => {
    const matchBusca = p.nome
      .toLowerCase()
      .includes(buscaTexto.value.toLowerCase());
    return matchBusca;
  });
});

function getStatusEstoque(produto) {
  const percentual = (produto.quantidade / produto.estoqueMaximo) * 100;

  if (percentual < 20) {
    return { classe: "bg-red-100 text-red-800", label: "Crítico" };
  } else if (percentual < 30) {
    return { classe: "bg-yellow-100 text-yellow-800", label: "Baixo" };
  }
  return null;
}

function valorTotalProduto(produto) {
  return produto.quantidade * produto.precoUnitario;
}

onMounted(async () => {
  // TODO Backend: GET /api/products
  // carregandoProdutos.value = true;
  // try {
  //   const dados = await api.get('/api/products');
  //   produtos.value = dados;
  // } catch (error) {
  //   console.error(error);
  // } finally {
  //   carregandoProdutos.value = false;
  // }
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Controle de Estoque</h1>
        <p class="text-gray-600 text-sm">Gerencie seus produtos e insumos</p>
      </div>
      <button
        @click="abrirFormAdicionarItem"
        class="bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-800 transition flex items-center"
      >
        <Plus :size="20" class="mr-2" />
        Adicionar Item
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        class="bg-purple-700 text-white rounded-lg p-6 flex items-center space-x-4"
      >
        <Package :size="40" />
        <div>
          <p class="text-sm opacity-90">Total de Itens</p>
          <p class="text-3xl font-bold">{{ totalItens }}</p>
        </div>
      </div>

      <div
        class="bg-green-500 text-white rounded-lg p-6 flex items-center space-x-4"
      >
        <DollarSign :size="40" />
        <div>
          <p class="text-sm opacity-90">Valor Total</p>
          <p class="text-3xl font-bold">R$ {{ valorTotal.toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <div v-if="mostrarFormulario" class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">Adicionar Novo Item</h2>
        <button @click="fecharForm" class="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Produto</label
          >
          <select
            v-model="novoItem.nome"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          >
            <option value="">Selecione...</option>
            <option v-for="prod in produtosBase" :key="prod" :value="prod">
              {{ prod }}
            </option>
          </select>
        </div>

        <div v-if="novoItem.nome === 'Outro'">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Descrição</label
          >
          <input
            v-model="novoItem.outroNome"
            type="text"
            placeholder="Ex: Cupuaçu, Bacaba..."
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          />
        </div>

        <div class="grid grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Quantidade</label
            >
            <input
              v-model.number="novoItem.quantidade"
              type="number"
              min="0"
              step="0.01"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Estoque Máximo</label
            >
            <input
              v-model.number="novoItem.estoqueMaximo"
              type="number"
              min="0"
              step="0.01"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Unidade</label
            >
            <select
              v-model="novoItem.unidade"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
            >
              <option v-for="un in unidades" :key="un" :value="un">
                {{ un }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Preço Unitário (R$)</label
            >
            <input
              v-model.number="novoItem.precoUnitario"
              type="number"
              min="0"
              step="0.01"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
            />
          </div>
        </div>

        <button
          @click="adicionarItem"
          class="w-full bg-purple-700 text-white py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
        >
          Adicionar ao Estoque
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <Search
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            :size="20"
          />
          <input
            v-model="buscaTexto"
            type="text"
            placeholder="Buscar produto..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
          />
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="text-left py-3 px-4 font-medium text-gray-700">
                Produto
              </th>
              <th class="text-right py-3 px-4 font-medium text-gray-700">
                Quantidade
              </th>
              <th class="text-right py-3 px-4 font-medium text-gray-700">
                Preço Unit.
              </th>
              <th class="text-right py-3 px-4 font-medium text-gray-700">
                Valor Total
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="produto in produtosFiltrados"
              :key="produto.id"
              class="border-b hover:bg-gray-50 transition"
            >
              <td class="py-3 px-4">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"
                  >
                    <Package :size="16" class="text-purple-700" />
                  </div>
                  <span class="font-medium text-gray-800">{{
                    produto.nome
                  }}</span>
                </div>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <span
                    v-if="getStatusEstoque(produto)"
                    :class="[
                      'px-2 py-1 rounded text-xs font-medium',
                      getStatusEstoque(produto).classe,
                    ]"
                  >
                    {{ getStatusEstoque(produto).label }}
                  </span>
                  <span class="font-medium text-gray-800">
                    {{ produto.quantidade }} {{ produto.unidade }}
                  </span>
                </div>
              </td>
              <td class="py-3 px-4 text-right text-gray-600">
                R$ {{ produto.precoUnitario.toFixed(2) }}
              </td>
              <td class="py-3 px-4 text-right font-semibold text-gray-800">
                R$ {{ valorTotalProduto(produto).toFixed(2) }}
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center justify-center space-x-2"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="produtosFiltrados.length === 0"
        class="text-center py-8 text-gray-500"
      >
        Nenhum produto encontrado
      </div>
    </div>
  </div>
</template>
