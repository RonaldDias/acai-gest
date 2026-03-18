<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { produtosApi, vendasApi } from "@/services/api.js";

const authStore = useAuthStore();
const toast = useToastStore();

const produtos = ref([]);
const loadingProdutos = ref(false);
const errorProdutos = ref(null);

const formasPagamento = ["PIX", "Dinheiro", "Débito", "Crédito"];

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
  return produtos.value.find((p) => p.id === venda.value.produtoId);
});

const isAcai = computed(() => {
  const nome = produtoSelecionado.value?.nome?.toLowerCase() || "";
  return nome.includes("açaí") || nome.includes("açaí");
});
const isFarinha = computed(() => {
  const nome = produtoSelecionado.value?.nome?.toLowerCase() || "";
  return nome.includes("farinha");
});

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

  const produto = produtos.value.find((p) => p.id === produtoId);

  console.log("produto encontrado:", produto);
  console.log("preco:", produto?.preco);

  if (produto?.preco) {
    venda.value.precoUnitario = parseFloat(produto.preco);
  } else {
    venda.value.precoUnitario = 0;
  }
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
    toast.warning("Selecione um produto");
    return false;
  }

  if (venda.value.quantidade === 0) {
    toast.warning("Informe a quantidade");
    return false;
  }

  if (venda.value.precoUnitario === 0) {
    toast.warning("Informe o preço unitário");
    return false;
  }

  return true;
}

function adicionarItem() {
  if (!validarItem()) return;

  let quantidadeFinal = venda.value.quantidade;
  let unidadeFinal = unidadeMedida.value;

  if (unidadeFinal === "ml") {
    quantidadeFinal = quantidadeFinal / 1000;
    unidadeFinal = "litro";
  }

  itensVenda.value.push({
    produtoId: venda.value.produtoId,
    produtoNome: produtoSelecionado.value.nome,
    tipoAcai: venda.value.tipoAcai,
    quantidade: quantidadeFinal,
    unidade: unidadeFinal,
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
    toast.warning("Adicione pelo menos um item à venda");
    return;
  }

  const itensFormatados = itensVenda.value.map((item) => ({
    produto_id: item.produtoId,
    quantidade: item.quantidade,
    preco_unitario: item.precoUnitario,
  }));

  const dadosVenda = {
    ponto_id: authStore.user?.pontoId,
    vendedor_id: authStore.user?.id || 1,
    forma_pagamento: venda.value.formaPagamento.toLowerCase(),
    itens: itensFormatados,
  };

  registrandoVenda.value = true;

  try {
    const response = await vendasApi.criar(dadosVenda);
    if (response.success) {
      toast.success("Venda registrada com sucesso!");

      await carregarVendasHoje();
      await carregarResumoHoje();

      itensVenda.value = [];
      limparFormulario();
    } else {
      throw new Error(response.message || "Erro ao registrar venda");
    }
  } catch (error) {
    console.error("Erro ao registrar venda:", error);
    toast.error(error.message || "Erro ao registrar venda");
  } finally {
    registrandoVenda.value = false;
  }
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

function formatarQuantidade(qtd, unidade) {
  if (unidade === "ml") {
    if (qtd >= 1000) {
      return `${(qtd / 1000).toFixed(1)}L`;
    }
    return `${qtd}ml`;
  }
  return `${qtd} ${unidade}`;
}

async function carregarProdutos() {
  loadingProdutos.value = true;
  errorProdutos.value = null;

  try {
    const pontoId = authStore.user?.pontoId;
    const response = await produtosApi.listar(pontoId);

    if (response.success) {
      produtos.value = response.data;
    } else {
      throw new Error(response.message || "Erro ao carregar produtos");
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    toast.error("Erro ao carregar produtos");
  } finally {
    loadingProdutos.value = false;
  }
}

async function carregarVendasHoje() {
  try {
    const pontoId = authStore.user?.pontoId;
    const response = await vendasApi.listarHoje(pontoId);

    if (response.success) {
      vendasHoje.value = response.data.map((v) => ({
        ...v,
        data: v.data_venda,
        valorTotal: parseFloat(v.valor_total),
      }));
    }
  } catch (error) {
    console.error("Erro ao carregar vendas:", error);
  }
}

async function carregarResumoHoje() {
  try {
    const pontoId = authStore.user?.pontoId;
    const response = await vendasApi.resumoHoje(pontoId);

    if (response.success) {
      totalVendasHoje.value = response.data.total_vendas;
      totalDinheiroHoje.value = response.data.total_faturado;
    }
  } catch (error) {
    console.error("Erro ao carregar resumo:", error);
  }
}

onMounted(async () => {
  await carregarProdutos();
  await carregarVendasHoje();
  await carregarResumoHoje();
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
            readonly
            class="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
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
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Vendas de Hoje</h2>

          <div
            v-if="vendasHoje.length === 0"
            class="text-center text-gray-500 py-8"
          >
            Nenhuma venda registrada hoje
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(v, index) in vendasHoje"
              :key="index"
              class="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition"
            >
              <div class="flex items-center space-x-4">
                <div
                  class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
                >
                  <ShoppingCart :size="20" class="text-green-600" />
                </div>

                <div>
                  <p class="font-medium text-gray-800">
                    <span v-for="(item, idx) in v.itens" :key="idx">
                      {{ item.produtoNome }}
                      <span v-if="item.tipoAcai" class="text-sm text-gray-600"
                        >({{ item.tipoAcai }})</span
                      >
                      <span v-if="item.outroNome" class="text-sm text-gray-600"
                        >({{ item.outroNome }})</span
                      >
                      <span v-if="idx < v.itens.length - 1">, </span>
                    </span>
                  </p>
                  <p class="text-sm text-gray-500">
                    {{
                      new Date(v.data).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }}
                    · {{ v.formaPagamento }}
                  </p>
                </div>
              </div>

              <p class="text-lg font-semibold text-green-600">
                R$
                {{ parseFloat(v.valor_total || v.valorTotal || 0).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
