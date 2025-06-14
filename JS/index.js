/**
 * Lógica específica da página inicial (index.html)
 * VERSÃO ATUALIZADA PARA O NOVO DESIGN (TEMA ESCURO)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elementos da página
    const featuredRecipesContainer = document.getElementById('featured-recipes');
    const categoriesContainer = document.getElementById('categories-container');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const ctaBtn = document.getElementById('cta-btn'); // Botão "Começar Agora" no hero (não mais visível, mas a lógica pode ser mantida)
    const joinBtn = document.getElementById('join-btn'); // Botão "Criar Conta" na seção "Junte-se" (não mais visível)

    // Elementos do Modal de Receita
    const recipeModal = document.getElementById('recipe-modal');
    const recipeTitle = document.getElementById('recipe-title');
    const recipeContent = document.getElementById('recipe-content');
    const closeRecipeBtn = document.getElementById('close-recipe');
    const favoriteRecipeBtn = document.getElementById('favorite-recipe');

    let currentRecipeId = null; // Guarda o ID da receita atualmente no modal

    // --- INICIALIZAÇÃO ---
    loadFeaturedRecipes();
    loadCategories();

    // --- CONFIGURAÇÃO DE EVENTOS ---
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    // Eventos para botões que abrem o modal de autenticação (mesmo que escondidos, a lógica permanece)
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            const authModal = document.getElementById('auth-modal');
            if (authModal) authModal.style.display = 'flex';
        });
    }

    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            const authModal = document.getElementById('auth-modal');
            if (authModal) {
                authModal.style.display = 'flex';
                const registerTab = document.querySelector('.tab-btn[data-tab="register"]');
                if (registerTab) registerTab.click();
            }
        });
    }

    // Eventos do Modal de Receita
    if (closeRecipeBtn) {
        closeRecipeBtn.addEventListener('click', () => {
            if (recipeModal) recipeModal.style.display = 'none';
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

    // --- FUNÇÕES DE CARREGAMENTO DE DADOS E EXIBIÇÃO ---

    async function loadFeaturedRecipes() {
        if (!featuredRecipesContainer) return;
        featuredRecipesContainer.innerHTML = '<div class="loading"></div>';
        try {
            const recipes = await getMultipleRandomMeals(6); // Da api.js
            if (recipes.length === 0) {
                featuredRecipesContainer.innerHTML = '<p class="message-box">Nenhuma receita em destaque encontrada no momento.</p>';
                return;
            }
            displayRecipes(recipes, featuredRecipesContainer);
        } catch (error) {
            console.error('Erro ao carregar receitas em destaque:', error);
            featuredRecipesContainer.innerHTML = '<p class="message-box error-message">Erro ao carregar receitas. Tente novamente mais tarde.</p>';
        }
    }

    async function loadCategories() {
        if (!categoriesContainer) return;
        categoriesContainer.innerHTML = '<div class="loading"></div>';
        try {
            const categories = await getAllCategories(); // Da api.js
            if (categories.length === 0) {
                categoriesContainer.innerHTML = '';
                return;
            }
            categoriesContainer.innerHTML = '';

            const allItem = document.createElement('div');
            allItem.className = 'cat-item active';
            allItem.textContent = 'Todas';
            allItem.addEventListener('click', () => {
                setActiveCategory(allItem);
                loadFeaturedRecipes();
            });
            categoriesContainer.appendChild(allItem);

            categories.slice(0, 10).forEach(category => {
                const item = document.createElement('div');
                item.className = 'cat-item';
                item.textContent = category.strCategory;
                item.addEventListener('click', () => {
                    setActiveCategory(item);
                    loadRecipesByCategory(category.strCategory);
                });
                categoriesContainer.appendChild(item);
            });
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            categoriesContainer.innerHTML = '<p class="message-box error-message">Erro ao carregar categorias.</p>';
        }
    }

    function setActiveCategory(activeItem) {
        const items = document.querySelectorAll('.cat-item');
        items.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
    }

    async function loadRecipesByCategory(category) {
        if (!featuredRecipesContainer) return;
        featuredRecipesContainer.innerHTML = '<div class="loading"></div>';
        try {
            const recipes = await filterByCategory(category); // Da api.js
            if (recipes.length === 0) {
                featuredRecipesContainer.innerHTML = `<p class="message-box">Nenhuma receita encontrada na categoria "${category}".</p>`;
                return;
            }
            displayRecipes(recipes.slice(0, 12), featuredRecipesContainer); // Mostra até 12
        } catch (error) {
            console.error('Erro ao carregar receitas por categoria:', error);
            featuredRecipesContainer.innerHTML = '<p class="message-box error-message">Erro ao carregar receitas. Tente novamente mais tarde.</p>';
        }
    }

    async function handleSearch() {
        if (!searchInput || !featuredRecipesContainer) return;
        const query = searchInput.value.trim();
        if (!query) return;

        featuredRecipesContainer.innerHTML = '<div class="loading"></div>';
        try {
            const recipes = await searchMealsByName(query); // Da api.js
            if (recipes.length === 0) {
                featuredRecipesContainer.innerHTML = `<p class="message-box">Nenhuma receita encontrada para "${query}".</p>`;
                return;
            }
            displayRecipes(recipes.slice(0, 12), featuredRecipesContainer); // Mostra até 12
            const allCategoryItem = categoriesContainer.querySelector('.cat-item');
            if (allCategoryItem) setActiveCategory(allCategoryItem);

        } catch (error) {
            console.error('Erro ao buscar receitas:', error);
            featuredRecipesContainer.innerHTML = '<p class="message-box error-message">Erro ao buscar receitas. Tente novamente mais tarde.</p>';
        }
    }

    /**
     * NOVA FUNÇÃO displayRecipes
     * Exibe as receitas no container especificado usando o novo layout de card.
     */
    function displayRecipes(recipes, container) {
        container.innerHTML = '';

        if (!recipes || recipes.length === 0) {
            return;
        }

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'card-receita';

            // Dados de placeholder para metadados não disponíveis na API
            const time = Math.floor(Math.random() * 40) + 20; // Tempo aleatório entre 20-60 min
            const servings = Math.floor(Math.random() * 4) + 2; // Porções aleatórias entre 2-6
            const rating = (Math.random() * 1.5 + 3.5).toFixed(1); // Avaliação aleatória entre 3.5-5.0

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
            alert('Faça login para adicionar receitas aos favoritos!');
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
    }

}); // // Fim do DOMContentLoaded

 // Aplica o tema salvo ao carregar a página
  window.addEventListener('DOMContentLoaded', function() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
          document.body.classList.add('dark-theme');
      } else {
          document.body.classList.remove('dark-theme');
      }
  });
