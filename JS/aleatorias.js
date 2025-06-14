async function getRandomMeal() {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const data = await response.json();
    return data.meals[0];
}

document.getElementById('random-recipe-btn').addEventListener('click', async function() {
    const resultDiv = document.getElementById('recipe-result');
    resultDiv.style.display = 'block';

    try {
        const meal = await getRandomMeal();
        resultDiv.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <h3>${meal.strMeal}</h3>
            <div class="recipe-meta">
                <strong>Categoria:</strong> ${meal.strCategory} <br>
                <strong>Área:</strong> ${meal.strArea}
            </div>
            <div class="section-title">Ingredientes:</div>
            <ul>
                ${getIngredientsList(meal).map(ing => `<li>${ing}</li>`).join('')}
            </ul>
            <div class="section-title">Instruções:</div>
            <p>${meal.strInstructions}</p>
        `;
    } catch (error) {
        resultDiv.innerHTML = 'Erro ao buscar receita aleatória.';
    }
});

// Função auxiliar para extrair ingredientes e medidas
function getIngredientsList(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            ingredients.push(`${ingredient} - ${measure}`);
        }
    }
    return ingredients;
}


    async function getRandomMeal() {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
        const data = await response.json();
        return data.meals[0];
    }

    function getIngredientsList(meal) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push(`${ingredient} - ${measure}`);
            }
        }
        return ingredients;
    }

    document.getElementById('random-recipe-btn').addEventListener('click', async function() {
        const resultDiv = document.getElementById('recipe-result');
        resultDiv.style.display = 'block';

        try {
            const meal = await getRandomMeal();
            resultDiv.innerHTML = `
                <h3>${meal.strMeal}</h3>
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="max-width:250px;display:block;margin:0 auto 18px auto;border-radius:8px;">
                <strong>Categoria:</strong> ${meal.strCategory}<br>
                <strong>Área:</strong> ${meal.strArea}<br>
                <strong>Ingredientes:</strong>
                <ul>
                    ${getIngredientsList(meal).map(ing => `<li>${ing}</li>`).join('')}
                </ul>
                <strong>Instruções:</strong>
                <p style="text-align:left">${meal.strInstructions}</p>
            `;
        } catch (error) {
            resultDiv.innerHTML = 'Erro ao buscar receita aleatória.';
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
