// Mock traffic data
function getTrafficData() {
  const levels = ["Low", "Moderate", "High"];
  return levels[Math.floor(Math.random() * levels.length)];
}

// Mock music data
function getMusicMood() {
  const moods = ["Chill", "Energetic", "Focus"];
  return moods[Math.floor(Math.random() * moods.length)];
}

// Logic that "weaves" data
function generateRecommendation(traffic, mood) {
  if (traffic === "High") return "Calm / Chill Music 🎧";
  if (traffic === "Moderate") return "Focus Beats 🎼";
  return "Energetic / Happy Music 🔥";
}

function loadDashboard() {
  const traffic = getTrafficData();
  const mood = getMusicMood();
  const recommendation = generateRecommendation(traffic, mood);

  document.getElementById("traffic-status").innerText = traffic;
  document.getElementById("music-mood").innerText = mood;
  document.getElementById("recommendation").innerText = recommendation;
}

// Initial load
loadDashboard();
