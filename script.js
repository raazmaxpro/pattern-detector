const colorInput = document.getElementById("colorInput");
const resultInput = document.getElementById("resultInput");
const saveBtn = document.getElementById("saveBtn");
const dataBody = document.getElementById("dataBody");
const patternCard = document.getElementById("predictionPreview");
const exitBtn = document.getElementById("exitBtn");
const patternText = document.getElementById("patternText");
const predictionText = document.getElementById("predictionText");
const accuracyText = document.getElementById("accuracyText");
const validationNote = document.getElementById("validationNote");
const lastFiveResults = document.getElementById("lastFiveResults");
const sequenceText = document.getElementById("SequenceText");
const patternStatus = document.getElementById("patternStatus");

let data = [];
let serial = 1;

// ✅ Input validation
function isValidEntry(color, result) {
  const validColors = ["red", "green"];
  const validResults = ["big", "small"];
  return validColors.includes(color.toLowerCase()) && validResults.includes(result.toLowerCase());
}

// ✅ Add row to table
function addToTable(color, result) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${serial++}</td>
    <td>${color}</td>
    <td>${result}</td>
  `;
  dataBody.prepend(row);
}

// ✅ Save button click
saveBtn.addEventListener("click", () => {
  const color = colorInput.value.trim().toLowerCase();
  const result = resultInput.value.trim().toLowerCase();

  if (!isValidEntry(color, result)) return;

  data.push({ color, result });
  addToTable(color, result);

  colorInput.value = "";
  resultInput.value = "";

  if (data.length >= 10) {
    detectPatterns();
  } else {
    patternStatus.textContent = "🔍 Waiting for 10 entries to start detection...";
    patternCard.classList.add("hidden");
  }
});

// ✅ Pattern Detection Logic
function detectPatterns() {
  const patterns = findPatterns(data, 3, 5);
  const bestPattern = getBestPattern(patterns);

 if (bestPattern && isCurrentMatch(bestPattern.sequence, bestPattern.type)) {
  showPrediction(bestPattern);
}
 else {
    patternCard.classList.add("hidden");
  }
}

// ✅ Find repeating patterns (length 3 to 5)
// ✅ Updated: Detect repeating patterns that predict next result correctly
function findPatterns(data, minLen, maxLen) {
  const patterns = [];

  // Check both result-based and color-based patterns
  const types = ["result", "color"];

  for (let type of types) {
    for (let len = minLen; len <= maxLen; len++) {
      const map = new Map();

      for (let i = 0; i <= data.length - len - 1; i++) {
        const seq = data.slice(i, i + len).map(d => d[type]).join("|");

        if (!map.has(seq)) map.set(seq, []);
        map.get(seq).push(i);
      }

      for (let [seq, positions] of map.entries()) {
        if (positions.length < 2) continue;

        const wins = [];

        for (let pos of positions) {
          const next = data[pos + len];
          if (next) {
            const predictedNext = seq.split("|")[0]; // Predict same as first in pattern
            const actualNext = next[type];

            wins.push(actualNext === predictedNext ? "✓" : "✗");
          }
        }

        const winCount = wins.filter(w => w === "✓").length;

        if (winCount >= 4) {
          patterns.push({
            type, // "result" or "color"
            sequence: seq.split("|"),
            raw: seq,
            positions,
            wins,
            accuracy: Math.round((winCount / wins.length) * 100),
          });
        }
      }
    }
  }

  return patterns;
}

// ✅ Pick the best performing pattern
function getBestPattern(patterns) {
  if (patterns.length === 0) return null;
  return patterns.sort((a, b) => b.accuracy - a.accuracy || b.positions.length - a.positions.length)[0];
}

// ✅ Check if current data ends with this pattern
function isCurrentMatch(patternSeq, type) {
  const recent = data.slice(-(patternSeq.length - 1)).map(d => d[type]);
  const patternStart = patternSeq.slice(0, -1);

  return JSON.stringify(recent) === JSON.stringify(patternStart);
}



// ✅ Show Prediction Output
function showPrediction(pattern) {
  const nextPrediction = pattern.sequence[pattern.sequence.length - 1]; // Already correct
  patternStatus.textContent = `✅ Pattern Detected (${pattern.type.toUpperCase()})`;


  patternText.textContent = pattern.sequence.join(", ");
  predictionText.textContent = capitalize(nextPrediction);
  accuracyText.textContent = `${pattern.accuracy}%`;
  validationNote.textContent = `(${pattern.wins.length} validations)`;

  const last5 = pattern.wins.slice(-5).map(w => `<span class="outcome ${w === '✓' ? 'win' : 'loss'}">${w}</span>`).join("");
  lastFiveResults.innerHTML = last5;

  const seqSummary = summarizeSequence(pattern.wins);
  sequenceText.textContent = seqSummary;

  patternCard.classList.remove("hidden");
  patternStatus.textContent = "✅ Pattern Detected";
}

// ✅ Create summary of pattern performance sequence
function summarizeSequence(wins) {
  let winStreaksToLoss = [];
  let lossStreaksToWin = [];

  let streak = 1;
  for (let i = 1; i < wins.length; i++) {
    if (wins[i] === wins[i - 1]) {
      streak++;
    } else {
      if (wins[i - 1] === "✓" && wins[i] === "✗") {
        winStreaksToLoss.push(streak);
      }
      if (wins[i - 1] === "✗" && wins[i] === "✓") {
        lossStreaksToWin.push(streak);
      }
      streak = 1;
    }
  }

  let resultText = "";

  if (winStreaksToLoss.length > 0) {
    resultText += `🏆 Wins before Loss: ${winStreaksToLoss.join(", ")}`;
  }
  if (lossStreaksToWin.length > 0) {
    if (resultText !== "") resultText += " || ";
    resultText += `💔 Losses before Win: ${lossStreaksToWin.join(", ")}`;
  }

  return resultText || "No clear streak transitions found.";
}


function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

exitBtn.addEventListener("click", () => {
  // Clear data array and reset serial
  data = [];
  serial = 1;

  // Clear table body
  dataBody.innerHTML = "";

  // Clear localStorage (if used)
  localStorage.clear();
});
