/* ========= CONFIG ========= */
const totalTimePerQuestion = 20; // seconds — altera aqui quando quiseres
const feedbackDelay = 2000; // tempo (ms) para mostrar feedback antes de próxima pergunta
const feedbackVisibleTime = 2000;  // quanto tempo o popup fica visível (ms)

/* ========= STOCK ========= */
const stockCars = [
  { name: "Custom Car - Order Yours!", img: "images/custom-car.png" },
  { name: "BMW 3.0 CSL", img: "images/3.0CSL.png" },
  { name: "Ferrari 296 GT3", img: "images/296GT3.png" },
  { name: "Mercedes-Benz 300 SL", img: "images/300SL.png" },
  { name: "Porsche 934", img: "images/934.png" },
  { name: "Formula 1", img: "images/F1.png" },
  { name: "Ferrari F40", img: "images/F40.png" }, // Atenção: O F40 está duplicado, um com .jpg e outro com .png
  { name: "Porsche GT3 RS", img: "images/GT3RS.png" },
  { name: "Ford GT40", img: "images/GT40.png" },
  { name: "BMW M1", img: "images/M1.png" },
  { name: "De Tomaso Pantera", img: "images/Pantera.png" },
  { name: "Nissan R34 GT-R", img: "images/R34.png" },
  { name: "Toyota Supra", img: "images/Supra.png" },
  { name: "Alfa Romeo TZ2", img: "images/TZ2.png" },
  { name: "Dodge Viper", img: "images/Viper.png" }
];

/* ========= QUIZ QUESTIONS ========= */
const questions = [
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
/* ========= STATE ========= */
let currentQuestion = 0;
let score = 0;
let totalTime = 0;
let correctAnswers = 0;
let questionStartTs = 0;
let timeoutIdForAutoAdvance = null;
let colorChangeTimeouts = [];

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

/* ========= UTIL ========= */
function showScreen(screen) {
  [homeScreen, quizScreen, stockScreen, emailPopup, leaderboardScreen].forEach(
    (s) => s.classList.remove("active")
  );
  screen.classList.add("active");
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

/* ========= FEEDBACK BUBBLE ========= */
function showFeedbackBubble(lines = [], topOffsetPx = 180) {
  const wrapper = document.createElement("div");
  wrapper.className = "feedback-bubble";
  wrapper.style.top = topOffsetPx + "px";
  wrapper.innerHTML = lines
    .map((l) => `<div class="feedback-line">${l}</div>`)
    .join("");
  feedbackLayer.appendChild(wrapper);
  // Remove after animation
  setTimeout(() => {
    wrapper.remove();
  }, feedbackVisibleTime);
}

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
  // clear any color timeouts from previous question
  colorChangeTimeouts.forEach((t) => clearTimeout(t));
  colorChangeTimeouts = [];
  if (timeoutIdForAutoAdvance) {
    clearTimeout(timeoutIdForAutoAdvance);
    timeoutIdForAutoAdvance = null;
  }

  if (currentQuestion >= questions.length) {
    // final results message
    if (correctAnswers === 0) {
      resultMessage.textContent =
        "Obrigado por participar! Vais conseguir melhor da próxima 😄";
    } else {
      resultMessage.textContent = `Acertaste ${correctAnswers} de ${questions.length} perguntas!`;
    }
    showScreen(emailPopup);
    return;
  }

  // fade out container then set content then fade in
  questionContainer.style.opacity = 0;
  setTimeout(() => {
    const q = questions[currentQuestion];
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

    // reset timer fill and start smooth transition
    timerFill.style.transition = "none";
    timerFill.style.width = "100%";
    // force reflow to apply transition change
    void timerFill.offsetWidth;

    // prepare transition (smooth linear)
    timerFill.style.transition = `width ${totalTimePerQuestion}s linear`;
    // set start timestamp
    questionStartTs = performance.now();
    // start color schedule (at 1/3 and 2/3 fractions)
    const t1 = totalTimePerQuestion * 1000 * (1 / 3);
    const t2 = totalTimePerQuestion * 1000 * (2 / 3);
    // initial color green
    timerFill.style.backgroundColor =
      getComputedStyle(document.documentElement).getPropertyValue("--green") ||
      "#28a745";
    colorChangeTimeouts.push(
      setTimeout(() => {
        timerFill.style.backgroundColor =
          getComputedStyle(document.documentElement).getPropertyValue(
            "--yellow"
          ) || "#ffc107";
      }, t2)
    );
    colorChangeTimeouts.push(
      setTimeout(() => {
        timerFill.style.backgroundColor =
          getComputedStyle(document.documentElement).getPropertyValue(
            "--red"
          ) || "#dc3545";
      }, t1)
    );

    // trigger the smooth countdown to 0%
    // small timeout to ensure transition is applied
    setTimeout(() => {
      timerFill.style.width = "0%";
    }, 20);

    // set a timeout for when time runs out (fallback)
    timeoutIdForAutoAdvance = setTimeout(() => {
      // simulate selection with -1 (timeout)
      selectOption(-1);
    }, totalTimePerQuestion * 1000);

    // fade IN
    questionContainer.style.opacity = 1;
  }, 450);
}

function selectOption(selected) {
  // cancel auto-advance timeout
  if (timeoutIdForAutoAdvance) {
    clearTimeout(timeoutIdForAutoAdvance);
    timeoutIdForAutoAdvance = null;
  }
  colorChangeTimeouts.forEach((t) => clearTimeout(t));
  colorChangeTimeouts = [];

  // compute actual time spent
  const now = performance.now();
  let elapsedMs = now - (questionStartTs || now);
  if (elapsedMs < 0) elapsedMs = 0;
  const elapsedSec = Math.min(elapsedMs / 1000, totalTimePerQuestion);
  const timeSpent = Math.round(elapsedSec * 10) / 10; // 1 decimal

  totalTime += timeSpent;

  const q = questions[currentQuestion];
  const optionButtons = document.querySelectorAll(".option-btn");
  optionButtons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add("correct");
    if (i === selected && selected !== q.answer) btn.classList.add("wrong");
  });

  let pointsGained = 0;
  if (selected === q.answer) {
    // points: 10 + 1 * seconds remaining
    const secondsRemaining = Math.max(0, totalTimePerQuestion - elapsedSec);
    const bonus = Math.floor(secondsRemaining); // consistent with original decision; could be decimal if desired
    pointsGained = 10 + bonus;
    score += pointsGained;
    correctAnswers++;
  }

  // show animated feedback bubble in the middle-top of the quiz container
  const bubbleLines = [];
  if (pointsGained > 0) {
    bubbleLines.push(`+${pointsGained} pontos`);
    bubbleLines.push(`Demoraste ${timeSpent}s`);
  } else {
    // either wrong or timeout => show points (0) and time message
    bubbleLines.push(`+0 pontos`);
    // If exceeded time (approx equal totalTimePerQuestion)
    if (elapsedSec >= totalTimePerQuestion - 0.05) {
      bubbleLines.push(`Ficaste sem tempo!`);
    } else {
      bubbleLines.push(`Demoraste ${timeSpent}s`);
    }
  }
  // show visual feedback (topOffsetPx tuned to display near question)
  showFeedbackBubble(bubbleLines, 160);

  // wait feedbackDelay then next question
  setTimeout(() => {
    currentQuestion++;
    // Reset timerFill styles quickly for the next question
    timerFill.style.transition = "none";
    timerFill.style.width = "100%";
    // proceed
    loadQuestion();
  }, feedbackDelay);
}

/* ========= EMAIL & LEADERBOARD ========= */
function submitEmail() {
  const name = playerNameInput.value.trim();
  const email = playerEmailInput.value.trim();
  if (!name || !email) return alert("Preencha nome e email!");

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
