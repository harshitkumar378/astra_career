document.addEventListener("DOMContentLoaded", () => {
  const app = window.CareerAIApp;
  const form = document.getElementById("predictorForm");
  const resultRoot = document.getElementById("predictionResults");
  const chartCanvas = document.getElementById("predictionChart");
  const demoButton = document.getElementById("loadPredictorDemo");
  const downloadButton = document.getElementById("savePredictionReport");
  let latestPrediction = null;

  const roadmaps = {
    "AI Product Manager": ["Sharpen product thinking", "Build AI feature case studies", "Practice stakeholder storytelling"],
    "ML Engineer": ["Master Python and model deployment", "Ship one end-to-end ML project", "Learn cloud model monitoring"],
    "UX Research Analyst": ["Run user interviews weekly", "Practice insight synthesis", "Build a portfolio of research snapshots"],
    "Cloud Automation Engineer": ["Learn CI/CD pipelines", "Automate one real workflow", "Add DevOps projects to your profile"],
    "Data Scientist": ["Strengthen statistics", "Publish a dashboard project", "Show business impact with data stories"],
    "Digital Marketing Strategist": ["Learn funnel analytics", "Create campaign experiments", "Pair content strategy with reporting"]
  };

  function scoreCareer(values) {
    const interests = values.interests;
    const strengths = values.strengths.toLowerCase();
    const goals = values.goals.toLowerCase();
    const subject = values.favoriteSubject;
    const workStyle = values.workStyle;
    const personality = values.personality;
    const experience = Number(values.experience || 0);

    const careers = [
      { name: "AI Product Manager", score: 58, hints: ["business", "strategy", "lead", "communicat"] },
      { name: "ML Engineer", score: 56, hints: ["code", "logic", "build", "system"] },
      { name: "UX Research Analyst", score: 54, hints: ["design", "empathy", "research", "user"] },
      { name: "Cloud Automation Engineer", score: 53, hints: ["automation", "cloud", "ops", "deploy"] },
      { name: "Data Scientist", score: 55, hints: ["data", "analysis", "pattern", "math"] },
      { name: "Digital Marketing Strategist", score: 52, hints: ["brand", "growth", "content", "campaign"] }
    ];

    careers.forEach((career) => {
      if (interests.includes("ai") && ["AI Product Manager", "ML Engineer"].includes(career.name)) career.score += 14;
      if (interests.includes("data") && ["Data Scientist", "AI Product Manager"].includes(career.name)) career.score += 12;
      if (interests.includes("design") && career.name === "UX Research Analyst") career.score += 16;
      if (interests.includes("business") && career.name === "AI Product Manager") career.score += 14;
      if (interests.includes("cloud") && career.name === "Cloud Automation Engineer") career.score += 16;
      if (interests.includes("marketing") && career.name === "Digital Marketing Strategist") career.score += 16;
      if (subject === "math" && ["ML Engineer", "Data Scientist"].includes(career.name)) career.score += 10;
      if (subject === "economics" && career.name === "AI Product Manager") career.score += 10;
      if (subject === "design" && career.name === "UX Research Analyst") career.score += 10;
      if (workStyle === "deep-work" && ["ML Engineer", "Data Scientist"].includes(career.name)) career.score += 8;
      if (workStyle === "collaboration" && ["AI Product Manager", "UX Research Analyst"].includes(career.name)) career.score += 8;
      if (workStyle === "fast-moving" && ["Digital Marketing Strategist", "AI Product Manager"].includes(career.name)) career.score += 8;
      if (personality === "visionary" && ["AI Product Manager", "Digital Marketing Strategist"].includes(career.name)) career.score += 8;
      if (personality === "analytical" && ["Data Scientist", "ML Engineer"].includes(career.name)) career.score += 8;
      if (personality === "empathetic" && career.name === "UX Research Analyst") career.score += 10;
      if (experience > 2 && ["AI Product Manager", "Cloud Automation Engineer"].includes(career.name)) career.score += 5;

      career.hints.forEach((hint) => {
        if (strengths.includes(hint) || goals.includes(hint)) {
          career.score += 4;
        }
      });

      career.score = Math.min(96, career.score);
    });

    return careers
      .sort((left, right) => right.score - left.score)
      .slice(0, 3)
      .map((career) => ({
        ...career,
        roadmap: roadmaps[career.name]
      }));
  }

  function renderResults(prediction, values) {
    if (!resultRoot) {
      return;
    }

    resultRoot.innerHTML = prediction
      .map(
        (career, index) => `
          <article class="result-card reveal is-visible">
            <div class="help-row">
              <span class="tag">Match ${index + 1}</span>
              <span class="confidence-badge">${career.score}% fit</span>
            </div>
            <h3>${career.name}</h3>
            <p>Based on your interests in ${values.interests.join(", ")}, this path aligns strongly with your working style and strengths.</p>
            <div class="progress-bar"><span style="width:${career.score}%"></span></div>
            <ul class="resume-output">
              ${career.roadmap.map((step) => `<li>${step}</li>`).join("")}
            </ul>
          </article>
        `
      )
      .join("");

    app.createBarChart(
      chartCanvas,
      prediction.map((item) => ({ label: item.name.split(" ")[0], value: item.score }))
    );
  }

  function collectValues() {
    const formData = new FormData(form);
    return {
      name: String(formData.get("name") || ""),
      education: String(formData.get("education") || ""),
      experience: String(formData.get("experience") || "0"),
      personality: String(formData.get("personality") || ""),
      workStyle: String(formData.get("workStyle") || ""),
      favoriteSubject: String(formData.get("favoriteSubject") || ""),
      strengths: String(formData.get("strengths") || ""),
      goals: String(formData.get("goals") || ""),
      interests: formData.getAll("interests").map(String)
    };
  }

  if (demoButton) {
    demoButton.addEventListener("click", () => {
      form.elements["name"].value = "Neha Sharma";
      form.elements["education"].value = "B.Tech Computer Science";
      form.elements["experience"].value = "2";
      form.elements["personality"].value = "analytical";
      form.elements["workStyle"].value = "deep-work";
      form.elements["favoriteSubject"].value = "math";
      form.elements["strengths"].value = "I enjoy coding, systems thinking, automation, and solving logic-heavy problems.";
      form.elements["goals"].value = "I want to build AI tools, deploy real projects, and work on scalable products.";
      document.querySelectorAll('input[name="interests"]').forEach((input) => {
        input.checked = ["ai", "data", "cloud"].includes(input.value);
      });
      app.showToast("Sample profile loaded.", "success");
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = collectValues();
      if (!values.interests.length) {
        app.showToast("Select at least one interest area.", "error");
        return;
      }

      const prediction = scoreCareer(values);
      latestPrediction = prediction;
      renderResults(prediction, values);

      const user = app.getCurrentUser();
      app.addRecord("predictorHistory", {
        id: app.uid("pred"),
        userId: user?.id || "guest",
        name: values.name || user?.name || "Guest User",
        topCareer: prediction[0].name,
        confidence: prediction[0].score,
        scores: prediction.map((item) => ({ label: item.name, value: item.score })),
        createdAt: new Date().toISOString()
      });

      app.showToast("Career prediction generated.", "success");
    });
  }

  if (downloadButton) {
    downloadButton.addEventListener("click", () => {
      if (!latestPrediction) {
        app.showToast("Run the predictor first.", "error");
        return;
      }

      const report = latestPrediction
        .map((item, index) => `${index + 1}. ${item.name} - ${item.score}%\nRoadmap: ${item.roadmap.join(", ")}`)
        .join("\n\n");

      app.downloadFile("career-prediction-report.txt", report, "text/plain");
      app.showToast("Prediction report downloaded.", "success");
    });
  }

  form.addEventListener("reset", () => {
    latestPrediction = null;
    resultRoot.innerHTML = `
      <div class="empty-state">
        <h3>Prediction results appear here</h3>
        <p>Fill the form and generate your role matches to unlock detailed cards and fit scores.</p>
      </div>
    `;
    if (chartCanvas) {
      const context = chartCanvas.getContext("2d");
      context.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    }
  });
});
