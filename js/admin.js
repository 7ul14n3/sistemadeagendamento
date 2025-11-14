// js/admin.js
document.addEventListener('DOMContentLoaded', function () {

    // Se o formulário de admin não está nesta página, para o script
    const tabelaCorpo = document.getElementById('corpo-tabela-dados');
    if (!tabelaCorpo) return;

    // --- PASSO 1: SEGURANÇA! VERIFICAR SE O USUÁRIO É ADMIN ---
    const dadosUsuarioString = localStorage.getItem('usuarioLogado');
    let usuarioLogado = null;

    if (dadosUsuarioString) {
        usuarioLogado = JSON.parse(dadosUsuarioString);
    }

    if (!usuarioLogado || usuarioLogado.tipo.trim().toLowerCase() !== 'admin') {
        alert('Acesso negado. Esta é uma área restrita para administradores.');
        window.location.href = 'login.html';
        return;
    }

    // --- PASSO 2: PEGAR REFERÊNCIAS DOS ELEMENTOS DO HTML ---
    const dataFiltroInput = document.getElementById('campo-data-filtro');
    const btnFiltrar = document.getElementById('btn-filtrar');
    const API_URL = 'https://agenddev.onrender.com';

    // --- PASSO 3: FUNÇÃO PRINCIPAL PARA CARREGAR OS AGENDAMENTOS ---
    function carregarAgendamentos(dataFiltrada = '') {
        let url = `${API_URL}/admin/agendamentos`;
        if (dataFiltrada) {
            url += `?data=${dataFiltrada}`;
        }

        tabelaCorpo.innerHTML = '<tr><td colspan="9">Carregando agendamentos...</td></tr>';

        fetch(url)
            .then(response => response.json())
            .then(agendamentos => {
                tabelaCorpo.innerHTML = '';

                if (agendamentos.length === 0) {
                    tabelaCorpo.innerHTML = '<tr><td colspan="9">Nenhum agendamento encontrado.</td></tr>';
                    return;
                }

                // --- PASSO 4: "DESENHAR" A TABELA ---
                agendamentos.forEach(ag => {
                    const tr = document.createElement('tr');
                    tr.className = `status-linha-${ag.status.toLowerCase()}`;
                    tr.innerHTML = `
                        <td>${ag.nome_usuario} (${ag.email_usuario})</td>
                        <td>${ag.tipo_reserva}</td>
                        <td>${ag.sala || 'N/A'}</td>
                        <td>${ag.data} (${ag.horario_inicio} - ${ag.horario_fim})</td>
                        <td>${ag.finalidade}</td>
                        <td>${ag.solicitacoes || 'Nenhuma'}</td>
                        <td>${ag.observacao_admin || ''}</td>
                        <td><span class="status-texto-${ag.status.toLowerCase()}">${ag.status}</span></td>
                        <td>
                            <button class="btn-acao btn-rejeitar" data-id="${ag.id}">Rejeitar</button>
                            <button class="btn-acao btn-finalizar" data-id="${ag.id}">Finalizar</button>
                        </td>
                    `;
                    tabelaCorpo.appendChild(tr);
                });
            })
            .catch(error => {
                console.error('Erro ao buscar agendamentos:', error);
                tabelaCorpo.innerHTML = '<tr><td colspan="9">Erro ao carregar dados.</td></tr>';
            });
    }

    // --- PASSO 5: "OUVIR" O CLIQUE NO BOTÃO DE FILTRO ---
    btnFiltrar.addEventListener('click', function () {
        const data = dataFiltroInput.value;
        carregarAgendamentos(data);
    });

    // --- PASSO 6: "OUVIR" OS CLIQUES NOS BOTÕES DE AÇÃO ---
    tabelaCorpo.addEventListener('click', function (event) {
        const elementoClicado = event.target;
        const idAgendamento = elementoClicado.getAttribute('data-id');

        // Se o botão clicado foi o de REJEITAR
        if (elementoClicado.classList.contains('btn-rejeitar')) {
            if (confirm(`Tem certeza que deseja REJEITAR o agendamento ${idAgendamento}?`)) {
                atualizarStatus(idAgendamento, 'Rejeitado', 'Rejeitado pelo administrador.');
            }
        }

        // Se o botão clicado foi o de FINALIZAR
        if (elementoClicado.classList.contains('btn-finalizar')) {
            let obs = prompt("Adicionar observação (ex: 'Projetor quebrou')? (Opcional)");
            atualizarStatus(idAgendamento, 'Finalizado', obs || '');
        }
    });

    // --- PASSO 7: FUNÇÃO PARA ATUALIZAR O STATUS (PUT) ---
    function atualizarStatus(id, novoStatus, observacao) {
        fetch(`${API_URL}/admin/agendamentos/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: novoStatus,
                observacao_admin: observacao
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'sucesso') {
                    alert(data.mensagem);
                    carregarAgendamentos(dataFiltroInput.value);
                } else {
                    alert('Erro ao atualizar status: ' + data.mensagem);
                }
            })
            .catch(error => console.error('Erro ao atualizar status:', error));
    }

    // --- PASSO 8: INICIALIZAÇÃO DA PÁGINA ---
    carregarAgendamentos();

});