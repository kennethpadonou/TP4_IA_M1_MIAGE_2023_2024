const endpointURL = 'http://localhost:3001/chat';
/*
window.onload = init;

function init() {
    // Ecouteur sur le bouton
    const buttonElement = document.querySelector('button');
    buttonElement.onclick = sendRequest;
}
*/
window.onload = init;

function init() {
    // Ecouteur sur le bouton
    const buttonElement = document.querySelector('button');
    buttonElement.onclick = sendRequest;

    // Ecouteurs d'événements pour mettre à jour les valeurs des sliders
    const temperatureSlider = document.getElementById('temperature');
    temperatureSlider.addEventListener('input', updateTemperatureValue);

    const maxTokensSlider = document.getElementById('maxTokens');
    maxTokensSlider.addEventListener('input', updateMaxTokensValue);
}

// Fonction pour mettre à jour la valeur de la température
function updateTemperatureValue() {
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperatureValue');
    temperatureValue.innerHTML = temperatureSlider.value;
}

// Fonction pour mettre à jour la valeur du nombre maximal de tokens
function updateMaxTokensValue() {
    const maxTokensSlider = document.getElementById('maxTokens');
    const maxTokensValue = document.getElementById('maxTokensValue');
    maxTokensValue.innerHTML = maxTokensSlider.value;
}
// Envoi d'une requête POST à l'API de notre serveur
async function sendRequest() {
    // On récupère la valeur du prompt
    const inputElement = document.querySelector('input');
    //const inputTemp = document.querySelector('temperature');
    //const inputToken = document.querySelector('token');
    // On récupère les valeurs des sliders
    const temperature = document.querySelector('#temperature').value;
    const maxTokens = document.querySelector('#maxTokens').value;

    const prompt = inputElement.value;
    //const temperature = inputTemp.value;
    //const token = inputToken.value;
    // si le prompt est vide on quitte la fonction
    if (prompt === '') return;

    // On envoie le contenu du prompt dans un FormData (eq. formulaires multipart)
    const promptData = new FormData();
    promptData.append('prompt', prompt);
    promptData.append('temperature', temperature);
    promptData.append('token', maxTokens);

    // Envoi de la requête POST par fetch, avec le FormData dans la propriété body
    // côté serveur on récupèrera dans req.body.prompt la valeur du prompt,
    // avec nodeJS on utilisera le module multer pour récupérer les donénes 
    // multer gère les données multipart/form-data
    const response = await fetch(endpointURL, {
        method: 'POST',
        body: promptData
    });

    const data = await response.json();

    // Affiche la réponse dans la console
    console.log(data);
    
     // Div output pour afficher les résultats
    const outputElement = document.querySelector('#output');

    // affiche le resultat dans le div output
    const pElement = document.createElement('p');
    // On récupère le choix de l'IA (regarder la console ou la réponse dans le debugger du navigateur)
    pElement.textContent = data.choices[0].message.content;
    outputElement.append(pElement);

    // On remet à zéro le champ input
    inputElement.value = '';
}