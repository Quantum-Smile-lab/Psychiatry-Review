// ============================================================
// app.js — Psychiatry Review
// ============================================================

// ===== STATE =====
let allQuestions   = [];
let currentQ       = 0;
let score          = 0;
let wrongAnswers   = [];
let answered       = false;
let cameFrom       = 'home'; // where the quiz was launched from, for the Back button

// ===== DOM =====
const screens        = document.querySelectorAll('.screen');
const loadingOverlay  = document.getElementById('loadingOverlay');
const subjectsGrid    = document.getElementById('subjectsGrid');

// ===== STARS =====
function createStars() {
  const container = document.getElementById('stars');
  container.innerHTML = '';

  for (let i = 0; i < 80; i++) {
    const star = document.createElement('div');
    star.className = 'star white';
    const size = Math.random() * 1.8 + 0.4;
    star.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      top:    ${Math.random() * 100}%;
      left:   ${Math.random() * 100}%;
      --dur:  ${Math.random() * 3 + 2}s;
      --op:   ${Math.random() * 0.5 + 0.2};
      animation-delay: ${Math.random() * 5}s;
    `;
    container.appendChild(star);
  }

  for (let i = 0; i < 30; i++) {
    const star = document.createElement('div');
    star.className = 'star gold';
    const size = Math.random() * 2 + 0.8;
    star.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      top:    ${Math.random() * 100}%;
      left:   ${Math.random() * 100}%;
      --dur:  ${Math.random() * 4 + 2}s;
      --op:   ${Math.random() * 0.7 + 0.3};
      animation-delay: ${Math.random() * 6}s;
    `;
    container.appendChild(star);
  }

  const brightPositions = [
    { top: 8,  left: 15 },
    { top: 12, left: 75 },
    { top: 25, left: 90 },
    { top: 45, left: 5  },
    { top: 60, left: 55 },
    { top: 70, left: 85 },
    { top: 85, left: 30 },
    { top: 90, left: 70 },
  ];

  brightPositions.forEach(pos => {
    const star = document.createElement('div');
    star.className = 'star bright';
    const size = Math.random() * 4 + 4;
    star.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      top:    ${pos.top + (Math.random() * 4 - 2)}%;
      left:   ${pos.left + (Math.random() * 4 - 2)}%;
      --dur:  ${Math.random() * 3 + 3}s;
      --op:   ${Math.random() * 0.4 + 0.6};
      animation: twinkleBright var(--dur) ease-in-out infinite;
      animation-delay: ${Math.random() * 4}s;
    `;
    container.appendChild(star);
  });

  const brightGoldPositions = [
    { top: 18, left: 40 },
    { top: 35, left: 20 },
    { top: 50, left: 78 },
    { top: 75, left: 12 },
    { top: 80, left: 92 },
  ];

  brightGoldPositions.forEach(pos => {
    const star = document.createElement('div');
    star.className = 'star bright-gold';
    const size = Math.random() * 3 + 3;
    star.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      top:    ${pos.top + (Math.random() * 4 - 2)}%;
      left:   ${pos.left + (Math.random() * 4 - 2)}%;
      --dur:  ${Math.random() * 4 + 3}s;
      --op:   ${Math.random() * 0.4 + 0.6};
      animation: twinkleBright var(--dur) ease-in-out infinite;
      animation-delay: ${Math.random() * 5}s;
    `;
    container.appendChild(star);
  });
}

// ===== SHOW SCREEN =====
function showScreen(id) {
  screens.forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ===== INIT =====
async function init() {
  createStars();
  try {
    const res    = await fetch('data/topics.json');
    const topics = await res.json();
    renderTopics(topics);
    loadingOverlay.classList.add('hidden');
    showScreen('home');
  } catch (err) {
    loadingOverlay.querySelector('.loading-text').textContent =
      '⚠️ Error. Open with Live Server.';
  }
}

// ===== RENDER TOPICS (HOME) =====
function renderTopics(topics) {
  subjectsGrid.innerHTML = '';

  topics.forEach(topic => {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.innerHTML = `
      <span class="subject-icon">${topic.icon}</span>
      <div class="subject-name">${topic.name}</div>
      <div class="subject-chapters">${topic.count} questions</div>
    `;
    card.addEventListener('click', () => startQuiz(topic.file, topic.name));
    subjectsGrid.appendChild(card);
  });

  // Extra card: Previous Exams
  const examCard = document.createElement('div');
  examCard.className = 'subject-card exam-entry';
  examCard.innerHTML = `
    <span class="subject-icon">🗓️</span>
    <div class="subject-name">Previous Exams</div>
    <div class="subject-chapters">Choose a year</div>
  `;
  examCard.addEventListener('click', openExamSelect);
  subjectsGrid.appendChild(examCard);
}

// ===== OPEN EXAM SELECT (PREVIOUS EXAMS) =====
async function openExamSelect() {
  loadingOverlay.classList.remove('hidden');
  try {
    const res   = await fetch('data/exams.json');
    const exams = await res.json();
    const grid  = document.getElementById('examsGrid');
    grid.innerHTML = '';
    exams.forEach((exam, i) => {
      const card = document.createElement('div');
      card.className = 'chapter-card';
      card.innerHTML = `
        <div class="chapter-num">${i + 1}</div>
        <div>
          <div class="chapter-name">${exam.name}</div>
          <div class="chapter-sub">${exam.count} questions</div>
        </div>
      `;
      card.addEventListener('click', () => startQuiz(exam.file, exam.name, 'examSelect'));
      grid.appendChild(card);
    });
    loadingOverlay.classList.add('hidden');
    showScreen('examSelect');
  } catch {
    loadingOverlay.classList.add('hidden');
    alert('Failed to load exams.');
  }
}

// ===== BACK BUTTONS =====
document.getElementById('backToHome').addEventListener('click', () => showScreen('home'));

document.getElementById('backToPrev').addEventListener('click', () => showScreen(cameFrom));

// ===== START QUIZ =====
async function startQuiz(file, label, from = 'home') {
  loadingOverlay.classList.remove('hidden');
  cameFrom = from;
  try {
    const res    = await fetch(file);
    allQuestions = await res.json();
    allQuestions = shuffle(allQuestions);
    allQuestions.forEach(q => q.topic = label);
    currentQ     = 0;
    score        = 0;
    wrongAnswers = [];
    document.getElementById('quizBrand').textContent = label;
    loadingOverlay.classList.add('hidden');
    showScreen('quiz');
    renderQuestion();
  } catch {
    loadingOverlay.classList.add('hidden');
    alert('Failed to load quiz.');
  }
}

// ===== SHUFFLE =====
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ===== RENDER QUESTION =====
function renderQuestion() {
  if (currentQ >= allQuestions.length) {
    showResult();
    return;
  }
  answered = false;
  const q  = allQuestions[currentQ];
  document.getElementById('qCurrent').textContent    = currentQ + 1;
  document.getElementById('qTotal').textContent      = allQuestions.length;
  document.getElementById('qScore').textContent      = score;
  document.getElementById('qNum').textContent        = currentQ + 1;
  document.getElementById('qTopicTag').textContent   = q.topic || 'General';
  document.getElementById('progressFill').style.width =
    ((currentQ / allQuestions.length) * 100) + '%';
  document.getElementById('questionText').textContent = q.question;

  const optionsList = document.getElementById('optionsList');
  optionsList.innerHTML = '';
  const letters = ['A','B','C','D','E','F'];

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `
      <span class="option-letter">${letters[i]}</span>
      <span class="option-text">${opt}</span>
      <span class="option-icon"></span>
    `;
    btn.addEventListener('click', () => selectAnswer(btn, i, q));
    optionsList.appendChild(btn);
  });

  document.getElementById('feedbackBox').className = 'feedback-box';
  document.getElementById('btnSkip').style.display = '';
  document.getElementById('btnNext').style.display = 'none';
}

// ===== SELECT ANSWER =====
function selectAnswer(btn, index, q) {
  if (answered) return;
  answered = true;
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(b => b.disabled = true);

  const isCorrect = index === q.correct;

  if (isCorrect) {
    btn.classList.add('correct');
    btn.querySelector('.option-icon').textContent = '✓';
    score++;
    document.getElementById('qScore').textContent = score;
    showFeedback(true, '✓ Correct!');
  } else {
    btn.classList.add('wrong');
    btn.querySelector('.option-icon').textContent = '✗';
    buttons[q.correct].classList.add('show-correct');
    buttons[q.correct].querySelector('.option-icon').textContent = '✓';
    showFeedback(false, `✗ Wrong! Correct: ${q.options[q.correct]}`);
    wrongAnswers.push({
      question:      q.question,
      topic:         q.topic,
      userAnswer:    q.options[index],
      correctAnswer: q.options[q.correct],
      qNum:          currentQ + 1,
    });
  }

  document.getElementById('btnSkip').style.display = 'none';
  document.getElementById('btnNext').style.display = '';
}

// ===== FEEDBACK =====
function showFeedback(correct, msg) {
  const box = document.getElementById('feedbackBox');
  box.className = `feedback-box show ${correct ? 'correct' : 'wrong'}`;
  document.getElementById('feedbackIcon').textContent = correct ? '✓' : '✗';
  document.getElementById('feedbackText').textContent = msg;
}

// ===== SKIP =====
document.getElementById('btnSkip').addEventListener('click', () => {
  currentQ++;
  renderQuestion();
});

// ===== NEXT =====
document.getElementById('btnNext').addEventListener('click', () => {
  currentQ++;
  renderQuestion();
});

// ===== SHOW RESULT =====
function showResult() {
  showScreen('result');
  const total = allQuestions.length;
  const pct   = Math.round((score / total) * 100);
  const wrong = total - score;

  setTimeout(() => {
    document.getElementById('ringFill').style.strokeDashoffset =
      345 - (pct / 100) * 345;
  }, 100);

  document.getElementById('scorePct').textContent   = pct + '%';
  document.getElementById('resCorrect').textContent = score;
  document.getElementById('resWrong').textContent   = wrong;
  document.getElementById('resTotal').textContent   = total;

  if (pct >= 90) {
    document.getElementById('resultEmoji').textContent    = '🏆';
    document.getElementById('resultTitle').textContent    = 'Excellent!';
    document.getElementById('resultSubtitle').textContent = 'Outstanding performance!';
  } else if (pct >= 70) {
    document.getElementById('resultEmoji').textContent    = '🎉';
    document.getElementById('resultTitle').textContent    = 'Well Done!';
    document.getElementById('resultSubtitle').textContent = 'Great job, keep it up!';
  } else if (pct >= 50) {
    document.getElementById('resultEmoji').textContent    = '📚';
    document.getElementById('resultTitle').textContent    = 'Good Effort!';
    document.getElementById('resultSubtitle').textContent = 'Review and try again.';
  } else {
    document.getElementById('resultEmoji').textContent    = '💪';
    document.getElementById('resultTitle').textContent    = 'Keep Studying!';
    document.getElementById('resultSubtitle').textContent = 'You can do better!';
  }

  renderWrongReview();
}

// ===== WRONG REVIEW =====
function renderWrongReview() {
  const section = document.getElementById('wrongReviewSection');
  section.innerHTML = '';

  if (wrongAnswers.length === 0) {
    section.innerHTML =
      '<div class="no-wrong-msg">🎉 Perfect Score! No wrong answers!</div>';
    return;
  }

  const title = document.createElement('div');
  title.className = 'wrong-review-title';
  title.innerHTML = `❌ Wrong Answers <span>${wrongAnswers.length}</span>`;
  section.appendChild(title);

  wrongAnswers.forEach(item => {
    const div = document.createElement('div');
    div.className = 'wrong-item';
    div.innerHTML = `
      <div class="wrong-item-meta">
        <span class="wrong-item-num">Q${item.qNum}</span>
        <span class="wrong-item-topic">${item.topic}</span>
      </div>
      <div class="wrong-item-q">${item.question}</div>
      <div class="wrong-item-answers">
        <div class="answer-row user-wrong">
          <span class="answer-row-icon">✗</span>
          <span class="answer-row-label">Your Answer</span>
          <span>${item.userAnswer}</span>
        </div>
        <div class="answer-row correct-ans">
          <span class="answer-row-icon">✓</span>
          <span class="answer-row-label">Correct</span>
          <span>${item.correctAnswer}</span>
        </div>
      </div>
    `;
    section.appendChild(div);
  });
}

// ===== RETRY =====
document.getElementById('restartBtn').addEventListener('click', () => {
  currentQ     = 0;
  score        = 0;
  wrongAnswers = [];
  allQuestions = shuffle(allQuestions);
  document.getElementById('ringFill').style.strokeDashoffset = 345;
  showScreen('quiz');
  renderQuestion();
});

// ===== HOME =====
document.getElementById('homeBtn').addEventListener('click', () => {
  document.getElementById('ringFill').style.strokeDashoffset = 345;
  showScreen('home');
});

// ===== START =====
init();
