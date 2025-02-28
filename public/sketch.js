// sketch.js

let currentPage = 0;
let currentImageIndex = 0; // Śledzi indeks aktualnego obrazu (od 0 do 27 dla 28 obrazów)
const totalImages = 28;
const gridSize = 20;
let participant = {
  id: '',
  gender: '',
  age: null,
  occupation: '',
  education: '',
  images: [] // Tablica do przechowywania odpowiedzi dla każdego obrazu, w tym czasu i zrzutów ekranu
};

let selectedImage = '';
let selectedSections = []; // Lista do przechowywania zaznaczeń siatki
let imageWidth = 0;
let imageHeight = 0;
let isMouseDown = false; // Śledzi stan myszy do kliknięcia i przeciągnięcia
let pageStartTime = 0; // Śledzi czas rozpoczęcia każdej strony


function setup() {
  noCanvas();
  showPage(currentPage);
}


function showPage(page) {
  if (pageStartTime) stopTimer(); // Zatrzymuje licznik czasu dla poprzedniej strony
  const appDiv = select('#app');
  appDiv.html(''); // Czyści poprzednią zawartość

  if (page >= 2 && page <= 16) {
    // PPD - kwestionariusz (Strony 2–16)
    createNfcQuestionPage(appDiv, page - 2); // Wyświetla pytania PPD (1 pytanie na stronę)
  } else {
    switch (page) {
      case 0: createInstructionPage(appDiv); break; // Wprowadzenie
      case 1: createFormPage(appDiv); break; // Formularz rejestracyjny
      case 17: loadImageChoicePage(appDiv); break; // Prezentacja obrazu
      case 18: createConfidencePage(appDiv); break; // Strona oceny pewności
      case 19: createGridSelectionPage(appDiv); break; // Strona wyboru siatki (1–100%)
      case 20: createDebriefPage(appDiv); break; // Podsumowanie
      case 21: createClosePage(appDiv); break; // Koniec Eksperymentu
      default: createDebriefPage(appDiv);
    }
  }

  window.requestAnimationFrame(() => {
    pageStartTime = Date.now(); // Rozpoczyna licznik czasu dla nowej strony
    console.log("Licznik czasu rozpoczęty dla strony", page);
  });
}


function createFormPage(parent) {
  parent.html(`
    <h1>Formularz Rejestracyjny</h1>
    <form id="registrationForm">
      <div class="form-group">
        <label for="id">ID:</label>
        <input type="text" id="id" required>
        <small>Identyfikator podany przez prowadzącego badanie</small>
      </div>

      <div class="form-group">
        <label for="gender">Płeć:</label>
        <select id="gender" required>
          <option value="" selected disabled hidden>Wybierz</option>
          <option value="kobieta">Kobieta</option>
          <option value="mężczyzna">Mężczyzna</option>
          <option value="inne">Inne</option>
        </select>
      </div>

      <div class="form-group">
        <label for="age">Wiek:</label>
        <input type="number" id="age" min="0" required>
      </div>

      <div class="form-group">
        <label for="education">Poziom wykształcenia:</label>
        <select id="education" required>
          <option value="" selected disabled hidden>Wybierz</option>
          <option value="podstawowe">Podstawowe</option>
          <option value="średnie">Średnie</option>
          <option value="wyższe">Wyższe</option>
        </select>
      </div>

      <div class="form-group">
        <label for="educationYears">Liczba lat formalnej edukacji:</label>
        <input type="number" id="educationYears" min="0" required>
        <small>Tylko etapy kończące się formalnym świadectwem: podstawowe, średnie, wyższe: np 8 lat szkoły podstawowej + 4 lata liceum = 12 lat</small>
      </div>

      <button type="button" onclick="submitForm()" class="large-button">Dalej</button>
    </form>
  `);
}


function submitForm() {
  participant.id = select('#id').value().trim();
  participant.gender = select('#gender').value().trim();
  participant.age = parseInt(select('#age').value());
  participant.education = select('#education').value().trim();
  participant.yearsOfEducation = parseInt(select('#educationYears').value());

  if (!participant.id || !participant.gender || isNaN(participant.age) || !participant.education || isNaN(participant.yearsOfEducation)) {
    alert('Proszę wypełnić wszystkie pola.');
    return;
  }

  participant.images = [];
  currentPage++;
  showPage(currentPage);
}


function createInstructionPage(parent) {
  parent.html(`
    <h1>Instrukcja dla uczestników badania</h1>
    <h2 style="font-size: 1.6em; text-align: center; margin-bottom: 20px;">
      Analiza percepcji obrazów rozbudowanych za pomocą sztucznej inteligencji (SI)
    </h2>
    <p>
      Nazywam się Piotr Jurek i jestem studentem kierunku Psychologia i Informatyka na Uniwersytecie SWPS w Warszawie. 
      W ramach pracy licencjackiej realizuję pod kierunkiem dr Klary Rydzewskiej badanie dotyczące percepcji obrazów 
      rozbudowywanych z wykorzystaniem SI. Poniżej znajdziesz szczegółową instrukcję na temat badania. 
      Przed rozpoczęciem proszę o dokładne zapoznanie się ze wszystkimi informacjami.
    </p>
    <h3 style="font-size: 1.2em; margin-top: 20px;">Cel i opis badania</h3>
    <p>
      W ostatnich latach widzimy gwałtowny wzrost zastosowań SI w procesie generacji nowej treści. Postępujący rozwój SI ma znaczący wpływ na sposób w jaki postrzegamy otaczającą nas rzeczywistość.
      Niniejsze badanie ma na celu określenie, w jaki sposób ludzkie postrzeganie obrazu zmienia się w zależności 
      od wpływu SI. Jednocześnie kluczowym zagadnieniem eskperymentu jest analiza które obserwowane elementy na samym obrazie wpływają 
      na podejmowanie decyzji o przypisywaniu im ingerencji SI.
    </p>
    <p>
    <ul style="margin-left: 20px; list-style-type: disc;">
      <strong>Podczas badania zostaniesz poproszony/a o odniesienie się do 15 stwierdzeń skali działania w różnych sytuacjach, a następnie analizę 28 fotografii znanych obiektów widokowych i zabytków w formie sekwencyjnych slajdów.
      Każda z nich zostanie indywidualnie zaprezentowana na ekranie, a Twoim zadaniem będzie wykonanie następujących kroków:</strong>
    </ul>  
    </p>
    <ul style="list-style-type: disc; text-align: center; margin: 0 auto; padding: 0; max-width: 1250px;">
      <li style="margin-bottom: 10px; text-align: left;">
        <strong>Określenie czy dany obraz wykorzystuje/nie wykorzystuje SI, a jeżeli wykorzystuje to w jakim stopniu:</strong> Po wyświetleniu fotografii poprosimy Cię o podanie oceny na interaktywnej skali od 0% do 100% wskazującej w jakim stopniu, Twoim zdaniem, na obrazie nastąpiła modyfikacja z użyciem SI. Po wybraniu wyniku na skali wciśnij przycisk “Potwierdź wybór” aby przejść do następnego etapu.
      </li>
      <li style="margin-bottom: 10px; text-align: left;">
        <strong>[W przypadku zaznaczenia wyniku od 1% do 100%] Wskazanie które obszary Twoim zdaniem zostały zmodyfikowane przez SI:</strong> Po wybraniu dowolnej oceny od 1 do 100 procent, zobaczysz ten sam obraz na który zostanie nałożona siatka kwadratów. Korzystając z tej siatki, należy zaznaczyć miejsca na fotografii, które Twoim zdaniem zostały zmodyfikowane przez SI. Po wybraniu dowolnej liczby obszarów, wciśnij przycisk "Potwierdź wybór" aby kontynuuować. W celu przejścia do kolejnego etapu należy wybrać przynajmniej 1 obszar siatki. Jeśli na poprzednim slajdzie Twoja ocena wyniosła 0% zostaniesz przekierowany bezpośrednio do kolejnego etapu.
      </li>
      <li style="margin-bottom: 15px; text-align: left;">
        <strong>Ocena pewności decyzji:</strong> Na tym etapie poprosimy Cię o ocenę pewności Twojej odpowiedzi dotyczącej tego czy dany obraz wykorzystuje/nie wykorzystuje SI korzystając z czterostopniowej skali.
      </li>
    </ul>
    <p style="margin-top: 20px;">
      Po prezentacji wszystkich 28 obrazów, zostaniesz poinformowany o zakończeniu badania. 
      Całość zajmie około 30 minut. <strong> Dokładnie zapoznaj się z każdym obrazem oraz dobrze zastanów się przed podaniem ostatecznej decyzji. </strong>
    </p>
    <p>
      Udzielone przez Ciebie odpowiedzi są anonimowe i będą wykorzystywane wyłącznie do celów naukowych. W dowolnym momencie masz prawo zrezygnować z udziału w badaniu i nie wiąże się to z żadnymi konsekwencjami.
    </p>
    <button onclick="nextPage()" class="large-button"><strong>Wyrażam zgodę na udział w badaniu i przechodzę dalej ➡️</strong></button>
  `);
}


function nextPage() {
  currentPage++;
  showPage(currentPage);
}


function createNfcQuestionPage(parent, questionIndex) {
  const questions = [
    "Zwykle biorę pod uwagę różne opinie na temat danego zjawiska, nawet wówczas, gdy mam już wyrobiony pogląd.",
    "Unikam niejasnych sytuacji.",
    "Myślę, że dobrze uporządkowane życie jest zgodne z moim temperamentem.",
    "Czuję się źle, kiedy nie rozumiem powodów, dla których pewne sytuacje zdarzają się w moim życiu.",
    "Unikam brania udziału w wydarzeniach, nie wiedząc czego mogę się po nich spodziewać.",
    "Zwykle podejmuję ważne decyzje szybko i pewnie.",
    "Mógłbym opisać siebie jako osobę niezdecydowaną. ",
    "Podejmując większość ważnych decyzji borykam się z mnóstwem sprzeczności.",
    "Przyglądając się większości sytuacji konfliktowych potrafię zwykle dostrzec racje obu stron.",
    "Unikam przebywania wśród ludzi, którzy są zdolni do nieoczekiwanych działań.",
    "Dopiero ustalenie spójnych reguł umożliwia mi cieszenie się życiem.",
    "Cenię sobie zorganizowany styl życia.",
    "Czuję dyskomfort, gdy czyjeś czyny lub intencje są dla mnie niejasne.",
    "Zwykle dostrzegam wiele możliwych rozwiązań problemu, przed którym stoję.",
    "Unikam sytuacji, których konsekwencji nie da się przewidzieć.",
  ];

  parent.html(`
    <div id="nfc-question-container" style="max-width: 1500px; padding: 10px; margin: 0 auto;">
      <!-- Instruction -->
      <div id="nfc-instructions" style="
        font-size: 15px; 
        line-height: 1.4; 
        text-align: justify; 
        margin-bottom: 15px; 
        padding: 15px; 
        background-color: #f9f9f9; 
        border: 1px solid #ddd; 
        border-radius: 8px; 
        display: flex; 
        flex-direction: column; 
        justify-content: center; 
        height: auto;
      ">
        <p style="margin: 0; text-align: center;">
        Uważnie przeczytaj poniższe stwierdzenie. Zaznacz jedną z sześciu odpowiedzi, która najlepiej wyraża Twoją opinię.
        </p>
      </div>

      <!-- Question -->
      <br></br>
      <h1 style="font-size: 28px; color: #007BFF; text-align: center; margin-bottom: 25px;">${questions[questionIndex]}</h1>

      <!-- Options -->
      <div style="display: flex; flex-direction: column; gap: 15px; width: 100%; max-width: 600px; margin: 0 auto;">
        ${[1, 2, 3, 4, 5, 6].map(value => `
          <label style="
            display: flex; 
            align-items: center; 
            gap: 15px; 
            padding: 12px 16px; 
            border: 1px solid #ddd; 
            border-radius: 8px; 
            cursor: pointer; 
            background-color: #f9f9f9;
            font-size: 18px;
            transition: background-color 0.2s, border-color 0.2s;
          " 
          onmouseover="this.style.backgroundColor='#e9f4ff'; this.style.borderColor='#007BFF';"
          onmouseout="this.style.backgroundColor='#f9f9f9'; this.style.borderColor='#ddd';">
            <input type="radio" name="nfc-answer" value="${value}" style="margin-right: 10px;" />
            <span style="color: #555;">
              ${value} - ${
                value === 1 ? "zdecydowanie się nie zgadzam" :
                value === 2 ? "nie zgadzam się" :
                value === 3 ? "raczej się nie zgadzam" :
                value === 4 ? "raczej się zgadzam" :
                value === 5 ? "zgadzam się" : "całkowicie się zgadzam"
              }
            </span>
          </label>
        `).join('')}
      </div>

      <!-- Button -->
      <button 
        onclick="submitNfcAnswer(${questionIndex})" 
        style="
          margin-top: 20px; 
          padding: 15px 30px; 
          font-size: 18px; 
          font-weight: bold; 
          color: white; 
          background-color: #007BFF; 
          border: none; 
          border-radius: 5px; 
          cursor: pointer; 
          transition: background-color 0.3s;
        "
        onmouseover="this.style.backgroundColor='#0056b3';"
        onmouseout="this.style.backgroundColor='#007BFF';">
        Dalej
      </button>
    </div>
  `);
}


function submitNfcAnswer(questionIndex) {
  const selectedAnswer = document.querySelector('input[name="nfc-answer"]:checked');
  if (!selectedAnswer) {
    alert("Proszę wybrać odpowiedź, aby kontynuować.");
    return;
  }

  // Zapisywanie odpowiedzi PPD
  participant.nfcAnswers = participant.nfcAnswers || [];
  participant.nfcAnswers[questionIndex] = parseInt(selectedAnswer.value);

  console.log(`NFC answer for question ${questionIndex + 1}:`, selectedAnswer.value);

  if (questionIndex < 14) {
    currentPage = 2 + questionIndex + 1; 
  } else {
    currentPage = 17;
    currentImageIndex = 0;
  }

  showPage(currentPage);
}


let hasViewedFullscreen = false; // Śledzi, czy bieżący obraz został wyświetlony na pełnym ekranie

function loadImageChoicePage(parent) {
  selectedImage = `images/image_${currentImageIndex + 1}.jpg`;

  hasViewedFullscreen = false;

  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.overflow = "hidden";

  parent.html(`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; 
                height: 100vh; width: 100vw; margin: 0; padding: 0; box-sizing: border-box; gap: 1.5vmin;">

      <!-- Header -->
      <h1 style="font-size: 2.5vmin; text-align: center; color: #007BFF; margin: 0;">
        Ocena Obrazu
      </h1>

      <!-- Instructions -->
      <p style="font-size: 1.8vmin; text-align: center; color: #555; width: 90%; margin: 0;">
        Zdecyduj w jakim stopniu Twoim zdaniem obraz został zmodyfikowany przez sztuczną inteligencję.<br>
        <strong>Kliknij na obraz, aby powiększyć go do pełnego ekranu przed przejściem dalej.</strong><br>
        Przesuń suwak, aby wybrać wartość od 0% (brak modyfikacji) do 100% (w pełni wygenerowany przez SI), a następnie zatwierdź swoją odpowiedź klikając w przycisk "Potwierdź wybór".
      </p>

      <!-- Image Container -->
      <div id="image-container" style="width: 60vmin; height: 60vmin; margin: 1vmin;">
        <img 
          id="toggle-image" 
          src="${selectedImage}" 
          alt="Obraz do oceny" 
          style="width: 100%; height: 100%; object-fit: contain; cursor: pointer;"
          onclick="toggleImageFullscreen(this)"
        >
      </div>

      <!-- Slider -->
      <input 
        type="range" 
        id="ai-slider" 
        min="0" 
        max="100" 
        step="1" 
        value="0" 
        style="width: 60vmin; height: 2vmin; margin: 1.5vmin; cursor: pointer;"
        oninput="updateSliderValue(this.value);"
      />

      <!-- Slider Value -->
      <p id="slider-value" style="font-size: 2vmin; font-weight: bold; margin: 0;">
        Wartość: 0%
      </p>

      <!-- Confirmation Button -->
      <button 
        id="confirm-button" 
        onclick="confirmSliderChoice()" 
        style="padding: 1.5vmin 2.5vmin; font-size: 2vmin; background-color: #007BFF; color: white; 
               border: none; border-radius: 0.5vmin; cursor: pointer; transition: background-color 0.3s ease;">
        Potwierdź wybór
      </button>
    </div>
  `);

  // Wyświetlanie wartości na suwaku
  const slider = document.getElementById("ai-slider");
  const sliderValue = document.getElementById("slider-value");

  slider.addEventListener("input", function () {
    sliderValue.textContent = `Wartość: ${this.value}%`;
  });
}

function toggleImageFullscreen(imageElement) {
  if (!document.fullscreenElement) {
    imageElement.requestFullscreen()
      .then(() => {
        hasViewedFullscreen = true;
        console.log("Image viewed in fullscreen");
      })
      .catch(err => {
        console.error(`Błąd podczas próby włączenia pełnego ekranu: ${err.message}`);
      });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

function confirmSliderChoice() {
  // Ostrzega, jeśli obraz nie został wyświetlony na pełnym ekranie
  if (!hasViewedFullscreen) {
    alert("Proszę otworzyć obraz na pełnym ekranie przed zatwierdzeniem wyboru.");
    return;
  }

  const slider = document.getElementById("ai-slider");
  const sliderValue = parseInt(slider.value);

  // Zapisuje wartość suwaka i nazwę obrazu do danych uczestnika
  participant.images[currentImageIndex] = participant.images[currentImageIndex] || {};
  participant.images[currentImageIndex].response = sliderValue;
  participant.images[currentImageIndex].imageName = `image_${currentImageIndex + 1}.jpg`; 

  stopTimer();

  if (sliderValue === 0) {
    currentPage = 18; // Strona pewności odpowiedzi jeśli wartość suwaka = 0%
  } else {
    currentPage = 19; // Strona wyboru siatki jeśli wartość suwaka < 0 
  }

  showPage(currentPage);
}


function recordChoice(choice) {
  console.log("Recording choice for image index:", currentImageIndex);

  participant.images[currentImageIndex] = {
    imageName: `image${currentImageIndex + 1}.jpg`,
    response: choice,
    gridSelection: [],
    confidenceRating: null,
    timeSpent: {}
  };

  console.log("Updated participant.images:", participant.images);

  stopTimer();
  currentPage = 3; 
  showPage(currentPage);
}


function createGridSelectionPage(parent) {
  selectedSections = [];

  parent.html(`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; 
                max-width: 1200px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">

      <h1 style="font-size: 2.5vmin; color: #007BFF; text-align: center; margin-bottom: 20px;">
        Wybór Obszaru
      </h1>

      <p style="font-size: 2vmin; text-align: center; color: #555; width: 80%; margin-bottom: 20px;">
        Wybierz obszary które Twoim zdaniem zostały wygenerowane przez SI, klikając na poszczególne kwadraty. 
        Następnie zapisz swoją odpowiedź klikając w przycisk <strong>"Potwierdź wybór"</strong>.
      </p>

      <!-- Grid Container -->
      <div id="grid-container" style="position: relative; width: 80vw; max-width: 600px; height: auto; margin-bottom: 20px;"></div>

      <!-- Confirmation Button -->
      <button 
        onclick="confirmSelections()" 
        style="padding: 1.5vmin 2.5vmin; font-size: 2vmin; background-color: #007BFF; color: white; 
               border: none; border-radius: 0.5vmin; cursor: pointer; font-weight: bold; transition: background-color 0.3s ease;">
        Potwierdź wybór
      </button>
    </div>
  `);

  createGrid(selectedImage); 
}


function createGrid(imageUrl) {
  const gridContainer = select('#grid-container');
  gridContainer.html(''); 
  gridContainer.style('background-image', `url(${imageUrl})`);
  gridContainer.style('background-size', 'cover');
  gridContainer.style('display', 'grid');
  
  const cellSize = Math.floor(gridContainer.width / gridSize); 

  gridContainer.style('grid-template-columns', `repeat(${gridSize}, ${cellSize}px)`);
  gridContainer.style('grid-template-rows', `repeat(${gridSize}, ${cellSize}px)`);
  gridContainer.style('width', `${cellSize * gridSize}px`);
  gridContainer.style('height', `${cellSize * gridSize}px`);

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = createDiv('');
      cell.class('grid-cell');
      cell.style('width', `${cellSize}px`);
      cell.style('height', `${cellSize}px`);
      cell.style('border', '1px solid rgba(255, 255, 255, 0.5)'); 
      cell.attribute('data-row', row);
      cell.attribute('data-col', col);
      cell.mousePressed(() => toggleCellSelection(cell));
      cell.mouseOver(() => {
        if (isMouseDown) toggleCellSelection(cell);
      });

      gridContainer.child(cell);
    }
  }

  gridContainer.mousePressed(() => (isMouseDown = true));
  gridContainer.mouseReleased(() => (isMouseDown = false));
}


function toggleCellSelection(cell) {
  const section = `${cell.attribute('data-row')}-${cell.attribute('data-col')}`;

  if (selectedSections.includes(section)) {
    selectedSections = selectedSections.filter(s => s !== section);
    cell.removeClass('selected');
  } else {
    selectedSections.push(section);
    cell.addClass('selected');
  }

  console.log("Current grid selection:", selectedSections);
}


function confirmSelections() {
  if (selectedSections.length === 0) {
    alert("Proszę wybrać przynajmniej jeden obszar.");
    return;
  }

  console.log("Grid selections for current image:", selectedSections);

  // Zapisywanie oznaczeń siatki bieżącego obrazu
  participant.images[currentImageIndex].gridSelection = [...selectedSections];

  stopTimer();

  saveGridScreenshot();
}


function saveGridScreenshot() {
  html2canvas(document.querySelector("#grid-container")).then(canvas => {
    const imageData = canvas.toDataURL("image/png");
    fetch(`/api/participants/${participant.id}/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageName: `image${currentImageIndex + 1}_screenshot.png`,
        imageData: imageData,
      }),
    })
      .then(response => response.json())
      .then(() => {
        currentPage = 18;
        showPage(currentPage);
      })
      .catch(error => {
        console.error("Błąd zapisywania zrzutu ekranu:", error);
        currentPage = 18;
        showPage(currentPage);
      });
  });
}


function createConfidencePage(parent) {
  parent.html(`
    <div id="confidence-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 1200px; padding: 60px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);">
      <h1 style="margin-bottom: 20px; color: #007BFF; text-align: center; font-size: 28px;">Ocena Pewności</h1>
      <p style="margin-bottom: 40px; font-size: 20px; color: #333; text-align: center;">Na ile pewny/a jesteś swojej odpowiedzi co do stopnia ingerencji SI we wcześniej prezentowanym obrazie?</p>
      <div id="confidence-options-container" style="display: flex; gap: 30px; justify-content: center; align-items: center; width: 100%; height: 100px;">
        <label class="confidence-option" style="font-size: 18px; color: #333; text-align: center; background: #f0f2f5; padding: 20px; border-radius: 10px; cursor: pointer; transition: background 0.3s, transform 0.2s; flex: 1; max-width: 200px; height: 100%; display: flex; align-items: center; justify-content: center;">
          <input type="radio" name="confidence" value="Zdecydowanie nie jestem pewny/a" style="display: none;" />
          Zdecydowanie nie jestem pewny/a
        </label>
        <label class="confidence-option" style="font-size: 18px; color: #333; text-align: center; background: #f0f2f5; padding: 20px; border-radius: 10px; cursor: pointer; transition: background 0.3s, transform 0.2s; flex: 1; max-width: 200px; height: 100%; display: flex; align-items: center; justify-content: center;">
          <input type="radio" name="confidence" value="Raczej nie jestem pewny/a" style="display: none;" />
          Raczej nie jestem pewny/a
        </label>
        <label class="confidence-option" style="font-size: 18px; color: #333; text-align: center; background: #f0f2f5; padding: 20px; border-radius: 10px; cursor: pointer; transition: background 0.3s, transform 0.2s; flex: 1; max-width: 200px; height: 100%; display: flex; align-items: center; justify-content: center;">
          <input type="radio" name="confidence" value="Raczej jestem pewny/a" style="display: none;" />
          Raczej jestem pewny/a
        </label>
        <label class="confidence-option" style="font-size: 18px; color: #333; text-align: center; background: #f0f2f5; padding: 20px; border-radius: 10px; cursor: pointer; transition: background 0.3s, transform 0.2s; flex: 1; max-width: 200px; height: 100%; display: flex; align-items: center; justify-content: center;">
          <input type="radio" name="confidence" value="Zdecydowanie jestem pewny/a" style="display: none;" />
          Zdecydowanie jestem pewny/a
        </label>
      </div>
      <button onclick="submitConfidence()" class="large-button" style="margin-top: 40px;">Kontynuuj</button>
    </div>
  `);

  const options = document.querySelectorAll('.confidence-option');
  options.forEach(option => {
    option.addEventListener('click', () => {
      const input = option.querySelector('input');
      if (input) {
        input.checked = true;
      }
      options.forEach(opt => {
        opt.style.background = '#f0f2f5';
        opt.style.border = 'none';
      });
      option.style.background = '#cce7ff';
      option.style.border = '2px solid #007BFF';
    });
  });  
}


function submitConfidence() {
  const selectedConfidence = document.querySelector('input[name="confidence"]:checked');

  if (!selectedConfidence) {
    alert('Proszę wybrać jedną z opcji, aby kontynuować.');
    return;
  }

  // Zapisz pewność odpowiedzi dla bieżącego obrazu
  participant.images[currentImageIndex].confidenceRating = selectedConfidence.value;
  console.log("Confidence rating updated:", participant.images[currentImageIndex]);

  stopTimer();

  if (currentImageIndex < totalImages - 1) {
    currentImageIndex++;
    currentPage = 17;
  } else {
    currentPage = 20;
  }

  showPage(currentPage);
}


function stopTimer() {
  if (!pageStartTime) return;

  const timeSpentMs = Date.now() - pageStartTime;
  const timeSpentSeconds = (timeSpentMs / 1000).toFixed(2); // Konwertuje na sekundy z dokładnością do dwóch miejsc po przecinku

  // Upewnia się, że wpis dla bieżącego obrazu istnieje
  participant.images[currentImageIndex] = participant.images[currentImageIndex] || {};
  participant.images[currentImageIndex].timeSpent = participant.images[currentImageIndex].timeSpent || {};

  if (currentPage === 17) {
    participant.images[currentImageIndex].timeSpent["Ocena Obrazu"] = parseFloat(timeSpentSeconds);
  } else if (currentPage === 18) {
    participant.images[currentImageIndex].timeSpent["Ocena Pewności"] = parseFloat(timeSpentSeconds);
  } else if (currentPage === 19) {
    participant.images[currentImageIndex].timeSpent["Wybór Obszaru"] = parseFloat(timeSpentSeconds);
  }

  console.log(`Timer stopped for page ${currentPage}: ${timeSpentSeconds} seconds`);

  pageStartTime = null;
}


function createDebriefPage(parent) {
  parent.html(`
    <h1>Podsumowanie</h1>
    <h3>To już koniec badania! W celu zapisania wyników wciśnij przycisk - Zakończ.</h3>
    <p></p>
    <button onclick="finish()">Zakończ</button>
  `);
}


function createClosePage(parent) {
  parent.html(`
    <h1>Koniec eksperymentu</h1>
    <h3>Wszystkie Twoje wyniki zostały zapisane. Bardzo dziękuję za udział w moim badaniu. Proszę zamknij kartę przeglądarki.</h3>
    <p></p>
  `);
}


function finish() {
  console.log("Ostateczne dane uczestnika:", JSON.stringify(participant, null, 2));

  fetch('/api/participants/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(participant)
  })
    .then(response => response.json())
    .then(data => {
      console.log("Odpowiedź serwera:", data);
      alert("Dane zostały zapisane pomyślnie.");
      showPage(21); // Zakończenie eksperymentu
    })
    .catch(error => {
      console.error("Błąd podczas wysyłania danych uczestnika:", error);
      alert("Błąd podczas zapisywania danych. Spróbuj ponownie.");
    });
}
