// js/admin_quem_somos_form.js
document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5000';
    const form = document.getElementById('quemsomos-form');
    const formTitle = document.getElementById('form-title');
    const secaoInput = document.getElementById('secao');

    const params = new URLSearchParams(window.location.search);
    const secaoDeEdicao = params.get('secao');
    const isEditing = !!secaoDeEdicao;

    async function carregarDadosParaEdicao() {
        if (!isEditing) {
            formTitle.textContent = 'Nova Seção';
            return;
        }

        formTitle.textContent = `Editando Seção: ${secaoDeEdicao}`;
        secaoInput.readOnly = true;

        try {
            // A API GET /sobre retorna uma lista, então precisamos encontrar o item certo
            const response = await fetch(`${API_BASE_URL}/sobre`);
            const secoes = await response.json();
            const secao = secoes.find(item => item.secao === secaoDeEdicao);
            
            if (secao) {
                document.getElementById('secao').value = secao.secao;
                document.getElementById('titulo').value = secao.titulo;
                document.getElementById('texto').value = secao.texto;
            } else {
                 throw new Error('Seção não encontrada na lista da API.');
            }
        } catch (error) {
            console.error('Erro ao carregar dados da seção:', error);
            alert('Não foi possível carregar os dados para edição.');
        }
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const dadosDoForm = {
            secao: document.getElementById('secao').value,
            titulo: document.getElementById('titulo').value,
            texto: document.getElementById('texto').value,
        };

        const url = isEditing ? `${API_BASE_URL}/sobre/${secaoDeEdicao}` : `${API_BASE_URL}/sobre`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosDoForm),
            });
            if (!response.ok) throw new Error('Falha ao salvar.');

            alert('Seção salva com sucesso!');
            window.location.href = 'admin.html';
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Não foi possível salvar a seção.');
        }
    });

    carregarDadosParaEdicao();
});