/* ==========================================================================
   AGENDDEV - SISTEMA DE ACESSIBILIDADE (MODO ESCURO & TAMANHO DE FONTE)
   ========================================================================== */

// Função Global: Alternar Modo Escuro / Alto Contraste
window.alternarTema = function () {
  document.body.classList.toggle('alto-contraste');
  const estaEscuro = document.body.classList.contains('alto-contraste');
  localStorage.setItem('tema_escuro', estaEscuro ? 'ativo' : 'inativo');
};

// Função Global: Alternar Tamanho da Fonte (Normal, Média, Grande)
window.mudarFonte = function (acao) {
  const body = document.body;
  if (acao === 'aumentar') {
    if (body.classList.contains('fonte-media')) {
      body.classList.remove('fonte-media');
      body.classList.add('fonte-grande');
    } else if (!body.classList.contains('fonte-grande')) {
      body.classList.add('fonte-media');
    }
  } else if (acao === 'diminuir') {
    if (body.classList.contains('fonte-grande')) {
      body.classList.remove('fonte-grande');
      body.classList.add('fonte-media');
    } else {
      body.classList.remove('fonte-media');
    }
  }
};

// Executa automaticamente ao carregar qualquer página
document.addEventListener('DOMContentLoaded', () => {
  // 1. Aplica o tema salvo no localStorage
  if (localStorage.getItem('tema_escuro') === 'ativo') {
    document.body.classList.add('alto-contraste');
  }

  // 2. Mapeamento de cliques caso o HTML use id="" em vez de onclick=""
  const btnAumentar = document.getElementById('aumentar-fonte');
  const btnDiminuir = document.getElementById('diminuir-fonte');
  const btnContraste = document.getElementById('alternar-contraste');

  if (btnAumentar) btnAumentar.addEventListener('click', () => window.mudarFonte('aumentar'));
  if (btnDiminuir) btnDiminuir.addEventListener('click', () => window.mudarFonte('diminuir'));
  if (btnContraste) btnContraste.addEventListener('click', () => window.alternarTema());
});
