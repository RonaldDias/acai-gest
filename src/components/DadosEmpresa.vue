<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useCadastroStore } from "../stores/cadastroStore";
import { Trash2 } from "lucide-vue-next";
import IMask from "imask";

const cadastro = useCadastroStore();
const emit = defineEmits(["next", "back"]);
const cnpjRef = ref(null);

const empresa = reactive({
  nome: "",
  cnpj: "",
  endereco: "",
  quantidadePontos: "",
  vendedores: [],
});

const erros = reactive({
  nome: "",
  cnpj: "",
  endereco: "",
  quantidadePontos: "",
});

const handleChange = (e) => {
  empresa[e.target.name] = e.target.value;
};

const adicionarVendedor = () => {
  empresa.vendedores.push({ nome: "", cpf: "" });
};

const removerVendedor = (index) => {
  empresa.vendedores.splice(index, 1);
};

const atualizarVendedor = (index, field, value) => {
  empresa.vendedores[index][field] = value;
};

const validarCNPJ = (cnpj) => {
  const regex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
  return regex.test(cnpj);
};

const validarCampos = () => {
  let valido = true;

  erros.nome = empresa.nome ? "" : "Nome da empresa é obrigatório.";
  erros.cnpj = empresa.cnpj
    ? validarCNPJ(empresa.cnpj)
      ? ""
      : "Formato de CNPJ inválido."
    : "CNPJ é obrigatório.";
  erros.endereco = empresa.endereco ? "" : "Endereço é obrigatório.";
  erros.quantidadePontos = empresa.quantidadePontos
    ? ""
    : "Informe a quantidade de pontos de venda.";

  return Object.values(erros).every((e) => e === "");
};

const handleSubmit = () => {
  if (validarCampos()) {
    cadastro.atualizarDados(empresa);
    emit("next");
  }
};

onMounted(() => {
  if (cnpjRef.value) {
    IMask(cnpjRef.value, { mask: "00.000.000/0000-00" });
  }
});

watch(
  () => empresa.nome,
  (val) => {
    if (val) erros.nome = "";
  }
);
watch(
  () => empresa.cnpj,
  (val) => {
    if (val && validarCNPJ(val)) erros.cnpj = "";
  }
);
watch(
  () => empresa.endereco,
  (val) => {
    if (val) erros.endereco = "";
  }
);
watch(
  () => empresa.quantidadePontos,
  (val) => {
    if (val) erros.quantidadePontos = "";
  }
);
</script>

<template>
  <form class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Nome -->
    <div>
      <label class="block mb-1 text-gray-700 text-sm">Nome da Empresa</label>
      <input
        name="nome"
        v-model="empresa.nome"
        type="text"
        class="text-gray-700 w-full border-b py-3 focus:outline-none focus:border-purple-700"
        placeholder="Digite o nome da empresa"
      />
      <p v-if="erros.nome" class="text-red-600 text-sm mt-1">
        {{ erros.nome }}
      </p>
    </div>

    <div>
      <label class="block mb-1 text-gray-700 text-sm">CNPJ</label>
      <input
        ref="cnpjRef"
        name="cnpj"
        v-model="empresa.cnpj"
        type="text"
        class="text-gray-700 w-full border-b py-3 focus:outline-none focus:border-purple-700"
        placeholder="00.000.000/0000-00"
      />
      <p v-if="erros.cnpj" class="text-red-600 text-sm mt-1">
        {{ erros.cnpj }}
      </p>
    </div>

    <div>
      <label class="block mb-1 text-gray-700 text-sm"
        >Endereço da Empresa</label
      >
      <input
        name="endereco"
        v-model="empresa.endereco"
        type="text"
        class="text-gray-700 w-full border-b py-3 focus:outline-none focus:border-purple-700"
        placeholder="Rua, número, bairro, cidade"
      />
      <p v-if="erros.endereco" class="text-red-600 text-sm mt-1">
        {{ erros.endereco }}
      </p>
    </div>

    <div>
      <label class="block mb-1 text-gray-700 text-sm"
        >Quantidade de Pontos</label
      >
      <input
        name="quantidadePontos"
        v-model="empresa.quantidadePontos"
        type="number"
        class="text-gray-700 w-full border-b py-3 focus:outline-none focus:border-purple-700"
        placeholder="Ex: 3"
      />
      <p v-if="erros.quantidadePontos" class="text-red-600 text-sm mt-1">
        {{ erros.quantidadePontos }}
      </p>
    </div>

    <div class="md:col-span-2">
      <div class="flex justify-between items-center mb-2">
        <label class="text-gray-700 text-sm font-semibold">Vendedores</label>
        <button
          type="button"
          @click="adicionarVendedor"
          class="text-purple-700 cursor-pointer hover:underline text-sm"
        >
          + Adicionar vendedor
        </button>
      </div>

      <div
        v-for="(vendedor, index) in empresa.vendedores"
        :key="index"
        class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 relative"
      >
        <input
          type="text"
          :value="vendedor.nome"
          @input="(e) => atualizarVendedor(index, 'nome', e.target.value)"
          class="w-full border-b py-3 text-gray-700 focus:outline-none focus:border-purple-700"
          placeholder="Nome do vendedor"
        />
        <div class="flex gap-2 items-center">
          <input
            type="text"
            :value="vendedor.cpf"
            @input="(e) => atualizarVendedor(index, 'cpf', e.target.value)"
            class="w-full border-b py-3 text-gray-700 focus:outline-none focus:border-purple-700"
            placeholder="CPF do vendedor"
          />
          <button type="button" @click="removerVendedor(index)">
            <Trash2 class="text-red-600 hover:text-red-800 w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <div class="col-span-2 flex justify-between mt-4">
      <button
        type="button"
        @click="emit('back')"
        class="text-purple-700 cursor-pointer"
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
  </form>
</template>
