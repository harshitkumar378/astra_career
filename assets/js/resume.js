document.addEventListener("DOMContentLoaded", () => {
  const app = window.CareerAIApp;
  const form = document.getElementById("resumeForm");
  const output = document.getElementById("resumeOutput");
  const copyButton = document.getElementById("copyResumeSummary");
  const downloadButton = document.getElementById("downloadResumePlan");
  let latestReport = null;

  const templates = {
    "data-scientist": {
      targetRole: "Data Scientist",
      experienceLevel: "mid",
      topSkills: "Python, SQL, statistics, machine learning, experimentation",
      achievements: "Built a churn model that improved retention by 11%, created KPI dashboards, automated weekly reports",
      tools: "Pandas, scikit-learn, Power BI, Git, BigQuery",
      tone: "impact"
    },
    "product-manager": {
      targetRole: "AI Product Manager",
      experienceLevel: "mid",
      topSkills: "roadmapping, analytics, cross-functional leadership, experimentation, user research",
      achievements: "Led AI onboarding improvements, reduced drop-off by 18%, launched two customer-facing features",
      tools: "Mixpanel, Notion, Jira, Figma, SQL",
      tone: "leadership"
    },
    "ux-research": {
      targetRole: "UX Research Analyst",
      experienceLevel: "junior",
      topSkills: "user interviews, synthesis, journey mapping, insight communication, usability testing",
      achievements: "Ran 20 interviews, surfaced checkout friction, helped improve task success by 22%",
      tools: "Maze, FigJam, Dovetail, Figma, Sheets",
      tone: "story"
    }
  };

  function scoreResume(values) {
    let score = 64;
    if (values.topSkills.split(",").length >= 5) score += 8;
    if (values.achievements.length > 80) score += 8;
    if (values.tools.split(",").length >= 4) score += 6;
    if (values.targetRole.length > 4) score += 6;
    if (values.experienceLevel) score += 4;
    return Math.min(score, 96);
  }

  function buildReport(values) {
    const skills = values.topSkills.split(",").map((item) => item.trim()).filter(Boolean);
    const tools = values.tools.split(",").map((item) => item.trim()).filter(Boolean);
    const score = scoreResume(values);
    const summary = `${values.targetRole} candidate with ${values.experienceLevel} experience, blending ${skills
      .slice(0, 3)
      .join(", ")} to deliver measurable outcomes.`;
    const bullets = [
      `Highlight quantified wins from: ${values.achievements}.`,
      `Mirror the language of ${values.targetRole} job descriptions using keywords like ${skills.slice(0, 4).join(", ")}.`,
      `Keep your tools section compact with ${tools.slice(0, 4).join(", ")} near the top third of the resume.`
    ];
    const sectionOrder = ["Headline + Summary", "Core Skills", "Impact Experience", "Selected Projects", "Tools + Certifications"];

    return {
      score,
      summary,
      bullets,
      sectionOrder,
      keywords: [...skills.slice(0, 5), ...tools.slice(0, 3)]
    };
  }

  function renderReport(report, values) {
    output.innerHTML = `
      <div class="resume-card">
        <div class="help-row">
          <span class="tag">ATS readiness</span>
          <span class="confidence-badge">${report.score}%</span>
        </div>
        <h3>${values.targetRole} Resume Direction</h3>
        <p>${report.summary}</p>
        <div class="progress-bar"><span style="width:${report.score}%"></span></div>
        <h4>Section order</h4>
        <ul class="resume-output">
          ${report.sectionOrder.map((item) => `<li>${item}</li>`).join("")}
        </ul>
        <h4>Improvement suggestions</h4>
        <ul class="resume-output">
          ${report.bullets.map((item) => `<li>${item}</li>`).join("")}
        </ul>
        <h4>Priority keywords</h4>
        <div class="chip-list">
          ${report.keywords.map((item) => `<span class="pill">${item}</span>`).join("")}
        </div>
      </div>
    `;
  }

  document.querySelectorAll("[data-template]").forEach((button) => {
    button.addEventListener("click", () => {
      const template = templates[button.dataset.template];
      Object.entries(template).forEach(([key, value]) => {
        form.elements[key].value = value;
      });
      app.showToast("Sample resume profile loaded.", "success");
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = {
      targetRole: form.targetRole.value.trim(),
      experienceLevel: form.experienceLevel.value,
      topSkills: form.topSkills.value.trim(),
      achievements: form.achievements.value.trim(),
      tools: form.tools.value.trim(),
      tone: form.tone.value
    };

    const report = buildReport(values);
    latestReport = { ...report, ...values };
    renderReport(report, values);

    const user = app.getCurrentUser();
    app.addRecord("resumeReports", {
      id: app.uid("resume"),
      userId: user?.id || "guest",
      targetRole: values.targetRole,
      score: report.score,
      summary: report.summary,
      createdAt: new Date().toISOString()
    });

    app.showToast("Resume suggestions generated.", "success");
  });

  copyButton.addEventListener("click", async () => {
    if (!latestReport) {
      app.showToast("Generate resume guidance first.", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(latestReport.summary);
      app.showToast("Summary copied to clipboard.", "success");
    } catch (error) {
      app.showToast("Clipboard access is not available.", "error");
    }
  });

  downloadButton.addEventListener("click", () => {
    if (!latestReport) {
      app.showToast("Generate resume guidance first.", "error");
      return;
    }

    const report = `Target Role: ${latestReport.targetRole}\nATS Score: ${latestReport.score}%\nSummary: ${latestReport.summary}\n\nSection Order:\n- ${latestReport.sectionOrder.join("\n- ")}\n\nSuggestions:\n- ${latestReport.bullets.join("\n- ")}`;
    app.downloadFile("resume-guidance-plan.txt", report, "text/plain");
    app.showToast("Resume plan downloaded.", "success");
  });
});
