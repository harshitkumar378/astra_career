document.addEventListener("DOMContentLoaded", () => {
  const app = window.CareerAIApp;
  const heroTarget = document.getElementById("heroCareerTarget");
  const contactForm = document.getElementById("contactForm");
  const trendChart = document.getElementById("heroTrendChart");
  const roles = [
    "AI Product Manager",
    "ML Engineer",
    "UX Research Analyst",
    "Data Storytelling Lead",
    "Cloud Automation Engineer"
  ];

  if (heroTarget) {
    let index = 0;
    window.setInterval(() => {
      index = (index + 1) % roles.length;
      heroTarget.textContent = roles[index];
    }, 2400);
  }

  document.querySelectorAll("[data-demo-login]").forEach((button) => {
    button.addEventListener("click", () => {
      app.seedDemoLogin(button.dataset.demoLogin);
      app.showToast(
        button.dataset.demoLogin === "admin"
          ? "Demo admin session activated."
          : "Demo user session activated.",
        "success"
      );
      window.location.href = button.dataset.demoLogin === "admin" ? "admin.html" : "dashboard.html";
    });
  });

  if (trendChart) {
    app.createLineChart(
      trendChart,
      {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        values: [62, 68, 72, 79, 86, 90]
      },
      { accent: "#8dfca9", area: "rgba(141, 252, 169, 0.12)" }
    );
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const record = {
        id: app.uid("msg"),
        name: formData.get("name"),
        email: formData.get("email"),
        interest: formData.get("interest"),
        createdAt: new Date().toISOString()
      };
      app.addRecord("messages", record);
      app.showToast("Your consultation request has been saved.", "success");
      contactForm.reset();
    });
  }
});
