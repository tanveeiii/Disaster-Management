const form = document.getElementById("form");
const loader = document.getElementById("loader");

// Page fade-in
window.onload = () => {
  document.body.classList.remove("opacity-0");
};

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // ✅ show loader
  loader.classList.remove("hidden");

  setTimeout(() => {

    const data = generateDummyData();

    // 💾 store data
    localStorage.setItem("resultData", JSON.stringify(data));

    // 🚀 redirect
    window.location.href = "results.html";

  }, 1200);
});


// 🧠 Dummy Data Generator
function generateDummyData() {
  const magnitude = (Math.random() * 3 + 4).toFixed(1);

  let risk = "Low";
  if (magnitude > 6) risk = "High";
  else if (magnitude > 5) risk = "Medium";

  return {
    risk_level: risk,
    magnitude: Number(magnitude),
    affected_radius_km: Math.floor(magnitude * 20),
    recommendation:
      risk === "High"
        ? "Immediate evacuation required."
        : "Stay alert and monitor updates.",
    
    history: [4.2, 5.1, 5.8, 6.2, magnitude],
    sensors: [0.2, 0.4, 0.6, 0.5, 0.7]
  };
}