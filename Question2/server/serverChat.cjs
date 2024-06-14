/*
// generate minimal server for api with express
import express from 'express';
import { API_KEY } from './config.js';
import OpenAI from "openai";
// handle form data posted
import multer from 'multer';


// create an instance of OpenAI with the api key
const openai = new OpenAI({
  apiKey: API_KEY,
});

const app = express();
const port = 3001;

// configure CORS support
// Pour accepter les connexions cross-domain (CORS)
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
  });

// init multer to handle form data
const upload = multer();

// handle post request to /chat, and use multer to get the form data
app.post('/chat', upload.none(), async (req, res) => {
    // get prompt from the form data
    const prompt = req.body.prompt;
    console.log("PROMPT: ", prompt);
    
    // send the prompt to the OpenAI API
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: [
          {
            "role": "user",
            "content": prompt
          }
        ],
        temperature: 1,
        max_tokens: 50,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      // send the response as json
        res.json(response);
});

// start server and listen to port 3001
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
*/
import express from 'express';
import { API_KEY } from './config.js';
import OpenAI from "openai";
import multer from 'multer';

const openai = new OpenAI({
  apiKey: API_KEY,
});


const app = express();
const port = 3001;

app.use(express.json()); // Middleware pour analyser le corps de la requête en JSON
app.options('*', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.send(200);
});

// Importer les modules nécessaires
const path = require('path');

// Servir les fichiers statiques depuis le dossier public
app.use(express.static(path.join(__dirname, '../client')));
// Définir la route pour servir votre index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

/*
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});
*/

const upload = multer();

app.post('/chat', upload.none(), async (req, res) => {
  const prompt = req.body.prompt;
  console.log("PROMPT: ", prompt);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        {
          "role": "user",
          "content": prompt
        }
      ],
      temperature: 1,
      max_tokens: 50,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la requête à ChatGPT :', error);
    res.status(500).json({ error: 'Erreur lors de la demande à ChatGPT' });
  }
});


const fs = require('fs');

const imagesFolderPath = path.join(__dirname, 'images');

// Ajoutez une nouvelle route pour /generateTableau
app.post('/generateTableau', upload.none(), async (req, res) => {
  const prompt = req.body.prompt;
  console.log("GENERATE TABLEAU PROMPT: ", prompt);

  try {
    // Utiliser OpenAI DALL-E pour générer une nouvelle image
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      n: 1, // nombre de variations
      size: "256x256",
    });



    // Vérifier si le dossier 'images' existe
    if (!fs.existsSync(imagesFolderPath)) {
      // S'il n'existe pas, créer le dossier
      fs.mkdirSync(imagesFolderPath);
    }
    // Sauvegarder l'image dans le dossier /images
    const imageName = `image_${Date.now()}.png`;
    const imagePath = path.join(__dirname, 'images', imageName);
    // Code pour sauvegarder l'image à l'emplacement spécifié

    // Ensuite, vous pouvez générer une carte pour cette image avec les détails de l'oeuvre
    const cardDetails = {
      title: selectedTitle, // Utilisez les détails de l'oeuvre sélectionnée
      mouvement: selectedMouvement,
      style: selectedStyle,
      personnalité: selectedPersonnalité,
      imageLink: `http://localhost:3001/images/${imageName}` // Lien de l'image générée
    };
    // Envoyer la carte générée en réponse
    res.json(cardDetails);
  } catch (error) {
    console.error('Erreur lors de la génération de l\'image :', error);
    res.status(500).json({ error: 'Erreur lors de la génération de l\'image' });
  }
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
