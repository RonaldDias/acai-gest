import { defineStore } from "pinia";

export const useCadastroStore = defineStore("cadastro", {
  state: () => ({
    dados: {
      dadosPessoais: {},
      dadosEmpresa: {},
      plano: {},
    },
  }),
  actions: {
    atualizarDados(novosDados) {
      this.dados = { ...this.dados, ...novosDados };
    },
    limparDados() {
      this.dados = {};
    },
  },

  persist: true,
});
