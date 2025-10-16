document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE_URL = 'http://127.0.0.1:5000/api';
    const resultadosContainer = document.getElementById('resultados-container');
    const searchTermSpan = document.getElementById('search-term');

    // 1. Pega o termo de busca da URL (o que vem depois de ?q=)
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (!query) {
        resultadosContainer.innerHTML = '<p>Nenhum termo de busca fornecido.</p>';
        return;
    }

    // 2. Mostra o termo de busca no título da página
    searchTermSpan.textContent = query;

    try {
        // 3. Chama a nossa nova API de busca
        const response = await fetch(`${API_BASE_URL}/buscar?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Falha ao buscar resultados.');

        const prestadores = await response.json();
        resultadosContainer.innerHTML = ''; // Limpa o "Buscando..."

        if (prestadores.length === 0) {
            resultadosContainer.innerHTML = '<p>Nenhum prestador encontrado para esta busca. Tente novamente mais tarde.</p>';
            return;
        }

        // 4. Cria um card para cada prestador encontrado
        prestadores.forEach(prestador => {
            const card = document.createElement('article');
            card.className = 'prestador-card';

            // Define a URL da foto, usando um placeholder se não houver
            const fotoUrl = prestador.foto_perfil_url || '/static/assets/placeholder.png';
            const bio = prestador.bio || 'Este prestador ainda não adicionou uma descrição.';
            const telefone = prestador.telefone || 'Não informado';

            card.innerHTML = `
                <div class="prestador-foto-wrapper">
                    <img src="${fotoUrl}" alt="Foto de ${prestador.nome_comercial}" class="prestador-foto">
                </div>
                <div class="prestador-info">
                    <h3>${prestador.nome_comercial}</h3>
                    <p class="prestador-bio">${bio}</p>
                    <p class="prestador-contato"><strong>Contato:</strong> ${telefone}</p>
                </div>
            `;
            resultadosContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao buscar prestadores:', error);
        resultadosContainer.innerHTML = '<p class="text-danger">Ocorreu um erro ao carregar os resultados. Tente novamente.</p>';
    }
});