// static/js/quem_somos.js
document.addEventListener('DOMContentLoaded', () => {
    
    const API_BASE_URL = 'http://127.0.0.1:5000/api';
    const container = document.getElementById('quem-somos-container');

    async function carregarConteudo() {
        try {
            const response = await fetch(`${API_BASE_URL}/sobre`);
            if (!response.ok) throw new Error('Falha ao carregar conteúdo.');
            
            const secoes = await response.json();

            container.innerHTML = ''; // Limpa o container

            // Para cada seção recebida da API, cria um bloco HTML
            secoes.forEach(secao => {
                const article = document.createElement('article');
                article.className = 'card pad-y'; // Usa as classes de estilo que você já tem
                article.style.marginBottom = '1.5rem';

                article.innerHTML = `
                    <h2 class="h3">${secao.titulo}</h2>
                    <div>${secao.texto}</div>
                `;
                

                container.appendChild(article);
            });

        } catch (error) {
            container.innerHTML = '<p>Erro ao carregar o conteúdo. Tente novamente mais tarde.</p>';
            console.error(error);
        }
    }

    document.getElementById('year').textContent = new Date().getFullYear();
    carregarConteudo();
});