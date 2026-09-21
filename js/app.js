// ZEBU AI — Main Application Controller

const App = {
  currentView: "home",
  currentStock: null,
  chatHistory: [],
  alertCount: 0,
  clockInterval: null,

  init() {
    this.initTheme();
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
    this.scheduleMockAlerts();
    this.navigate("home");
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
  //  HOME / MARKET BRIEF VIEW
  // ══════════════════════════════════════════════════════════
  renderHomeView() {
    const { MARKET_DATA } = ZEBU_DATA;
    const { indices, breadth, fiiDii, sectors, keyEvents, morningBriefing, globalMarkets } = MARKET_DATA;
    const el = document.getElementById("view-home");

    el.innerHTML = `
      <!-- AI Morning Brief -->
      <div class="ai-briefing-banner">
        <div class="briefing-meta">
          <div class="ai-badge"><div class="dot"></div> ZEBU AI · MARKET INTELLIGENCE</div>
          <span style="font-size:10px;color:var(--text-tertiary)">${MARKET_DATA.timestamp}</span>
        </div>
        <div class="briefing-headline">${morningBriefing.headline}</div>
        <div class="briefing-insight">${morningBriefing.keyInsight}</div>
        <div class="briefing-watchpoints">
          ${morningBriefing.watchPoints.map(wp => `
            <div class="watch-point">
              <span class="wp-icon">${wp.icon}</span>
              <span>${wp.text}</span>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Index Cards -->
      <div class="section">
        <div class="card-header mb-12">
          <span class="card-title">Market Indices</span>
          <span class="view-time">${MARKET_DATA.timestamp}</span>
        </div>
        <div class="grid-4" style="margin-bottom:10px">
          ${["nifty50","bankNifty","niftyIT","niftyPharma"].map(key => {
            const idx = indices[key];
            const pos = idx.changePct >= 0;
            const color = pos ? "#00C896" : "#FF4D6D";
            return `
              <div class="index-card" onclick="App.chatAsk('Tell me about ${idx.symbol} today')">
                <div class="idx-card-name">${idx.symbol}</div>
                <div class="idx-card-val">${idx.ltp.toLocaleString("en-IN", {minimumFractionDigits:2})}</div>
                <div class="idx-card-change ${pos ? "positive" : "negative"}">${pos ? "▲" : "▼"} ${Math.abs(idx.change).toFixed(2)} (${Math.abs(idx.changePct).toFixed(2)}%)</div>
                <div class="idx-card-sparkline">${Charts.sparkline(idx.sparkline || [idx.ltp], {width:120, height:36, color, fillColor:color, strokeWidth:1.5})}</div>
              </div>`;
          }).join("")}
        </div>
        <div class="grid-2">
          ${["midcap150","sensex"].map(key => {
            const idx = indices[key];
            const pos = idx.changePct >= 0;
            const color = pos ? "#00C896" : "#FF4D6D";
            return `
              <div class="index-card" onclick="App.chatAsk('What is ${idx.symbol} at today?')">
                <div style="display:flex;align-items:center;justify-content:space-between">
                  <div>
                    <div class="idx-card-name">${idx.symbol}</div>
                    <div class="idx-card-val" style="font-size:17px">${idx.ltp.toLocaleString("en-IN", {minimumFractionDigits:2})}</div>
                    <div class="idx-card-change ${pos ? "positive" : "negative"}">${pos ? "▲" : "▼"} ${Math.abs(idx.changePct).toFixed(2)}%</div>
                  </div>
                  ${Charts.sparkline(idx.sparkline || [idx.ltp], {width:100, height:40, color, fillColor:color})}
                </div>
              </div>`;
          }).join("")}
        </div>
      </div>

      <!-- Market Breadth + FII/DII -->
      <div class="grid-2 section">
        <!-- Breadth -->
        <div class="card">
          <div class="card-title mb-12">Market Breadth (NSE)</div>
          <div style="display:flex;gap:8px;margin-bottom:12px">
            <div style="flex:1;padding:10px;background:var(--green-dim);border:1px solid rgba(0,200,150,0.2);border-radius:8px;text-align:center">
              <div style="font-size:22px;font-weight:800;color:var(--green)">${breadth.advances}</div>
              <div style="font-size:10px;color:var(--green);margin-top:2px">Advances</div>
            </div>
            <div style="flex:1;padding:10px;background:var(--red-dim);border:1px solid rgba(255,77,109,0.2);border-radius:8px;text-align:center">
              <div style="font-size:22px;font-weight:800;color:var(--red)">${breadth.declines}</div>
              <div style="font-size:10px;color:var(--red);margin-top:2px">Declines</div>
            </div>
            <div style="flex:1;padding:10px;background:var(--surface-1);border:1px solid var(--border-1);border-radius:8px;text-align:center">
              <div style="font-size:22px;font-weight:800;color:var(--text-secondary)">${breadth.unchanged}</div>
              <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px">Unchanged</div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary)">
            <span>A/D Ratio: <strong style="color:var(--green)">${breadth.ratio.toFixed(2)}</strong></span>
            <span>52W High: <strong style="color:var(--green)">${breadth.new52wHigh}</strong></span>
            <span>52W Low: <strong style="color:var(--red)">${breadth.new52wLow}</strong></span>
          </div>
        </div>

        <!-- FII/DII -->
        <div class="card">
          <div class="card-title mb-12">FII / DII Activity <span style="font-size:10px;color:var(--text-tertiary);font-weight:400">(${fiiDii.date})</span></div>
          <div class="flow-card">
            <div>
              <div class="flow-row">
                <span class="flow-label">FII Net</span>
                <span class="flow-val negative">${fiiDii.fii.net >= 0 ? "+" : ""}₹${fiiDii.fii.net.toFixed(0)} Cr</span>
              </div>
              <div class="flow-bar-wrap"><div class="flow-bar" style="width:${Math.min(Math.abs(fiiDii.fii.net)/50,100)}%;background:var(--red)"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-tertiary);margin-top:3px">
                <span>Buy: ₹${fiiDii.fii.buy.toFixed(0)} Cr</span>
                <span>Sell: ₹${fiiDii.fii.sell.toFixed(0)} Cr</span>
              </div>
            </div>
            <div class="divider"></div>
            <div>
              <div class="flow-row">
                <span class="flow-label">DII Net</span>
                <span class="flow-val positive">+₹${fiiDii.dii.net.toFixed(0)} Cr</span>
              </div>
              <div class="flow-bar-wrap"><div class="flow-bar" style="width:${Math.min(fiiDii.dii.net/50,100)}%;background:var(--green)"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-tertiary);margin-top:3px">
                <span>Buy: ₹${fiiDii.dii.buy.toFixed(0)} Cr</span>
                <span>Sell: ₹${fiiDii.dii.sell.toFixed(0)} Cr</span>
              </div>
            </div>
            <div style="padding:8px 10px;background:rgba(247,183,49,0.06);border-radius:6px;font-size:11px;color:var(--amber)">
              💡 DIIs are buying the dip — often signals institutional confidence in Indian markets at current levels.
            </div>
          </div>
        </div>
      </div>

      <!-- Sectors -->
      <div class="section">
        <div class="card-title mb-12">Sector Performance</div>
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

      <!-- Global Markets -->
      <div class="section">
        <div class="card-title mb-12">Global Markets & Commodities</div>
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

      <!-- Today's Events -->
      <div class="section">
        <div class="card-title mb-12">Today's Key Events</div>
        <div class="event-strip">
          ${keyEvents.map(ev => `
            <div class="event-item" onclick="App.chatAsk('Tell me about ${ev.event}')">
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

      <!-- Official ZEBU Asset Suite (From official zebuetrade.com) -->
      <div class="section">
        <div class="card-header mb-12">
          <span class="card-title">ZEBU Investment Products</span>
          <span class="view-time">Official ZEBU Suite</span>
        </div>
        <div class="official-products-grid">
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
      </div>

      <!-- Official ZEBU Trading Ecosystem -->
      <div class="section">
        <div class="card-header mb-12">
          <span class="card-title">ZEBU Trading Technology</span>
          <span class="view-time">Powered by ZEBU Core</span>
        </div>
        <div class="official-tools-grid">
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
      </div>

      <!-- Disclaimer -->
      <div style="padding:12px;background:rgba(247,183,49,0.05);border:1px solid rgba(247,183,49,0.1);border-radius:8px;font-size:10px;color:var(--text-tertiary);line-height:1.6;margin-top:8px">
        ⚠️ <strong style="color:var(--amber)">Disclosure:</strong> Market data and analysis provided by ZEBU AI is for informational and educational purposes only. It does not constitute SEBI-registered investment advice. Always consult a qualified financial advisor before making investment decisions. Data sourced from NSE, BSE, and other public sources. Past performance does not guarantee future results.
      </div>
    `;
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
          <div class="search-chip ${sym === symbol ? "active" : ""}" onclick="App.renderStockView('${sym}')">${sym}</div>
        `).join("")}
      </div>

      <!-- Stock Hero -->
      <div class="stock-hero section">
        <div class="stock-hero-top">
          <div class="stock-name-block">
            <div class="s-fullname">${stock.name}</div>
            <div class="s-sym">NSE: ${stock.symbol} · ${stock.sector}</div>
            <div class="s-sector">Market Cap: ${stock.marketCap}</div>
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
              <div class="intel-icon">${item.icon}</div>
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
                    <div class="h-name">${h.symbol}</div>
                    <div class="h-sym">${h.name}</div>
                    ${h.alert ? `<div class="holding-alert">⚠️ ${h.upcoming}</div>` : ""}
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
              <div class="alert-left">
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
  //  CHAT SYSTEM
  // ══════════════════════════════════════════════════════════
  initChat() {
    const input = document.getElementById("chat-input");
    const sendBtn = document.getElementById("chat-send");

    // Welcome message
    this.addMessage("ai", {
      type: "text",
      agent: "ZEBU AI Orchestrator",
      icon: "🤖",
      content: `**Good evening.** I've found **4 developments** in the Indian market relevant to your portfolio.

• ⚠️ **HDFC Bank** Q2 results in ~6 hours — you hold 35 shares (avg ₹1,540)
• 📉 **Infosys** broke 200-day EMA — your 25 shares affected (-₹534 today)
• 💸 **Tata Steel** ex-dividend tomorrow — ₹540 credit (150 shares × ₹3.60)
• 🔔 Energy & Oil is your largest sector at 28% — Crude oil down 0.43% today

Ask me anything, or click any card to explore.`,
      sources: ["NSE India", "ZEBU Portfolio API"],
      disclaimer: false,
    });

    input?.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendChat();
      }
    });
    sendBtn?.addEventListener("click", () => this.sendChat());
  },

  chatAsk(query) {
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

    this.addMessage("user", { content: query });
    const typingId = this.addTyping();

    try {
      const response = await AgentEngine.generateResponse(query);
      this.removeTyping(typingId);
      this.addMessage("ai", response);
    } catch (err) {
      this.removeTyping(typingId);
      this.addMessage("ai", { type: "text", agent: "ZEBU AI", icon: "🤖", content: "I encountered an issue processing your request. Please try again." });
    }
  },

  addMessage(role, data) {
    const container = document.getElementById("chat-messages");
    if (!container) return;

    const id = "msg-" + Date.now();
    const div = document.createElement("div");
    div.className = `chat-msg ${role}`;
    div.id = id;

    if (role === "user") {
      div.innerHTML = `
        <div class="msg-avatar user-av">RS</div>
        <div class="msg-bubble">${this.escapeHtml(data.content)}</div>`;
    } else {
      const content = this.renderMarkdown(data.content || "");
      const sources = data.sources?.length ? `
        <div class="msg-sources">
          ${data.sources.map(s => `<span class="source-chip">📍 ${s}</span>`).join("")}
        </div>` : "";
      const disclaimer = data.disclaimer ? `
        <div class="msg-disclaimer">
          ⚠️ For informational purposes only. Not SEBI-registered investment advice.
        </div>` : "";

      div.innerHTML = `
        <div class="msg-avatar">🤖</div>
        <div>
          <div class="msg-agent-tag">${data.icon || "🤖"} ${data.agent || "ZEBU AI"}</div>
          <div class="msg-bubble">
            ${content}
            ${sources}
            ${disclaimer}
          </div>
        </div>`;
    }

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
  },

  addTyping() {
    const container = document.getElementById("chat-messages");
    const id = "typing-" + Date.now();
    const div = document.createElement("div");
    div.className = "chat-msg ai";
    div.id = id;
    div.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="typing-indicator">
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
        <span class="thinking-label">Analysing markets...</span>
      </div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
  },

  removeTyping(id) {
    document.getElementById(id)?.remove();
  },

  renderMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/^#{1,3} (.+)$/gm, "<strong>$1</strong>")
      .replace(/^• (.+)$/gm, "• $1")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>")
      .replace(/<p><\/p>/g, "");
  },

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  },

  // ── Mock Alerts ───────────────────────────────────────────
  scheduleMockAlerts() {
    // Fire a mock push alert after 8 seconds
    setTimeout(() => {
      this.showToast("🔔 IRCTC: Volume 4.2x average — approaching ₹900 resistance", "alert-toast");
    }, 8000);

    setTimeout(() => {
      this.showToast("📊 HDFC Bank: Options IV rising ahead of Q2 results", "info-toast");
    }, 20000);
  },

  showToast(msg, cls = "info-toast") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${cls}`;
    toast.innerHTML = `<span>${msg}</span>`;
    toast.style.cursor = "pointer";
    toast.onclick = () => {
      this.chatAsk(msg.replace(/^[^:]+: /, "Explain: "));
      toast.remove();
    };
    container?.appendChild(toast);
    setTimeout(() => toast.remove(), 6000);
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => App.init());
