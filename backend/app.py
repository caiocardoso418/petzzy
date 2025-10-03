import os
import json
import jwt
import datetime
from functools import wraps
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import psycopg2.extras
from db import get_db_connection
from flask import flash, redirect, url_for
import re
import requests

app = Flask(__name__)
CORS(app)

# ===================================================================
# --- CONFIGURAÇÕES DE SEGURANÇA ---
# ===================================================================
# Crie uma chave secreta para assinar os tokens. 
# No futuro, é uma boa prática mover isso para o seu arquivo .env
app.config['SECRET_KEY'] = 'uma-chave-secreta-muito-dificil-de-adivinhar-troque-depois'
bcrypt = Bcrypt(app)


# ===================================================================
# --- DECORATORS DE AUTENTICAÇÃO (OS "SEGURANÇAS") ---
# ===================================================================

# 1. Verifica se um token válido foi enviado
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'erro': 'Token de autenticação está faltando'}), 401

        try:
            # Tenta decodificar o token usando nossa chave secreta
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            # Você poderia pegar o usuário do banco aqui se precisasse
            # current_user = data['user_id']
        except:
            return jsonify({'erro': 'Token é inválido ou expirou'}), 401

        return f(*args, **kwargs)
    return decorated

# 2. Verifica se o usuário tem a permissão de 'admin'
def admin_required(f):
    @wraps(f)
    @token_required # Primeiro, garante que o usuário está logado
    def decorated(*args, **kwargs):
        token = request.headers['Authorization'].split(" ")[1]
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        # Verifica se o 'tipo_usuario' dentro do token é 'admin'
        if data['tipo_usuario'] != 'admin':
            return jsonify({'erro': 'Acesso restrito para administradores'}), 403 # 403 Forbidden

        return f(*args, **kwargs)
    return decorated


# ===================================================================
# --- ROTAS DE API PARA USUÁRIOS (A "BILHETERIA") ---
# ===================================================================

@app.route('/api/register', methods=['POST'])
def register():
    dados = request.get_json()
    nome, email, senha = dados.get('nome'), dados.get('email'), dados.get('senha')

    if not all([nome, email, senha]):
        return jsonify({'erro': 'Nome, email e senha são obrigatórios'}), 400

    hashed_password = bcrypt.generate_password_hash(senha).decode('utf-8')
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        # Verifica se já existe algum usuário. Se não, o primeiro será admin.
        cursor.execute("SELECT id FROM usuarios LIMIT 1;")
        primeiro_usuario = cursor.fetchone()
        role = 'admin' if primeiro_usuario is None else 'tutor'

        cursor.execute(
            "INSERT INTO usuarios (nome, email, hashed_password, tipo_usuario) VALUES (%s, %s, %s, %s) RETURNING id, nome, email, tipo_usuario;",
            (nome, email, hashed_password, role)
        )
        novo_usuario = cursor.fetchone()
        conn.commit()
    except psycopg2.IntegrityError:
        conn.rollback()
        return jsonify({'erro': 'Este email já está cadastrado.'}), 409
    finally:
        cursor.close()
        conn.close()

    return jsonify(novo_usuario), 201

@app.route('/api/login', methods=['POST'])
def login():
    dados = request.get_json()
    email, senha = dados.get('email'), dados.get('senha')

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("SELECT * FROM usuarios WHERE email = %s;", (email,))
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()

    if not usuario or not bcrypt.check_password_hash(usuario['hashed_password'], senha):
        return jsonify({'erro': 'Email ou senha inválidos'}), 401

    # --- A MUDANÇA ESTÁ AQUI ---
    # Adicionamos o 'nome' do usuário ao conteúdo do token
    token = jwt.encode({
        'user_id': usuario['id'],
        'tipo_usuario': usuario['tipo_usuario'],
        'nome': usuario['nome'], # <-- LINHA ADICIONADA
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    # --- FIM DA MUDANÇA ---

    return jsonify({'token': token})


# ===================================================================
# --- ROTAS DE API PARA ADMIN (AGORA PROTEGIDAS) ---
# ===================================================================

# --- API: QUEM SOMOS (ROTAS DE LEITURA SÃO PÚBLICAS) ---
@app.route('/api/sobre', methods=['GET'])
def api_obter_conteudo_sobre_todos():
    # ... (código da função sem alteração)
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM conteudo_institucional;')
    conteudo = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(conteudo)

# --- ROTAS DE MODIFICAÇÃO (AGORA PROTEGIDAS) ---
@app.route('/api/sobre', methods=['POST'])
@admin_required
def api_criar_secao_sobre():
    # ... (código da função sem alteração)
    dados = request.get_json()
    secao, titulo, texto = dados.get('secao'), dados.get('titulo'), dados.get('texto')
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('INSERT INTO conteudo_institucional (secao, titulo, texto) VALUES (%s, %s, %s) RETURNING *;',(secao, titulo, texto))
    nova_secao = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify(nova_secao), 201

@app.route('/api/sobre/<string:secao>', methods=['PUT'])
@admin_required
def api_atualizar_secao_sobre(secao):
    # ... (código da função sem alteração)
    dados = request.get_json()
    novo_titulo, novo_texto = dados.get('titulo'), dados.get('texto')
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("UPDATE conteudo_institucional SET titulo = %s, texto = %s WHERE secao = %s RETURNING *;",(novo_titulo, novo_texto, secao))
    secao_atualizada = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify(secao_atualizada)

@app.route('/api/sobre/<string:secao>', methods=['DELETE'])
@admin_required
def api_deletar_secao_sobre(secao):
    # ... (código da função sem alteração)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM conteudo_institucional WHERE secao = %s RETURNING id;', (secao,))
    item_deletado = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'mensagem': 'Seção excluída com sucesso'}), 200

# --- API: SERVIÇOS (ROTAS DE LEITURA SÃO PÚBLICAS) ---
@app.route('/api/servicos', methods=['GET'])
def api_obter_servicos_todos():
    # ... (código da função sem alteração)
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM servicos WHERE deleted_at IS NULL ORDER BY id;')
    servicos = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(servicos)

@app.route('/api/servicos/<string:slug>', methods=['GET'])
def api_obter_detalhe_servico(slug):
    # ... (código da função sem alteração)
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM servicos WHERE slug = %s;', (slug,))
    servico = cursor.fetchone()
    cursor.execute('SELECT * FROM caracteristicas_servico WHERE servico_id = %s ORDER BY ordem;', (servico['id'],))
    caracteristicas = cursor.fetchall()
    servico['caracteristicas'] = caracteristicas
    cursor.close()
    conn.close()
    return jsonify(servico)

# --- ROTAS DE MODIFICAÇÃO (AGORA PROTEGIDAS) ---
@app.route('/api/servicos', methods=['POST'])
@admin_required
def api_criar_servico():
    # ... (código da função sem alteração)
    dados = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('INSERT INTO servicos (slug, nome, descricao_curta, descricao_longa) VALUES (%s, %s, %s, %s) RETURNING *;',(dados.get('slug'), dados.get('nome'), dados.get('descricao_curta'), dados.get('descricao_longa')))
    novo_servico = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify(novo_servico), 201

@app.route('/api/servicos/<string:slug>', methods=['PUT'])
@admin_required
def api_atualizar_servico(slug):
    # ... (código da função sem alteração)
    dados = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('UPDATE servicos SET nome = %s, descricao_curta = %s, descricao_longa = %s WHERE slug = %s RETURNING *;',(dados.get('nome'), dados.get('descricao_curta'), dados.get('descricao_longa'), slug))
    servico_atualizado = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify(servico_atualizado)

@app.route('/api/servicos/<string:slug>', methods=['DELETE'])
@admin_required
def api_deletar_servico(slug):
    # ... (código da função sem alteração)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE servicos SET deleted_at = CURRENT_TIMESTAMP WHERE slug = %s RETURNING id;', (slug,))
    item_marcado = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'mensagem': 'Serviço desativado com sucesso'}), 200

# ===================================================================
# --- ROTA PARA SERVIR AS PÁGINAS HTML DO FRONTEND ---
# ===================================================================
@app.route('/', defaults={'path': 'index'})
@app.route('/<path:path>')
def serve_page(path):
    if path.endswith('.html'):
        path = path[:-5]
    try:
        return render_template(f'{path}.html')
    except:
        return jsonify({'erro': f'Página "{path}.html" não encontrada.'}), 404

@app.route('/api/usuarios', methods=['GET'])
@admin_required
def api_obter_todos_usuarios():
    """
    Retorna uma lista de todos os usuários no sistema.
    Apenas administradores podem acessar esta rota.
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Selecionamos todos os campos, exceto a senha, por segurança
    cursor.execute('SELECT id, nome, email, tipo_usuario, data_criacao FROM usuarios ORDER BY id;')
    usuarios = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(usuarios)


@app.route('/api/usuarios/<int:user_id>/role', methods=['PUT'])
@admin_required
def api_atualizar_role_usuario(user_id):
    """
    Atualiza o tipo_usuario (role) de um usuário específico.
    Apenas administradores podem acessar esta rota.
    """
    dados = request.get_json()
    novo_tipo = dados.get('role')

    if not novo_tipo or novo_tipo not in ['admin', 'tutor', 'prestador']:
        return jsonify({'erro': 'Tipo de usuário inválido.'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    # Lógica de segurança: impedir que o último admin perca sua permissão
    if novo_tipo != 'admin':
        cursor.execute("SELECT COUNT(*) FROM usuarios WHERE tipo_usuario = 'admin';")
        admin_count = cursor.fetchone()['count']
        cursor.execute("SELECT tipo_usuario FROM usuarios WHERE id = %s;", (user_id,))
        user_to_update = cursor.fetchone()
        if admin_count <= 1 and user_to_update['tipo_usuario'] == 'admin':
            cursor.close()
            conn.close()
            return jsonify({'erro': 'Não é possível remover a permissão do último administrador.'}), 403

    # Atualiza o tipo_usuario
    cursor.execute(
        "UPDATE usuarios SET tipo_usuario = %s WHERE id = %s RETURNING id, nome, email, tipo_usuario;",
        (novo_tipo, user_id)
    )
    usuario_atualizado = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()

    if usuario_atualizado is None:
        return jsonify({'erro': 'Usuário não encontrado'}), 404
        
    return jsonify(usuario_atualizado)

@app.route('/api/prestadores', methods=['POST'])
@token_required
def criar_perfil_prestador():
    dados = request.get_json()
    cnpj = dados.get('cnpj')
    servicos_ids = dados.get('servicos_ids')

    if not cnpj or not servicos_ids:
        return jsonify({'erro': 'CNPJ e ao menos um serviço são obrigatórios.'}), 400

    token = request.headers['Authorization'].split(" ")[1]
    user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
    usuario_id = user_data['user_id']
    
    # ===================================================================
    # --- VALIDAÇÃO COM A API DA RECEITA (TEMPORARIAMENTE DESATIVADA) ---
    # ===================================================================
    # try:
    #     cnpj_limpo = re.sub(r'[^0-9]', '', cnpj)
    #     response = requests.get(f'https://brasilapi.com.br/api/cnpj/v1/{cnpj_limpo}')
    #     response.raise_for_status()
    # except requests.exceptions.RequestException:
    #     return jsonify({'erro': 'CNPJ inválido ou não encontrado.'}), 400
    # ===================================================================
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        # --- TRANSAÇÃO NO BANCO DE DADOS ---
        cursor.execute(
            "INSERT INTO prestadores (usuario_id, nome_comercial, cnpj, telefone) VALUES (%s, %s, %s, %s) RETURNING id;",
            (usuario_id, dados.get('nome_comercial'), cnpj, dados.get('telefone'))
        )
        novo_prestador_id = cursor.fetchone()['id']

        cursor.execute("UPDATE usuarios SET tipo_usuario = 'prestador' WHERE id = %s;", (usuario_id,))

        for servico_id in servicos_ids:
            cursor.execute(
                "INSERT INTO prestador_servicos (prestador_id, servico_id) VALUES (%s, %s);",
                (novo_prestador_id, servico_id)
            )
        
        conn.commit()
    
    except Exception as e:
        conn.rollback() 
        # Mantemos a depuração para ver o erro real do banco de dados
        print(f"!!!!!!!!!! ERRO DE BANCO DE DADOS !!!!!!!!!!!")
        print(e)
        print(f"!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        return jsonify({'erro': f'Erro no banco de dados: {str(e)}'}), 500
    
    finally:
        cursor.close()
        conn.close()

    return jsonify({'mensagem': 'Perfil de prestador criado com sucesso!'}), 201

@app.route('/admin/prestadores')
@admin_required 
def prestadores_admin():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Usamos um JOIN para buscar dados de ambas as tabelas (prestadores e usuarios)
    cursor.execute("""
        SELECT p.id, p.nome_comercial, p.cnpj, p.status, u.email 
        FROM prestadores p
        JOIN usuarios u ON p.usuario_id = u.id
        ORDER BY p.status, p.id;
    """)
    prestadores = cursor.fetchall()
    cursor.close()
    conn.close()
    # Envia os dados para a página que criamos no Passo 1
    return render_template('admin/prestadores.html', prestadores=prestadores)


# ROTA PARA PROCESSAR A APROVAÇÃO DE UM PRESTADOR (QUANDO O BOTÃO É CLICADO)
@app.route('/admin/prestadores/<int:prestador_id>/approve', methods=['POST'])
@admin_required
def prestadores_approve(prestador_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Atualiza o status do prestador para 'aprovado'
    cursor.execute("UPDATE prestadores SET status = 'aprovado' WHERE id = %s;", (prestador_id,))
    conn.commit()
    cursor.close()
    conn.close()
    
    flash('Prestador aprovado com sucesso!', 'success')
    # Redireciona de volta para a lista de prestadores
    return redirect(url_for('prestadores_admin'))

# ROTA PARA BUSCAR A LISTA DE PRESTADORES EM JSON (A ROTA FALTANTE)
@app.route('/api/prestadores', methods=['GET'])
@admin_required 
def api_obter_todos_prestadores():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Usamos um JOIN para buscar dados de ambas as tabelas (prestadores e usuarios)
    cursor.execute("""
        SELECT p.id, p.nome_comercial, p.cnpj, p.status, u.email 
        FROM prestadores p
        JOIN usuarios u ON p.usuario_id = u.id
        ORDER BY p.status, p.id;
    """)
    prestadores = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(prestadores)

# A sua outra rota de aprovação deve vir aqui também
@app.route('/api/prestadores/<int:prestador_id>/approve', methods=['PUT'])
@admin_required
def api_aprovar_prestador(prestador_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE prestadores SET status = 'aprovado' WHERE id = %s;", (prestador_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'mensagem': 'Prestador aprovado com sucesso!'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)