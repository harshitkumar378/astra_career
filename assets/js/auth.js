document.addEventListener("DOMContentLoaded", () => {
  const app = window.CareerAIApp;
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const passwordMeter = document.querySelector(".password-meter span");
  const passwordInput = document.getElementById("signupPassword");

  function getStrengthScore(value) {
    let score = 0;
    if (value.length >= 8) score += 25;
    if (/[A-Z]/.test(value)) score += 25;
    if (/[0-9]/.test(value)) score += 25;
    if (/[^A-Za-z0-9]/.test(value)) score += 25;
    return score;
  }

  if (passwordInput && passwordMeter) {
    passwordInput.addEventListener("input", () => {
      passwordMeter.style.width = `${getStrengthScore(passwordInput.value)}%`;
    });
  }

  document.querySelectorAll("[data-fill-demo]").forEach((button) => {
    button.addEventListener("click", () => {
      if (loginForm) {
        loginForm.email.value =
          button.dataset.fillDemo === "admin" ? "admin@futurepath.ai" : "demo@futurepath.ai";
        loginForm.password.value = button.dataset.fillDemo === "admin" ? "Admin@123" : "Demo@123";
      }
    });
  });

  if (signupForm) {
    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(signupForm);
      const password = String(formData.get("password") || "");
      const confirmPassword = String(formData.get("confirmPassword") || "");

      if (password !== confirmPassword) {
        app.showToast("Passwords do not match.", "error");
        return;
      }

      if (getStrengthScore(password) < 50) {
        app.showToast("Please choose a stronger password.", "error");
        return;
      }

      try {
        app.registerUser({
          name: String(formData.get("name") || ""),
          email: String(formData.get("email") || ""),
          password
        });
        app.showToast("Account created successfully.", "success");
        window.setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 700);
      } catch (error) {
        app.showToast(error.message, "error");
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      try {
        const user = app.loginUser({
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || "")
        });
        app.showToast(`Welcome back, ${user.name.split(" ")[0]}.`, "success");
        window.setTimeout(() => {
          window.location.href = user.role === "admin" ? "admin.html" : "dashboard.html";
        }, 700);
      } catch (error) {
        app.showToast(error.message, "error");
      }
    });
  }
});
