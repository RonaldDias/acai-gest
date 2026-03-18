<script setup>
import { ref, computed, onMounted } from "vue";
import { Package, DollarSign, Plus, Minus, Search } from "lucide-vue-next";
import { useToastStore } from "@/stores/toastStore";
import { useAuthStore } from "@/stores/authStore";
import { produtosApi } from "@/services/api";

const authStore = useAuthStore();
const toast = useToastStore();

const produtos = ref([]);
const carregando = ref(false);
const produtoEditando = ref(null);

const mostrarFormulario = ref(false);
const novoItem = ref({
  nome: "",
  outroNome: "",
  tipo: "",
  quantidade: 0,
  estoqueMinimo: 0,
  custo: null,
  unidade: "L",
  precoUnitario: 0,
});

const mostrarFormEntrada = ref(false);
const entradaEstoque = ref({
  produto_id: null,
  quantidade: 0,
  custo: null,
  observacao: "",
});

const produtosBase = [
  "Açaí",
  "Farinha de Tapioca",
  "Farinha de Mandioca",
  "Outro",
];
const unidades = ["L", "Kg", "un"];

const tipos = ["grosso", "médio", "popular", "outro"];

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

function abrirFormEdicao(produto) {
  produtoEditando.value = { ...produto };
}

async function salvarEdicao() {
  try {
    const data = await produtosApi.atualizar(produtoEditando.value.id, {
      nome: produtoEditando.value.nome,
      preco: produtoEditando.value.precoUnitario,
      estoque_minimo: produtoEditando.value.estoqueMinimo,
    });

    if (data.success) {
      const index = produtos.value.findIndex(
        (p) => p.id === produtoEditando.value.id,
      );
      if (index !== -1) {
        produtos.value[index] = {
          ...produtos.value[index],
          nome: data.data.nome,
          precoUnitario: parseFloat(data.data.preco),
          estoqueMinimo: parseFloat(data.data.estoque_minimo),
        };
      }

      produtoEditando.value = null;
      toast.success("Produto atualizado com sucesso!");
    }
  } catch (error) {
    toast.error("Erro ao atualizar produto.");
  }
}

async function adicionarItem() {
  const nome =
    novoItem.value.nome === "Outro"
      ? novoItem.value.outroNome
      : novoItem.value.nome;

  if (
    !nome ||
    !novoItem.value.tipo ||
    !novoItem.value.unidade ||
    !novoItem.value.precoUnitario
  ) {
    toast.warning("Preencha todos os campos obrigatórios.");
    return;
  }

  const unidadeMap = { L: "litro", Kg: "kg", un: "unidade" };

  try {
    const data = await produtosApi.criar({
      ponto_id: authStore.user?.pontoId,
      nome,
      tipo: novoItem.value.tipo,
      unidade: unidadeMap[novoItem.value.unidade],
      preco: novoItem.value.precoUnitario,
      quantidade_inicial: novoItem.value.quantidade,
      estoque_minimo: novoItem.value.estoqueMinimo,
      custo: novoItem.value.custo ? parseFloat(novoItem.value.custo) : null,
    });

    if (data.success) {
      produtos.value.push({
        id: data.data.id,
        nome: data.data.nome,
        quantidade: parseFloat(data.data.quantidade_estoque),
        estoqueMinimo: parseFloat(data.data.estoque_minimo),
        unidade: novoItem.value.unidade,
        precoUnitario: parseFloat(data.data.preco),
      });

      toast.success("Produto adicionado com sucesso!");
      fecharForm();
    }
  } catch (error) {
    toast.error("Erro ao adicionar produto.");
  }
}

function abrirFormAdicionarItem() {
  mostrarFormEntrada.value = false;
  mostrarFormulario.value = true;
}

function fecharForm() {
  mostrarFormulario.value = false;
  novoItem.value = {
    nome: "",
    outroNome: "",
    tipo: "",
    quantidade: 0,
    estoqueMinimo: 0,
    custo: null,
    unidade: "L",
    precoUnitario: 0,
  };
}

function abrirFormEntrada() {
  mostrarFormulario.value = false;
  mostrarFormEntrada.value = true;
}

function fecharFormEntrada() {
  mostrarFormEntrada.value = false;
  entradaEstoque.value = {
    produto_id: null,
    quantidade: 0,
    custo: null,
    observacao: "",
  };
}

async function registrarEntrada() {
  if (
    entradaEstoque.value.produto_id === null ||
    !entradaEstoque.value.quantidade ||
    entradaEstoque.value.quantidade <= 0
  ) {
    toast.error("Preencha todos os campos obrigatórios");
    return;
  }

  try {
    const data = await produtosApi.entrada({
      produto_id: entradaEstoque.value.produto_id,
      quantidade: parseFloat(entradaEstoque.value.quantidade),
      custo: entradaEstoque.value.custo
        ? parseFloat(entradaEstoque.value.custo)
        : null,
      observacao: entradaEstoque.value.observacao || null,
    });

    if (data.success) {
      toast.success("Entrada registrada com sucesso!");

      const produtoAtualizado = data.data.produto;
      const index = produtos.value.findIndex(
        (p) => p.id === produtoAtualizado.id,
      );

      if (index !== -1) {
        produtos.value[index].quantidade = parseFloat(
          produtoAtualizado.quantidade_estoque,
        );
      }

      fecharFormEntrada();
    } else {
      toast.error("Erro: " + data.message);
    }
  } catch (error) {
    console.error("Erro ao registrar entrada:", error);
    toast.error("Erro ao conectar com o servidor.");
  }
}

function getStatusEstoque(produto) {
  if (produto.quantidade <= produto.estoqueMinimo) {
    return { classe: "bg-red-100 text-red-800", label: "Crítico" };
  } else if (produto.quantidade <= produto.estoqueMinimo * 1.5) {
    return { classe: "bg-yellow-100 text-yellow-800", label: "Baixo" };
  }
  return null;
}

function valorTotalProduto(produto) {
  return produto.quantidade * produto.precoUnitario;
}

async function desativarProduto(id) {
  try {
    const data = await produtosApi.desativar(id);

    if (data.success) {
      produtos.value = produtos.value.filter((p) => p.id !== id);
      toast.success("Produto desativado com sucesso!");
    }
  } catch (error) {
    toast.error("Erro ao desativar produto.");
  }
}

onMounted(async () => {
  carregando.value = true;
  try {
    const pontoId = authStore.user?.pontoId;
    const data = await produtosApi.listar(pontoId);

    if (data.success) {
      produtos.value = data.data.map((p) => ({
        id: p.id,
        nome: p.nome,
        tipo: p.tipo,
        quantidade: parseFloat(p.quantidade_estoque),
        estoqueMinimo: parseFloat(p.estoque_minimo),
        unidade: p.unidade === "litro" ? "L" : p.unidade === "kg" ? "kg" : "un",
        precoUnitario: parseFloat(p.preco),
      }));
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    toast.error("Erro ao carregar produtos");
  } finally {
    carregando.value = false;
  }
});
</script>

<template>
  <div v-if="carregando" class="text-center py-8">
    <p class="text-gray-600">Carregando produtos...</p>
  </div>
  <div class="space-y-6">
    <div class="flex gap-2 items-end justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Controle de Estoque</h1>
        <p class="text-gray-600 text-sm">Gerencie seus produtos e insumos</p>
      </div>

      <div class="flex gap-2">
        <button
          @click="abrirFormEntrada"
          class="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center"
        >
          <Plus :size="20" class="mr-2" />
          Entrada de Estoque
        </button>
        <button
          @click="abrirFormAdicionarItem"
          class="bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-800 transition flex items-center"
        >
          <Plus :size="20" class="mr-2" />
          Adicionar Item
        </button>
      </div>
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

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Tipo</label
          >
          <select
            v-model="novoItem.tipo"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          >
            <option value="">Selecione...</option>
            <option v-for="tipo in tipos" :key="tipo" :value="tipo">
              {{ tipo.charAt(0).toUpperCase() + tipo.slice(1) }}
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
              >Custo total (R$)</label
            >
            <input
              v-model.number="novoItem.custo"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ex: 150.00"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Estoque Mínimo</label
            >
            <input
              v-model.number="novoItem.estoqueMinimo"
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

    <div v-if="mostrarFormEntrada" class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">Entrada de Estoque</h2>
        <button
          @click="fecharFormEntrada"
          class="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Produto *
          </label>
          <select
            v-model="entradaEstoque.produto_id"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          >
            <option :value="null">Selecione o produto...</option>
            <option v-for="prod in produtos" :key="prod.id" :value="prod.id">
              {{ prod.nome }} ({{ prod.quantidade }} {{ prod.unidade }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Quantidade a adicionar *
          </label>
          <input
            v-model.number="entradaEstoque.quantidade"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex: 10"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Custo total (R$)
          </label>
          <input
            v-model.number="entradaEstoque.custo"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex: 150.00"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Observação
          </label>
          <textarea
            v-model="entradaEstoque.observacao"
            rows="3"
            placeholder="Ex: Compra do fornecedor João"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          ></textarea>
        </div>

        <button
          @click="registrarEntrada"
          class="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Registrar Entrada
        </button>
      </div>
    </div>

    <div v-if="produtoEditando" class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">Editar Produto</h2>
        <button
          @click="produtoEditando = null"
          class="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Nome</label
          >
          <input
            v-model="produtoEditando.nome"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Preço (R$)</label
            >
            <input
              v-model.number="produtoEditando.precoUnitario"
              type="number"
              min="0"
              step="0.01"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Estoque Mínimo</label
            >
            <input
              v-model.number="produtoEditando.estoqueMinimo"
              type="number"
              min="0"
              step="0.01"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
            />
          </div>
        </div>

        <button
          @click="salvarEdicao"
          class="w-full bg-purple-700 text-white py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
        >
          Salvar Alterações
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
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Produtos em Estoque</h2>

          <div
            v-if="produtosFiltrados.length === 0"
            class="text-center text-gray-500 py-8"
          >
            Nenhum produto encontrado
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="produto in produtosFiltrados"
              :key="produto.id"
              class="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition"
            >
              <div class="flex items-center space-x-4">
                <div
                  class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"
                >
                  <Package :size="20" class="text-purple-600" />
                </div>

                <div>
                  <p class="font-medium text-gray-800">{{ produto.nome }}</p>
                  <p class="text-sm text-gray-500">
                    {{ produto.tipo }} · {{ produto.quantidade }}
                    {{ produto.unidade }} · R$
                    {{ produto.precoUnitario.toFixed(2) }}/un
                    <span
                      v-if="getStatusEstoque(produto)"
                      :class="[
                        'ml-2 px-2 py-1 rounded text-xs font-medium',
                        getStatusEstoque(produto).classe,
                      ]"
                    >
                      {{ getStatusEstoque(produto).label }}
                    </span>
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <p class="text-lg font-semibold text-gray-800">
                  R$ {{ valorTotalProduto(produto).toFixed(2) }}
                </p>
                <button
                  @click="abrirFormEdicao(produto)"
                  class="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  Editar
                </button>
                <button
                  @click="desativarProduto(produto.id)"
                  class="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Desativar
                </button>
              </div>
            </div>
          </div>
        </div>
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
