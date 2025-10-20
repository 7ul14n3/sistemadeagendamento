Documento do Projeto: Sistema de Agendamento 
Este documento serve como o guia oficial para o desenvolvimento do nosso 
sistema. Ele detalha o escopo, as tecnologias e as responsabilidades de cada 
membro da equipe. 
1. Visão Geral e Escopo 
O objetivo é criar uma aplicação web robusta e acessível para o agendamento 
de espaços acadêmicos. O sistema será composto por 4 páginas principais: 
1. login.html: Portal de entrada com autenticação e link para a página de 
cadastro. 
2. cadastro.html: Formulário para registro de novos usuários. 
3. reserva.html: A página central da aplicação, onde o usuário fará novas 
reservas e visualizará seu histórico de agendamentos. 
4. admin.html: Painel de controle para administradores, com visualização, 
filtro e gerenciamento de todos os agendamentos. 
2. Arquitetura e Tecnologias 
 Back-end: Python, com o framework Flask e suas extensões (Flask
SQLAlchemy, Flask-Migrate). 
 Banco de Dados: PostgreSQL, hospedado no serviço gratuito do Render. 
 Front-end: HTML, CSS e JavaScript. 
 Framework CSS: Bootstrap, para garantir uma base visual consistente e 
responsiva. 
 APIs e Ferramentas Externas: 
o Flatpickr.js: Para a implementação do calendário interativo. 
o VLibras (Widget do Governo): Para tradução de conteúdo para a 
Língua Brasileira de Sinais. 
o Controles de Acessibilidade: Botões para alternar modo de alto 
contraste e ajustar o tamanho da fonte. 
Distribuição de Responsabilidades por Integrante 
Integrante 1: Desenvolvedor da Lógica (Python + JavaScript) 
Sua Missão: Construir o "cérebro" e o "sistema nervoso" da aplicação. Você é 
responsável por toda a programação que faz o sistema funcionar. 
Tarefas Detalhadas: 
 Back-end (Python): 
o Configurar e gerenciar o banco de dados PostgreSQL. 
o Desenvolver 100% da API em Flask, com as rotas para login, 
cadastro, reserva e o painel do administrador (incluindo filtro por 
data e atualização de status). A lógica de reset de senha foi 
removida. 
o Modelar os dados (Usuario, Agendamento) e gerenciar a estrutura 
do banco com Flask-Migrate. 
 JavaScript: 
o Escrever 100% do código de interatividade para as 4 páginas. 
o Configurar e controlar o calendário Flatpickr.js. 
o Fazer as chamadas fetch para a sua API. 
o Implementar a lógica dinâmica dos formulários e a exibição de 
dados (histórico, tabela do admin). 
o Criar as funções simples que irão ativar os modos de acessibilidade 
(ex: adicionar uma classe .alto-contraste ao <body> quando o 
botão for clicado). 
Integrante 2: Arquiteto de Estrutura (Página Principal) 
Sua Missão: Construir o esqueleto da página reserva.html. 
Tarefas Detalhadas: 
 Acessibilidade: Incluir o script do widget VLibras no <head> ou no final 
do <body> da página. 
 Definir e comunicar os ids dos elementos para o Integrante 1. 
 Criar a estrutura HTML do formulário de reserva, incluindo todos os 
campos: tipo de reserva, sala, calendário, horários, solicitação de 
materiais e o novo campo "Finalidade". 
 Montar a seção vazia que abrigará o histórico de agendamentos. 
 Foco: Entregar um HTML limpo e bem-estruturado. Não se preocupa com 
o estilo (CSS). 
Integrante 3: Arquiteto de Estrutura (Páginas de Acesso) 
Sua Missão: Construir as portas de entrada do sistema. 
Tarefas Detalhadas: 
 Criar a estrutura HTML das páginas: login.html e cadastro.html. 
 Montar os formulários com todos os campos necessários para cada 
função. 
 Acessibilidade: Incluir o script do widget VLibras em ambas as páginas. 
 Definir e comunicar os ids dos elementos para o Integrante 1. 
 Foco: Entregar um HTML limpo e bem-estruturado. Não se preocupa com 
o estilo (CSS). 
Integrante 4: Arquiteto de Estrutura (Página Administrativa) 
Sua Missão: Construir o esqueleto do painel de controle do administrador. 
Tarefas Detalhadas: 
 Criar a estrutura HTML da página admin.html. 
 Montar a seção de filtro no topo da página, com o campo de data e o botão 
"Filtrar". 
 Construir a estrutura da tabela (<table>) com o cabeçalho (<thead>) 
contendo todas as colunas necessárias: Nome, Tipo, Sala, Data/Hora, 
Finalidade, Solicitações, Observação, Status e Ações. 
 Acessibilidade: Incluir o script do widget VLibras na página. 
 Definir e comunicar os ids dos elementos para o Integrante 1. 
 Foco: Entregar um HTML limpo e bem-estruturado. Não se preocupa com 
o estilo (CSS). 
Integrante 5: Designer de Interface (Estilo Visual e Acessibilidade) 
Sua Missão: Dar vida, beleza, consistência e acessibilidade visual a todo o 
projeto. 
Tarefas Detalhadas: 
 Ser o responsável pelo arquivo css/style.css e pela integração do 
Bootstrap. 
 Aplicar o CSS a todas as 4 páginas. 
 Acessibilidade: 
o Criar os estilos para o modo de alto contraste. 
o Implementar as regras de CSS para o aumento de fonte. 
o Posicionar os botões de controle de acessibilidade em um local fixo 
e visível em todas as páginas. 
o Verificar o posicionamento do ícone do VLibras e garantir que ele 
não atrapalhe outros elementos da interface. 
 Garantir que o site seja visualmente consistente e totalmente responsivo. 
============================================================
 ============================================================ 
Cronograma de Desenvolvimento 
(Prazo: 22 de novembro) 
Semana 1 (20/Out a 26/Out): Fundação e Estrutura 
 Integrante 1: Configurar o projeto, criar o banco de dados e as tabelas. 
Definir o "Contrato da API". 
 Integrantes 2, 3 e 4 (HTML): Criar os arquivos HTML básicos de todas 
as 4 páginas, já incluindo o script do VLibras. 
 Integrante 5 (CSS): Configurar o Bootstrap e o style.css, definindo a 
paleta de cores e a estrutura dos botões de acessibilidade. 
Semana 2 (27/Out a 02/Nov): Fluxo de Acesso 
 Integrante 1: Desenvolver a lógica (Python + JS) para cadastro e login. 
 Integrantes 3 e 4 (HTML): Refinar o HTML das páginas de acesso e 
admin. 
 Integrante 5 (CSS): Focar em estilizar completamente as páginas 
login.html e cadastro.html. 
Semana 3 (03/Nov a 09/Nov): Fluxo Principal de Reserva 
 Integrante 1: Desenvolver a lógica completa (Python + JS) para a página 
reserva.html. 
 Integrante 2 (HTML): Finalizar 100% da estrutura HTML da página 
reserva.html. 
 Integrante 5 (CSS): Focar em estilizar completamente a página 
reserva.html. 
Semana 4 (10/Nov a 16/Nov): Painel do Admin e Acessibilidade 
 Integrante 1: Desenvolver a lógica completa (Python + JS) para o 
admin.html e a lógica JS para os botões de acessibilidade. 
 Integrante 5 (CSS): Focar em estilizar o admin.html e implementar os 
estilos de alto contraste e aumento de fonte. 
 Todos os outros (HTML finalizado): Iniciar os testes de fluxo (login, 
cadastro, reserva) e reportar bugs. 
Semana 5 (17/Nov a 22/Nov): Polimento Final, Correções e Entrega 
 Integrante 1: Foco total em corrigir os bugs reportados. 
 Integrante 5: Fazer ajustes finos no CSS e na responsividade. 
 Toda a Equipe: Realizar uma última rodada de testes, focando na 
usabilidade e nas funcionalidades de acessibilidade. Preparar o 
README.md e a apresentação final para a entrega no dia 22. 
