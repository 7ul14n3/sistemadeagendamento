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

        tabelaCorpo.innerHTML = '<tr><td colspan="9" class="text-center py-4">Carregando agendamentos...</td></tr>';

        fetch(url)
            .then(response => response.json())
            .then(agendamentos => {
                tabelaCorpo.innerHTML = '';

                if (agendamentos.length === 0) {
                    tabelaCorpo.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">Nenhum agendamento encontrado.</td></tr>';
                    return;
                }

                // --- PASSO 4: "DESENHAR" A TABELA MODERNA ---
                agendamentos.forEach(ag => {
                    const tr = document.createElement('tr');

                    // Lógica para cor da etiqueta (Badge)
                    let statusColorClass = "bg-warning text-dark"; // Padrão (ex: Pendente)
                    if (ag.status.toLowerCase() === "agendado") statusColorClass = "bg-success";
                    if (ag.status.toLowerCase() === "rejeitado") statusColorClass = "bg-danger";

                    tr.innerHTML = `
                        <td class="fw-medium">${ag.nome_usuario}<br><small class="text-muted fw-normal">${ag.email_usuario}</small></td>
                        <td>${ag.tipo_reserva}</td>
                        <td>${ag.sala || 'N/A'}</td>
                        <td>${ag.data}<br><small class="text-muted">${ag.horario_inicio} - ${ag.horario_fim}</small></td>
                        <td>${ag.finalidade}</td>
                        <td>${ag.solicitacoes || 'Nenhuma'}</td>
                        <td style="max-width: 150px;" class="text-truncate" title="${ag.observacao_admin || ''}">${ag.observacao_admin || ''}</td>
                        
                        <!-- Coluna de Status com Badges -->
                        <td>
                            <span class="badge ${statusColorClass} px-2 py-1 rounded-pill shadow-sm">
                                ${ag.status}
                            </span>
                        </td>
                        
                        <!-- Coluna de Ações com Botões Modernos -->
                        <td class="text-center">
                            <div class="d-flex gap-2 justify-content-center">
                                <button class="btn btn-outline-danger btn-sm fw-bold rounded-pill btn-rejeitar" data-id="${ag.id}" title="Rejeitar">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                                <button class="btn btn-outline-success btn-sm fw-bold rounded-pill btn-finalizar" data-id="${ag.id}" title="Finalizar/Aprovar">
                                    <i class="bi bi-check-lg"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    tabelaCorpo.appendChild(tr);
                });
            })
            .catch(error => {
                console.error('Erro ao buscar agendamentos:', error);
                tabelaCorpo.innerHTML = '<tr><td colspan="9" class="text-center text-danger py-4">Erro ao carregar dados.</td></tr>';
            });
    }

    // --- PASSO 5: "OUVIR" O CLIQUE NO BOTÃO DE FILTRO ---
    btnFiltrar.addEventListener('click', function () {
        const data = dataFiltroInput.value;
        carregarAgendamentos(data);
    });

    // --- PASSO 6: "OUVIR" OS CLIQUES NOS BOTÕES DE AÇÃO ---
    tabelaCorpo.addEventListener('click', function (event) {
        // Usamos closest() para garantir que pegamos o clique no botão, mesmo se o usuário clicar em cima do ícone <i>
        const btnRejeitar = event.target.closest('.btn-rejeitar');
        const btnFinalizar = event.target.closest('.btn-finalizar');

        // Se o botão clicado foi o de REJEITAR
        if (btnRejeitar) {
            const idAgendamento = btnRejeitar.getAttribute('data-id');
            if (confirm(`Tem certeza que deseja REJEITAR o agendamento ${idAgendamento}?`)) {
                atualizarStatus(idAgendamento, 'Rejeitado', 'Rejeitado pelo administrador.');
            }
        }

        // Se o botão clicado foi o de FINALIZAR
        if (btnFinalizar) {
            const idAgendamento = btnFinalizar.getAttribute('data-id');
            let obs = prompt("Adicionar observação (ex: 'Projetor quebrou')? (Opcional)");
            // Se o usuário cancelar o prompt, retorna null, vamos manter vazio
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