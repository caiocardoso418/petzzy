document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5000/api';
    const form = document.getElementById('service-form');
    const formTitle = document.getElementById('form-title');
    const slugInput = document.getElementById('slug');

    const params = new URLSearchParams(window.location.search);
    const slugDeEdicao = params.get('slug');
    const isEditing = !!slugDeEdicao;

    // Função para preencher o formulário no modo de edição
    async function carregarDadosParaEdicao() {
        if (!isEditing) {
            formTitle.textContent = 'Novo Serviço';
            return;
        }

        formTitle.textContent = `Editando Serviço: ${slugDeEdicao}`;
        slugInput.readOnly = true; // Não permite editar o slug

        try {
            const response = await fetch(`${API_BASE_URL}/servicos/${slugDeEdicao}`);
            const servico = await response.json();
            
            document.getElementById('slug').value = servico.slug;
            document.getElementById('nome').value = servico.nome;
            document.getElementById('descricao_curta').value = servico.descricao_curta;
            document.getElementById('descricao_longa').value = servico.descricao_longa;

        } catch (error) {
            console.error('Erro ao carregar dados do serviço:', error);
            alert('Não foi possível carregar os dados para edição.');
        }
    }

    // Escuta o evento de submit para salvar (criar ou atualizar)
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // ================= A MUDANÇA ESTÁ AQUI =================
        // 1. Pega o token salvo no navegador
        const token = localStorage.getItem('authToken');
        // =======================================================

        const dadosDoForm = {
            slug: document.getElementById('slug').value,
            nome: document.getElementById('nome').value,
            descricao_curta: document.getElementById('descricao_curta').value,
            descricao_longa: document.getElementById('descricao_longa').value,
        };

        const url = isEditing ? `${API_BASE_URL}/servicos/${slugDeEdicao}` : `${API_BASE_URL}/servicos`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    // ================= A MUDANÇA ESTÁ AQUI =================
                    // 2. Envia o token no cabeçalho da requisição
                    'Authorization': `Bearer ${token}` 
                    // =======================================================
                },
                body: JSON.stringify(dadosDoForm),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.erro || 'Falha ao salvar.');
            }

            alert('Serviço salvo com sucesso!');
            window.location.href = '/admin'; // Redireciona para o dashboard

        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert(`Não foi possível salvar: ${error.message}`);
        }
    });

    carregarDadosParaEdicao();
});