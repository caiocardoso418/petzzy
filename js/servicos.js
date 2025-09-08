// js/servicos.js

document.addEventListener('DOMContentLoaded', () => {
    
    // URL base da sua API (use localhost para testar na sua máquina)
    const API_BASE_URL = 'http://127.0.0.1:5000';

    // Elementos da página que vamos manipular
    const listaContainer = document.getElementById('lista-servicos-container');
    const detIcon = document.getElementById('detIcon');
    const detTitle = document.getElementById('detTitle');
    const detSubtitle = document.getElementById('detSubtitle');
    const detText = document.getElementById('detText');
    const detList = document.getElementById('detList');
    const detCta = document.querySelector(".service-details__cta a");

    // Função para buscar e exibir a LISTA de serviços na esquerda
    async function carregarListaServicos() {
        try {
            const response = await fetch(`${API_BASE_URL}/servicos`);
            if (!response.ok) throw new Error('Erro ao buscar lista de serviços.');
            
            const servicos = await response.json();

            listaContainer.innerHTML = ''; // Limpa o container antes de adicionar os novos cards
            servicos.forEach(servico => {
                const card = document.createElement('button');
                card.className = 'service-card';
                card.dataset.slug = servico.slug; // Usamos o slug como identificador
                
                // Assumindo que você tem imagens em /assets com o nome do slug (ex: veterinario.png)
                card.innerHTML = `
                    <div class="service-card__thumb">
                        <img src="assets/${servico.slug}.png" alt="" /> 
                    </div>
                    <span class="service-card__name">${servico.nome}</span>
                `;
                
                card.addEventListener('click', () => carregarDetalheServico(servico.slug));
                listaContainer.appendChild(card);
            });

            // Por padrão, carrega os detalhes do primeiro serviço da lista
            if (servicos.length > 0) {
                carregarDetalheServico(servicos[0].slug);
            }

        } catch (error) {
            listaContainer.innerHTML = '<p>Erro ao carregar serviços. Verifique se a API está no ar.</p>';
            console.error(error);
        }
    }

    // Função para buscar e exibir os DETALHES de UM serviço na direita
    async function carregarDetalheServico(slug) {
        try {
            detalheContainer.innerHTML = '<p>Carregando...</p>'; // Mostra um feedback visual
            const response = await fetch(`${API_BASE_URL}/servicos/${slug}`);
            if (!response.ok) throw new Error(`Erro ao buscar detalhes do serviço: ${slug}`);

            const servico = await response.json();

            // Atualiza a classe 'is-active' nos cards da esquerda
            document.querySelectorAll('.service-card').forEach(c => {
                c.classList.toggle('is-active', c.dataset.slug === slug);
            });

            // Preenche a área de detalhes com os dados da API
            detIcon.src = `assets/${servico.slug}.png`;
            detTitle.textContent = servico.nome;
            detSubtitle.textContent = servico.descricao_curta;
            detText.textContent = servico.descricao_longa;
            
            detList.innerHTML = servico.caracteristicas.map(b => `<li>${b.descricao}</li>`).join('');
            
            detCta.href = `buscar.html?q=${encodeURIComponent(servico.nome)}`;

        } catch (error) {
            detalheContainer.innerHTML = `<p>Erro ao carregar detalhes. Tente novamente.</p>`;
            console.error(error);
        }
    }
    
    // Atualiza o ano no rodapé
    document.getElementById('year').textContent = new Date().getFullYear();

    // Inicia todo o processo!
    carregarListaServicos();
});