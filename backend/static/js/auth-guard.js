// Este é o nosso "Segurança da Portaria".
// Ele só verifica se o usuário tem um "crachá" (token), não importa o cargo.
(function() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Se não há token, o usuário não está logado.
        // Expulsa o visitante para a página de login.
        alert('Você precisa estar logado para acessar esta página. Por favor, faça o login.');
        window.location.href = '/login';
    }
    
    // Se chegou até aqui, o usuário tem um token e pode ver a página.
})();