import { defineStore } from "pinia";

export const useCadastroStore = defineStore('cadastro', {
    state: () => ({
        dados: {},
    }),
    actions: {
        atualizarDados(novosDados) {
            this.dados = { ...this.dados, ...novosDados }
        },
        limparDados() {
            this.dados = {}
        }
    },
})