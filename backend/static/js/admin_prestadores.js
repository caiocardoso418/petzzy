document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5000/api';
    const token = localStorage.getItem('authToken');
    const tableBody = document.getElementById('prestadores-table-body');

    async function carregarPrestadores() {
        try {
            const response = await fetch(`${API_BASE_URL}/prestadores`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar prestadores.');
            
            const prestadores = await response.json();
            tableBody.innerHTML = '';

            prestadores.forEach(p => {
                const row = document.createElement('tr');
                
                let statusBadge = `<span class="badge">${p.status}</span>`;
                if (p.status === 'aprovado') {
                    statusBadge = `<span class="badge badge--success">Aprovado</span>`;
                }

                let acaoBotao = '';
                if (p.status === 'pendente') {
                    acaoBotao = `<button class="btn-sm" data-prestadorid="${p.id}">Aprovar</button>`;
                }

                row.innerHTML = `
                    <td>${p.id}</td>
                    <td>${p.nome_comercial || 'Não informado'}</td>
                    <td>${p.email}</td>
                    <td>${p.cnpj}</td>
                    <td>${statusBadge}</td>
                    <td class="actions">${acaoBotao}</td>
                `;
                tableBody.appendChild(row);
            });

            document.querySelectorAll('button[data-prestadorid]').forEach(button => {
                button.addEventListener('click', handleApproveClick);
            });

        } catch (error) {
            console.error(error);
            tableBody.innerHTML = `<tr><td colspan="6">Erro ao carregar prestadores.</td></tr>`;
        }
    }

    async function handleApproveClick(event) {
        const prestadorId = event.target.dataset.prestadorid;
        if (!confirm(`Deseja aprovar o prestador #${prestadorId}?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/prestadores/${prestadorId}/approve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Falha ao aprovar prestador.');
            
            alert('Prestador aprovado com sucesso!');
            carregarPrestadores(); // Recarrega a lista

        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    }

    carregarPrestadores();
});