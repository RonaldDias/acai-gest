import { useAuthStore } from "@/stores/authStore";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request(endpoint, options = {}) {
  const authStore = useAuthStore();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (authStore.token) {
    headers.Authorization = `Bearer ${authStore.token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (response.status === 401) {
      const authStore = useAuthStore();

      if (authStore.refreshToken) {
        try {
          const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: authStore.refreshToken }),
          });

          const refreshData = await refreshResponse.json();

          if (refreshData.success) {
            authStore.token = refreshData.token;

            const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
              ...options,
              headers: {
                ...headers,
                Authorization: `Bearer ${refreshData.token}`,
              },
            });

            return await retryResponse.json();
          }
        } catch (error) {}
      }

      authStore.logout();
      window.location.href = "/";
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Erro na requisição");
    }

    return data;
  } catch (error) {
    console.error("Erro na requisição:", error);
    throw error;
  }
}

export const api = {
  get(endpoint) {
    return request(endpoint, {
      method: "GET",
    });
  },

  post(endpoint, body) {
    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return request(endpoint, {
      method: "DELETE",
    });
  },
};

export const vendasApi = {
  listarHoje(pontoId) {
    return api.get(`/sales/today?ponto_id=${pontoId}`);
  },

  resumoHoje(pontoId) {
    return api.get(`/sales/summary/today?ponto_id=${pontoId}`);
  },

  criar(dados) {
    return api.post("/sales", dados);
  },
};

export const produtosApi = {
  listar(pontoId) {
    return api.get(`/products?ponto_id=${pontoId}`);
  },

  entrada(dados) {
    return api.post("/products/entrada", dados);
  },

  criar(dados) {
    return api.post("/products", dados);
  },

  atualizar(id, dados) {
    return api.put(`/products/${id}`, dados);
  },

  desativar(id) {
    return api.delete(`/products/${id}`);
  },
};

export const vendedoresApi = {
  listar(pontoId) {
    return api.get(`/vendedores?pontoId=${pontoId}`);
  },

  criar(dados) {
    return api.post("/vendedores", dados);
  },

  desativar(id) {
    return api.delete(`/vendedores/${id}`);
  },

  resetarSenha(id) {
    return api.post(`/vendedores/${id}/resetar-senha`);
  },
};

export default api;
