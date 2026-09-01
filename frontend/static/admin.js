// js/admin.js
document.addEventListener('DOMContentLoaded', function () {

    // Se o elemento da tabela não está nesta página, para o script
    const tabelaCorpo = document.getElementById('corpo-tabela-dados');
    if (!tabelaCorpo) return;

    // --- PASSO 1: VERIFICAR SE O USUÁRIO É ADMIN ---
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

    // --- PASSO 2: REFERÊNCIAS DOS ELEMENTOS DO HTML ---
    const dataFiltroInput = document.getElementById('campo-data-filtro');
    const btnFiltrar = document.getElementById('btn-filtrar');
    const contadorBadge = document.getElementById('contador-agendamentos');
    const API_URL = 'https://agenddev.onrender.com';

    // --- PASSO 3: FUNÇÃO AUXILIAR PARA FORMATAR DATA (AAAA-MM-DD -> DD/MM/AAAA) ---
    function formatarDataBR(dataString) {
        if (!dataString) return 'N/A';
        const partes = dataString.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        return dataString;
    }

    // --- PASSO 4: FUNÇÃO PRINCIPAL PARA CARREGAR OS AGENDAMENTOS ---
    function carregarAgendamentos(dataFiltrada = '') {
        let url = `${API_URL}/admin/agendamentos`;
        if (dataFiltrada) {
            url += `?data=${dataFiltrada}`;
        }

        tabelaCorpo.innerHTML = '<tr><td colspan="9" class="text-center py-4">Carregando agendamentos...</td></tr>';

        fetch(url)
            .then(response => response.json())
            .then(agendamentos => {
                tabelaCorpo.innerHTML = '';

                // Atualiza o contador com o total de registros retornados
                if (contadorBadge) {
                    contadorBadge.textContent = agendamentos.length;
                }

                if (agendamentos.length === 0) {
                    tabelaCorpo.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">Nenhum agendamento encontrado.</td></tr>';
                    return;
                }

                // Desenha cada linha da tabela
                agendamentos.forEach(ag => {
                    const tr = document.createElement('tr');

                    // Lógica para cor da etiqueta (Badge)
                    let statusColorClass = "bg-warning text-dark"; // Padrão: Pendente
                    const statusAtual = ag.status ? ag.status.toLowerCase() : '';

                    if (statusAtual === "agendado") statusColorClass = "bg-success";
                    if (statusAtual === "rejeitado") statusColorClass = "bg-danger";
                    if (statusAtual === "finalizado") statusColorClass = "bg-secondary";

                    const dataFormatada = formatarDataBR(ag.data);

                    // Lógica das Ações: Oculta ou Desabilita botões se já estiver Rejeitado/Finalizado
                    let acoesHtml = '-';
                    if (statusAtual !== 'rejeitado' && statusAtual !== 'finalizado') {
                        acoesHtml = `
                            <div class="d-flex gap-2 justify-content-center">
                                <button class="btn btn-outline-danger btn-sm fw-bold rounded-pill btn-rejeitar" data-id="${ag.id}" title="Rejeitar">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                                <button class="btn btn-outline-success btn-sm fw-bold rounded-pill btn-finalizar" data-id="${ag.id}" title="Finalizar/Aprovar">
                                    <i class="bi bi-check-lg"></i>
                                </button>
                            </div>
                        `;
                    }

                    tr.innerHTML = `
                        <td class="fw-medium">${ag.nome_usuario}<br><small class="text-muted fw-normal">${ag.email_usuario}</small></td>
                        <td>${ag.tipo_reserva}</td>
                        <td>${ag.sala || 'N/A'}</td>
                        <td>${dataFormatada}<br><small class="text-muted">${ag.horario_inicio} - ${ag.horario_fim}</small></td>
                        <td>${ag.finalidade}</td>
                        <td>${ag.solicitacoes || 'Nenhuma'}</td>
                        <td style="max-width: 150px; cursor: pointer;" class="text-truncate" title="${ag.observacao_admin || 'Sem observações'}">${ag.observacao_admin || ''}</td>
                        
                        <td>
                            <span class="badge ${statusColorClass} px-2 py-1 rounded-pill shadow-sm">
                                ${ag.status}
                            </span>
                        </td>
                        
                        <td class="text-center">
                            ${acoesHtml}
                        </td>
                    `;
                    tabelaCorpo.appendChild(tr);
                });
            })
            .catch(error => {
                console.error('Erro ao buscar agendamentos:', error);
                if (contadorBadge) contadorBadge.textContent = '0';
                tabelaCorpo.innerHTML = '<tr><td colspan="9" class="text-center text-danger py-4">Erro ao carregar dados.</td></tr>';
            });
    }

    // --- PASSO 5: "OUVIR" O CLIQUE NO BOTÃO DE FILTRO ---
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', function () {
            const data = dataFiltroInput ? dataFiltroInput.value : '';
            carregarAgendamentos(data);
        });
    }

    // --- PASSO 6: "OUVIR" OS CLIQUES NOS BOTÕES DE AÇÃO ---
    tabelaCorpo.addEventListener('click', function (event) {
        const btnRejeitar = event.target.closest('.btn-rejeitar');
        const btnFinalizar = event.target.closest('.btn-finalizar');

        if (btnRejeitar) {
            const idAgendamento = btnRejeitar.getAttribute('data-id');
            if (confirm(`Tem certeza que deseja REJEITAR o agendamento ${idAgendamento}?`)) {
                atualizarStatus(idAgendamento, 'Rejeitado', 'Rejeitado pelo administrador.');
            }
        }

        if (btnFinalizar) {
            const idAgendamento = btnFinalizar.getAttribute('data-id');
            let obs = prompt("Adicionar observação (ex: 'Projetor quebrou')? (Opcional)");
            if (obs !== null) {
                atualizarStatus(idAgendamento, 'Finalizado', obs || '');
            }
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
                    carregarAgendamentos(dataFiltroInput ? dataFiltroInput.value : '');
                } else {
                    alert('Erro ao atualizar status: ' + data.mensagem);
                }
            })
            .catch(error => console.error('Erro ao atualizar status:', error));
    }

    // --- PASSO 8: INICIALIZAÇÃO DA PÁGINA ---
    carregarAgendamentos();

});
