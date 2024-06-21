import Recipes from "../models/Recipes.js";
import Dropdown from "../models/Dropdown.js";

export default class RecipeManager {
    constructor() {
        this.allRecipes = []; // Liste de toutes les recettes
        this.activeFilters = {
            ingredients: [], // Filtres actifs pour les ingrédients
            ustensils: [], // Filtres actifs pour les ustensiles
            appliances: [] // Filtres actifs pour les appareils
        };
        this.ingredientsDropdown = new Dropdown('ingredientsDropdown'); // Dropdown pour les ingrédients
        this.ustensilsDropdown = new Dropdown('ustensilsDropdown'); // Dropdown pour les ustensiles
        this.appliancesDropdown = new Dropdown('appliancesDropdown'); // Dropdown pour les appareils
    }

    // Récupère les recettes depuis un fichier JSON local.
    async getRecipes() {
        try {
            const response = await fetch("./data/recipes.json");
            const recipes = await response.json();
            return recipes;
        } catch (error) {
            console.error('Failed to fetch recipes:', error);
        }
    }

    // Affiche les recettes sur la page.
    displayRecipes(recipes) {
        const section = document.querySelector('.recipes_wrapper');
        section.innerHTML = ''; // Efface les recettes existantes
        recipes.forEach(recipe => recipe.createRecipeCard()); // Crée une carte pour chaque recette
        this.updateRecipeCount(recipes.length); // Met à jour le nombre de recettes
    }

    // Affiche un message lorsqu'aucune recette n'est trouvée.
    displayNoResultsMessage(searchTerm) {
        const noResultsElement = document.getElementById('noResultsMessage');
        noResultsElement.innerHTML = `<p class="no-results">Aucune recette ne contient '${searchTerm}'. Vous pouvez chercher « tarte aux pommes », « poisson », etc.</p>`;
        this.updateRecipeCount(0); // Met à jour le nombre de recettes à 0
    }

    // Effectue la recherche et filtre les recettes en fonction du terme de recherche et des filtres actifs.
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput.value.trim().toLowerCase();
        let filteredRecipes = this.allRecipes;

        // Filtre par terme de recherche si celui-ci contient 3 caractères ou plus
        if (searchTerm.length >= 3) {
            filteredRecipes = this.allRecipes.filter(recipe => recipe.matchesSearch(searchTerm));
        }

        // Filtre par filtres actifs (ingrédients, ustensiles, appareils)
        filteredRecipes = filteredRecipes.filter(recipe => {
            const matchesIngredients = this.activeFilters.ingredients.length === 0 || this.activeFilters.ingredients.some(filter => recipe.ingredients.map(ing => ing.ingredient.toLowerCase()).includes(filter.toLowerCase()));
            const matchesUstensils = this.activeFilters.ustensils.length === 0 || this.activeFilters.ustensils.some(filter => recipe.ustensils.map(ust => ust.toLowerCase()).includes(filter.toLowerCase()));
            const matchesAppliances = this.activeFilters.appliances.length === 0 || this.activeFilters.appliances.includes(recipe.appliance.toLowerCase());

            return matchesIngredients && matchesUstensils && matchesAppliances;
        });

        const noResultsElement = document.getElementById('noResultsMessage');
        if (filteredRecipes.length > 0) {
            if (noResultsElement) noResultsElement.innerHTML = ''; // Efface le message d'absence de résultats
            this.displayRecipes(filteredRecipes); // Affiche les recettes filtrées
        } else {
            this.displayNoResultsMessage(searchTerm); // Affiche le message d'absence de résultats
        }
        
        this.updateDropdowns(filteredRecipes); // Met à jour les options des dropdowns
    }

    // Attache les écouteurs d'événements pour la barre de recherche et les boutons des dropdowns.
    attachEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const dropdownButtons = document.querySelectorAll('.sort_button');

        // Écoute les événements de saisie dans la barre de recherche
        searchInput.addEventListener('input', event => {
            event.preventDefault();
            this.performSearch(); // Effectue la recherche lors de la saisie
        });

        // Toggle la visibilité des dropdowns lors du clic sur les boutons
        dropdownButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation(); // Empêche la propagation de l'événement de clic
                this.toggleDropdown(button);
            });
        });

        // Ferme les dropdowns lorsqu'on clique à l'extérieur
        document.addEventListener('click', (event) => {
            this.closeDropdowns(event);
        });

        // Empêche la fermeture du dropdown lors d'un clic à l'intérieur
        document.querySelectorAll('.sort_dropdown').forEach(dropdown => {
            dropdown.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        });

        // Écoute les événements personnalisés de filtre provenant des dropdowns
        document.addEventListener('filterRecipes', (event) => {
            const { type, value } = event.detail;
            this.activeFilters[type.split('Dropdown')[0]].push(value.toLowerCase());
            this.performSearch(); // Effectue la recherche avec le nouveau filtre
        });

        // Écoute les événements de suppression de filtre provenant des dropdowns
        document.addEventListener('removeFilter', (event) => {
            const { type, value } = event.detail;
            const filterType = type.split('Dropdown')[0];
            this.activeFilters[filterType] = this.activeFilters[filterType].filter(filter => filter !== value.toLowerCase());
            this.performSearch(); // Effectue la recherche après suppression du filtre
        });
    }

    // Affiche ou cache le dropdown sélectionné et ferme les autres
    toggleDropdown(button) {
        const dropdownId = button.getAttribute('aria-controls');
        const dropdown = document.getElementById(dropdownId);
        const chevron = button.querySelector('.chevron');

        // Fermer tous les dropdowns ouverts
        document.querySelectorAll('.sort_dropdown.show').forEach(openDropdown => {
            if (openDropdown !== dropdown) {
                openDropdown.classList.remove('show');
                const openButton = document.querySelector(`[aria-controls="${openDropdown.id}"]`);
                const openChevron = openButton.querySelector('.chevron');
                if (openChevron) {
                    openChevron.classList.remove('rotate');
                }
            }
        });

        // Toggle le dropdown cliqué
        dropdown.classList.toggle('show');
        chevron.classList.toggle('rotate');
    }

    // Ferme tous les dropdowns lorsqu'on clique à l'extérieur
    closeDropdowns(event) {
        const isDropdownButton = event.target.closest('.sort_button');
        if (!isDropdownButton) {
            document.querySelectorAll('.sort_dropdown.show').forEach(dropdown => {
                dropdown.classList.remove('show');
                const button = document.querySelector(`[aria-controls="${dropdown.id}"]`);
                const chevron = button.querySelector('.chevron');
                if (chevron) {
                    chevron.classList.remove('rotate');
                }
            });
        }
    }

    // Initialise le RecipeManager en récupérant les recettes, les affichant et en attachant les écouteurs d'événements.
    async init() {
        const dataRecipes = await this.getRecipes();
        this.allRecipes = dataRecipes.map(dataRecipe => new Recipes(dataRecipe));
        this.displayRecipes(this.allRecipes); // Affiche toutes les recettes initialement
        this.attachEventListeners(); // Attache les écouteurs d'événements pour les interactions
        this.updateDropdowns(this.allRecipes); // Remplit les dropdowns avec les données initiales des recettes
    }

    // Met à jour les options des dropdowns en fonction des recettes filtrées.
    updateDropdowns(recipes) {
        const ingredients = new Set();
        const utensils = new Set();
        const appliances = new Set();

        recipes.forEach(recipe => {
            recipe.ingredients.forEach(ingredient => ingredients.add(ingredient.ingredient));
            recipe.ustensils.forEach(ustensil => utensils.add(ustensil));
            appliances.add(recipe.appliance);
        });

        this.ingredientsDropdown.fillDropdown(Array.from(ingredients));
        this.ustensilsDropdown.fillDropdown(Array.from(utensils));
        this.appliancesDropdown.fillDropdown(Array.from(appliances));
    }

    // Met à jour le nombre de recettes affichées sur la page.
    updateRecipeCount(count) {
        const totalRecipesElement = document.querySelector('.total_recipes');
        totalRecipesElement.textContent = `${count} recettes`;
    }
}