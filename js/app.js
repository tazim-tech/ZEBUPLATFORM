// ZEBU AI — Main Application Controller v2 (Agent-First)

const App = {
  currentView: "home",
  currentStock: null,
  chatHistory: [],
  alertCount: 0,
  clockInterval: null,
  _pendingAction: null,       // action waiting for confirm modal
  _sidebarCollapsed: false,
  _navHidden: false,
  _agentFocus: false,
  _agentHidden: false,

  init() {
    this.initTheme();
    this.initNavState();
    this.initAgentState();
    this.initShortcuts();
    this.renderTopbarIndices();
    this.renderTicker();
    this.startClock();
    this.initNavigation();
    this.renderHomeView();
    this.renderStockView();
    this.renderPortfolioView();
    this.renderEventsView();
    this.renderEducationView();
    this.initChat();
    AgentMemory.incrementSession();
    AgentMonitor.start();
    this.navigate("home");
    // Auto-expand textarea
    const ta = document.getElementById("chat-input");
    if (ta) ta.addEventListener("input", () => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 120) + "px"; });
  },

  // ── Navigation & Cockpit Controls ─────────────────────────
  initNavState() {
    const saved = localStorage.getItem("zebu_nav_hidden");
    this._navHidden = saved === "true";
    this.applyNavState(false);
  },

  applyNavState(notify = false) {
    const screenPanel = document.getElementById("screen-panel");
    const sidebar = document.getElementById("sidebar");
    const topBtn = document.getElementById("topbar-nav-toggle");
    const chatBtn = document.getElementById("chat-nav-toggle");

    if (screenPanel) screenPanel.classList.toggle("nav-hidden", this._navHidden);
    if (sidebar) sidebar.classList.toggle("nav-hidden", this._navHidden);

    if (topBtn) {
      topBtn.classList.toggle("nav-is-hidden", this._navHidden);
      const icon = topBtn.querySelector(".nav-toggle-icon");
      const text = topBtn.querySelector(".nav-toggle-text");
      if (icon) icon.textContent = this._navHidden ? "▶" : "◀";
      if (text) text.textContent = this._navHidden ? "Show Nav" : "Hide Nav";
    }

    if (chatBtn) {
      chatBtn.textContent = this._navHidden ? "▶ Nav" : "◀ Nav";
      chatBtn.title = this._navHidden ? "Show Navigation (Alt+N)" : "Hide Navigation (Alt+N)";
    }

    localStorage.setItem("zebu_nav_hidden", this._navHidden);

    if (notify) {
      this.showToast(
        this._navHidden ? "Navigation hidden · All features active from Agent Chat" : "Navigation restored",
        "info-toast"
      );
    }
  },

  toggleNav() {
    this._navHidden = !this._navHidden;
    this.applyNavState(true);
  },

  // ── Agent Panel Visibility Toggle (Hideable Agent in Side) ──
  initAgentState() {
    const saved = localStorage.getItem("zebu_agent_hidden");
    this._agentHidden = saved === "true";
    this.applyAgentState(false);
  },

  applyAgentState(notify = false) {
    const shell = document.getElementById("app-shell");
    const topAiToggle = document.getElementById("topbar-ai-toggle");
    const topBadgeBtn = document.getElementById("topbar-left-agent-btn");
    const chatHideBtn = document.getElementById("chat-hide-ai-btn");

    if (shell) shell.classList.toggle("agent-hidden", this._agentHidden);
    document.body.classList.toggle("agent-hidden", this._agentHidden);

    if (topAiToggle) {
      topAiToggle.classList.toggle("active", !this._agentHidden);
      const icon = topAiToggle.querySelector(".ai-toggle-icon");
      const text = topAiToggle.querySelector(".ai-toggle-text");
      if (icon) icon.textContent = this._agentHidden ? "▶" : "◀";
      if (text) text.textContent = this._agentHidden ? "Show AI" : "Hide AI";
      topAiToggle.title = this._agentHidden ? "Show AI Panel (Alt+A)" : "Hide AI Panel to Side (Alt+A)";
    }

    if (topBadgeBtn) {
      topBadgeBtn.classList.toggle("active", !this._agentHidden);
    }

    if (chatHideBtn) {
      chatHideBtn.textContent = this._agentHidden ? "▶ Show AI" : "◀ Hide AI";
    }

    localStorage.setItem("zebu_agent_hidden", this._agentHidden);

    if (notify) {
      this.showToast(
        this._agentHidden ? "AI panel hidden to side · Press Alt+A to restore" : "ZEBU AI panel restored",
        "info-toast"
      );
    }
  },

  toggleAgent() {
    this._agentHidden = !this._agentHidden;
    this.applyAgentState(true);
  },

  showAgent(notify = false) {
    if (this._agentHidden) {
      this._agentHidden = false;
      this.applyAgentState(notify);
    }
  },

  hideAgent(notify = false) {
    if (!this._agentHidden) {
      this._agentHidden = true;
      this.applyAgentState(notify);
    }
  },

  toggleAgentFocus() {
    this._agentFocus = !this._agentFocus;
    document.getElementById("app-shell")?.classList.toggle("agent-focus", this._agentFocus);
    const btn = document.getElementById("agent-focus-btn");
    if (btn) btn.classList.toggle("active", this._agentFocus);
    this.showToast(
      this._agentFocus ? "Agent Focus Mode: Cockpit expanded" : "Split view restored",
      "info-toast"
    );
  },

  initShortcuts() {
    window.addEventListener("keydown", (e) => {
      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        this.toggleNav();
      } else if (e.altKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        this.toggleAgentFocus();
      } else if ((e.altKey && e.key.toLowerCase() === "a") || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j")) {
        e.preventDefault();
        this.toggleAgent();
      }
    });
  },

  // ── Real Stock Logos & Imagery ────────────────────────────
  getStockLogo(symbol, size = 28, className = "stock-logo-img") {
    const s = (symbol || "").toUpperCase();
    const map = {
      TCS: "assets/stocks/tcs.svg",
      HDFCBANK: "assets/stocks/hdfcbank.svg",
      HDFC: "assets/stocks/hdfcbank.svg",
      RELIANCE: "assets/stocks/reliance.svg",
      RIL: "assets/stocks/reliance.svg",
      TATAMOTORS: "assets/stocks/tatamotors.svg",
      TATASTEEL: "assets/stocks/tatasteel.svg",
      INFY: "assets/stocks/infy.svg",
      INFOSYS: "assets/stocks/infy.svg",
      IRCTC: "assets/stocks/irctc.svg",
      GOLDBEES: "assets/stocks/goldbees.svg",
      GOLD: "assets/stocks/goldbees.svg",
      IOC: "assets/stocks/ioc.svg",
      TRIDENT: "assets/stocks/trident.svg",
      IDFC: "assets/stocks/idfc.svg",
      NIFTY50: "assets/stocks/nifty50.svg",
      NIFTY: "assets/stocks/nifty50.svg",
      BANKNIFTY: "assets/stocks/banknifty.svg",
    };
    const src = map[s] || "assets/stocks/default.svg";
    return `<img src="${src}" alt="${s}" class="${className}" width="${size}" height="${size}" loading="lazy" style="border-radius:6px;object-fit:contain;flex-shrink:0" />`;
  },

  // ── Theme Management ──────────────────────────────────────
  initTheme() {
    const saved = localStorage.getItem("zebu_theme") || "light";
    this.setTheme(saved, false);
  },

  setTheme(theme, notify = true) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("zebu_theme", theme);
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      const isLight = theme === "light";
      btn.querySelector(".theme-icon").textContent = isLight ? "☀️" : "🌙";
      btn.querySelector(".theme-label").textContent = isLight ? "Light" : "Dark";
      btn.setAttribute("title", isLight ? "Switch to Dark Mode" : "Switch to White Mode");
    }
    if (notify) {
      this.showToast(`Switched to ${theme === "light" ? "White" : "Dark"} Mode`, "info-toast");
    }
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    this.setTheme(next, true);
  },

  // ── Navigation ────────────────────────────────────────────
  initNavigation() {
    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", () => {
        const view = item.dataset.view;
        if (view) this.navigate(view);
      });
    });
  },

  navigate(viewId) {
    this.currentView = viewId;
    document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.view === viewId));
    document.querySelectorAll(".view").forEach(el => el.classList.toggle("active", el.id === `view-${viewId}`));
  },

  // ── Clock ─────────────────────────────────────────────────
  startClock() {
    const update = () => {
      const now = new Date();
      const options = { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };
      const parts = new Intl.DateTimeFormat("en-IN", options).formatToParts(now);
      const timeStr = `${parts.find(p => p.type === "hour")?.value}:${parts.find(p => p.type === "minute")?.value}:${parts.find(p => p.type === "second")?.value} IST`;
      const el = document.getElementById("clock");
      if (el) el.textContent = timeStr;
    };
    update();
    this.clockInterval = setInterval(update, 1000);
  },

  // ── Format helpers ────────────────────────────────────────
  formatINR(val) {
    return "₹" + Math.abs(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
  formatINRShort(val) {
    const abs = Math.abs(val);
    if (abs >= 1e7) return "₹" + (abs / 1e7).toFixed(2) + " Cr";
    if (abs >= 1e5) return "₹" + (abs / 1e5).toFixed(2) + " L";
    return "₹" + abs.toLocaleString("en-IN");
  },
  pctSpan(pct, val = null) {
    const cls = pct >= 0 ? "positive" : "negative";
    const sign = pct >= 0 ? "▲" : "▼";
    const pctStr = `${sign} ${Math.abs(pct).toFixed(2)}%`;
    const valStr = val !== null ? ` (${val >= 0 ? "+" : "-"}${this.formatINR(val)})` : "";
    return `<span class="${cls}">${pctStr}${valStr}</span>`;
  },

  // ── Topbar Indices ────────────────────────────────────────
  renderTopbarIndices() {
    const { nifty50, bankNifty, indiaVix } = ZEBU_DATA.MARKET_DATA.indices;
    const container = document.getElementById("topbar-indices");
    const items = [
      { ...nifty50, label: "NIFTY 50" },
      { ...bankNifty, label: "BANK NIFTY" },
      { ...indiaVix, label: "INDIA VIX" },
    ];
    container.innerHTML = items.map(idx => `
      <div class="index-pill">
        <span class="idx-name">${idx.label}</span>
        <span class="idx-value">${idx.ltp.toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
        <span class="idx-change ${idx.changePct >= 0 ? "positive" : "negative"}">
          ${idx.changePct >= 0 ? "▲" : "▼"} ${Math.abs(idx.changePct).toFixed(2)}%
        </span>
        ${Charts.sparkline(idx.sparkline || [idx.ltp], {
          width: 60, height: 24,
          color: idx.changePct >= 0 ? "#00C896" : "#FF4D6D",
          strokeWidth: 1.2,
        })}
      </div>
    `).join("");
  },

  // ── Ticker ────────────────────────────────────────────────
  renderTicker() {
    const { STOCKS, MARKET_DATA } = ZEBU_DATA;
    const allItems = [
      ...Object.values(STOCKS),
      ...MARKET_DATA.globalMarkets.map(g => ({ symbol: g.name, ltp: parseFloat(g.value.replace(/[₹$,]/g, "")), changePct: g.change })),
    ];
    const html = allItems.map(s => `
      <div class="ticker-item">
        <span class="ticker-sym">${s.symbol || s.name}</span>
        <span class="ticker-val">${typeof s.ltp === "number" ? s.ltp.toLocaleString("en-IN", {minimumFractionDigits: 2}) : s.ltp}</span>
        <span class="ticker-chg ${(s.changePct || s.change || 0) >= 0 ? "positive" : "negative"}">${((s.changePct || s.change || 0) >= 0 ? "▲" : "▼")} ${Math.abs((s.changePct || s.change || 0)).toFixed(2)}%</span>
      </div>
    `).join("");
    // Double for seamless loop
    document.querySelector(".ticker-track").innerHTML = html + html;
  },

  // ══════════════════════════════════════════════════════════
  //  HOME / MARKET BRIEF VIEW (Layered Decision Hub)
  // ══════════════════════════════════════════════════════════
  renderHomeView() {
    const { MARKET_DATA, STOCKS } = ZEBU_DATA;
    const { indices, breadth, fiiDii, sectors, keyEvents, morningBriefing, globalMarkets } = MARKET_DATA;
    const el = document.getElementById("view-home");

    el.innerHTML = `
      <!-- Executive Decision Hub Directive -->
      <div class="decision-hub-banner">
        <div class="decision-hub-top">
          <div class="decision-regime-badge">
            <div class="pulse-dot"></div>
            <span>Regime: Cautiously Bullish (Selective Longs)</span>
          </div>
          <span style="font-size:11px;color:var(--text-tertiary);font-family:'JetBrains Mono', monospace">
            Live Feed: ${MARKET_DATA.timestamp}
          </span>
        </div>

        <div class="decision-directive-title">${morningBriefing.headline}</div>
        <div class="decision-directive-sub">${morningBriefing.keyInsight}</div>

        <div class="decision-quick-actions">
          <button class="decision-pill-btn" onclick="App.navigate('portfolio')">
            💼 <span>Portfolio Impact</span>
          </button>
          <button class="decision-pill-btn" onclick="App.chatAsk('What is the NIFTY Options PCR and Max Pain level for this week expiry?')">
            📊 <span>NIFTY PCR & Max Pain</span>
          </button>
          <button class="decision-pill-btn" onclick="App.renderStockView('HDFCBANK');App.navigate('research')">
            🔍 <span>HDFC Bank Q2 Setup</span>
          </button>
          <button class="decision-pill-btn" onclick="App.chatAsk('Give me a high-probability swing trade setup for today')">
            ⚡ <span>AI Trade Verdict</span>
          </button>
        </div>
      </div>

      <!-- Layer Selection Tabs (Progressive Disclosure) -->
      <div class="layer-nav-tabs">
        <button class="layer-tab-btn active" data-layer="pulse" onclick="App.switchHomeLayer('pulse')">
          <span>🎯 Market Pulse & Setups</span>
          <span class="layer-badge">Live</span>
        </button>
        <button class="layer-tab-btn" data-layer="flows" onclick="App.switchHomeLayer('flows')">
          <span>⚖️ Flows & Heatmap</span>
          <span class="layer-badge">FII/DII</span>
        </button>
        <button class="layer-tab-btn" data-layer="triggers" onclick="App.switchHomeLayer('triggers')">
          <span>🔔 High-Impact Triggers</span>
          <span class="layer-badge">${keyEvents.length}</span>
        </button>
      </div>

      <!-- ════════════════════════════════════════════════════════
           LAYER 1: MARKET PULSE & SETUPS (DEFAULT)
      ════════════════════════════════════════════════════════ -->
      <div id="layer-pulse" class="layer-panel active">
        <!-- Core 3 Benchmarks Ribbon -->
        <div class="key-indices-ribbon">
          <!-- NIFTY 50 -->
          <div class="key-index-card" onclick="App.chatAsk('Tell me key support and resistance levels for NIFTY 50 today')">
            <div class="k-idx-top">
              <span class="k-idx-name">NIFTY 50</span>
              <span class="k-idx-pivots">S: 24,780 | R: 25,000</span>
            </div>
            <div class="k-idx-mid">
              <span class="k-idx-val">${indices.nifty50.ltp.toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
              <span class="k-idx-chg ${indices.nifty50.change >= 0 ? "positive" : "negative"}">${indices.nifty50.change >= 0 ? "▲ +" : "▼ "}${indices.nifty50.change.toFixed(2)} (${indices.nifty50.changePct.toFixed(2)}%)</span>
            </div>
            <div style="margin-top:6px">
              ${Charts.sparkline(indices.nifty50.sparkline, {width: 220, height: 36, color: indices.nifty50.change >= 0 ? "var(--green)" : "var(--red)", fillColor: indices.nifty50.change >= 0 ? "var(--green)" : "var(--red)"})}
            </div>
          </div>

          <!-- BANK NIFTY -->
          <div class="key-index-card" onclick="App.chatAsk('How is Bank Nifty positioned ahead of HDFC Bank results?')">
            <div class="k-idx-top">
              <span class="k-idx-name">BANK NIFTY</span>
              <span class="k-idx-pivots">S: 51,800 | R: 52,500</span>
            </div>
            <div class="k-idx-mid">
              <span class="k-idx-val">${indices.bankNifty.ltp.toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
              <span class="k-idx-chg ${indices.bankNifty.change >= 0 ? "positive" : "negative"}">${indices.bankNifty.change >= 0 ? "▲ +" : "▼ "}${indices.bankNifty.change.toFixed(2)} (${indices.bankNifty.changePct.toFixed(2)}%)</span>
            </div>
            <div style="margin-top:6px">
              ${Charts.sparkline(indices.bankNifty.sparkline, {width: 220, height: 36, color: indices.bankNifty.change >= 0 ? "var(--green)" : "var(--red)", fillColor: indices.bankNifty.change >= 0 ? "var(--green)" : "var(--red)"})}
            </div>
          </div>

          <!-- INDIA VIX -->
          <div class="key-index-card" onclick="App.chatAsk('Is India VIX cooling down and what does it mean for option buyers?')">
            <div class="k-idx-top">
              <span class="k-idx-name">INDIA VIX (Volatility)</span>
              <span class="k-idx-pivots">Low Volatility Zone</span>
            </div>
            <div class="k-idx-mid">
              <span class="k-idx-val">${indices.indiaVix.ltp.toFixed(2)}</span>
              <span class="k-idx-chg ${indices.indiaVix.change <= 0 ? "positive" : "negative"}">${indices.indiaVix.change <= 0 ? "▼ " : "▲ +"}${Math.abs(indices.indiaVix.changePct).toFixed(2)}% (${indices.indiaVix.change <= 0 ? "Favorable" : "Elevated"})</span>
            </div>
            <div style="margin-top:6px">
              ${Charts.sparkline(indices.indiaVix.sparkline, {width: 220, height: 36, color: indices.indiaVix.change <= 0 ? "var(--green)" : "var(--amber)", fillColor: indices.indiaVix.change <= 0 ? "var(--green)" : "var(--amber)"})}
            </div>
          </div>
        </div>

        <!-- Actionable Decision Drivers (Trendlyne Style) -->
        <div class="section">
          <div class="card-header mb-12">
            <span class="card-title">Actionable Decision Drivers</span>
            <span class="view-time">Market Rationale</span>
          </div>
          <div class="decision-drivers-grid">
            <div class="driver-card" onclick="App.renderStockView('HDFCBANK');App.navigate('research')">
              <div>
                <div class="driver-card-header">
                  ${this.getStockLogo('HDFCBANK', 26)}
                  <span class="driver-card-tag">Banking Momentum</span>
                </div>
                <div class="driver-card-title">HDFC Bank Q2 Countdown</div>
                <div class="driver-card-desc">Banking index (+0.58%) factoring in credit recovery. Trailing stop-loss near ₹1,520 for existing swing longs.</div>
              </div>
              <div class="driver-card-action">Research HDFCBANK setup →</div>
            </div>

            <div class="driver-card" onclick="App.chatAsk('Explain why money is rotating from IT to Pharma today and how to trade it')">
              <div>
                <div class="driver-card-header">
                  <span class="driver-card-icon">⚡</span>
                  <span class="driver-card-tag">Sector Rotation</span>
                </div>
                <div class="driver-card-title">IT Weakness → Pharma Rotation</div>
                <div class="driver-card-desc">US Fed stance weighing on IT (-1.87%). Defensive money moving into Sun Pharma (+1.50%). Avoid fresh IT longs.</div>
              </div>
              <div class="driver-card-action">Analyse Sector Rotation →</div>
            </div>

            <div class="driver-card" onclick="App.switchHomeLayer('flows')">
              <div>
                <div class="driver-card-header">
                  <span class="driver-card-icon">🛡️</span>
                  <span class="driver-card-tag">Institutional Cushion</span>
                </div>
                <div class="driver-card-title">DII Net Buy +₹1,840 Cr Absorbs Dip</div>
                <div class="driver-card-desc">Domestic funds aggressively buying dips to support Nifty near 24,800 despite FII net selling (-₹1,240 Cr).</div>
              </div>
              <div class="driver-card-action">Inspect Money Flows →</div>
            </div>
          </div>
        </div>

        <!-- High-Conviction Setups Table -->
        <div class="card section">
          <div class="card-header mb-12">
            <span class="card-title">High-Conviction Stock Setups</span>
            <span class="view-time">Technical & Quantitative Screener</span>
          </div>
          <div style="overflow-x:auto">
            <table class="holdings-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>LTP</th>
                  <th>Change</th>
                  <th>Technical Position</th>
                  <th>Setup Bias</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      ${this.getStockLogo('HDFCBANK', 30)}
                      <div>
                        <div class="h-name">HDFC Bank</div>
                        <div class="h-sym">NSE: HDFCBANK · Financials</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="h-num">₹1,562.40</span></td>
                  <td><span class="positive">▲ +0.95%</span></td>
                  <td><span>RSI 61.2 · Above 20 EMA</span></td>
                  <td><span class="tag tag-green">Bullish Continuation</span></td>
                  <td><button class="btn btn-ghost" style="padding:4px 10px;font-size:11px" onclick="App.renderStockView('HDFCBANK');App.navigate('research')">View Setup</button></td>
                </tr>
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      ${this.getStockLogo('INFY', 30)}
                      <div>
                        <div class="h-name">Infosys</div>
                        <div class="h-sym">NSE: INFY · IT Services</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="h-num">₹1,478.20</span></td>
                  <td><span class="negative">▼ -2.14%</span></td>
                  <td><span>RSI 31.8 · Oversold</span></td>
                  <td><span class="tag tag-amber">Mean Reversion Watch</span></td>
                  <td><button class="btn btn-ghost" style="padding:4px 10px;font-size:11px" onclick="App.renderStockView('INFY');App.navigate('research')">View Setup</button></td>
                </tr>
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      ${this.getStockLogo('TATASTEEL', 30)}
                      <div>
                        <div class="h-name">Tata Steel</div>
                        <div class="h-sym">NSE: TATASTEEL · Metals</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="h-num">₹158.40</span></td>
                  <td><span class="positive">▲ +1.18%</span></td>
                  <td><span>MACD Bullish Cross</span></td>
                  <td><span class="tag tag-green">Ex-Dividend Value</span></td>
                  <td><button class="btn btn-ghost" style="padding:4px 10px;font-size:11px" onclick="App.renderStockView('TATASTEEL');App.navigate('research')">View Setup</button></td>
                </tr>
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      ${this.getStockLogo('TCS', 30)}
                      <div>
                        <div class="h-name">Tata Consultancy Services</div>
                        <div class="h-sym">NSE: TCS · IT Services</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="h-num">₹4,120.00</span></td>
                  <td><span class="negative">▼ -1.87%</span></td>
                  <td><span>Testing 200 EMA Support</span></td>
                  <td><span class="tag tag-purple">Long-Term Value</span></td>
                  <td><button class="btn btn-ghost" style="padding:4px 10px;font-size:11px" onclick="App.renderStockView('TCS');App.navigate('research')">View Setup</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════
           LAYER 2: FLOWS & HEATMAP
      ════════════════════════════════════════════════════════ -->
      <div id="layer-flows" class="layer-panel">
        <div class="grid-2 section">
          <!-- Market Breadth -->
          <div class="card">
            <div class="card-header mb-12">
              <span class="card-title">Market Breadth (NSE)</span>
              <span class="view-time">Net Bias: 61.5% Positive</span>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:14px">
              <div style="flex:1;padding:12px;background:var(--green-dim);border:1px solid rgba(5,150,105,0.2);border-radius:8px;text-align:center">
                <div style="font-size:24px;font-weight:800;color:var(--green)">${breadth.advances}</div>
                <div style="font-size:10px;color:var(--green);font-weight:700;margin-top:2px">ADVANCES</div>
              </div>
              <div style="flex:1;padding:12px;background:var(--red-dim);border:1px solid rgba(225,29,72,0.2);border-radius:8px;text-align:center">
                <div style="font-size:24px;font-weight:800;color:var(--red)">${breadth.declines}</div>
                <div style="font-size:10px;color:var(--red);font-weight:700;margin-top:2px">DECLINES</div>
              </div>
              <div style="flex:1;padding:12px;background:var(--surface-1);border:1px solid var(--border-1);border-radius:8px;text-align:center">
                <div style="font-size:24px;font-weight:800;color:var(--text-secondary)">${breadth.unchanged}</div>
                <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px">UNCHANGED</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);padding-top:8px;border-top:1px solid var(--border-1)">
              <span>Advance/Decline Ratio: <strong style="color:var(--green)">${breadth.ratio.toFixed(2)}</strong></span>
              <span>52W Highs: <strong style="color:var(--green)">${breadth.new52wHigh}</strong></span>
              <span>52W Lows: <strong style="color:var(--red)">${breadth.new52wLow}</strong></span>
            </div>
          </div>

          <!-- Institutional Net Activity -->
          <div class="card">
            <div class="card-header mb-12">
              <span class="card-title">Institutional Footprint (FII vs DII)</span>
              <span class="view-time">${fiiDii.date}</span>
            </div>
            <div class="flow-card">
              <div>
                <div class="flow-row">
                  <span class="flow-label">FII Net Sales</span>
                  <span class="flow-val negative">-₹${Math.abs(fiiDii.fii.net).toFixed(0)} Cr</span>
                </div>
                <div class="flow-bar-wrap"><div class="flow-bar" style="width:65%;background:var(--red)"></div></div>
                <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-tertiary);margin-top:3px">
                  <span>Gross Buy: ₹${fiiDii.fii.buy.toFixed(0)} Cr</span>
                  <span>Gross Sell: ₹${fiiDii.fii.sell.toFixed(0)} Cr</span>
                </div>
              </div>
              <div class="divider"></div>
              <div>
                <div class="flow-row">
                  <span class="flow-label">DII Net Purchases</span>
                  <span class="flow-val positive">+₹${fiiDii.dii.net.toFixed(0)} Cr</span>
                </div>
                <div class="flow-bar-wrap"><div class="flow-bar" style="width:85%;background:var(--green)"></div></div>
                <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-tertiary);margin-top:3px">
                  <span>Gross Buy: ₹${fiiDii.dii.buy.toFixed(0)} Cr</span>
                  <span>Gross Sell: ₹${fiiDii.dii.sell.toFixed(0)} Cr</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sector Heatmap -->
        <div class="section">
          <div class="card-header mb-12">
            <span class="card-title">Sector Velocity & Rotation</span>
            <span class="view-time">Click any sector to query AI</span>
          </div>
          <div class="sector-grid">
            ${sectors.map(s => `
              <div class="sector-tile ${s.change >= 0 ? "pos" : "neg"}" onclick="App.chatAsk('Tell me about the ${s.name} sector today')">
                <div class="s-icon">${s.icon}</div>
                <div class="s-name">${s.name}</div>
                <div class="s-change ${s.change >= 0 ? "positive" : "negative"}">${s.change >= 0 ? "+" : ""}${s.change.toFixed(2)}%</div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Global Inter-Market Strip -->
        <div class="section">
          <div class="card-title mb-12">Global Inter-Market Cues</div>
          <div class="global-strip">
            ${globalMarkets.map(g => `
              <div class="global-item">
                <span class="g-name">${g.name}</span>
                <span class="g-val">${g.value}</span>
                <span class="g-chg ${g.change >= 0 ? "positive" : "negative"}">${g.change >= 0 ? "▲" : "▼"} ${Math.abs(g.change).toFixed(2)}%</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════
           LAYER 3: HIGH-IMPACT TRIGGERS
      ════════════════════════════════════════════════════════ -->
      <div id="layer-triggers" class="layer-panel">
        <div class="section">
          <div class="card-header mb-12">
            <span class="card-title">Catalyst Timeline & Market Impact</span>
            <span class="view-time">Filtered by Trade Significance</span>
          </div>
          <div class="event-strip">
            ${keyEvents.map(ev => `
              <div class="event-item" onclick="App.chatAsk('How does ${ev.event} impact Indian stock markets and my holdings?')">
                <div class="event-time">${ev.time}</div>
                <div style="margin-right:8px;font-size:14px">
                  ${ev.type === "earnings" ? "📊" : ev.type === "macro" ? "🏛️" : ev.type === "flows" ? "💰" : "🏢"}
                </div>
                <div class="event-body">
                  <div class="event-title">${ev.event}</div>
                  <div class="event-detail">${ev.detail}</div>
                </div>
                <span class="tag tag-${ev.impact === "high" ? "red" : ev.impact === "medium" ? "amber" : "purple"}">${ev.impact}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- Layer 4: Collapsible Official ZEBU Suite & Trust Badges -->
      <div class="ecosystem-collapsible" id="ecosystem-drawer">
        <div class="ecosystem-header" onclick="App.toggleEcosystemDrawer()">
          <div class="ecosystem-header-left">
            <img src="assets/zebu-logo.svg" alt="ZEBU" height="22" />
            <span class="ecosystem-title">Official ZEBU Product Suite & Registered Broker Credentials</span>
          </div>
          <span class="ecosystem-toggle-icon">▼</span>
        </div>
        <div class="ecosystem-body">
          <div class="official-products-grid" style="margin-bottom:16px">
            <div class="official-product-card" onclick="App.navigate('research')">
              <img src="assets/stocks-etfs.png" alt="Stocks & ETFs" class="official-product-img" />
              <div class="official-product-title">Stocks & ETFs</div>
              <div class="official-product-desc">Trade 5,000+ listed equities on NSE & BSE with flat brokerage.</div>
            </div>
            <div class="official-product-card" onclick="App.chatAsk('Tell me about mutual funds and SIP investing in India')">
              <img src="assets/mutual-funds.png" alt="Mutual Funds & SIPs" class="official-product-img" />
              <div class="official-product-title">Mutual Funds & SIPs</div>
              <div class="official-product-desc">Zero-commission Direct Mutual Funds with automated SIPs.</div>
            </div>
            <div class="official-product-card" onclick="App.chatAsk('What are Sovereign Gold Bonds and how do they work?')">
              <img src="assets/bonds.png" alt="Currencies & Bonds" class="official-product-img" />
              <div class="official-product-title">Currencies & Bonds</div>
              <div class="official-product-desc">Sovereign Gold Bonds, Govt Securities, and currency futures.</div>
            </div>
            <div class="official-product-card" onclick="App.chatAsk('What upcoming IPOs are open in India right now?')">
              <img src="assets/ipos.png" alt="IPOs" class="official-product-img" />
              <div class="official-product-title">IPOs with UPI</div>
              <div class="official-product-desc">Apply in under 60 seconds with instant UPI mandate blocking.</div>
            </div>
          </div>

          <div class="official-tools-grid" style="margin-bottom:16px">
            <div class="official-tool-card" onclick="App.chatAsk('How do I use ZEBU Web for chart trading?')">
              <img src="assets/webtrading.svg" alt="ZEBU Web" class="official-tool-icon" />
              <div>
                <div class="official-tool-name">ZEBU Web</div>
                <div class="official-tool-desc">TradingView charts & Option Chain</div>
              </div>
            </div>
            <div class="official-tool-card" onclick="App.chatAsk('What is ZEBU Desktop terminal?')">
              <img src="assets/app-desk.svg" alt="ZEBU Desktop" class="official-tool-icon" />
              <div>
                <div class="official-tool-name">ZEBU Desktop</div>
                <div class="official-tool-desc">Multi-monitor pro trading terminal</div>
              </div>
            </div>
            <div class="official-tool-card" onclick="App.chatAsk('How do I build an algo trading strategy with ZEBU Python API?')">
              <img src="assets/api.svg" alt="ZEBU Python API" class="official-tool-icon" />
              <div>
                <div class="official-tool-name">Python Algo API</div>
                <div class="official-tool-desc">Sub-millisecond order execution</div>
              </div>
            </div>
            <div class="official-tool-card" onclick="App.navigate('portfolio')">
              <img src="assets/reports.svg" alt="Smart Reports" class="official-tool-icon" />
              <div>
                <div class="official-tool-name">Smart Reports</div>
                <div class="official-tool-desc">Automated Tax P&L & capital gains</div>
              </div>
            </div>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border-1);flex-wrap:wrap;gap:10px">
            <div style="display:flex;align-items:center;gap:12px">
              <img src="assets/sebi-check.svg" alt="SEBI Reg" height="22" />
              <img src="assets/iso-logo.svg" alt="ISO 9001:2015" height="22" />
              <span style="font-size:10px;color:var(--text-tertiary)">SEBI Registration: INZ000273636 · Member NSE/BSE/MCX</span>
            </div>
            <span style="font-size:10px;color:var(--text-tertiary)">Zebu Share and Wealth Managements Pvt. Ltd.</span>
          </div>
        </div>
      </div>

      <!-- Regulatory Disclosure -->
      <div style="padding:10px 14px;background:var(--surface-1);border:1px solid var(--border-1);border-radius:8px;font-size:10px;color:var(--text-tertiary);line-height:1.5;margin-top:10px">
        ⚠️ <strong>Regulatory Disclosure:</strong> ZEBU AI is an informational analysis companion for traders and investors. Not SEBI-registered investment advisory. Market investments are subject to market risks.
      </div>
    `;
  },

  switchHomeLayer(layerId) {
    document.querySelectorAll(".layer-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.layer === layerId);
    });
    document.querySelectorAll(".layer-panel").forEach(panel => {
      panel.classList.toggle("active", panel.id === `layer-${layerId}`);
    });
  },

  toggleEcosystemDrawer() {
    const el = document.getElementById("ecosystem-drawer");
    if (el) el.classList.toggle("open");
  },

  // ══════════════════════════════════════════════════════════
  //  STOCK RESEARCH VIEW
  // ══════════════════════════════════════════════════════════
  renderStockView(symbol = "TCS") {
    const { STOCKS } = ZEBU_DATA;
    const el = document.getElementById("view-research");
    const stock = STOCKS[symbol] || STOCKS.TCS;
    this.currentStock = symbol;

    el.innerHTML = `
      <!-- Search -->
      <div class="view-header">
        <div>
          <div class="view-title">AI Stock Research</div>
          <div class="view-subtitle">Deep-dive analysis powered by verified market data</div>
        </div>
      </div>

      <div class="search-bar">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input class="search-input" id="stock-search" placeholder="Search any NSE/BSE stock..." value="${stock.name}" />
        </div>
        <button class="btn btn-primary" onclick="App.onStockSearch()">Research</button>
      </div>

      <div class="search-chips">
        ${Object.entries(STOCKS).map(([sym, s]) => `
          <div class="search-chip ${sym === symbol ? "active" : ""}" onclick="App.renderStockView('${sym}')">
            ${this.getStockLogo(sym, 18, "chip-stock-logo")}
            <span>${sym}</span>
          </div>
        `).join("")}
      </div>

      <!-- Stock Hero -->
      <div class="stock-hero section">
        <div class="stock-hero-top">
          <div class="stock-name-block" style="display:flex;align-items:center;gap:16px">
            ${this.getStockLogo(stock.symbol, 54, "stock-hero-avatar")}
            <div>
              <div class="s-fullname">${stock.name}</div>
              <div class="s-sym">NSE: ${stock.symbol} · ${stock.sector}</div>
              <div class="s-sector">Market Cap: ${stock.marketCap}</div>
            </div>
          </div>
          <div class="stock-price-block">
            <div class="s-ltp ${stock.changePct >= 0 ? "positive" : "negative"}">${this.formatINR(stock.ltp)}</div>
            <div class="s-change-row">
              <span class="s-change ${stock.changePct >= 0 ? "positive" : "negative"}">${stock.changePct >= 0 ? "▲" : "▼"} ${this.formatINR(Math.abs(stock.change))} (${Math.abs(stock.changePct).toFixed(2)}%)</span>
            </div>
            <div style="font-size:10px;color:var(--text-tertiary);margin-top:4px">${ZEBU_DATA.MARKET_DATA.timestamp}</div>
          </div>
        </div>

        <!-- Sparkline -->
        <div style="margin-bottom:16px">
          <div id="stock-sparkline-wrap" style="width:100%;height:60px;overflow:hidden">${Charts.sparkline(stock.sparkline, {width:900, height:60, color: stock.changePct >= 0 ? "#00C896" : "#FF4D6D", fillColor: stock.changePct >= 0 ? "#00C896" : "#FF4D6D", strokeWidth:2})}</div>
        </div>

        <div class="stock-meta-grid">
          <div class="stock-meta-item"><div class="m-label">Open</div><div class="m-val">${this.formatINR(stock.open)}</div></div>
          <div class="stock-meta-item"><div class="m-label">High</div><div class="m-val positive">${this.formatINR(stock.high)}</div></div>
          <div class="stock-meta-item"><div class="m-label">Low</div><div class="m-val negative">${this.formatINR(stock.low)}</div></div>
          <div class="stock-meta-item"><div class="m-label">Volume</div><div class="m-val">${stock.volume}</div></div>
          <div class="stock-meta-item"><div class="m-label">Prev Close</div><div class="m-val">${this.formatINR(stock.prev_close)}</div></div>
          <div class="stock-meta-item"><div class="m-label">Avg Volume</div><div class="m-val">${stock.avgVolume}</div></div>
          <div class="stock-meta-item"><div class="m-label">52W High</div><div class="m-val positive">${this.formatINR(stock.week52High)}</div></div>
          <div class="stock-meta-item"><div class="m-label">52W Low</div><div class="m-val negative">${this.formatINR(stock.week52Low)}</div></div>
        </div>
      </div>

      <div class="grid-2 section">
        <!-- Technical Analysis -->
        <div class="card">
          <div class="card-title mb-12">Technical Analysis</div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
            ${Charts.rsiGauge(stock.technicals.rsi14, {size:80})}
            <div>
              <div style="font-size:10px;color:var(--text-tertiary);margin-bottom:4px">Signal</div>
              <span class="tag ${stock.technicals.signal === "BULLISH" ? "tag-green" : stock.technicals.signal === "BEARISH" ? "tag-red" : "tag-amber"}">${stock.technicals.signal}</span>
              <div style="margin-top:8px">
                ${Charts.macdHistogram(stock.technicals.macd, {width:160, height:50})}
              </div>
            </div>
          </div>
          <div class="grid-2 mb-12" style="gap:8px">
            <div class="ratio-item"><div class="ratio-label">EMA 20</div><div class="ratio-val" style="font-size:13px">${stock.technicals.ema20.toFixed(1)}</div><div class="ratio-context ${stock.ltp > stock.technicals.ema20 ? "positive" : "negative"}">${stock.ltp > stock.technicals.ema20 ? "▲ Above" : "▼ Below"}</div></div>
            <div class="ratio-item"><div class="ratio-label">EMA 50</div><div class="ratio-val" style="font-size:13px">${stock.technicals.ema50.toFixed(1)}</div><div class="ratio-context ${stock.ltp > stock.technicals.ema50 ? "positive" : "negative"}">${stock.ltp > stock.technicals.ema50 ? "▲ Above" : "▼ Below"}</div></div>
            <div class="ratio-item"><div class="ratio-label">EMA 200</div><div class="ratio-val" style="font-size:13px">${stock.technicals.ema200.toFixed(1)}</div><div class="ratio-context ${stock.ltp > stock.technicals.ema200 ? "positive" : "negative"}">${stock.ltp > stock.technicals.ema200 ? "▲ Above" : "▼ Below"}</div></div>
            <div class="ratio-item"><div class="ratio-label">RSI (14)</div><div class="ratio-val" style="font-size:13px;color:${stock.technicals.rsi14 > 70 ? "var(--red)" : stock.technicals.rsi14 < 30 ? "var(--green)" : "var(--amber)"}">${stock.technicals.rsi14}</div><div class="ratio-context">${stock.technicals.rsi14 > 70 ? "Overbought" : stock.technicals.rsi14 < 30 ? "Oversold" : "Neutral"}</div></div>
          </div>
          <div class="support-resistance">
            <div class="sr-item support"><div class="sr-label">Support</div><div class="sr-val">₹${stock.technicals.support}</div></div>
            <div class="sr-item resistance"><div class="sr-label">Resistance</div><div class="sr-val">₹${stock.technicals.resistance}</div></div>
          </div>
        </div>

        <!-- Fundamentals -->
        <div class="card">
          <div class="card-title mb-12">Fundamental Ratios</div>
          <div class="ratio-grid mb-12">
            <div class="ratio-item">
              <div class="ratio-label">P/E</div>
              <div class="ratio-val">${stock.fundamentals.pe}x</div>
              <div class="ratio-context ${stock.fundamentals.pe < stock.fundamentals.sectorPE ? "positive" : "negative"}">Sector: ${stock.fundamentals.sectorPE}x</div>
            </div>
            <div class="ratio-item">
              <div class="ratio-label">P/B</div>
              <div class="ratio-val">${stock.fundamentals.pb}x</div>
            </div>
            <div class="ratio-item">
              <div class="ratio-label">EV/EBITDA</div>
              <div class="ratio-val">${stock.fundamentals.evEbitda}x</div>
            </div>
            <div class="ratio-item">
              <div class="ratio-label">ROE</div>
              <div class="ratio-val positive">${stock.fundamentals.roe}%</div>
            </div>
            <div class="ratio-item">
              <div class="ratio-label">ROCE</div>
              <div class="ratio-val positive">${stock.fundamentals.roce}%</div>
            </div>
            <div class="ratio-item">
              <div class="ratio-label">Div Yield</div>
              <div class="ratio-val">${stock.fundamentals.dividendYield}%</div>
            </div>
          </div>
          <div class="card-title mb-8">Financials</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${[
              ["Revenue", stock.financials.revenue, stock.financials.revenueGrowth],
              ["Net Profit", stock.financials.pat, stock.financials.patGrowth],
              ["EBITDA Margin", stock.financials.ebitdaMargin, ""],
              ["Cash/Reserves", stock.financials.cashReserves, ""],
            ].map(([label, val, growth]) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border-1)">
                <span style="font-size:11px;color:var(--text-secondary)">${label}</span>
                <div style="text-align:right">
                  <span style="font-size:12px;font-weight:600">${val}</span>
                  ${growth ? `<span style="font-size:10px;margin-left:6px" class="${growth.includes("+") ? "positive" : "negative"}">${growth}</span>` : ""}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- Shareholding -->
      <div class="card section">
        <div class="card-title mb-12">Shareholding Pattern</div>
        <div class="sh-bar">
          <div class="sh-segment" style="width:${stock.shareholding.promoter}%;background:#7C6FE5"></div>
          <div class="sh-segment" style="width:${stock.shareholding.fii}%;background:#00C896"></div>
          <div class="sh-segment" style="width:${stock.shareholding.dii}%;background:#F7B731"></div>
          <div class="sh-segment" style="width:${stock.shareholding.public}%;background:#FF4D6D"></div>
        </div>
        <div style="display:flex;gap:16px;margin-top:8px">
          ${[["Promoter", stock.shareholding.promoter, "#7C6FE5"], ["FII", stock.shareholding.fii, "#00C896"], ["DII", stock.shareholding.dii, "#F7B731"], ["Public", stock.shareholding.public, "#FF4D6D"]].map(([label, pct, color]) => `
            <div style="display:flex;align-items:center;gap:6px">
              <div style="width:8px;height:8px;background:${color};border-radius:2px"></div>
              <span style="font-size:11px;color:var(--text-secondary)">${label}</span>
              <span style="font-size:12px;font-weight:700">${pct}%</span>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- AI Analysis -->
      <div class="section">
        <div class="card-title mb-12">🤖 AI Analysis</div>
        <div class="analysis-block mb-12" style="margin-bottom:10px">
          <div class="a-title" style="color:var(--zebu-purple-light)">Summary</div>
          <div class="a-text">${stock.analysis.summary}</div>
        </div>
        <div class="grid-2" style="gap:10px">
          <div class="analysis-block bull-block">
            <div class="a-title">🟢 Bull Case</div>
            <div class="a-text">${stock.analysis.bullCase}</div>
          </div>
          <div class="analysis-block bear-block">
            <div class="a-title">🔴 Bear Case</div>
            <div class="a-text">${stock.analysis.bearCase}</div>
          </div>
        </div>
        <div class="analysis-block" style="margin-top:10px;background:var(--amber-dim);border-color:rgba(247,183,49,0.2)">
          <div class="a-title" style="color:var(--amber)">⚠️ Key Risks</div>
          <div class="a-text">${stock.analysis.risks.map(r => `• ${r}`).join("<br>")}</div>
        </div>
      </div>

      <!-- News -->
      <div class="card section">
        <div class="card-title mb-12">Recent News</div>
        <div class="news-list">
          ${stock.recentNews.map(n => `
            <div class="news-item" onclick="App.chatAsk('Tell me more about: ${n.headline}')">
              <div class="news-dot ${n.sentiment}"></div>
              <span class="news-date">${n.date}</span>
              <span class="news-headline">${n.headline}</span>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Ask AI button -->
      <div style="margin-top:8px;text-align:center">
        <button class="btn btn-primary" onclick="App.chatAsk('Give me a deeper analysis of ${stock.symbol}')">
          🤖 Ask AI for Deeper Analysis
        </button>
      </div>
    `;

    // Re-init search
    const searchInput = document.getElementById("stock-search");
    if (searchInput) {
      searchInput.addEventListener("keydown", e => { if (e.key === "Enter") this.onStockSearch(); });
    }
  },

  onStockSearch() {
    const val = (document.getElementById("stock-search")?.value || "").toUpperCase().trim();
    const { STOCKS } = ZEBU_DATA;
    // Match by symbol or partial name
    const found = Object.keys(STOCKS).find(sym =>
      sym.includes(val) || STOCKS[sym].name.toUpperCase().includes(val)
    );
    if (found) {
      this.renderStockView(found);
      this.navigate("research");
    } else {
      this.chatAsk(`Research ${val}`);
    }
  },

  // ══════════════════════════════════════════════════════════
  //  PORTFOLIO VIEW
  // ══════════════════════════════════════════════════════════
  renderPortfolioView() {
    const { USER_PORTFOLIO } = ZEBU_DATA;
    const p = USER_PORTFOLIO;
    const el = document.getElementById("view-portfolio");
    const colors = ["#7C6FE5","#00C896","#F7B731","#FF4D6D","#4ECDC4","#FF8C42","#A8DADC"];

    el.innerHTML = `
      <div class="view-header">
        <div>
          <div class="view-title">Portfolio Intelligence</div>
          <div class="view-subtitle">AI-powered context for your holdings</div>
        </div>
        <div style="text-align:right">
          <div class="view-time">${ZEBU_DATA.MARKET_DATA.timestamp}</div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">Account: ${p.accountType}</div>
        </div>
      </div>

      <!-- Summary -->
      <div class="portfolio-summary section">
        <div class="ps-top">
          <div>
            <div class="ps-label">Current Value</div>
            <div class="ps-val">${this.formatINRShort(p.currentValue)}</div>
            <div class="ps-pnl positive">+${this.formatINRShort(p.totalPnl)} (+${p.totalPnlPct.toFixed(2)}%) all time</div>
          </div>
          <div style="text-align:right">
            <div class="ps-label">Today's P&L</div>
            <div class="ps-val ${p.dayPnl >= 0 ? 'positive' : 'negative'}" style="font-size:20px">${p.dayPnl < 0 ? '-' : '+'}${this.formatINRShort(Math.abs(p.dayPnl))}</div>
            <div class="ps-pnl ${p.dayPnl >= 0 ? 'positive' : 'negative'}" style="font-size:12px">${p.dayPnlPct.toFixed(2)}% today</div>
          </div>
        </div>
        <div class="ps-stats">
          <div class="ps-stat">
            <div class="ps-stat-label">Invested</div>
            <div class="ps-stat-val">${this.formatINRShort(p.totalInvested)}</div>
          </div>
          <div class="ps-stat">
            <div class="ps-stat-label">Holdings</div>
            <div class="ps-stat-val">${p.holdings.length} stocks</div>
          </div>
          <div class="ps-stat">
            <div class="ps-stat-label">Risk Score</div>
            <div class="ps-stat-val" style="color:var(--amber)">${p.riskScore || 74}/100</div>
          </div>
          <div class="ps-stat">
            <div class="ps-stat-label">Needs Attention</div>
            <div class="ps-stat-val" style="color:var(--red)">${p.holdings.filter(h=>h.alert).length} items ⚠️</div>
          </div>
        </div>
        <!-- Risk Score Bar -->
        <div style="margin-top:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:10px;color:var(--text-tertiary)">Portfolio Risk Score</span>
            <span style="font-size:11px;font-weight:700;color:var(--amber)">${p.riskScore || 74}/100 — Moderate</span>
          </div>
          <div style="height:6px;background:linear-gradient(90deg,var(--green),var(--amber),var(--red));border-radius:3px;position:relative">
            <div style="position:absolute;top:-3px;left:${p.riskScore || 74}%;width:12px;height:12px;background:#fff;border:2px solid var(--amber);border-radius:50%;transform:translateX(-50%)"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:9px;color:var(--text-tertiary)">
            <span>Low Risk</span><span>Moderate</span><span>High Risk</span>
          </div>
        </div>
      </div>

      <!-- Portfolio Intelligence -->
      <div class="section">
        <div class="card-title mb-12">🤖 Portfolio Intelligence — ${p.portfolioIntelligence.length} items</div>
        <div class="intel-list">
          ${p.portfolioIntelligence.map(item => `
            <div class="intel-item ${item.priority}" onclick="${item.stock ? `App.renderStockView('${item.stock}');App.navigate('research')` : "App.chatAsk('Explain my portfolio concentration')" }">
              <div class="intel-icon">${item.stock ? this.getStockLogo(item.stock, 32, "intel-stock-logo") : `<span style="font-size:20px">${item.icon}</span>`}</div>
              <div class="intel-body">
                <div class="intel-title">${item.title}</div>
                <div class="intel-detail">${item.detail}</div>
              </div>
              ${item.stock ? `<div style="font-size:18px;color:var(--text-tertiary)">›</div>` : ""}
            </div>
          `).join("")}
        </div>
      </div>

      <div class="grid-2 section">
        <!-- Holdings table -->
        <div class="card" style="overflow-x:auto">
          <div class="card-title mb-12">Holdings</div>
          <table class="holdings-table">
            <thead>
              <tr>
                <th>Stock</th>
                <th>Qty</th>
                <th>Avg Cost</th>
                <th>LTP</th>
                <th>P&L</th>
                <th>Today</th>
              </tr>
            </thead>
            <tbody>
              ${p.holdings.map(h => `
                <tr style="cursor:pointer" onclick="App.renderStockView('${h.symbol}');App.navigate('research')">
                  <td>
                    <div style="display:flex;align-items:center;gap:12px">
                      ${this.getStockLogo(h.symbol, 32, "holding-stock-logo")}
                      <div>
                        <div class="h-name">${h.symbol}</div>
                        <div class="h-sym">${h.name}</div>
                        ${h.alert ? `<div class="holding-alert">🔔 ${h.upcoming}</div>` : ""}
                      </div>
                    </div>
                  </td>
                  <td class="h-num">${h.qty}</td>
                  <td class="h-num">${this.formatINR(h.avgCost)}</td>
                  <td class="h-num ${h.ltp >= h.avgCost ? "positive" : "negative"}">${this.formatINR(h.ltp)}</td>
                  <td>
                    <div class="${h.pnl >= 0 ? "positive" : "negative"} h-num">${h.pnl >= 0 ? "+" : ""}${this.formatINR(h.pnl)}</div>
                    <div style="font-size:10px" class="${h.pnl >= 0 ? "positive" : "negative"}">${h.pnlPct >= 0 ? "+" : ""}${h.pnlPct.toFixed(2)}%</div>
                    ${Charts.pnlBar(h.pnlPct)}
                  </td>
                  <td class="${h.dayPnl >= 0 ? "positive" : "negative"} h-num">${h.dayPnl >= 0 ? "+" : ""}${this.formatINR(h.dayPnl)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- Sector Allocation -->
        <div class="card">
          <div class="card-title mb-12">Sector Allocation</div>
          <div style="display:flex;align-items:center;gap:20px">
            ${Charts.donut(p.sectorAllocation, {size:120, strokeWidth:20})}
            <div class="sector-legend" style="flex:1">
              ${p.sectorAllocation.map((s, i) => `
                <div class="legend-item">
                  <div class="legend-dot" style="background:${colors[i % colors.length]}"></div>
                  <span class="legend-name">${s.sector}</span>
                  <span class="legend-pct">${s.pct.toFixed(1)}%</span>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════
  //  EVENTS VIEW
  // ══════════════════════════════════════════════════════════
  renderEventsView() {
    const { MARKET_EVENTS } = ZEBU_DATA;
    const el = document.getElementById("view-events");

    // Update badge
    const badge = document.getElementById("alerts-badge");
    if (badge) badge.textContent = MARKET_EVENTS.filter(e => e.severity === "high").length;

    el.innerHTML = `
      <div class="view-header">
        <div>
          <div class="view-title">Market Events & Alerts</div>
          <div class="view-subtitle">AI-detected signals — ranked by relevance</div>
        </div>
        <div style="font-size:11px;color:var(--text-tertiary);text-align:right">
          <div>${ZEBU_DATA.MARKET_DATA.timestamp}</div>
          <div style="margin-top:2px">${MARKET_EVENTS.length} events detected</div>
        </div>
      </div>

      <div class="alerts-filters">
        ${["All", "Volume", "Technical", "Earnings", "Derivatives", "Macro"].map(f => `
          <div class="filter-chip ${f === "All" ? "active" : ""}" onclick="App.filterAlerts('${f}', this)">${f}</div>
        `).join("")}
      </div>

      <div id="alerts-list">
        ${MARKET_EVENTS.map(ev => `
          <div class="alert-card severity-${ev.severity}" data-type="${ev.type}" onclick="App.chatAsk('Explain the ${ev.symbol} ${ev.type} alert: ${ev.title}')">
            <div class="alert-top">
              <div class="alert-left" style="display:flex;align-items:center;gap:12px">
                ${this.getStockLogo(ev.symbol, 34, "event-stock-logo")}
                <div>
                  <div class="alert-sym">${ev.symbol}</div>
                  <div class="alert-time">${ev.time}</div>
                </div>
                <div>
                  <div class="alert-title">${ev.title}</div>
                </div>
              </div>
              <div class="alert-badge">
                <span class="tag ${ev.changePct >= 0 ? "tag-green" : "tag-red"}">${ev.changePct >= 0 ? "▲" : "▼"} ${Math.abs(ev.changePct).toFixed(2)}%</span>
                ${ev.inPortfolio ? '<span class="tag tag-purple">📁 Portfolio</span>' : ""}
              </div>
            </div>
            <div class="alert-detail">${ev.detail}</div>
            <div class="alert-tags">
              ${ev.tags.map(t => `<span class="tag tag-amber">${t}</span>`).join("")}
              ${ev.onWatchlist ? '<span class="tag tag-purple">👁 Watchlist</span>' : ""}
            </div>
            <div class="alert-actions">
              <button class="btn btn-ghost" style="font-size:10px;padding:5px 10px" onclick="event.stopPropagation();App.renderStockView('${ev.symbol === "NIFTYBEES" ? "RELIANCE" : ev.symbol.replace("HDFC","HDFCBANK").replace("ADANIPORTS","RELIANCE").replace("SUNPHARMA","TCS").replace("INFY","TCS")}');App.navigate('research')">Research ${ev.symbol}</button>
              <button class="btn btn-ghost" style="font-size:10px;padding:5px 10px" onclick="event.stopPropagation();App.chatAsk('Why is ${ev.symbol} showing ${ev.title}?')">Ask AI</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  },

  filterAlerts(filter, el) {
    document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
    el.classList.add("active");
    const cards = document.querySelectorAll(".alert-card");
    cards.forEach(card => {
      const type = card.dataset.type;
      const show = filter === "All" || type === filter.toLowerCase();
      card.style.display = show ? "block" : "none";
    });
  },

  // ══════════════════════════════════════════════════════════
  //  EDUCATION VIEW
  // ══════════════════════════════════════════════════════════
  renderEducationView() {
    const el = document.getElementById("view-education");
    const topics = [
      { icon: "📈", title: "Technical Analysis Basics", sub: "RSI, MACD, EMA, Bollinger Bands", level: "beginner", query: "Teach me the basics of technical analysis" },
      { icon: "💰", title: "How to Value a Stock", sub: "P/E, P/B, EV/EBITDA, DCF", level: "beginner", query: "Explain how to value a stock using today's examples" },
      { icon: "🏛️", title: "Understanding FII & DII Flows", sub: "Why institutional activity moves markets", level: "beginner", query: "What is FII and DII and how does it affect markets?" },
      { icon: "📊", title: "Reading the Options Chain", sub: "PCR, Max Pain, OI, IV", level: "intermediate", query: "Teach me how to read the options chain for NIFTY" },
      { icon: "🔀", title: "Futures & F&O Basics", sub: "Lot size, margin, rollover, expiry", level: "intermediate", query: "Explain futures and options for beginners" },
      { icon: "🧮", title: "Fundamental Analysis Deep Dive", sub: "Reading annual reports, financial ratios", level: "intermediate", query: "How do I analyse a company's fundamentals properly?" },
      { icon: "⚡", title: "Sector Rotation Strategy", sub: "How money moves between sectors", level: "advanced", query: "Explain sector rotation using today's IT vs Pharma move" },
      { icon: "🛡️", title: "Risk Management", sub: "Position sizing, stop-loss, diversification", level: "advanced", query: "Teach me risk management for equity trading" },
    ];

    el.innerHTML = `
      <div class="view-header">
        <div>
          <div class="view-title">AI Financial Mentor</div>
          <div class="view-subtitle">Learn with today's market as your classroom</div>
        </div>
      </div>

      <div class="ai-briefing-banner" style="margin-bottom:20px">
        <div class="briefing-meta">
          <div class="ai-badge"><div class="dot"></div> AI MENTOR · ACTIVE</div>
        </div>
        <div class="briefing-headline">Today is a great day to learn about FII flows</div>
        <div class="briefing-insight">Markets are down 0.8% due to FII selling. This is a live example of how global capital flows affect Indian indices — click "FII & DII Flows" to learn while the event is happening.</div>
      </div>

      <div class="card-title mb-12">Learning Topics</div>
      <div class="edu-topics">
        ${topics.map(t => `
          <div class="edu-topic" onclick="App.chatAsk('${t.query}');document.getElementById('chat-input').focus()">
            <div class="edu-icon">${t.icon}</div>
            <div class="edu-info">
              <div class="edu-title">${t.title}</div>
              <div class="edu-sub">${t.sub}</div>
              <span class="edu-level level-${t.level}">${t.level}</span>
            </div>
            <div class="edu-arrow">›</div>
          </div>
        `).join("")}
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-title mb-12">Today's Live Lesson: Why IT stocks are falling</div>
        <div style="font-size:12px;color:var(--text-secondary);line-height:1.7">
          <p>IT stocks (TCS ↓1.87%, Infosys ↓2.14%) are falling today — not because these companies did anything wrong, but due to <strong>global macro</strong> factors:</p>
          <br>
          <p><strong>The chain of events:</strong></p>
          <p>US Fed signals "rates stay high" → US tech companies cut spending → Less revenue for Indian IT (their biggest clients) → Investors sell Indian IT stocks preemptively.</p>
          <br>
          <p>This is a classic example of <strong>macro-driven sector rotation</strong> — money moving out of IT into defensive sectors like Pharma (+1.5% today).</p>
          <br>
          <button class="btn btn-ghost" onclick="App.chatAsk('Explain today\'s IT fall in detail and what it means for long-term investors')">Ask AI for full analysis →</button>
        </div>
      </div>

      <!-- Official ZEBU Platform Knowledge Suite -->
      <div class="section" style="margin-top:20px">
        <div class="card-title mb-12">ZEBU Platform Tutorials & Tool Mastery</div>
        <div class="official-tools-grid">
          <div class="official-tool-card" onclick="App.chatAsk('How do I trade on ZEBU Mobile App?')">
            <img src="assets/apps.svg" alt="Mobile Trading" class="official-tool-icon" />
            <div>
              <div class="official-tool-name">Mobile Trading</div>
              <div class="official-tool-desc">Navigating watchlists & orders</div>
            </div>
          </div>
          <div class="official-tool-card" onclick="App.chatAsk('How does margin and leverage work on ZEBU?')">
            <img src="assets/funds.svg" alt="Margin & Funds" class="official-tool-icon" />
            <div>
              <div class="official-tool-name">Margin & Leverage</div>
              <div class="official-tool-desc">SEBI peak margin rules</div>
            </div>
          </div>
          <div class="official-tool-card" onclick="App.chatAsk('Explain how to read my Tax P&L report')">
            <img src="assets/reports.svg" alt="Tax P&L" class="official-tool-icon" />
            <div>
              <div class="official-tool-name">Tax & Capital Gains</div>
              <div class="official-tool-desc">STCG and LTCG reporting</div>
            </div>
          </div>
          <div class="official-tool-card" onclick="App.chatAsk('Explain Python API integration for automated trading')">
            <img src="assets/api.svg" alt="Python SDK" class="official-tool-icon" />
            <div>
              <div class="official-tool-name">Algorithmic API</div>
              <div class="official-tool-desc">Python SDK & WebSocket stream</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════
  //  CHAT SYSTEM — Agent-First v2
  // ══════════════════════════════════════════════════════════
  initChat() {
    const input = document.getElementById("chat-input");
    const sendBtn = document.getElementById("chat-send");
    const mem = AgentMemory.get();
    const isReturning = mem.sessionCount > 1;
    const md = ZEBU_DATA.MARKET_DATA;
    const p = ZEBU_DATA.USER_PORTFOLIO;

    // Agent-first opening: live market judgment + book impact + 2-3 next moves
    const greeting = isReturning
      ? `**Welcome back, Rahul.** Here's what changed since you were last here:`
      : `**Good ${this._timeGreeting()}.** I've already analysed the market and your book. Here's the live verdict:`;

    this.addMessage("ai", {
      type: "market_brief",
      agent: "ZEBU AI Orchestrator",
      icon: "🤖",
      content: `${greeting}

**Market: Cautiously Bullish · Selective Longs**
NIFTY at ₹${md.indices.nifty50.ltp.toLocaleString("en-IN")} (▼ ${Math.abs(md.indices.nifty50.changePct).toFixed(2)}%) · FIIs sold ₹${Math.abs(md.fiiDii.fii.net).toFixed(0)} Cr · DIIs cushioning at ₹${md.fiiDii.dii.net.toFixed(0)} Cr

**Your book — 3 things to act on now:**
• ⚠️ **HDFC Bank Q2 results ~6h away** — you hold 35 shares (avg ₹1,540 · current ₹${ZEBU_DATA.STOCKS.HDFCBANK?.ltp.toLocaleString("en-IN")}). Options pricing ±3% move = **±₹${Math.round(ZEBU_DATA.STOCKS.HDFCBANK?.ltp * 0.03 * 35).toLocaleString("en-IN")} impact**.
• 📉 **TCS** testing 200-day EMA at ₹4,080 — you hold 50 shares, IT sector down 1.87% today = **-₹${(50 * 4120 * 0.0187).toLocaleString("en-IN", {maximumFractionDigits:0})} today**
• 💸 **Tata Steel** ex-dividend tomorrow — ₹540 credit expected (150 × ₹3.60)

Tell me a job and I'll run it end-to-end.`,
      sources: ["NSE India", "ZEBU Portfolio API"],
      disclaimer: false,
      nextMoves: [
        { label: "📊 Full market verdict", action: "chat", query: "What's the market verdict for today?" },
        { label: "⚡ Stress-test my portfolio", action: "chat", query: "Stress-test my portfolio" },
        { label: "📊 Prep for HDFC results", action: "chat", query: "Prep me for HDFC Bank results today" },
      ],
    });

    input?.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendChat();
      }
    });
    sendBtn?.addEventListener("click", () => this.sendChat());
  },

  _timeGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    if (h < 20) return "evening";
    return "night";
  },

  chatAsk(query) {
    this.showAgent();
    const input = document.getElementById("chat-input");
    if (input) {
      input.value = query;
      this.sendChat();
    }
  },

  async sendChat() {
    const input = document.getElementById("chat-input");
    const query = input?.value?.trim();
    if (!query) return;
    input.value = "";
    input.style.height = "auto";

    this.addMessage("user", { content: query });

    // Show tool-use steps before the answer
    const steps = AgentEngine.getToolSteps(query);
    const toolId = this.addToolUse(steps);

    try {
      const response = await AgentEngine.generateResponse(query);
      this.removeTyping(toolId);

      // If response says open a screen, do it
      if (response.openScreen) {
        const { view, symbol } = response.openScreen;
        if (symbol && this.renderStockView) this.renderStockView(symbol);
        this.navigate(view);
      }

      this.addMessage("ai", response);
    } catch (err) {
      this.removeTyping(toolId);
      this.addMessage("ai", { type: "text", agent: "ZEBU AI", icon: "🤖", content: "I encountered an issue. Please try again." });
    }
  },

  // ── Tool Use Animation ─────────────────────────────────────
  addToolUse(steps) {
    const container = document.getElementById("chat-messages");
    const id = "tool-" + Date.now();
    const div = document.createElement("div");
    div.className = "chat-msg ai tool-use-msg";
    div.id = id;

    div.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="tool-use-bubble">
        <div class="tool-use-steps" id="tool-steps-${id}">
          ${steps.map((s, i) => `<div class="tool-step" style="animation-delay:${s.delay}ms">⚙ using <strong>${s.label}</strong>…</div>`).join("")}
        </div>
        <div class="tool-done-label">✓ Done — compiling answer</div>
      </div>`;

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
  },

  removeTyping(id) {
    document.getElementById(id)?.remove();
  },

  // ── Next Move Dispatcher ───────────────────────────────────
  runNextMove(move) {
    const { action } = move;
    if (action === "chat") {
      this.chatAsk(move.query);
    } else if (action === "openScreen") {
      if (move.symbol) this.renderStockView(move.symbol);
      this.navigate(move.view || "home");
    } else if (action === "proposeAlert") {
      this.proposeAlert(move.symbol, move.price, move.direction || "below", move.reason || "", move.autoOpen);
    } else if (action === "proposeWatchlist") {
      this.proposeWatchlist(move.symbol);
    } else if (action === "proposePaperOrder") {
      this.proposePaperOrder(move.symbol, move.price, move.qty, move.side || "BUY", move.autoOpen);
    } else if (action === "proposeKYC") {
      this.proposeKYC();
    } else if (action === "proposeShareCard") {
      this.proposeShareCard(move.title, move.summary);
    }
  },

  // ── Action Proposals → Confirm Modal ──────────────────────
  proposeAlert(symbol, price, direction = "below", reason = "", autoOpen = false) {
    this._pendingAction = { type: "alert", symbol, price, direction, reason };
    document.getElementById("modal-agent-label").textContent = "🔔 Alert Agent proposes";
    document.getElementById("modal-title").innerHTML = `<div style="display:flex;align-items:center;gap:10px">${this.getStockLogo(symbol, 26)} <span>Set Price Alert — ${symbol}</span></div>`;
    document.getElementById("modal-body").innerHTML = `
      <div class="modal-detail-row"><span class="modal-label">Stock / Index</span><span class="modal-val">${symbol}</span></div>
      <div class="modal-detail-row"><span class="modal-label">Trigger price</span><span class="modal-val">₹${Number(price).toLocaleString("en-IN")}</span></div>
      <div class="modal-detail-row"><span class="modal-label">Direction</span><span class="modal-val">${direction === "below" ? "▼ Falls below" : "▲ Rises above"}</span></div>
      <div class="modal-detail-row"><span class="modal-label">Reason</span><span class="modal-val">${reason}</span></div>
      <div class="modal-detail-row"><span class="modal-label">Notification</span><span class="modal-val">Chat message + desktop toast</span></div>`;
    document.getElementById("modal-confirm-btn").textContent = "✅ Activate Alert";
    this.openConfirmModal();
  },

  proposeWatchlist(symbol) {
    this._pendingAction = { type: "watchlist", symbol };
    document.getElementById("modal-agent-label").textContent = "📋 Watchlist Agent proposes";
    document.getElementById("modal-title").innerHTML = `<div style="display:flex;align-items:center;gap:10px">${this.getStockLogo(symbol, 26)} <span>Add to Watchlist — ${symbol}</span></div>`;
    document.getElementById("modal-body").innerHTML = `
      <div class="modal-detail-row"><span class="modal-label">Symbol</span><span class="modal-val">${symbol}</span></div>
      <div class="modal-detail-row"><span class="modal-label">Action</span><span class="modal-val">Add to your active watchlist</span></div>
      <div class="modal-detail-row"><span class="modal-label">Monitor</span><span class="modal-val">Agent watch loop will track setups</span></div>`;
    document.getElementById("modal-confirm-btn").textContent = "📋 Add to Watchlist";
    this.openConfirmModal();
  },

  proposePaperOrder(symbol, price, qty, side = "BUY", autoOpen = false) {
    const stock = ZEBU_DATA.STOCKS[symbol] || { name: symbol, ltp: price };
    const total = (price * qty).toLocaleString("en-IN", { maximumFractionDigits: 0 });
    this._pendingAction = { type: "paper_order", symbol, price, qty, side, total };
    document.getElementById("modal-agent-label").textContent = "📄 Trade Execution proposes";
    document.getElementById("modal-title").innerHTML = `<div style="display:flex;align-items:center;gap:10px">${this.getStockLogo(symbol, 26)} <span>Paper Order — ${side} ${symbol}</span></div>`;
    document.getElementById("modal-body").innerHTML = `
      <div class="modal-demo-note">📄 Mock Action Ticket · Risk-free simulator · Zero exchange routing</div>
      <div class="modal-detail-row"><span class="modal-label">Stock / Asset</span><span class="modal-val">${stock?.name || symbol} (${symbol})</span></div>
      <div class="modal-detail-row"><span class="modal-label">Order Action</span><span class="modal-val" style="color:${side === "BUY" ? "var(--green)" : "var(--red)"};font-weight:800">${side}</span></div>
      <div class="modal-detail-row"><span class="modal-label">Quantity</span><span class="modal-val">${qty} shares</span></div>
      <div class="modal-detail-row"><span class="modal-label">Execution Price</span><span class="modal-val">₹${Number(price).toLocaleString("en-IN")}</span></div>
      <div class="modal-detail-row"><span class="modal-label">Estimated Total</span><span class="modal-val">≈ ₹${total}</span></div>
      <div class="modal-detail-row"><span class="modal-label">Brokerage (ZEBU)</span><span class="modal-val">₹0.00 (Demo Mode)</span></div>`;
    document.getElementById("modal-confirm-btn").textContent = `📄 Execute Paper ${side}`;
    this.openConfirmModal();
  },

  proposeKYC() {
    this._pendingAction = { type: "kyc" };
    document.getElementById("modal-agent-label").textContent = "🏦 ZEBU Onboarding proposes";
    document.getElementById("modal-title").textContent = "Open Real ZEBU Demat Account";
    document.getElementById("modal-body").innerHTML = `
      <div class="modal-detail-row"><span class="modal-label">Broker</span><span class="modal-val">Zebu Share & Wealth Managements Pvt. Ltd.</span></div>
      <div class="modal-detail-row"><span class="modal-label">SEBI Reg</span><span class="modal-val">INZ000273636</span></div>
      <div class="modal-detail-row"><span class="modal-label">Account Opening</span><span class="modal-val">100% Paperless (~5 minutes)</span></div>
      <div class="modal-detail-row"><span class="modal-label">Brokerage</span><span class="modal-val">₹20 flat per executed order</span></div>`;
    document.getElementById("modal-confirm-btn").textContent = "🏦 Initiate KYC";
    this.openConfirmModal();
  },

  proposeShareCard(title = "Market Analysis", summary = "") {
    this._pendingAction = { type: "share_card", title, summary };
    document.getElementById("modal-agent-label").textContent = "📤 ZEBU AI proposes";
    document.getElementById("modal-title").textContent = `Share Insight Card`;
    document.getElementById("modal-body").innerHTML = `
      <div class="modal-demo-note">📤 Share an outcome card — no private book data included</div>
      <div class="modal-detail-row"><span class="modal-label">Card Title</span><span class="modal-val">${this.escapeHtml(title)}</span></div>
      <div class="modal-detail-row"><span class="modal-label">Summary</span><span class="modal-val" style="max-width:220px;text-align:right;font-size:11px">${this.escapeHtml(summary)}</span></div>
      <div class="modal-detail-row"><span class="modal-label">Watermark</span><span class="modal-val">ZEBU AI · ${new Date().toLocaleDateString("en-IN")}</span></div>
      <div class="modal-detail-row"><span class="modal-label">Format</span><span class="modal-val">Formatted text + copy to clipboard</span></div>`;
    document.getElementById("modal-confirm-btn").textContent = "📤 Copy & Share";
    this.openConfirmModal();
  },

  openConfirmModal() {
    const modal = document.getElementById("confirm-modal");
    if (modal) { modal.style.display = "flex"; document.body.style.overflow = "hidden"; }
  },

  closeConfirmModal(e) {
    if (e && e.target !== document.getElementById("confirm-modal")) return;
    document.getElementById("confirm-modal").style.display = "none";
    document.body.style.overflow = "";
    this._pendingAction = null;
  },

  confirmModalAction() {
    const action = this._pendingAction;
    if (!action) return;
    document.getElementById("confirm-modal").style.display = "none";
    document.body.style.overflow = "";

    if (action.type === "alert") {
      AgentMemory.addAlert(action);
      const badge = document.getElementById("alerts-badge");
      if (badge) badge.textContent = parseInt(badge.textContent || "0") + 1;
      this.addMessage("ai", {
        type: "confirm",
        agent: "Alerts Agent",
        icon: "🔔",
        content: `✅ **Alert Activated** — Monitoring **${action.symbol}** at **₹${Number(action.price).toLocaleString("en-IN")}** (${action.direction === "below" ? "falls below" : "rises above"}).

**Reason:** ${action.reason}
**Status:** Live watch loop registered. You'll receive instant chat alerts and desktop notifications when breached.
**Active Alerts Count:** ${AgentMemory.get().alertsSet.length}`,
        sources: ["ZEBU Alerts Engine"],
        disclaimer: false,
        nextMoves: [
          { label: `📄 Paper trade ${action.symbol} @ level`, action: "proposePaperOrder", symbol: action.symbol, price: action.price, qty: 2, side: "BUY" },
          { label: "📋 Add " + action.symbol + " to watchlist", action: "proposeWatchlist", symbol: action.symbol },
          { label: "⚡ Fix portfolio risk", action: "chat", query: "Fix my portfolio risk" },
        ],
      });
      this.showToast(`🔔 Alert active: ${action.symbol} ${action.direction === "below" ? "<" : ">"} ₹${Number(action.price).toLocaleString("en-IN")}`, "alert-toast");
    } else if (action.type === "watchlist") {
      AgentMemory.addWatchlist(action.symbol);
      this.addMessage("ai", {
        type: "confirm",
        agent: "Portfolio Agent",
        icon: "📋",
        content: `✅ **${action.symbol} added to Watchlist.**

I will continuously monitor setups, RSI extremes, and support/resistance breaches on ${action.symbol}.

**Current Watchlist Size:** ${AgentMemory.get().watchlist.length} securities`,
        sources: ["ZEBU Market Monitor"],
        disclaimer: false,
        nextMoves: [
          { label: "🔔 Set price alert", action: "proposeAlert", symbol: action.symbol, price: ZEBU_DATA.STOCKS[action.symbol]?.technicals?.support || 0, direction: "below", reason: "Watchlist support level" },
          { label: `📄 Paper buy 2 shares ${action.symbol}`, action: "proposePaperOrder", symbol: action.symbol, price: ZEBU_DATA.STOCKS[action.symbol]?.ltp || 1000, qty: 2, side: "BUY" },
        ],
      });
      this.showToast(`📋 ${action.symbol} added to watchlist`, "info-toast");
    } else if (action.type === "paper_order") {
      AgentMemory.addPaperOrder(action);
      const side = action.side || "BUY";
      this.addMessage("ai", {
        type: "confirm",
        agent: "Trade Execution Agent",
        icon: "📄",
        content: `📄 **Mock Action Executed** — **${side} ${action.qty} × ${action.symbol}** @ ₹${Number(action.price).toLocaleString("en-IN")}

**Trade Result in Numbers:**
• Executed Total: **≈ ₹${action.total}**
• Brokerage Incurred: **₹0.00** (ZEBU Demo Simulator)
• Position Status: **Filled & Tracked in Memory**
• Total Paper Orders Placed: **${AgentMemory.get().paperOrders.length}**

${side === "SELL" ? "Capital has been preserved and concentration risk has been capped." : "This position is now monitored by the background agent loop."}`,
        sources: ["ZEBU Trade Engine"],
        disclaimer: false,
        nextMoves: [
          { label: "🔔 Set protective stop alert", action: "proposeAlert", symbol: action.symbol, price: Math.round(action.price * (side === "SELL" ? 1.025 : 0.975)), direction: side === "SELL" ? "above" : "below", reason: "Paper position risk stop" },
          { label: "⚡ Fix another portfolio risk", action: "chat", query: "Fix my portfolio risk" },
          { label: "📋 Add " + action.symbol + " to watchlist", action: "proposeWatchlist", symbol: action.symbol },
          { label: "🏦 Open real account (₹20/order)", action: "proposeKYC" },
        ],
      });
      this.showToast(`📄 Mock Order Executed: ${side} ${action.qty} ${action.symbol} @ ₹${Number(action.price).toLocaleString("en-IN")}`, "info-toast");
    } else if (action.type === "kyc") {
      AgentMemory.startKYC();
      this.addMessage("ai", {
        type: "confirm",
        agent: "ZEBU Onboarding",
        icon: "🏦",
        content: `🏦 **Paperless KYC Initiated**

• **Broker:** Zebu Share & Wealth Managements Pvt. Ltd. (SEBI Reg: INZ000273636)
• **Brokerage:** Flat ₹20 per executed order across NSE/BSE/MCX
• **Estimated Time:** ~5 minutes with Aadhaar e-Sign + PAN

*Demo simulation complete. Your interest in trading real has been recorded in Agent Memory.*`,
        sources: ["Zebu Share and Wealth Managements Pvt. Ltd."],
        disclaimer: false,
        nextMoves: [
          { label: "⚡ Fix portfolio risk", action: "chat", query: "Fix my portfolio risk" },
          { label: "🔍 Research TCS setup", action: "chat", query: "Research TCS" },
        ],
      });
      this.showToast("🏦 KYC flow initiated (demo)", "info-toast");
    } else if (action.type === "share_card") {
      const cardText = `📊 ZEBU AI Market Intelligence\n${action.title}\n${action.summary}\n\nGenerated by ZEBU AI Platform · SEBI Reg: INZ000273636\n#ZEBUAI #IndianMarkets`;
      try { navigator.clipboard.writeText(cardText); } catch (e) { /* fallback */ }
      this.addMessage("ai", {
        type: "confirm",
        agent: "ZEBU AI",
        icon: "📤",
        content: `📤 **Outcome Card Copied to Clipboard.**

> 📊 **${action.title}**
> ${action.summary}

Share this on WhatsApp, Telegram, or Twitter with 1 click.`,
        sources: [],
        disclaimer: false,
        nextMoves: [
          { label: "⚡ Fix portfolio risk", action: "chat", query: "Fix my portfolio risk" },
          { label: "🔍 Research Reliance", action: "chat", query: "Research Reliance" },
          { label: "🏦 Open real account (KYC)", action: "proposeKYC" },
        ],
      });
      this.showToast("📤 Outcome card copied to clipboard", "info-toast");
    }

    this._pendingAction = null;
  },

  // ── Memory Panel ──────────────────────────────────────────
  showMemory() {
    const mem = AgentMemory.get();
    document.getElementById("memory-panel-body").innerHTML = `
      <div class="memory-grid">
        <div class="memory-item">
          <div class="memory-label">Risk style</div>
          <div class="memory-val">${mem.riskStyle.charAt(0).toUpperCase() + mem.riskStyle.slice(1)}</div>
        </div>
        <div class="memory-item">
          <div class="memory-label">Sessions</div>
          <div class="memory-val">${mem.sessionCount}</div>
        </div>
        <div class="memory-item">
          <div class="memory-label">Watchlist</div>
          <div class="memory-val">${mem.watchlist.length ? mem.watchlist.join(", ") : "Empty"}</div>
        </div>
        <div class="memory-item">
          <div class="memory-label">Alerts set</div>
          <div class="memory-val">${mem.alertsSet.length}</div>
        </div>
        <div class="memory-item">
          <div class="memory-label">Paper orders</div>
          <div class="memory-val">${mem.paperOrders.length}</div>
        </div>
        <div class="memory-item">
          <div class="memory-label">Concepts learned</div>
          <div class="memory-val">${mem.preferredConcepts.length ? mem.preferredConcepts.join(", ") : "None yet"}</div>
        </div>
      </div>
      ${mem.lastQueries.length ? `
      <div class="memory-section-label">Recent queries</div>
      <div class="memory-queries">
        ${mem.lastQueries.map(q => `<div class="memory-query" onclick="App.closeMemoryPanel();App.chatAsk('${q.replace(/'/g, "'")}')">${q}</div>`).join("")}
      </div>` : ""}`;;
    document.getElementById("memory-panel").style.display = "flex";
    document.body.style.overflow = "hidden";
  },

  closeMemoryPanel(e) {
    if (e && e.target !== document.getElementById("memory-panel")) return;
    document.getElementById("memory-panel").style.display = "none";
    document.body.style.overflow = "";
  },

  clearChat() {
    document.getElementById("chat-messages").innerHTML = "";
    const sugg = document.getElementById("chat-suggestions");
    if (sugg) sugg.style.display = "flex";
    this.initChat();
  },

  // ── Markdown renderer ─────────────────────────────────────
  renderMarkdown(text) {
    let html = text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/^#{1,3} (.+)$/gm, "<strong>$1</strong>")
      .replace(/^• (.+)$/gm, "• $1")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>")
      .replace(/<p><\/p>/g, "")
      .replace(/<p>(<div[^>]*>)/g, "$1")
      .replace(/(<\/div>)<\/p>/g, "$1")
      .replace(/<p><br>/g, "<p>")
      .replace(/<br><\/p>/g, "</p>");
    return html;
  },

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  },

  // ── Toast ─────────────────────────────────────────────────
  showToast(msg, cls = "info-toast") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${cls}`;
    toast.innerHTML = `<span>${msg}</span><span class="toast-close" onclick="this.parentElement.remove()">✕</span>`;
    toast.style.cursor = "pointer";
    container?.appendChild(toast);
    setTimeout(() => toast.remove(), 7000);
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => App.init());
