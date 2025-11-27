import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
from threading import Thread # Importante para não travar o site

load_dotenv()
app = Flask(__name__)

# Configuração do CORS (Permite que seu site fale com a API)
CORS(app, resources={r"/*": {"origins": "*"}})

# --- Configuração do Banco de Dados ---
db_url = os.environ.get("DATABASE_URL")
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Configuração do Flask-Mail (Porta 587 com TLS) ---
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.environ.get("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.environ.get("MAIL_PASSWORD")
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get("MAIL_USERNAME")

# Inicializa as ferramentas
db = SQLAlchemy(app)
migrate = Migrate(app, db)
mail = Mail(app)

# --- Função Assistente para Enviar E-mail em Segundo Plano ---
def enviar_email_thread(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
            print("SUCESSO: E-mail enviado em segundo plano.")
        except Exception as e:
            print(f"FALHA NO E-MAIL (Mas a reserva está salva): {str(e)}")

# --- MODELOS (Tabelas) ---
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    matricula = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha_hash = db.Column(db.String(256), nullable=False)
    tipo = db.Column(db.String(50), nullable=False, default='Docente', server_default='Docente')

class Agendamento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    tipo_reserva = db.Column(db.String(100), nullable=False)
    sala = db.Column(db.String(100), nullable=True)
    data = db.Column(db.String(10), nullable=False)
    horario_inicio = db.Column(db.String(5), nullable=False)
    horario_fim = db.Column(db.String(5), nullable=False)
    finalidade = db.Column(db.Text, nullable=False)
    solicitacoes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='Agendado', nullable=False)
    observacao_admin = db.Column(db.Text, nullable=True)
    usuario = db.relationship('Usuario', backref=db.backref('agendamentos', lazy=True))

# --- ROTAS ---

@app.route('/')
def index():
    return "API do Sistema de Agendamento v3.0 (Com Threading) no ar!"

@app.route('/cadastro', methods=['POST'])
def cadastrar_usuario():
    dados = request.get_json()
    nome = dados.get('nome')
    matricula = dados.get('matricula')
    email = dados.get('email')
    senha = dados.get('senha')

    if not all([nome, matricula, email, senha]):
        return jsonify({'status': 'erro', 'mensagem': 'Todos os campos são obrigatórios!'}), 400

    if Usuario.query.filter_by(email=email).first() or Usuario.query.filter_by(matricula=matricula).first():
        return jsonify({'status': 'erro', 'mensagem': 'Email ou matrícula já cadastrado!'}), 400

    senha_criptografada = generate_password_hash(senha)
    novo_usuario = Usuario(nome=nome, matricula=matricula, email=email, senha_hash=senha_criptografada)

    try:
        db.session.add(novo_usuario)
        db.session.commit()
        return jsonify({'status': 'sucesso', 'mensagem': 'Usuário cadastrado com sucesso!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'erro', 'mensagem': f'Erro ao salvar: {str(e)}'}), 500

@app.route('/login', methods=['POST'])
def login_usuario():
    dados = request.get_json()
    email = dados.get('email')
    senha = dados.get('senha')

    if not email or not senha:
        return jsonify({'status': 'erro', 'mensagem': 'Email e senha são obrigatórios!'}), 400

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario or not check_password_hash(usuario.senha_hash, senha):
        return jsonify({'status': 'erro', 'mensagem': 'Usuário ou senha incorretos!'}), 401

    return jsonify({'status': 'sucesso', 'mensagem': 'Login realizado!', 'usuario': {
        'id': usuario.id,
        'nome': usuario.nome,
        'matricula': usuario.matricula,
        'email': usuario.email,
        'tipo': usuario.tipo
    }}), 200

@app.route('/reservar', methods=['POST'])
def reservar_horario():
    dados = request.get_json()
    # Extração segura dos dados
    tipo_reserva = dados.get('tipo_reserva')
    sala = dados.get('sala')
    data = dados.get('data')
    horario_inicio = dados.get('horario_inicio')
    horario_fim = dados.get('horario_fim')
    finalidade = dados.get('finalidade')
    solicitacoes = dados.get('solicitacoes')
    email_usuario = dados.get('email_usuario')

    if not all([tipo_reserva, data, horario_inicio, horario_fim, finalidade, email_usuario]):
        return jsonify({'status': 'erro', 'mensagem': 'Dados incompletos!'}), 400

    usuario = Usuario.query.filter_by(email=email_usuario).first()
    if not usuario:
        return jsonify({'status': 'erro', 'mensagem': 'Usuário não encontrado!'}), 401

    # Verificação de Conflito
    query_filtro = [Agendamento.data == data]
    if sala:
        query_filtro.append(Agendamento.sala == sala)
    else:
        query_filtro.append(Agendamento.tipo_reserva == tipo_reserva)
    
    agendamentos_existentes = Agendamento.query.filter(*query_filtro).all()

    for ag in agendamentos_existentes:
        conflito = (horario_inicio < ag.horario_fim) and (horario_fim > ag.horario_inicio)
        if conflito:
            return jsonify({'status': 'erro', 'mensagem': f'Conflito! Horário ocupado: {ag.horario_inicio} - {ag.horario_fim}'}), 409

    # Criação e Salvamento
    novo_agendamento = Agendamento(
        usuario_id=usuario.id,
        tipo_reserva=tipo_reserva,
        sala=sala,
        data=data,
        horario_inicio=horario_inicio,
        horario_fim=horario_fim,
        finalidade=finalidade,
        solicitacoes=solicitacoes,
        status='Agendado'
    )

    try:
        db.session.add(novo_agendamento)
        db.session.commit()

        # --- ENVIO DE E-MAIL (THREADING) ---
        msg = Message(
            subject=f"Confirmação de Reserva - {tipo_reserva}",
            recipients=[usuario.email],
            body=f"""Olá {usuario.nome}, sua reserva para {data} das {horario_inicio} às {horario_fim} foi confirmada."""
        )
        # Dispara o e-mail em segundo plano para não travar o retorno
        Thread(target=enviar_email_thread, args=(app, msg)).start()
        
        return jsonify({'status': 'sucesso', 'mensagem': 'Reserva realizada com sucesso!'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'erro', 'mensagem': f'Erro ao salvar: {str(e)}'}), 500

@app.route('/agendamentos/<string:data>', methods=['GET'])
def get_agendamentos_por_data(data):
    try:
        agendamentos = Agendamento.query.filter_by(data=data).all()
        return jsonify([{'inicio': ag.horario_inicio, 'fim': ag.horario_fim, 'sala': ag.sala} for ag in agendamentos]), 200
    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': str(e)}), 500

@app.route('/meus-agendamentos/<string:email>', methods=['GET'])
def get_meus_agendamentos(email):
    try:
        usuario = Usuario.query.filter_by(email=email).first()
        if not usuario: return jsonify({'status': 'erro', 'mensagem': 'Usuário não encontrado'}), 404
        
        agendamentos = Agendamento.query.filter_by(usuario_id=usuario.id).order_by(Agendamento.data.desc()).all()
        
        lista = []
        for ag in agendamentos:
            lista.append({
                'id': ag.id,
                'tipo_reserva': ag.tipo_reserva,
                'sala': ag.sala,
                'data': ag.data,
                'horario_inicio': ag.horario_inicio,
                'horario_fim': ag.horario_fim,
                'finalidade': ag.finalidade,
                'status': ag.status,
                'observacao_admin': ag.observacao_admin
            })
        return jsonify(lista), 200
    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': str(e)}), 500

@app.route('/admin/agendamentos', methods=['GET'])
def get_todos_agendamentos():
    data_filtro = request.args.get('data')
    try:
        query = Agendamento.query
        if data_filtro:
            query = query.filter_by(data=data_filtro)
        
        agendamentos = query.order_by(Agendamento.data.desc()).all()
        
        lista = []
        for ag in agendamentos:
            lista.append({
                'id': ag.id,
                'nome_usuario': ag.usuario.nome,
                'email_usuario': ag.usuario.email,
                'tipo_reserva': ag.tipo_reserva,
                'sala': ag.sala,
                'data': ag.data,
                'horario_inicio': ag.horario_inicio,
                'horario_fim': ag.horario_fim,
                'finalidade': ag.finalidade,
                'status': ag.status,
                'observacao_admin': ag.observacao_admin
            })
        return jsonify(lista), 200
    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': str(e)}), 500

@app.route('/admin/agendamentos/<int:id>/status', methods=['PUT'])
def atualizar_status(id):
    dados = request.get_json()
    try:
        agendamento = Agendamento.query.get(id)
        if not agendamento: return jsonify({'status': 'erro', 'mensagem': 'Não encontrado'}), 404
        
        agendamento.status = dados.get('status')
        if dados.get('observacao_admin'):
            agendamento.observacao_admin = dados.get('observacao_admin')
            
        db.session.commit()
        return jsonify({'status': 'sucesso', 'mensagem': 'Atualizado!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'erro', 'mensagem': str(e)}), 500