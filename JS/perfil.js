/**
 * perfil.js - Lógica específica da página de perfil (perfil.html)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elementos da página de Perfil
    const favoritesGrid = document.getElementById('favorites-grid');
    const recommendedGrid = document.getElementById('recommended-grid');
    const recipesCountElem = document.getElementById('recipes-count');
    const followersCountElem = document.getElementById('followers-count');
    const followingCountElem = document.getElementById('following-count');

    // Elementos do Modal de Receita (devem ter os mesmos IDs que em index.html)
    const recipeModal = document.getElementById('recipe-modal');
    const recipeTitle = document.getElementById('recipe-title');
    const recipeContent = document.getElementById('recipe-content');
    const closeRecipeBtn = document.getElementById('close-recipe');
    const favoriteRecipeBtn = document.getElementById('favorite-recipe');

    let currentRecipeId = null; 

    // --- INICIALIZAÇÃO DA PÁGINA DE PERFIL ---
    async function initProfilePage() {
        // updateAuthUI() é chamado globalmente pelo auth.js no DOMContentLoaded.
        // Se precisar de uma chamada específica aqui, pode adicionar, mas geralmente não é necessário
        // se auth.js já estiver incluído e configurado para rodar no DOMContentLoaded.
        // Contudo, para garantir que os dados do perfil sejam carregados após a UI de auth:
        if (typeof updateAuthUI === "function") updateAuthUI(); // Garante que a UI de auth seja atualizada

        loadUserMetrics();
        loadFavoriteRecipes();
        loadRecommendedRecipes();
    }

    initProfilePage();

    // --- CONFIGURAÇÃO DE EVENTOS DO MODAL DE RECEITA ---
    if (closeRecipeBtn && recipeModal) {
        closeRecipeBtn.addEventListener('click', () => {
            recipeModal.style.display = 'none';
        });
    }

    if (favoriteRecipeBtn) {
        favoriteRecipeBtn.addEventListener('click', () => {
            toggleFavorite();
        });
    }

    if (recipeModal) {
        recipeModal.addEventListener('click', (e) => {
            if (e.target === recipeModal) {
                recipeModal.style.display = 'none';
            }
        });
    }

    // --- FUNÇÕES ESPECÍFICAS DA PÁGINA DE PERFIL ---
    function loadUserMetrics() {
        const userData = getCurrentUser(); // Da auth.js
        if (recipesCountElem) {
            recipesCountElem.textContent = (userData && userData.favorites) ? userData.favorites.length.toString() : '0';
        }
        if (followersCountElem) {
            followersCountElem.textContent = isLoggedIn() ? Math.floor(Math.random() * 100).toString() : '0';
        }
        if (followingCountElem) {
            followingCountElem.textContent = isLoggedIn() ? Math.floor(Math.random() * 50).toString() : '0';
        }
    }

    async function loadFavoriteRecipes() {
        if (!favoritesGrid) return;
        const isUserLoggedIn = isLoggedIn(); 
        const favoriteIds = getFavorites();  

        if (!isUserLoggedIn || favoriteIds.length === 0) {
            favoritesGrid.innerHTML = '<p class="message-box">Você ainda não adicionou receitas aos favoritos. Explore e adicione algumas!</p>';
            return;
        }
        favoritesGrid.innerHTML = '<div class="loading"></div>';
        try {
            const recipes = await getMealDetailsByIds(favoriteIds); // Da api.js
            if (recipes.length === 0 && favoriteIds.length > 0) {
                 favoritesGrid.innerHTML = '<p class="message-box error-message">Erro ao carregar algumas receitas favoritas. Elas podem ter sido removidas.</p>';
            } else if (recipes.length === 0) {
                favoritesGrid.innerHTML = '<p class="message-box">Nenhuma receita favorita para mostrar.</p>';
            } else {
                displayRecipes(recipes, favoritesGrid);
            }
        } catch (error) {
            console.error('Erro ao carregar receitas favoritas:', error);
            favoritesGrid.innerHTML = '<p class="message-box error-message">Erro ao carregar suas receitas favoritas. Tente novamente mais tarde.</p>';
        }
    }

    async function loadRecommendedRecipes() {
        if (!recommendedGrid) return;
        recommendedGrid.innerHTML = '<div class="loading"></div>';
        try {
            const recipes = await getMultipleRandomMeals(3); // Da api.js
            if (recipes.length === 0) {
                recommendedGrid.innerHTML = '<p class="message-box">Nenhuma recomendação disponível no momento.</p>';
                return;
            }
            displayRecipes(recipes, recommendedGrid);
        } catch (error) {
            console.error('Erro ao carregar receitas recomendadas:', error);
            recommendedGrid.innerHTML = '<p class="message-box error-message">Erro ao carregar recomendações. Tente novamente mais tarde.</p>';
        }
    }

    /**
     * Exibe as receitas no container especificado usando as classes CSS atualizadas.
     * (Função padronizada, igual à do index.js revisado)
     */
    function displayRecipes(recipes, container) {
        container.innerHTML = ''; 
        if (!recipes || recipes.length === 0) return;

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'card-receita'; 

            let descriptionText = '';
            if (recipe.strInstructions && recipe.strInstructions.length > 100) {
                descriptionText = recipe.strInstructions.substring(0, 100) + '...';
            } else if (recipe.strArea) {
                descriptionText = `Culinária ${recipe.strArea}`;
            } else if (recipe.strCategory) {
                descriptionText = `Categoria: ${recipe.strCategory}`;
            } else {
                descriptionText = 'Clique para ver mais detalhes.';
            }

            card.innerHTML = `
                <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="thumb">
                <div class="conteudo">
                    <h3 class="titulo-receita">${recipe.strMeal}</h3>
                    <p class="desc">${descriptionText}</p>
                    <a href="#" class="link" onclick="event.preventDefault();">Ver Receita →</a>
                </div>
            `;
            card.addEventListener('click', () => {
                openRecipeDetails(recipe.idMeal);
            });
            container.appendChild(card);
        });
    }

    /**
     * Abre e preenche o modal com os detalhes de uma receita.
     * (Função padronizada, igual à do index.js revisado)
     */
    async function openRecipeDetails(id) {
        if (!recipeModal || !recipeTitle || !recipeContent) return;
        currentRecipeId = id;
        recipeModal.style.display = 'flex';
        recipeTitle.textContent = 'Carregando...';
        recipeContent.innerHTML = '<div class="loading"></div>';

        try {
            const recipe = await getMealById(id); // Da api.js
            if (!recipe) {
                recipeTitle.textContent = 'Erro';
                recipeContent.innerHTML = '<p class="message-box error-message">Não foi possível carregar os detalhes da receita.</p>';
                return;
            }
            recipeTitle.textContent = recipe.strMeal;
            updateFavoriteButton(); 

            const ingredients = [];
            for (let i = 1; i <= 20; i++) {
                const ingredient = recipe[`strIngredient${i}`];
                const measure = recipe[`strMeasure${i}`];
                if (ingredient && ingredient.trim() !== '') {
                    ingredients.push(`${measure ? measure.trim() : ''} ${ingredient.trim()}`);
                }
            }
            recipeContent.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; align-items:center;">
                    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" style="width: 100%; max-width:400px; border-radius: 0.75rem; object-fit: cover;">
                    <div style="width:100%">
                        <p><strong>Categoria:</strong> ${recipe.strCategory || 'N/A'}</p>
                        <p><strong>Origem:</strong> ${recipe.strArea || 'N/A'}</p>
                        ${recipe.strTags ? `<p><strong>Tags:</strong> ${recipe.strTags.split(',').join(', ')}</p>` : ''}
                    </div>
                </div>
                <h3>Ingredientes:</h3>
                <ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 1.5rem;">
                    ${ingredients.map(ing => `<li>${ing}</li>`).join('') || '<li>Nenhum ingrediente listado.</li>'}
                </ul>
                <h3>Modo de Preparo:</h3>
                <p style="white-space: pre-line; line-height: 1.7;">${recipe.strInstructions || 'Instruções não disponíveis.'}</p>
                ${recipe.strYoutube ? `
                <h3 style="margin-top: 1.5rem;">Vídeo:</h3>
                <a href="${recipe.strYoutube}" target="_blank" class="link" style="display: inline-block; margin-top:0.5rem; font-weight:600;">Assistir no YouTube →</a>
                ` : ''}
            `;
        } catch (error) {
            console.error('Erro ao carregar detalhes da receita:', error);
            recipeTitle.textContent = 'Erro';
            recipeContent.innerHTML = '<p class="message-box error-message">Ocorreu um erro ao buscar os detalhes. Tente novamente.</p>';
        }
    }

    /**
     * Atualiza a aparência do botão de favorito no modal.
     * (Função padronizada, igual à do index.js revisado)
     */
    function updateFavoriteButton() {
        if (!favoriteRecipeBtn || !currentRecipeId) return;
        const isFav = isFavorite(currentRecipeId); // Da auth.js
        if (isFav) {
            favoriteRecipeBtn.textContent = 'Remover dos Favoritos';
            favoriteRecipeBtn.classList.remove('btn-ajustar');
            favoriteRecipeBtn.classList.add('btn-sair');
        } else {
            favoriteRecipeBtn.textContent = 'Adicionar aos Favoritos';
            favoriteRecipeBtn.classList.remove('btn-sair');
            favoriteRecipeBtn.classList.add('btn-ajustar');
        }
    }

    /**
     * Adiciona ou remove uma receita dos favoritos e atualiza a UI do perfil.
     */
    function toggleFavorite() {
        if (!currentRecipeId) return;
        const userIsLoggedIn = isLoggedIn(); // Da auth.js

        if (!userIsLoggedIn) {
            alert('Faça login para interagir com os favoritos!');
            if (recipeModal) recipeModal.style.display = 'none';
            const authModal = document.getElementById('auth-modal');
            if (authModal) authModal.style.display = 'flex';
            return;
        }

        if (isFavorite(currentRecipeId)) { 
            removeFavorite(currentRecipeId); 
        } else {
            addFavorite(currentRecipeId); 
        }
        updateFavoriteButton(); 

        // ESPECÍFICO DO PERFIL: Recarrega as receitas favoritas e métricas
        loadFavoriteRecipes();
        loadUserMetrics();
    }

}); // Fim do DOMContentLoaded