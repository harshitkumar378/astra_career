document.addEventListener("DOMContentLoaded", () => {
  const app = window.CareerAIApp;
  const container = document.getElementById("quizContainer");
  const form = document.getElementById("quizForm");
  const resultRoot = document.getElementById("quizResult");
  const chartCanvas = document.getElementById("quizChart");
  const progressFill = document.getElementById("quizProgressFill");
  const progressLabel = document.getElementById("quizProgressLabel");
  const downloadButton = document.getElementById("downloadQuizReport");
  let latestResult = null;

  const questions = [
    {
      question: "Which type of work gives you energy?",
      options: [
        { label: "Solving structured problems", values: { analysis: 4, execution: 2 } },
        { label: "Designing engaging experiences", values: { creativity: 4, leadership: 1 } },
        { label: "Leading people toward a goal", values: { leadership: 4, creativity: 1 } },
        { label: "Shipping fast and learning by doing", values: { execution: 4, analysis: 1 } }
      ]
    },
    {
      question: "In a team project, what role feels natural?",
      options: [
        { label: "Researching the smartest path", values: { analysis: 4 } },
        { label: "Facilitating alignment", values: { leadership: 4 } },
        { label: "Crafting the user journey", values: { creativity: 4 } },
        { label: "Driving the final delivery", values: { execution: 4 } }
      ]
    },
    {
      question: "What kind of impact do you want most?",
      options: [
        { label: "Sharper decisions through data", values: { analysis: 4 } },
        { label: "Products people truly enjoy", values: { creativity: 3, leadership: 1 } },
        { label: "Team momentum and clarity", values: { leadership: 4 } },
        { label: "Visible outcomes and launches", values: { execution: 4 } }
      ]
    },
    {
      question: "How do you prefer learning?",
      options: [
        { label: "Deep tutorials and breakdowns", values: { analysis: 3, execution: 1 } },
        { label: "Examples and inspiration boards", values: { creativity: 3 } },
        { label: "Mentors and discussion", values: { leadership: 3 } },
        { label: "Hands-on experiments", values: { execution: 3, creativity: 1 } }
      ]
    },
    {
      question: "Which environment suits you best?",
      options: [
        { label: "Quiet, focused research", values: { analysis: 4 } },
        { label: "Creative brainstorm sessions", values: { creativity: 4 } },
        { label: "Cross-functional planning rooms", values: { leadership: 4 } },
        { label: "Fast-moving launch cycles", values: { execution: 4 } }
      ]
    },
    {
      question: "What do you naturally notice first?",
      options: [
        { label: "Patterns and anomalies", values: { analysis: 4 } },
        { label: "Visual flow and storytelling", values: { creativity: 4 } },
        { label: "People dynamics", values: { leadership: 4 } },
        { label: "Bottlenecks in the process", values: { execution: 4 } }
      ]
    }
  ];

  function renderQuiz() {
    if (!container) {
      return;
    }

    container.innerHTML = questions
      .map(
        (question, questionIndex) => `
          <section class="question-card">
            <h3>Q${questionIndex + 1}. ${question.question}</h3>
            <div class="option-grid">
              ${question.options
                .map(
                  (option, optionIndex) => `
                    <label class="quiz-card">
                      <input type="radio" name="question-${questionIndex}" value="${optionIndex}">
                      <span>${option.label}</span>
                    </label>
                  `
                )
                .join("")}
            </div>
          </section>
        `
      )
      .join("");
  }

  function updateProgress() {
    const answered = questions.filter((_, index) => form.querySelector(`input[name="question-${index}"]:checked`)).length;
    const percent = Math.round((answered / questions.length) * 100);
    progressFill.style.width = `${percent}%`;
    progressLabel.textContent = `${answered}/${questions.length} answered`;
  }

  function summarizeTrack(scores) {
    const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top = entries[0][0];
    const titles = {
      analysis: "Analytical Builder",
      creativity: "Creative Explorer",
      leadership: "Product Visionary",
      execution: "Execution Driver"
    };
    return titles[top];
  }

  renderQuiz();
  updateProgress();

  if (form) {
    form.addEventListener("change", updateProgress);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const scores = { analysis: 0, creativity: 0, leadership: 0, execution: 0 };

      for (let index = 0; index < questions.length; index += 1) {
        const selected = form.querySelector(`input[name="question-${index}"]:checked`);
        if (!selected) {
          app.showToast("Please answer every question.", "error");
          return;
        }

        const optionValues = questions[index].options[Number(selected.value)].values;
        Object.keys(optionValues).forEach((key) => {
          scores[key] += optionValues[key];
        });
      }

      const breakdown = Object.entries(scores).map(([label, value]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value: Math.round((value / 24) * 100)
      }));
      const average = Math.round(breakdown.reduce((sum, item) => sum + item.value, 0) / breakdown.length);
      const topTrack = summarizeTrack(scores);
      latestResult = { topTrack, average, breakdown };

      resultRoot.innerHTML = `
        <div class="result-card">
          <div class="help-row">
            <span class="tag">Your strongest lane</span>
            <span class="confidence-badge">${average}% score</span>
          </div>
          <h3>${topTrack}</h3>
          <p>This profile suggests you perform best when your work blends your top strengths with visible outcomes.</p>
          <div class="progress-list">
            ${breakdown
              .map(
                (item) => `
                  <div class="progress-item">
                    <strong>${item.label}</strong>
                    <div class="mini-progress"><span style="width:${item.value}%"></span></div>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      `;

      app.createBarChart(chartCanvas, breakdown);
      const user = app.getCurrentUser();
      app.addRecord("quizResults", {
        id: app.uid("quiz"),
        userId: user?.id || "guest",
        score: average,
        topTrack,
        breakdown,
        createdAt: new Date().toISOString()
      });
      app.showToast("Skill quiz completed.", "success");
    });
  }

  document.getElementById("autoFillQuiz").addEventListener("click", () => {
    questions.forEach((question, index) => {
      const random = Math.floor(Math.random() * question.options.length);
      form.querySelector(`input[name="question-${index}"][value="${random}"]`).checked = true;
    });
    updateProgress();
    app.showToast("Demo answers selected.", "success");
  });

  document.getElementById("resetQuiz").addEventListener("click", () => {
    form.reset();
    resultRoot.innerHTML = `
      <div class="empty-state">
        <h3>Quiz insights will appear here</h3>
        <p>Complete the quiz to unlock your strongest career behavior pattern.</p>
      </div>
    `;
    updateProgress();
  });

  if (downloadButton) {
    downloadButton.addEventListener("click", () => {
      if (!latestResult) {
        app.showToast("Complete the quiz first.", "error");
        return;
      }
      const output = `Top Track: ${latestResult.topTrack}\nScore: ${latestResult.average}%\n\n${latestResult.breakdown
        .map((item) => `${item.label}: ${item.value}%`)
        .join("\n")}`;
      app.downloadFile("skill-quiz-result.txt", output, "text/plain");
      app.showToast("Quiz report downloaded.", "success");
    });
  }
});
