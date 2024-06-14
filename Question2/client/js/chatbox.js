

const endpointURL = 'http://localhost:3001/chat';
document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('chatbox-input');
    const sendButton = document.getElementById('chatbox-send');
    const messagesContainer = document.querySelector('.chatbox-messages');

    // Charger l'historique de discussion depuis le localStorage lors du chargement de la page
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    chatHistory.forEach(message => {
        addMessage(message.sender, message.text);
    });

    sendButton.addEventListener('click', sendMessage);
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    

    // Fonction pour sauvegarder un message dans le localStorage
    function saveMessageToLocalStorage(sender, text) {
        // Récupérer l'historique de discussion actuel depuis le localStorage
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

        // Ajouter le nouveau message à l'historique
        chatHistory.push({ sender, text });

        // Mettre à jour l'historique de discussion dans le localStorage
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }

    async function sendMessage() {
        const messageText = input.value.trim();
        if (messageText !== '') {
            addMessage('Vous', messageText);
            input.value = '';

            let url = endpointURL; // Par défaut, l'URL est celle de '/chat'
            let body = { prompt: messageText }; // Initialisation de body
            // Vérifie si le message commence par "/image"
            debugger;
            if (messageText.startsWith('/image')) {
                url = 'http://localhost:3001/image'; // Si c'est le cas, change l'URL pour '/image'
            } else if (messageText.startsWith('/generateTableau')) {
                url = 'http://localhost:3001/generateTableau'; // Si c'est le cas, change l'URL pour '/generateTableau'

                // Etape 1 : améliorer le prompt : 
                const selectedTitle = localStorage.getItem('selectedTitle');
                const selectedMouvement = localStorage.getItem('selectedMouvement');
                const selectedStyle = localStorage.getItem('selectedStyle');
                const selectedPersonnalité = localStorage.getItem('selectedPersonnalité');
                prompt_brut = "Améliore ce prompt :  Génère moi un tableau de ce style : " + selectedTitle + selectedMouvement + selectedStyle + selectedPersonnalité + "."
                console.log("prompt_brut : ", prompt_brut);
                const improvePromptResponse = await fetch(endpointURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt: prompt_brut })
                });
                
                const improvePromptData = await improvePromptResponse.json();
                const improvedPrompt = improvePromptData.choices[0].message.content;
                body = {
                    prompt: messageText,
                    prompt2: improvedPrompt,
                    selectedTitle: selectedTitle, // Remplacez par la valeur réelle
                    selectedMouvement: selectedMouvement, // Remplacez par la valeur réelle
                    selectedStyle: selectedStyle, // Remplacez par la valeur réelle
                    selectedPersonnalité: selectedPersonnalité // Remplacez par la valeur réelle
                };
            }
            /*else if (messageText.startsWith('/generateTableau')) {
                const improvePromptResponse = await fetch(endpointURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt: prompt_brut })
                });
            }*/
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body.prompt ? body : { prompt: messageText })

                });
                const data = await response.json();
                //addMessage('ArtGPT', data.choices[0].message.content);
                console.log("data : ", data);
                // Si la réponse contient un lien d'image, mettez à jour le fichier JSON tableaux.json
                if (data.imageLink) {
                    debugger;
                    updateTableauxJSON(data.imageLink, selectedTitle, selectedMouvement, selectedStyle, selectedPersonnalité);
                }
                // Sauvegarder le message dans le localStorage
                saveMessageToLocalStorage('Vous', messageText);
                //saveMessageToLocalStorage('ArtGPT', data.choices[0].message.content);
            } catch (error) {
                console.error('Erreur lors de l\'envoi de la requête :', error);
            }
        }
    }

    function addMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function updateTableauxJSON(imageLink, title, mouvement, style, personnalité) {
        debugger;
        // Construire un nouvel objet représentant les informations du tableau
        const newTableau = {
            title: title,
            image: imageLink,
            mouvement: mouvement,
            style: style,
            personnalité: personnalité,
            auteur: 'Vous' // Par défaut, l'auteur est Inconnu
        };
        
        // Récupérer le contenu actuel du fichier JSON
        fetch('../json/tableaux.json')
            .then(response => response.json())
            .then(data => {
                debugger;
                // Ajouter le nouvel objet au tableau existant
                console.log("data_ : ", data);
                data.push(newTableau);

                // Mettre à jour le fichier JSON avec les nouvelles données
                //fetch('./client/json/tableaux.json', {
                    fetch('/update-tableaux', { 
                    method: 'PUT', // Utiliser PUT pour mettre à jour le fichier
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    //body: JSON.stringify(data) // Envoyer les données mises à jour
                    body: JSON.stringify(newTableau) // Envoyer les données mises à jour
                })
                    .then(response => {
                        if (response.ok) {
                            debugger
                            console.log('Le fichier tableaux.json a été mis à jour avec succès.');
                            console.log("data- : ", data);
                        } else {
                            console.error('Erreur lors de la mise à jour du fichier tableaux.json.');
                        }
                    })
                    .catch(error => console.error('Erreur lors de la mise à jour du fichier tableaux.json :', error));
            })
            .catch(error => console.error('Erreur lors de la récupération du fichier tableaux.json :', error));
    }
});

//});
