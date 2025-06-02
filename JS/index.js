/**
 * Lógica específica da página inicial (index.html)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elementos da página
    const featuredRecipesContainer = document.getElementById('featured-recipes');
    const categoriesContainer = document.getElementById('categories-container');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const ctaBtn = document.getElementById('cta-btn'); // Botão "Começar Agora" no hero
    const joinBtn = document.getElementById('join-btn'); // Botão "Criar Conta" na seção "Junte-se"
    
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

    // Botão "Começar Agora" (Hero) e "Entrar" (Header) abrem o modal de autenticação
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            const authModal = document.getElementById('auth-modal');
            if (authModal) {
                authModal.style.display = 'flex';
                // Opcional: garantir que a aba de login esteja ativa
                // const loginTab = document.querySelector('.tab-btn[data-tab="login"]');
                // if (loginTab && !loginTab.classList.contains('act')) loginTab.click();
            }
        });
    }
    
    // Botão "Criar Conta" na seção "Junte-se" abre modal de autenticação na aba de registro
    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            const authModal = document.getElementById('auth-modal');
            if (authModal) {
                authModal.style.display = 'flex';
                // Mudar para a aba de registro
                const registerTab = document.querySelector('.tab-btn[data-tab="register"]');
                const loginTab = document.querySelector('.tab-btn[data-tab="login"]');
                if (registerTab && loginTab) {
                    // Simula o clique na aba de registro (auth.js deve lidar com a troca visual)
                    // Esta lógica pode ser mais robusta se a função switchTab de auth.js for exportável e importável aqui.
                    // Por enquanto, apenas tentamos clicar.
                    registerTab.click(); 
                }
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

    // Fechar modal de receita ao clicar fora da caixa do modal
    if (recipeModal) {
        recipeModal.addEventListener('click', (e) => {
            if (e.target === recipeModal) { // Verifica se o clique foi no fundo do modal
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
                categoriesContainer.innerHTML = ''; // Limpa o loading se não houver categorias
                return;
            }
            categoriesContainer.innerHTML = ''; // Limpa o loading

            const allItem = document.createElement('div');
            allItem.className = 'cat-item active';
            allItem.textContent = 'Todas';
            allItem.addEventListener('click', () => {
                setActiveCategory(allItem);
                const sectionTitleH2 = featuredRecipesContainer.previousElementSibling; // Pega o h2.titulo
                if(sectionTitleH2 && sectionTitleH2.classList.contains('titulo')) {
                    sectionTitleH2.textContent = "Receitas em Destaque";
                }
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
        
        const sectionTitleH2 = featuredRecipesContainer.previousElementSibling; // Pega o h2.titulo
        if(sectionTitleH2 && sectionTitleH2.classList.contains('titulo')) {
            sectionTitleH2.textContent = `Receitas de ${category}`;
        }

        try {
            const recipes = await filterByCategory(category); // Da api.js
            if (recipes.length === 0) {
                featuredRecipesContainer.innerHTML = `<p class="message-box">Nenhuma receita encontrada na categoria "${category}".</p>`;
                return;
            }
            displayRecipes(recipes.slice(0, 6), featuredRecipesContainer); // Limita a 6
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
        const sectionTitleH2 = featuredRecipesContainer.previousElementSibling; // Pega o h2.titulo
         if(sectionTitleH2 && sectionTitleH2.classList.contains('titulo')) {
            sectionTitleH2.textContent = `Resultados para "${query}"`;
        }

        try {
            const recipes = await searchMealsByName(query); // Da api.js
            if (recipes.length === 0) {
                featuredRecipesContainer.innerHTML = `<p class="message-box">Nenhuma receita encontrada para "${query}".</p>`;
                return;
            }
            displayRecipes(recipes.slice(0, 6), featuredRecipesContainer); // Limita a 6

            // Resetar categorias para "Todas"
            const allCategoryItem = categoriesContainer.querySelector('.cat-item'); // Pega o primeiro item ("Todas")
            if (allCategoryItem) setActiveCategory(allCategoryItem);

        } catch (error) {
            console.error('Erro ao buscar receitas:', error);
            featuredRecipesContainer.innerHTML = '<p class="message-box error-message">Erro ao buscar receitas. Tente novamente mais tarde.</p>';
        }
    }

    /**
     * NOVA FUNÇÃO displayRecipes
     * Exibe as receitas no container especificado usando as classes CSS atualizadas.
     * @param {Array} recipes - Array de objetos de receita.
     * @param {HTMLElement} container - Elemento HTML onde os cards serão inseridos.
     */
    function displayRecipes(recipes, container) {
        container.innerHTML = ''; // Limpa o container antes de adicionar novos cards

        if (!recipes || recipes.length === 0) {
            // Opcional: exibir uma mensagem se `recipes` for nulo ou vazio,
            // embora as funções chamadoras já façam isso.
            // container.innerHTML = '<p class="message-box">Nenhuma receita para exibir.</p>';
            return;
        }

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'card-receita'; // Classe principal do card estilizada

            // Tenta obter uma breve descrição ou usa a área/categoria
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

            // Adiciona evento de clique ao card inteiro para abrir detalhes
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
            const recipe = await getMealById(id); // Da api.js

            if (!recipe) {
                recipeTitle.textContent = 'Erro';
                recipeContent.innerHTML = '<p class="message-box error-message">Não foi possível carregar os detalhes da receita.</p>';
                return;
            }

            recipeTitle.textContent = recipe.strMeal;
            updateFavoriteButton(); // Atualiza o estado do botão de favorito

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
     * ATUALIZADA: Atualiza a aparência do botão de favorito no modal.
     */
    function updateFavoriteButton() {
        if (!favoriteRecipeBtn || !currentRecipeId) return;

        const isFav = isFavorite(currentRecipeId); // Da auth.js

        if (isFav) {
            favoriteRecipeBtn.textContent = 'Remover dos Favoritos';
            favoriteRecipeBtn.classList.remove('btn-ajustar'); // Classe de "adicionar"
            favoriteRecipeBtn.classList.add('btn-sair');    // Classe de "remover" (estilo de perigo/secundário)
        } else {
            favoriteRecipeBtn.textContent = 'Adicionar aos Favoritos';
            favoriteRecipeBtn.classList.remove('btn-sair');
            favoriteRecipeBtn.classList.add('btn-ajustar');
        }
    }

    function toggleFavorite() {
        if (!currentRecipeId) return;
        const userIsLoggedIn = isLoggedIn(); // Da auth.js

        if (!userIsLoggedIn) {
            alert('Faça login para adicionar receitas aos favoritos!');
            if (recipeModal) recipeModal.style.display = 'none'; // Fecha o modal de receita
            
            const authModal = document.getElementById('auth-modal'); // Abre o modal de login
            if (authModal) authModal.style.display = 'flex';
            return;
        }

        if (isFavorite(currentRecipeId)) { // Da auth.js
            removeFavorite(currentRecipeId); // Da auth.js
        } else {
            addFavorite(currentRecipeId); // Da auth.js
        }
        updateFavoriteButton(); // Atualiza o botão no modal
    }

}); // Fim do DOMContentLoaded