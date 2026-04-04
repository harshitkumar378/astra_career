(function () {
  const STORAGE_KEY = "careerAIState";
  const faces = ["^_^", "(o_o)", "(^.^)", "(>_<)", "(uwu)", "(='.'=)", "(^o^)", "(._.)"];

  const seedState = {
    users: [
      {
        id: "admin-1",
        name: "Astra Admin",
        email: "admin@futurepath.ai",
        password: "Admin@123",
        role: "admin",
        createdAt: "2026-03-21T08:30:00.000Z"
      },
      {
        id: "demo-user-1",
        name: "Riya Kapoor",
        email: "demo@futurepath.ai",
        password: "Demo@123",
        role: "user",
        createdAt: "2026-03-24T09:15:00.000Z"
      }
    ],
    currentUserId: null,
    predictorHistory: [
      {
        id: "pred-1",
        userId: "demo-user-1",
        name: "Riya Kapoor",
        topCareer: "AI Product Manager",
        confidence: 91,
        scores: [
          { label: "AI Product Manager", value: 91 },
          { label: "UX Research Analyst", value: 84 },
          { label: "Data Storytelling Lead", value: 80 }
        ],
        createdAt: "2026-03-25T11:00:00.000Z"
      },
      {
        id: "pred-2",
        userId: "demo-user-1",
        name: "Riya Kapoor",
        topCareer: "ML Engineer",
        confidence: 88,
        scores: [
          { label: "ML Engineer", value: 88 },
          { label: "Data Scientist", value: 81 },
          { label: "Cloud Automation Engineer", value: 78 }
        ],
        createdAt: "2026-03-31T15:45:00.000Z"
      }
    ],
    quizResults: [
      {
        id: "quiz-1",
        userId: "demo-user-1",
        score: 83,
        topTrack: "Analytical Builder",
        breakdown: [
          { label: "Analysis", value: 84 },
          { label: "Creativity", value: 67 },
          { label: "Leadership", value: 71 },
          { label: "Execution", value: 82 }
        ],
        createdAt: "2026-03-28T14:00:00.000Z"
      }
    ],
    resumeReports: [
      {
        id: "resume-1",
        userId: "demo-user-1",
        targetRole: "Product Analyst",
        score: 86,
        summary: "Data-informed analyst with a strong record of turning user behavior into product decisions.",
        createdAt: "2026-03-30T10:20:00.000Z"
      }
    ],
    chatLogs: [
      {
        id: "chat-1",
        userId: "demo-user-1",
        role: "bot",
        text: "Welcome back, Riya. Your strongest lane right now is AI product leadership plus analytics.",
        createdAt: "2026-03-30T10:30:00.000Z"
      }
    ],
    messages: [
      {
        id: "msg-1",
        name: "Anika",
        email: "anika@example.com",
        interest: "Resume review",
        createdAt: "2026-03-29T12:00:00.000Z"
      }
    ]
  };

  function cloneSeed() {
    return JSON.parse(JSON.stringify(seedState));
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const state = cloneSeed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    }

    try {
      const parsed = JSON.parse(raw);
      return {
        ...cloneSeed(),
        ...parsed,
        users: Array.isArray(parsed.users) && parsed.users.length ? parsed.users : cloneSeed().users,
        predictorHistory: Array.isArray(parsed.predictorHistory) ? parsed.predictorHistory : [],
        quizResults: Array.isArray(parsed.quizResults) ? parsed.quizResults : [],
        resumeReports: Array.isArray(parsed.resumeReports) ? parsed.resumeReports : [],
        chatLogs: Array.isArray(parsed.chatLogs) ? parsed.chatLogs : [],
        messages: Array.isArray(parsed.messages) ? parsed.messages : []
      };
    } catch (error) {
      const state = cloneSeed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function updateState(updater) {
    const state = loadState();
    const nextState = typeof updater === "function" ? updater(state) : state;
    saveState(nextState);
    return nextState;
  }

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function getCurrentUser() {
    const state = loadState();
    return state.users.find((user) => user.id === state.currentUserId) || null;
  }

  function registerUser({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    let createdUser = null;

    updateState((state) => {
      const exists = state.users.some((user) => user.email.toLowerCase() === normalizedEmail);
      if (exists) {
        throw new Error("An account with this email already exists.");
      }

      createdUser = {
        id: uid("user"),
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: "user",
        createdAt: new Date().toISOString()
      };

      return {
        ...state,
        currentUserId: createdUser.id,
        users: [...state.users, createdUser]
      };
    });

    return createdUser;
  }

  function loginUser({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    let matchedUser = null;

    updateState((state) => {
      matchedUser = state.users.find(
        (user) => user.email.toLowerCase() === normalizedEmail && user.password === password
      );

      if (!matchedUser) {
        throw new Error("Invalid email or password.");
      }

      return {
        ...state,
        currentUserId: matchedUser.id
      };
    });

    return matchedUser;
  }

  function logoutUser() {
    updateState((state) => ({
      ...state,
      currentUserId: null
    }));
  }

  function addRecord(key, record) {
    updateState((state) => ({
      ...state,
      [key]: [record, ...(state[key] || [])]
    }));
  }

  function showToast(message, type = "info") {
    const root = document.querySelector(".toast-root");
    if (!root) {
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    root.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px)";
    }, 2600);

    window.setTimeout(() => {
      toast.remove();
    }, 3200);
  }

  function formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch (error) {
      return dateString;
    }
  }

  function ensureShell() {
    document.body.classList.add("site-shell");

    if (!document.querySelector(".scroll-progress")) {
      const progress = document.createElement("div");
      progress.className = "scroll-progress";
      document.body.appendChild(progress);
    }

    if (!document.querySelector(".toast-root")) {
      const root = document.createElement("div");
      root.className = "toast-root";
      document.body.appendChild(root);
    }

    if (!document.querySelector(".background-canvas")) {
      const canvas = document.createElement("canvas");
      canvas.className = "background-canvas";
      canvas.setAttribute("aria-hidden", "true");
      document.body.prepend(canvas);
    }

    if (!document.querySelector(".chatbot-launcher")) {
      const launcher = document.createElement("div");
      launcher.className = "chatbot-launcher";
      launcher.innerHTML = `
        <div class="chatbot-panel-float">
          <span class="tag">Astra Live Guide</span>
          <h4>Quick AI actions</h4>
          <p>Jump into your next step, talk with voice, or review your dashboard.</p>
          <div class="floating-links">
            <a class="btn btn-primary btn-block" href="voice-chatbot.html">Open Voice Chatbot</a>
            <a class="btn btn-secondary btn-block" href="career-predictor.html">Predict My Career</a>
            <a class="btn btn-secondary btn-block" href="dashboard.html">Go To Dashboard</a>
          </div>
        </div>
        <button class="chatbot-orb" type="button" aria-label="Open quick AI assistant">
          <span class="chatbot-face">${faces[0]}</span>
        </button>
      `;
      document.body.appendChild(launcher);
    }
  }

  function initScrollProgress() {
    const progress = document.querySelector(".scroll-progress");
    if (!progress) {
      return;
    }

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const width = height <= 0 ? 0 : (scrollTop / height) * 100;
      progress.style.width = `${Math.max(0, Math.min(100, width))}%`;
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  function initAnimatedBackground() {
    const canvas = document.querySelector(".background-canvas");
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    const particles = [];
    const pointer = { x: 0, y: 0, active: false };

    function resize() {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    }

    function createParticles() {
      particles.length = 0;
      const count = Math.max(42, Math.min(88, Math.floor(window.innerWidth / 18)));
      for (let index = 0; index < count; index += 1) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 2.2 + 1
        });
      }
    }

    function step() {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const gradient = context.createRadialGradient(
        window.innerWidth * 0.5,
        window.innerHeight * 0.5,
        10,
        window.innerWidth * 0.5,
        window.innerHeight * 0.5,
        window.innerWidth * 0.7
      );
      gradient.addColorStop(0, "rgba(60,163,255,0.06)");
      gradient.addColorStop(1, "rgba(6,8,22,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -40) particle.x = window.innerWidth + 40;
        if (particle.x > window.innerWidth + 40) particle.x = -40;
        if (particle.y < -40) particle.y = window.innerHeight + 40;
        if (particle.y > window.innerHeight + 40) particle.y = -40;

        if (pointer.active) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          if (distance < 140) {
            particle.x -= (dx / distance) * 0.35;
            particle.y -= (dy / distance) * 0.35;
          }
        }

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = "rgba(173, 209, 255, 0.72)";
        context.fill();

        for (let inner = index + 1; inner < particles.length; inner += 1) {
          const other = particles[inner];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 110) {
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.strokeStyle = `rgba(110, 231, 249, ${0.12 - distance / 1000})`;
            context.lineWidth = 1;
            context.stroke();
          }
        }
      });

      window.requestAnimationFrame(step);
    }

    resize();
    createParticles();
    step();

    window.addEventListener("resize", () => {
      resize();
      createParticles();
    });

    window.addEventListener("pointermove", (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    });

    window.addEventListener("pointerleave", () => {
      pointer.active = false;
    });
  }

  function initReveal() {
    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    elements.forEach((element) => observer.observe(element));
  }

  function initCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) {
      return;
    }

    const animateCounter = (element) => {
      const target = Number(element.dataset.count || 0);
      const suffix = element.dataset.suffix || "";
      const start = performance.now();
      const duration = 1200;

      function frame(now) {
        const progress = Math.min(1, (now - start) / duration);
        const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        element.textContent = `${value}${suffix}`;
        if (progress < 1) {
          requestAnimationFrame(frame);
        }
      }

      requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function initFAQ() {
    document.querySelectorAll(".faq-item").forEach((item) => {
      const button = item.querySelector(".faq-toggle");
      if (!button) {
        return;
      }

      button.addEventListener("click", () => {
        item.classList.toggle("open");
      });
    });
  }

  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", () => {
      document.body.classList.toggle("nav-open");
    });

    document.querySelectorAll(".nav-links a, .nav-actions a").forEach((link) => {
      link.addEventListener("click", () => document.body.classList.remove("nav-open"));
    });
  }

  function initFloatingChatbot() {
    const launcher = document.querySelector(".chatbot-launcher");
    if (!launcher) {
      return;
    }

    const button = launcher.querySelector(".chatbot-orb");
    const face = launcher.querySelector(".chatbot-face");
    let faceIndex = 0;

    window.setInterval(() => {
      faceIndex = (faceIndex + 1) % faces.length;
      if (face) {
        face.textContent = faces[faceIndex];
      }
    }, 2200);

    button.addEventListener("click", () => {
      launcher.classList.toggle("open");
    });

    document.addEventListener("click", (event) => {
      if (!launcher.contains(event.target)) {
        launcher.classList.remove("open");
      }
    });
  }

  function initAuthUI() {
    const user = getCurrentUser();
    const authLink = document.querySelector("[data-auth-link]");
    const authCta = document.querySelector("[data-auth-cta]");
    const currentUserName = document.querySelectorAll("[data-current-user]");

    currentUserName.forEach((element) => {
      element.textContent = user ? user.name.split(" ")[0] : "Guest";
    });

    if (authLink) {
      if (user) {
        authLink.textContent = "Log Out";
        authLink.setAttribute("href", "#");
        authLink.addEventListener("click", (event) => {
          event.preventDefault();
          logoutUser();
          showToast("You are logged out.", "success");
          window.location.href = "index.html";
        });
      } else {
        authLink.textContent = "Login";
        authLink.setAttribute("href", "login.html");
      }
    }

    if (authCta) {
      if (user) {
        authCta.textContent = user.role === "admin" ? "Admin Panel" : "Dashboard";
        authCta.setAttribute("href", user.role === "admin" ? "admin.html" : "dashboard.html");
      } else {
        authCta.textContent = "Start Free";
        authCta.setAttribute("href", "signup.html");
      }
    }
  }

  function requireAuth(options) {
    const user = getCurrentUser();
    if (!user) {
      showToast("Please log in to access this page.", "error");
      window.setTimeout(() => {
        window.location.href = "login.html";
      }, 900);
      return null;
    }

    if (options && options.admin && user.role !== "admin") {
      return null;
    }

    return user;
  }

  function attachScrollLinks() {
    document.querySelectorAll("[data-scroll-target]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const target = document.querySelector(button.dataset.scrollTarget);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function attachTilt() {
    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        const rotateY = ((x / bounds.width) - 0.5) * 8;
        const rotateX = (0.5 - y / bounds.height) * 8;
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  function getPersonalRecords(key, userId) {
    const state = loadState();
    return (state[key] || []).filter((entry) => entry.userId === userId);
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type: type || "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function computeDashboardMetrics(userId) {
    const state = loadState();
    const userPredictions = state.predictorHistory.filter((item) => item.userId === userId);
    const userQuiz = state.quizResults.filter((item) => item.userId === userId);
    const userResume = state.resumeReports.filter((item) => item.userId === userId);

    return {
      predictions: userPredictions.length,
      readiness: userQuiz[0]?.score || 78,
      resumeScore: userResume[0]?.score || 82,
      focusCareer: userPredictions[0]?.topCareer || "AI Product Manager"
    };
  }

  function getPlatformMetrics() {
    const state = loadState();
    return {
      totalUsers: state.users.length,
      predictions: state.predictorHistory.length,
      quizResults: state.quizResults.length,
      resumes: state.resumeReports.length,
      messages: state.messages.length
    };
  }

  function createLineChart(canvas, points, options) {
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    const { labels, values } = points;
    const accent = options?.accent || "#6ee7f9";
    const area = options?.area || "rgba(110, 231, 249, 0.18)";

    function draw() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      const max = Math.max(...values, 100);
      const padding = 24;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;

      context.strokeStyle = "rgba(255,255,255,0.08)";
      context.lineWidth = 1;
      for (let row = 0; row <= 4; row += 1) {
        const y = padding + (chartHeight / 4) * row;
        context.beginPath();
        context.moveTo(padding, y);
        context.lineTo(width - padding, y);
        context.stroke();
      }

      context.beginPath();
      values.forEach((value, index) => {
        const x = padding + (chartWidth / (values.length - 1 || 1)) * index;
        const y = padding + chartHeight - (value / (max || 1)) * chartHeight;
        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      });

      context.strokeStyle = accent;
      context.lineWidth = 3;
      context.stroke();

      context.lineTo(width - padding, height - padding);
      context.lineTo(padding, height - padding);
      context.closePath();
      context.fillStyle = area;
      context.fill();

      values.forEach((value, index) => {
        const x = padding + (chartWidth / (values.length - 1 || 1)) * index;
        const y = padding + chartHeight - (value / (max || 1)) * chartHeight;
        context.beginPath();
        context.arc(x, y, 4.5, 0, Math.PI * 2);
        context.fillStyle = "#f2fbff";
        context.fill();

        context.fillStyle = "rgba(233,240,255,0.75)";
        context.font = '12px "Plus Jakarta Sans"';
        context.textAlign = "center";
        context.fillText(labels[index], x, height - 8);
      });
    }

    draw();
    window.addEventListener("resize", draw);
  }

  function createBarChart(canvas, entries, options) {
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    const accent = options?.accent || ["#8dfca9", "#6ee7f9", "#3ca3ff", "#a088ff"];

    function draw() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      const padding = 28;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      const max = Math.max(...entries.map((entry) => entry.value), 100);
      const gap = 14;
      const barWidth = chartWidth / entries.length - gap;

      entries.forEach((entry, index) => {
        const x = padding + index * (barWidth + gap) + gap / 2;
        const barHeight = (entry.value / max) * (chartHeight - 18);
        const y = height - padding - barHeight;
        const color = Array.isArray(accent) ? accent[index % accent.length] : accent;

        context.fillStyle = "rgba(255,255,255,0.08)";
        context.fillRect(x, padding, barWidth, chartHeight);
        context.fillStyle = color;
        context.fillRect(x, y, barWidth, barHeight);

        context.fillStyle = "rgba(233,240,255,0.78)";
        context.font = '12px "Plus Jakarta Sans"';
        context.textAlign = "center";
        context.fillText(String(entry.value), x + barWidth / 2, y - 8);
        context.fillText(entry.label, x + barWidth / 2, height - 8);
      });
    }

    draw();
    window.addEventListener("resize", draw);
  }

  function createDonutChart(canvas, entries, options) {
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    const colors = options?.colors || ["#6ee7f9", "#8dfca9", "#a088ff", "#ffd76f"];

    function draw() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      const total = entries.reduce((sum, entry) => sum + entry.value, 0) || 1;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 28;
      const thickness = radius * 0.32;
      let angle = -Math.PI / 2;

      entries.forEach((entry, index) => {
        const slice = (entry.value / total) * Math.PI * 2;
        context.beginPath();
        context.arc(centerX, centerY, radius, angle, angle + slice);
        context.lineWidth = thickness;
        context.strokeStyle = colors[index % colors.length];
        context.stroke();
        angle += slice;
      });

      context.fillStyle = "#eef6ff";
      context.font = '700 30px "Space Grotesk"';
      context.textAlign = "center";
      context.fillText(`${Math.round(total)}`, centerX, centerY + 6);
      context.font = '12px "Plus Jakarta Sans"';
      context.fillStyle = "rgba(233,240,255,0.72)";
      context.fillText(options?.label || "score", centerX, centerY + 26);
    }

    draw();
    window.addEventListener("resize", draw);
  }

  function seedDemoLogin(role) {
    const state = loadState();
    const account =
      role === "admin"
        ? state.users.find((user) => user.role === "admin")
        : state.users.find((user) => user.email === "demo@futurepath.ai");

    if (!account) {
      return;
    }

    updateState((current) => ({
      ...current,
      currentUserId: account.id
    }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureShell();
    initScrollProgress();
    initAnimatedBackground();
    initReveal();
    initCounters();
    initFAQ();
    initNav();
    initFloatingChatbot();
    initAuthUI();
    attachScrollLinks();
    attachTilt();
  });

  window.CareerAIApp = {
    STORAGE_KEY,
    loadState,
    saveState,
    updateState,
    getCurrentUser,
    registerUser,
    loginUser,
    logoutUser,
    requireAuth,
    addRecord,
    showToast,
    formatDate,
    uid,
    getPersonalRecords,
    computeDashboardMetrics,
    getPlatformMetrics,
    createLineChart,
    createBarChart,
    createDonutChart,
    downloadFile,
    seedDemoLogin
  };
})();
