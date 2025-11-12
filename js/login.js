// js/login.js
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

        const urlApiLogin = 'https://agenddev.onrender.com'; // Constante com a URL do servidor + rota de login da API

        fetch(urlApiLogin, { //Usamos o fetch para fazer a requisicao para a API
            method: 'POST', //Metodo POST para enviar dados
            headers: { 'Content-Type': 'application/json' }, //Cabeçalhos indicando que o corpo da requisição é JSON
            body: JSON.stringify(dadosParaEnviar) //Corpo da requisicao convertido para JSON
        })
            .then(response => response.json()) //Converte a resposta para JSON
            .then(data => { //Aqui tratamos os dados retornados pela API

                console.log('Resposta completa da API:', data); // Login completo da resposta

                if (data.status === 'sucesso') {
                    // Salva os dados do usuário no "cofre"
                    localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));

                    // Redireciona com base no tipo de usuário
                    // .trim() remove espaços em branco no início e no fim
                    // .toLowerCase() converte tudo para minúsculo
                    if (data.usuario.tipo.trim().toLowerCase() === 'admin') {

                        // *** AQUI ESTÁ A CORREÇÃO QUE FALTAVA ***
                        window.location.href = 'admin.html'; // Se for Admin, vai para o painel do admin

                    } else {
                        // Se for qualquer outra coisa (Docente), vai para a reserva
                        window.location.href = 'reserva.html';
                    }

                    // *** ESTE 'else' ESTAVA NO LUGAR ERRADO ANTES ***
                } else {
                    // Se o back-end deu erro (ex: senha errada)
                    alert('Erro no login: ' + data.mensagem); // Mostramos o erro retornado pela API
                }
            })
            .catch(error => { //Captura erros de rede ou outros problemas
                console.error('Erro ao conectar com a API:', error);
                alert('Não foi possível conectar ao servidor.');
            });
    });
});