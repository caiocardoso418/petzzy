document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const API_BASE_URL = 'http://127.0.0.1:5000/api';

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // MUDANÇA AQUI
        const loginInput = document.getElementById('login-input').value;
        const senha = document.getElementById('senha').value;

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // A chave agora é 'login', como o backend espera
                body: JSON.stringify({ login: loginInput, senha }),
            });
            // FIM DA MUDANÇA

            const data = await response.json();
            if (!response.ok) throw new Error(data.erro || 'Falha no login.');

            localStorage.setItem('authToken', data.token);
            alert('Login bem-sucedido! Redirecionando...');
            window.location.href = '/';

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
      };
    });
});