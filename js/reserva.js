// js/reserva.js
document.addEventListener('DOMContentLoaded', function () {

    // Se o formulário de reserva não está nesta página, para o script
    const formReserva = document.getElementById('form-reserva');
    if (!formReserva) return;

    // --- PASSO 1: VERIFICAR SE O USUÁRIO ESTÁ LOGADO ---
    const dadosUsuarioString = localStorage.getItem('usuarioLogado');
    if (!dadosUsuarioString) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = 'login.html';
        return;
    }
    const usuarioLogado = JSON.parse(dadosUsuarioString);

    // --- PASSO 2: PEGAR REFERÊNCIAS DOS ELEMENTOS ---
    const tipoReservaSelect = document.getElementById('tipo-reserva');
    const salaSelect = document.getElementById('sala');
    const salaLabel = document.querySelector('label[for="sala"]');
    const dataInput = document.getElementById('data');
    const inicioInput = document.getElementById('horario-inicio');
    const fimInput = document.getElementById('horario-fim');
    const materiaisInput = document.getElementById('materiais');
    const finalidadeInput = document.getElementById('finalidade');
    const historicoDiv = document.getElementById('lista-agendamentos');
    const API_URL = 'https://agenddev.onrender.com'; // URL base do Render

    // --- PASSO 3: CONFIGURAR O CALENDÁRIO ---
    flatpickr(dataInput, {
        dateFormat: "Y-m-d",
        minDate: "today",
        "disable": [
            function (date) { return (date.getDay() === 0 || date.getDay() === 6); }
        ],
        onChange: function (selectedDates, dateStr, instance) {
            buscarHorariosOcupados(dateStr);
        }
    });

    // --- PASSO 4: FUNÇÃO PARA BUSCAR HORÁRIOS OCUPADOS ---
    function buscarHorariosOcupados(data) {
        console.log(`Buscando horários para o dia: ${data}`);
        fetch(`${API_URL}/agendamentos/${data}`)
            .then(response => response.json())
            .then(horarios => {
                console.log('Horários já ocupados:', horarios);
            })
            .catch(error => console.error('Erro ao buscar horários:', error));
    }

    // --- PASSO 5: FUNÇÃO PARA CARREGAR O HISTÓRICO DO USUÁRIO ---
    function carregarHistorico() {
        const emailUsuario = usuarioLogado.email;
        historicoDiv.innerHTML = '<p>Carregando seu histórico...</p>';

        fetch(`${API_URL}/meus-agendamentos/${emailUsuario}`) // Usa a API com e-mail
            .then(response => response.json())
            .then(agendamentos => {
                historicoDiv.innerHTML = '';
                if (agendamentos.length === 0) {
                    historicoDiv.innerHTML = '<p>Você ainda não possui agendamentos.</p>';
                    return;
                }
                agendamentos.forEach(ag => {
                    const item = document.createElement('div');
                    item.className = 'item-historico';
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
                historicoDiv.innerHTML = '<p>Erro ao carregar seu histórico.</p>';
            });
    }

    // --- FUNÇÃO PARA GERENCIAR A VISIBILIDADE DA SALA ---
    function gerenciarVisibilidadeSala() {
        const tipoSelecionado = tipoReservaSelect.value;
        if (tipoSelecionado === 'Laboratório de Informática - Sede') {
            salaLabel.style.display = 'block';
            salaSelect.style.display = 'block';
            salaSelect.disabled = false;
        } else {
            salaLabel.style.display = 'none';
            salaSelect.style.display = 'none';
            salaSelect.disabled = true;
        }
    }

    // --- PASSO 6: "OUVIR" O ENVIO DO FORMULÁRIO ---
    formReserva.addEventListener('submit', function (event) {
        event.preventDefault();

        const dadosReserva = {
            tipo_reserva: tipoReservaSelect.value,
            sala: salaSelect.disabled ? null : salaSelect.value,
            data: dataInput.value,
            horario_inicio: inicioInput.value,
            horario_fim: fimInput.value,
            finalidade: finalidadeInput.value,
            solicitacoes: materiaisInput.value,
            email_usuario: usuarioLogado.email
        };

        // --- PASSO 7: ENVIAR A RESERVA PARA A API ---
        fetch(`${API_URL}/reservar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosReserva)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'sucesso') {
                    alert(data.mensagem);
                    formReserva.reset();
                    gerenciarVisibilidadeSala();
                    carregarHistorico();
                } else {
                    alert('Erro na reserva: ' + data.mensagem);
                }
            })
            .catch(error => {
                console.error('Erro ao enviar reserva:', error);
                alert('Não foi possível conectar ao servidor para fazer a reserva.');
            });
    });

    // --- PASSO 8: INICIALIZAÇÃO DA PÁGINA ---
    tipoReservaSelect.addEventListener('change', gerenciarVisibilidadeSala);
    carregarHistorico();
    gerenciarVisibilidadeSala();

});