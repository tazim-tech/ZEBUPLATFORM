// ZEBU AI — Agent Response Engine
// Simulates multi-agent AI orchestration with keyword routing

const AgentEngine = {
  // Intent classifier
  classifyIntent(query) {
    const q = query.toLowerCase();
    if (/\b(portfolio|holdings|position|my stock|my shares)\b/.test(q)) return "portfolio";
    if (/\b(explain|what is|how does|meaning|concept|define|learn|teach)\b/.test(q)) return "education";
    if (/\b(alert|event|unusual|volume|breakout|oi|open interest)\b/.test(q)) return "events";
    if (/\b(market|nifty|sensex|banknifty|sector|fii|dii|breadth|today|brief)\b/.test(q)) return "market";
    const symbols = Object.keys(window.ZEBU_DATA.STOCKS);
    if (symbols.some(s => q.includes(s.toLowerCase()) || q.includes(window.ZEBU_DATA.STOCKS[s].name.toLowerCase()))) return "stock_research";
    if (/\b(tcs|hdfc|reliance|tatamotors|tata motors|irctc|tatasteel|tata steel|infosys|wipro)\b/.test(q)) return "stock_research";
    return "general";
  },

  // Extract stock symbol from query
  extractSymbol(query) {
    const q = query.toLowerCase();
    const map = {
      "tcs": "TCS", "hdfc bank": "HDFCBANK", "hdfcbank": "HDFCBANK",
      "reliance": "RELIANCE", "ril": "RELIANCE",
      "tata motors": "TATAMOTORS", "tatamotors": "TATAMOTORS",
      "irctc": "IRCTC",
      "tata steel": "TATASTEEL", "tatasteel": "TATASTEEL",
    };
    for (const [key, sym] of Object.entries(map)) {
      if (q.includes(key)) return sym;
    }
    return null;
  },

  // Extract education concept
  extractConcept(query) {
    const q = query.toLowerCase();
    if (/\brsi\b/.test(q)) return "rsi";
    if (/\bp\/e|pe ratio|price to earnings\b/.test(q)) return "pe";
    if (/\bfii|dii|institutional\b/.test(q)) return "fiiDii";
    if (/\bpcr|put.call\b/.test(q)) return "pcr";
    if (/\bmacd\b/.test(q)) return "macd";
    return null;
  },

  // Main response generator
  async generateResponse(query, context = {}) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

    const intent = this.classifyIntent(query);
    const { MARKET_DATA, STOCKS, USER_PORTFOLIO, MARKET_EVENTS, EDUCATION_CONCEPTS } = window.ZEBU_DATA;

    switch (intent) {
      case "market":
        return this.marketBriefResponse(query, MARKET_DATA);
      case "stock_research": {
        const sym = this.extractSymbol(query);
        if (sym && STOCKS[sym]) return this.stockResearchResponse(query, STOCKS[sym], MARKET_DATA);
        return this.unknownStockResponse(query);
      }
      case "portfolio":
        return this.portfolioResponse(query, USER_PORTFOLIO, MARKET_DATA);
      case "education": {
        const concept = this.extractConcept(query);
        if (concept && EDUCATION_CONCEPTS[concept]) return this.educationResponse(query, EDUCATION_CONCEPTS[concept], MARKET_DATA);
        return this.generalEducationResponse(query);
      }
      case "events":
        return this.eventsResponse(query, MARKET_EVENTS);
      default:
        return this.generalResponse(query, MARKET_DATA);
    }
  },

  marketBriefResponse(query, md) {
    const n = md.indices.nifty50;
    const bn = md.indices.bankNifty;
    const topSector = md.sectors.find(s => s.change > 0);
    const worstSector = [...md.sectors].sort((a, b) => a.change - b.change)[0];

    return {
      type: "market_brief",
      agent: "Market Intelligence Agent",
      icon: "📊",
      content: `**Indian Market Overview — ${md.timestamp}**

**NIFTY 50**: ₹${n.ltp.toLocaleString("en-IN")} ${n.changePct >= 0 ? "▲" : "▼"} ${Math.abs(n.changePct).toFixed(2)}%
**BANK NIFTY**: ₹${bn.ltp.toLocaleString("en-IN")} ${bn.changePct >= 0 ? "▲" : "▼"} ${Math.abs(bn.changePct).toFixed(2)}%
**India VIX**: ${md.indices.indiaVix.ltp} ▲ ${md.indices.indiaVix.changePct.toFixed(1)}% (elevated)

**Market Breadth**: ${md.breadth.advances} advances / ${md.breadth.declines} declines (ratio: ${md.breadth.ratio.toFixed(2)})

**Why markets are lower today:**
FIIs sold ₹${Math.abs(md.fiiDii.fii.net).toFixed(0)} Cr yesterday — the US Fed's "higher for longer" rate signal is prompting global fund reallocation away from emerging markets.

**Best sector today**: ${topSector?.icon} ${topSector?.name} (${topSector?.change > 0 ? "+" : ""}${topSector?.change.toFixed(2)}%) — benefiting from domestic demand and DII buying.

**Worst sector**: ${worstSector?.icon} ${worstSector?.name} (${worstSector?.change.toFixed(2)}%) — US macro headwinds weighing on IT; broader market risk-off hurting metals.

**FII Activity**: Sold ₹${Math.abs(md.fiiDii.fii.net).toFixed(0)} Cr | **DII**: Bought ₹${md.fiiDii.dii.net.toFixed(0)} Cr (partially cushioning)

**Key watch today**: HDFC Bank Q2 results at 4 PM and RBI MPC minutes release.`,
      sources: ["NSE India", "SEBI FII/DII data"],
      disclaimer: true,
    };
  },

  stockResearchResponse(query, stock, md) {
    const t = stock.technicals;
    const f = stock.fundamentals;
    const fin = stock.financials;
    const signal_color = t.signal === "BULLISH" ? "🟢" : t.signal === "BEARISH" ? "🔴" : "🟡";
    const pe_vs_sector = f.pe < f.sectorPE ? "below sector average (potentially undervalued)" : "above sector average";

    return {
      type: "stock_research",
      agent: "Stock Research Agent",
      icon: "🔍",
      stock: stock,
      content: `**${stock.name} (${stock.symbol})** — Research Snapshot
*${md.timestamp}*

**Price Action**
CMP: ₹${stock.ltp.toLocaleString("en-IN")} ${stock.changePct >= 0 ? "▲" : "▼"} ${Math.abs(stock.changePct).toFixed(2)}%
52W Range: ₹${stock.week52Low} – ₹${stock.week52High}
Volume: ${stock.volume} (Avg: ${stock.avgVolume})

**Technical View** ${signal_color} ${t.signal}
RSI (14): ${t.rsi14} — ${t.rsi14 > 70 ? "Overbought ⚠️" : t.rsi14 < 30 ? "Oversold — potential reversal" : "Neutral territory"}
Above 200-EMA (₹${t.ema200}): ${stock.ltp > t.ema200 ? "✅ Yes" : "❌ No"}
Key Support: ₹${t.support} | Resistance: ₹${t.resistance}

**Fundamental View**
P/E: ${f.pe}x — ${pe_vs_sector}
ROE: ${f.roe}% | ROCE: ${f.roce}%
Revenue: ${fin.revenue} (${fin.revenueGrowth}) | PAT: ${fin.pat} (${fin.patGrowth})

**What's happening**
${stock.analysis.summary}

**Key Risks**
${stock.analysis.risks.map(r => `• ${r}`).join("\n")}

**Recent News** *(last 7 days)*
${stock.recentNews.map(n => `${n.sentiment === "positive" ? "📗" : n.sentiment === "negative" ? "📕" : "📘"} [${n.date}] ${n.headline}`).join("\n")}`,
      sources: [`NSE India`, `Screener.in`, `Reuters`],
      disclaimer: true,
    };
  },

  unknownStockResponse(query) {
    return {
      type: "text",
      agent: "Stock Research Agent",
      icon: "🔍",
      content: `I can research any NSE/BSE listed stock for you. Try asking about stocks I have data for:

**Available in this demo**: TCS, HDFC Bank, Reliance Industries, Tata Motors, IRCTC, Tata Steel

For example:
• *"Analyse TCS"*
• *"Research Reliance"*
• *"What's happening with Tata Motors?"*

In production, I can research any listed Indian stock using live NSE/BSE data.`,
      sources: [],
      disclaimer: false,
    };
  },

  portfolioResponse(query, portfolio, md) {
    const dayColor = portfolio.dayPnl >= 0 ? "📈" : "📉";
    const alerts = portfolio.holdings.filter(h => h.alert);

    return {
      type: "portfolio",
      agent: "Portfolio Intelligence Agent",
      icon: "💼",
      content: `**Your Portfolio Intelligence — ${md.timestamp}**

**Portfolio Summary**
Total Value: ₹${portfolio.currentValue.toLocaleString("en-IN")}
Total P&L: +₹${portfolio.totalPnl.toLocaleString("en-IN")} (+${portfolio.totalPnlPct.toFixed(2)}%)
Today ${dayColor}: ${portfolio.dayPnl < 0 ? "-" : "+"}₹${Math.abs(portfolio.dayPnl).toLocaleString("en-IN")} (${portfolio.dayPnlPct.toFixed(2)}%)

**${alerts.length} Holdings Need Attention:**

${alerts.map(h => {
  const insight = portfolio.portfolioIntelligence.find(i => i.stock === h.symbol);
  return `⚠️ **${h.name}** (${h.weight.toFixed(1)}% of portfolio)
${insight ? insight.detail : h.upcoming}`;
}).join("\n\n")}

**Sector Concentration**
Your largest holding: ${portfolio.holdings.sort((a,b) => b.weight - a.weight)[0].name} at ${portfolio.holdings.sort((a,b) => b.weight - a.weight)[0].weight.toFixed(1)}% of portfolio.

**Today's market context**: Today's ₹${Math.abs(portfolio.dayPnl).toLocaleString("en-IN")} dip is driven by broader market selling (NIFTY -0.8%), not stock-specific issues. IT stocks (you hold TCS) are the hardest hit.`,
      sources: ["ZEBU Portfolio API", "NSE India"],
      disclaimer: true,
    };
  },

  educationResponse(query, concept, md) {
    return {
      type: "education",
      agent: "AI Financial Mentor",
      icon: "🎓",
      content: `**${concept.term}**

*${concept.shortDef}*

---

${concept.explanation}

---

**Right now in the market:** ${concept.currentExample}

Want me to go deeper? Try:
• *"Give me an example with Reliance"*
• *"How does this relate to today's market move?"*
• *"What's the next concept I should learn?"*`,
      sources: ["Financial education knowledge base", "NSE India (current data)"],
      disclaimer: false,
    };
  },

  generalEducationResponse(query) {
    return {
      type: "education",
      agent: "AI Financial Mentor",
      icon: "🎓",
      content: `I can explain any financial concept using today's Indian market as a live example.

**Popular topics to explore:**
• *"What is RSI?"* — Momentum indicator used in technical analysis
• *"Explain P/E ratio"* — How to value stocks
• *"What is FII/DII?"* — Why institutional flows move markets
• *"What does PCR mean?"* — Options market sentiment indicator
• *"Explain MACD"* — Trend following indicator

**Or ask about a current market situation:**
• *"Why are IT stocks falling today?"*
• *"What does India VIX spiking mean?"*
• *"Explain what's happening with HDFC Bank results"*

Learning finance works best when you connect concepts to real events. What would you like to understand?`,
      sources: [],
      disclaimer: false,
    };
  },

  eventsResponse(query, events) {
    const highPriority = events.filter(e => e.severity === "high");
    return {
      type: "events",
      agent: "Market Event Detection Agent",
      icon: "🔔",
      content: `**Market Events & Alerts — Today**

I've detected **${events.length} market events** today. Here are the high-priority ones:

${highPriority.map(e => `🔴 **${e.symbol}** — ${e.title} *(${e.time})*
${e.detail}`).join("\n\n")}

**Other notable events:** ${events.length - highPriority.length} medium-priority signals detected.

Switch to the **Alerts** tab to see all events with filters.`,
      sources: ["NSE India", "BSE India"],
      disclaimer: true,
    };
  },

  generalResponse(query, md) {
    const q = query.toLowerCase();

    if (/why.*(it|tech).*(fall|down|drop)/.test(q)) {
      return {
        type: "text",
        agent: "Market Intelligence Agent",
        icon: "📊",
        content: `**Why IT stocks are falling today**

Two connected reasons:

**1. US Federal Reserve Signal**
Last night's Fed minutes signalled "higher for longer" interest rates. US tech companies (the biggest clients of Indian IT firms like TCS, Infosys, Wipro) tend to cut discretionary technology spending in high-rate environments. This directly reduces deal pipelines for Indian IT exporters.

**2. Dollar strength concerns**
While the rupee is stable today, a stronger USD environment generally reduces the incentive for Indian IT companies to convert earnings back — and also signals tighter US corporate budgets.

**Today's IT movers:**
• TCS ↓1.87% | Infosys ↓2.14% | Wipro ↓1.92%
• NIFTY IT Index: ↓1.41%

**Important context:** This is macro-driven selling, not company-specific. TCS deal wins and order books remain strong. This type of sector-wide move often creates entry opportunities for long-term investors — though timing is never guaranteed.`,
        sources: ["NSE India", "Reuters", "Fed Meeting Minutes"],
        disclaimer: true,
      };
    }

    if (/vix|volatility/.test(q)) {
      return {
        type: "education",
        agent: "AI Financial Mentor",
        icon: "🎓",
        content: `**India VIX — What it means today**

India VIX is currently at **14.82**, up **9.1%** from yesterday's close of 13.58.

**What is India VIX?**
India VIX (Volatility Index) measures how much the options market expects NIFTY to move over the next 30 days. It's often called the "fear gauge."

**Reading today's spike:**
- VIX below 15 → Markets are calm, low fear
- VIX 15–20 → Moderate uncertainty
- VIX above 20 → High fear / hedging activity

At 14.82, we're still in the "moderate" range — but the 9.1% single-day spike is notable. It means options premiums have jumped, which affects:
1. **Options buyers** → More expensive to buy puts/calls today
2. **Options sellers** → Higher premium income but higher risk
3. **Equity holders** → Sign that institutional players are buying more downside protection

**Why did it spike?**
FII selling + HDFC Bank results uncertainty + global risk-off = more options buying, which pushes VIX up.`,
        sources: ["NSE India VIX Data"],
        disclaimer: false,
      };
    }

    return {
      type: "text",
      agent: "ZEBU AI Orchestrator",
      icon: "🤖",
      content: `I'm your ZEBU Market Intelligence companion. Here's what I can help you with:

**📊 Market Intelligence**
*"What's happening in the market today?"*
*"Why is NIFTY down?"*

**🔍 Stock Research**
*"Analyse TCS"* | *"Research Reliance"* | *"What's happening with HDFC Bank?"*

**💼 Portfolio Intelligence**
*"How is my portfolio doing?"* | *"What do I need to watch today?"*

**🔔 Market Events**
*"What unusual activity happened today?"*

**🎓 Financial Education**
*"What is RSI?"* | *"Explain P/E ratio"* | *"What does FII selling mean?"*

What would you like to explore?`,
      sources: [],
      disclaimer: false,
    };
  },
};

window.AgentEngine = AgentEngine;
