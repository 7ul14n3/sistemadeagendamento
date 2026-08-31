// js/cadastro.js
document.addEventListener('DOMContentLoaded', function () {

    const formCadastro = document.getElementById('form-cadastro');

    // --- CORREÇÃO AQUI ---
    // Atualizei os IDs para baterem exatamente com o seu HTML atual
    const nomeInput = document.getElementById('nome');
    const matriculaInput = document.getElementById('codigo'); // No HTML é 'codigo', na API será enviado como 'matricula'
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    // ---------------------

    // Se o formulário não existir nesta página, para o script
    if (!formCadastro) return;

    formCadastro.addEventListener('submit', function (event) {
        event.preventDefault();

        // Verificação de segurança extra para garantir que os campos foram encontrados
        if (!nomeInput || !matriculaInput || !emailInput || !senhaInput) {
            console.error("Erro: Um ou mais campos não foram encontrados no HTML.");
            alert("Erro interno: campos do formulário não encontrados.");
            return;
        }

        const dadosParaEnviar = {
            nome: nomeInput.value,
            matricula: matriculaInput.value, // Pega do input 'codigo'
            email: emailInput.value,
            senha: senhaInput.value
        };

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
                    window.location.href = 'login.html';
                } else {
                    alert('Erro no cadastro: ' + (data.mensagem || 'Erro desconhecido'));
                }
            })
            .catch(error => {
                console.error('Erro ao conectar com a API:', error);
                alert('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
            });
    });
});