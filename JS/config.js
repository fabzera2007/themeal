// JS/config.js - VERSÃO CORRIGIDA

document.addEventListener('DOMContentLoaded', function () {
    const themeSelect = document.getElementById('theme-select');
    const deleteBtn = document.getElementById('delete-account-btn');

    // Função para aplicar o tema salvo
    function applySavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light'; // Define 'light' como padrão

        // Aplica a classe ao body para mudar a aparência
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }

        // *** LINHA ADICIONADA PARA CORRIGIR O BUG ***
        // Sincroniza o dropdown com o tema salvo
        if (themeSelect) {
            themeSelect.value = savedTheme;
        }
    }

    // Listener para quando o usuário muda o tema no dropdown
    if (themeSelect) {
        themeSelect.addEventListener('change', function () {
            const selectedTheme = this.value;
            localStorage.setItem('theme', selectedTheme);
            applySavedTheme(); // Reaplica o tema para garantir consistência
        });
    }

    // Listener para o botão de apagar conta
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function () {
            if (confirm('Tem certeza que deseja apagar sua conta? Esta ação não poderá ser desfeita.')) {
                // Aqui iria a lógica real de exclusão de conta
                alert('Conta apagada! (Funcionalidade de exemplo)');
            }
        });
    }

    // Aplica o tema assim que a página é carregada
    applySavedTheme();
});