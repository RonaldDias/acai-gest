import { useAuthStore } from "@/stores/authStore";

const BASE_URL = "http://localhost:3001/api"; // TODO: mover para .env

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
      authStore.logout();
      window.location.href = "/";
      throw new Error("Sessão expirada. Faça login nvoamente.");
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
  listarHoje() {
    return api.get("/sales/today");
  },

  resumoHoje() {
    return api.get("/sales/summary/today");
  },

  criar(dados) {
    return api.post("/sales", dados);
  },
};

export default api;
