   // Troca de tema simples
    document.getElementById('theme-select').addEventListener('change', function() {
        if (this.value === 'dark') {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });

    // Aplica o tema salvo ao carregar a página
    window.addEventListener('DOMContentLoaded', function() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    });

    // Confirmação para apagar conta
    document.getElementById('delete-account-btn').addEventListener('click', function() {
        if (confirm('Tem certeza que deseja apagar sua conta? Esta ação não poderá ser desfeita.')) {
            alert('Conta apagada! (Aqui você implementaria a lógica real)');
        }
    });
    