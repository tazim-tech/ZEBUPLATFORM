// ZEBU AI — Agent Engine v2
// Visible tool use · Job handlers · AgentMemory · AgentMonitor · Action proposals

// ════════════════════════════════════════════════════════════
//  AGENT MEMORY — persists risk style, holdings focus, context
// ════════════════════════════════════════════════════════════
const AgentMemory = {
  _key: "zebu_agent_memory",

  defaults() {
    return {
      riskStyle: "moderate",           // conservative | moderate | aggressive
      holdingsFocus: ["TCS", "HDFCBANK", "RELIANCE"],
      lastQueries: [],                  // max 5
      preferredConcepts: [],
      alertsSet: [],
      watchlist: [],
      paperOrders: [],
      kycStarted: false,
      sessionCount: 0,
    };
  },

  load() {
    try {
      return JSON.parse(localStorage.getItem(this._key)) || this.defaults();
    } catch { return this.defaults(); }
  },

  save(data) {
    localStorage.setItem(this._key, JSON.stringify(data));
  },

  get() { return this.load(); },

  set(updates) {
    const m = this.load();
    Object.assign(m, updates);
    this.save(m);
    return m;
  },

  addQuery(q) {
    const m = this.load();
    m.lastQueries = [q, ...m.lastQueries].slice(0, 5);
    this.save(m);
  },

  addConcept(c) {
    const m = this.load();
    if (!m.preferredConcepts.includes(c)) m.preferredConcepts.push(c);
    this.save(m);
  },

  addAlert(alert) {
    const m = this.load();
    m.alertsSet.push({ ...alert, id: Date.now() });
    this.save(m);
    return m.alertsSet;
  },

  addWatchlist(symbol) {
    const m = this.load();
    if (!m.watchlist.includes(symbol)) m.watchlist.push(symbol);
    this.save(m);
  },

  addPaperOrder(order) {
    const m = this.load();
    m.paperOrders.push({ ...order, id: Date.now(), ts: new Date().toLocaleTimeString("en-IN") });
    this.save(m);
    return m.paperOrders;
  },

  startKYC() {
    this.set({ kycStarted: true });
  },

  incrementSession() {
    const m = this.load();
    m.sessionCount = (m.sessionCount || 0) + 1;
    this.save(m);
    return m.sessionCount;
  },

  clear() {
    localStorage.removeItem(this._key);
  },
};


// ════════════════════════════════════════════════════════════
//  TOOL USE RENDERER — visible "using X…" animation steps
// ════════════════════════════════════════════════════════════
const ToolUse = {
  // Returns array of {label, delay} steps to display before the answer
  stepsFor(intent) {
    const steps = {
      market:         [{ label: "Market Tool", delay: 500 }, { label: "FII/DII Feed", delay: 900 }, { label: "Breadth Analysis", delay: 1300 }],
      stock_research: [{ label: "Research Tool", delay: 400 }, { label: "Technical Engine", delay: 900 }, { label: "Fundamental Screener", delay: 1400 }],
      portfolio:      [{ label: "Portfolio Tool", delay: 400 }, { label: "Risk Engine", delay: 900 }, { label: "Correlation Matrix", delay: 1400 }],
      education:      [{ label: "Learn Tool", delay: 400 }, { label: "Market Context Engine", delay: 900 }],
      events:         [{ label: "Alerts Tool", delay: 400 }, { label: "OI Scanner", delay: 900 }, { label: "Volume Detector", delay: 1300 }],
      set_alert:      [{ label: "Alerts Tool", delay: 400 }, { label: "Price Level Engine", delay: 800 }],
      stress_test:    [{ label: "Portfolio Tool", delay: 400 }, { label: "Stress Engine", delay: 900 }, { label: "Scenario Builder", delay: 1400 }],
      results_prep:   [{ label: "Research Tool", delay: 400 }, { label: "Events Calendar", delay: 900 }, { label: "Options Scanner", delay: 1400 }],
      general:        [{ label: "ZEBU Orchestrator", delay: 400 }],
    };
    return steps[intent] || steps.general;
  },
};


// ════════════════════════════════════════════════════════════
//  AGENT ENGINE — main response orchestrator
// ════════════════════════════════════════════════════════════
const AgentEngine = {

  // ── Intent classifier ──
  classifyIntent(query) {
    const q = query.toLowerCase();
    if (/\b(stress.test|stress test|risk|rebalance|concentration|diversi|what.if)\b/.test(q)) return "stress_test";
    if (/\b(set.alert|alert.on|alert.when|price.alert|alert.at|trigger)\b/.test(q)) return "set_alert";
    if (/\b(results|earnings|q[1-4]|quarterly|results.day|prep.for|before.results)\b/.test(q)) return "results_prep";
    if (/\b(portfolio|holdings|position|my stock|my shares|how.*i.doing)\b/.test(q)) return "portfolio";
    if (/\b(explain|what is|how does|meaning|concept|define|learn|teach|what.*rsi|what.*pe|what.*macd|what.*fii|what.*vix|what.*pcr)\b/.test(q)) return "education";
    if (/\b(alert|event|unusual|volume|breakout|oi|open interest)\b/.test(q)) return "events";
    if (/\b(market|nifty|sensex|banknifty|bank nifty|sector|fii|dii|breadth|today|brief|verdict|outlook)\b/.test(q)) return "market";
    const symbols = Object.keys(window.ZEBU_DATA.STOCKS);
    if (symbols.some(s => q.includes(s.toLowerCase()) || q.includes(window.ZEBU_DATA.STOCKS[s].name.toLowerCase()))) return "stock_research";
    if (/\b(tcs|hdfc|reliance|tatamotors|tata motors|irctc|tatasteel|tata steel|infosys|wipro|infy)\b/.test(q)) return "stock_research";
    return "general";
  },

  // ── Extract stock symbol ──
  extractSymbol(query) {
    const q = query.toLowerCase();
    const map = {
      "tcs": "TCS", "tata consultancy": "TCS",
      "hdfc bank": "HDFCBANK", "hdfcbank": "HDFCBANK", "hdfc": "HDFCBANK",
      "reliance": "RELIANCE", "ril": "RELIANCE",
      "tata motors": "TATAMOTORS", "tatamotors": "TATAMOTORS",
      "irctc": "IRCTC",
      "tata steel": "TATASTEEL", "tatasteel": "TATASTEEL",
      "infosys": "INFY", "infy": "INFY",
    };
    for (const [key, sym] of Object.entries(map)) {
      if (q.includes(key)) return sym;
    }
    // Check all available stocks
    for (const sym of Object.keys(window.ZEBU_DATA.STOCKS)) {
      if (q.includes(sym.toLowerCase())) return sym;
    }
    return null;
  },

  // ── Extract concept ──
  extractConcept(query) {
    const q = query.toLowerCase();
    if (/\brsi\b/.test(q)) return "rsi";
    if (/\bp\/e|pe ratio|price to earnings/.test(q)) return "pe";
    if (/\bfii|dii|institutional/.test(q)) return "fiiDii";
    if (/\bpcr|put.call/.test(q)) return "pcr";
    if (/\bmacd\b/.test(q)) return "macd";
    if (/\bvix|volatility/.test(q)) return "vix";
    return null;
  },

  // ── Main response generator with tool-use steps ──
  async generateResponse(query, context = {}) {
    const intent = this.classifyIntent(query);
    AgentMemory.addQuery(query);

    // Return tool steps + response factory
    const toolSteps = ToolUse.stepsFor(intent);
    const totalDelay = toolSteps[toolSteps.length - 1].delay + 600;

    const { MARKET_DATA, STOCKS, USER_PORTFOLIO, MARKET_EVENTS, EDUCATION_CONCEPTS } = window.ZEBU_DATA;
    const mem = AgentMemory.get();

    // Build response after simulated tool use
    await new Promise(r => setTimeout(r, totalDelay));

    switch (intent) {
      case "market":
        return this.marketBriefResponse(query, MARKET_DATA, mem);

      case "stock_research": {
        const sym = this.extractSymbol(query);
        if (sym && STOCKS[sym]) return this.stockResearchResponse(query, STOCKS[sym], MARKET_DATA, mem);
        return this.unknownStockResponse(query);
      }

      case "portfolio":
        return this.portfolioResponse(query, USER_PORTFOLIO, MARKET_DATA, mem);

      case "stress_test":
        return this.stressTestResponse(query, USER_PORTFOLIO, MARKET_DATA, mem);

      case "set_alert": {
        const sym = this.extractSymbol(query) || "NIFTY50";
        const stock = STOCKS[sym];
        return this.setAlertResponse(query, sym, stock, mem);
      }

      case "results_prep": {
        const sym = this.extractSymbol(query) || "HDFCBANK";
        const stock = STOCKS[sym] || STOCKS["HDFCBANK"];
        return this.resultsPrepResponse(query, stock, MARKET_DATA, mem);
      }

      case "education": {
        const concept = this.extractConcept(query);
        if (concept && EDUCATION_CONCEPTS[concept]) {
          AgentMemory.addConcept(concept);
          return this.educationResponse(query, EDUCATION_CONCEPTS[concept], MARKET_DATA);
        }
        return this.generalEducationResponse(query);
      }

      case "events":
        return this.eventsResponse(query, MARKET_EVENTS, mem);

      default:
        return this.generalResponse(query, MARKET_DATA, mem);
    }
  },

  // ── Get tool steps for a query (used by UI before response) ──
  getToolSteps(query) {
    return ToolUse.stepsFor(this.classifyIntent(query));
  },

  // ════════════════════════════════════════════════════
  //  RESPONSE HANDLERS
  // ════════════════════════════════════════════════════

  marketBriefResponse(query, md, mem) {
    const n = md.indices.nifty50;
    const bn = md.indices.bankNifty;
    const topSector = md.sectors.find(s => s.change > 0);
    const worstSector = [...md.sectors].sort((a, b) => a.change - b.change)[0];
    const regime = n.changePct > 0.5 ? "Bullish" : n.changePct < -0.5 ? "Risk-Off" : "Cautiously Bullish";

    return {
      type: "market_brief",
      agent: "Market Intelligence Agent",
      icon: "📊",
      content: `**Market Verdict — ${md.timestamp}**\n\nRegime: **${regime} (Selective Longs)**\n\n**NIFTY 50**: ₹${n.ltp.toLocaleString("en-IN")} ${n.changePct >= 0 ? "▲" : "▼"} ${Math.abs(n.changePct).toFixed(2)}% · **BANK NIFTY**: ₹${bn.ltp.toLocaleString("en-IN")} ${bn.changePct >= 0 ? "▲" : "▼"} ${Math.abs(bn.changePct).toFixed(2)}%\n\n**Why:** FIIs sold ₹${Math.abs(md.fiiDii.fii.net).toFixed(0)} Cr — US Fed "higher for longer" driving EM outflows. DIIs bought ₹${md.fiiDii.dii.net.toFixed(0)} Cr, cushioning the fall.\n\n**Portfolio impact:** Your IT holdings (TCS) are the hardest hit at sector level. Your HDFC Bank position is showing resilience ahead of Q2 results at 4 PM.\n\n**Leading:** ${topSector?.icon} ${topSector?.name} +${topSector?.change.toFixed(2)}% · **Lagging:** ${worstSector?.icon} ${worstSector?.name} ${worstSector?.change.toFixed(2)}%`,
      sources: ["NSE India", "SEBI FII/DII"],
      disclaimer: true,
      nextMoves: [
        { label: "💼 See portfolio impact", action: "chat", query: "Stress-test my portfolio today" },
        { label: "📊 HDFC Bank Q2 setup", action: "chat", query: "Prep me for HDFC Bank results today" },
        { label: "🔔 Set Nifty alert", action: "proposeAlert", symbol: "NIFTY50", price: 24200, direction: "below", reason: "Key support" },
      ],
    };
  },

  stockResearchResponse(query, stock, md, mem) {
    const t = stock.technicals;
    const f = stock.fundamentals;
    const fin = stock.financials;
    const signal_color = t.signal === "BULLISH" ? "🟢" : t.signal === "BEARISH" ? "🔴" : "🟡";
    const pe_vs_sector = f.pe < f.sectorPE ? "below sector avg (potential value)" : "above sector avg";
    const inPortfolio = mem.holdingsFocus?.includes(stock.symbol);

    return {
      type: "stock_research",
      agent: "Stock Research Agent",
      icon: "🔍",
      stock: stock,
      openScreen: { view: "research", symbol: stock.symbol },
      content: `**${stock.name} (${stock.symbol})** — Research Complete\n\n**Price:** ₹${stock.ltp.toLocaleString("en-IN")} ${stock.changePct >= 0 ? "▲" : "▼"} ${Math.abs(stock.changePct).toFixed(2)}% · 52W: ₹${stock.week52Low} – ₹${stock.week52High}\n\n**Technical** ${signal_color} ${t.signal}\nRSI ${t.rsi14} (${t.rsi14 > 70 ? "overbought ⚠️" : t.rsi14 < 30 ? "oversold — watch for reversal" : "neutral"}) · Support ₹${t.support} · Resistance ₹${t.resistance}\n\n**Fundamental** P/E ${f.pe}x — ${pe_vs_sector} · ROE ${f.roe}% · Revenue ${fin.revenue} (${fin.revenueGrowth})\n\n**Verdict:** ${stock.analysis.summary}\n\n${inPortfolio ? "📁 _You hold this stock — shown in context of your portfolio_" : ""}`,
      sources: ["NSE India", "Screener.in"],
      disclaimer: true,
      nextMoves: [
        { label: "🔔 Set alert at support", action: "proposeAlert", symbol: stock.symbol, price: t.support, direction: "below", reason: `${stock.symbol} support level` },
        { label: "📋 Add to watchlist", action: "proposeWatchlist", symbol: stock.symbol },
        { label: "📄 Paper order", action: "proposePaperOrder", symbol: stock.symbol, price: stock.ltp, qty: Math.floor(5000 / stock.ltp) || 1 },
      ],
    };
  },

  unknownStockResponse(query) {
    return {
      type: "text",
      agent: "Stock Research Agent",
      icon: "🔍",
      content: `I can analyse any NSE/BSE stock. In this demo I have: **TCS, HDFC Bank, Reliance, Tata Motors, IRCTC, Tata Steel, Infosys**.\n\nTry: *"Analyse TCS"*, *"Research Reliance"*, *"HDFC Bank Q2 setup"*`,
      sources: [],
      disclaimer: false,
      nextMoves: [
        { label: "🔍 Analyse TCS", action: "chat", query: "Analyse TCS" },
        { label: "🔍 Research HDFC Bank", action: "chat", query: "Analyse HDFC Bank" },
        { label: "🔍 Reliance setup", action: "chat", query: "Analyse Reliance" },
      ],
    };
  },

  portfolioResponse(query, portfolio, md, mem) {
    const dayColor = portfolio.dayPnl >= 0 ? "📈" : "📉";
    const alerts = portfolio.holdings.filter(h => h.alert);

    return {
      type: "portfolio",
      agent: "Portfolio Intelligence Agent",
      icon: "💼",
      openScreen: { view: "portfolio" },
      content: `**Portfolio — ${md.timestamp}**\n\nValue: **₹${portfolio.currentValue.toLocaleString("en-IN")}** · All-time: **+₹${portfolio.totalPnl.toLocaleString("en-IN")} (+${portfolio.totalPnlPct.toFixed(2)}%)**\nToday ${dayColor}: **${portfolio.dayPnl < 0 ? "-" : "+"}₹${Math.abs(portfolio.dayPnl).toLocaleString("en-IN")} (${portfolio.dayPnlPct.toFixed(2)}%)**\n\n**${alerts.length} holdings need attention:**\n${alerts.map(h => `⚠️ **${h.name}** — ${h.upcoming}`).join("\n")}\n\n**Context:** Today's dip is macro-driven (NIFTY -0.80%), not stock-specific. IT selling (you hold TCS) is the biggest contributor. HDFC Bank Q2 results at 4 PM could swing ±1.5%.`,
      sources: ["ZEBU Portfolio API", "NSE India"],
      disclaimer: true,
      nextMoves: [
        { label: "⚡ Stress-test today's scenario", action: "chat", query: "Stress-test my portfolio with a 2% Nifty fall" },
        { label: "🔔 Alert on HDFC results", action: "proposeAlert", symbol: "HDFCBANK", price: 1520, direction: "below", reason: "Q2 results protection level" },
        { label: "📊 View full portfolio", action: "openScreen", view: "portfolio" },
      ],
    };
  },

  stressTestResponse(query, portfolio, md, mem) {
    const p = portfolio;
    const fallScenario = query.toLowerCase().includes("2%") ? 2 : query.toLowerCase().includes("5%") ? 5 : 3;
    const portfolioImpact = -(p.currentValue * (fallScenario / 100));
    const biggestRisk = p.holdings.sort((a, b) => b.weight - a.weight)[0];

    return {
      type: "stress_test",
      agent: "Portfolio Risk Engine",
      icon: "⚡",
      openScreen: { view: "portfolio" },
      content: `**Stress Test — ${fallScenario}% Market Decline Scenario**\n\n**If NIFTY falls ${fallScenario}% from here:**\nEstimated portfolio impact: **-₹${Math.abs(portfolioImpact).toLocaleString("en-IN", { maximumFractionDigits: 0 })}**\n\n**Biggest concentration risk:**\n${biggestRisk.name} at **${biggestRisk.weight.toFixed(1)}% of portfolio** — amplifies any sector move.\n\n**Sector exposure:**\n• IT: ~35% (most exposed to US macro)\n• Financials: ~28% (HDFC Bank — event risk today)\n• Energy/Oil: ~22% (relatively stable)\n\n**Risk score: ${p.riskScore || 74}/100 — Moderate**\nYou have adequate diversification but IT concentration is elevated.\n\n**Resilience note:** DII buying at ₹${md.fiiDii.dii.net.toFixed(0)} Cr/day provides a cushion near NIFTY 24,200.`,
      sources: ["ZEBU Portfolio API", "NSE India"],
      disclaimer: true,
      nextMoves: [
        { label: "🔔 Set stop-loss on TCS", action: "proposeAlert", symbol: "TCS", price: 4000, direction: "below", reason: "Stop-loss from stress test" },
        { label: "🔔 Set HDFC results alert", action: "proposeAlert", symbol: "HDFCBANK", price: 1520, direction: "below", reason: "Q2 results protection" },
        { label: "📊 See full portfolio", action: "openScreen", view: "portfolio" },
      ],
    };
  },

  setAlertResponse(query, symbol, stock, mem) {
    const price = stock?.technicals?.support || (stock?.ltp ? Math.round(stock.ltp * 0.97) : 24200);
    const reason = stock ? `${symbol} technical support` : "Key market level";

    return {
      type: "set_alert",
      agent: "Alerts Agent",
      icon: "🔔",
      content: `**Alert Setup — ${symbol}**\n\nI've identified the optimal alert level for **${symbol}**:\n\n• **Level:** ₹${price.toLocaleString("en-IN")}\n• **Why:** ${reason}\n• **Trigger:** Price crosses below this level\n• **Notification:** Chat message + toast\n\nCurrently ${stock?.ltp ? `₹${stock.ltp.toLocaleString("en-IN")} (${((stock.ltp - price) / price * 100).toFixed(1)}% above trigger)` : "monitoring active"}\n\nConfirm below and the watch loop will monitor it actively.`,
      sources: ["NSE India"],
      disclaimer: false,
      nextMoves: [
        { label: "✅ Set this alert", action: "proposeAlert", symbol, price, direction: "below", reason, autoOpen: true },
        { label: "📋 Add to watchlist too", action: "proposeWatchlist", symbol },
      ],
    };
  },

  resultsPrepResponse(query, stock, md, mem) {
    if (!stock) stock = window.ZEBU_DATA.STOCKS["HDFCBANK"];

    return {
      type: "results_prep",
      agent: "Results Day Agent",
      icon: "📊",
      openScreen: { view: "research", symbol: stock.symbol },
      content: `**Results Day Prep — ${stock.name} Q2**\n\n**Key numbers the market is watching:**\n• Net Interest Margin (NIM): Expected ~4.2% (prev 4.1%)\n• Credit growth: Expected ~18% YoY\n• Slippage ratio: Market nervous about this\n• Net profit guidance\n\n**Current setup:**\nCMP ₹${stock.ltp.toLocaleString("en-IN")} · RSI ${stock.technicals.rsi14} · IV elevated (options pricing ±3% move)\n\n**Scenarios:**\n🟢 Beat → Target ₹${stock.technicals.resistance.toLocaleString("en-IN")} (resistance)\n🔴 Miss → Risk ₹${stock.technicals.support.toLocaleString("en-IN")} (support)\n\n**Your position:** You hold ${mem.holdingsFocus?.includes("HDFCBANK") ? "35 shares (avg ₹1,540) — in profit" : "no direct position — watching"}\n\n**Action:** Set a price alert above/below current to capture the move.`,
      sources: ["NSE India", "HDFC Bank investor relations"],
      disclaimer: true,
      nextMoves: [
        { label: "🟢 Set alert if it beats", action: "proposeAlert", symbol: stock.symbol, price: stock.technicals.resistance, direction: "above", reason: "Results beat breakout" },
        { label: "🔴 Set stop if it misses", action: "proposeAlert", symbol: stock.symbol, price: stock.technicals.support, direction: "below", reason: "Results miss protection" },
        { label: "📄 Paper trade on results", action: "proposePaperOrder", symbol: stock.symbol, price: stock.ltp, qty: 5 },
      ],
    };
  },

  educationResponse(query, concept, md) {
    return {
      type: "education",
      agent: "AI Financial Mentor",
      icon: "🎓",
      openScreen: { view: "education" },
      content: `**${concept.term}**\n\n*${concept.shortDef}*\n\n${concept.explanation}\n\n**Live market context right now:** ${concept.currentExample}`,
      sources: ["Financial education KB", "NSE India"],
      disclaimer: false,
      nextMoves: [
        { label: "📊 See this in today's market", action: "chat", query: `Show me ${concept.term} in today's market data` },
        { label: "🔍 Pick a stock using this", action: "chat", query: `Use ${concept.term} to find a setup in TCS or Reliance` },
      ],
    };
  },

  generalEducationResponse(query) {
    return {
      type: "education",
      agent: "AI Financial Mentor",
      icon: "🎓",
      content: `I can explain any financial concept using today's Indian market as a live example.\n\n**Try:** *"What is RSI?"*, *"Explain P/E ratio"*, *"What is FII/DII?"*, *"What does PCR mean?"*, *"Explain MACD"*`,
      sources: [],
      disclaimer: false,
      nextMoves: [
        { label: "🎓 Explain RSI", action: "chat", query: "What is RSI and what is it saying today?" },
        { label: "🎓 What is FII?", action: "chat", query: "What is FII and DII and why does it matter?" },
        { label: "📊 See all topics", action: "openScreen", view: "education" },
      ],
    };
  },

  eventsResponse(query, events, mem) {
    const highPriority = events.filter(e => e.severity === "high");
    return {
      type: "events",
      agent: "Market Event Detection Agent",
      icon: "🔔",
      openScreen: { view: "events" },
      content: `**Market Events — Today**\n\nDetected **${events.length} signals** — ${highPriority.length} high priority:\n\n${highPriority.slice(0, 3).map(e => `🔴 **${e.symbol}** — ${e.title} *(${e.time})*\n${e.detail}`).join("\n\n")}`,
      sources: ["NSE India", "BSE India"],
      disclaimer: true,
      nextMoves: [
        { label: "📋 See all alerts", action: "openScreen", view: "events" },
        { label: "🔔 Set alert on top signal", action: "proposeAlert", symbol: highPriority[0]?.symbol || "NIFTY50", price: 24200, direction: "below", reason: highPriority[0]?.title || "Market signal" },
      ],
    };
  },

  generalResponse(query, md, mem) {
    const q = query.toLowerCase();

    if (/why.*(it|tech).*(fall|down|drop)/.test(q)) {
      return {
        type: "text",
        agent: "Market Intelligence Agent",
        icon: "📊",
        content: `**Why IT stocks are falling today**\n\nTwo connected reasons:\n\n**1. US Fed "higher for longer"**\nFed minutes signal elevated rates → US tech firms cut discretionary spend → Less deal flow for TCS, Infosys, Wipro.\n\n**2. Dollar strength**\nStronger USD reduces rupee-hedging margins on IT revenues.\n\n**Today's moves:** TCS ↓1.87% · Infosys ↓2.14% · Wipro ↓1.92% · NIFTY IT ↓1.41%\n\n**Key:** This is macro-driven, not company-specific. TCS deal book remains strong. Oversold RSI (${window.ZEBU_DATA.STOCKS.TCS?.technicals.rsi14 || 38}) may attract mean-reversion buyers.`,
        sources: ["NSE India", "Reuters", "Fed Minutes"],
        disclaimer: true,
        nextMoves: [
          { label: "🔍 Full TCS analysis", action: "chat", query: "Analyse TCS in detail" },
          { label: "🔔 Set TCS support alert", action: "proposeAlert", symbol: "TCS", price: 4000, direction: "below", reason: "IT selloff protection" },
        ],
      };
    }

    if (/vix|volatility/.test(q)) {
      return {
        type: "education",
        agent: "AI Financial Mentor",
        icon: "🎓",
        content: `**India VIX — Live at ${md.indices.indiaVix.ltp}**\n\nVIX is up **+${md.indices.indiaVix.changePct.toFixed(1)}%** today.\n\nVIX below 15 = calm · 15–20 = moderate fear · above 20 = high fear/hedging\n\nAt ${md.indices.indiaVix.ltp}, we're in "moderate" — but the single-day spike is notable. Options premiums are expensive today. If you're buying options: wait. If you're selling options: premium income is higher.`,
        sources: ["NSE India VIX"],
        disclaimer: false,
        nextMoves: [
          { label: "📊 Market brief in context", action: "chat", query: "What's the market verdict for today?" },
        ],
      };
    }

    return {
      type: "text",
      agent: "ZEBU AI Orchestrator",
      icon: "🤖",
      content: `I'm your ZEBU market agent. Tell me a **job** and I'll run it end-to-end:\n\n📊 *"What's the market verdict for today?"*\n🔍 *"Analyse TCS"* · *"HDFC Bank results prep"*\n💼 *"Stress-test my portfolio"*\n🔔 *"Set an alert on TCS at support"*\n🎓 *"Explain RSI with today's example"*\n\nEvery job ends with an action — alert, order, watchlist, or KYC. No dead-end answers.`,
      sources: [],
      disclaimer: false,
      nextMoves: [
        { label: "📊 Market verdict", action: "chat", query: "What's the market verdict for today?" },
        { label: "💼 Stress-test portfolio", action: "chat", query: "Stress-test my portfolio" },
        { label: "🔍 Analyse TCS", action: "chat", query: "Analyse TCS" },
      ],
    };
  },
};


// ════════════════════════════════════════════════════════════
//  AGENT MONITOR — watch loop; posts alerts as chat messages
// ════════════════════════════════════════════════════════════
const AgentMonitor = {
  _timer: null,
  _fired: [],

  _alerts: [
    {
      id: "irctc_vol",
      delay: 22000,
      symbol: "IRCTC",
      title: "Volume 4.2× average — approaching ₹900 resistance",
      detail: "IRCTC is showing unusual volume accumulation. Approaching a key resistance at ₹900 where it has rejected 3 times this month. A breakout above this level on this volume could signal a trend continuation.",
      nextMoves: [
        { label: "🔔 Set alert at ₹900", action: "proposeAlert", symbol: "IRCTC", price: 900, direction: "above", reason: "Resistance breakout" },
        { label: "🔍 Full IRCTC analysis", action: "chat", query: "Analyse IRCTC" },
      ],
    },
    {
      id: "hdfc_iv",
      delay: 45000,
      symbol: "HDFCBANK",
      title: "Options IV spiking — market bracing for Q2 results",
      detail: "HDFCBANK options implied volatility jumped 18% in the last hour. The market is pricing in a ±3.2% move on results. You hold 35 shares — that's approximately ₹1,640 at risk if results disappoint.",
      nextMoves: [
        { label: "📊 See results prep", action: "chat", query: "Prep me for HDFC Bank results today" },
        { label: "🔔 Set protection alert", action: "proposeAlert", symbol: "HDFCBANK", price: 1520, direction: "below", reason: "Results day protection" },
      ],
    },
    {
      id: "tcs_support",
      delay: 80000,
      symbol: "TCS",
      title: "Testing 200-day EMA — critical level",
      detail: "TCS is now trading at ₹4,089, just ₹9 above its 200-day EMA (₹4,080). This is a key long-term support. A close below this level would be a significant technical deterioration. You hold TCS in your portfolio.",
      nextMoves: [
        { label: "🔔 Alert at ₹4,080 EMA", action: "proposeAlert", symbol: "TCS", price: 4080, direction: "below", reason: "200-day EMA support breach" },
        { label: "🔍 Analyse TCS now", action: "chat", query: "Analyse TCS — 200 EMA holding?" },
      ],
    },
  ],

  start() {
    this._alerts.forEach(alert => {
      setTimeout(() => {
        if (this._fired.includes(alert.id)) return;
        this._fired.push(alert.id);
        this._fireAlert(alert);
      }, alert.delay);
    });
  },

  _fireAlert(alert) {
    // Post as an agent-style watch loop message in chat
    if (window.App && App.addWatchMessage) {
      App.addWatchMessage(alert);
    }
    // Also fire a clickable toast
    if (window.App && App.showToast) {
      App.showToast(`🔔 ${alert.symbol}: ${alert.title}`, "alert-toast");
    }
  },
};


window.AgentEngine = AgentEngine;
window.AgentMemory = AgentMemory;
window.AgentMonitor = AgentMonitor;
