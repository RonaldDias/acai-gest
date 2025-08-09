<!-- src/views/CadastroView.vue -->
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Settings, CreditCard, User, Building } from "lucide-vue-next";

import DadosPessoais from "../components/DadosPessoais.vue";
import DadosEmpresa from "../components/DadosEmpresa.vue";
import SelecionarPlano from "../components/SelecionarPlano.vue";
import FormaPagamento from "../components/FormaPagamento.vue";

const etapas = ["Dados Pessoais", "Dados da Empresa", "Plano", "Pagamento"];
const etapa = ref(1);

const icons = [User, Building, Settings, CreditCard];

const proximaEtapa = () => {
  etapa.value = Math.min(etapa.value + 1, etapas.length);
};
const etapaAnterior = () => {
  console.log("Etapa acionada");
  etapa.value = Math.max(etapa.value - 1, 1);
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 text-white p-6 flex flex-col items-center"
  >
    <h2 class="text-4xl font-light mb-2 leading-snug">
      Cadastre-se no Açaí Gest
    </h2>
    <p class="text-white text-md font-light max-w-md mb-6">Preencha os dados</p>

    <div class="flex items-center justify-between w-full max-w-3xl mb-12">
      <div
        v-for="(label, idx) in etapas"
        :key="label"
        class="flex flex-1 items-center relative"
      >
        <div
          v-if="idx > 0"
          class="absolute right-20 top-6 transform -translate-y-1/2 w-full h-1"
          :class="
            etapa > idx + 1
              ? 'bg-purple-700'
              : etapa === idx + 1
              ? 'bg-purple-700'
              : 'bg-purple-300'
          "
        />
        <div class="relative z-10 flex flex-col items-center w-full">
          <div
            class="w-12 h-12 flex items-center justify-center rounded-full border-4 transition-all duration-300"
            :class="
              etapa === idx + 1
                ? 'bg-purple-700 border-white'
                : etapa > idx + 1
                ? 'bg-white border-purple-700 text-purple-700'
                : 'bg-white border-purple-300 text-purple-500'
            "
          >
            <component
              :is="icons[idx]"
              :size="24"
              :class="etapa === idx + 1 ? 'text-white' : 'text-purple-700'"
            />
          </div>
          <span
            class="mt-2 text-sm"
            :class="
              etapa === idx + 1 || etapa > idx + 1
                ? 'text-white font-semibold'
                : 'text-purple-300'
            "
          >
            {{ label }}
          </span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-lg p-10 w-full max-w-2xl text-black">
      <DadosPessoais v-if="etapa === 1" @next="proximaEtapa" />
      <DadosEmpresa
        v-if="etapa === 2"
        @next="proximaEtapa"
        @back="etapaAnterior"
      />
      <SelecionarPlano
        v-if="etapa === 3"
        @next="proximaEtapa"
        @back="etapaAnterior"
      />
      <FormaPagamento v-if="etapa === 4" @back="etapaAnterior" />
    </div>
  </div>
</template>
