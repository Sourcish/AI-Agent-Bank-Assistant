// app.js for Premier Bank site — modal + chat panel integration

(() => {
  // ---------------- Config ----------------
  const CHAT = {
    serviceName: "Premier Bank Assistant",
    apiEndpoint: "/api/chat", // Replace with your Cloud Run URL when ready
    enableTypingDelay: true
  };

  // ---------------- Helpers ----------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // ---------------- Nav toggle + counters (optional niceties) ----------------
  on($("#navToggle"), "click", () => $("#navMenu")?.classList.toggle("open"));

  const counters = Array.from(document.querySelectorAll("[data-count]"));
  const animateCounters = () => {
    counters.forEach(el => {
      const target = parseInt(el.getAttribute("data-count"), 10) || 0;
      const duration = 1200;
      const start = performance.now();
      const step = (t) => {
        const p = Math.min((t - start) / duration, 1);
        el.textContent = Math.floor(target * p).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };
  on(window, "load", animateCounters);

  // ---------------- Modal wiring ----------------
  const chatButton = $("#chatButton");
  const chatModal  = $("#chatModal");
  const closeModal = $("#closeModal");
  const chatAgentBtn = $("#chatAgentBtn");

  function openModal() {
    chatModal?.classList.remove("hidden");
    chatModal?.setAttribute("aria-hidden", "false");
  }
  function hideModal() {
    chatModal?.classList.add("hidden");
    chatModal?.setAttribute("aria-hidden", "true");
  }

  on(chatButton, "click", openModal);
  on(closeModal, "click", hideModal);
  on(chatModal, "click", (e) => {
    if (e.target === chatModal) hideModal();
  });

  // ---------------- Chat panel ----------------
  function ensureChatPanel() {
    let panel = $("#chat-panel");
    if (panel) return panel;

    panel = document.createElement("div");
    panel.id = "chat-panel";
    panel.innerHTML = `
      <div class="chat-shell">
        <div class="chat-header">
          <div class="left">
            <span class="title">${CHAT.serviceName}</span>
            <span class="sub">Available 24/7</span>
          </div>
          <div class="right">
            <button id="chatMinBtn" aria-label="Minimize" title="Minimize">—</button>
            <button id="chatCloseBtn" aria-label="Close" title="Close">✕</button>
          </div>
        </div>
        <div id="chatMessages" class="chat-messages" aria-live="polite"></div>
        <form id="chatForm" class="chat-form" autocomplete="off">
          <input id="chatInput" type="text" placeholder="Type a message..." aria-label="Message input" />
          <button type="submit" class="send">Send</button>
        </form>
      </div>
    `;
    document.body.appendChild(panel);

    injectChatStyles();

    on($("#chatCloseBtn", panel), "click", () => panel.style.display = "none");
    on($("#chatMinBtn", panel), "click", () => panel.classList.toggle("min"));
    on($("#chatForm", panel), "submit", handleSubmit);

    // Greeting
    appendMsg("bot", "Hi! I can help with Home Loans, Car Loans, and Loan Eligibility. What would you like to do?");
    return panel;
  }

  function injectChatStyles() {
    if ($("#chat-panel-styles")) return;
    const css = document.createElement("style");
    css.id = "chat-panel-styles";
    css.textContent = `
      #chat-panel{position:fixed; right:16px; bottom:16px; width:360px; max-width:92vw; height:520px; background:#0f172a; color:#e5e7eb;
        border-radius:14px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,.35); display:none; z-index:9999;}
      #chat-panel.min{height:56px;}
      .chat-shell{display:flex; flex-direction:column; height:100%;}
      .chat-header{display:flex; justify-content:space-between; align-items:center; padding:.8rem 1rem; background:#111827; border-bottom:1px solid rgba(255,255,255,.08);}
      .chat-header .title{font-weight:700; margin-right:.5rem;}
      .chat-header .sub{font-size:.85rem; color:#9ca3af;}
      .chat-header .right button{background:transparent; border:none; color:#e5e7eb; font-size:1rem; margin-left:.25rem; cursor:pointer;}
      .chat-messages{flex:1; padding:1rem; overflow:auto; background:#0b1220;}
      .chat-form{display:flex; gap:.5rem; padding:.75rem; background:#0b1220; border-top:1px solid rgba(255,255,255,.08);}
      .chat-form input{flex:1; padding:.65rem .8rem; border-radius:10px; border:1px solid rgba(255,255,255,.08); background:#0f172a; color:#e5e7eb;}
      .chat-form .send{padding:.65rem .9rem; border-radius:10px; border:none; background:#2563eb; color:#fff; font-weight:600;}
      .msg{max-width:85%; margin:.25rem 0; padding:.55rem .7rem; border-radius:10px; line-height:1.35; white-space:pre-wrap;}
      .msg.user{margin-left:auto; background:#1f2937;}
      .msg.bot{margin-right:auto; background:#111827;}
      .msg.status{margin:.25rem auto; font-size:.85rem; color:#9ca3af; background:transparent;}
    `;
    document.head.appendChild(css);
  }

  function showChat() {
    const p = ensureChatPanel();
    p.style.display = "block";
    p.classList.remove("min");
    setTimeout(()=>$("#chatInput")?.focus(), 40);
  }

  function appendMsg(role, text) {
    const box = $("#chatMessages");
    if (!box) return;
    const m = document.createElement("div");
    m.className = role === "status" ? "msg status" : `msg ${role}`;
    m.textContent = text;
    box.appendChild(m);
    box.scrollTop = box.scrollHeight;
  }

  function setTyping(active) {
    const id = "typing-dot";
    const box = $("#chatMessages");
    if (!box) return;
    let el = $("#"+id);
    if (active) {
      if (el) return;
      el = document.createElement("div");
      el.id = id;
      el.className = "msg bot";
      el.textContent = "Typing…";
      box.appendChild(el);
      box.scrollTop = box.scrollHeight;
    } else {
      el && el.remove();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const input = $("#chatInput");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    appendMsg("user", text);
    try {
      if (CHAT.enableTypingDelay) setTyping(true);
      const reply = await sendToBackend(text);
      setTyping(false);
      appendMsg("bot", reply);
    } catch (err) {
      setTyping(false);
      appendMsg("bot", "Sorry, something went wrong. Please try again.");
      console.error(err);
    }
  }

  async function sendToBackend(message) {
    // If you haven’t set a real endpoint yet, return a helpful stub.
    if (!CHAT.apiEndpoint || CHAT.apiEndpoint === "/api/chat") {
      await sleep(400);
      const s = message.toLowerCase();
      if (/(home|house|mortgage)/.test(s)) {
        return "Please share purchase price, down payment, city, and tenure (months). I’ll estimate loan amount, LTV, and EMI.";
      }
      if (/(car|auto)/.test(s)) {
        return "Please share on‑road price, down payment, registration state, and tenure (months). I’ll estimate loan amount, LTV, and EMI.";
      }
      if (/(eligible|eligibility|qualif)/.test(s)) {
        return "Share monthly income, total existing EMIs, and tenure. I’ll estimate max eligible EMI and loan amount.";
      }
      return "I can help with Home Loans, Car Loans, and Loan Eligibility. What would you like to do?";
    }
    const res = await fetch(CHAT.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, context: { page: location.pathname, ts: Date.now() } })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.reply || "Okay.";
  }

  // ---------------- Wire the “Chat with an Agent” CTA ----------------
  on(chatAgentBtn, "click", () => {
    // Close the modal and open the right-docked chat
    hideModal();
    showChat();
  });

  // Also allow the floating button to jump straight to chat if desired:
  // on(chatButton, "dblclick", () => showChat());

})();
