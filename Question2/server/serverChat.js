import express from 'express';
import { API_KEY } from './config.js';
import OpenAI from "openai";
import multer from 'multer';
import path from 'path'; // Assurez-vous d'importer 'path'
import { fileURLToPath } from 'url'; // Importer pour convertir les URLs en chemins de fichiers
import fs from 'fs'; // Importer fs avec ESM
import axios from 'axios'; // Importer Axios

// Définir __dirname en utilisant fileURLToPath et path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: API_KEY,
});


const app = express();
const port = 3001;

app.use(express.json()); // Middleware pour analyser le corps de la requête en JSON

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

const upload = multer();
// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(__dirname, '../server/images')));
app.use('/images', express.static(path.join(__dirname, 'images')));

//app.use('/images', express.static(path.join(__dirname, 'images'))); // Servir les images

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.post('/chat', upload.none(), async (req, res) => {
  debugger;
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

/*
app.put('/update-tableaux', async (req, res) => {
  debugger;
  const newTableau = req.body; // Le nouvel objet tableau à ajouter
  const filePath = path.join(__dirname, '../client/json/tableaux.json'); // Chemin vers le fichier JSON

  try {
      // Lire le fichier existant
      const fileData = fs.readFileSync(filePath, 'utf8');
      const tableaux = JSON.parse(fileData);

      // Ajouter le nouvel objet
      tableaux.push(newTableau);

      // Écrire les nouvelles données dans le fichier
      fs.writeFileSync(filePath, JSON.stringify(tableaux, null, 2));

      res.status(200).json({ message: 'Tableaux mis à jour avec succès' });
  } catch (error) {
      console.error('Erreur lors de la mise à jour de tableaux.json :', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de tableaux.json' });
  }
});
*/

app.put('/update-tableaux', async (req, res) => {
  const newTableau = req.body; // Le nouvel objet tableau à ajouter
  const filePath = path.join(__dirname, '../client/json/tableaux.json'); // Chemin vers le fichier JSON

  try {
      // Lire le fichier existant
      const fileData = fs.readFileSync(filePath, 'utf8');
      const tableaux = JSON.parse(fileData);

      // Vérifier si le contenu est bien un tableau
      if (!Array.isArray(tableaux)) {
          return res.status(500).json({ error: 'Le contenu de tableaux.json n\'est pas un tableau' });
      }

      // Ajouter le nouvel objet
      tableaux.push(newTableau);

      // Écrire les nouvelles données dans le fichier
      fs.writeFileSync(filePath, JSON.stringify(tableaux, null, 2));

      res.status(200).json({ message: 'Tableaux mis à jour avec succès' });
  } catch (error) {
      console.error('Erreur lors de la mise à jour de tableaux.json :', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de tableaux.json' });
  }
});


// Ajoutez une nouvelle route pour /generateTableau
app.post('/generateTableau', upload.none(), async (req, res) => {
  debugger;
  const { selectedTitle, selectedMouvement, selectedStyle, selectedPersonnalité, prompt2 } = req.body;
  const prompt = req.body.prompt;
  console.log("GENERATE TABLEAU PROMPT: ", prompt);
  console.log("Titre select : ", selectedTitle);
  console.log("prompt2 : ", prompt2);

  try {
    // Utiliser OpenAI DALL-E pour générer une nouvelle image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt2,
      n: 1, // nombre de variations
      //size: "256x256",
      size :"1024x1024",
      quality :"standard",
    });
    console.log("Réponse de DALL-E :", response);

    // Récupérer l'URL de l'image générée depuis la réponse de DALL-E
    const imageUrl = response.data[0].url;
    // Télécharger l'image depuis l'URL
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imagesFolderPath = path.join(__dirname, 'images');

    // Vérifier si le dossier 'images' existe
    if (!fs.existsSync(imagesFolderPath)) {
      // S'il n'existe pas, créer le dossier
      fs.mkdirSync(imagesFolderPath);
    }
    // Sauvegarder l'image dans le dossier /images
    const imageName = `image_${Date.now()}.png`;
    const imagePath = path.join(__dirname, 'images', imageName);
    fs.writeFileSync(imagePath, imageResponse.data); // Sauvegarder l'image en base64
    // Code pour sauvegarder l'image à l'emplacement spécifié

    // Ensuite, vous pouvez générer une carte pour cette image avec les détails de l'oeuvre
    const cardDetails = {
      title: "Votre peinture", // Utilisez les détails de l'oeuvre sélectionnée
      mouvement: " votre mouvement",
      style: "selectedStyle",
      personnalité: "selectedPersonnalité",
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
