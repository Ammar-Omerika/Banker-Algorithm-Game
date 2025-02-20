const MAX_LEVELS = 10;
let currentLevel = 1;
let reward = 0;
let score = 0;
let resources = {};
let processes = [];

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateResources() {
  resources = {
    A: getRandom(4, 13),
    B: getRandom(4, 13),
    C: getRandom(4, 13),
  };
}

function generateProcesses() {
  processes = [];
  for (let i = 1; i <= 7; i++) {
    processes.push({
      id: i,
      max: {
        A: getRandom(0, resources.A - 3),
        B: getRandom(0, resources.B - 3),
        C: getRandom(0, resources.C - 3),
      },
      alloc: { A: 0, B: 0, C: 0 },
      need: { A: 0, B: 0, C: 0 },
    });
  }
}

function allocateResources() {
  let totalAlloc = { A: 0, B: 0, C: 0 };

  processes.forEach((process) => {
    process.alloc.A = getRandom(0, Math.floor(process.max.A / 2));
    process.alloc.B = getRandom(0, Math.floor(process.max.B / 2));
    process.alloc.C = getRandom(0, Math.floor(process.max.C / 2));

    totalAlloc.A += process.alloc.A;
    totalAlloc.B += process.alloc.B;
    totalAlloc.C += process.alloc.C;

    if (totalAlloc.A > resources.A || totalAlloc.B > resources.B || totalAlloc.C > resources.C) {
      totalAlloc.A -= process.alloc.A;
      totalAlloc.B -= process.alloc.B;
      totalAlloc.C -= process.alloc.C;
      process.alloc = { A: 0, B: 0, C: 0 };
    }
  });
}

function calculateNeed() {
  processes.forEach((process) => {
    process.need.A = process.max.A - process.alloc.A;
    process.need.B = process.max.B - process.alloc.B;
    process.need.C = process.max.C - process.alloc.C;
  });
}

function calculateAvailableResources() {
  let totalAlloc = { A: 0, B: 0, C: 0 };

  processes.forEach((process) => {
    totalAlloc.A += process.alloc.A;
    totalAlloc.B += process.alloc.B;
    totalAlloc.C += process.alloc.C;
  });

  return {
    A: resources.A - totalAlloc.A,
    B: resources.B - totalAlloc.B,
    C: resources.C - totalAlloc.C,
  };
}

function checkForDeadlock() {
  if (processes.length === 0) {
    document.getElementById("message").textContent = "All processes completed. No deadlock!";
    return false;
  }

  let available = calculateAvailableResources();
  let canExecute = processes.some(
    (process) =>
      process.need.A <= available.A &&
      process.need.B <= available.B &&
      process.need.C <= available.C
  );

  if (!canExecute) {
    score += 200;
    document.getElementById("score").textContent = score;
    document.getElementById("message").textContent = "Deadlock detected! Awarding 200 points.";
    return true;
  }

  return false;
}

function renderGame() {
  document.getElementById("total-resource-a").textContent = resources.A;
  document.getElementById("total-resource-b").textContent = resources.B;
  document.getElementById("total-resource-c").textContent = resources.C;

  let available = calculateAvailableResources();
  document.getElementById("available-resource-a").textContent = available.A;
  document.getElementById("available-resource-b").textContent = available.B;
  document.getElementById("available-resource-c").textContent = available.C;

  document.getElementById("level").textContent = `Medium Level: ${currentLevel}`;
  document.getElementById("score").textContent = score;

  let processList = document.getElementById("process-list");
  processList.innerHTML = "";

  processes.forEach((process) => {
    let row = document.createElement("tr");

    row.innerHTML = `
      <td>P${process.id}</td>
      <td>${process.max.A}, ${process.max.B}, ${process.max.C}</td>
      <td>${process.alloc.A}, ${process.alloc.B}, ${process.alloc.C}</td>
      <td>${process.need.A}, ${process.need.B}, ${process.need.C}</td>
    `;
    row.addEventListener("click", () => handleProcessClick(process.id));
    processList.appendChild(row);
  });

  if (checkForDeadlock() || processes.length === 0) {
    showNextLevelButton();
  }
}

function handleProcessClick(processId) {
  let processIndex = processes.findIndex((process) => process.id === processId);

  if (processIndex === -1) return;

  let process = processes[processIndex];
  let available = calculateAvailableResources();

  if (
    process.need.A <= available.A &&
    process.need.B <= available.B &&
    process.need.C <= available.C
  ) {
    resources.A += process.alloc.A;
    resources.B += process.alloc.B;
    resources.C += process.alloc.C;

    processes.splice(processIndex, 1);

    reward += 5;
    score += reward;
    document.getElementById("score").textContent = score;

    renderGame();
  } else {
    reward = 0;
    document.getElementById("message").textContent = `Process P${process.id} cannot safely execute!`;
  }
}

function showNextLevelButton() {
  let nextButton = document.createElement("button");
  nextButton.textContent = currentLevel < MAX_LEVELS ? "Next Level" : "Finish Game";
  nextButton.addEventListener("click", nextLevel);
  document.getElementById("next-level").appendChild(nextButton);
}

function nextLevel() {
  if (currentLevel < MAX_LEVELS) {
    currentLevel++;
    resetGame();
  } else {
    showEndScreen();
  }
}

function resetGame() {
  document.getElementById("next-level").innerHTML = "";
  document.getElementById("message").textContent = "";
  generateResources();
  generateProcesses();
  allocateResources();
  calculateNeed();
  renderGame();
}

function showEndScreen() {
  document.body.innerHTML = `
    <div>
      <h1>Congratulations!</h1>
      <p>Your final score: ${score}</p>
      <button onclick="restartGame()">Play Again</button>
    </div>
  `;
}

function restartGame() {
  window.location.href = "game.html";
}

generateResources();
generateProcesses();
allocateResources();
calculateNeed();
renderGame();
