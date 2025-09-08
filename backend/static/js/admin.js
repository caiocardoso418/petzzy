document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5000/api';
    
    // --- ELEMENTOS DO DOM ---
    const servicosTableBody = document.getElementById('servicos-table-body');
    const quemSomosTableBody = document.getElementById('quemsomos-table-body');


    async function carregarServicos() {
        try {
            const response = await fetch(`${API_BASE_URL}/servicos`);
            const servicos = await response.json();

            servicosTableBody.innerHTML = ''; 
            if (servicos.length === 0) {
                servicosTableBody.innerHTML = '<tr><td colspan="4">Nenhum serviço cadastrado.</td></tr>';
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
                servicosTableBody.appendChild(row);
            });

            document.querySelectorAll('#servicos-table-body .btn-sm--danger').forEach(button => {
                button.addEventListener('click', handleExcluirServico);
            });

        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            servicosTableBody.innerHTML = '<tr><td colspan="4">Erro ao carregar serviços.</td></tr>';
        }
    }

    async function handleExcluirServico(event) {
        const slug = event.target.dataset.slug;
        if (confirm(`Tem certeza que deseja excluir o serviço "${slug}"?`)) {
            try {
                await fetch(`${API_BASE_URL}/servicos/${slug}`, { method: 'DELETE' });
                alert('Serviço excluído com sucesso!');
                carregarServicos();
            } catch (error) {
                console.error('Erro ao excluir:', error);
                alert('Não foi possível excluir o serviço.');
            }
        }
    }


    async function carregarQuemSomos() {
        try {
            const response = await fetch(`${API_BASE_URL}/sobre`);
            const secoes = await response.json();

            quemSomosTableBody.innerHTML = ''; 
            if (secoes.length === 0) {
                quemSomosTableBody.innerHTML = '<tr><td colspan="3">Nenhuma seção cadastrada.</td></tr>';
                return;
            }

            secoes.forEach(secao => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${secao.secao}</td>
                    <td>${secao.titulo}</td>
                    <td class="actions">
                        <a class="btn-sm" href="admin_quem_somos_form.html?secao=${secao.secao}">Editar</a>
                        <button class="btn-sm btn-sm--danger" data-secao="${secao.secao}">Excluir</button>
                    </td>
                `;
                quemSomosTableBody.appendChild(row);
            });

            document.querySelectorAll('#quemsomos-table-body .btn-sm--danger').forEach(button => {
                button.addEventListener('click', handleExcluirQuemSomos);
            });

        } catch (error) {
            console.error('Erro ao carregar seções "Quem Somos":', error);
            quemSomosTableBody.innerHTML = '<tr><td colspan="3">Erro ao carregar seções.</td></tr>';
        }
    }

    async function handleExcluirQuemSomos(event) {
        const secao = event.target.dataset.secao;
        if (confirm(`Tem certeza que deseja excluir a seção "${secao}"?`)) {
            try {
                await fetch(`${API_BASE_URL}/sobre/${secao}`, { method: 'DELETE' });
                alert('Seção excluída com sucesso!');
                carregarQuemSomos();
            } catch (error) {
                console.error('Erro ao excluir seção:', error);
                alert('Não foi possível excluir a seção.');
            }
        }
    }

    // --- CHAMADAS INICIAIS ---
    carregarServicos();
    carregarQuemSomos();
});