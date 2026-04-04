document.addEventListener("DOMContentLoaded", () => {
  const app = window.CareerAIApp;
  const state = app.loadState();
  const user = app.getCurrentUser();
  const messages = document.getElementById("chatMessages");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const listenButton = document.getElementById("startListening");
  const voiceToggle = document.getElementById("toggleVoice");
  const avatarFace = document.getElementById("chatHeaderFace");
  const faces = ["^_^", "(o_o)", "(^.^)", "(uwu)", "(='.'=)"];
  let faceIndex = 0;
  let voiceEnabled = true;

  function rotateFace() {
    faceIndex = (faceIndex + 1) % faces.length;
    avatarFace.textContent = faces[faceIndex];
  }

  function addMessage(role, text, save) {
    const bubble = document.createElement("div");
    bubble.className = `message ${role}`;
    bubble.innerHTML = `<div>${text}</div><small>${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>`;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;

    if (save) {
      app.addRecord("chatLogs", {
        id: app.uid("chat"),
        userId: user?.id || "guest",
        role,
        text,
        createdAt: new Date().toISOString()
      });
    }
  }

  function getLatestPrediction() {
    if (!user) {
      return null;
    }
    return state.predictorHistory.find((item) => item.userId === user.id) || null;
  }

  function speak(text) {
    if (!voiceEnabled || !window.speechSynthesis) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function respond(text) {
    const normalized = text.toLowerCase();
    const prediction = getLatestPrediction();

    if (normalized.includes("resume")) {
      return "Focus on measurable achievements, role-specific keywords, and a compact tools section near the top. The resume lab page can generate a cleaner structure for you.";
    }
    if (normalized.includes("skill") || normalized.includes("quiz")) {
      return "Your next leverage move is to complete the skill quiz, then compare your highest dimensions with roles that reward them. Analytical and execution-heavy profiles often do well in data or AI operations paths.";
    }
    if (normalized.includes("career") || normalized.includes("predict")) {
      return prediction
        ? `Your latest prediction points toward ${prediction.topCareer} at ${prediction.confidence}% confidence. Build one portfolio proof in that direction this week.`
        : "Start with the career prediction form so I can tailor a role path using your goals, strengths, and working style.";
    }
    if (normalized.includes("interview")) {
      return "For interviews, prepare three stories: one problem you solved, one collaboration moment, and one measurable outcome. Frame each with situation, action, and impact.";
    }
    if (normalized.includes("hello") || normalized.includes("hi")) {
      return `Hello${user ? `, ${user.name.split(" ")[0]}` : ""}. Ask me about career paths, resume upgrades, interview prep, or your dashboard trends.`;
    }
    return "I can help you choose a direction, improve your resume, decode quiz results, or plan a 30-day growth roadmap. Tell me what you want to improve first.";
  }

  const initialMessages = state.chatLogs
    .filter((entry) => !user || entry.userId === user.id)
    .slice(0, 6)
    .reverse();

  if (initialMessages.length) {
    initialMessages.forEach((entry) => addMessage(entry.role, entry.text, false));
  } else {
    addMessage("bot", "I am Astra, your voice-ready career guide. Ask about roadmaps, resumes, or the right next role.", false);
  }

  document.querySelectorAll(".suggestion-chip").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.textContent.trim();
      form.requestSubmit();
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      return;
    }

    addMessage("user", text, true);
    input.value = "";
    window.setTimeout(() => {
      const reply = respond(text);
      addMessage("bot", reply, true);
      speak(reply);
    }, 420);
  });

  voiceToggle.addEventListener("click", () => {
    voiceEnabled = !voiceEnabled;
    voiceToggle.textContent = voiceEnabled ? "Voice On" : "Voice Off";
    app.showToast(voiceEnabled ? "Voice replies enabled." : "Voice replies muted.", "success");
  });

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    listenButton.disabled = true;
    listenButton.textContent = "Voice Unavailable";
  } else {
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    listenButton.addEventListener("click", () => {
      recognition.start();
      app.showToast("Listening...", "success");
    });

    recognition.addEventListener("result", (event) => {
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
      form.requestSubmit();
    });

    recognition.addEventListener("error", () => {
      app.showToast("Voice input could not start.", "error");
    });
  }

  window.setInterval(rotateFace, 2200);
});
