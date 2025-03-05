const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        // Verifica se a resposta foi bem-sucedida
        if (response.ok) {
            const data = await response.json();

            // Armazena o token e dados do usuário no localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redireciona para a página principal ou outra página protegida
            window.location.href = '/index.html';
        } else {
            // Exibe mensagem de erro caso falhe
            const errorData = await response.json();
            alert(errorData.message || 'Erro no login. Tente novamente.');
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });

    // Exibir informações do usuário
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-avatar').src = user.avatar;
    } else {
        window.location.href = '/login.html';
    }
}
