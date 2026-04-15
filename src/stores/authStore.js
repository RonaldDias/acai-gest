import { defineStore } from "pinia";
import { api } from "@/services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    pinValidado: false,
    pontoSelecionado: null,
  }),

  getters: {
    isDono: (state) => state.user?.role === "dono",
    isVendedor: (state) => state.user?.role === "vendedor",
    userName: (state) => state.user?.nome || "",
    userEmail: (state) => state.user?.email || "",
    pontoAtivo: (state) => state.pontoSelecionado || state.user?.pontoId,
  },

  actions: {
    async login(email, senha) {
      try {
        const data = await api.post("/auth/login", { login: email, senha });

        if (data.success) {
          this.token = data.token;
          this.refreshToken = data.refreshToken;
          this.user = data.user;
          this.isAuthenticated = true;

          return { success: true };
        } else {
          return { success: false, message: data.message };
        }
      } catch (error) {
        return {
          success: false,
          message: "Erro de conexão. Tente novamente.",
        };
      }
    },

    logout() {
      this.token = null;
      this.refreshToken = null;
      this.user = null;
      this.isAuthenticated = false;
      this.pinValidado = false;
      this.pontoSelecionado = null;
    },

    checkAuth() {
      return this.isAuthenticated && this.token !== null;
    },

    atualizarUsuario(novosDados) {
      this.user = { ...this.user, ...novosDados };
    },

    validarPin() {
      this.pinValidado = true;
    },

    resetarPin() {
      this.pinValidado = false;
    },

    trocarPonto(pontoId) {
      this.pontoSelecionado = pontoId;
    },
  },

  persist: true,
});
