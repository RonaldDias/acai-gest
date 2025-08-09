<script setup>
import { ref, computed } from "vue";
import { useCadastroStore } from "../stores/cadastroStore";

const cadastro = useCadastroStore();
const emit = defineEmits(["next", "back"]);

const planoSelecionado = ref("");
const assinaturaAnual = ref(false);

const pontos = computed(() => Number(cadastro.dados.quantidadePontos || 0));

const planoBasicoDisponivel = computed(() => pontos.value <= 1);

const precoMensal = {
  basic: 149.9,
  top: 249.9,
};

const precoAnual = computed(() => {
  const desconto = 0.9;
  return {
    basic: precoMensal.basic * 12 * desconto,
    top: precoMensal.top * 12 * desconto,
  };
});

const economiaMensal = computed(() => {
  return {
    basic: precoMensal.basic - precoAnual.value.basic / 12,
    top: precoMensal.top - precoAnual.value.top / 12,
  };
});

function selecionarPlano(plano) {
  if (plano === "basic" && !planoBasicoDisponivel.value) return;
  planoSelecionado.value = plano;
}

function handleSubmit() {
  if (!planoSelecionado.value)
    return alert("Selecione um plano para continuar.");

  cadastro.atualizarDados({
    plano: planoSelecionado.value,
    assinatura: assinaturaAnual.value ? "anual" : "mensal",
  });

  emit("next");
}
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-2xl font-light text-center mb-6 text-gray-700">
      Selecione um plano:
    </h3>

    <div class="grid md:grid-cols-2 gap-6">
      <label
        @click="selecionarPlano('basic')"
        class="border-2 rounded-xl p-6 cursor-pointer transition relative"
        :class="[
          planoSelecionado === 'basic' ? 'bg-purple-300 border-gray-400' : '',
          !planoBasicoDisponivel
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:shadow-2xl',
        ]"
      >
        <h4 class="text-xl font-semibold text-purple-700 mb-1">Plano Basic</h4>
        <p class="text-2xl font-bold mb-3 text-gray-700">
          {{
            assinaturaAnual ? `R$${precoAnual.basic.toFixed(2)}` : "R$149,90"
          }}
          <span class="text-base font-normal">{{
            assinaturaAnual ? "/ano" : "/mês"
          }}</span>
        </p>
        <ul class="text-gray-700 list-disc list-inside space-y-1 mb-3">
          <li>Fluxo de Caixa</li>
          <li>Controle de estoque</li>
          <li>1 Ponto de venda cadastrado</li>
          <li>Exporta resultados</li>
          <li>Suporte Horário Comercial</li>
        </ul>
        <p v-if="assinaturaAnual" class="text-sm text-green-600 mt-1">
          Economize R${{ economiaMensal.basic.toFixed(2) }} por mês
        </p>
        <p v-if="!planoBasicoDisponivel" class="text-sm text-red-500 mt-2">
          Não disponível para empresas com mais de 1 ponto de venda.
        </p>
      </label>

      <label
        @click="selecionarPlano('top')"
        class="border-2 rounded-xl p-6 cursor-pointer transition relative"
        :class="[
          planoSelecionado === 'top' ? 'bg-purple-300 border-gray-400' : '',
          'hover:shadow-2xl',
        ]"
      >
        <h4 class="text-xl font-semibold text-purple-700 mb-1">Plano Top</h4>
        <p class="text-2xl font-bold text-gray-700 mb-3">
          {{ assinaturaAnual ? `R$${precoAnual.top.toFixed(2)}` : "R$249,90" }}
          <span class="text-base font-normal">{{
            assinaturaAnual ? "/ano" : "/mês"
          }}</span>
        </p>
        <ul class="text-gray-700 list-disc list-inside space-y-1 mb-3">
          <li>Fluxo de caixa</li>
          <li>Controle de estoque</li>
          <li>Até 3 pontos de venda cadastrados</li>
          <li>Exporta Resultados</li>
          <li>Suporte 24H</li>
        </ul>
        <p v-if="assinaturaAnual" class="text-sm text-green-600 mt-1">
          Economize R${{ economiaMensal.top.toFixed(2) }} por mês
        </p>
      </label>
    </div>

    <div class="mt-4">
      <label class="flex items-center space-x-2 text-gray-700">
        <input
          type="checkbox"
          v-model="assinaturaAnual"
          class="accent-purple-700"
        />
        <span>Quero assinar anualmente com 10% de desconto</span>
      </label>
    </div>

    <div class="flex justify-between mt-6">
      <button
        type="button"
        @click="emit('back')"
        class="cursor-pointer text-purple-700"
      >
        Voltar
      </button>
      <button
        type="button"
        @click="handleSubmit"
        class="bg-purple-700 text-white shadow-purple-950 shadow-md px-6 py-2 rounded-full cursor-pointer hover:bg-purple-800 transition"
      >
        Próximo
      </button>
    </div>
  </div>
</template>
