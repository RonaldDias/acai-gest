<script setup>
import { useRouter } from 'vue-router';
import { Store, BarChart2, TrendingUp, ShieldCheck, CheckCircle2, ChevronRight, Smartphone } from 'lucide-vue-next';

const router = useRouter();

function goToLogin() {
  router.push('/login');
}

function goToCadastro() {
  router.push('/cadastro/termos');
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-white font-sans selection:bg-purple-600 selection:text-white">
    <!-- Navbar -->
    <nav class="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center gap-3">
            <img src="/logo.jpg" alt="Açaí Gest Logo" class="h-10 w-10 md:h-12 md:w-12 rounded-xl object-cover shadow-lg shadow-purple-500/20" />
            <span class="text-xl md:text-2xl font-bold tracking-tight">Açaí <span class="text-purple-500">Gest</span></span>
          </div>
          <div class="flex items-center space-x-2 md:space-x-8">
            <a href="#funcionalidades" class="hidden md:block text-sm font-medium text-slate-300 hover:text-white transition">Como Funciona</a>
            <a href="#precos" class="hidden md:block text-sm font-medium text-slate-300 hover:text-white transition">Planos</a>
            <button @click="goToLogin" class="text-xs md:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-3 md:px-5 py-2 md:py-2.5 rounded-lg transition">Login</button>
            <button @click="goToCadastro" class="text-xs md:text-sm font-bold text-slate-900 bg-green-400 hover:bg-green-500 hover:scale-105 px-4 md:px-6 py-2 md:py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(7ade80,0.3)]">Criar Conta</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden relative">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/30 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-8">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          O 1º Sistema Focado em pontos de Açaí batido
        </div>
        
        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Assuma o controle total.<br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Saia do caderninho.</span>
        </h1>
        
        <p class="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Pare de perder dinheiro sem saber quanto açaí tem no freezer. Um PDV rápido, controle de litros (grosso, médio, popular) e relatórios no seu computador ou celular.
        </p>
        
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button @click="goToCadastro" class="group flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-slate-900 text-lg font-bold px-8 py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-105">
            Começar Agora
            <ChevronRight class="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>

    <!-- Social Proof -->
    <section class="py-10 border-y border-white/5 bg-slate-900/50">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">A escolha inteligente para pontos de venda no Norte e Nordeste</p>
        <div class="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
          <!-- Placeholder Logos -->
          <div class="flex items-center gap-2 font-bold text-xl"><Store /> Açaí do Chef</div>
          <div class="flex items-center gap-2 font-bold text-xl"><Store /> Ponto do Açaí</div>
          <div class="flex items-center gap-2 font-bold text-xl"><Store /> Rei da Polpa</div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="funcionalidades" class="py-24 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">Tudo o que o seu ponto precisa.</h2>
          <p class="text-xl text-slate-400">Desenvolvido entendendo a realidade de quem bate o açaí todo dia.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition shadow-xl shadow-black/50">
            <div class="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6">
              <BarChart2 size="28" />
            </div>
            <h3 class="text-2xl font-bold mb-4">Estoque exato em Litros</h3>
            <p class="text-slate-400 leading-relaxed">
              Cadastre seu açaí grosso, médio e popular. Saiba exatamente quanto foi batido e quanto foi vendido, sem furos.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition shadow-xl shadow-black/50">
            <div class="w-14 h-14 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp size="28" />
            </div>
            <h3 class="text-2xl font-bold mb-4">Frente de Caixa (PDV)</h3>
            <p class="text-slate-400 leading-relaxed">
              Lance vendas em segundos. Seus vendedores não precisam de treinamento. Menos filas e mais lucro pro seu bolso.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition shadow-xl shadow-black/50">
            <div class="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
              <Smartphone size="28" />
            </div>
            <h3 class="text-2xl font-bold mb-4">Múltiplos Pontos</h3>
            <p class="text-slate-400 leading-relaxed">
              Tem mais de um ponto de venda? Acompanhe o saldo e o estoque de todos eles na palma da sua mão usando o plano Top.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="precos" class="py-24 bg-slate-900 border-t border-slate-800/50 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">Planos simples e transparentes.</h2>
          <p class="text-xl text-slate-400">Custa para o mês inteiro menos do que você fatura em apenas 1 dia.</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Básico Plan -->
          <div class="bg-slate-800 border border-slate-700 rounded-3xl p-8 relative flex flex-col">
            <h3 class="text-2xl font-bold mb-2">Básico</h3>
            <p class="text-slate-400 mb-6">Perfeito para quem gerencia um único ponto de venda.</p>
            <div class="mb-8">
              <span class="text-5xl font-extrabold">R$ 149</span><span class="text-slate-400">/mês</span>
            </div>
            
            <ul class="space-y-4 mb-8 flex-1">
              <li class="flex items-center gap-3 text-slate-300">
                <CheckCircle2 class="text-green-400 flex-shrink-0" size="20"/> 1 Ponto de Venda
              </li>
              <li class="flex items-center gap-3 text-slate-300">
                <CheckCircle2 class="text-green-400 flex-shrink-0" size="20"/> Frente de Caixa (PDV)
              </li>
              <li class="flex items-center gap-3 text-slate-300">
                <CheckCircle2 class="text-green-400 flex-shrink-0" size="20"/> Controle de Estoque
              </li>
              <li class="flex items-center gap-3 text-slate-300">
                <CheckCircle2 class="text-green-400 flex-shrink-0" size="20"/> Relatórios Básicos
              </li>
            </ul>

            <button @click="goToCadastro" class="w-full py-4 rounded-xl font-bold text-white bg-slate-700 hover:bg-slate-600 transition">
              Escolher Básico
            </button>
          </div>

          <!-- Top Plan -->
          <div class="bg-gradient-to-b from-purple-900 to-slate-900 border-2 border-purple-500 rounded-3xl p-8 relative flex flex-col shadow-[0_0_40px_rgba(168,85,247,0.15)] transform md:-translate-y-4">
            <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
              Mais Vendido
            </div>
            <h3 class="text-2xl font-bold mb-2">Plano Top</h3>
            <p class="text-purple-200 mb-6">Para quem domina a região com múltiplas lojas.</p>
            <div class="mb-8">
              <span class="text-5xl font-extrabold">R$ 249</span><span class="text-purple-300">/mês</span>
            </div>
            
            <ul class="space-y-4 mb-8 flex-1">
              <li class="flex items-center gap-3 text-white">
                <CheckCircle2 class="text-green-400 flex-shrink-0" size="20"/> <b>Até 3 Pontos de Venda</b>
              </li>
              <li class="flex items-center gap-3 text-slate-300">
                <CheckCircle2 class="text-green-400 flex-shrink-0" size="20"/> Todas as funções do Básico
              </li>
              <li class="flex items-center gap-3 text-slate-300">
                <CheckCircle2 class="text-green-400 flex-shrink-0" size="20"/> Alternância rápida entre pontos
              </li>
              <li class="flex items-center gap-3 text-slate-300">
                <CheckCircle2 class="text-green-400 flex-shrink-0" size="20"/> Visão consolidada do fluxo
              </li>
            </ul>

            <button @click="goToCadastro" class="w-full py-4 rounded-xl font-bold text-slate-900 bg-green-400 hover:bg-green-500 shadow-[0_0_20px_rgba(7ade80,0.3)] transition transform hover:scale-105">
              Escolher Top
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer CTA & Footer -->
    <section class="py-20 relative overflow-hidden">
      <div class="absolute inset-0 bg-purple-900/20"></div>
      <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 class="text-3xl md:text-5xl font-bold mb-6">Pronto para a revolução no seu ponto de venda?</h2>
        <p class="text-lg text-slate-400 mb-10">Acesse o Açaí Gest hoje mesmo e veja as vendas dispararem enquanto os furos somem.</p>
        <button @click="goToCadastro" class="bg-white text-slate-900 text-lg font-bold px-10 py-4 rounded-xl transition hover:scale-105 shadow-xl shadow-white/10">
          Criar conta agora
        </button>
      </div>
    </section>

    <footer class="bg-black py-8 border-t border-white/10 text-center">
      <div class="flex items-center justify-center gap-3 mb-4">
        <img src="/logo.jpg" alt="Açaí Gest Logo" class="h-8 w-8 rounded-lg object-cover opacity-80" />
        <span class="text-xl font-bold tracking-tight">Açaí <span class="text-purple-500">Gest</span></span>
      </div>
      <p class="text-slate-500 text-sm">© {{ new Date().getFullYear() }} Açaí Gest. Todos os direitos reservados.</p>
    </footer>
  </div>
</template>
