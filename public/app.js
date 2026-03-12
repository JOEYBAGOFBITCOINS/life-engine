function createInitialState() {
  return {
    day: 0,
    chronologicalAge: 40,
    biologicalAge: 38.8,
    vitality: 72,
    repair: 60,
    inflammation: 30,
    damage: 20,
    stressLoad: 35,
    systems: {
      brain: 74,
      heart: 71,
      metabolism: 69,
      immune: 66,
      mobility: 73,
      recovery: 62
    }
  };
}

let state = createInitialState();
let ageChart = null;

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function escapeVelocity() {
  const repairPower =
    state.repair +
    state.vitality +
    averageSystemsScore() * 0.5;

  const decayForce =
    state.damage +
    state.inflammation +
    state.stressLoad * 0.5;

  return Math.round(repairPower - decayForce);
}

function averageSystemsScore() {
  const values = Object.values(state.systems);
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round(total / values.length);
}

function twinStatusLabel() {
  const velocity = escapeVelocity();

  if (velocity >= 50) {
    return "Escape Velocity Rising";
  }

  if (velocity >= 20) {
    return "Repair Dominant";
  }

  if (velocity >= 0) {
    return "Stable";
  }

  return "Aging Dominant";
}

function scoreClass(score) {
  if (score >= 70) return "zone-good";
  if (score >= 45) return "zone-warn";
  return "zone-bad";
}

function renderState() {
  const stateEl = document.getElementById("state");

  const cards = [
    ["Day", state.day],
    ["Chronological Age", state.chronologicalAge.toFixed(2)],
    ["Biological Age", state.biologicalAge.toFixed(2)],
    ["Vitality", state.vitality],
    ["Repair", state.repair],
    ["Inflammation", state.inflammation],
    ["Damage", state.damage],
    ["Stress Load", state.stressLoad],
    ["System Average", averageSystemsScore()],
    ["Escape Velocity", escapeVelocity()]
  ];

  stateEl.innerHTML = cards
    .map(([label, value]) => {
      return `
        <div class="metric-card">
          <div class="metric-label">${label}</div>
          <div class="metric-value">${value}</div>
        </div>
      `;
    })
    .join("");
}

function renderSystems() {
  const systemsEl = document.getElementById("systems");

  systemsEl.innerHTML = Object.entries(state.systems)
    .map(([key, value]) => {
      return `
        <div class="system-card">
          <div class="system-label">${formatLabel(key)}</div>
          <div class="system-value">${value}</div>
        </div>
      `;
    })
    .join("");
}

function renderTwin() {
  setZone("zone-head", state.systems.brain);
  setZone(
    "zone-torso",
    Math.round((state.systems.heart + state.systems.metabolism) / 2)
  );
  setZone("zone-left-arm", state.systems.immune);
  setZone("zone-right-arm", 100 - state.stressLoad);
  setZone("zone-left-leg", state.systems.mobility);
  setZone("zone-right-leg", state.systems.recovery);

  const badge = document.getElementById("statusBadge");
  badge.textContent = twinStatusLabel();
}

function setZone(id, score) {
  const el = document.getElementById(id);
  el.classList.remove("zone-good", "zone-warn", "zone-bad");
  el.classList.add(scoreClass(score));
}

function formatLabel(key) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function render() {
  renderState();
  renderSystems();
  renderTwin();
}

function log(message) {
  const logEl = document.getElementById("log");
  const line = document.createElement("div");
  line.className = "log-entry";
  line.textContent = `Day ${state.day}: ${message}`;
  logEl.prepend(line);
}

function initChart() {
  const canvas = document.getElementById("ageChart");

  if (!canvas || typeof Chart === "undefined") {
    return;
  }

  const ctx = canvas.getContext("2d");

  ageChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [state.day],
      datasets: [
        {
          label: "Chronological Age",
          data: [state.chronologicalAge],
          borderColor: "#38bdf8",
          backgroundColor: "rgba(56, 189, 248, 0.15)",
          borderWidth: 2,
          tension: 0.3,
          fill: false
        },
        {
          label: "Biological Age",
          data: [state.biologicalAge],
          borderColor: "#22c55e",
          backgroundColor: "rgba(34, 197, 94, 0.15)",
          borderWidth: 2,
          tension: 0.3,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: "#f5f7fb"
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "#b8c4d6"
          },
          grid: {
            color: "rgba(184, 196, 214, 0.15)"
          },
          title: {
            display: true,
            text: "Simulation Day",
            color: "#b8c4d6"
          }
        },
        y: {
          ticks: {
            color: "#b8c4d6"
          },
          grid: {
            color: "rgba(184, 196, 214, 0.15)"
          },
          title: {
            display: true,
            text: "Age",
            color: "#b8c4d6"
          }
        }
      }
    }
  });
}

function updateChart() {
  if (!ageChart) {
    return;
  }

  ageChart.data.labels.push(state.day);
  ageChart.data.datasets[0].data.push(state.chronologicalAge);
  ageChart.data.datasets[1].data.push(state.biologicalAge);
  ageChart.update();
}

function resetChart() {
  if (ageChart) {
    ageChart.destroy();
    ageChart = null;
  }

  initChart();
}

function apply(type) {
  if (type === "sleep") {
    state.repair = clamp(state.repair + 5);
    state.inflammation = clamp(state.inflammation - 3);
    state.stressLoad = clamp(state.stressLoad - 5);
    state.systems.brain = clamp(state.systems.brain + 4);
    state.systems.recovery = clamp(state.systems.recovery + 7);
    state.biologicalAge = Math.max(0, state.biologicalAge - 0.03);
    log("Deep sleep improved brain function, recovery, and repair.");
  }

  if (type === "exercise") {
    state.vitality = clamp(state.vitality + 6);
    state.inflammation = clamp(state.inflammation - 2);
    state.systems.heart = clamp(state.systems.heart + 4);
    state.systems.mobility = clamp(state.systems.mobility + 5);
    state.systems.metabolism = clamp(state.systems.metabolism + 3);
    state.biologicalAge = Math.max(0, state.biologicalAge - 0.02);
    log("Exercise improved heart health, mobility, and metabolic performance.");
  }

  if (type === "nutrition") {
    state.repair = clamp(state.repair + 4);
    state.damage = clamp(state.damage - 2);
    state.systems.metabolism = clamp(state.systems.metabolism + 5);
    state.systems.immune = clamp(state.systems.immune + 3);
    state.biologicalAge = Math.max(0, state.biologicalAge - 0.02);
    log("Nutrition improved metabolism, immune resilience, and repair.");
  }

  if (type === "meditation") {
    state.stressLoad = clamp(state.stressLoad - 8);
    state.inflammation = clamp(state.inflammation - 2);
    state.systems.brain = clamp(state.systems.brain + 3);
    state.biologicalAge = Math.max(0, state.biologicalAge - 0.01);
    log("Meditation reduced stress load and improved neurological balance.");
  }

  if (type === "therapy") {
    state.damage = clamp(state.damage - 6);
    state.repair = clamp(state.repair + 8);
    state.biologicalAge = Math.max(0, state.biologicalAge - 0.15);
    state.systems.recovery = clamp(state.systems.recovery + 5);
    state.systems.immune = clamp(state.systems.immune + 4);
    log("Repair therapy reduced damage and improved biological age trajectory.");
  }

  if (type === "stress") {
    state.stressLoad = clamp(state.stressLoad + 10);
    state.inflammation = clamp(state.inflammation + 6);
    state.vitality = clamp(state.vitality - 4);
    state.systems.brain = clamp(state.systems.brain - 4);
    state.systems.heart = clamp(state.systems.heart - 3);
    state.systems.recovery = clamp(state.systems.recovery - 5);
    state.biologicalAge += 0.05;
    log("Stress event increased inflammatory burden and reduced resilience.");
  }

  if (type === "age") {
    state.day += 30;
    state.chronologicalAge += 30 / 365;
    state.biologicalAge += 0.12;
    state.damage = clamp(state.damage + 3);
    state.inflammation = clamp(state.inflammation + 2);
    state.stressLoad = clamp(state.stressLoad + 1);
    state.vitality = clamp(state.vitality - 1);
    state.repair = clamp(state.repair - 1);

    state.systems.brain = clamp(state.systems.brain - 1);
    state.systems.heart = clamp(state.systems.heart - 1);
    state.systems.metabolism = clamp(state.systems.metabolism - 1);
    state.systems.immune = clamp(state.systems.immune - 1);
    state.systems.mobility = clamp(state.systems.mobility - 1);
    state.systems.recovery = clamp(state.systems.recovery - 2);

    log("30 days passed. Background aging increased wear across the twin.");
    updateChart();
  }

  if (type === "reset") {
    state = createInitialState();
    document.getElementById("log").innerHTML = "";
    resetChart();
    log("Digital Twin reset to baseline.");
  }

  render();
}

render();
initChart();
log("Digital Twin initialized.");