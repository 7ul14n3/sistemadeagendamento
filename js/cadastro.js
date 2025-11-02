// js/cadastro.js
document.addEventListener('DOMContentLoaded', function () {

    // --- PASSO 1: Pegar referências (AGORA COM OS IDs CORRETOS) ---
    const formCadastro = document.getElementById('form-cadastro');

    // Pegando os campos pelos IDs do seu HTML
    const nomeInput = document.getElementById('nome');
    const matriculaInput = document.getElementById('codigo'); // <-- MUDANÇA AQUI
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');

    // --- PASSO 2: Adicionar o "Ouvinte de Evento" ---
    formCadastro.addEventListener('submit', function (event) {

        event.preventDefault(); // Impede o recarregamento da página

        // --- PASSO 3: Coletar os Dados Digitados ---
        const nome = nomeInput.value;
        const matricula = matriculaInput.value; // <-- MUDANÇA AQUI
        const email = emailInput.value;
        const senha = senhaInput.value;

        // --- PASSO 4: Montar o "Pacote" JSON ---
        // Os nomes das chaves (nome, matricula, email, senha)
        // devem ser EXATAMENTE os que a sua API Python espera!
        const dadosParaEnviar = {
            nome: nome,
            matricula: matricula, // <-- MUDANÇA AQUI
            email: email,
            senha: senha
        };

        // --- PASSO 5: Ligar para a API (O Fetch!) ---
        const urlApiCadastro = 'http://127.0.0.1:5000/cadastro';

        const opcoesFetch = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosParaEnviar)
        };

        fetch(urlApiCadastro, opcoesFetch)
            .then(response => response.json())
            .then(data => {
                // --- PASSO 6: Lidar com a Resposta da API ---
                if (data.status === 'sucesso') {
                    alert(data.mensagem); // "Usuário cadastrado com sucesso!"
                    // Redireciona para a página de login
                    window.location.href = 'login.html';
                } else {
                    // Mostra qualquer erro do back-end (ex: "Email já cadastrado")
                    alert('Erro no cadastro: ' + data.mensagem);
                }
            })
            .catch(error => {
                // --- PASSO 7: Lidar com Erros de Rede ---
                console.error('Erro ao conectar com a API:', error);
                alert('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
            });
    });
});