import { defineStore } from "pinia";

export const useToastStore = defineStore("toast", {
  state: () => ({
    toasts: [],
  }),

  actions: {
    show(message, type = "info", duration = 5000) {
      const id = Date.now();

      this.toasts.push({
        id,
        message,
        type,
        duration,
      });

      if (duration > 0) {
        setTimeout(() => {
          this.remove(id);
        }, duration);
      }
    },

    success(message, duration = 5000) {
      this.show(message, "success", duration);
    },

    error(message, duration = 4000) {
      this.show(message, "error", duration);
    },

    warning(message, duration = 3000) {
      this.show(message, "warning", duration);
    },

    info(message, duration = 3000) {
      this.show(message, "info", duration);
    },

    remove(id) {
      const index = this.toasts.findIndex((t) => t.id === id);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    },
  },
});
