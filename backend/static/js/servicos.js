document.addEventListener('DOMContentLoaded', () => {
    
    const API_BASE_URL = 'http://127.0.0.1:5000/api';

    const listaContainer = document.getElementById('lista-servicos-container');
    const detailsContainer = document.getElementById('details'); // Pega o container principal
    const detIcon = document.getElementById('detIcon');
    const detTitle = document.getElementById('detTitle');
    const detSubtitle = document.getElementById('detSubtitle');
    const detText = document.getElementById('detText');
    const detList = document.getElementById('detList');
    const detCta = document.querySelector(".service-details__cta a");

// static/js/servicos.js

    async function carregarListaServicos() {
        try {
            const response = await fetch(`${API_BASE_URL}/servicos`);
            if (!response.ok) throw new Error('Erro ao buscar lista de serviços.');
            
            const servicos = await response.json();
            listaContainer.innerHTML = ''; 

            servicos.forEach(servico => {
                // ===============================================
                // ===== MUDANÇA PRINCIPAL: DE <button> PARA <a> =====
                // ===============================================

                // ANTES era: const card = document.createElement('button');
                const card = document.createElement('a'); // Agora é um link

                card.className = 'service-card';
                card.dataset.slug = servico.slug;
                
                // Adicionamos o href para levar diretamente à página de busca
                card.href = `/buscar?q=${encodeURIComponent(servico.nome)}`;
                
                card.innerHTML = `
                    <div class="service-card__thumb">
                        <img src="/static/assets/${servico.slug}.png" alt="" /> 
                    </div>
                    <span class="service-card__name">${servico.nome}</span>
                `;
                
                // Ao invés de um 'click' para carregar detalhes, vamos usar 'mouseover' (passar o mouse por cima)
                // Isso mantém a interatividade sem impedir que o link funcione
                card.addEventListener('mouseover', () => carregarDetalheServico(servico.slug));

                // REMOVEMOS a linha: card.addEventListener('click', ...);
                
                listaContainer.appendChild(card);
            });

            // Continuamos carregando o primeiro serviço por padrão
            if (servicos.length > 0) {
                carregarDetalheServico(servicos[0].slug);
            }

        } catch (error) {
            listaContainer.innerHTML = '<p>Erro ao carregar serviços. Verifique se a API está no ar.</p>';
            console.error(error);
        }
    }

    async function carregarDetalheServico(slug) {
        try {
            detailsContainer.style.opacity = '0.5'; // Efeito de loading
            const response = await fetch(`${API_BASE_URL}/servicos/${slug}`);
            if (!response.ok) throw new Error(`Erro ao buscar detalhes do serviço: ${slug}`);

            const servico = await response.json();

            document.querySelectorAll('.service-card').forEach(c => {
                c.classList.toggle('is-active', c.dataset.slug === slug);
            });

            detIcon.src = `/static/assets/${servico.slug}.png`;
            detTitle.textContent = servico.nome;
            detSubtitle.textContent = servico.descricao_curta;
            detText.textContent = servico.descricao_longa;
            detList.innerHTML = servico.caracteristicas.map(b => `<li>${b.descricao}</li>`).join('');
            detCta.href = `/buscar?q=${encodeURIComponent(servico.nome)}`;
            detailsContainer.style.opacity = '1'; // Fim do efeito de loading

        } catch (error) {
            console.error(error);
            detailsContainer.innerHTML = `<p>Erro ao carregar detalhes.</p>`;
        }
    }
    
    document.getElementById('year').textContent = new Date().getFullYear();
    carregarListaServicos();
});