<script setup>
import { ref, reactive, computed } from "vue";

const produtos = [
  { label: "Açaí", value: "acai", preco: 10.0 },
  { label: "Farinha", value: "farinha", preco: 5.0 },
  { label: "Farinha de Tapioca", value: "farinhaTapioca", preco: 7.5 },
];

const tiposVenda = [
  { label: "Cartão", value: "cartao" },
  { label: "Pix", value: "pix" },
  { label: "Dinheiro", value: "dinheiro" },
];

const venda = reactive({
  produto: produtos[0].value,
  tipoVenda: tiposVenda[0].value,
  quantidade: 0,
});

const mostrarModal = ref(false);

function incrementarQuantidade() {
  venda.quantidade++;
}

function decrementarQuantidade() {
  if (venda.quantidade > 0) venda.quantidade--;
}

const valorTotal = computed(() => {
  const produtoSelecionado = produtos.find((p) => p.value === venda.produto);
  return (produtoSelecionado?.preco || 0) * venda.quantidade;
});

function confirmarVenda() {
  if (venda.quantidade <= 0) {
    alert("Quantidade deve ser maior que zero.");
    return;
  }
  // Aqui você pode disparar evento ou atualizar estado global para comunicar a venda

  mostrarModal.value = true;
}

function fecharModal() {
  mostrarModal.value = false;
  // Resetar formulário para nova venda
  venda.produto = produtos[0].value;
  venda.tipoVenda = tiposVenda[0].value;
  venda.quantidade = 0;
}
</script>

<template>
  <div class="p-6 max-w-md mx-auto bg-white rounded shadow">
    <h1 class="text-2xl font-semibold mb-6">Registrar Venda</h1>

    <div class="mb-4">
      <label class="block mb-1 font-medium">Produto</label>
      <select v-model="venda.produto" class="w-full border p-2 rounded">
        <option v-for="p in produtos" :key="p.value" :value="p.value">
          {{ p.label }}
        </option>
      </select>
    </div>

    <div class="mb-4">
      <label class="block mb-1 font-medium">Tipo de Venda</label>
      <select v-model="venda.tipoVenda" class="w-full border p-2 rounded">
        <option v-for="t in tiposVenda" :key="t.value" :value="t.value">
          {{ t.label }}
        </option>
      </select>
    </div>

    <div class="mb-4 flex items-center space-x-2">
      <label class="font-medium flex-1">Quantidade</label>
      <button
        @click="decrementarQuantidade"
        class="bg-red-500 text-white px-3 py-1 rounded"
      >
        -
      </button>
      <span class="w-12 text-center">{{ venda.quantidade }}</span>
      <button
        @click="incrementarQuantidade"
        class="bg-green-500 text-white px-3 py-1 rounded"
      >
        +
      </button>
    </div>

    <div class="mb-4 font-semibold text-right">
      Valor Total: R$ {{ valorTotal.toFixed(2) }}
    </div>

    <button
      @click="confirmarVenda"
      class="w-full bg-purple-700 text-white py-2 rounded hover:bg-purple-900 transition"
    >
      Confirmar Venda
    </button>

    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white rounded p-6 max-w-sm w-full text-center">
        <h2 class="text-xl font-semibold mb-4 text-green-600">
          Venda registrada com sucesso!
        </h2>
        <button
          @click="fecharModal"
          class="mt-2 bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-900"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>
