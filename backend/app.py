from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2.extras
from db import get_db_connection

app = Flask(__name__)
CORS(app)

@app.route('/sobre', methods=['GET'])
def obter_conteudo_sobre_todos():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT secao, titulo, texto, data_atualizacao FROM conteudo_institucional;')
    conteudo = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(conteudo)

@app.route('/sobre', methods=['POST'])
def criar_secao_sobre():
    dados = request.get_json()
    secao = dados.get('secao')
    titulo = dados.get('titulo')
    texto = dados.get('texto')

    if not secao or not titulo or not texto:
        return jsonify({'erro': 'Seção, título e texto são obrigatórios'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        cursor.execute(
            'INSERT INTO conteudo_institucional (secao, titulo, texto) VALUES (%s, %s, %s) RETURNING *;',
            (secao, titulo, texto)
        )
        nova_secao = cursor.fetchone()
        conn.commit()
    except psycopg2.Error as e:
        conn.rollback()
        return jsonify({'erro': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
    
    return jsonify(nova_secao), 201

@app.route('/sobre/<string:secao>', methods=['PUT'])
def atualizar_secao_sobre(secao):
    dados = request.get_json()
    novo_titulo = dados.get('titulo')
    novo_texto = dados.get('texto')

    if not novo_titulo or not novo_texto:
        return jsonify({'erro': 'Título e texto são obrigatórios'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute(
        "UPDATE conteudo_institucional SET titulo = %s, texto = %s WHERE secao = %s RETURNING *;",
        (novo_titulo, novo_texto, secao)
    )
    secao_atualizada = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    
    if secao_atualizada is None:
        return jsonify({'erro': 'Seção não encontrada'}), 404

    return jsonify(secao_atualizada)

@app.route('/sobre/<string:secao>', methods=['DELETE'])
def deletar_secao_sobre(secao):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM conteudo_institucional WHERE secao = %s RETURNING id;', (secao,))
    item_deletado = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()

    if item_deletado is None:
        return jsonify({'erro': 'Seção não encontrada'}), 404
        
    return jsonify({'mensagem': 'Seção excluída com sucesso'}), 200


@app.route('/servicos', methods=['GET'])
def obter_servicos_todos():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT id, slug, nome, descricao_curta FROM servicos ORDER BY id;')
    servicos = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(servicos)

@app.route('/servicos/<string:slug>', methods=['GET'])
def obter_detalhe_servico(slug):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM servicos WHERE slug = %s;', (slug,))
    servico = cursor.fetchone()

    if servico is None:
        cursor.close()
        conn.close()
        return jsonify({'erro': 'Serviço não encontrado'}), 404

    cursor.execute('SELECT id, descricao FROM caracteristicas_servico WHERE servico_id = %s ORDER BY ordem;', (servico['id'],))
    caracteristicas = cursor.fetchall()
    
    servico['caracteristicas'] = caracteristicas
    cursor.close()
    conn.close()
    return jsonify(servico)

@app.route('/servicos', methods=['POST'])
def criar_servico():
    dados = request.get_json()
    slug = dados.get('slug')
    nome = dados.get('nome')
    descricao_curta = dados.get('descricao_curta')
    descricao_longa = dados.get('descricao_longa')

    if not slug or not nome:
        return jsonify({'erro': 'Slug e nome são obrigatórios'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute(
            'INSERT INTO servicos (slug, nome, descricao_curta, descricao_longa) VALUES (%s, %s, %s, %s) RETURNING *;',
            (slug, nome, descricao_curta, descricao_longa)
        )
        novo_servico = cursor.fetchone()
        conn.commit()
    except psycopg2.Error as e:
        conn.rollback()
        return jsonify({'erro': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
    
    return jsonify(novo_servico), 201

@app.route('/servicos/<string:slug>', methods=['PUT'])
def atualizar_servico(slug):
    dados = request.get_json()
    nome = dados.get('nome')
    descricao_curta = dados.get('descricao_curta')
    descricao_longa = dados.get('descricao_longa')

    if not nome:
        return jsonify({'erro': 'Nome é obrigatório'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute(
        'UPDATE servicos SET nome = %s, descricao_curta = %s, descricao_longa = %s WHERE slug = %s RETURNING *;',
        (nome, descricao_curta, descricao_longa, slug)
    )
    servico_atualizado = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()

    if servico_atualizado is None:
        return jsonify({'erro': 'Serviço não encontrado'}), 404
        
    return jsonify(servico_atualizado)

@app.route('/servicos/<string:slug>', methods=['DELETE'])
def deletar_servico(slug):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM servicos WHERE slug = %s RETURNING id;', (slug,))
    item_deletado = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()

    if item_deletado is None:
        return jsonify({'erro': 'Serviço não encontrado'}), 404
        
    return jsonify({'mensagem': 'Serviço excluído com sucesso'}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)