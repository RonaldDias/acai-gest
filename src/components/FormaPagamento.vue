<script setup>
import { ref, computed } from "vue";
import { useCadastroStore } from "../stores/cadastroStore";

const cadastro = useCadastroStore();
const emit = defineEmits(["finalizar"]);

const formaSelecionada = ref("");
const pagamentoConfirmado = ref(false);

const dadosCartao = ref({
  numero: "",
  nome: "",
  validade: "",
  cvv: "",
});

const handleCartaoChange = (campo, valor) => {
  dadosCartao.value[campo] = valor;
};

const validarCartao = () => {
  const { numero, nome, validade, cvv } = dadosCartao.value;
  return numero && nome && validade && cvv;
};

const handleConfirmaCartao = () => {
  if (validarCartao()) {
    pagamentoConfirmado.value = true;
  } else {
    alert("Preencha todos os campos do cartão.");
  }
};

const handleConfirmaPix = () => {
  pagamentoConfirmado.value = true;
};

const dados = computed(() => cadastro.dados);
</script>

<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded shadow space-y-6">
    <div class="text-center">
      <label class="block mb-4 text-gray-700 text-lg font-light">
        Selecione a forma de pagamento:
      </label>
      <select
        v-model="formaSelecionada"
        class="w-1/2 mx-auto text-gray-700 p-2 border rounded text-center"
      >
        <option value="">Selecione</option>
        <option value="pix">Pix</option>
        <option value="cartao">Cartão de Crédito</option>
      </select>
    </div>

    <div v-if="formaSelecionada === 'pix'" class="text-center space-y-4">
      <p class="text-lg font-medium">Faça o pagamento via Pix:</p>
      <img src="" alt="QR Code Pix" class="w-64 mx-auto" />
      <p class="text-sm text-gray-700">Ou copie a chave Pix:</p>
      <p class="font-mono bg-gray-400 p-2 rounded-xl">
        ronaldsilva850@gmail.com
      </p>
      <button
        @click="handleConfirmaPix"
        class="text-purple-700 cursor-pointer underline mt-2"
      >
        Já realizei o pagamento
      </button>
    </div>

    <div v-if="formaSelecionada === 'cartao'" class="space-y-4 text-center">
      <p class="text-lg font-medium">Preencha os dados do cartão</p>
      <input
        type="text"
        placeholder="Número do Cartão"
        class="w-1/2 text-gray-700 border rounded px-3 py-2"
        v-model="dadosCartao.numero"
      />
      <input
        type="text"
        placeholder="Validade"
        class="w-1/2 text-gray-700 border rounded px-3 py-2"
        v-model="dadosCartao.validade"
      />
      <input
        type="text"
        placeholder="Nome no Cartão"
        class="w-1/2 text-gray-700 border rounded px-3 py-2"
        v-model="dadosCartao.nome"
      />
      <input
        type="text"
        placeholder="CVV"
        class="w-1/2 text-gray-700 border rounded px-3 py-2"
        v-model="dadosCartao.cvv"
      />
      <button
        @click="handleConfirmaCartao"
        class="text-purple-700 underline mt-2 cursor-pointer"
      >
        Confirmar pagamento com cartão
      </button>
    </div>

    <div v-if="pagamentoConfirmado" class="bg-gray-500 p-4 rounded shadow mt-8">
      <h3 class="text-lg font-semibold mb-4">
        Confirme seus dados antes de concluir
      </h3>
      <ul class="space-y-1 text-sm text-white">
        <li><strong>Nome:</strong> {{ dados.dadosPessoais.nome }}</li>
        <li><strong>E-mail:</strong> {{ dados.dadosPessoais.email }}</li>
        <li><strong>Empresa:</strong> {{ dados.dadosEmpresa.empresa }}</li>
        <li><strong>CNPJ:</strong> {{ dados.dadosEmpresa.cnpj }}</li>
        <li><strong>Plano:</strong> {{ dados.plano.tipoPlano }}</li>
      </ul>
    </div>
  </div>
</template>
