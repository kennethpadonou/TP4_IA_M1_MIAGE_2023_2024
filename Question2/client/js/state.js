export let selectedTitle = '';
export let selectedMouvement = '';
export let selectedStyle = '';
export let selectedPersonnalité = '';

// Fonctions pour mettre à jour les variables
export function setSelectedTitle(title) {
    selectedTitle = title;
}

export function setSelectedMouvement(mouvement) {
    selectedMouvement = mouvement;
    console.log(selectedMouvement);
}

export function setSelectedStyle(style) {
    selectedStyle = style;
}

export function setSelectedPersonnalité(personnalité) {
    selectedPersonnalité = personnalité;
}
