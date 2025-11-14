document.addEventListener('DOMContentLoaded', function () {
    const body = document.body;
    const btnAltoContraste = document.getElementById('alternar-contraste');
    const btnAumentar = document.getElementById('aumentar-fonte');
    const btnDiminuir = document.getElementById('diminuir-fonte');

    // --- GRUPO 1: ALTO CONTRASTE ---
    // Verifica se os botões existem antes de adicionar "ouvintes"
    if (btnAltoContraste) {
        // Verifica se o usuário já tinha ativado o contraste antes
        if (localStorage.getItem('altoContraste') === 'true') {
            body.classList.add('alto-contraste');
        }

        btnAltoContraste.addEventListener('click', function () {
            body.classList.toggle('alto-contraste');
            localStorage.setItem('altoContraste', body.classList.contains('alto-contraste'));
        });
    }

    // --- GRUPO 2: TAMANHO DA FONTE ---
    const tamanhos = ['fonte-normal', 'fonte-media', 'fonte-grande'];
    let indiceTamanho = 0;

    const tamanhoSalvo = localStorage.getItem('tamanhoFonte');
    if (tamanhoSalvo) {
        indiceTamanho = tamanhos.indexOf(tamanhoSalvo);
        if (indiceTamanho === -1) indiceTamanho = 0; // Reseta se o valor salvo for inválido
    }

    // Aplica a classe inicial (mesmo se os botões não existirem)
    // Remove classes antigas primeiro para garantir
    body.classList.remove('fonte-normal', 'fonte-media', 'fonte-grande');
    body.classList.add(tamanhos[indiceTamanho]);

    // Verifica se os botões de fonte existem
    if (btnAumentar && btnDiminuir) {
        btnAumentar.addEventListener('click', function () {
            if (indiceTamanho < tamanhos.length - 1) {
                body.classList.remove(tamanhos[indiceTamanho]);
                indiceTamanho++;
                body.classList.add(tamanhos[indiceTamanho]);
                localStorage.setItem('tamanhoFonte', tamanhos[indiceTamanho]);
            }
        });

        btnDiminuir.addEventListener('click', function () {
            if (indiceTamanho > 0) {
                body.classList.remove(tamanhos[indiceTamanho]);
                indiceTamanho--;
                body.classList.add(tamanhos[indiceTamanho]);
                localStorage.setItem('tamanhoFonte', tamanhos[indiceTamanho]);
            }
        });
    }
});