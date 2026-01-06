<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const aceitouTermos = ref(false);

function continuar() {
  if (!aceitouTermos.value) {
    return;
  }

  // TODO Backend: Salvar aceite dos termos no banco
  // POST /api/usuarios/aceitar-termos
  // { userId, aceitouTermos: true, dataAceite: new Date(), versaoTermos: '1.0' }

  localStorage.setItem("aceitouTermos", "true");

  router.push("/cadastro");
}

function voltar() {
  router.push("/");
}
</script>
<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center p-4"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden"
    >
      <div class="bg-purple-700 text-white p-6">
        <div class="flex items-center space-x-3">
          <FileText :size="32" />
          <div>
            <h1 class="text-2xl font-bold">Termos de Uso</h1>
            <p class="text-sm opacity-90">
              Leia atentamente antes de continuar
            </p>
          </div>
        </div>
      </div>

      <div class="p-6 max-h-96 overflow-y-auto bg-gray-50">
        <div class="prose prose-sm max-w-none text-gray-700 space-y-4">
          <h2 class="text-xl font-bold text-gray-800">
            1. Aceitação dos Termos
          </h2>
          <p>
            Ao utilizar o AçaíGest, você concorda em cumprir estes Termos de
            Uso. Se você não concordar com algum destes termos, não utilize o
            sistema.
          </p>

          <h2 class="text-xl font-bold text-gray-800">
            2. Descrição do Serviço
          </h2>
          <p>
            O AçaíGest é um sistema de gestão completa para pontos de venda de
            açaí, oferecendo funcionalidades de controle de vendas, estoque,
            fluxo de caixa e relatórios.
          </p>

          <h2 class="text-xl font-bold text-gray-800">3. Cadastro e Conta</h2>
          <p>
            Para utilizar o sistema, você deve fornecer informações verdadeiras,
            completas e atualizadas. Você é responsável por manter a
            confidencialidade de sua senha e pela segurança de sua conta.
          </p>

          <h2 class="text-xl font-bold text-gray-800">4. Uso Permitido</h2>
          <p>
            O sistema deve ser utilizado apenas para fins comerciais legítimos
            relacionados à gestão de pontos de venda de açaí. É proibido:
          </p>
          <ul class="list-disc pl-6">
            <li>Utilizar o sistema para atividades ilegais</li>
            <li>Tentar acessar áreas restritas do sistema</li>
            <li>
              Compartilhar credenciais de acesso com terceiros não autorizados
            </li>
            <li>Realizar engenharia reversa ou copiar o código do sistema</li>
          </ul>

          <h2 class="text-xl font-bold text-gray-800">5. Planos e Pagamento</h2>
          <p>
            O acesso ao sistema está condicionado ao pagamento do plano
            escolhido. Os valores e funcionalidades de cada plano estão
            disponíveis na página de cadastro.
          </p>

          <h2 class="text-xl font-bold text-gray-800">
            6. Dados e Privacidade
          </h2>
          <p>
            Seus dados são tratados conforme nossa Política de Privacidade e a
            Lei Geral de Proteção de Dados (LGPD). Comprometemo-nos a proteger
            suas informações e não compartilhá-las com terceiros sem sua
            autorização.
          </p>

          <h2 class="text-xl font-bold text-gray-800">
            7. Propriedade Intelectual
          </h2>
          <p>
            Todo o conteúdo, design, código e funcionalidades do AçaíGest são de
            propriedade exclusiva da empresa e protegidos por direitos autorais.
          </p>

          <h2 class="text-xl font-bold text-gray-800">
            8. Limitação de Responsabilidade
          </h2>
          <p>
            O sistema é fornecido "como está". Não nos responsabilizamos por
            perdas de dados, interrupções de serviço ou danos indiretos
            decorrentes do uso do sistema.
          </p>

          <h2 class="text-xl font-bold text-gray-800">9. Cancelamento</h2>
          <p>
            Você pode cancelar sua assinatura a qualquer momento. O cancelamento
            terá efeito ao final do período de cobrança atual.
          </p>

          <h2 class="text-xl font-bold text-gray-800">
            10. Modificações dos Termos
          </h2>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer
            momento. Notificaremos os usuários sobre mudanças significativas
            através do email cadastrado.
          </p>

          <h2 class="text-xl font-bold text-gray-800">11. Contato</h2>
          <p>
            Em caso de dúvidas sobre estes Termos de Uso, entre em contato
            através do email: acaigest@gmail.com
          </p>

          <p class="text-sm text-gray-500 mt-6">
            Última atualização: {{ new Date().toLocaleDateString("pt-BR") }}
          </p>
        </div>
      </div>

      <div class="p-6 bg-white border-t border-gray-200">
        <div class="flex items-start space-x-3 mb-6">
          <input
            id="termos-checkbox"
            v-model="aceitouTermos"
            type="checkbox"
            class="mt-1 w-5 h-5 text-purple-700 rounded focus:ring-purple-600"
          />
          <label for="termos-checkbox" class="text-gray-700 cursor-pointer">
            Li e aceito os <strong>Termos de Uso</strong> do AçaíGest
          </label>
        </div>

        <div class="flex space-x-3">
          <button
            @click="voltar"
            class="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
          >
            Voltar
          </button>
          <button
            @click="continuar"
            :disabled="!aceitouTermos"
            class="flex-1 bg-purple-700 text-white py-3 rounded-lg font-semibold hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar para Cadastro
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
