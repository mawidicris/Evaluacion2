const errorContainer = document.querySelector(".containerError");
const infoContainer = document.querySelector(".containerInfo");
const evolutionContainer = document.querySelector(".containerEvolution");
const evolutionButton = document.querySelector(".buttonEvolution");
const input = document.getElementById("in1");
const searchButton = document.querySelector(".buttonSearch");
 // Manejador de evento para el botón de búsqueda
 searchButton.addEventListener("click", () => {
    searchPokemon();
});

// Manejador de evento para presionar la tecla "Enter" en el campo de entrada
input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            searchPokemon();
        }
    });


async function searchPokemon() {
        const pokemonName = input.value.trim().toLowerCase();
        if (pokemonName !== "") {
            await getPokemonInfo(pokemonName);
            
        }
    }
async function getPokemonInfo(name) {
    try {
        const pokemonData = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const speciesData = await axios.get(pokemonData.data.species.url);
        console.log("Datos del Pokémon:", pokemonData.data);

        const abilities = pokemonData.data.abilities.map(ability => ability.ability.name).join(", ");
        const types = pokemonData.data.types.map(type => type.type.name).join(", ");
        const description = speciesData.data.flavor_text_entries.find(entry => entry.language.name === "es").flavor_text;

        updatePokemonInfo(pokemonData.data.name, pokemonData.data.sprites.other["official-artwork"].front_default, types, description, abilities);
        errorContainer.style.display = "none";
        infoContainer.style.display = "block";

        const evolutionChainData = await axios.get(speciesData.data.evolution_chain.url);
        const evolutionChain = getEvolutionChain(evolutionChainData.data.chain);
        updateEvolutionInfo(evolutionChain);
    } catch (error) {
        console.error("Error al obtener información del Pokémon:", error);
        errorContainer.style.display = "block";
        infoContainer.style.display = "none";
    }
}

function updatePokemonInfo(name, imgUrl, types, description, abilities) {
    const pokemonName = document.querySelector(".pokemonName");
    const pokemonImg = document.querySelector(".pokemonImg");
    const pokemonType = document.querySelector(".pokemonType");
    const pokemonDescrition = document.querySelector(".pokemonDescrition");
    const pokemonAbilities = document.querySelector(".pokemonAbilities");

        pokemonName.textContent = name;
        pokemonImg.src = imgUrl;
        pokemonType.textContent = types;
        pokemonDescrition.textContent = description;
        pokemonAbilities.textContent = abilities;
}

function getEvolutionChain(chain) {
    const evolutionChain = [];
    while (chain) {
        evolutionChain.push(chain.species.name);

        if (chain.evolves_to.length > 0) {
            chain = chain.evolves_to[0];
        } else {
            chain = null;
        }
    }
    return evolutionChain;
}

async function updateEvolutionInfo(evolutionChain) {
    if (evolutionChain.length > 1) {
        evolutionContainer.style.display = "block";

        let currentIndex = 0;

        evolutionContainer.addEventListener("click", async () => {
            const nextPokemonIndex = (currentIndex + 1) % evolutionChain.length;
            const nextPokemonName = evolutionChain[nextPokemonIndex];
            evolutionContainer.dataset.evolvedPokemon = nextPokemonName;
            await getPokemonInfo(nextPokemonName);

            currentIndex = nextPokemonIndex;

            // Verificar si se ha llegado al final de la cadena de evolución
            if (currentIndex === 0) {
                // Mostrar el último Pokémon de la lista
                const lastPokemonIndex = evolutionChain.length - 1;
                const lastPokemonName = evolutionChain[lastPokemonIndex];
                evolutionContainer.dataset.evolvedPokemon = lastPokemonName;
                await getPokemonInfo(lastPokemonName);
                
                // Ocultar el contenedor de evolución y el botón de evolución
                evolutionContainer.style.display = "none";   
                evolutionButton.style.display = "none";
            }
        });
    } 
}




