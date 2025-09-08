from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import psycopg2.extras
from db import get_db_connection

app = Flask(__name__)
CORS(app)

# --- API: QUEM SOMOS ---
@app.route('/api/sobre', methods=['GET'])
def api_obter_conteudo_sobre_todos():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT secao, titulo, texto, data_atualizacao FROM conteudo_institucional;')
    conteudo = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(conteudo)

@app.route('/api/sobre', methods=['POST'])
def api_criar_secao_sobre():
    dados = request.get_json()
    secao, titulo, texto = dados.get('secao'), dados.get('titulo'), dados.get('texto')
    if not all([secao, titulo, texto]): return jsonify({'erro': 'Campos obrigatórios faltando'}), 400
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('INSERT INTO conteudo_institucional (secao, titulo, texto) VALUES (%s, %s, %s) RETURNING *;',(secao, titulo, texto))
    nova_secao = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify(nova_secao), 201
    

@app.route('/api/sobre/<string:secao>', methods=['PUT'])
def api_atualizar_secao_sobre(secao):
    dados = request.get_json()
    novo_titulo, novo_texto = dados.get('titulo'), dados.get('texto')
    if not all([novo_titulo, novo_texto]): return jsonify({'erro': 'Campos obrigatórios faltando'}), 400
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("UPDATE conteudo_institucional SET titulo = %s, texto = %s WHERE secao = %s RETURNING *;",(novo_titulo, novo_texto, secao))
    secao_atualizada = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if secao_atualizada is None: return jsonify({'erro': 'Seção não encontrada'}), 404
    return jsonify(secao_atualizada)


@app.route('/api/sobre/<string:secao>', methods=['DELETE'])
def api_deletar_secao_sobre(secao):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM conteudo_institucional WHERE secao = %s RETURNING id;', (secao,))
    item_deletado = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if item_deletado is None: return jsonify({'erro': 'Seção não encontrada'}), 404
    return jsonify({'mensagem': 'Seção excluída com sucesso'}), 200

# --- API: SERVIÇOS ---
@app.route('/api/servicos', methods=['GET'])
def api_obter_servicos_todos():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM servicos ORDER BY id;')
    servicos = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(servicos)

@app.route('/api/servicos/<string:slug>', methods=['GET'])
def api_obter_detalhe_servico(slug):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM servicos WHERE slug = %s;', (slug,))
    servico = cursor.fetchone()
    if servico is None: return jsonify({'erro': 'Serviço não encontrado'}), 404
    cursor.execute('SELECT * FROM caracteristicas_servico WHERE servico_id = %s ORDER BY ordem;', (servico['id'],))
    caracteristicas = cursor.fetchall()
    servico['caracteristicas'] = caracteristicas
    cursor.close()
    conn.close()
    return jsonify(servico)

@app.route('/api/servicos', methods=['POST'])
def api_criar_servico():
    dados = request.get_json()
    slug, nome = dados.get('slug'), dados.get('nome')
    if not all([slug, nome]): return jsonify({'erro': 'Campos obrigatórios faltando'}), 400
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('INSERT INTO servicos (slug, nome, descricao_curta, descricao_longa) VALUES (%s, %s, %s, %s) RETURNING *;',(dados.get('slug'), dados.get('nome'), dados.get('descricao_curta'), dados.get('descricao_longa')))
    novo_servico = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify(novo_servico), 201

@app.route('/api/servicos/<string:slug>', methods=['PUT'])
def api_atualizar_servico(slug):
    dados = request.get_json()
    nome = dados.get('nome')
    if not nome: return jsonify({'erro': 'Nome é obrigatório'}), 400
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('UPDATE servicos SET nome = %s, descricao_curta = %s, descricao_longa = %s WHERE slug = %s RETURNING *;',(dados.get('nome'), dados.get('descricao_curta'), dados.get('descricao_longa'), slug))
    servico_atualizado = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if servico_atualizado is None: return jsonify({'erro': 'Serviço não encontrado'}), 404
    return jsonify(servico_atualizado)

@app.route('/api/servicos/<string:slug>', methods=['DELETE'])
def api_deletar_servico(slug):
    # ... (código da função sem alteração)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM servicos WHERE slug = %s RETURNING id;', (slug,))
    item_deletado = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if item_deletado is None: return jsonify({'erro': 'Serviço não encontrado'}), 404
    return jsonify({'mensagem': 'Serviço excluído com sucesso'}), 200


@app.route('/', defaults={'path': 'index'})
@app.route('/<path:path>')
def serve_page(path):
    if path.endswith('.html'):
        path = path[:-5]
    try:
        return render_template(f'{path}.html')
    except:
        return jsonify({'erro': f'Página "{path}.html" não encontrada.'}), 404


if __name__ == '__main__':
    app.run(debug=True, port=5000)