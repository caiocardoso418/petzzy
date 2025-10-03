document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5000/api';
    const token = localStorage.getItem('authToken');
    const tableBody = document.getElementById('usuarios-table-body');

    async function carregarUsuarios() {
        try {
            const response = await fetch(`${API_BASE_URL}/usuarios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar usuários.');
            
            const usuarios = await response.json();
            tableBody.innerHTML = '';

            usuarios.forEach(usuario => {
                const row = document.createElement('tr');
                const dataCadastro = new Date(usuario.data_criacao).toLocaleDateString('pt-BR');

                // Cria o menu dropdown (select) para as permissões
                const selectRole = `
                    <select class="input input--sm" data-userid="${usuario.id}">
                        <option value="tutor" ${usuario.tipo_usuario === 'tutor' ? 'selected' : ''}>Tutor</option>
                        <option value="prestador" ${usuario.tipo_usuario === 'prestador' ? 'selected' : ''}>Prestador</option>
                        <option value="admin" ${usuario.tipo_usuario === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                `;

                row.innerHTML = `
                    <td>${usuario.id}</td>
                    <td>${usuario.nome}</td>
                    <td>${usuario.email}</td>
                    <td>${selectRole}</td>
                    <td>${dataCadastro}</td>
                `;
                tableBody.appendChild(row);
            });

            // Adiciona o evento de "change" para todos os dropdowns de permissão
            document.querySelectorAll('#usuarios-table-body select').forEach(select => {
                select.addEventListener('change', handleRoleChange);
            });

        } catch (error) {
            console.error(error);
            tableBody.innerHTML = `<tr><td colspan="5">Erro ao carregar usuários.</td></tr>`;
        }
    }

    async function handleRoleChange(event) {
        const selectElement = event.target;
        const userId = selectElement.dataset.userid;
        const newRole = selectElement.value;

        if (!confirm(`Deseja alterar a permissão do usuário #${userId} para "${newRole}"?`)) {
            // Se o usuário clicar em "cancelar", reverte a mudança visual no dropdown
            selectElement.value = selectElement.querySelector('option[selected]').value;
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.erro);

            alert('Permissão do usuário atualizada com sucesso!');
            carregarUsuarios(); // Recarrega a lista para garantir consistência

        } catch (error) {
            alert(`Erro ao atualizar permissão: ${error.message}`);
            carregarUsuarios(); // Recarrega para reverter qualquer mudança visual
        }
    }

    carregarUsuarios();
});