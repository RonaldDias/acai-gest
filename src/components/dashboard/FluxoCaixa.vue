<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import api from "@/services/api";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Calendar,
} from "lucide-vue-next";
import { useToastStore } from "@/stores/toastStore";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToastStore();
const summary = ref({});

const mostrarFormulario = ref(false);
const categoriasDespesa = [
  "Energia",
  "Água",
  "Aluguel",
  "Salários",
  "Compra de Insumos",
  "Manutenção",
  "Impostos",
  "Outros",
];

const novaDespesa = ref({
  categoria: "",
  descricao: "",
  valor: 0,
  data: new Date().toISOString().split("T")[0],
});

const periodoFiltro = ref("7dias");
const dataInicio = ref("");
const dataFim = ref("");

watch(periodoFiltro, () => {
  carregarFluxo();
});

watch([dataInicio, dataFim], () => {
  if (
    periodoFiltro.value === "customizado" &&
    dataInicio.value &&
    dataFim.value
  ) {
    carregarFluxo();
  }
});

function resolverPeriodo() {
  const hoje = new Date();
  const fim = hoje.toISOString().split("T")[0];

  if (periodoFiltro.value === "hoje") {
    return { inicio: fim, fim };
  }

  if (periodoFiltro.value === "7dias") {
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - 6);
    return { inicio: inicio.toISOString().split("T")[0], fim };
  }

  if (periodoFiltro.value === "30dias") {
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - 29);
    return { inicio: inicio.toISOString().split("T")[0], fim };
  }

  if (periodoFiltro.value === "customizado") {
    return { inicio: dataInicio.value, fim: dataFim.value };
  }
}

const transacoes = ref([]);

const totalReceitas = computed(() => summary.value.revenues ?? 0);

const totalDespesas = computed(() => summary.value.expenses ?? 0);

const lucro = computed(() => summary.value.balance ?? 0);

const transacoesFiltradas = computed(() => {
  return [...transacoes.value].sort(
    (a, b) => new Date(b.data) - new Date(a.data),
  );
});

async function carregarFluxo() {
  const pontoId = authStore.user?.pontoId;
  const { inicio, fim } = resolverPeriodo();

  const resposta = await api.get(
    `/relatorios/fluxo-caixa?ponto_id=${pontoId}&data_inicio=${inicio}&data_fim=${fim}`,
  );

  transacoes.value = resposta.data;
  summary.value = resposta.summary;
}

function abrirFormulario() {
  mostrarFormulario.value = true;
}

function fecharFormulario() {
  mostrarFormulario.value = false;
  novaDespesa.value = {
    categoria: "",
    descricao: "",
    valor: 0,
    data: new Date().toISOString().split("T")[0],
  };
}

async function registrarDespesa() {
  const pontoId = authStore.user?.pontoId;

  await api.post("/despesas", {
    ponto_id: pontoId,
    categoria: novaDespesa.value.categoria,
    descricao: novaDespesa.value.descricao,
    valor: novaDespesa.value.valor,
    data: novaDespesa.value.data,
  });

  await carregarFluxo();
  fecharFormulario();
  toast.success("Despesa registrada com sucesso!");
}

function formatarData(data) {
  const [ano, mes, dia] = data.split("T")[0].split("-");
  return `${dia}/${mes}/${ano}`;
}

onMounted(() => {
  carregarFluxo();
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Fluxo de Caixa</h1>
        <p class="text-gray-600 text-sm">Controle financeiro completo</p>
      </div>
      <button
        @click="abrirFormulario"
        class="bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-800 transition flex items-center"
      >
        <Plus :size="20" class="mr-2" />
        Registrar Despesa
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        class="bg-green-500 text-white rounded-lg p-6 flex items-center space-x-4"
      >
        <TrendingUp :size="40" />
        <div>
          <p class="text-sm opacity-90">Receitas</p>
          <p class="text-3xl font-bold">
            R$
            {{
              totalReceitas.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </p>
        </div>
      </div>

      <div
        class="bg-red-500 text-white rounded-lg p-6 flex items-center space-x-4"
      >
        <TrendingDown :size="40" />
        <div>
          <p class="text-sm opacity-90">Despesas</p>
          <p class="text-3xl font-bold">
            R$
            {{
              totalDespesas.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </p>
        </div>
      </div>

      <div
        :class="[
          'text-white rounded-lg p-6 flex items-center space-x-4',
          lucro >= 0 ? 'bg-blue-600' : 'bg-orange-500',
        ]"
      >
        <DollarSign :size="40" />
        <div>
          <p class="text-sm opacity-90">Lucro</p>
          <p class="text-3xl font-bold">
            R$
            {{
              lucro.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="mostrarFormulario" class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">
          Registrar Nova Despesa
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
            >Categoria</label
          >
          <select
            v-model="novaDespesa.categoria"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          >
            <option value="">Selecione...</option>
            <option v-for="cat in categoriasDespesa" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Descrição</label
          >
          <input
            v-model="novaDespesa.descricao"
            type="text"
            placeholder="Ex: Conta de luz - Janeiro"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Valor (R$)</label
            >
            <input
              v-model.number="novaDespesa.valor"
              type="number"
              min="0"
              step="0.01"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Data</label
            >
            <input
              v-model="novaDespesa.data"
              type="date"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
            />
          </div>
        </div>

        <button
          @click="registrarDespesa"
          class="w-full bg-purple-700 text-white py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
        >
          Registrar Despesa
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Período</label
          >
          <select
            v-model="periodoFiltro"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          >
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
            <option value="customizado">Período customizado</option>
          </select>
        </div>

        <div v-if="periodoFiltro === 'customizado'" class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Data Início</label
          >
          <input
            v-model="dataInicio"
            type="date"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          />
        </div>

        <div v-if="periodoFiltro === 'customizado'" class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Data Fim</label
          >
          <input
            v-model="dataFim"
            type="date"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          />
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">
            Histórico de Transações
          </h2>

          <div class="space-y-3">
            <div
              v-for="transacao in transacoesFiltradas"
              :key="transacao.id"
              class="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition"
            >
              <div class="flex items-center space-x-4">
                <div
                  :class="[
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    transacao.tipo === 'receita'
                      ? 'bg-green-100'
                      : 'bg-red-100',
                  ]"
                >
                  <TrendingUp
                    v-if="transacao.tipo === 'receita'"
                    :size="20"
                    class="text-green-600"
                  />
                  <TrendingDown v-else :size="20" class="text-red-600" />
                </div>

                <div>
                  <p class="font-medium text-gray-800">
                    {{ transacao.categoria }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ transacao.categoria }} ·
                    {{ formatarData(transacao.data).split(",")[0] }}
                  </p>
                </div>
              </div>

              <p
                :class="[
                  'text-lg font-semibold',
                  transacao.tipo === 'receita'
                    ? 'text-green-600'
                    : 'text-red-600',
                ]"
              >
                {{ transacao.tipo === "receita" ? "+" : "-" }} R$
                {{
                  parseFloat(transacao.valor).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                }}
              </p>
            </div>
          </div>

          <div
            v-if="transacoesFiltradas.length === 0"
            class="text-center py-8 text-gray-500"
          >
            Nenhuma transação encontrada
          </div>
        </div>
      </div>

      <div
        v-if="transacoesFiltradas.length === 0"
        class="text-center py-8 text-gray-500"
      >
        Nenhuma transação encontrada
      </div>
    </div>
  </div>
</template>
