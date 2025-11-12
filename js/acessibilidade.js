// js/acessibilidade.js
document.addEventListener('DOMContentLoaded', function () { //serve para garantir que o DOM esteja carregado antes de executar o script, ou seja, que todos os elementos HTML estejam disponíveis para manipulação.

    // --- GRUPO 1: ALTO CONTRASTE ---
    const body = document.body; // Seleciona o elemento body
    const btnAltoContraste = document.getElementById('alternar-contraste'); // Seleciona o botão de contraste

    // Verifica se o usuário já tinha ativado o contraste antes
    if (localStorage.getItem('altoContraste') === 'true') {
        body.classList.add('alto-contraste'); // Adiciona a classe de alto contraste ao body
    }

    btnAltoContraste.addEventListener('click', function () { // Adiciona o evento de clique ao botão
        // Adiciona ou remove a classe do body
        body.classList.toggle('alto-contraste'); // Alterna a classe de alto contraste

        // Salva a escolha do usuário no "cofre" do navegador
        localStorage.setItem('altoContraste', body.classList.contains('alto-contraste')); // Salva true ou false
    });

    // --- GRUPO 2: TAMANHO DA FONTE ---
    const btnAumentar = document.getElementById('aumentar-fonte'); // Seleciona o botão de aumentar fonte
    const btnDiminuir = document.getElementById('diminuir-fonte'); // Seleciona o botão de diminuir fonte

    // Define os tamanhos e o tamanho atual
    const tamanhos = ['fonte-normal', 'fonte-media', 'fonte-grande'];
    let indiceTamanho = 0; // Começa com 'fonte-normal'

    // Verifica se o usuário já tinha um tamanho salvo
    const tamanhoSalvo = localStorage.getItem('tamanhoFonte');
    if (tamanhoSalvo) {
        indiceTamanho = tamanhos.indexOf(tamanhoSalvo);
    } // Atualiza o índice para o tamanho salvo
    body.classList.add(tamanhos[indiceTamanho]); // Adiciona a classe salva (ou a padrão)

    btnAumentar.addEventListener('click', function () {// Adiciona o evento de clique ao botão
        if (indiceTamanho < tamanhos.length - 1) { // Só aumenta se não for o último
            body.classList.remove(tamanhos[indiceTamanho]);
            indiceTamanho++;
            body.classList.add(tamanhos[indiceTamanho]);
            localStorage.setItem('tamanhoFonte', tamanhos[indiceTamanho]); // Salva a escolha
        }
    });

    btnDiminuir.addEventListener('click', function () {
        if (indiceTamanho > 0) { // Só diminui se não for o primeiro
            body.classList.remove(tamanhos[indiceTamanho]);
            indiceTamanho--;
            body.classList.add(tamanhos[indiceTamanho]);
            localStorage.setItem('tamanhoFonte', tamanhos[indiceTamanho]); // Salva a escolha
        }
    });
});