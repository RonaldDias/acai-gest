<script setup>
import { useToastStore } from "@/stores/toastStore";
import { info } from "autoprefixer";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-vue-next";

const toastStore = useToastStore();

const getIcon = (type) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };
  return icons[type] || Info;
};

const getColorClasses = (type) => {
  const colors = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-500 text-white",
  };
  return colors[type] || colors.info;
};
</script>

<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <transition-group name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="[
          'flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg min-w-80 max-w-md',
          getColorClasses(toast.type),
        ]"
      >
        <component :is="getIcon(toast.type)" :size="20" />
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
        <button
          @click="toastStore.remove(toast.id)"
          class="hover:opacity-75 transition"
        >
          <X :size="18" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
