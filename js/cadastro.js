// js/cadastro.js
// (Adaptado para os IDs do HTML 'cadastro.html' que sua equipe fez)
document.addEventListener('DOMContentLoaded', function () {

    // Assumindo que os IDs em 'cadastro.html' são parecidos com os do login
    const formCadastro = document.getElementById('form-cadastro');
    const nomeInput = document.getElementById('nome-cadastro'); // VERIFICAR ESTE ID
    const matriculaInput = document.getElementById('matricula-cadastro'); // VERIFICAR ESTE ID
    const emailInput = document.getElementById('email-cadastro'); // VERIFICAR ESTE ID
    const senhaInput = document.getElementById('senha-cadastro'); // VERIFICAR ESTE ID

    // Se o formulário não existir nesta página, para o script
    if (!formCadastro) return;

    formCadastro.addEventListener('submit', function (event) {
        event.preventDefault();

        const dadosParaEnviar = {
            nome: nomeInput.value,
            matricula: matriculaInput.value,
            email: emailInput.value,
            senha: senhaInput.value
        };

        // URL da API no Render (corrigida)
        const urlApiCadastro = 'https://agenddev.onrender.com/cadastro';

        fetch(urlApiCadastro, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaEnviar)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'sucesso') {
                    alert(data.mensagem);
                    window.location.href = 'login.html'; // Redireciona para o login
                } else {
                    alert('Erro no cadastro: ' + data.mensagem);
                }
            })
            .catch(error => {
                console.error('Erro ao conectar com a API:', error);
                alert('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
            });
    });
});