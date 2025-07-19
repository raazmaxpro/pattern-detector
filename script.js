// brain.js (Final Version for Pattern Genius)

// -----------------------------
// 🔁 Utility & State Variables
// -----------------------------
let entries = [];
let patterns = {};
let maxEntries = 1000;
let period = 1;

// -----------------------------
// 🚦 DOM Elements
// -----------------------------
const colorInput = document.getElementById("colorInput");
const resultInput = document.getElementById("resultInput");
const saveBtn = document.getElementById("saveBtn");
const exitBtn = document.getElementById("exitBtn");
const dataBody = document.getElementById("dataBody");
const patternStatus = document.getElementById("patternStatus");
const predictionPreview = document.getElementById("predictionPreview");

// Hide prediction output initially
predictionPreview.style.display = "none";

// -----------------------------
// ✅ Input Validation
// -----------------------------
function isValid(color, result) {
  const validColors = ["red", "green"];
  const validResults = ["big", "small"];
  return validColors.includes(color) && validResults.includes(result);
}

// -----------------------------
// ➕ Add Entry to Table & Logic
// -----------------------------
function addEntry(color, result) {
  if (entries.length >= maxEntries) {
    entries.shift();
    dataBody.deleteRow(0);
  }

  const row = dataBody.insertRow();
  row.insertCell(0).textContent = period;
  row.insertCell(1).textContent = color;
  row.insertCell(2).textContent = result;

  entries.push({ color, result });
  period++;

  updatePatternStatus();
}

// -----------------------------
// 🔍 Pattern Detection Trigger
// -----------------------------
function updatePatternStatus() {
  if (entries.length < 10) {
    patternStatus.textContent = "🔍 Waiting for 10 entries to start detection...";
    predictionPreview.style.display = "none";
    return;
  }

  patternStatus.textContent = "🔬 Detecting patterns...";
  detectPatterns();
}

// -----------------------------
// 🧠 Pattern Detection Logic
// -----------------------------
function detectPatterns() {
  const total = entries.length;

  for (let len = 3; len <= 5; len++) {
    if (total <= len) continue;

    const recentPattern = entries.slice(total - len);
    const patternKey = recentPattern.map(e => `${e.color}-${e.result}`).join(",");
    const prediction = entries[total - 1].result;

    if (!patterns[patternKey]) {
      patterns[patternKey] = {
        prediction: prediction,
        count: 0,
        success: 0,
        lastResults: [],
        length: len
      };
    }

    const pat = patterns[patternKey];
    pat.count++;

    const nextEntry = entries[total];
    if (nextEntry) {
      if (nextEntry.result === pat.prediction) {
        pat.success++;
        pat.lastResults.push(true);
      } else {
        pat.lastResults.push(false);
      }
      if (pat.lastResults.length > 5) pat.lastResults.shift();
    }

    const currentKey = entries.slice(total - len).map(e => `${e.color}-${e.result}`).join(",");
    if (currentKey === patternKey && pat.count >= 5) {
      const accuracy = ((pat.success / pat.count) * 100).toFixed(1);
      const colorsOnly = recentPattern.map(e => e.color).join(", ");

      // Display Output Area
      predictionPreview.style.display = "block";
      predictionPreview.querySelector(".text-track").textContent = colorsOnly;
      predictionPreview.querySelector(".tag").textContent = pat.prediction;
      predictionPreview.querySelector(".badge").textContent = `${accuracy}%`;
      predictionPreview.querySelector(".note").textContent = `(${pat.count} validations)`;

      const resultIcons = pat.lastResults.map(r =>
        `<span class="outcome ${r ? "win" : "loss"}">${r ? "✓" : "✗"}</span>`
      ).join("");
      predictionPreview.querySelector(".last-five").innerHTML = resultIcons;

      return; // show only first valid one
    }
  }

  // No match found
  predictionPreview.style.display = "none";
}

// -----------------------------
// 💾 Save Button Handler
// -----------------------------
saveBtn.addEventListener("click", () => {
  const color = colorInput.value.trim().toLowerCase();
  const result = resultInput.value.trim().toLowerCase();

  if (!isValid(color, result)) return;

  addEntry(color, result);
  colorInput.value = "";
  resultInput.value = "";
});

// 🔄 Optional Exit
exitBtn.addEventListener("click", () => {
  location.reload();
});
