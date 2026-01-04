<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { FileText, Download } from "lucide-vue-next";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const router = useRouter();
const authStore = useAuthStore();

const carregando = ref(false);
const relatorioGerado = ref(false);

const acessoLiberado = ref(false);
const mostrarModalPin = ref(false);
const pinDigitado = ref("");
const tentativasRestantes = ref(3);
const erroPin = ref("");

// TODO Backend: PIN virá da API do dono
const PIN_TEMPORARIO = "1234";

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

// Dados temporários (TODO Backend: virão da API)
const dadosVendas = ref({
  vendas: [
    {
      data: "2025-01-02 10:30",
      produto: "Açaí Grosso 1L",
      quantidade: 1,
      valor: 25.0,
      pagamento: "PIX",
    },
    {
      data: "2025-01-02 11:45",
      produto: "Açaí Médio 500ml",
      quantidade: 1,
      valor: 10.0,
      pagamento: "Dinheiro",
    },
    {
      data: "2025-01-02 14:20",
      produto: "Açaí Popular 1L",
      quantidade: 2,
      valor: 30.0,
      pagamento: "Débito",
    },
  ],
  vendasPorDia: [
    { dia: "01/01", total: 450 },
    { dia: "02/01", total: 680 },
    { dia: "03/01", total: 520 },
  ],
  vendasPorHora: [
    { hora: "10h", vendas: 5 },
    { hora: "11h", vendas: 8 },
    { hora: "12h", vendas: 15 },
    { hora: "13h", vendas: 12 },
    { hora: "14h", vendas: 18 },
    { hora: "15h", vendas: 10 },
  ],
});

const dadosEstoque = ref({
  produtos: [
    { nome: "Açaí", quantidade: 45, estoqueMaximo: 100, status: "baixo" },
    { nome: "Farinha", quantidade: 18, estoqueMaximo: 50, status: "crítico" },
    { nome: "Tapioca", quantidade: 35, estoqueMaximo: 80, status: "ok" },
  ],
});

const dadosFinanceiro = ref({
  transacoes: [
    {
      data: "2025-01-02",
      tipo: "receita",
      descricao: "Vendas do dia",
      valor: 850.0,
    },
    { data: "2025-01-02", tipo: "despesa", descricao: "Energia", valor: 280.0 },
    {
      data: "2025-01-01",
      tipo: "despesa",
      descricao: "Compra Açaí",
      valor: 1200.0,
    },
  ],
  receitasPorDia: [
    { dia: "01/01", valor: 450 },
    { dia: "02/01", valor: 850 },
    { dia: "03/01", valor: 620 },
  ],
  despesasPorDia: [
    { dia: "01/01", valor: 1200 },
    { dia: "02/01", valor: 280 },
    { dia: "03/01", valor: 150 },
  ],
});

function validarPin() {
  if (pinDigitado.value === PIN_TEMPORARIO) {
    acessoLiberado.value = true;
    mostrarModalPin.value = false;
    erroPin.value = "";
    authStore.validarPin();
  } else {
    tentativasRestantes.value--;

    if (tentativasRestantes.value === 0) {
      router.push("/dashboard/vendas");
    } else {
      erroPin.value = `PIN incorreto. ${tentativasRestantes.value} tentativa(s) restante(s).`;
      pinDigitado.value = "";
    }
  }
}

function cancelarAcesso() {
  router.push("/dashboard/vendas");
}

async function gerarRelatorio() {
  carregando.value = true;

  // TODO Backend: GET /api/reports/${tipoRelatorio.value}?periodo=${periodoFiltro.value}
  // Simular delay de API

  await new Promise((resolve) => setTimeout(resolve, 1000));

  relatorioGerado.value = true;
  carregando.value = false;
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
    doc.text(`Total Vendido: R$ ${totalVendido.value.toFixed(2)}`, 15, yPos);
    doc.text(`Quantidade de Vendas: ${quantidadeVendas.value}`, 80, yPos);
    doc.text(`Ticket Médio: R$ ${ticketMedio.value.toFixed(2)}`, 145, yPos);
    yPos += 15;

    const vendasData = dadosVendas.value.vendas.map((v) => [
      v.data,
      v.produto,
      v.quantidade.toString(),
      `R$ ${v.valor.toFixed(2)}`,
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
    doc.text(`Valor Total: R$ ${valorTotalEstoque.value.toFixed(2)}`, 15, yPos);
    doc.text(`Produtos: ${produtosCadastrados.value}`, 80, yPos);
    doc.text(`Críticos: ${produtosCriticos.value}`, 145, yPos);
    yPos += 15;

    const estoqueData = dadosEstoque.value.produtos.map((p) => [
      p.nome,
      `${p.quantidade} L`,
      `${p.estoqueMaximo} L`,
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
    doc.text(`Receitas: R$ ${totalReceitas.value.toFixed(2)}`, 15, yPos);
    doc.text(`Despesas: R$ ${totalDespesas.value.toFixed(2)}`, 80, yPos);
    doc.text(`Lucro: R$ ${lucro.value.toFixed(2)}`, 145, yPos);
    yPos += 15;

    const financeiroData = dadosFinanceiro.value.transacoes.map((t) => [
      t.data,
      t.tipo === "receita" ? "Receita" : "Despesa",
      t.descricao,
      `${t.tipo === "receita" ? "+" : "-"} R$ ${t.valor.toFixed(2)}`,
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
      `Total: R$ ${totalVendido.value.toFixed(2)} | Qtd: ${quantidadeVendas.value} | Ticket Médio: R$ ${ticketMedio.value.toFixed(2)}`,
      15,
      yPos,
    );
    yPos += 12;

    doc.setFontSize(12);
    doc.text("Estoque", 15, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(
      `Valor: R$ ${valorTotalEstoque.value.toFixed(2)} | Produtos: ${produtosCadastrados.value} | Críticos: ${produtosCriticos.value}`,
      15,
      yPos,
    );
    yPos += 12;

    doc.setFontSize(12);
    doc.text("Financeiro", 15, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(
      `Receitas: R$ ${totalReceitas.value.toFixed(2)} | Despesas: R$ ${totalDespesas.value.toFixed(2)} | Lucro: R$ ${lucro.value.toFixed(2)}`,
      15,
      yPos,
    );
  }

  doc.save(
    `relatorio-${tipoRelatorio.value}-${dataAtual.replace(/\//g, "-")}.pdf`,
  );
}

const totalVendido = computed(() => {
  return dadosVendas.value.vendas.reduce((sum, v) => sum + v.valor, 0);
});

const quantidadeVendas = computed(() => dadosVendas.value.vendas.length);

const ticketMedio = computed(() => {
  return quantidadeVendas.value > 0
    ? totalVendido.value / quantidadeVendas.value
    : 0;
});

const valorTotalEstoque = computed(() => {
  return dadosEstoque.value.produtos.reduce(
    (sum, p) => sum + p.quantidade * 28.5,
    0,
  );
});

const produtosCadastrados = computed(() => dadosEstoque.value.produtos.length);

const produtosCriticos = computed(() => {
  return dadosEstoque.value.produtos.filter((p) => p.status === "crítico")
    .length;
});

const totalReceitas = computed(() => {
  return dadosFinanceiro.value.transacoes
    .filter((t) => t.tipo === "receita")
    .reduce((sum, t) => sum + t.valor, 0);
});

const totalDespesas = computed(() => {
  return dadosFinanceiro.value.transacoes
    .filter((t) => t.tipo === "despesa")
    .reduce((sum, t) => sum + t.valor, 0);
});

const lucro = computed(() => totalReceitas.value - totalDespesas.value);

const maxVendasHora = computed(() => {
  return Math.max(...dadosVendas.value.vendasPorHora.map((v) => v.vendas));
});

const maxReceitaDia = computed(() => {
  const maxReceita = Math.max(
    ...dadosFinanceiro.value.receitasPorDia.map((r) => r.valor),
  );
  const maxDespesa = Math.max(
    ...dadosFinanceiro.value.despesasPorDia.map((d) => d.valor),
  );
  return Math.max(maxReceita, maxDespesa);
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
  if (authStore.user?.role === "dono") {
    acessoLiberado.value = true;
  } else if (authStore.pinValidado) {
    acessoLiberado.value = true;
  } else {
    mostrarModalPin.value = true;
  }

  // TODO Backend: GET /api/relatorios
});
</script>

<template>
  <div
    v-if="mostrarModalPin"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
      <p class="text-gray-600 mb-4">
        Esta área é exclusiva para donos. Insira o PIN de segurança para
        continuar.
      </p>

      <input
        v-model="pinDigitado"
        type="password"
        maxlength="4"
        placeholder="Digite o PIN"
        class="w-full border border-gray-300 rounded px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:border-purple-600 mb-2"
        @keyup.enter="validarPin"
      />

      <p v-if="erroPin" class="text-red-600 text-sm mb-4">{{ erroPin }}</p>

      <div class="flex space-x-3">
        <button
          @click="cancelarAcesso"
          class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
        >
          Cancelar
        </button>
        <button
          @click="validarPin"
          class="flex-1 bg-purple-700 text-white py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>

  <div v-if="acessoLiberado" class="space-y-6">
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
          <p class="text-3xl font-bold">R$ {{ totalVendido.toFixed(2) }}</p>
        </div>
        <div class="bg-blue-600 text-white rounded-lg p-6">
          <p class="text-sm opacity-90">Quantidade de Vendas</p>
          <p class="text-3xl font-bold">{{ quantidadeVendas }}</p>
        </div>
        <div class="bg-purple-700 text-white rounded-lg p-6">
          <p class="text-sm opacity-90">Ticket Médio</p>
          <p class="text-3xl font-bold">R$ {{ ticketMedio.toFixed(2) }}</p>
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
                <span class="font-medium">R$ {{ item.total.toFixed(2) }}</span>
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
                    {{ venda.data }} · {{ venda.quantidade }}x ·
                    {{ venda.pagamento }}
                  </p>
                </div>
              </div>

              <p class="text-lg font-semibold text-green-600">
                R$ {{ venda.valor.toFixed(2) }}
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
            R$ {{ valorTotalEstoque.toFixed(2) }}
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
                    {{ produto.quantidade }}L de {{ produto.estoqueMaximo }}L
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
          <p class="text-3xl font-bold">R$ {{ totalReceitas.toFixed(2) }}</p>
        </div>
        <div class="bg-red-500 text-white rounded-lg p-6">
          <p class="text-sm opacity-90">Despesas</p>
          <p class="text-3xl font-bold">R$ {{ totalDespesas.toFixed(2) }}</p>
        </div>
        <div
          :class="[
            'text-white rounded-lg p-6',
            lucro >= 0 ? 'bg-blue-600' : 'bg-orange-500',
          ]"
        >
          <p class="text-sm opacity-90">Lucro</p>
          <p class="text-3xl font-bold">R$ {{ lucro.toFixed(2) }}</p>
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
                  >R$ {{ item.valor.toFixed(2) }}</span
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
                    dadosFinanceiro.despesasPorDia[index].valor.toFixed(2)
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
                {{ transacao.valor.toFixed(2) }}
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
              R$ {{ totalVendido.toFixed(2) }}
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
              R$ {{ ticketMedio.toFixed(2) }}
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
              R$ {{ valorTotalEstoque.toFixed(2) }}
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
              R$ {{ totalReceitas.toFixed(2) }}
            </p>
          </div>
          <div class="bg-red-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">Despesas</p>
            <p class="text-2xl font-bold text-red-600">
              R$ {{ totalDespesas.toFixed(2) }}
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
              R$ {{ lucro.toFixed(2) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
