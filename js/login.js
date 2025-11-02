// login.js
document.addEventListener('DOMContentLoaded', function () { //serve para que o js seja carregado depois do html

    const formLogin = document.getElementById('form-login'); //Pega o campo do formulario com id especifico
    const emailInput = document.getElementById('usuario-email');//Pega o campo do formulario com id especifico
    const senhaInput = document.getElementById('senha-login');//Pega o campo do formulario com id especifico

    formLogin.addEventListener('submit', function (event) {//Adiciona um evento de escuta para o formulario, quando for submetido

        event.preventDefault();//Impede o comportamento padrao do formulario (recarregar a pagina)

        const dadosParaEnviar = { //Cria um objeto com os dados do formulario para enviar para a API
            email: emailInput.value, //Pega o valor do campo email
            senha: senhaInput.value //Pega o valor do campo senha
        };

        const urlApiLogin = 'http://127.0.0.1:5000/login'; // Constante com a URL do servidor + rota de login da API

        fetch(urlApiLogin, { //Usamos o fetch para fazer a requisicao para a API
            method: 'POST', //Metodo POST para enviar dados
            headers: { 'Content-Type': 'application/json' }, //Cabeçalhos indicando que o corpo da requisição é JSON
            body: JSON.stringify(dadosParaEnviar) //Corpo da requisicao convertido para JSON; stringify converte o objeto em string JSON, ou seja, transforma o objeto em um formato que pode ser enviado pela rede
        })
            .then(response => response.json()) //then serve para tratar a resposta da API, convertendo a resposta para JSON
            .then(data => { //Aqui tratamos os dados recebidos da API

                if (data.status === 'sucesso') { // Verifica se o status retornado é 'sucesso'
                    // SUCESSO! (Aqui não mostramos nenhum alerta)

                    // Apenas salvamos os dados do usuário no "cofre"
                    localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario)); // Armazenamos os dados do usuario no armazenamento local do navegador

                    // E redirecionamos imediatamente. Isso é a confirmação.
                    window.location.href = 'reserva.html';

                } else {
                    // ERRO! (Aqui sim, mostramos o alerta)
                    alert('Erro no login: ' + data.mensagem); // Mostramos o erro retornado pela API
                }
            })
            .catch(error => { //Captura erros de rede ou outros problemas
                console.error('Erro ao conectar com a API:', error);
                alert('Não foi possível conectar ao servidor.');
            });
    });
});