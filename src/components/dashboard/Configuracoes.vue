<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { ChevronLeft } from "lucide-vue-next";
import { api } from "@/services/api";

const authStore = useAuthStore();
const toast = useToastStore();

const tela = ref(null);

const novoPinAtual = ref("");
const novoPin = ref("");
const novoPinConfirm = ref("");

const assinatura = ref(null);
const loadingAssinatura = ref(false);
const loadingTrocar = ref(false);
const confirmarCancelamento = ref(false);

const telaUpgrade = ref(false);
const valorUpgrade = ref(0);
const formaPagamento = ref("");
const loadingCancelar = ref(false);
const pixQrCode = ref("");
const pixPayload = ref("");
const pagamentoConfirmado = ref(false);
const msgDowngrade = ref("");
let pollingInterval = null;

async function salvarPin() {
  if (novoPinAtual.value !== authStore.user?.pin) {
    toast.warning("PIN atual incorreto");
    return;
  }
  if (novoPin.value.length < 4 || novoPin.value.length > 6) {
    toast.warning("PIN deve ter entre 4 e 6 dígitos");
    return;
  }
  if (novoPin.value !== novoPinConfirm.value) {
    toast.warning("Os PINs não coincidem");
    return;
  }

  await api.put("/usuarios/pin", { pin: novoPin.value });
  authStore.user.pin = novoPin.value;
  toast.success("PIN atualizado com sucesso!");
  novoPinAtual.value = "";
  novoPin.value = "";
  novoPinConfirm.value = "";
}

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR");
}

async function buscarAssinatura() {
  loadingAssinatura.value = true;
  try {
    const data = await api.get(`/empresas/${authStore.user.empresaId}/assinatura`);
    assinatura.value = data.data;
  } finally {
    loadingAssinatura.value = false;
  }
}

async function iniciarTrocaPlano() {
  const novoPlano = assinatura.value.plano === "basico" ? "top" : "basico;"
  console.log("plano atual:", assinatura.value.plano, "novo plano:", novoPlano);
  telaUpgrade.value = true;
  formaPagamento.value = "";
  pixQrCode.value = "";
  pixPayload.value = "";
  pagamentoConfirmado.value = false;
  msgDowngrade.value = "";

  if (novoPlano === "basico") {
    try {
      const data = await api.patch(`/empresas/${authStore.user.empresaId}/plano`, {
        novo_plano: novoPlano,
        metodo_pagamento: "pix"
      });
      if (data.downgrade) {
        msgDowngrade.value = data.message;
      }
    } catch {
      toast.error("Erro ao processar downgrade.");
      telaUpgrade.value = false;
    }
    return;
  }

  const valores = { 
    basico: { mensal: 149.9, anual: 1619.1},
    top: { mensal: 249.9, anual: 2699.1}
  }

  const agora = new Date();
  const vencimento = new Date(assinatura.value.data_vencimento);
  const diasTotais = assinatura.value.tipo === "anual" ? 365 : 30;
  const diasRestantes = Math.max(0, Math.ceil((vencimento - agora) / (1000 * 60 * 60 * 24)));
  const valorAtual = valores[assinatura.value.plano][assinatura.value.tipo];
  const valorNovo = valores["top"][assinatura.value.tipo];
  const valorDiario = (valorNovo - valorAtual) / diasTotais;
  valorUpgrade.value = parseFloat((valorDiario * diasRestantes).toFixed(2));
}

async function selecionarFormaPagamento(metodo) {
  formaPagamento.value = metodo;
  const novoPlano = "top";

  try {
    const data = await api.patch(`/empresas/${authStore.user.empresaId}/plano`, {
      novo_plano: novoPlano,
      metodo_pagamento: metodo
    })

    if (metodo === "pix") {
      pixQrCode.value = `data:image/png;base64,${data.pagamento.qr_code_base64}`;
      pixPayload.value = data.pagamento.qr_code;

      iniciarPollingUpgrade(data.pagamento.pagamento_id);
    } else if (metodo === "cartao") {
      const width = 600, height = 700;
      const left = screen.width / 2 - width / 2;
      const top = screen.height / 2 - height / 2;

      window.open(data.pagamento.init_point, "MercadoPago", `width=${width},height=${height},top=${top},left=${left}`);
      iniciarPollingUpgrade(data.pagamento.pagamento_id);
    }
  } catch {
    toast.error("Erro ao processar pagamento.");
  }
}

function iniciarPollingUpgrade() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(async () => {
    const data = await api.get(`/empresas/${authStore.user.empresaId}/assinatura`);
    if (data.data.plano === "top") {
      pagamentoConfirmado.value = true;
      assinatura.value = data.data;
      authStore.user.empresa.plano = "top";
      clearInterval(pollingInterval);
      telaUpgrade.value = false;
      toast.success("Upgrade realizado com sucesso!");
    }
  }, 3000);
}

async function cancelarAssinatura() {
  loadingTrocar.value = true;
  try {
    await api.patch(`/empresas/${authStore.user.empresaId}/cancelar-assinatura`);
    assinatura.value.status = "cancelada";
    confirmarCancelamento.value = false;
    toast.success("Assinatura cancelada com sucesso!");
  } catch {
    toast.error("Erro ao cancelar assinatura.")
  } finally {
    loadingTrocar.value = false;
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto p-6">
    <div v-if="!tela">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Configurações</h1>
      <div class="space-y-3">
        <div
          @click="tela = 'conta'"
          class="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50 transition flex items-center justify-between"
        >
          <span class="font-medium text-gray-800">Minha Conta</span>
          <ChevronLeft class="rotate-180 text-gray-400" :size="20" />
        </div>
        <div
          @click="tela = 'assinatura'; buscarAssinatura()"
          class="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50 transition flex items-center justify-between"
        >
          <span class="font-medium text-gray-800">Assinatura</span>
          <ChevronLeft class="rotate-180 text-gray-400" :size="20" />
        </div>
      </div>
    </div>

    <div v-else-if="tela === 'conta'">
      <button
        @click="tela = null"
        class="flex items-center text-purple-600 mb-6 hover:underline"
      >
        <ChevronLeft :size="20" /> Voltar
      </button>
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Minha Conta</h1>

      <div class="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <p class="text-sm text-gray-500">Nome</p>
          <p class="font-medium text-gray-800">{{ authStore.user?.nome }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">E-mail</p>
          <p class="font-medium text-gray-800">{{ authStore.user?.email }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">PIN atual</p>
          <p class="font-medium text-gray-800">
            {{ authStore.user?.pin ?? "Não definido" }}
          </p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mt-4 space-y-4">
        <h2 class="font-semibold text-gray-800">Alterar PIN</h2>
        <input
          v-model="novoPinAtual"
          type="password"
          placeholder="PIN atual"
          maxlength="6"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
        />
        <input
          v-model="novoPin"
          type="password"
          placeholder="Novo PIN"
          maxlength="6"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
        />
        <input
          v-model="novoPinConfirm"
          type="password"
          placeholder="Confirmar novo PIN"
          maxlength="6"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600"
        />
        <button
          @click="salvarPin"
          class="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
        >
          Salvar PIN
        </button>
      </div>
    </div>

    <div v-else-if="tela === 'assinatura'">
      <button
        @click="tela = null"
        class="flex items-center text-purple-600 mb-6 hover:underline"
      >
        <ChevronLeft :size="20" /> Voltar
      </button>
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Assinatura</h1>

      <div v-if="loadingAssinatura" class="text-center text-gray-500 py-10">
        Carregando...
      </div>

      <div v-else-if="assinatura" class="space-y-4">
        <div class="bg-white rounded-lg shadow p-6 space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-500">Plano</p>
              <p class="font-semibold text-gray-800 capitalize">{{ assinatura.plano }}</p>
            </div>
            <span
              :class="assinatura.status === 'ativa' ? 'bg-green-100 text-green-700' : assinatura.status === 'cancelada' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'"
              class="text-xs font-medium px-3 py-1 rounded-full capitalize"
            >
              {{ assinatura.status }}
            </span>
          </div>
          <div>
            <p class="text-sm text-gray-500">Tipo</p>
            <p class="font-medium text-gray-800 capitalize">{{ assinatura.tipo }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Início</p>
            <p class="font-medium text-gray-800">{{ formatarData(assinatura.data_inicio) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Vencimento</p>
            <p class="font-medium text-gray-800">{{ formatarData(assinatura.data_vencimento) }}</p>
          </div>
        </div>

        <div v-if="assinatura.status !== 'cancelada'" class="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 class="font-semibold text-gray-800">Trocar de plano</h2>
          <p class="text-sm text-gray-500">
            Plano atual: <span class="font-medium capitalize">{{ assinatura.plano }}</span>
          </p>
          <button
            @click="iniciarTrocaPlano"
            :disabled="loadingTrocar"
            class="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition disabled:opacity-50"
          >
            {{ `Mudar para ${assinatura.plano === 'basico' ? 'Top' : 'Básico'}` }}
          </button>
        </div>

        <div v-if="telaUpgrade" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-96 shadow-xl space-y-4">
            <h2 class="text-xl font-bold text-gray-800">Trocar de plano</h2>

            <div v-if="msgDowngrade" class="text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
              {{ msgDowngrade }}
            </div>

            <div v-else-if="!formaPagamento" class="space-y-3">
              <p class="text-sm text-gray-600">
                Valor proporcional do upgrade: <strong>R$ {{ valorUpgrade.toFixed(2) }}</strong>
              </p>
              <p class="text-sm text-gray-500">Escolha a forma de pagamento:</p>
              <button @click="selecionarFormaPagamento('pix')" class="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                Pagar via PIX
              </button>
              <button @click="selecionarFormaPagamento('cartao')" class="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                Pagar com Cartão
              </button>
            </div>

            <div v-else-if="formaPagamento === 'pix'" class="space-y-3">
              <img :src="pixQrCode" class="w-48 h-48 mx-auto border" />
              <p class="text-xs text-center font-mono bg-gray-100 p-2 rounded break-all">{{ pixPayload }}</p>
              <p class="text-xs text-gray-500 text-center">Aguardando confirmação do pagamento...</p>
            </div>

            <div v-else-if="formaPagamento === 'cartao'" class="text-sm text-gray-600 text-center">
              Complete o pagamento na janela do Mercado Pago.<br>Aguardando confirmação...
            </div>

            <button @click="telaUpgrade = false; formaPagamento = ''" class="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300">
              Cancelar
            </button>
          </div>
        </div>

        <div v-if="assinatura.status !== 'cancelada'" class="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 class="font-semibold text-gray-800">Cancelar assinatura</h2>
          <p class="text-sm text-gray-500">Ao cancelar, sua conta será desativada ao fim do período vigente.</p>
          <button
            @click="confirmarCancelamento = true"
            class="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          >
            Cancelar assinatura
          </button>
        </div>
      </div>

      <div
        v-if="confirmarCancelamento"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-6 w-96 shadow-xl">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Confirmar cancelamento</h2>
          <p class="text-gray-600 mb-6">Tem certeza que deseja cancelar sua assinatura? Esta ação não pode ser desfeita.</p>
          <div class="flex space-x-3">
              <button
              @click="confirmarCancelamento = false"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Voltar
              </button>
              <button
              @click="cancelarAssinatura"
              :disabled="loadingCancelar"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
              {{ loadingCancelar ? 'Cancelando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
