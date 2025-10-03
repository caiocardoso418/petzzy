document.addEventListener('DOMContentLoaded', () => {
    
    // Parte 1: Lógica do formulário de cadastro
    // ===========================================
    const form = document.getElementById('cadastro-form');
    const API_BASE_URL = 'http://127.0.0.1:5000/api';

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;

        // Validação simples no frontend
        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }

        try {
            // Envia os dados para a API de registro
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha }),
            });

            const data = await response.json();
            
            // Se a API retornar um erro (ex: 409 email já existe), exibe a mensagem
            if (!response.ok) {
                throw new Error(data.erro || 'Falha no cadastro.');
            }

            alert('Cadastro realizado com sucesso! Você será redirecionado para a tela de login.');
            window.location.href = '/login'; // Redireciona para a página de login

        } catch (error) {
            console.error('Erro no cadastro:', error);
            alert(`Erro no cadastro: ${error.message}`);
        }
    });

    // Parte 2: Lógicas auxiliares da página (ano e toggle de senha)
    // ==============================================================
    // Atualiza o ano no rodapé
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Lógica para os botões de "mostrar/ocultar" senha
    document.querySelectorAll('.toggle-pass').forEach(btn => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        btn.addEventListener('click', () => {
          input.type = input.type === 'password' ? 'text' : 'password';
        });
      }
    });
})();