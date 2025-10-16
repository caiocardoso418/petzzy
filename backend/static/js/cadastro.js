document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5000/api';

    const form = document.getElementById('cadastro-form');
    const step1Div = document.getElementById('step-1');
    const step2Div = document.getElementById('step-2');
    const checkCpfButton = document.getElementById('check-cpf-button');
    const cpfInput = document.getElementById('cpf');

    let validatedCpf = null; // Para guardar o CPF validado

    // --- LÓGICA DA ETAPA 1: VERIFICAR CPF ---
    checkCpfButton.addEventListener('click', async () => {
        const cpf = cpfInput.value;
        if (!cpf) {
            alert('Por favor, digite seu CPF.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/cpf-check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.erro);

            // CPF válido! Vamos para a próxima etapa.
            validatedCpf = cpf;
            step1Div.style.display = 'none';
            step2Div.style.display = 'block';

        } catch (error) {
            console.error('Erro na verificação de CPF:', error);
            alert(`Erro: ${error.message}`);
        }
    });

    // --- LÓGICA DA ETAPA 2: FINALIZAR CADASTRO ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;

        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cpf: validatedCpf, // Usa o CPF que já validamos
                    nome,
                    email,
                    senha
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.erro);

            alert('Cadastro realizado com sucesso! Você será redirecionado para a tela de login.');
            window.location.href = '/login';

        } catch (error) {
            console.error('Erro no cadastro:', error);
            alert(`Erro ao finalizar cadastro: ${error.message}`);
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
      };
    });
});