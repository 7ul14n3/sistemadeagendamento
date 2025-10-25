# backend/app.py
import os # Para lidar com variáveis de ambiente
from flask import Flask # Serve para criar a aplicação web
from flask import request, jsonify   # Para futuras rotas de API, serve para lidar com requisições e respostas JSON
from flask_sqlalchemy import SQLAlchemy # Serve para interagir com o banco de dados
from flask_migrate import Migrate # Serve para gerenciar migrações do banco de dados
from dotenv import load_dotenv # Para carregar variáveis de ambiente do arquivo .env
from flask_cors import CORS # Serve para lidar com CORS (Cross-Origin Resource Sharing), ou seja, permitir que o front-end acesse o back-end
from werkzeug.security import generate_password_hash, check_password_hash # Para lidar com hash de senhas, ou seja, guardar senhas de forma segura

load_dotenv()
app = Flask(__name__)
CORS(app)

# --- Configuração do Banco de Dados ---
db_url = os.environ.get("DATABASE_URL")
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# --- Modelos (A "Planta Baixa" ATUALIZADA) ---

# Tabela para os dados do DOCENTE
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)           # 'nome do docente'
    matricula = db.Column(db.String(50), unique=True, nullable=False) # 'código do docente (Matricula)'
    email = db.Column(db.String(120), unique=True, nullable=False)   # 'e-mail institucional'
    senha_hash = db.Column(db.String(256), nullable=False)         # 'senha (cpf)' - Vamos guardar ela criptografada

# Tabela para os dados do AGENDAMENTO
class Agendamento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False) # Link com o docente
    
    tipo_reserva = db.Column(db.String(100), nullable=False)  # 'tipo de reserva'
    sala = db.Column(db.String(100), nullable=True)          # 'sala' (opcional, já que Auditório não tem)
    data = db.Column(db.String(10), nullable=False)          # 'data' (formato AAAA-MM-DD)
    horario_inicio = db.Column(db.String(5), nullable=False) # 'Horário de inicio' (formato HH:MM)
    horario_fim = db.Column(db.String(5), nullable=False)    # 'Horário do fim' (formato HH:MM)
    finalidade = db.Column(db.Text, nullable=False)          # 'Finalidade'
    solicitacoes = db.Column(db.Text, nullable=True)         # 'Solicitações' (pode ser em branco)
    status = db.Column(db.String(50), default='Agendado', nullable=False) # 'status'
    observacao_admin = db.Column(db.Text, nullable=True)     # Para o painel do admin
    
    usuario = db.relationship('Usuario', backref=db.backref('agendamentos', lazy=True))

# --- Rota de Teste ---
@app.route('/')
def index():
    return "API do Sistema de Agendamento v2.0 no ar!"

# --- API DE AUTENTICAÇÃO ---

@app.route('/cadastro', methods=['POST']) # Rota para cadastrar um novo usuário (docente) e receber e enviar dados via POST
def cadastrar_usuario():
    # 1. Pega os dados que o JavaScript enviou (em formato JSON)
    dados = request.get_json() # Espera um JSON com 'nome', 'matricula', 'email', 'senha'

    # 2. Extrai cada informação
    nome = dados.get('nome')
    matricula = dados.get('matricula')
    email = dados.get('email')
    senha = dados.get('senha') # A senha em texto puro (ex: "123456")

    # 3. Verifica se todos os campos vieram
    if not nome or not matricula or not email or not senha:
        return jsonify({'status': 'erro', 'mensagem': 'Todos os campos são obrigatórios!'}), 400

    # 4. Verifica se o usuário já existe
    if Usuario.query.filter_by(email=email).first() or Usuario.query.filter_by(matricula=matricula).first():
        return jsonify({'status': 'erro', 'mensagem': 'Email ou matrícula já cadastrado!'}), 400

    # 5. Criptografa a senha (NUNCA salve senhas em texto puro)
    senha_criptografada = generate_password_hash(senha)

    # 6. Cria o novo usuário com os dados
    novo_usuario = Usuario(
        nome=nome,
        matricula=matricula,
        email=email,
        senha_hash=senha_criptografada,
    )

    # 7. Salva o novo usuário no banco de dados
    try:
        db.session.add(novo_usuario)
        db.session.commit()
        # 8. Envia uma resposta de sucesso de volta para o JavaScript
        return jsonify({'status': 'sucesso', 'mensagem': 'Usuário cadastrado com sucesso!'}), 201

    except Exception as e:
        # Se der erro ao salvar, desfaz a transação
        db.session.rollback()
        return jsonify({'status': 'erro', 'mensagem': f'Erro ao salvar no banco: {str(e)}'}), 500

@app.route('/login', methods=['POST']) # Rota para fazer login do usuário (docente)
def login_usuario():
    # 1. Pega os dados que o JavaScript enviou (em formato JSON)
    dados = request.get_json() # Espera um JSON com 'email' e 'senha'

    # 2. Extrai cada informação
    email = dados.get('email')
    senha = dados.get('senha') # A senha em texto puro

    # 3. Verifica se todos os campos vieram
    if not email or not senha:
        return jsonify({'status': 'erro', 'mensagem': 'Email e senha são obrigatórios!'}), 400

    # 4. Busca o usuário no banco de dados pelo email
    #first retorna o primeiro resultado encontrado ou None se não encontrar
    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        return jsonify({'status': 'erro', 'mensagem': 'Usuário não encontrado!'}), 404

    # 5. Verifica se a senha bate
    if not check_password_hash(usuario.senha_hash, senha):
        return jsonify({'status': 'erro', 'mensagem': 'Senha incorreta!'}), 401

    # 6. Se tudo estiver ok, envia uma resposta de sucesso
    return jsonify({'status': 'sucesso', 'mensagem': 'Login realizado com sucesso!', 'usuario': {
        'id': usuario.id,
        'nome': usuario.nome,
        'matricula': usuario.matricula,
        'email': usuario.email
    }}), 200

# --- API DE AGENDAMENTO ---
@app.route('/reservar', methods=['POST'])
def reservar_horario():
    # 1. Pega os dados que o JavaScript vai enviar
    dados = request.get_json()

    # 2. Desempacota todos os dados do formulário
    tipo_reserva = dados.get('tipo_reserva')
    sala = dados.get('sala')
    data = dados.get('data')
    horario_inicio_novo = dados.get('horario_inicio') # Ex: "14:00"
    horario_fim_novo = dados.get('horario_fim')     # Ex: "16:00"
    finalidade = dados.get('finalidade')
    solicitacoes = dados.get('solicitacoes')
    matricula_usuario_logado = dados.get('matricula_usuario')

    # 3. Validação dos dados (verificando se os campos principais vieram)
    if not all([tipo_reserva, data, horario_inicio_novo, horario_fim_novo, finalidade, matricula_usuario_logado]):
        return jsonify({'status': 'erro', 'mensagem': 'Dados incompletos para a reserva!'}), 400

    # 4. Encontra o usuário no banco de dados
    usuario = Usuario.query.filter_by(matricula=matricula_usuario_logado).first()
    if not usuario:
        return jsonify({'status': 'erro', 'mensagem': 'Usuário não encontrado!'}), 401

    # --- INÍCIO DA NOVA LÓGICA DE CONFLITO ---
    # 5. Busca TODOS os agendamentos que já existem para aquela sala, naquele dia.
    #    (Se for auditório, a 'sala' pode ser nula, então filtramos pelo tipo_reserva)
    query_filtro = [Agendamento.data == data]
    if sala:
        query_filtro.append(Agendamento.sala == sala) # Filtra pela sala específica
    else:
        query_filtro.append(Agendamento.tipo_reserva == tipo_reserva) # Filtra pelo tipo de reserva (ex: Auditório)

    agendamentos_existentes = Agendamento.query.filter(*query_filtro).all() # Pega todos os agendamentos que batem com os filtros

    # 6. Verifica se o novo horário bate com algum agendamento existente
    for ag_existente in agendamentos_existentes: # Para cada agendamento já existente naquele dia e sala
        # Verifica se há conflito de horários
        conflito = (horario_inicio_novo < ag_existente.horario_fim) and \
                   (horario_fim_novo > ag_existente.horario_inicio) # Conflito se os horários se sobrepõem
        
        if conflito:
            # Se encontrou UM conflito, para tudo e avisa o usuário
            return jsonify({
                'status': 'erro', 
                'mensagem': f'Conflito de horário! A sala já está reservada das {ag_existente.horario_inicio} às {ag_existente.horario_fim}.'
            }), 409 # 409 = Conflito

    # --- FIM DA NOVA LÓGICA DE CONFLITO ---

    # 7. Cria o novo agendamento com os dados (só se passou pela verificação)
    novo_agendamento = Agendamento(
        usuario_id=usuario.id,
        tipo_reserva=tipo_reserva,
        sala=sala,
        data=data,
        horario_inicio=horario_inicio_novo,
        horario_fim=horario_fim_novo,
        finalidade=finalidade,
        solicitacoes=solicitacoes,
        status='Agendado'
    )

    # 8. Salva o novo agendamento no banco de dados
    try:
        db.session.add(novo_agendamento)
        db.session.commit()
        # 9. Envia uma resposta de sucesso
        return jsonify({'status': 'sucesso', 'mensagem': 'Reserva realizada com sucesso!'}), 201
    
    except Exception as e:
        db.session.rollback()
        # 10. Em caso de erro ao salvar, avisa o usuário
        return jsonify({'status': 'erro', 'mensagem': f'Erro ao salvar no banco: {str(e)}'}), 500
    
# --- Rota para o Calendário (Buscar horários ocupados por DATA) ---
@app.route('/agendamentos/<string:data>', methods=['GET'])
def get_agendamentos_por_data(data):
    # O <string:data> na URL se conecta perfeitamente com o 'data' aqui
    try:
        # Busca no banco todos os agendamentos PARA AQUELA DATA
        agendamentos_do_dia = Agendamento.query.filter_by(data=data).all()

        # Cria uma lista apenas com os horários de início e fim
        horarios_ocupados = []
        for ag in agendamentos_do_dia:
            horarios_ocupados.append({
                'inicio': ag.horario_inicio,
                'fim': ag.horario_fim,
                'sala': ag.sala # Adicionei a sala, pode ser útil!
            })
        
        # Retorna a lista em formato JSON
        return jsonify(horarios_ocupados), 200

    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': f'Erro ao buscar horários: {str(e)}'}), 500
        
        
#--- Rota para Historico de Agendamentos pessoal do Usuário ---
@app.route('/meus-agendamentos/<string:matricula>', methods=['GET'])
def get_meus_agendamentos(matricula):
    # 1. O <string:matricula> na URL pega a matrícula do usuário

    try:
        # 2. Primeiro, encontramos o usuário pela matrícula
        usuario = Usuario.query.filter_by(matricula=matricula).first() #first retorna o primeiro resultado encontrado ou None se não encontrar

        if not usuario:
            return jsonify({'status': 'erro', 'mensagem': 'Usuário não encontrado!'}), 404

        # 3. Se encontrou o usuário, buscamos os agendamentos ligados a ele
        #    O "order_by(Agendamento.data.desc())" ordena do mais novo para o mais antigo
        agendamentos_do_usuario = Agendamento.query.filter_by(usuario_id=usuario.id).order_by(Agendamento.data.desc()).all()

        # 4. Formata os dados para enviar como JSON
        lista_de_agendamentos = []
        for ag in agendamentos_do_usuario:
            lista_de_agendamentos.append({
                'id': ag.id,
                'tipo_reserva': ag.tipo_reserva,
                'sala': ag.sala,
                'data': ag.data,
                'horario_inicio': ag.horario_inicio,
                'horario_fim': ag.horario_fim,
                'finalidade': ag.finalidade,
                'solicitacoes': ag.solicitacoes,
                'status': ag.status,
                'observacao_admin': ag.observacao_admin
            })

        # 5. Retorna a lista de agendamentos do usuário
        return jsonify(lista_de_agendamentos), 200

    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': f'Erro ao buscar agendamentos: {str(e)}'}), 500
 
    
# --- API DO PAINEL DO ADMINISTRADOR ---
@app.route('/admin/agendamentos', methods=['GET'])
def get_todos_agendamentos():
    # 1. Verifica se o JavaScript enviou um filtro de data na URL
    # Ex: /admin/agendamentos?data=2025-10-25
    data_filtro = request.args.get('data')

    try:
        # 2. Começa a construir a consulta ao banco
        query = Agendamento.query

        # 3. Se o filtro de data existir, adiciona ele na consulta
        if data_filtro:
            query = query.filter_by(data=data_filtro)

        # 4. Executa a consulta e ordena pela data mais recente
        agendamentos = query.order_by(Agendamento.data.desc()).all()

        # 5. Formata a lista para enviar como JSON
        #    Desta vez, vamos incluir o NOME do usuário em cada agendamento
        #    Graças ao `db.relationship` que definimos, isso é fácil!
        lista_de_agendamentos = []
        for ag in agendamentos:
            lista_de_agendamentos.append({
                'id': ag.id,
                'nome_usuario': ag.usuario.nome, # A MÁGICA: Acessando o nome do usuário
                'matricula_usuario': ag.usuario.matricula, # Bônus
                'tipo_reserva': ag.tipo_reserva,
                'sala': ag.sala,
                'data': ag.data,
                'horario_inicio': ag.horario_inicio,
                'horario_fim': ag.horario_fim,
                'finalidade': ag.finalidade,
                'solicitacoes': ag.solicitacoes,
                'status': ag.status,
                'observacao_admin': ag.observacao_admin
            })

        return jsonify(lista_de_agendamentos), 200

    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': f'Erro ao buscar agendamentos: {str(e)}'}), 500
    
#--- Rota para atualizar o status de um agendamento ---
@app.route('/admin/agendamentos/<int:id>/status', methods=['PUT'])
def atualizar_status_agendamento(id):
    # 1. O <int:id> na URL pega o ID específico do agendamento que queremos mudar

    # 2. Pega os dados que o JavaScript enviou (o novo status)
    dados = request.get_json()
    novo_status = dados.get('status')
    observacao = dados.get('observacao_admin')

    if not novo_status:
        return jsonify({'status': 'erro', 'mensagem': 'Novo status é obrigatório!'}), 400

    try:
        # 3. Encontra o agendamento exato no banco pelo ID
        #    .query.get() é a forma mais rápida de buscar por ID (chave primária)
        agendamento = Agendamento.query.get(id)

        if not agendamento:
            return jsonify({'status': 'erro', 'mensagem': 'Agendamento não encontrado!'}), 404

        # 4. Atualiza os campos do agendamento
        agendamento.status = novo_status
        if observacao: # Só atualiza a observação se ela foi enviada
            agendamento.observacao_admin = observacao

        # 5. Salva (comita) as mudanças no banco de dados
        db.session.commit()

        # 6. Retorna uma mensagem de sucesso
        return jsonify({'status': 'sucesso', 'mensagem': 'Status do agendamento atualizado com sucesso!'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'erro', 'mensagem': f'Erro ao atualizar agendamento: {str(e)}'}), 500