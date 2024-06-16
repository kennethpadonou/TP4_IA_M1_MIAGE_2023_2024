import express from 'express';
import { API_KEY } from './config.js';
import OpenAI from 'openai';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: API_KEY,
});

const app = express();
const port = 3001;

app.use(express.json());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

const upload = multer();

app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(__dirname, '../server/images')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/audios', express.static(path.join(__dirname, 'audios')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.post('/chat', upload.none(), async (req, res) => {
  const prompt = req.body.prompt;
  console.log('PROMPT: ', prompt);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
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

app.put('/update-tableaux', async (req, res) => {
  const newTableau = req.body;
  const filePath = path.join(__dirname, '../client/json/tableaux.json');

  try {
    const fileData = fs.readFileSync(filePath, 'utf8');
    const tableaux = JSON.parse(fileData);

    if (!Array.isArray(tableaux)) {
      return res.status(500).json({ error: 'Le contenu de tableaux.json n\'est pas un tableau' });
    }

    tableaux.push(newTableau);

    fs.writeFileSync(filePath, JSON.stringify(tableaux, null, 2));

    res.status(200).json({ message: 'Tableaux mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de tableaux.json :', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de tableaux.json' });
  }
});

app.post('/generateTableau', upload.none(), async (req, res) => {
  const { selectedTitle, selectedMouvement, selectedStyle, selectedPersonnalité, prompt2 } = req.body;
  const prompt = req.body.prompt;
  console.log('GENERATE TABLEAU PROMPT: ', prompt);
  console.log('Titre select : ', selectedTitle);
  console.log('prompt2 : ', prompt2);

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt2,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });
    console.log('Réponse de DALL-E :', response);

    const imageUrl = response.data[0].url;
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imagesFolderPath = path.join(__dirname, 'images');

    if (!fs.existsSync(imagesFolderPath)) {
      fs.mkdirSync(imagesFolderPath);
    }

    const imageName = `image_${Date.now()}.png`;
    const imagePath = path.join(__dirname, 'images', imageName);
    fs.writeFileSync(imagePath, imageResponse.data);

    const cardDetails = {
      title: selectedTitle || 'Votre peinture',
      mouvement: selectedMouvement || 'votre mouvement',
      style: selectedStyle || 'votre style',
      personnalité: selectedPersonnalité || 'votre personnalité',
      auteur: 'Inconnu',
      imageLink: `http://localhost:3001/images/${imageName}`,
    };

    res.json(cardDetails);
  } catch (error) {
    console.error('Erreur lors de la génération de l\'image :', error);
    res.status(500).json({ error: 'Erreur lors de la génération de l\'image' });
  }
});

app.post('/generateSpeech', upload.none(), async (req, res) => {
  const { title, mouvement, style, personnalité, auteur, prompt_story } = req.body;
  //console.log('Données reçues pour la génération de la parole:', req.body);
  //const text = `Ce tableau a été peint en ${mouvement}, par ${auteur} il est de type ${personnalité}. Il s'agit d'une oeuvre de style ${style} intitulée ${title}.`;

  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: prompt_story,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    const speechFileName = `speech_${Date.now()}.mp3`;
    const speechFilePath = path.join(__dirname, 'audios', speechFileName);

    if (!fs.existsSync(path.join(__dirname, 'audios'))) {
      fs.mkdirSync(path.join(__dirname, 'audios'));
    }

    await fs.promises.writeFile(speechFilePath, buffer);

    res.json({ speechUrl: `http://localhost:3001/audios/${speechFileName}` });
  } catch (error) {
    console.error('Erreur lors de la génération de la parole :', error);
    res.status(500).json({ error: 'Erreur lors de la génération de la parole' });
  }
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
