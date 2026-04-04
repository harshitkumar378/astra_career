document.addEventListener("DOMContentLoaded", () => {
  const app = window.CareerAIApp;
  const user = app.requireAuth();
  if (!user) {
    return;
  }

  const state = app.loadState();
  const metrics = app.computeDashboardMetrics(user.id);
  const userPredictions = state.predictorHistory.filter((item) => item.userId === user.id);
  const userQuiz = state.quizResults.filter((item) => item.userId === user.id);
  const userResume = state.resumeReports.filter((item) => item.userId === user.id);
  const activityList = document.getElementById("activityList");
  const summaryName = document.querySelector("[data-dashboard-name]");
  const snapshotButton = document.getElementById("downloadSnapshot");

  if (summaryName) {
    summaryName.textContent = user.name.split(" ")[0];
  }

  document.getElementById("metricPredictions").textContent = metrics.predictions;
  document.getElementById("metricReadiness").textContent = `${metrics.readiness}%`;
  document.getElementById("metricResume").textContent = `${metrics.resumeScore}%`;
  document.getElementById("metricCareer").textContent = metrics.focusCareer;

  app.createLineChart(
    document.getElementById("careerGrowthChart"),
    {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      values: [58, 64, 69, 74, 82, metrics.readiness]
    },
    { accent: "#6ee7f9", area: "rgba(110, 231, 249, 0.14)" }
  );

  app.createBarChart(
    document.getElementById("strengthChart"),
    (userQuiz[0]?.breakdown || [
      { label: "Analysis", value: 82 },
      { label: "Creativity", value: 67 },
      { label: "Leadership", value: 71 },
      { label: "Execution", value: 86 }
    ])
  );

  app.createDonutChart(
    document.getElementById("focusChart"),
    [
      { label: "Learning", value: 34 },
      { label: "Projects", value: 28 },
      { label: "Networking", value: 18 },
      { label: "Resume", value: 20 }
    ],
    { label: "focus mix" }
  );

  const combinedActivity = [
    ...userPredictions.map((item) => ({
      title: `Career prediction: ${item.topCareer}`,
      badge: `${item.confidence}%`,
      date: item.createdAt
    })),
    ...userQuiz.map((item) => ({
      title: `Skill test completed: ${item.topTrack}`,
      badge: `${item.score}%`,
      date: item.createdAt
    })),
    ...userResume.map((item) => ({
      title: `Resume lab optimized for ${item.targetRole}`,
      badge: `${item.score}%`,
      date: item.createdAt
    }))
  ].sort((left, right) => new Date(right.date) - new Date(left.date));

  if (combinedActivity.length && activityList) {
    activityList.innerHTML = combinedActivity
      .slice(0, 6)
      .map(
        (item) => `
          <div class="table-row">
            <div>
              <strong>${item.title}</strong>
              <div class="form-help">${app.formatDate(item.date)}</div>
            </div>
            <span class="badge primary">${item.badge}</span>
          </div>
        `
      )
      .join("");
  }

  if (!combinedActivity.length && activityList) {
    activityList.innerHTML = `
      <div class="empty-state">
        <h3>Your dashboard is ready</h3>
        <p>Run a prediction, take the quiz, or build your resume to unlock personalized insights.</p>
      </div>
    `;
  }

  if (snapshotButton) {
    snapshotButton.addEventListener("click", () => {
      const payload = {
        user: { name: user.name, email: user.email, role: user.role },
        metrics,
        recentPrediction: userPredictions[0] || null,
        recentQuiz: userQuiz[0] || null,
        recentResume: userResume[0] || null
      };
      app.downloadFile("career-dashboard-snapshot.json", JSON.stringify(payload, null, 2), "application/json");
      app.showToast("Dashboard snapshot downloaded.", "success");
    });
  }
});
