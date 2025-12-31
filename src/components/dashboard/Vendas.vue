<script setup>
import { ref, computed, onMounted } from "vue";
import { ShoppingCart, DollarSign, Plus, Minus } from "lucide-vue-next";
import { vendasApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();

const tiposAcai = [
  { label: "Grosso", valor: 25 },
  { label: "Médio", valor: 20 },
  { label: "Popular", valor: 15 },
];

const formasPagamento = ["PIX", "Dinheiro", "Débito", "Crédito"];

const produtos = [
  { id: 1, nome: "Açaí", tipo: "acai" },
  { id: 2, nome: "Farinha de Tapioca", tipo: "farinha", preco: 3 },
  { id: 3, nome: "Farinha de Mandioca", tipo: "farinha", preco: 10 },
  { id: 4, nome: "Outro", tipo: "outro" },
];

const itensVenda = ref([]);

const venda = ref({
  produtoId: null,
  tipoAcai: null,
  outroNome: "",
  quantidade: 0,
  precoUnitario: 0,
  formaPagamento: "PIX",
});

const vendasHoje = ref([]);
const totalVendasHoje = ref(0);
const totalDinheiroHoje = ref(0);
const registrandoVenda = ref(false);

const produtoSelecionado = computed(() => {
  return produtos.find((p) => p.id === venda.value.produtoId);
});

const isAcai = computed(() => produtoSelecionado.value?.tipo === "acai");
const isFarinha = computed(() => produtoSelecionado.value?.tipo === "farinha");
const isOutro = computed(() => produtoSelecionado.value?.tipo === "outro");

const quantidadeMin = computed(() => {
  if (isAcai.value) return 500;
  if (isFarinha.value) return 1000;
  return 1;
});

const quantidadeIncremento = computed(() => {
  if (isAcai.value) return 500;
  if (isFarinha.value) return 1000;
  return 1;
});

const unidadeMedida = computed(() => {
  if (isAcai.value) return "ml";
  if (isFarinha.value) return "ml";
  return "un";
});

const valorTotal = computed(() => {
  const qtd = venda.value.quantidade;
  const preco = venda.value.precoUnitario;

  if (isAcai.value || isFarinha.value) {
    return (qtd / 1000) * preco;
  }

  return qtd * preco;
});

function selecionarProduto(produtoId) {
  venda.value.produtoId = produtoId;
  venda.value.quantidade = 0;
  venda.value.tipoAcai = null;
  venda.value.outroNome = "";

  const produto = produtos.find((p) => p.id === produtoId);

  if (produto?.preco) {
    venda.value.precoUnitario = produto.preco;
  } else {
    venda.value.precoUnitario = 0;
  }
}

function selecionarTipoAcai(tipo) {
  venda.value.tipoAcai = tipo.label;
  venda.value.precoUnitario = tipo.valor;
}

function incrementarQuantidade() {
  if (venda.value.quantidade === 0) {
    venda.value.quantidade = quantidadeMin.value;
  } else {
    venda.value.quantidade += quantidadeIncremento.value;
  }
}

function decrementarQuantidade() {
  const novaQtd = venda.value.quantidade - quantidadeIncremento.value;
  if (novaQtd >= quantidadeMin.value) {
    venda.value.quantidade = novaQtd;
  } else {
    venda.value.quantidade = 0;
  }
}

function validarItem() {
  if (!venda.value.produtoId) {
    alert("Selecione um produto");
    return false;
  }

  if (isAcai.value && !venda.value.tipoAcai) {
    alert("Selecione o tipo de açaí");
    return false;
  }

  if (isOutro.value && !venda.value.outroNome.trim()) {
    alert("Especifique o produto");
    return false;
  }

  if (venda.value.quantidade === 0) {
    alert("Informe a quantidade");
    return false;
  }

  if (venda.value.precoUnitario === 0) {
    alert("Informe o preço unitário");
    return false;
  }

  return true;
}

function adicionarItem() {
  if (!validarItem()) return;

  itensVenda.value.push({
    produtoId: venda.value.produtoId,
    produtoNome: produtoSelecionado.value.nome,
    tipoAcai: venda.value.tipoAcai,
    outroNome: venda.value.outroNome,
    quantidade: venda.value.quantidade,
    unidade: unidadeMedida.value,
    precoUnitario: venda.value.precoUnitario,
    valorTotal: valorTotal.value,
  });

  limparFormulario();
}

function removerItem(index) {
  itensVenda.value.splice(index, 1);
}

const totalItensVenda = computed(() => {
  return itensVenda.value.reduce((sum, item) => sum + item.valorTotal, 0);
});

async function registrarVenda() {
  if (itensVenda.value.length === 0) {
    alert("Adicione pelo menos um item à venda");
    return;
  }

  const authStore = useAuthStore();

  const dadosVenda = {
    itens: [...itensVenda.value],
    valorTotal: totalItensVenda.value,
    formaPagamento: venda.value.formaPagamento,
    vendedorId: authStore.user?.id,
    vendedorNome: authStore.user?.nome,
    data: new Date().toISOString(),
  };

  registrandoVenda.value = true;

  // TODO Backend: POST /api/sales
  // Validar dados
  // Salvar no banco
  // Atualizar estoque automaticamente
  // Retornar venda criada com ID
  /*
  try {
    await vendasApi.criar(dadosVenda);
  } catch (error) {
    alert("Erro ao resgistrar venda: " + error.message);
    return
  }
  */
  vendasHoje.value.unshift(dadosVenda);
  atualizarResumo();
  itensVenda.value = [];
  limparFormulario();

  registrandoVenda.value = false;
  alert("Venda registrada com sucesso!");
}

function limparFormulario() {
  venda.value = {
    produtoId: null,
    tipoAcai: null,
    outroNome: "",
    quantidade: 0,
    precoUnitario: 0,
    formaPagamento: "PIX",
  };
}

function atualizarResumo() {
  totalVendasHoje.value = vendasHoje.value.length;
  totalDinheiroHoje.value = vendasHoje.value.reduce(
    (sum, v) => sum + v.valorTotal,
    0,
  );
}

function formatarQuantidade(qtd, unidade) {
  if (unidade === "ml") {
    if (qtd >= 1000) {
      return `${(qtd / 1000).toFixed(1)}L`;
    }
    return `${qtd}ml`;
  }
  return `${qtd} ${unidade}`;
}

onMounted(() => {
  // TODO Backend: GET /api/sales/today
  // GET /api/sales/summary/today
  // GET /api/products quando backend estiver pronto
  // GET /api/sales/summary/today - Cards de resumo (total vendas e valor)
  /*
  try {
    const vendas = vendasApi.listarHoje();
    vendasHoje.value = vendas;
    atualizarResumo();
  } catch (error) {
    console.error("Erro ao carregar vendas: ", error);
  }
  */
});
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">Registro de Vendas</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        class="bg-purple-700 text-white rounded-lg p-6 flex items-center space-x-4"
      >
        <ShoppingCart :size="40" />
        <div>
          <p class="text-sm opacity-90">Vendas Hoje</p>
          <p class="text-3xl font-bold">{{ totalVendasHoje }}</p>
        </div>
      </div>

      <div
        class="bg-green-500 text-white rounded-lg p-6 flex items-center space-x-4"
      >
        <DollarSign :size="40" />
        <div>
          <p class="text-sm opacity-90">Total do Dia</p>
          <p class="text-3xl font-bold">
            R$ {{ totalDinheiroHoje.toFixed(2) }}
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4 flex items-center">
        <Plus class="mr-2" />
        Registrar Nova Venda
      </h2>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Produto</label
          >
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              v-for="produto in produtos"
              :key="produto.id"
              @click="selecionarProduto(produto.id)"
              :class="[
                'p-3 rounded border-2 transition',
                venda.produtoId === produto.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-300',
              ]"
            >
              {{ produto.nome }}
            </button>
          </div>
        </div>

        <div v-if="isAcai">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Tipo de Açaí</label
          >
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="tipo in tiposAcai"
              :key="tipo.label"
              @click="selecionarTipoAcai(tipo)"
              :class="[
                'p-3 rounded border-2 transition',
                venda.tipoAcai === tipo.label
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-300',
              ]"
            >
              <div class="font-medium">{{ tipo.label }}</div>
              <div class="text-sm text-gray-600">R$ {{ tipo.valor }}/L</div>
            </button>
          </div>
        </div>

        <div v-if="isOutro">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Especificar Produto
          </label>
          <input
            v-model="venda.outroNome"
            type="text"
            placeholder="Ex: Cupuaçu, Bacaba..."
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Quantidade ({{ unidadeMedida }})
          </label>
          <div class="flex items-center space-x-3">
            <button
              @click="decrementarQuantidade"
              class="bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50"
              :disabled="venda.quantidade === 0"
            >
              <Minus :size="20" />
            </button>
            <span class="text-2xl font-semibold w-32 text-center">
              {{ formatarQuantidade(venda.quantidade, unidadeMedida) }}
            </span>
            <button
              @click="incrementarQuantidade"
              class="bg-green-500 text-white p-2 rounded hover:bg-green-600"
              :disabled="!venda.produtoId"
            >
              <Plus :size="20" />
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Preço Unitário (R$)
          </label>
          <input
            v-model.number="venda.precoUnitario"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          />
        </div>

        <button
          @click="adicionarItem"
          class="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Adicionar Item
        </button>

        <div v-if="itensVenda.length > 0" class="bg-gray-50 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Itens da Venda</h3>
          <div class="space-y-2">
            <div
              v-for="(item, index) in itensVenda"
              :key="index"
              class="flex items-center justify-between p-3 bg-white rounded border"
            >
              <div class="flex-1">
                <p class="font-medium text-gray-800">
                  {{ item.produtoNome }}
                  <span v-if="item.tipoAcai" class="text-sm text-gray-600"
                    >({{ item.tipoAcai }})</span
                  >
                  <span v-if="item.outroNome" class="text-sm text-gray-600"
                    >({{ item.outroNome }})</span
                  >
                </p>
                <p class="text-sm text-gray-600">
                  {{ formatarQuantidade(item.quantidade, item.unidade) }} × R$
                  {{ item.precoUnitario.toFixed(2) }} =
                  <span class="font-medium"
                    >R$ {{ item.valorTotal.toFixed(2) }}</span
                  >
                </p>
              </div>
              <button
                @click="removerItem(index)"
                class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Minus :size="20" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Forma de Pagamento
          </label>
          <select
            v-model="venda.formaPagamento"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          >
            <option
              v-for="forma in formasPagamento"
              :key="forma"
              :value="forma"
            >
              {{ forma }}
            </option>
          </select>
        </div>

        <div class="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
          <div class="flex justify-between items-center">
            <span class="text-lg font-medium text-gray-700">Valor Total:</span>
            <span class="text-2xl font-bold text-purple-700">
              R$ {{ totalItensVenda.toFixed(2) }}
            </span>
          </div>
        </div>

        <button
          @click="registrarVenda"
          :disabled="registrandoVenda"
          class="w-full bg-purple-700 text-white py-3 rounded-lg font-semibold hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ registrandoVenda ? "Registrando..." : "Registrar Venda" }}
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Vendas de Hoje</h2>

      <div
        v-if="vendasHoje.length === 0"
        class="text-center text-gray-500 py-8"
      >
        Nenhuma venda registrada hoje
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 px-2">Horário</th>
              <th class="text-left py-3 px-2">Produto</th>
              <th class="text-right py-3 px-2">Quantidade</th>
              <th class="text-right py-3 px-2">Valor</th>
              <th class="text-center py-3 px-2">Pagamento</th>
              <th
                v-if="authStore.user?.tipo === 'dono'"
                class="text-center py-3 px-2"
              >
                Vendedor
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(v, index) in vendasHoje"
              :key="index"
              class="border-b hover:bg-gray-50"
            >
              <td class="py-3 px-2">
                {{
                  new Date(v.data).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}
              </td>
              <td class="py-3 px-2">
                <div v-for="(item, idx) in v.itens" :key="idx" class="mb-1">
                  {{ item.produtoNome }}
                  <span v-if="item.tipoAcai" class="text-sm text-gray-600">
                    ({{ item.tipoAcai }})
                  </span>
                  <span v-if="item.outroNome" class="text-sm text-gray-600">
                    ({{ item.outroNome }})
                  </span>
                </div>
              </td>
              <td class="text-right py-3 px-2">
                <div v-for="(item, idx) in v.itens" :key="idx" class="mb-1">
                  {{ formatarQuantidade(item.quantidade, item.unidade) }}
                </div>
              </td>
              <td class="text-right py-3 px-2 font-semibold">
                R$ {{ v.valorTotal.toFixed(2) }}
              </td>
              <td class="text-center py-3 px-2">
                <span
                  class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {{ v.formaPagamento }}
                </span>
              </td>
              <td
                v-if="authStore.user?.tipo === 'dono'"
                class="text-center py-3 px-2"
              >
                {{ v.vendedorNome || "N/A" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
