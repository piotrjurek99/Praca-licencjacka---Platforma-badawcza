const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import modelu zapisu danych uczestników
const Participant = require('./models/Participant');

const app = express();

app.use(cors());
// Zwiększenie limitu dla danych JSON w celu obsługi dużych danych zrzutów ekranu
app.use(bodyParser.json({ limit: '10mb' }));

// Połączenie z MongoDB
mongoose.connect('mongodb://localhost/ai-image-experiment')
  .then(() => {
    console.log('Połączono z MongoDB');
  })
  .catch((error) => {
    console.error('Błąd połączenia z MongoDB:', error);
  });

app.use(express.static(path.join(__dirname, 'public')));

// Trasa API do zapisywania danych zrzutów ekranu
app.post('/api/participants/:id/screenshot', (req, res) => {
  const participantId = req.params.id;
  const { imageName, imageData } = req.body;
  const participantDir = path.join(__dirname, 'participants_data', participantId);

  if (!fs.existsSync(participantDir)) {
    fs.mkdirSync(participantDir, { recursive: true });
  }

  const filePath = path.join(participantDir, imageName);
  const base64Data = imageData.replace(/^data:image\/png;base64,/, "");

  fs.writeFile(filePath, base64Data, 'base64', (err) => {
    if (err) {
      console.error('Błąd zapisu zrzutu ekranu:', err);
      return res.status(500).json({ message: 'Błąd zapisu zrzutu ekranu' });
    }
    res.status(200).json({ message: 'Zrzut ekranu zapisany pomyślnie' });
  });
});

// Trasa API do zapisywania lub aktualizacji danych uczestnika
app.post('/api/participants/save', async (req, res) => {
  const participantData = req.body;
  console.log("Otrzymano dane uczestnika:", JSON.stringify(participantData, null, 2));

  if (!participantData.id || !participantData.images || !participantData.images.length) {
    console.log("Błąd walidacji: Brak ID lub obrazów.");
    return res.status(400).json({ message: 'Wymagane jest ID oraz co najmniej jeden obraz.' });
  }

  if (isNaN(participantData.yearsOfEducation)) {
    console.log("Błąd walidacji: Niepoprawna liczba lat edukacji.");
    return res.status(400).json({ message: 'Lata edukacji muszą być poprawną liczbą.' });
  }

  for (const image of participantData.images) {
    if (
      typeof image.response !== 'number' || 
      image.response < 0 || 
      image.response > 100
    ) {
      console.log("Błąd walidacji: Niepoprawna wartość odpowiedzi:", image.response);
      return res.status(400).json({ message: 'Odpowiedź musi być liczbą w zakresie od 0 do 100.' });
    }
    const validConfidenceChoices = [
      "Zdecydowanie nie jestem pewny/a",
      "Raczej nie jestem pewny/a",
      "Raczej jestem pewny/a",
      "Zdecydowanie jestem pewny/a"
    ];
    if (image.confidenceRating && !validConfidenceChoices.includes(image.confidenceRating)) {
      console.log("Błąd walidacji: Niepoprawny poziom pewności:", image.confidenceRating);
      return res.status(400).json({ message: 'Niepoprawny wybór poziomu pewności w danych obrazu.' });
    }
  }

  try {
    const result = await Participant.findOneAndUpdate(
      { id: participantData.id }, 
      participantData,
      { upsert: true, new: true }
    );
    console.log("Dane uczestnika zapisane pomyślnie:", result);
    res.status(200).json({ message: 'Dane uczestnika zapisane/zaktualizowane pomyślnie', result });
  } catch (error) {
    console.error("Błąd zapisu danych uczestnika:", error.message);
    res.status(500).json({ message: 'Błąd zapisu danych uczestnika', error: error.message });
  }
});

// Uruchomienie serwera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
