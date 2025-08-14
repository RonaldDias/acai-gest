<script setup></script>
<script setup>
import { ref, computed } from "vue";

const estoque = ref({
  acai: 100,
  farinha: 50,
  farinhaTapioca: 30,
});

function diminuirEstoque(produto, quantidade) {
  if (
    estoque.value[produto] !== undefined &&
    estoque.value[produto] >= quantidade
  ) {
    estoque.value[produto] -= quantidade;
  } else {
    alert("Estoque insuficiente para " + produto);
  }
}

function adicionarEstoque(produto, quantidade) {
  if (estoque.value[produto] !== undefined) {
    estoque.value[produto] += quantidade;
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">Estoque Atual</h1>

    <table class="w-full bg-white rounded shadow">
      <thead class="bg-purple-700 text-white">
        <tr>
          <th class="p-3 text-left">Produto</th>
          <th class="p-3 text-right">Quantidade Disponível</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="p-3">Açaí (litros)</td>
          <td class="p-3 text-right font-semibold">
            {{ estoque.acai.toFixed(2) }}
          </td>
        </tr>
        <tr>
          <td class="p-3">Farinha (kg)</td>
          <td class="p-3 text-right font-semibold">
            {{ estoque.farinha.toFixed(2) }}
          </td>
        </tr>
        <tr>
          <td class="p-3">Farinha de Tapioca (kg)</td>
          <td class="p-3 text-right font-semibold">
            {{ estoque.farinhaTapioca.toFixed(2) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
