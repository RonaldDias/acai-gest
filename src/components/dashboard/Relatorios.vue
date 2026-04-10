<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import api, { produtosApi } from "@/services/api.js";
import { useAuthStore } from "@/stores/authStore.js";
import { useToastStore } from "@/stores/toastStore.js";
import {
  FileText,
  Download,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-vue-next";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();

const carregando = ref(false);
const relatorioGerado = ref(false);

const tipoRelatorio = ref("vendas");
const periodoFiltro = ref("30dias");
const dataInicio = ref("");
const dataFim = ref("");

watch(tipoRelatorio, () => {
  relatorioGerado.value = false;
});

const tiposRelatorio = [
  { valor: "vendas", label: "Relatório de Vendas" },
  { valor: "estoque", label: "Relatório de Estoque" },
  { valor: "financeiro", label: "Relatório Financeiro" },
  { valor: "geral", label: "Relatório Geral" },
];

const dadosVendas = ref({
  vendas: [],
  vendasPorDia: [],
  vendasPorHora: [],
  totais: {
    total_vendas: 0,
    valor_total: 0,
  },
});

const dadosEstoque = ref({
  produtos: [],
});

const dadosFinanceiro = ref({
  transacoes: [],
  receitasPorDia: [],
  despesasPorDia: [],
  summary: {
    revenues: 0,
    expenses: 0,
    balance: 0,
  },
});

function resolverPeriodo() {
  const hoje = new Date();
  const fim = hoje.toISOString().split("T")[0];

  if (periodoFiltro.value === "7dias") {
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - 6);
    return {
      inicio: inicio.toISOString().split("T")[0],
      fim,
    };
  }

  if (periodoFiltro.value === "30dias") {
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - 29);
    return {
      inicio: inicio.toISOString().split("T")[0],
      fim,
    };
  }

  if (periodoFiltro.value === "customizado") {
    return {
      inicio: dataInicio.value,
      fim: dataFim.value,
    };
  }

  return { inicio: fim, fim };
}

async function carregarVendas() {
  const pontoId = authStore.user?.pontoId;
  const { inicio, fim } = resolverPeriodo();

  const resposta = await api.get(
    `/relatorios/vendas?ponto_id=${pontoId}&data_inicio=${inicio}&data_fim=${fim}&agrupar=dia`,
  );

  dadosVendas.value.totais = resposta.totais;
  dadosVendas.value.vendasPorDia = resposta.data.map((item) => ({
    dia: item.periodo.split("T")[0].split("-").reverse().slice(0, 2).join("/"),
    total: parseFloat(item.valor_total),
  }));

  dadosVendas.value.vendas = resposta.data.map((item) => {
    const periodoData = item.periodo.split("T")[0];
    const itens = resposta.itensPorDia.find(
      (i) => i.periodo.split("T")[0] === periodoData,
    );
    return {
      data: periodoData.split("-").reverse().join("/"),
      produto: `${item.total_vendas} venda(s)`,
      quantidade: parseInt(itens?.total_quantidade || 0),
      valor: parseFloat(item.valor_total),
      pagamento: "-",
    };
  });

  dadosVendas.value.vendasPorHora = (resposta.vendasPorHora || []).map(
    (item) => ({
      hora: `${parseInt(item.hora)}h`,
      vendas: parseInt(item.total_vendas),
    }),
  );
}

async function carregarEstoque() {
  const pontoId = authStore.user?.pontoId;
  const resposta = await produtosApi.listar(pontoId);

  if (resposta.success) {
    dadosEstoque.value.produtos = resposta.data.map((p) => {
      const qtd = parseFloat(p.quantidade_estoque);
      const minimo = parseFloat(p.estoque_minimo);

      let status = "ok";
      if (qtd <= minimo) status = "crítico";
      else if (qtd <= minimo * 1.5) status = "baixo";

      return {
        nome: p.nome,
        quantidade: qtd,
        estoqueMinimo: minimo,
        preco: parseFloat(p.preco),
        status,
      };
    });
  }
}

async function carregarFinanceiro() {
  const pontoId = authStore.user?.pontoId;
  const { inicio, fim } = resolverPeriodo();

  const resposta = await api.get(
    `/relatorios/fluxo-caixa?ponto_id=${pontoId}&data_inicio=${inicio}&data_fim=${fim}`,
  );

  dadosFinanceiro.value.summary = resposta.summary;

  dadosFinanceiro.value.transacoes = resposta.data.map((t) => ({
    data: new Date(t.data).toLocaleDateString("pt-BR"),
    descricao: t.categoria,
    valor: parseFloat(t.valor),
    tipo: t.tipo,
  }));

  const receitasPorDia = {};
  const despesasPorDia = {};

  resposta.data.forEach((t) => {
    const dia = new Date(t.data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });

    if (t.tipo === "receita") {
      receitasPorDia[dia] = (receitasPorDia[dia] || 0) + parseFloat(t.valor);
    } else {
      despesasPorDia[dia] = (despesasPorDia[dia] || 0) + parseFloat(t.valor);
    }
  });

  const todosDias = [
    ...new Set([
      ...Object.keys(receitasPorDia),
      ...Object.keys(despesasPorDia),
    ]),
  ];
  dadosFinanceiro.value.receitasPorDia = todosDias.map((dia) => ({
    dia,
    valor: receitasPorDia[dia] || 0,
  }));
  dadosFinanceiro.value.despesasPorDia = todosDias.map((dia) => ({
    dia,
    valor: despesasPorDia[dia] || 0,
  }));
}

function cancelarAcesso() {
  router.push("/dashboard/vendas");
}

async function gerarRelatorio() {
  carregando.value = true;

  try {
    if (tipoRelatorio.value === "vendas") {
      await carregarVendas();
    } else if (tipoRelatorio.value === "estoque") {
      await carregarEstoque();
    } else if (tipoRelatorio.value === "financeiro") {
      await carregarFinanceiro();
    } else if (tipoRelatorio.value === "geral") {
      await Promise.all([
        carregarVendas(),
        carregarEstoque(),
        carregarFinanceiro(),
      ]);
    }

    relatorioGerado.value = true;
  } catch (error) {
    toastStore.error("Erro ao gerar relatório. Tente novamente.");
  } finally {
    carregando.value = false;
  }
}

function exportarPDF() {
  const doc = new jsPDF();
  const dataAtual = new Date().toLocaleDateString("pt-BR");

  doc.setFontSize(18);
  doc.text("AçaíGest - Gestão Completa", 15, 15);
  doc.setFontSize(12);
  doc.text(`Data: ${dataAtual}`, 15, 25);
  doc.text(
    `Período: ${periodoFiltro.value === "7dias" ? "Últimos 7 dias" : periodoFiltro.value === "30dias" ? "Últimos 30 dias" : `${dataInicio.value} a ${dataFim.value}`}`,
    15,
    32,
  );

  let yPos = 45;

  if (tipoRelatorio.value === "vendas") {
    doc.setFontSize(14);
    doc.text("Relatório de Vendas", 15, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text(
      `Total Vendido: R$ ${totalVendido.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      15,
      yPos,
    );
    doc.text(`Quantidade de Vendas: ${quantidadeVendas.value}`, 80, yPos);
    doc.text(
      `Ticket Médio: R$ ${ticketMedio.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      145,
      yPos,
    );
    yPos += 15;

    const vendasData = dadosVendas.value.vendas.map((v) => [
      v.data,
      v.produto,
      v.quantidade.toString(),
      `R$ ${v.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, minimumFractionDigits: 2 })}`,
      v.pagamento,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Data/Hora", "Produto", "Qtd", "Valor", "Pagamento"]],
      body: vendasData,
    });
  } else if (tipoRelatorio.value === "estoque") {
    doc.setFontSize(14);
    doc.text("Relatório de Estoque", 15, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text(
      `Valor Total: R$ ${valorTotalEstoque.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      15,
      yPos,
    );
    doc.text(`Produtos: ${produtosCadastrados.value}`, 80, yPos);
    doc.text(`Críticos: ${produtosCriticos.value}`, 145, yPos);
    yPos += 15;

    const estoqueData = dadosEstoque.value.produtos.map((p) => [
      p.nome,
      `${p.quantidade} L`,
      `${p.estoqueMinimo} L`,
      p.status === "ok" ? "Normal" : p.status === "baixo" ? "Baixo" : "Crítico",
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Produto", "Quantidade", "Máximo", "Status"]],
      body: estoqueData,
    });
  } else if (tipoRelatorio.value === "financeiro") {
    doc.setFontSize(14);
    doc.text("Relatório Financeiro", 15, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text(
      `Receitas: R$ ${totalReceitas.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      15,
      yPos,
    );
    doc.text(
      `Despesas: R$ ${totalDespesas.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      80,
      yPos,
    );
    doc.text(
      `Lucro: R$ ${lucro.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      145,
      yPos,
    );
    yPos += 15;

    const financeiroData = dadosFinanceiro.value.transacoes.map((t) => [
      t.data,
      t.tipo === "receita" ? "Receita" : "Despesa",
      t.descricao,
      `${t.tipo === "receita" ? "+" : "-"} R$ ${t.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Data", "Tipo", "Descrição", "Valor"]],
      body: financeiroData,
    });
  } else if (tipoRelatorio.value === "geral") {
    doc.setFontSize(14);
    doc.text("Relatório Geral", 15, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text("Vendas", 15, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(
      `Total: R$ ${totalVendido.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Qtd: ${quantidadeVendas.value} | Ticket Médio: R$ ${ticketMedio.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      15,
      yPos,
    );
    yPos += 12;

    doc.setFontSize(12);
    doc.text("Estoque", 15, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(
      `Valor: R$ ${valorTotalEstoque.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Produtos: ${produtosCadastrados.value} | Críticos: ${produtosCriticos.value}`,
      15,
      yPos,
    );
    yPos += 12;

    doc.setFontSize(12);
    doc.text("Financeiro", 15, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(
      `Receitas: R$ ${totalReceitas.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Despesas: R$ ${totalDespesas.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Lucro: R$ ${lucro.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      15,
      yPos,
    );
  }

  doc.save(
    `relatorio-${tipoRelatorio.value}-${dataAtual.replace(/\//g, "-")}.pdf`,
  );
}

const totalVendido = computed(() => {
  return parseFloat(dadosVendas.value.totais.valor_total || 0);
});

const quantidadeVendas = computed(() =>
  parseInt(dadosVendas.value.totais.total_vendas || 0),
);

const ticketMedio = computed(() => {
  return quantidadeVendas.value > 0
    ? totalVendido.value / quantidadeVendas.value
    : 0;
});

const valorTotalEstoque = computed(() => {
  return dadosEstoque.value.produtos.reduce(
    (sum, p) => sum + p.quantidade * (p.preco || 0),
    0,
  );
});

const produtosCadastrados = computed(() => dadosEstoque.value.produtos.length);

const produtosCriticos = computed(() => {
  return dadosEstoque.value.produtos.filter((p) => p.status === "crítico")
    .length;
});

const totalReceitas = computed(() => {
  return parseFloat(dadosFinanceiro.value.summary.revenues || 0);
});

const totalDespesas = computed(() => {
  return parseFloat(dadosFinanceiro.value.summary.expenses || 0);
});

const lucro = computed(() => {
  return parseFloat(dadosFinanceiro.value.summary.balance || 0);
});

const maxVendasHora = computed(() => {
  if (dadosVendas.value.vendasPorHora.length === 0) return 1;
  return Math.max(...dadosVendas.value.vendasPorHora.map((v) => v.vendas));
});

const maxReceitaDia = computed(() => {
  const receitas = dadosFinanceiro.value.receitasPorDia.map((r) => r.valor);
  const despesas = dadosFinanceiro.value.despesasPorDia.map((d) => d.valor);
  const todos = [...receitas, ...despesas];
  if (todos.length === 0) return 1;
  return Math.max(...todos);
});

function getBarWidth(valor, max) {
  return `${(valor / max) * 100}%`;
}

function getStatusColor(status) {
  if (status === "crítico") return "text-red-600";
  if (status === "baixo") return "text-yellow-600";
  return "text-green-600";
}

onMounted(() => {
  if (authStore.user?.role !== "dono" && !authStore.pinValidado) {
    router.push("/dashboard/vendas");
  }
});
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Relatórios</h1>
      <p class="text-gray-600 text-sm">
        Visualize e exporte relatórios do seu negócio
      </p>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Tipo de Relatório</label
          >
          <select
            v-model="tipoRelatorio"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          >
            <option
              v-for="tipo in tiposRelatorio"
              :key="tipo.valor"
              :value="tipo.valor"
            >
              {{ tipo.label }}
            </option>
          </select>
        </div>

        <div>
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
      </div>

      <div
        v-if="periodoFiltro === 'customizado'"
        class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Data Início</label
          >
          <input
            v-model="dataInicio"
            type="date"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
          />
        </div>

        <div>
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

      <button
        @click="gerarRelatorio"
        :disabled="carregando"
        class="w-full bg-purple-700 text-white py-2 rounded-lg font-semibold hover:bg-purple-800 transition flex items-center justify-center disabled:opacity-50"
      >
        <FileText :size="20" class="mr-2" />
        {{ carregando ? "Gerando..." : "Gerar Relatório" }}
      </button>
    </div>

    <div v-if="carregando" class="bg-white rounded-lg shadow p-8 text-center">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-700 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-600">Carregando dados...</p>
    </div>

    <div
      v-if="relatorioGerado && !carregando && tipoRelatorio === 'vendas'"
      class="space-y-6"
    >
      <div class="flex justify-end">
        <button
          @click="exportarPDF"
          class="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center"
        >
          <Download :size="20" class="mr-2" />
          Exportar PDF
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-green-500 text-white rounded-lg p-6">
          <p class="text-sm opacity-90">Total Vendido</p>
          <p class="text-3xl font-bold">
            R$
            {{
              totalVendido.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </p>
        </div>
        <div class="bg-blue-600 text-white rounded-lg p-6">
          <p class="text-sm opacity-90">Quantidade de Vendas</p>
          <p class="text-3xl font-bold">{{ quantidadeVendas }}</p>
        </div>
        <div class="bg-purple-700 text-white rounded-lg p-6">
          <p class="text-sm opacity-90">Ticket Médio</p>
          <p class="text-3xl font-bold">
            R$
            {{
              ticketMedio.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Vendas por Dia
          </h3>
          <div class="space-y-3">
            <div
              v-for="item in dadosVendas.vendasPorDia"
              :key="item.dia"
              class="space-y-1"
            >
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">{{ item.dia }}</span>
                <span class="font-medium"
                  >R$
                  {{
                    item.total.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  }}</span
                >
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-green-500 h-2 rounded-full"
                  :style="{ width: getBarWidth(item.total, 700) }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Horário de Pico
          </h3>
          <div class="space-y-3">
            <div
              v-for="item in dadosVendas.vendasPorHora"
              :key="item.hora"
              class="space-y-1"
            >
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">{{ item.hora }}</span>
                <span class="font-medium">{{ item.vendas }} vendas</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full"
                  :style="{ width: getBarWidth(item.vendas, maxVendasHora) }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">
            Detalhes das Vendas
          </h2>

          <div class="space-y-3">
            <div
              v-for="(venda, index) in dadosVendas.vendas"
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
                  <p class="font-medium text-gray-800">{{ venda.produto }}</p>
                  <p class="text-sm text-gray-500">
                    {{ venda.data }} - {{ venda.quantidade }} itens vendidos
                    {{ venda.pagamento }}
                  </p>
                </div>
              </div>

              <p class="text-lg font-semibold text-green-600">
                R$
                {{
                  venda.valor.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="relatorioGerado && !carregando && tipoRelatorio === 'estoque'"
      class="space-y-6"
    >
      <div class="flex justify-end">
        <button
          @click="exportarPDF"
          class="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center"
        >
          <Download :size="20" class="mr-2" />
          Exportar PDF
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-purple-700 text-white rounded-lg p-6">
          <p class="text-sm opacity-90">Valor Total em Estoque</p>
          <p class="text-3xl font-bold">
            R$
            {{
              valorTotalEstoque.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </p>
        </div>
        <div class="bg-blue-600 text-white rounded-lg p-6">
          <p class="text-sm opacity-90">Produtos Cadastrados</p>
          <p class="text-3xl font-bold">{{ produtosCadastrados }}</p>
        </div>
        <div class="bg-red-500 text-white rounded-lg p-6">
          <p class="text-sm opacity-90">Produtos Críticos</p>
          <p class="text-3xl font-bold">{{ produtosCriticos }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">
            Produtos em Estoque
          </h2>

          <div class="space-y-3">
            <div
              v-for="produto in dadosEstoque.produtos"
              :key="produto.nome"
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
                    {{ produto.quantidade }}L de {{ produto.estoqueMinimo }}L
                    máximo
                  </p>
                </div>
              </div>

              <span :class="['font-semibold', getStatusColor(produto.status)]">
                {{
                  produto.status === "ok"
                    ? "Normal"
                    : produto.status === "baixo"
                      ? "Baixo"
                      : "Crítico"
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="relatorioGerado && !carregando && tipoRelatorio === 'financeiro'"
      class="space-y-6"
    >
      <div class="flex justify-end">
        <button
          @click="exportarPDF"
          class="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center"
        >
          <Download :size="20" class="mr-2" />
          Exportar PDF
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-green-500 text-white rounded-lg p-6">
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
        <div class="bg-red-500 text-white rounded-lg p-6">
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
        <div
          :class="[
            'text-white rounded-lg p-6',
            lucro >= 0 ? 'bg-blue-600' : 'bg-orange-500',
          ]"
        >
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

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
          Receitas x Despesas
        </h3>
        <div class="space-y-4">
          <div
            v-for="(item, index) in dadosFinanceiro.receitasPorDia"
            :key="index"
            class="space-y-2"
          >
            <p class="text-sm text-gray-600">{{ item.dia }}</p>
            <div class="space-y-1">
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-600 w-20">Receitas:</span>
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-green-500 h-2 rounded-full"
                    :style="{ width: getBarWidth(item.valor, maxReceitaDia) }"
                  ></div>
                </div>
                <span class="text-sm font-medium w-24 text-right"
                  >R$
                  {{
                    item.valor.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  }}</span
                >
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-600 w-20">Despesas:</span>
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-red-500 h-2 rounded-full"
                    :style="{
                      width: getBarWidth(
                        dadosFinanceiro.despesasPorDia[index].valor,
                        maxReceitaDia,
                      ),
                    }"
                  ></div>
                </div>
                <span class="text-sm font-medium w-24 text-right"
                  >R$
                  {{
                    dadosFinanceiro.despesasPorDia[index].valor.toLocaleString(
                      "pt-BR",
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                    )
                  }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">
            Histórico de Transações
          </h2>

          <div class="space-y-3">
            <div
              v-for="(transacao, index) in dadosFinanceiro.transacoes"
              :key="index"
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
                    {{ transacao.descricao }}
                  </p>
                  <p class="text-sm text-gray-500">{{ transacao.data }}</p>
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
                  transacao.valor.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="relatorioGerado && !carregando && tipoRelatorio === 'geral'"
      class="space-y-6"
    >
      <div class="flex justify-end">
        <button
          @click="exportarPDF"
          class="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center"
        >
          <Download :size="20" class="mr-2" />
          Exportar PDF
        </button>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <ShoppingCart :size="20" class="mr-2" />
          Resumo de Vendas
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-green-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">Total Vendido</p>
            <p class="text-2xl font-bold text-green-600">
              R$
              {{
                totalVendido.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </p>
          </div>
          <div class="bg-blue-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">Qtd Vendas</p>
            <p class="text-2xl font-bold text-blue-600">
              {{ quantidadeVendas }}
            </p>
          </div>
          <div class="bg-purple-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">Ticket Médio</p>
            <p class="text-2xl font-bold text-purple-600">
              R$
              {{
                ticketMedio.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Package :size="20" class="mr-2" />
          Resumo de Estoque
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-purple-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">Valor em Estoque</p>
            <p class="text-2xl font-bold text-purple-600">
              R$
              {{
                valorTotalEstoque.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </p>
          </div>
          <div class="bg-blue-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">Produtos</p>
            <p class="text-2xl font-bold text-blue-600">
              {{ produtosCadastrados }}
            </p>
          </div>
          <div class="bg-red-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">Produtos Críticos</p>
            <p class="text-2xl font-bold text-red-600">
              {{ produtosCriticos }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <DollarSign :size="20" class="mr-2" />
          Resumo Financeiro
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-green-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">Receitas</p>
            <p class="text-2xl font-bold text-green-600">
              R$
              {{
                totalReceitas.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </p>
          </div>
          <div class="bg-red-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">Despesas</p>
            <p class="text-2xl font-bold text-red-600">
              R$
              {{
                totalDespesas.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </p>
          </div>
          <div
            :class="[
              'rounded-lg p-4',
              lucro >= 0 ? 'bg-blue-50' : 'bg-orange-50',
            ]"
          >
            <p class="text-sm text-gray-600">Lucro</p>
            <p
              :class="[
                'text-2xl font-bold',
                lucro >= 0 ? 'text-blue-600' : 'text-orange-600',
              ]"
            >
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
    </div>
  </div>
</template>
