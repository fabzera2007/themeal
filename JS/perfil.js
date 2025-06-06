/**
 * perfil.js - Lógica específica da página de perfil (perfil.html)
 * VERSÃO ATUALIZADA PARA CONSISTÊNCIA COM O NOVO DESIGN
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elementos da página de Perfil
    const favoritesGrid = document.getElementById('favorites-grid');
    const recommendedGrid = document.getElementById('recommended-grid');
    const recipesCountElem = document.getElementById('recipes-count');
    const followersCountElem = document.getElementById('followers-count');
    const followingCountElem = document.getElementById('following-count');

    // Elementos do Modal de Receita
    const recipeModal = document.getElementById('recipe-modal');
    const recipeTitle = document.getElementById('recipe-title');
    const recipeContent = document.getElementById('recipe-content');
    const closeRecipeBtn = document.getElementById('close-recipe');
    const favoriteRecipeBtn = document.getElementById('favorite-recipe');

    let currentRecipeId = null;

    // --- INICIALIZAÇÃO DA PÁGINA DE PERFIL ---
    function initProfilePage() {
        if (typeof updateAuthUI === "function") updateAuthUI();
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
            favoritesGrid.innerHTML = '<div class="message-box" style="background: #252525; border-color: #444; color: #ccc;">Você ainda não adicionou receitas aos favoritos.</div>';
            return;
        }
        favoritesGrid.innerHTML = '<div class="loading"></div>';
        try {
            const recipes = await getMealDetailsByIds(favoriteIds);
            if (recipes.length === 0) {
                favoritesGrid.innerHTML = '<div class="message-box error-message">Nenhuma receita favorita para mostrar.</div>';
            } else {
                displayRecipes(recipes, favoritesGrid);
            }
        } catch (error) {
            console.error('Erro ao carregar receitas favoritas:', error);
            favoritesGrid.innerHTML = '<div class="message-box error-message">Erro ao carregar suas receitas favoritas.</div>';
        }
    }

    async function loadRecommendedRecipes() {
        if (!recommendedGrid) return;
        recommendedGrid.innerHTML = '<div class="loading"></div>';
        try {
            const recipes = await getMultipleRandomMeals(3);
            if (recipes.length === 0) {
                recommendedGrid.innerHTML = '<p class="message-box">Nenhuma recomendação disponível.</p>';
                return;
            }
            displayRecipes(recipes, recommendedGrid);
        } catch (error) {
            console.error('Erro ao carregar receitas recomendadas:', error);
            recommendedGrid.innerHTML = '<p class="message-box error-message">Erro ao carregar recomendações.</p>';
        }
    }

    /**
     * ATUALIZADA: Mesma função displayRecipes do index.js para consistência visual.
     */
    function displayRecipes(recipes, container) {
        container.innerHTML = '';
        if (!recipes || recipes.length === 0) return;

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'card-receita';

            const time = Math.floor(Math.random() * 40) + 20;
            const servings = Math.floor(Math.random() * 4) + 2;
            const rating = (Math.random() * 1.5 + 3.5).toFixed(1);

            card.innerHTML = `
                <div class="thumb-wrapper">
                    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="thumb">
                    <div class="category-tag">${recipe.strCategory || 'Food'}</div>
                </div>
                <div class="conteudo">
                    <h3 class="titulo-receita">${recipe.strMeal}</h3>
                    <div class="metadata">
                        <div class="metadata-item">
                            <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>
                            <span>${time} min</span>
                        </div>
                        <div class="metadata-item">
                            <svg viewBox="0 0 24 24"><path d="M16 0H8C6.9 0 6 .9 6 2v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zM8 18V2h8v16H8z"></path></svg>
                            <span>${servings} porções</span>
                        </div>
                        <div class="metadata-item">
                            <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                            <span>${rating}</span>
                        </div>
                    </div>
                    <div class="cuisine-type">${recipe.strArea || 'International'}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                openRecipeDetails(recipe.idMeal);
            });
            container.appendChild(card);
        });
    }

    async function openRecipeDetails(id) {
        if (!recipeModal || !recipeTitle || !recipeContent) return;
        currentRecipeId = id;
        recipeModal.style.display = 'flex';
        recipeTitle.textContent = 'Carregando...';
        recipeContent.innerHTML = '<div class="loading"></div>';

        try {
            const recipe = await getMealById(id);
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

    function updateFavoriteButton() {
        if (!favoriteRecipeBtn || !currentRecipeId) return;
        const isFav = isFavorite(currentRecipeId);
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

    function toggleFavorite() {
        if (!currentRecipeId) return;
        const userIsLoggedIn = isLoggedIn();
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
        loadFavoriteRecipes();
        loadUserMetrics();
    }

}); // Fim do DOMContentLoaded