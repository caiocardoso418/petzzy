// js/admin.js
document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5000';
    const tableBody = document.getElementById('servicos-table-body');

    async function carregarServicos() {
        try {
            const response = await fetch(`${API_BASE_URL}/servicos`);
            const servicos = await response.json();

            tableBody.innerHTML = ''; // Limpa a tabela antes de preencher
            if (servicos.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4">Nenhum serviço cadastrado.</td></tr>';
                return;
            }

            servicos.forEach(servico => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${servico.id}</td>
                    <td>${servico.nome}</td>
                    <td>${servico.descricao_curta}</td>
                    <td class="actions">
                        <a class="btn-sm" href="admin_servico_form.html?slug=${servico.slug}">Editar</a>
                        <button class="btn-sm btn-sm--danger" data-slug="${servico.slug}">Excluir</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Adiciona o evento de clique para todos os botões de excluir
            document.querySelectorAll('.btn-sm--danger').forEach(button => {
                button.addEventListener('click', handleExcluir);
            });

        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            tableBody.innerHTML = '<tr><td colspan="4">Erro ao carregar serviços.</td></tr>';
        }
    }

    async function handleExcluir(event) {
        const slug = event.target.dataset.slug;
        if (confirm(`Tem certeza que deseja excluir o serviço "${slug}"?`)) {
            try {
                const response = await fetch(`${API_BASE_URL}/servicos/${slug}`, {
                    method: 'DELETE',
                });

                if (!response.ok) throw new Error('Falha ao excluir.');
                
                alert('Serviço excluído com sucesso!');
                carregarServicos(); // Recarrega a lista
            } catch (error) {
                console.error('Erro ao excluir:', error);
                alert('Não foi possível excluir o serviço.');
            }
        }
    }

    carregarServicos();
});