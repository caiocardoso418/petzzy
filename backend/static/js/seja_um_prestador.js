document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prestador-form');
    const servicosContainer = document.getElementById('servicos-checkboxes-container');
    const API_BASE_URL = 'http://127.0.0.1:5000/api';
    const token = localStorage.getItem('authToken');

    // --- 1. CARREGA OS SERVIÇOS DISPONÍVEIS E CRIA OS CHECKBOXES ---
    async function carregarServicosDisponiveis() {
        try {
            const response = await fetch(`${API_BASE_URL}/servicos`);
            if (!response.ok) throw new Error('Não foi possível carregar os serviços.');
            
            const servicos = await response.json();
            servicosContainer.innerHTML = ''; // Limpa o "Carregando..."

            servicos.forEach(servico => {
                const div = document.createElement('div');
                div.className = 'checkbox-item';
                div.innerHTML = `
                    <input type="checkbox" id="servico-${servico.id}" name="servicos" value="${servico.id}">
                    <label for="servico-${servico.id}">${servico.nome}</label>
                `;
                servicosContainer.appendChild(div);
            });

        } catch (error) {
            console.error(error);
            servicosContainer.innerHTML = '<p class="text-danger">Erro ao carregar serviços.</p>';
        }
    }

    // --- 2. ENVIA O FORMULÁRIO COM OS SERVIÇOS SELECIONADOS ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Pega todos os checkboxes de serviço que foram marcados
        const servicosSelecionados = document.querySelectorAll('input[name="servicos"]:checked');
        
        // Extrai apenas os IDs (o 'value' de cada checkbox)
        const servicos_ids = Array.from(servicosSelecionados).map(cb => parseInt(cb.value));

        if (servicos_ids.length === 0) {
            alert('Você precisa selecionar pelo menos um serviço que você oferece.');
            return;
        }

        const dadosPrestador = {
            nome_comercial: document.getElementById('nome_comercial').value,
            cnpj: document.getElementById('cnpj').value,
            telefone: document.getElementById('telefone').value,
            bio: document.getElementById('bio').value,
            servicos_ids: servicos_ids // Envia o array de IDs
        };

        try {
            const response = await fetch(`${API_BASE_URL}/prestadores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dadosPrestador)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.erro);

            alert('Parabéns! Seu perfil de prestador foi criado com sucesso.');
            window.location.href = '/'; 

        } catch (error) {
            console.error('Erro no cadastro de prestador:', error);
            alert(`Erro ao finalizar cadastro: ${error.message}`);
        }
    });

    // Inicia o carregamento dos serviços assim que a página abre
    carregarServicosDisponiveis();
});