document.addEventListener('DOMContentLoaded', () => {
    
    // Parte 1: Lógica do formulário de login
    // ===========================================
    const form = document.getElementById('login-form');
    const API_BASE_URL = 'http://127.0.0.1:5000/api';

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            // Envia os dados para a API de login
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
            });

            const data = await response.json();

            // Se a API retornar um erro (ex: 401), exibe a mensagem de erro
            if (!response.ok) {
                throw new Error(data.erro || 'Falha no login.');
            }

            // Se o login for bem-sucedido, salva o token no navegador
            localStorage.setItem('authToken', data.token);

            alert('Login bem-sucedido!');
            window.location.href = '/'; // Redireciona para o dashboard

        } catch (error) {
            console.error('Erro no login:', error);
            alert(`Erro no login: ${error.message}`);
        }
    });

    // Parte 2: Lógicas auxiliares da página (ano e toggle de senha)
    // ==============================================================
    // Atualiza o ano no rodapé
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Lógica para o botão de "mostrar/ocultar" senha
    document.querySelectorAll('.toggle-pass').forEach(btn => {
      const targetId = btn.dataset.target || 'senha';
      const input = document.getElementById(targetId);
      if (input) {
        btn.addEventListener('click', () => {
          input.type = input.type === 'password' ? 'text' : 'password';
        });
      }
    });
})();