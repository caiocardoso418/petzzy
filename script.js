    // Garante que o script só rode depois que a página carregar completamente
    document.addEventListener('DOMContentLoaded', () => {
        
        // Coloque a URL do ngrok que você (Caio) vai gerar
        const apiUrl = 'http://127.0.0.1:5000/sobre';

        // Função principal para buscar e exibir os dados
        async function carregarConteudo() {
            try {
                const response = await fetch(apiUrl);

                // Verifica se a API respondeu com sucesso
                if (!response.ok) {
                    throw new Error(`Erro na rede: ${response.status}`);
                }

                const dados = await response.json();
                renderizarDados(dados);

            } catch (error) {
                console.error('Falha ao buscar dados da API:', error);
                // Opcional: Mostrar uma mensagem de erro na página
            }
        }

        // Função para colocar os dados nos locais certos do HTML
        function renderizarDados(dados) {
            // Encontra o dado de cada seção na lista que veio da API
            const historia = dados.find(item => item.secao === 'historia');
            const missao = dados.find(item => item.secao === 'missao');
            const visao = dados.find(item => item.secao === 'visao');
            const valores = dados.find(item => item.secao === 'valores');

            // Atualiza a seção "Nossa História"
            if (historia) {
                document.getElementById('historia-titulo').textContent = historia.titulo;
                // Usamos .innerHTML para renderizar tags como <strong> que possam vir do banco
                document.getElementById('historia-texto').innerHTML = historia.texto; 
            }

            // Atualiza a seção "Missão"
            if (missao) {
                document.getElementById('missao-titulo').textContent = missao.titulo;
                document.getElementById('missao-texto').textContent = missao.texto;
            }

            // Atualiza a seção "Visão"
            if (visao) {
                document.getElementById('visao-titulo').textContent = visao.titulo;
                document.getElementById('visao-texto').textContent = visao.texto;
            }

            // Atualiza a seção "Valores"
            if (valores) {
                document.getElementById('valores-titulo').textContent = valores.titulo;
                document.getElementById('valores-texto').textContent = valores.texto;
            }
        }

        // Atualiza o ano no rodapé
        document.getElementById('year').textContent = new Date().getFullYear();

        // Chama a função principal para iniciar o processo!
        carregarConteudo();
    });