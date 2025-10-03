// static/js/auth.js

// Esta função decodifica um token JWT sem precisar de bibliotecas externas.
// É uma forma simples de ler o conteúdo do token no frontend.
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

// O "Guardião"
(function() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Se não há token, expulsa o usuário para a página de login
        alert('Acesso negado. Por favor, faça o login.');
        window.location.href = '/login';
        return;
    }

    const userData = parseJwt(token);

    // Verifica se o token é válido e se o tipo de usuário é 'admin'
    if (!userData || userData.tipo_usuario !== 'admin') {
        // Se o usuário não for admin, expulsa ele
        alert('Você não tem permissão para acessar esta página.');
        window.location.href = '/'; // Envia para a página inicial
        return;
    }
    
    // Se chegou até aqui, o usuário é um admin e pode ver a página.
})();