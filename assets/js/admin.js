document.addEventListener("DOMContentLoaded", () => {
  const app = window.CareerAIApp;
  const user = app.getCurrentUser();
  const gate = document.getElementById("adminAccessGate");
  const content = document.getElementById("adminContent");

  if (!user || user.role !== "admin") {
    gate.innerHTML = `
      <div class="access-card">
        <span class="tag">Admin access</span>
        <h3>Demo admin mode is available</h3>
        <p>This static website uses local storage, so you can open the admin panel instantly with the built-in demo admin account.</p>
        <div class="button-row">
          <button class="btn btn-primary" id="activateAdminDemo">Enter Demo Admin</button>
          <a class="btn btn-secondary" href="login.html">Login Manually</a>
        </div>
      </div>
    `;

    document.getElementById("activateAdminDemo").addEventListener("click", () => {
      app.seedDemoLogin("admin");
      app.showToast("Demo admin session activated.", "success");
      window.location.reload();
    });
    content.innerHTML = "";
    return;
  }

  gate.innerHTML = "";
  const state = app.loadState();
  const metrics = app.getPlatformMetrics();

  document.getElementById("adminUsers").textContent = metrics.totalUsers;
  document.getElementById("adminPredictions").textContent = metrics.predictions;
  document.getElementById("adminQuiz").textContent = metrics.quizResults;
  document.getElementById("adminMessages").textContent = metrics.messages;

  app.createLineChart(
    document.getElementById("adminActivityChart"),
    {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [3, 5, 6, 9, 7, 11, 10]
    },
    { accent: "#8dfca9", area: "rgba(141, 252, 169, 0.12)" }
  );

  app.createBarChart(document.getElementById("adminRoleChart"), [
    { label: "Users", value: state.users.filter((item) => item.role === "user").length },
    { label: "Admins", value: state.users.filter((item) => item.role === "admin").length },
    { label: "Predict", value: state.predictorHistory.length },
    { label: "Resume", value: state.resumeReports.length }
  ]);

  app.createDonutChart(
    document.getElementById("adminFeatureChart"),
    [
      { label: "Career", value: state.predictorHistory.length || 2 },
      { label: "Quiz", value: state.quizResults.length || 2 },
      { label: "Resume", value: state.resumeReports.length || 2 },
      { label: "Chat", value: state.chatLogs.length || 2 }
    ],
    { label: "usage" }
  );

  const usersTable = document.getElementById("recentUsers");
  usersTable.innerHTML = state.users
    .slice()
    .reverse()
    .slice(0, 6)
    .map(
      (entry) => `
        <div class="table-row">
          <div>
            <strong>${entry.name}</strong>
            <div class="form-help">${entry.email}</div>
          </div>
          <span class="badge ${entry.role === "admin" ? "warning" : "primary"}">${entry.role}</span>
        </div>
      `
    )
    .join("");

  const eventsTable = document.getElementById("platformEvents");
  const events = [
    ...state.predictorHistory.map((entry) => ({
      label: `Prediction generated for ${entry.name}`,
      date: entry.createdAt
    })),
    ...state.quizResults.map((entry) => ({
      label: `Skill quiz completed: ${entry.topTrack}`,
      date: entry.createdAt
    })),
    ...state.resumeReports.map((entry) => ({
      label: `Resume optimized for ${entry.targetRole}`,
      date: entry.createdAt
    }))
  ].sort((left, right) => new Date(right.date) - new Date(left.date));

  eventsTable.innerHTML = events
    .slice(0, 8)
    .map(
      (entry) => `
        <div class="table-row">
          <div>
            <strong>${entry.label}</strong>
            <div class="form-help">${app.formatDate(entry.date)}</div>
          </div>
          <span class="badge success">Logged</span>
        </div>
      `
    )
    .join("");

  document.getElementById("downloadAdminReport").addEventListener("click", () => {
    app.downloadFile("admin-platform-report.json", JSON.stringify(state, null, 2), "application/json");
    app.showToast("Admin report downloaded.", "success");
  });

  document.getElementById("sendBroadcast").addEventListener("click", () => {
    app.showToast("Broadcast simulated for all active users.", "success");
  });
});
