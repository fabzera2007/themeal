/**
 * auth.js - Autenticação e gerenciamento de usuários, incluindo foto de perfil.
 */

// --- Funções Utilitárias de Usuário ---
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return null;
    return JSON.parse(localStorage.getItem('userData') || 'null');
}

function isLoggedIn() {
    return localStorage.getItem('authToken') !== null;
}

// --- Funções Principais de Autenticação ---

/**
 * Registra um novo usuário.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @param {string} bio
 * @param {string|null} avatarUrl - Data URL da imagem do avatar ou null.
 */
function registerUser(username, email, password, bio = '', avatarUrl = null) {
    const users = getUsers();
    if (users.some(u => u.email === email)) {
        throw new Error('Este email já está cadastrado!');
    }

    const defaultAvatar = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80';

    users.push({
        username,
        email,
        password, // ATENÇÃO: Senha em texto plano! Inseguro para produção.
        bio,
        avatar: avatarUrl || defaultAvatar,
        favorites: []
    });
    saveUsers(users);
}

function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        throw new Error('Email ou senha incorretos!');
    }

    // Criar token simulado
    const token = 'token_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('authToken', token);

    // Salvar dados do usuário para fácil acesso, incluindo o avatar correto
    const defaultAvatarForLogin = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80';
    const userData = {
        name: user.username,
        bio: user.bio || 'Chef apaixonado por culinária!',
        avatar: user.avatar || defaultAvatarForLogin, // Usa o avatar salvo ou um padrão
        email: user.email,
        favorites: user.favorites || []
    };
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

    // Atualizar dados do usuário logado no 'userData'
    currentUserData.name = username;
    currentUserData.bio = bio;
    localStorage.setItem('userData', JSON.stringify(currentUserData));

    // Atualizar também no array 'users' persistido
    const users = getUsers();
    const userEmail = currentUserData.email;
    const userIndex = users.findIndex(u => u.email === userEmail);

    if (userIndex !== -1) {
        users[userIndex].username = username;
        users[userIndex].bio = bio;
        // Para atualizar o avatar aqui, seria necessário um fluxo similar ao de registro/edição de perfil
        saveUsers(users);
    }
    return true;
}

// --- Funções de Gerenciamento de Favoritos ---
function addFavorite(recipeId) {
    const userData = getCurrentUser();
    if (!userData) return false;

    if (!userData.favorites.includes(recipeId)) {
        userData.favorites.push(recipeId);
        localStorage.setItem('userData', JSON.stringify(userData));

        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === userData.email);
        if (userIndex !== -1) {
            if (!users[userIndex].favorites) users[userIndex].favorites = [];
            users[userIndex].favorites.push(recipeId);
            saveUsers(users);
        }
    }
    return true;
}

function removeFavorite(recipeId) {
    const userData = getCurrentUser();
    if (!userData) return false;

    userData.favorites = userData.favorites.filter(id => id !== recipeId);
    localStorage.setItem('userData', JSON.stringify(userData));

    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === userData.email);
    if (userIndex !== -1 && users[userIndex].favorites) {
        users[userIndex].favorites = users[userIndex].favorites.filter(id => id !== recipeId);
        saveUsers(users);
    }
    return true;
}

function isFavorite(recipeId) {
    const userData = getCurrentUser();
    if (!userData || !userData.favorites) return false;
    return userData.favorites.includes(recipeId);
}

function getFavorites() {
    const userData = getCurrentUser();
    return userData ? (userData.favorites || []) : [];
}


// --- Atualização da UI e Configuração de Modais ---

function updateAuthUI() {
    const isUserLoggedIn = isLoggedIn();
    const userData = getCurrentUser();
    const defaultAvatarWhenLoggedOut = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80';

    // Elementos comuns (cabeçalho)
    const loginBtnHeader = document.getElementById('login-btn');
    const logoutBtnHeader = document.getElementById('logout-btn');

    if (loginBtnHeader && logoutBtnHeader) {
        if (isUserLoggedIn) {
            loginBtnHeader.style.display = 'none';
            logoutBtnHeader.style.display = 'inline-block';
        } else {
            loginBtnHeader.style.display = 'inline-block';
            logoutBtnHeader.style.display = 'none';
        }
    }

    // Elementos específicos da página de perfil (se existirem na página atual)
    const userNameElem = document.getElementById('user-name');
    const userBioElem = document.getElementById('user-bio');
    const userAvatarElem = document.getElementById('user-avatar');
    const editBtnProfile = document.getElementById('edit-btn');
    const disconnectBtnProfile = document.getElementById('disconnect-btn');

    if (userNameElem && userBioElem && userAvatarElem) { // Implica que estamos no perfil ou elementos similares existem
        if (isUserLoggedIn && userData) {
            userNameElem.textContent = userData.name;
            userBioElem.textContent = userData.bio;
            userAvatarElem.src = userData.avatar || defaultAvatarWhenLoggedOut; // Exibe avatar do usuário
            if (editBtnProfile) editBtnProfile.style.display = 'inline-block';
            if (disconnectBtnProfile) disconnectBtnProfile.style.display = 'inline-block';
        } else {
            userNameElem.textContent = 'Visitante';
            userBioElem.textContent = 'Faça login para personalizar seu perfil.';
            userAvatarElem.src = defaultAvatarWhenLoggedOut; // Avatar padrão para visitante
            if (editBtnProfile) editBtnProfile.style.display = 'none';
            if (disconnectBtnProfile) disconnectBtnProfile.style.display = 'none';
        }
    }
}

// Função utilitária para exibir mensagens nos modais
function showMessage(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `msg ${type === 'error' ? 'msg-err' : 'msg-suc'}`;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function setupAuthModals() {
    const authModal = document.getElementById('auth-modal');
    const loginBtnHeader = document.getElementById('login-btn'); // Botão "Entrar" no cabeçalho
    const logoutBtnHeader = document.getElementById('logout-btn'); // Botão "Sair" no cabeçalho
    const disconnectBtnProfile = document.getElementById('disconnect-btn'); // Botão "Desconectar" no perfil

    const tabBtns = document.querySelectorAll('#auth-modal .tab-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authMessage = document.getElementById('auth-message'); // Elemento para mensagens no modal de auth

    // Modal de edição de perfil (se existir)
    const editModal = document.getElementById('edit-modal');
    const editBtnProfile = document.getElementById('edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const editForm = document.getElementById('edit-form');
    const editMessage = document.getElementById('edit-message');


    function switchTab(tabId) {
        const authModalNode = document.getElementById('auth-modal'); // Garante que estamos no contexto certo
        if (!authModalNode) return;

        authModalNode.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('act');
            if (btn.dataset.tab === tabId) btn.classList.add('act');
        });
        authModalNode.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('act');
            if (content.id === `${tabId}-tab`) content.classList.add('act');
        });
    }

    // Abrir modal de autenticação
    if (loginBtnHeader && authModal) {
        loginBtnHeader.addEventListener('click', () => {
            authModal.style.display = 'flex';
            switchTab('login'); // Garante que comece na aba de login
            if (authMessage) authMessage.style.display = 'none'; // Limpa mensagens antigas
        });
    }

    // Logout pelo botão do cabeçalho
    if (logoutBtnHeader) {
        logoutBtnHeader.addEventListener('click', () => {
            logoutUser();
            alert('Logout realizado com sucesso!');
            location.reload();
        });
    }

    // Logout pelo botão "Desconectar" na página de perfil (NOVO LISTENER ADICIONADO)
    if (disconnectBtnProfile) {
        disconnectBtnProfile.addEventListener('click', () => {
            logoutUser();
            alert('Você foi desconectado.');
            location.reload();
        });
    }

    // Links para alternar abas dentro do modal de autenticação
    const showRegisterLink = document.getElementById('show-register');
    const cancelRegisterBtn = document.getElementById('cancel-register'); // Botão cancelar na aba de registro

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('register');
        });
    }
    if (cancelRegisterBtn) { // No formulário de registro, para voltar ao login
        cancelRegisterBtn.addEventListener('click', () => {
            switchTab('login');
        });
    }

    // Botões de controle das abas no topo do modal
    if (tabBtns) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                switchTab(btn.dataset.tab);
            });
        });
    }

    // Fechar modais ao clicar fora
    window.addEventListener('click', (e) => {
        if (authModal && e.target === authModal) authModal.style.display = 'none';
        if (editModal && e.target === editModal) editModal.style.display = 'none';
    });

    // Processar formulário de LOGIN
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                loginUser(email, password);
                showMessage(authMessage, 'Login realizado com sucesso!', 'success');
                setTimeout(() => {
                    if (authModal) authModal.style.display = 'none';
                    location.reload();
                }, 1000);
            } catch (error) {
                showMessage(authMessage, error.message, 'error');
            }
        });
    }

    // Processar formulário de CADASTRO (com upload de avatar)
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const bio = document.getElementById('register-bio').value;
            const avatarFile = document.getElementById('register-avatar') ? document.getElementById('register-avatar').files[0] : null;

            if (password !== confirmPassword) {
                showMessage(authMessage, 'As senhas não coincidem!', 'error');
                return;
            }

            const performActualRegistration = (avatarDataForStorage) => {
                try {
                    registerUser(username, email, password, bio, avatarDataForStorage);
                    showMessage(authMessage, 'Cadastro realizado com sucesso! Faça login para continuar.', 'success');
                    setTimeout(() => {
                        switchTab('login');
                        const loginEmailField = document.getElementById('login-email');
                        if (loginEmailField) loginEmailField.value = email;
                    }, 1500);
                } catch (error) {
                    showMessage(authMessage, error.message, 'error');
                }
            };

            if (avatarFile) {
                if (avatarFile.size > 2 * 1024 * 1024) { // Limite de 2MB
                    showMessage(authMessage, 'A imagem é muito grande (máx 2MB).', 'error');
                    return;
                }
                const reader = new FileReader();
                reader.onload = function (event) {
                    performActualRegistration(event.target.result); // Data URL da imagem
                };
                reader.onerror = function () {
                    showMessage(authMessage, 'Erro ao processar imagem. Tente sem foto ou outra imagem.', 'error');
                    // Opcional: registrar sem foto em caso de erro
                    // performActualRegistration(null);
                };
                reader.readAsDataURL(avatarFile);
            } else {
                performActualRegistration(null); // Nenhuma foto selecionada
            }
        });
    }

    // Lógica para modal de edição de perfil (se for usar)
    if (editBtnProfile && editModal) {
        editBtnProfile.addEventListener('click', () => {
            const userData = getCurrentUser();
            if (userData) {
                // Preencher campos do modal de edição
                const editUsernameField = document.getElementById('edit-username');
                const editBioField = document.getElementById('edit-bio');
                if (editUsernameField) editUsernameField.value = userData.name || '';
                if (editBioField) editBioField.value = userData.bio || '';
                editModal.style.display = 'flex';
            }
        });
    }
    if (cancelEditBtn && editModal) {
        cancelEditBtn.addEventListener('click', () => {
            editModal.style.display = 'none';
        });
    }
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('edit-username').value;
            const bio = document.getElementById('edit-bio').value;
            // Aqui você também poderia adicionar lógica para mudar a foto de perfil
            try {
                if (updateUserProfile(username, bio)) {
                    showMessage(editMessage, 'Perfil atualizado com sucesso!', 'success');
                    setTimeout(() => {
                        if (editModal) editModal.style.display = 'none';
                        location.reload(); // Recarrega para ver as mudanças no perfil
                    }, 1000);
                } else {
                    showMessage(editMessage, 'Erro: Não foi possível atualizar o perfil.', 'error');
                }
            } catch (error) {
                showMessage(editMessage, error.message, 'error');
            }
        });
    }
}

// --- Inicialização da UI de Autenticação ---
// Deve ser chamado em cada página que precisa de lógica de autenticação/UI
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    setupAuthModals(); // Configura todos os modais e formulários de autenticação
});

function updateAuthUI() {
    const isUserLoggedIn = isLoggedIn();
    const userData = getCurrentUser();
    const defaultAvatar = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80'; // Avatar padrão

    // Elementos comuns (cabeçalho)
    const loginBtnHeader = document.getElementById('login-btn');
    const logoutBtnHeader = document.getElementById('logout-btn');

    // NOVOS ELEMENTOS PARA OS ÍCONES NA NAVEGAÇÃO
    const navProfileLink = document.getElementById('nav-profile-link');
    const navUserAvatar = document.getElementById('nav-user-avatar');
    // O ícone de configurações (#nav-settings-link) é sempre visível, não precisa de controle aqui
    // a menos que você queira escondê-lo para usuários não logados.

    if (loginBtnHeader && logoutBtnHeader) {
        if (isUserLoggedIn) {
            loginBtnHeader.style.display = 'none';
            logoutBtnHeader.style.display = 'inline-block';

            // Mostrar ícone do perfil e definir avatar na navegação
            if (navProfileLink) navProfileLink.style.display = 'flex'; // Usar 'flex' se .nav-icon-item for flex
            if (navUserAvatar && userData) navUserAvatar.src = userData.avatar || defaultAvatar;

        } else {
            loginBtnHeader.style.display = 'inline-block';
            logoutBtnHeader.style.display = 'none';

            // Esconder ícone do perfil na navegação
            if (navProfileLink) navProfileLink.style.display = 'none';
        }
    }

    // Elementos específicos da página de perfil (se existirem na página atual)
    const userNameElem = document.getElementById('user-name');
    const userBioElem = document.getElementById('user-bio');
    const userAvatarElem = document.getElementById('user-avatar'); // Avatar principal da página de perfil
    const editBtnProfile = document.getElementById('edit-btn');
    const disconnectBtnProfile = document.getElementById('disconnect-btn');

    if (userNameElem && userBioElem && userAvatarElem) {
        if (isUserLoggedIn && userData) {
            userNameElem.textContent = userData.name;
            userBioElem.textContent = userData.bio;
            userAvatarElem.src = userData.avatar || defaultAvatar;
            if (editBtnProfile) editBtnProfile.style.display = 'inline-block';
            if (disconnectBtnProfile) disconnectBtnProfile.style.display = 'inline-block';
        } else {
            userNameElem.textContent = 'Visitante';
            userBioElem.textContent = 'Faça login para personalizar seu perfil.';
            userAvatarElem.src = defaultAvatar;
            if (editBtnProfile) editBtnProfile.style.display = 'none';
            if (disconnectBtnProfile) disconnectBtnProfile.style.display = 'none';
        }
    }

    // Lógica para destacar o link da página ativa (incluindo os novos ícones)
    // Esta parte pode precisar de refinamento dependendo de como você quer que o 'page-select' funcione visualmente nos ícones.
    const currentPage = window.location.pathname.split('/').pop(); // Pega o nome do arquivo atual (ex: "index.html")

    document.querySelectorAll('.perfil_main-nav .nav-link, .perfil_main-nav .nav-icon-item').forEach(link => {
        link.classList.remove('page-select');
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('page-select');
        }
        // Casos especiais para os ícones se o ID for mais confiável que o href para destacar
        if (currentPage === 'perfil.html' && link.id === 'nav-profile-link') {
            link.classList.add('page-select');
        }
        if (currentPage === 'config.html' && link.id === 'nav-settings-link') {
            link.classList.add('page-select');
        }
        if (currentPage === 'index.html' && link.getAttribute('href') === 'index.html' && !link.id) { // Para o link "Início"
            link.classList.add('page-select');
        }

    });
    // Remove o page-select do link "Início" se outra página de ícone estiver ativa
    if ((currentPage === 'perfil.html' || currentPage === 'config.html') && document.querySelector('.perfil_main-nav a[href="index.html"].nav-link')) {
        document.querySelector('.perfil_main-nav a[href="index.html"].nav-link').classList.remove('page-select');
    }

}