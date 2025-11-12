// js/reserva.js
document.addEventListener('DOMContentLoaded', function () {

    // --- PASSO 1: VERIFICAR SE O USUÁRIO ESTÁ LOGADO ---

    // Pega os dados do usuário do "cofre" (localStorage) que salvamos no login
    const dadosUsuarioString = localStorage.getItem('usuarioLogado');

    if (!dadosUsuarioString) {
        // Se não encontrou dados no cofre, o usuário não está logado!
        alert('Você precisa estar logado para acessar esta página.');
        // Envia o usuário de volta para a página de login
        window.location.href = 'login.html';
        return; // Para a execução do script
    }

    // Se encontrou, transforma a string JSON de volta em um objeto
    const usuarioLogado = JSON.parse(dadosUsuarioString);

    // --- PASSO 2: PEGAR REFERÊNCIAS DOS ELEMENTOS DO HTML ---

    const formReserva = document.getElementById('form-reserva');
    const tipoReservaSelect = document.getElementById('tipo-reserva');
    const salaSelect = document.getElementById('sala'); // Serve para pegar o valor da sala
    const dataInput = document.getElementById('data'); // Serve para o Flatpickr,ou seja, o calendário
    const inicioInput = document.getElementById('horario-inicio'); // O input de início
    const fimInput = document.getElementById('horario-fim');     // O input de fim
    const materiaisInput = document.getElementById('materiais'); // Seu ID de solicitações
    const finalidadeInput = document.getElementById('finalidade'); // O input de finalidade
    const historicoDiv = document.getElementById('lista-agendamentos'); // Onde mostraremos o histórico
    const salaLabel = document.querySelector('label[for="sala"]'); // Serve para mostrar/ocultar o rótulo da sala

    tipoReservaSelect.addEventListener('change', gerenciarVisibilidadeSala); // "Ouvir" mudanças no tipo de reserva

    // URL base da nossa API (do 'flask run')
    const API_URL = 'http://127.0.0.1:5000';

    // --- PASSO 3: CONFIGURAR O CALENDÁRIO (FLATPICKR) ---

    // O Flatpickr "se agarra" ao nosso input de data
    flatpickr(dataInput, {
        dateFormat: "Y-m-d", // Formato AAAA-MM-DD (o que a API espera)
        minDate: "today",    // Não deixa agendar no passado
        "disable": [
            function (date) {
                // Desabilita Sábados (6) e Domingos (0)
                return (date.getDay() === 0 || date.getDay() === 6);
            }
        ],
        // O que fazer quando o usuário MUDA a data:
        onChange: function (selectedDates, dateStr, instance) {
            // Quando a data muda, vamos buscar os horários ocupados
            buscarHorariosOcupados(dateStr);
        }
    });

    // --- PASSO 4: FUNÇÃO PARA BUSCAR HORÁRIOS OCUPADOS ---

    function buscarHorariosOcupados(data) {
        console.log(`Buscando horários para o dia: ${data}`);

        fetch(`${API_URL}/agendamentos/${data}`) // Chama a API que fizemos
            .then(response => response.json())
            .then(horarios => {
                console.log('Horários já ocupados:', horarios);
                // Aqui você pode adicionar lógica futura para mostrar
                // os horários ocupados em algum lugar na tela.
            })
            .catch(error => console.error('Erro ao buscar horários:', error));
    }

    // --- PASSO 5: Gerenciar a exibição do campo "sala" ---

    function gerenciarVisibilidadeSala() { // Função para mostrar/ocultar o campo "sala"
        const tipoSelecionado = tipoReservaSelect.value; // Pega o valor selecionado do tipo de reserva

        if (tipoSelecionado === 'Laboratório de Informática - Sede') {
            // Se for esse tipo, mostra o campo "sala"
            salaLabel.style.display = 'block'; // Mostra o rótulo que indica a sala
            salaSelect.style.display = 'block'; // Mostra o select das salas que são do laboratório
            salaSelect.disabled = false; // Habilita o select para o usuário escolher a sala
        } else {
            // Se for outro tipo, oculta o campo "sala"
            salaLabel.style.display = 'none'; // Oculta o rótulo da sala
            salaSelect.style.display = 'none'; // Oculta o select das salas
            salaSelect.disabled = true; // Desabilita o select para evitar confusão
        }
    }

    // --- PASSO 6: FUNÇÃO PARA CARREGAR O HISTÓRICO DO USUÁRIO ---

    function carregarHistorico() {
        // Pega o e-mail do usuário que salvamos no "cofre"
        const emailUsuario = usuarioLogado.email;

        // Limpa o histórico atual (para não duplicar)
        historicoDiv.innerHTML = '<p>Carregando seu histórico...</p>';

        // Chama a API de histórico que você criou (usando e-mail)
        fetch(`${API_URL}/meus-agendamentos/${emailUsuario}`)
            .then(response => response.json())
            .then(agendamentos => {
                historicoDiv.innerHTML = ''; // Limpa o "Carregando..."

                if (agendamentos.length === 0) {
                    historicoDiv.innerHTML = '<p>Você ainda não possui agendamentos.</p>';
                    return;
                }

                // Cria o HTML para cada agendamento
                agendamentos.forEach(ag => {
                    const item = document.createElement('div');
                    item.className = 'item-historico'; // Para o CSS estilizar
                    item.innerHTML = `
                        <strong>${ag.tipo_reserva} ${ag.sala ? '(' + ag.sala + ')' : ''}</strong>
                        <p>Data: ${ag.data} (${ag.horario_inicio} - ${ag.horario_fim})</p>
                        <p>Finalidade: ${ag.finalidade}</p>
                        <p>Status: <span class="status-${ag.status.toLowerCase()}">${ag.status}</span></p>
                    `;
                    historicoDiv.appendChild(item);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar histórico:', error);
                historicoDiv.innerHTML = '<p>Erro ao carregar seu histórico. Tente recarregar a página.</p>';
            });
    }

    // --- PASSO 7: "OUVIR" O ENVIO DO FORMULÁRIO ---

    formReserva.addEventListener('submit', function (event) {
        event.preventDefault(); // Impede o recarregamento da página

        // Monta o "pacote" JSON para enviar
        const dadosReserva = {
            tipo_reserva: tipoReservaSelect.value,
            sala: salaSelect.value,
            data: dataInput.value,
            horario_inicio: inicioInput.value, // Nosso novo campo de início
            horario_fim: fimInput.value,       // Nosso novo campo de fim
            finalidade: finalidadeInput.value,
            solicitacoes: materiaisInput.value,  // Mapeado do ID 'materiais' para 'solicitacoes'
            email_usuario: usuarioLogado.email // Identificador do usuário logado
        };

        // --- PASSO 8: ENVIAR A RESERVA PARA A API ---

        fetch(`${API_URL}/reservar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosReserva)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'sucesso') {
                    alert(data.mensagem); // "Reserva realizada com sucesso!"
                    formReserva.reset(); // Limpa o formulário
                    // Recarrega o histórico para mostrar a nova reserva IMEDIATAMENTE
                    carregarHistorico();
                } else {
                    // Mostra qualquer erro do back-end (ex: "Conflito de horário!")
                    alert('Erro na reserva: ' + data.mensagem);
                }
            })
            .catch(error => {
                console.error('Erro ao enviar reserva:', error);
                alert('Não foi possível conectar ao servidor para fazer a reserva.');
            });
    });


    // --- PASSO 9: INICIALIZAÇÃO DA PÁGINA ---

    carregarHistorico(); // Assim que a página carrega, mostramos o histórico
    gerenciarVisibilidadeSala(); // Configura a visibilidade inicial do campo "sala"
});