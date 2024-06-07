export default class Recipes {
    constructor(data) {
        this.id = data.id
        this.image = data.image
        this.name = data.name
        this.servings = data.servings
        this.ingredients = data.ingredients
        this.time = data.time
        this.description = data.description
        this.appliance = data.appliance
        this.ustensils = data.ustensils
    }

    // Méthode pour déterminer si cette recette correspond à la recherche
    matchesSearch(searchTerm) {
        const searchFields = [
            this.name.toLowerCase(),
            this.description.toLowerCase(),
            ...this.ingredients.map(element => element.ingredient.toLowerCase())
        ];
        return searchFields.some(field => field.includes(searchTerm));
    }

    createRecipeCard() {
        const sectionRecipes = document.querySelector(".recipes_wrapper");   
        const articleRecipe = document.createElement('article');

        articleRecipe.classList.add('recipe');
        articleRecipe.innerHTML = `
            <img src="assets/recettes/${this.image}" alt="${this.name}">
            <span class="recipe_time">${this.time}min</span>
            <div class="recipe_text">
                <h2>${this.name}</h2>
                <div class="recipe_description">
                    <h3>recette</h3>
                    <p>${this.description}</p>
                </div>
                <div class="recipe_ingredients">
                    <h3>ingrédients</h3>
                    <div class="ingredients_content">                    
                    ${this.ingredients.map(element => {
                        if (element.quantity && element.unit) {
                            return `
                                <div class="ingredient_text">
                                    <p class="ingredient_name">${element.ingredient}</p>
                                    <p class="quantity_unit">${element.quantity} ${element.unit}</p>
                                </div>
                                    `;
                        }
                        if (element.quantity) {
                            return `
                                <div class="ingredient_text">
                                    <p class="ingredient_name">${element.ingredient}</p>
                                    <p class="quantity_unit">${element.quantity}</p>
                                </div>
                                    `;
                        } else {
                            return `
                                <div class="ingredient_text">
                                    <p>${element.ingredient}</p>
                                    <p class="quantity_unit">-</p>
                                </div>
                                    `;
                        }
                    })
                    .join('')}
                    </div>
                </div>                 
            </div>
        `;
        sectionRecipes.appendChild(articleRecipe);
    }

}