/**
 * API TheMealDB - Funções para consumo da API
 */

const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

/**
 * Busca receitas por nome
 * @param {string} name - Nome da receita
 * @returns {Promise} - Promise com os resultados da busca
 */
async function searchMealsByName(name) {
    try {
        const response = await fetch(`${API_BASE_URL}/search.php?s=${encodeURIComponent(name)}`);
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        console.error('Erro ao buscar receitas:', error);
        return [];
    }
}

/**
 * Busca receita aleatória
 * @returns {Promise} - Promise com uma receita aleatória
 */
async function getRandomMeal() {
    try {
        const response = await fetch(`${API_BASE_URL}/random.php`);
        const data = await response.json();
        return data.meals ? data.meals[0] : null;
    } catch (error) {
        console.error('Erro ao buscar receita aleatória:', error);
        return null;
    }
}

/**
 * Busca várias receitas aleatórias
 * @param {number} count - Quantidade de receitas
 * @returns {Promise} - Promise com array de receitas aleatórias
 */
async function getMultipleRandomMeals(count) {
    try {
        const meals = [];
        const promises = [];
        
        // Como a API gratuita não suporta múltiplas receitas aleatórias,
        // fazemos várias chamadas em paralelo
        for (let i = 0; i < count; i++) {
            promises.push(
                fetch(`${API_BASE_URL}/random.php`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.meals && data.meals[0]) {
                            meals.push(data.meals[0]);
                        }
                    })
            );
        }
        
        await Promise.all(promises);
        return meals;
    } catch (error) {
        console.error('Erro ao buscar receitas aleatórias:', error);
        return [];
    }
}

/**
 * Busca detalhes de uma receita por ID
 * @param {string} id - ID da receita
 * @returns {Promise} - Promise com os detalhes da receita
 */
async function getMealById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/lookup.php?i=${id}`);
        const data = await response.json();
        return data.meals ? data.meals[0] : null;
    } catch (error) {
        console.error('Erro ao buscar detalhes da receita:', error);
        return null;
    }
}

/**
 * Lista todas as categorias
 * @returns {Promise} - Promise com a lista de categorias
 */
async function getAllCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories.php`);
        const data = await response.json();
        return data.categories || [];
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        return [];
    }
}

/**
 * Filtra receitas por categoria
 * @param {string} category - Nome da categoria
 * @returns {Promise} - Promise com as receitas da categoria
 */
async function filterByCategory(category) {
    try {
        const response = await fetch(`${API_BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        console.error('Erro ao filtrar por categoria:', error);
        return [];
    }
}

/**
 * Filtra receitas por ingrediente
 * @param {string} ingredient - Nome do ingrediente
 * @returns {Promise} - Promise com as receitas que contêm o ingrediente
 */
async function filterByIngredient(ingredient) {
    try {
        const response = await fetch(`${API_BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        console.error('Erro ao filtrar por ingrediente:', error);
        return [];
    }
}

/**
 * Lista todas as áreas/países
 * @returns {Promise} - Promise com a lista de áreas
 */
async function getAllAreas() {
    try {
        const response = await fetch(`${API_BASE_URL}/list.php?a=list`);
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        console.error('Erro ao buscar áreas:', error);
        return [];
    }
}

/**
 * Filtra receitas por área/país
 * @param {string} area - Nome da área
 * @returns {Promise} - Promise com as receitas da área
 */
async function filterByArea(area) {
    try {
        const response = await fetch(`${API_BASE_URL}/filter.php?a=${encodeURIComponent(area)}`);
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        console.error('Erro ao filtrar por área:', error);
        return [];
    }
}

/**
 * Obtém detalhes completos de várias receitas a partir de uma lista de IDs
 * @param {Array} idList - Lista de IDs de receitas
 * @returns {Promise} - Promise com array de receitas detalhadas
 */
async function getMealDetailsByIds(idList) {
    try {
        const meals = [];
        const promises = [];
        
        for (const id of idList) {
            promises.push(
                getMealById(id).then(meal => {
                    if (meal) {
                        meals.push(meal);
                    }
                })
            );
        }
        
        await Promise.all(promises);
        return meals;
    } catch (error) {
        console.error('Erro ao buscar detalhes das receitas:', error);
        return [];
    }
}
