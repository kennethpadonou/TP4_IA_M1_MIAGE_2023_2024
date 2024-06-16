### ArtGPT - Galerie d'Art Virtuelle IA

*Kenneth PADONOU – Syrine ATOUI*

ArtGPT est une application innovante qui utilise l'intelligence artificielle pour enrichir l'expérience de la galerie d'art. Grâce à la technologie de OpenAI, ArtGPT permet aux utilisateurs de générer des tableaux, d’énoncer des histoires audios sur des œuvres d'art, et de discuter avec un chatbot avancé.

**Configuration Initiale**

Pour mettre en place et exécuter ArtGPT, suivez les étapes ci-dessous :

**Prérequis**

Vous aurez besoin de Node.js et npm installés sur votre machine. Assurez-vous également que vous avez accès à une clé API valide de OpenAI.

**Installation**

Ouvrez votre terminal, naviguez vers le dossier du serveur et configurez votre clé API OpenAI:

cd TP4\_IA\_M1\_MIAGE\_2023\_2024/Question2/server/

export OPENAI\_API\_KEY="clé API"

npm i

**Démarrage du Serveur**

Lancez ensuite le serveur :

node serverChat.js

**Fonctionnalités**

**Génération d'Images avec DALL-E**

- **/generateTableau**: Pour générer un tableau, sélectionnez une œuvre puis envoyez la commande /generateTableau dans le chat du chatbot. Patientez avant de rafraîchir la page car des requêtes sont envoyées à GPT pour générer l'image.

**Discussion avec le Chatbot**

- Entrez vos questions ou commentaires directement via l'interface du chatbot pour interagir avec ArtGPT.

**Histoire Audio des Œuvres**

- **/speech**: Après avoir sélectionné un tableau, envoyez la commande /speech pour écouter une histoire audio de l'œuvre sélectionnée.

**Gestion des Conversations**

- Si le bouton d'envoi ne réagit pas, assurez-vous d'appuyer sur une conversation existante ou de créer une nouvelle via le bouton "Nouvelle Conversation".

**Support**

Pour toute assistance supplémentaire ou pour signaler des problèmes, veuillez consulter la section issues de notre dépôt GitHub ou contactez notre support technique.

