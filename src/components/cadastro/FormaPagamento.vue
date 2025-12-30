<script setup>
import { ref, computed, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useCadastroStore } from "../../stores/cadastroStore";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/services/api";

const authStore = useAuthStore();
const erro = ref("");
const enviando = ref(false);

const cadastro = useCadastroStore();
const router = useRouter();
const emit = defineEmits(["next", "back"]);

const forma = ref("");
const processing = ref(false);
const paymentOk = ref(false);

const qrDataUrl = ref("");
const pixPayload = ref("");
let pollingInterval = null;
let simulatePixResolveTimeout = null;

const preco = computed(() => {
  const plano = cadastro.dados?.plano?.tipoPlano || "basic";
  return plano === "top" ? 249.9 : 149.9;
});

function generateQrSvgDataUrl(payload) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
    <rect width='100%' height='100%' fill='#fff'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='#333'>
      ${payload.replace(/</g, "&lt;")}
    </text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function gerarPix() {
  const payload = `ACAI|${Date.now()}|R$${preco.value.toFixed(2)}`;
  pixPayload.value = payload;
  qrDataUrl.value = generateQrSvgDataUrl(payload);
}

function startPixPolling() {
  stopPixPolling();

  simulatePixResolveTimeout = setTimeout(() => {
    paymentOk.value = true;
    stopPixPolling();
  }, 8000);

  pollingInterval = setInterval(async () => {
    // TODO: backend call to verify PIX payment status
    if (paymentOk.value) {
      stopPixPolling();
    }
  }, 2000);
}

function stopPixPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  if (simulatePixResolveTimeout) {
    clearTimeout(simulatePixResolveTimeout);
    simulatePixResolveTimeout = null;
  }
}

async function processarCartao() {
  processing.value = true;
  await new Promise((r) => setTimeout(r, 1800));
  processing.value = false;
  paymentOk.value = true;
  // TODO: implement real card payment processing with backend
}

function onSelectForma(value) {
  forma.value = value;
  paymentOk.value = false;
  qrDataUrl.value = "";
  pixPayload.value = "";
  stopPixPolling();
  if (value === "pix") {
    gerarPix();
    startPixPolling();
  }
}

const mostrarModal = ref(false);

async function confirmarCadastro() {
  enviando.value = true;
  erro.value = "";

  try {
    const dadosCadastro = {
      nome: cadastro.dados.dadosPessoais.nome,
      cpf: cadastro.dados.dadosPessoais.cpf,
      telefone: cadastro.dados.dadosPessoais.telefone,
      email: cadastro.dados.dadosPessoais.email,
      senha: cadastro.dados.dadosPessoais.senha,
      confirmaSenha: cadastro.dados.dadosPessoais.confirmaSenha,

      nomeEmpresa: cadastro.dados.dadosEmpresa.nome,
      cnpj: cadastro.dados.dadosEmpresa.cnpj,
      endereco: cadastro.dados.dadosEmpresa.endereco,
      quantidadePontos: cadastro.dados.dadosEmpresa.quantidadePontos,
      vendedores: cadastro.dados.dadosEmpresa.vendedores,

      plano: cadastro.dados.plano.tipoPlano,
      tipoAssinatura: cadastro.dados.plano.tipoAssinatura,

      formaPagamento: forma.value,
      valorPago: preco.value,
    };

    // TODO Backend: Aceitar todos esses campos e criar estrutura completa
    const response = await api.post("/auth/cadastro", dadosCadastro);

    if (response.success) {
      authStore.token = response.token;
      authStore.user = response.user;
      authStore.isAuthenticated = true;

      cadastro.limparDados();

      mostrarModal.value = true;

      setTimeout(() => {
        mostrarModal.value = false;
        router.push("/dashboard/vendas");
      }, 5000);
    } else {
      erro.value = response.message || "Erro ao realizar o cadastro.";
    }
  } catch (error) {
    console.error("Erro no cadastro:", error);
    erro.value = "Erro de conexão. Tente novamente.";
  } finally {
    enviando.value = false;
  }
}

onBeforeUnmount(() => {
  stopPixPolling();
});
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 bg-white rounded shadow space-y-6">
    <h3 class="text-2xl font-semibold text-gray-800 text-center">Pagamento</h3>
    <p
      v-if="erro"
      class="text-red-600 text-center text-sm bg-red-50 p-3 rounded"
    >
      {{ erro }}
    </p>
    <div class="flex gap-4 items-center justify-center">
      <label class="flex items-center space-x-2">
        <input
          type="radio"
          value="pix"
          v-model="forma"
          @change="onSelectForma('pix')"
        />
        <span class="text-gray-700">Pix</span>
      </label>
      <label class="flex items-center space-x-2">
        <input
          type="radio"
          value="cartao"
          v-model="forma"
          @change="onSelectForma('cartao')"
        />
        <span class="text-gray-700">Cartão de Crédito</span>
      </label>
    </div>

    <div
      v-if="forma === 'pix'"
      class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
    >
      <div class="p-4 border rounded">
        <p class="font-medium text-gray-700 mb-2">Pagar via Pix</p>
        <p class="text-sm text-gray-600 mb-2">
          Total: <strong class="text-gray-800">R${{ preco.toFixed(2) }}</strong>
        </p>
        <div class="flex flex-col items-center">
          <img
            :src="qrDataUrl"
            alt="QR Pix"
            class="w-56 h-56 object-contain border"
          />
          <p class="mt-3 text-sm text-gray-600">Chave Pix (copiar):</p>
          <div
            class="font-mono bg-gray-100 p-2 mt-1 rounded w-full text-center break-words"
          >
            {{ pixPayload }}
          </div>
          <p class="text-xs text-gray-500 mt-2">
            O sistema verificará automaticamente o pagamento.
          </p>
        </div>
      </div>

      <div class="p-4 border rounded">
        <p class="font-medium text-gray-700 mb-3">Status</p>
        <p v-if="!paymentOk" class="text-sm text-yellow-600">
          Aguardando confirmação do pagamento...
        </p>
        <p v-else class="text-sm text-green-600">
          Pagamento confirmado — pronto para finalizar.
        </p>
      </div>
    </div>

    <div v-if="forma === 'cartao'">
      <div class="p-4 border rounded space-y-3">
        <p class="font-medium text-gray-700">Dados do Cartão</p>
        <input
          class="w-full border rounded px-3 py-2"
          placeholder="Número do cartão"
          v-model="cadastro.tempCardNumber"
        />
        <div class="grid grid-cols-3 gap-2">
          <input
            v-model="cadastro.tempCardExpiry"
            placeholder="MM/AA"
            class="border rounded px-3 py-2"
          />
          <input
            v-model="cadastro.tempCardName"
            placeholder="Nome no cartão"
            class="border rounded px-3 py-2 col-span-2"
          />
        </div>
        <div class="flex justify-between items-center">
          <input
            v-model="cadastro.tempCardCvv"
            placeholder="CVV"
            class="border rounded px-3 py-2 w-32"
          />
          <button
            @click="processarCartao"
            class="bg-purple-700 text-white px-4 py-2 rounded"
            :disabled="processing"
          >
            <span v-if="processing">Processando...</span>
            <span v-else>Processar pagamento</span>
          </button>
        </div>
        <p v-if="paymentOk" class="text-sm text-green-600 mt-2">
          Pagamento confirmado — pronto para finalizar.
        </p>
      </div>
    </div>

    <div class="flex justify-between">
      <button type="button" @click="emit('back')" class="text-purple-700">
        Voltar
      </button>

      <button
        type="button"
        class="bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!paymentOk || enviando"
        @click="confirmarCadastro"
      >
        {{ enviando ? "Enviando..." : "Confirmar Cadastro" }}
      </button>
    </div>

    <div class="p-4 border rounded">
      <h4 class="font-medium text-gray-700 mb-2">Resumo do cadastro</h4>
      <p>
        <strong>Nome:</strong> {{ cadastro.dados?.dadosPessoais?.nome || "-" }}
      </p>
      <p>
        <strong>E-mail:</strong>
        {{ cadastro.dados?.dadosPessoais?.email || "-" }}
      </p>
      <p>
        <strong>Empresa:</strong>
        {{ cadastro.dados?.dadosEmpresa?.nome || "-" }}
      </p>
      <p>
        <strong>CNPJ:</strong> {{ cadastro.dados?.dadosEmpresa?.cnpj || "-" }}
      </p>
      <p>
        <strong>Pontos de venda:</strong>
        {{ cadastro.dados?.dadosEmpresa?.quantidadePontos || "-" }}
      </p>
      <p>
        <strong>Plano:</strong> {{ cadastro.dados?.plano?.tipoPlano || "-" }}
        <span v-if="cadastro.dados?.plano?.tipoAssinatura"
          >({{ cadastro.dados.plano.tipoAssinatura }})</span
        >
      </p>
    </div>

    <div
      v-if="mostrarModal"
      class="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
      <div class="bg-white p-6 rounded shadow max-w-md w-full text-center">
        <h3 class="text-2xl font-semibold text-purple-700 mb-2">
          🎉 Bem-vindo(a)!
        </h3>
        <p class="text-gray-700 mb-3">
          Seu cadastro foi concluído com sucesso.
        </p>
        <p class="text-sm text-gray-500">
          Você será redirecionado para a tela inicial em 5 segundos...
        </p>
      </div>
    </div>
  </div>
</template>
