document.addEventListener('DOMContentLoaded', () => {
    
    // Função para decodificar o "crachá" (token JWT)
    function parseJwt(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    // Função para atualizar o cabeçalho com base no status de login e tipo de usuário
    function atualizarHeader() {
        // Pega os botões e elementos que podem mudar
        const token = localStorage.getItem('authToken');
        const loginButton = document.getElementById('login-button');
        const logoutButton = document.getElementById('logout-button');
        const adminButton = document.getElementById('admin-button');
        const userGreeting = document.getElementById('user-greeting');
        const providerSignupButton = document.getElementById('provider-signup-button'); // Pega o novo botão

        if (token) {
            // Se o usuário ESTÁ logado
            const userData = parseJwt(token);

            // Esconde "Entrar", mostra "Sair" e a saudação
            if(loginButton) loginButton.style.display = 'none';
            if(logoutButton) logoutButton.style.display = 'inline-block';
            if (userGreeting && userData && userData.nome) {
                userGreeting.textContent = `Olá, ${userData.nome}`;
                userGreeting.style.display = 'inline-block';
            }

            // --- LÓGICA DE VISIBILIDADE DOS BOTÕES DE AÇÃO ---
            // Verifica o tipo de usuário para mostrar os botões corretos
            if (userData && userData.tipo_usuario === 'admin') {
                // Se for ADMIN, mostra o botão do painel
                if(adminButton) adminButton.style.display = 'inline-block';

            } else if (userData && userData.tipo_usuario === 'tutor') {
                // Se for TUTOR, mostra o botão para virar prestador
                if(providerSignupButton) providerSignupButton.style.display = 'inline-block';
            }
            // Se for 'prestador', nenhum dos botões especiais aparece.

        } else {
            // Se o usuário NÃO ESTÁ logado, garante que tudo esteja no estado inicial
            if(loginButton) loginButton.style.display = 'inline-block';
            if(logoutButton) logoutButton.style.display = 'none';
            if(adminButton) adminButton.style.display = 'none';
            if(userGreeting) userGreeting.style.display = 'none';
            if(providerSignupButton) providerSignupButton.style.display = 'none';
        }
    }

    // Lógica do botão de Logout
    const logoutButton = document.getElementById('logout-button');
    if(logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            alert('Você foi desconectado.');
            window.location.href = '/';
        });
    }

    // Atualiza o ano no rodapé
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // Inicia tudo, atualizando o header assim que a página carrega
    atualizarHeader();
});