// Variables globales pour stocker les informations de l'oeuvre cliquée
let selectedTitle = '';
let selectedMouvement = '';
let selectedStyle = '';
let selectedPersonnalité = '';




// Variable pour stocker la carte actuellement sélectionnée
let currentlySelectedCard = null;

document.addEventListener('DOMContentLoaded', function () {
    fetch('./json/tableaux.json')
        .then(response => response.json())
        .then(data => generateGallery(data))
        .catch(error => console.error('Error loading JSON:', error));

    function generateGallery(data) {
        const gallery = document.querySelector('.row');
        debugger;
        data.forEach(item => {
            const column = document.createElement('div');
            column.classList.add('column');

            const card = document.createElement('div');
            card.classList.add('card');

            const title = document.createElement('h3');
            title.classList.add('hover-effect');
            title.textContent = item.title;

            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.title;
            img.style.width = '100%';
            debugger;
            const mouvement = document.createElement('p');
            mouvement.innerHTML = `Mouvement : <span>${item.mouvement}</span>`;

            const style = document.createElement('p');
            style.innerHTML = `Style : <span>${item.style}</span>`;

            const personnalité = document.createElement('p');
            personnalité.innerHTML = `Personnalité : <span>${item.personnalité}</span>`;

            const auteur = document.createElement('p');
            auteur.innerHTML = `Auteur : <span>${item.auteur}</span>`;

            card.appendChild(title);
            card.appendChild(img);
            card.appendChild(mouvement);
            card.appendChild(style);
            card.appendChild(personnalité);
            card.appendChild(auteur);
            column.appendChild(card);
            gallery.appendChild(column);

            // Ajout de l'événement click à la carte
            card.addEventListener('click', function () {
                // Mise à jour des variables
                selectedTitle = item.title;
                selectedMouvement = item.mouvement;
                selectedStyle = item.style;
                selectedPersonnalité = item.personnalité;
                selectedAuthor = item.auteur;
                // Stocker les variables sélectionnées dans le localStorage
                updateSelectedVariablesAndLocalStorage(item.title, item.mouvement, item.style, item.personnalité, item.auteur);
                console.log('Oeuvre sélectionnée:', {
                    title: selectedTitle,
                    mouvement: selectedMouvement,
                    style: selectedStyle,
                    personnalité: selectedPersonnalité
                });

                // Retirer la classe selected-card de la carte précédemment sélectionnée
                if (currentlySelectedCard) {
                    currentlySelectedCard.classList.remove('selected-card');
                }

                // Ajouter la classe selected-card à la carte cliquée
                card.classList.add('selected-card');
                currentlySelectedCard = card;
            });
        });
    }
    function updateSelectedVariablesAndLocalStorage(title, mouvement, style, personnalité) {
        selectedTitle = title;
        selectedMouvement = mouvement;
        selectedStyle = style;
        selectedPersonnalité = personnalité;

        // Stocker les variables sélectionnées dans le localStorage
        localStorage.setItem('selectedTitle', selectedTitle);
        localStorage.setItem('selectedMouvement', selectedMouvement);
        localStorage.setItem('selectedStyle', selectedStyle);
        localStorage.setItem('selectedPersonnalité', selectedPersonnalité);
        localStorage.setItem('selectedAuthor', selectedAuthor);
    }
});
