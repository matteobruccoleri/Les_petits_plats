export default class Dropdown {
    constructor(dropdownId) {
        this.dropdownId = dropdownId;
        this.dropdown = document.getElementById(dropdownId);
        this.selectedFiltersDiv = document.getElementById('selectedFilters');
        this.selectedItems = new Set(); // Gérer les éléments sélectionnés
    }

    fillDropdown(items) {
        if (!this.dropdown.querySelector('.dropdown-search')) {
            this.dropdown.innerHTML = `<li class="li_form_dropdown">
                                        <form class="form_dropdown">
                                            <input type="search" placeholder="Recherche..." class="dropdown-search">
                                            <img class="grey_loop" src="assets/icons/icon_grey_loop.svg" alt="Rechercher">
                                        </form>
                                    </li>`;
        }

        const searchField = this.dropdown.querySelector('.dropdown-search');
        searchField.addEventListener('input', (event) => {
            const searchTerm = event.target.value;
            this.filterDropdown(items, searchTerm);
        });

        this.filterDropdown(items, '');
    }

    filterDropdown(items, searchTerm) {
        const filteredItems = items.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
        const listItems = filteredItems.map(item => {
            const isSelected = this.selectedItems.has(item);
            return `<li role="option" ${isSelected ? 'class="selected-background"' : ''} ${isSelected ? 'style="pointer-events:none;"' : ''}>${item}</li>`;
        }).join('');

        this.dropdown.innerHTML = `<li class="li_form_dropdown">
                                    <form class="form_dropdown">
                                        <input class="dropdown-search" type="search" placeholder="Recherche..." value="${searchTerm}">
                                        <img class="grey_loop" src="assets/icons/icon_grey_loop.svg" alt="Rechercher">
                                    </form>
                                  </li>
                                  ${listItems}`;

        const dropdownSearch = this.dropdown.querySelector('.dropdown-search');
        dropdownSearch.addEventListener('input', (event) => {
            this.filterDropdown(items, event.target.value);
        });

        // Ajout d'un écouteur d'événement pour chaque élément de la liste.
        const listElements = this.dropdown.querySelectorAll('li[role="option"]');
        listElements.forEach(element => {
            element.addEventListener('click', () => {
                const filter = element.textContent;
                this.addSelectedFilter(filter);
                element.classList.add('selected-background');
                element.style.pointerEvents = 'none';
                // Notification à RecipeManager du choix d'un filtre spécifique
                document.dispatchEvent(new CustomEvent('filterRecipes', {
                    detail: {
                        type: this.dropdownId, // Envoie le type de filtre (ingredientsDropdown, ustensilsDropdown, appliancesDropdown)
                        value: filter // Envoie la valeur sélectionnée
                    }
                }));
            });
        });
    }

    addSelectedFilter(filter) {
        this.selectedItems.add(filter); // Ajouter à l'ensemble des éléments sélectionnés
        const filterElement = document.createElement('span');
        filterElement.classList.add('selected-filter');
        filterElement.textContent = filter;
        filterElement.addEventListener('click', () => {
            this.removeSelectedFilter(filter);
            filterElement.remove();
        });
        this.selectedFiltersDiv.appendChild(filterElement);
    }

    removeSelectedFilter(filter) {
        this.selectedItems.delete(filter); // Supprimer de l'ensemble des éléments sélectionnés
        // Supprimer le marquage du dropdown
        const dropdownElement = Array.from(this.dropdown.querySelectorAll('li')).find(el => el.textContent === filter);
        if (dropdownElement) {
            dropdownElement.classList.remove('selected-background');
            dropdownElement.style.pointerEvents = 'auto';
        }
        // Notification à RecipeManager de la suppression d'un filtre spécifique
        document.dispatchEvent(new CustomEvent('removeFilter', {
            detail: {
                type: this.dropdownId, // Envoie le type de filtre
                value: filter // Envoie la valeur du filtre supprimé
            }
        }));
    }
}
