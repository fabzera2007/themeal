/**
 * auth.js - Versão final com funcionalidade de logout no novo cabeçalho.
 */

// --- Funções Utilitárias de Usuário (sem alterações) ---
function getUsers() { return JSON.parse(localStorage.getItem('users') || '[]'); }
function saveUsers(users) { localStorage.setItem('users', JSON.stringify(users)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('userData') || 'null'); }
function isLoggedIn() { return localStorage.getItem('authToken') !== null; }

// --- Funções Principais de Autenticação (sem alterações) ---
function registerUser(username, email, password, bio = '', avatarUrl = null) {
    const users = getUsers();
    if (users.some(u => u.email === email)) throw new Error('Este email já está cadastrado!');
    users.push({ username, email, password, bio, avatar: avatarUrl || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80', favorites: [] });
    saveUsers(users);
}
function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Email ou senha incorretos!');
    localStorage.setItem('authToken', 'token_' + Math.random().toString(36).substr(2, 9));
    const userData = { name: user.username, bio: user.bio || 'Chef apaixonado!', avatar: user.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80', email: user.email, favorites: user.favorites || [] };
    localStorage.setItem('userData', JSON.stringify(userData));
    return userData;
}
function logoutUser() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
}
function updateUserProfile(username, bio) {
    const currentUserData = getCurrentUser();
    if (!currentUserData) return false;
    currentUserData.name = username;
    currentUserData.bio = bio;
    localStorage.setItem('userData', JSON.stringify(currentUserData));
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === currentUserData.email);
    if (userIndex !== -1) {
        users[userIndex].username = username;
        users[userIndex].bio = bio;
        saveUsers(users);
    }
    return true;
}

// --- Funções de Gerenciamento de Favoritos (sem alterações) ---
function addFavorite(recipeId) {
    const userData = getCurrentUser(); if (!userData) return false;
    if (!userData.favorites.includes(recipeId)) { userData.favorites.push(recipeId); localStorage.setItem('userData', JSON.stringify(userData)); const users = getUsers(); const userIndex = users.findIndex(u => u.email === userData.email); if (userIndex !== -1) { if (!users[userIndex].favorites) users[userIndex].favorites = []; users[userIndex].favorites.push(recipeId); saveUsers(users); } } return true;
}
function removeFavorite(recipeId) {
    const userData = getCurrentUser(); if (!userData) return false;
    userData.favorites = userData.favorites.filter(id => id !== recipeId); localStorage.setItem('userData', JSON.stringify(userData)); const users = getUsers(); const userIndex = users.findIndex(u => u.email === userData.email); if (userIndex !== -1 && users[userIndex].favorites) { users[userIndex].favorites = users[userIndex].favorites.filter(id => id !== recipeId); saveUsers(users); } return true;
}
function isFavorite(recipeId) {
    const userData = getCurrentUser(); if (!userData || !userData.favorites) return false; return userData.favorites.includes(recipeId);
}
function getFavorites() { const userData = getCurrentUser(); return userData ? (userData.favorites || []) : []; }

// --- Atualização da UI ---
function updateAuthUI() {
    const isUserLoggedIn = isLoggedIn();
    const userData = getCurrentUser();
    const loginBtnHeader = document.getElementById('login-btn');
    const userGreeting = document.getElementById('user-greeting');
    const logoutIconBtn = document.getElementById('logout-icon-btn');
    const profileIconBtn = document.getElementById('profile-icon-btn');

    if (isUserLoggedIn) {
        if(loginBtnHeader) loginBtnHeader.style.display = 'none';
        if(userGreeting) { userGreeting.textContent = `Olá, ${userData.name.split(' ')[0]}`; userGreeting.style.display = 'flex'; }
        if(logoutIconBtn) logoutIconBtn.style.display = 'flex';
        if(profileIconBtn) profileIconBtn.style.display = 'flex';
    } else {
        if(loginBtnHeader) loginBtnHeader.style.display = 'inline-block';
        if(userGreeting) userGreeting.style.display = 'none';
        if(logoutIconBtn) logoutIconBtn.style.display = 'none';
        if(profileIconBtn) profileIconBtn.style.display = 'none';
    }

    const userNameElem = document.getElementById('user-name');
    if (userNameElem) {
        const userBioElem = document.getElementById('user-bio');
        const userAvatarElem = document.getElementById('user-avatar');
        const editBtnProfile = document.getElementById('edit-btn');
        const disconnectBtnProfile = document.getElementById('disconnect-btn');
        if (isUserLoggedIn && userData) {
            userNameElem.textContent = userData.name;
            userBioElem.textContent = userData.bio;
            userAvatarElem.src = userData.avatar;
            if(editBtnProfile) editBtnProfile.style.display = 'inline-block';
            if(disconnectBtnProfile) disconnectBtnProfile.style.display = 'inline-block';
        } else {
            userNameElem.textContent = 'Visitante';
            userBioElem.textContent = 'Faça login para personalizar seu perfil.';
            userAvatarElem.src = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80';
            if(editBtnProfile) editBtnProfile.style.display = 'none';
            if(disconnectBtnProfile) disconnectBtnProfile.style.display = 'none';
        }
    }
}

// --- Configuração dos Modais ---
function showMessage(element, message, type) { /* ... (sem alterações) ... */ }
function setupAuthModals() {
    const authModal = document.getElementById('auth-modal');
    const loginBtnHeader = document.getElementById('login-btn');
    const loginForm = document.getElementById('login-form');
    
    // NOVO: Adiciona o listener para o novo botão de logout no cabeçalho
    const logoutIconBtn = document.getElementById('logout-icon-btn');
    if (logoutIconBtn) {
        logoutIconBtn.addEventListener('click', () => {
            logoutUser();
            alert('Você foi desconectado.');
            window.location.href = 'index.html'; // Redireciona para a home
        });
    }
    
    // O resto da função continua igual...
    const disconnectBtnProfile = document.getElementById('disconnect-btn');
    if (disconnectBtnProfile) {
        disconnectBtnProfile.addEventListener('click', () => {
            logoutUser();
            alert('Você foi desconectado.');
            location.reload();
        });
    }

    if (loginBtnHeader && authModal) {
        loginBtnHeader.addEventListener('click', () => {
            authModal.style.display = 'flex';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                loginUser(email, password);
                location.reload();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // ... (resto do código de setup dos modais sem alteração)
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    setupAuthModals();
});