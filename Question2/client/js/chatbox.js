const endpointURL = 'http://localhost:3001/chat';

document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('chatbox-input');
    const sendButton = document.getElementById('chatbox-send');
    const messagesContainer = document.querySelector('.chatbox-messages');
    const newConversationButton = document.getElementById('new-conversation');
    const conversationsList = document.getElementById('conversations-list');
    
    let currentConversationId = null;

    // Charger les conversations existantes depuis le localStorage
    const conversations = JSON.parse(localStorage.getItem('conversations')) || {};

    function loadConversation(conversationId) {
        currentConversationId = conversationId;
        const chatHistory = conversations[conversationId] || [];
        messagesContainer.innerHTML = '';
        chatHistory.forEach(message => {
            addMessage(message.sender, message.text);
        });

        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        document.getElementById(conversationId).classList.add('active');
    }

    function saveMessageToLocalStorage(conversationId, sender, text) {
        const chatHistory = conversations[conversationId] || [];
        chatHistory.push({ sender, text });
        conversations[conversationId] = chatHistory;
        localStorage.setItem('conversations', JSON.stringify(conversations));
    }

    function addMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function sendMessage() {
        const messageText = input.value.trim();
        if (messageText !== '' && currentConversationId !== null) {
            addMessage('Vous', messageText);
            input.value = '';

            let url = endpointURL;
            let body = { prompt: messageText };

            if (messageText.startsWith('/image')) {
                url = 'http://localhost:3001/image';
            } else if (messageText.startsWith('/generateTableau')) {
                url = 'http://localhost:3001/generateTableau';
                
                const selectedTitle = localStorage.getItem('selectedTitle');
                const selectedMouvement = localStorage.getItem('selectedMouvement');
                const selectedStyle = localStorage.getItem('selectedStyle');
                const selectedPersonnalité = localStorage.getItem('selectedPersonnalité');
                const prompt_brut = `Améliore ce prompt : Génère moi un tableau de ce style : ${selectedTitle} ${selectedMouvement} ${selectedStyle} ${selectedPersonnalité}.`;
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
                    selectedTitle: selectedTitle,
                    selectedMouvement: selectedMouvement,
                    selectedStyle: selectedStyle,
                    selectedPersonnalité: selectedPersonnalité
                };
            }

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body.prompt ? body : { prompt: messageText })
                });
                const data = await response.json();
                if (data.imageLink) {
                    updateTableauxJSON(data.imageLink, selectedTitle, selectedMouvement, selectedStyle, selectedPersonnalité);
                }
                saveMessageToLocalStorage(currentConversationId, 'Vous', messageText);
                if (data.choices[0].message.content) {
                    saveMessageToLocalStorage(currentConversationId, 'ArtGPT', data.choices[0].message.content);
                    addMessage('ArtGPT', data.choices[0].message.content);
                }
            } catch (error) {
                console.error('Erreur lors de l\'envoi de la requête :', error);
            }
        }
    }

    function updateTableauxJSON(imageLink, title, mouvement, style, personnalité) {
        const newTableau = {
            title: title,
            image: imageLink,
            mouvement: mouvement,
            style: style,
            personnalité: personnalité,
            auteur: 'Vous'
        };

        fetch('../json/tableaux.json')
        .then(response => response.json())
        .then(data => {
            data.push(newTableau);
            fetch('/update-tableaux', { 
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                //body: JSON.stringify(data)
                body: JSON.stringify(newTableau)
            })
            .then(response => {
                if (response.ok) {
                    console.log('Le fichier tableaux.json a été mis à jour avec succès.');
                } else {
                    console.error('Erreur lors de la mise à jour du fichier tableaux.json.');
                }
            })
            .catch(error => console.error('Erreur lors de la mise à jour du fichier tableaux.json :', error));
        })
        .catch(error => console.error('Erreur lors de la récupération du fichier tableaux.json :', error));
}

newConversationButton.addEventListener('click', () => {
    const conversationId = `conversation_${Date.now()}`;
    conversations[conversationId] = [];
    localStorage.setItem('conversations', JSON.stringify(conversations));
    const listItem = document.createElement('li');
    listItem.classList.add('conversation-item');
    listItem.id = conversationId;
    listItem.textContent = conversationId;
    listItem.addEventListener('click', () => {
        loadConversation(conversationId);
    });
    conversationsList.appendChild(listItem);
    loadConversation(conversationId);
});

// Charger la liste des conversations au démarrage
for (let conversationId in conversations) {
    const listItem = document.createElement('li');
    listItem.classList.add('conversation-item');
    listItem.id = conversationId;
    listItem.textContent = conversationId;
    listItem.addEventListener('click', () => loadConversation(conversationId));
    conversationsList.appendChild(listItem);
}

sendButton.addEventListener('click', sendMessage);
input.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
});

