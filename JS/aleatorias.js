document.getElementById('random-recipe-btn').addEventListener('click', function() {
    // Exemplo de receitas aleatórias
    const receitas = [
        "Macarrão à Bolonhesa",
        "Frango Assado com Batatas",
        "Risoto de Cogumelos",
        "Salada Caesar",
        "Torta de Limão"
    ];
    const sorteada = receitas[Math.floor(Math.random() * receitas.length)];
    document.getElementById('random-recipe-btn').style.display = 'none';
    document.getElementById('recipe-result').style.display = 'block';
    document.getElementById('recipe-result').innerText = `Sugestão: ${sorteada}`;
});