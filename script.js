/* ========= CONFIG ========= */
const totalTimePerQuestion = 20; // seconds — altera aqui quando quiseres
const feedbackDelay = 2500; // tempo (ms) para mostrar feedback antes de próxima pergunta
const feedbackVisibleTime = 2500; // quanto tempo o popup fica visível (ms)
const emailPopupTimeout = 60000; // 1 minuto para voltar ao home se não houver interação

/* ========= STATE ========= */
let currentQuestion = 0;
let score = 0;
let totalTime = 0;
let correctAnswers = 0;
let questionStartTs = 0;
let timeoutIdForAutoAdvance = null;
let colorChangeTimeouts = [];
let emailPopupIdleTimeout = null;

/* ========= STOCK ========= */
const stockCars = [
  { name: "Custom Car - Order Yours!", img: "images/custom-car.png" },
  { name: "BMW 3.0 CSL", img: "images/3.0CSL.png" },
  { name: "Ferrari 296 GT3", img: "images/296GT3.png" },
  /*{ name: "Mercedes-Benz 300 SL", img: "images/300SL.png" },*/
  { name: "Porsche 934", img: "images/934.png" },
  { name: "Formula 1", img: "images/F1.png" },
  { name: "Ferrari F40", img: "images/F40.png" },
  { name: "Porsche GT3 RS", img: "images/GT3RS.png" },
  { name: "Ford GT40", img: "images/GT40.png" },
  { name: "BMW M1 Procar", img: "images/M1.png" },
  { name: "De Tomaso Pantera", img: "images/Pantera.png" },
  { name: "Nissan R34 GT-R", img: "images/R34.png" },
  { name: "Toyota Supra", img: "images/Supra.png" },
  { name: "Alfa Romeo TZ2", img: "images/TZ2.png" },
  /*{ name: "Dodge Viper", img: "images/Viper.png" },*/
  { name: "Porsche 911", img: "images/911.png" },
];
/* ========= LANGUAGE ========= */
let currentLanguage = "pt"; // default

const messages = {
  pt: {
    noCorrect: "Obrigado por participar! Vais conseguir melhor da próxima 😄",
    score: (correct, total) => `Acertaste ${correct} de ${total} perguntas!`,
    fillNameEmail: "Preencha nome e email!",
    timeout: "Ficaste sem tempo!",
    points: "+{points} pontos",
    timeSpent: "Demoraste {time}s",
  },
  en: {
    noCorrect: "Thanks for playing! You'll do better next time 😄",
    score: (correct, total) =>
      `You got ${correct} out of ${total} questions right!`,
    fillNameEmail: "Please fill name and email!",
    timeout: "Time's up!",
    points: "+{points} points",
    timeSpent: "You spent {time}s",
  },
};

/* ========= QUESTIONS ========= */
const questionsPT = [
  {
    img: "images/GT40.png",
    question:
      "O Ford GT40 foi criado com o objetivo de derrotar que marca nas 24h de Le Mans?",
    options: ["Ferrari", "Porsche", "McLaren", "Jaguar"],
    answer: 0,
  },
  {
    img: "images/R34.png",
    question: "O Nissan R34 GT-R ficou muito famoso em que coleção de filmes?",
    options: [
      "Transformers",
      "Need for Speed",
      "Velocidade Furiosa (Fast & Furious)",
      "James Bond",
    ],
    answer: 2,
  },
  {
    img: "images/300SL.png",
    question:
      "Qual a *feature* de design mais reconhecível no Mercedes-Benz 300 SL de 1954?",
    options: [
      "Motor central V12",
      "Pneus de faixa branca",
      "Teto rígido amovível",
      "Portas asa de gaivota",
    ],
    answer: 3,
  },
  {
    img: "images/F1.png",
    question: "Quantas vezes veio a Fórmula 1 a Portimão?",
    options: ["1", "2", "3", "4"],
    answer: 1,
  },
  {
    img: "images/F40.png",
    question: "Em que década foi lançado o Ferrari F40?",
    options: ["70's", "80's", "90's", "00's"],
    answer: 1,
  },
  {
    img: "images/Supra.png",
    question: "Em que país foi fabricado o Toyota Supra original?",
    options: ["EUA", "Alemanha", "Japão", "Coreia do Sul"],
    answer: 2,
  },
];

const questionsEN = [
  {
    img: "images/GT40.png",
    question:
      "The Ford GT40 was created to beat which brand in the 24 Hours of Le Mans?",
    options: ["Ferrari", "Porsche", "McLaren", "Jaguar"],
    answer: 0,
  },
  {
    img: "images/R34.png",
    question: "The Nissan R34 GT-R became famous in which movie series?",
    options: ["Transformers", "Need for Speed", "Fast & Furious", "James Bond"],
    answer: 2,
  },
  {
    img: "images/300SL.png",
    question:
      "What's the most recognizable design feature of the 1954 Mercedes-Benz 300 SL?",
    options: [
      "V12 mid-engine",
      "Whitewall tires",
      "Removable hardtop",
      "Gullwing doors",
    ],
    answer: 3,
  },
  {
    img: "images/F1.png",
    question: "How many times has Formula 1 visited Portimão?",
    options: ["1", "2", "3", "4"],
    answer: 1,
  },
  {
    img: "images/F40.png",
    question: "In which decade was the Ferrari F40 launched?",
    options: ["70's", "80's", "90's", "00's"],
    answer: 1,
  },
  {
    img: "images/Supra.png",
    question: "Which country originally manufactured the Toyota Supra?",
    options: ["USA", "Germany", "Japan", "South Korea"],
    answer: 2,
  },
];

/* ========= DOM ========= */
const homeScreen = document.getElementById("home-screen");
const quizScreen = document.getElementById("quiz-screen");
const stockScreen = document.getElementById("stock-screen");
const emailPopup = document.getElementById("email-popup");
const leaderboardScreen = document.getElementById("leaderboard-screen");

const questionImg = document.getElementById("question-img");
const questionText = document.getElementById("question-text");
const optionsGrid = document.getElementById("options-grid");
const timerFill = document.getElementById("timer-fill");
const questionContainer = document.getElementById("question-container");

const playerNameInput = document.getElementById("player-name");
const playerEmailInput = document.getElementById("player-email");
const leaderboardList = document.getElementById("leaderboard-list");
const resultMessage = document.getElementById("result-message");

const stockGrid = document.getElementById("stock-grid");
const backHome = document.getElementById("back-home");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const modalCaption = document.getElementById("modal-caption");
const closeModal = document.getElementById("close-modal");

const feedbackLayer = document.getElementById("feedback-layer");

const langPT = document.getElementById("lang-pt");
const langEN = document.getElementById("lang-en");

/* ========= EVENTS ========= */
document.getElementById("start-btn").addEventListener("click", startQuiz);
document.getElementById("stock-btn").addEventListener("click", showStock);
backHome.addEventListener("click", () => showScreen(homeScreen));
closeModal.addEventListener("click", () => (modal.style.display = "none"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});
document.getElementById("submit-email").addEventListener("click", submitEmail);
document.getElementById("export-btn").addEventListener("click", exportCSV);
document
  .getElementById("restart-btn")
  .addEventListener("click", () => location.reload());

langPT.addEventListener("click", () => setLanguage("pt"));
langEN.addEventListener("click", () => setLanguage("en"));

/* ========= UTIL ========= */
function showScreen(screen) {
  [homeScreen, quizScreen, stockScreen, emailPopup, leaderboardScreen].forEach(
    (s) => s.classList.remove("active")
  );
  screen.classList.add("active");

  if (screen === emailPopup) {
    startEmailPopupIdleTimer();
  } else {
    clearEmailPopupIdleTimer();
  }
}

function setLanguage(lang) {
  currentLanguage = lang;
  if (lang === "pt") {
    langPT.classList.add("active");
    langEN.classList.remove("active");
  } else {
    langEN.classList.add("active");
    langPT.classList.remove("active");
  }
}

/* ========= STOCK UI ========= */
function showStock() {
  stockGrid.innerHTML = "";
  stockCars.forEach((car) => {
    const card = document.createElement("div");
    card.className = "stock-card";
    card.innerHTML = `<img src="${car.img}" alt="${car.name}"><p>${car.name}</p>`;
    card.addEventListener("click", () => openModal(car));
    stockGrid.appendChild(card);
  });
  showScreen(stockScreen);
}

function openModal(car) {
  modal.style.display = "block";
  modalImg.src = car.img;
  modalCaption.textContent = car.name;
}

/* ========= FEEDBACK ========= */
function showFeedbackBubble(lines = [], topOffsetPx = 180) {
  const wrapper = document.createElement("div");
  wrapper.className = "feedback-bubble";
  wrapper.style.top = topOffsetPx + "px";
  wrapper.innerHTML = lines
    .map((l) => `<div class="feedback-line">${l}</div>`)
    .join("");
  feedbackLayer.appendChild(wrapper);

  requestAnimationFrame(() => (wrapper.style.opacity = "1"));

  setTimeout(() => {
    wrapper.style.opacity = "0";
    wrapper.style.transform = "translate(-50%, -70px) scale(0.98)";
    setTimeout(() => wrapper.remove(), 800);
  }, feedbackVisibleTime);
}

/* ========= LANGUAGE TOGGLE ========= */

const startBtn = document.getElementById("start-btn");
const stockBtn = document.getElementById("stock-btn");

const textContent = {
  pt: {
    startQuiz: "Começar Quiz",
    stock: "Ver Stock Estoril Endurance Festival",
  },
  en: {
    startQuiz: "Start Quiz",
    stock: "See Estoril ClaEndurance Festival Stock",
  },
};

// função para atualizar os textos da tela inicial
function updateHomeTexts() {
  startBtn.textContent = textContent[currentLanguage].startQuiz;
  stockBtn.textContent = textContent[currentLanguage].stock;
}

// eventos de click nas bandeiras
langPT.addEventListener("click", () => {
  currentLanguage = "pt";
  langPT.classList.add("active");
  langEN.classList.remove("active");
  updateHomeTexts();
});

langEN.addEventListener("click", () => {
  currentLanguage = "en";
  langEN.classList.add("active");
  langPT.classList.remove("active");
  updateHomeTexts();
});

// inicializa textos de acordo com a língua atual
updateHomeTexts();

/* ========= QUIZ ========= */
function startQuiz() {
  currentQuestion = 0;
  score = 0;
  totalTime = 0;
  correctAnswers = 0;
  showScreen(quizScreen);
  loadQuestion();
}

function loadQuestion() {
  colorChangeTimeouts.forEach((t) => clearTimeout(t));
  colorChangeTimeouts = [];
  if (timeoutIdForAutoAdvance) {
    clearTimeout(timeoutIdForAutoAdvance);
    timeoutIdForAutoAdvance = null;
  }

  const qList = currentLanguage === "pt" ? questionsPT : questionsEN;

  if (currentQuestion >= qList.length) {
    resultMessage.textContent =
      correctAnswers === 0
        ? messages[currentLanguage].noCorrect
        : messages[currentLanguage].score(correctAnswers, qList.length);
    showScreen(emailPopup);
    return;
  }

  questionContainer.style.opacity = 0;
  setTimeout(() => {
    const q = qList[currentQuestion];
    questionImg.src = q.img;
    questionText.textContent = q.question;

    optionsGrid.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt;
      btn.addEventListener("click", () => selectOption(i));
      optionsGrid.appendChild(btn);
    });

    timerFill.style.transition = "none";
    timerFill.style.width = "100%";
    void timerFill.offsetWidth;

    timerFill.style.transition = `width ${totalTimePerQuestion}s linear`;
    questionStartTs = performance.now();

    const t1 = totalTimePerQuestion * 1000 * (1 / 3);
    const t2 = totalTimePerQuestion * 1000 * (2 / 3);
    timerFill.style.backgroundColor =
      getComputedStyle(document.documentElement).getPropertyValue("--green") ||
      "#28a745";
    colorChangeTimeouts.push(
      setTimeout(
        () =>
          (timerFill.style.backgroundColor =
            getComputedStyle(document.documentElement).getPropertyValue(
              "--yellow"
            ) || "#ffc107"),
        t2
      )
    );
    colorChangeTimeouts.push(
      setTimeout(
        () =>
          (timerFill.style.backgroundColor =
            getComputedStyle(document.documentElement).getPropertyValue(
              "--red"
            ) || "#dc3545"),
        t1
      )
    );

    setTimeout(() => (timerFill.style.width = "0%"), 20);

    timeoutIdForAutoAdvance = setTimeout(
      () => selectOption(-1),
      totalTimePerQuestion * 1000
    );

    questionContainer.style.opacity = 1;
  }, 450);
}

function selectOption(selected) {
  if (timeoutIdForAutoAdvance) {
    clearTimeout(timeoutIdForAutoAdvance);
    timeoutIdForAutoAdvance = null;
  }

  const computedWidth = getComputedStyle(timerFill).width;
  timerFill.style.transition = "none";
  timerFill.style.width = computedWidth;

  colorChangeTimeouts.forEach((t) => clearTimeout(t));
  colorChangeTimeouts = [];

  const now = performance.now();
  let elapsedMs = now - (questionStartTs || now);
  if (elapsedMs < 0) elapsedMs = 0;
  const elapsedSec = Math.min(elapsedMs / 1000, totalTimePerQuestion);
  totalTime += Math.round(elapsedSec * 10) / 10;

  const qList = currentLanguage === "pt" ? questionsPT : questionsEN;
  const q = qList[currentQuestion];

  const optionButtons = document.querySelectorAll(".option-btn");
  optionButtons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add("correct");
    if (i === selected && selected !== q.answer) btn.classList.add("wrong");
  });

  let pointsGained = 0;
  if (selected === q.answer) {
    const secondsRemaining = Math.max(0, totalTimePerQuestion - elapsedSec);
    const bonus = Math.floor(secondsRemaining);
    pointsGained = 10 + bonus;
    score += pointsGained;
    correctAnswers++;
  }

  const bubbleLines = [];
  if (pointsGained > 0) {
    bubbleLines.push(
      messages[currentLanguage].points.replace("{points}", pointsGained)
    );
    bubbleLines.push(
      messages[currentLanguage].timeSpent.replace(
        "{time}",
        Math.round(elapsedSec)
      )
    );
  } else {
    bubbleLines.push(messages[currentLanguage].points.replace("{points}", 0));
    bubbleLines.push(
      elapsedSec >= totalTimePerQuestion - 0.05
        ? messages[currentLanguage].timeout
        : messages[currentLanguage].timeSpent.replace(
            "{time}",
            Math.round(elapsedSec)
          )
    );
  }
  showFeedbackBubble(bubbleLines, 160);

  setTimeout(() => {
    currentQuestion++;
    timerFill.style.transition = "none";
    timerFill.style.width = "100%";
    loadQuestion();
  }, feedbackDelay);
}

/* ========= EMAIL POPUP IDLE TIMER ========= */
function startEmailPopupIdleTimer() {
  clearEmailPopupIdleTimer();
  emailPopupIdleTimeout = setTimeout(() => {
    showScreen(homeScreen);
  }, emailPopupTimeout);
  emailPopup.addEventListener("mousemove", clearEmailPopupIdleTimer);
  emailPopup.addEventListener("keydown", clearEmailPopupIdleTimer);
  emailPopup.addEventListener("click", clearEmailPopupIdleTimer);
}

function clearEmailPopupIdleTimer() {
  if (emailPopupIdleTimeout) clearTimeout(emailPopupIdleTimeout);
  emailPopupIdleTimeout = null;
}

/* ========= EMAIL & LEADERBOARD ========= */
function submitEmail() {
  const name = playerNameInput.value.trim();
  const email = playerEmailInput.value.trim();
  if (!name || !email) return alert(messages[currentLanguage].fillNameEmail);

  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  leaderboard.push({ name, email, score, totalTime });
  leaderboard.sort((a, b) => b.score - a.score || a.totalTime - b.totalTime);
  if (leaderboard.length > 20) leaderboard.length = 20;
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  showLeaderboard();
}

function showLeaderboard() {
  showScreen(leaderboardScreen);
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  leaderboardList.innerHTML = "";
  leaderboard.forEach((p) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${p.name}</strong> - ${p.score.toFixed(
      0
    )} pts - ${p.totalTime.toFixed(1)}s`;
    leaderboardList.appendChild(li);
  });
}

function exportCSV() {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  let csv = "Nome,Email,Score,Tempo\n";
  leaderboard.forEach((p) => {
    csv += `${p.name},${p.email},${p.score.toFixed(0)},${p.totalTime.toFixed(
      1
    )}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leaderboard.csv";
  a.click();
  URL.revokeObjectURL(url);
}
