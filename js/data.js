// ZEBU AI — Mock Indian Market Data
// In production, replace with real NSE/BSE API calls

const MARKET_DATA = {
  timestamp: "21 Sep 2026, 09:30 AM IST",
  marketStatus: "OPEN", // OPEN | PRE_OPEN | CLOSED | HOLIDAY

  indices: {
    nifty50: {
      symbol: "NIFTY 50",
      ltp: 24312.45,
      change: -195.80,
      changePct: -0.80,
      open: 24508.25,
      high: 24521.10,
      low: 24289.30,
      prev_close: 24508.25,
      volume: "12.4 Cr",
      sparkline: [24508, 24490, 24470, 24455, 24430, 24400, 24380, 24360, 24320, 24312],
    },
    bankNifty: {
      symbol: "BANK NIFTY",
      ltp: 51840.20,
      change: -580.45,
      changePct: -1.11,
      open: 52420.65,
      high: 52445.00,
      low: 51798.30,
      prev_close: 52420.65,
      volume: "5.2 Cr",
      sparkline: [52420, 52380, 52320, 52250, 52180, 52100, 52040, 51990, 51870, 51840],
    },
    niftyIT: {
      symbol: "NIFTY IT",
      ltp: 38240.10,
      change: -548.30,
      changePct: -1.41,
      sparkline: [38788, 38720, 38650, 38580, 38500, 38420, 38360, 38310, 38260, 38240],
    },
    niftyPharma: {
      symbol: "NIFTY PHARMA",
      ltp: 21140.55,
      change: +312.80,
      changePct: +1.50,
      sparkline: [20827, 20870, 20920, 20970, 21010, 21060, 21090, 21110, 21130, 21140],
    },
    midcap150: {
      symbol: "NIFTY MIDCAP 150",
      ltp: 18920.30,
      change: -88.20,
      changePct: -0.46,
      sparkline: [19008, 18990, 18970, 18955, 18940, 18935, 18930, 18925, 18922, 18920],
    },
    sensex: {
      symbol: "SENSEX",
      ltp: 79840.35,
      change: -635.20,
      changePct: -0.79,
      sparkline: [80475, 80400, 80320, 80220, 80120, 80040, 79980, 79920, 79870, 79840],
    },
    indiaVix: {
      symbol: "INDIA VIX",
      ltp: 14.82,
      change: +1.24,
      changePct: +9.13,
    },
  },

  breadth: {
    advances: 1124,
    declines: 793,
    unchanged: 83,
    ratio: 1.42,
    new52wHigh: 38,
    new52wLow: 12,
  },

  fiiDii: {
    date: "20 Sep 2026",
    fii: {
      buy: 8234.56,
      sell: 10575.12,
      net: -2340.56,
    },
    dii: {
      buy: 10120.34,
      sell: 8890.22,
      net: +1230.12,
    },
  },

  sectors: [
    { name: "Pharma", change: +1.50, icon: "💊" },
    { name: "PSU Banks", change: +0.85, icon: "🏦" },
    { name: "Auto", change: +0.34, icon: "🚗" },
    { name: "FMCG", change: -0.21, icon: "🛒" },
    { name: "Realty", change: -0.48, icon: "🏢" },
    { name: "Metal", change: -0.72, icon: "⚙️" },
    { name: "Media", change: -0.93, icon: "📺" },
    { name: "IT", change: -1.41, icon: "💻" },
  ],

  globalMarkets: [
    { name: "S&P 500", value: "5,612.36", change: -0.32 },
    { name: "NASDAQ", value: "17,689.10", change: -0.58 },
    { name: "FTSE 100", value: "8,234.20", change: +0.14 },
    { name: "Nikkei 225", value: "38,420.50", change: -0.24 },
    { name: "SGX Nifty", value: "24,289.00", change: -0.88 },
    { name: "USD/INR", value: "84.32", change: +0.18 },
    { name: "Crude Oil", value: "$82.40", change: -0.43 },
    { name: "Gold (MCX)", value: "₹74,120", change: +0.62 },
  ],

  keyEvents: [
    {
      time: "4:00 PM",
      event: "HDFC Bank Q2 Results",
      type: "earnings",
      impact: "high",
      detail: "Analyst consensus: PAT ₹16,800 Cr, NII ₹28,000 Cr. Options pricing ±4% move."
    },
    {
      time: "All Day",
      event: "RBI MPC Minutes Released",
      type: "macro",
      impact: "high",
      detail: "October MPC meeting minutes. Market watching for rate cut signals."
    },
    {
      time: "Post-Market",
      event: "FII/DII Provisional Data",
      type: "flows",
      impact: "medium",
      detail: "After yesterday's ₹2,340 Cr FII sell-off, today's data closely watched."
    },
    {
      time: "Tomorrow",
      event: "Tata Steel Ex-Dividend",
      type: "corporate",
      impact: "low",
      detail: "Dividend: ₹3.60/share. Record date: 22 Sep 2026."
    },
  ],

  morningBriefing: {
    headline: "Markets open lower on FII sell-off and US Fed signals",
    keyInsight: "FIIs sold ₹2,340 Cr yesterday. US Fed minutes signalled 'higher for longer', weighing on global equities. IT and Banking sectors bear the brunt today.",
    watchPoints: [
      { icon: "📉", text: "IT sector ↓1.4% on US dollar headwinds and client spending caution" },
      { icon: "📈", text: "PSU Banks outperforming — DII buying on dips observed" },
      { icon: "⚠️", text: "HDFC Bank Q2 results today at 4 PM — watch for loan growth guidance" },
      { icon: "🔴", text: "India VIX spiked 9.1% — heightened options premiums today" },
    ],
  },
};

// ─── STOCKS ───────────────────────────────────────────────────────────────────

const STOCKS = {
  TCS: {
    name: "Tata Consultancy Services",
    symbol: "TCS",
    sector: "Information Technology",
    marketCap: "₹14.2L Cr",
    ltp: 4112.35,
    change: -78.25,
    changePct: -1.87,
    open: 4190.60,
    high: 4195.00,
    low: 4098.75,
    prev_close: 4190.60,
    volume: "28.4L",
    avgVolume: "22.1L",
    week52High: 4592.25,
    week52Low: 3311.80,
    sparkline: [4190, 4175, 4162, 4148, 4135, 4128, 4118, 4112, 4105, 4112],
    technicals: {
      rsi14: 44.2,
      macd: { value: -38.5, signal: -22.1, histogram: -16.4 },
      ema20: 4198.40,
      ema50: 4105.20,
      ema200: 3890.50,
      support: 4080,
      resistance: 4210,
      signal: "NEUTRAL",
    },
    fundamentals: {
      pe: 28.4,
      sectorPE: 32.1,
      pb: 14.2,
      evEbitda: 22.1,
      roe: 49.8,
      roce: 68.2,
      debtEquity: 0.02,
      dividendYield: 1.8,
    },
    financials: {
      revenue: "₹61,237 Cr",
      revenueGrowth: "+4.2% YoY",
      pat: "₹11,987 Cr",
      patGrowth: "+5.1% YoY",
      ebitdaMargin: "24.8%",
      cashReserves: "₹8,400 Cr",
    },
    shareholding: { promoter: 72.3, fii: 12.8, dii: 5.6, public: 9.3 },
    recentNews: [
      { date: "20 Sep", headline: "TCS bags $1.2 billion deal with European retailer", sentiment: "positive" },
      { date: "18 Sep", headline: "Analyst downgrades IT sector on US spending slowdown fears", sentiment: "negative" },
      { date: "15 Sep", headline: "TCS Q1 revenue misses estimate by 1.2%", sentiment: "negative" },
    ],
    analysis: {
      summary: "TCS faces near-term pressure from US macro headwinds. Deal wins remain strong but discretionary spending cuts at US clients are delaying revenue recognition. The stock is approaching a key technical support zone.",
      bullCase: "Strong deal pipeline, market share gains in BFSI, AI services ramp-up, improving margins",
      bearCase: "US slowdown reducing discretionary IT spend, strong rupee headwinds, elevated valuations vs peers",
      risks: ["Client concentration (BFSI ~30% revenue)", "USD/INR movement", "Competition from Infosys and HCL in large deals"],
    },
  },

  HDFCBANK: {
    name: "HDFC Bank",
    symbol: "HDFCBANK",
    sector: "Banking",
    marketCap: "₹11.8L Cr",
    ltp: 1598.45,
    change: -24.30,
    changePct: -1.50,
    open: 1622.75,
    high: 1626.00,
    low: 1593.10,
    prev_close: 1622.75,
    volume: "1.2 Cr",
    avgVolume: "0.9 Cr",
    week52High: 1794.00,
    week52Low: 1363.55,
    sparkline: [1622, 1618, 1612, 1608, 1605, 1601, 1598, 1594, 1596, 1598],
    technicals: {
      rsi14: 41.8,
      macd: { value: -18.2, signal: -9.8, histogram: -8.4 },
      ema20: 1645.80,
      ema50: 1612.30,
      ema200: 1548.90,
      support: 1580,
      resistance: 1650,
      signal: "BEARISH",
    },
    fundamentals: {
      pe: 18.2,
      sectorPE: 15.4,
      pb: 2.8,
      evEbitda: 14.1,
      roe: 15.8,
      roce: 18.4,
      debtEquity: 7.2, // banking metric
      dividendYield: 1.1,
    },
    financials: {
      revenue: "₹72,890 Cr",
      revenueGrowth: "+12.3% YoY",
      pat: "₹16,511 Cr",
      patGrowth: "+9.4% YoY",
      ebitdaMargin: "N/A (Banking)",
      cashReserves: "NIM: 3.8%",
    },
    shareholding: { promoter: 0.0, fii: 51.8, dii: 24.2, public: 24.0 },
    recentNews: [
      { date: "21 Sep", headline: "HDFC Bank Q2 results today at 4 PM — analyst preview", sentiment: "neutral" },
      { date: "19 Sep", headline: "HDFC Bank CD ratio improves to 85% in September", sentiment: "positive" },
      { date: "17 Sep", headline: "FII selling in HDFC Bank ahead of Q2 results", sentiment: "negative" },
    ],
    analysis: {
      summary: "HDFC Bank heads into Q2 results with market expectations of stable NII growth and improved CD ratio. The key watch is deposit mobilisation and net interest margin guidance. Elevated FII selling in the last 2 weeks has created technical weakness.",
      bullCase: "Market leader in retail banking, strong CASA franchise, improving CD ratio, potential re-rating on FII buying post results",
      bearCase: "Loan growth moderation, deposit costs rising, NIM pressure in competitive environment",
      risks: ["Q2 results miss on PAT", "RBI regulatory action", "Macro slowdown affecting credit quality"],
    },
  },

  TATAMOTORS: {
    name: "Tata Motors",
    symbol: "TATAMOTORS",
    sector: "Automobile",
    marketCap: "₹3.4L Cr",
    ltp: 942.15,
    change: -11.40,
    changePct: -1.20,
    open: 953.55,
    high: 956.00,
    low: 938.20,
    prev_close: 953.55,
    volume: "98.4L",
    avgVolume: "72.1L",
    week52High: 1179.00,
    week52Low: 728.45,
    sparkline: [953, 950, 947, 945, 943, 941, 940, 941, 942, 942],
    technicals: {
      rsi14: 48.1,
      macd: { value: -6.2, signal: -3.1, histogram: -3.1 },
      ema20: 958.40,
      ema50: 978.20,
      ema200: 867.30,
      support: 920,
      resistance: 975,
      signal: "NEUTRAL",
    },
    fundamentals: {
      pe: 8.2,
      sectorPE: 14.0,
      pb: 2.1,
      evEbitda: 4.1,
      roe: 24.8,
      roce: 18.2,
      debtEquity: 1.8,
      dividendYield: 0.0,
    },
    financials: {
      revenue: "₹4,38,234 Cr",
      revenueGrowth: "+18.2% YoY",
      pat: "₹23,983 Cr",
      patGrowth: "+124% YoY",
      ebitdaMargin: "14.2%",
      cashReserves: "JLR net debt: £4.1Bn",
    },
    shareholding: { promoter: 46.4, fii: 18.2, dii: 22.1, public: 13.3 },
    recentNews: [
      { date: "18 Sep", headline: "JLR Defender EV pre-bookings cross 15,000 globally", sentiment: "positive" },
      { date: "16 Sep", headline: "UK car sales slow 3% in August — JLR exposed", sentiment: "negative" },
      { date: "14 Sep", headline: "Tata Motors domestic EV market share at 68% in August", sentiment: "positive" },
    ],
    analysis: {
      summary: "Tata Motors offers a compelling risk/reward at current levels. JLR's strong order book and EV pivot are medium-term catalysts, while domestic EV leadership is a key moat. The low P/E vs sector reflects JLR uncertainty and GBP exposure.",
      bullCase: "JLR turnaround thesis intact, EV order book strong, domestic leadership, debt reduction trajectory",
      bearCase: "GBP/INR exposure, UK slowdown, JLR chip supply risks, high absolute debt levels",
      risks: ["Currency headwinds (GBP)", "UK economic slowdown", "EV competition intensifying globally"],
    },
  },

  RELIANCE: {
    name: "Reliance Industries",
    symbol: "RELIANCE",
    sector: "Conglomerate",
    marketCap: "₹19.8L Cr",
    ltp: 2934.60,
    change: -18.45,
    changePct: -0.62,
    open: 2953.05,
    high: 2958.00,
    low: 2928.10,
    prev_close: 2953.05,
    volume: "65.2L",
    avgVolume: "52.8L",
    week52High: 3217.00,
    week52Low: 2221.05,
    sparkline: [2953, 2948, 2943, 2940, 2937, 2934, 2931, 2930, 2932, 2934],
    technicals: {
      rsi14: 52.4,
      macd: { value: +12.4, signal: +8.2, histogram: +4.2 },
      ema20: 2921.40,
      ema50: 2878.20,
      ema200: 2648.90,
      support: 2900,
      resistance: 2980,
      signal: "BULLISH",
    },
    fundamentals: {
      pe: 24.8,
      sectorPE: 22.0,
      pb: 2.4,
      evEbitda: 12.8,
      roe: 9.6,
      roce: 11.2,
      debtEquity: 0.42,
      dividendYield: 0.34,
    },
    financials: {
      revenue: "₹9,71,421 Cr",
      revenueGrowth: "+8.9% YoY",
      pat: "₹79,020 Cr",
      patGrowth: "+12.1% YoY",
      ebitdaMargin: "18.4%",
      cashReserves: "₹1.82L Cr",
    },
    shareholding: { promoter: 50.3, fii: 23.1, dii: 15.4, public: 11.2 },
    recentNews: [
      { date: "19 Sep", headline: "Reliance Jio to launch 6G trials in FY27 — Bloomberg", sentiment: "positive" },
      { date: "17 Sep", headline: "Reliance Retail adds 150 stores in Q2, targets 2,000 more by FY28", sentiment: "positive" },
      { date: "15 Sep", headline: "Crude oil price drop benefits Reliance refining margins", sentiment: "positive" },
    ],
    analysis: {
      summary: "Reliance remains India's most diversified large-cap, with telecom and retail businesses now offsetting energy sector cyclicality. Jio's ARPU expansion and Retail's aggressive expansion are the key growth engines. Digital and clean energy investments are long-term catalysts.",
      bullCase: "Jio ARPU growth, Retail expansion, new energy investments, digital services monetisation",
      bearCase: "Refining margin compression, high capex cycle, digital revenue still nascent",
      risks: ["Crude oil volatility", "Regulatory risk in telecom", "Execution risk across multiple verticals"],
    },
  },

  IRCTC: {
    name: "IRCTC",
    symbol: "IRCTC",
    sector: "Tourism & Travel",
    marketCap: "₹71,200 Cr",
    ltp: 894.35,
    change: +22.40,
    changePct: +2.57,
    open: 871.95,
    high: 899.10,
    low: 869.80,
    prev_close: 871.95,
    volume: "42.3L",
    avgVolume: "10.1L",
    week52High: 1108.00,
    week52Low: 712.20,
    sparkline: [871, 874, 879, 882, 885, 888, 890, 892, 893, 894],
    technicals: {
      rsi14: 67.8,
      macd: { value: +18.4, signal: +9.2, histogram: +9.2 },
      ema20: 858.30,
      ema50: 842.10,
      ema200: 812.40,
      support: 870,
      resistance: 900,
      signal: "BULLISH",
    },
    fundamentals: {
      pe: 62.4,
      sectorPE: 45.0,
      pb: 18.2,
      evEbitda: 42.1,
      roe: 32.8,
      roce: 42.1,
      debtEquity: 0.0,
      dividendYield: 0.56,
    },
    financials: {
      revenue: "₹1,138 Cr",
      revenueGrowth: "+19.8% YoY",
      pat: "₹1,140 Cr",
      patGrowth: "+21.4% YoY",
      ebitdaMargin: "56.8%",
      cashReserves: "₹2,890 Cr",
    },
    shareholding: { promoter: 62.4, fii: 12.8, dii: 8.4, public: 16.4 },
    recentNews: [
      { date: "21 Sep", headline: "Tourism Ministry budget utilisation data shows 34% jump in rail bookings", sentiment: "positive" },
      { date: "19 Sep", headline: "IRCTC launches dynamic pricing on 50 premium trains", sentiment: "positive" },
      { date: "18 Sep", headline: "Rail passenger volume at record high in Q2", sentiment: "positive" },
    ],
    analysis: {
      summary: "IRCTC is experiencing unusual volume today (4.2x average) with no major negative catalyst. Railway booking volumes are at record highs and the government's tourism push is a sustained tailwind. The stock is approaching key technical resistance at ₹900.",
      bullCase: "Government monopoly on rail ticketing, margin expansion from dynamic pricing, tourism tailwinds",
      bearCase: "Rich valuations (P/E 62x), government policy risk, execution of catering business",
      risks: ["Government ownership means policy uncertainty", "Valuation premium can compress sharply", "Competition from alternative travel modes"],
    },
  },

  TATASTEEL: {
    name: "Tata Steel",
    symbol: "TATASTEEL",
    sector: "Metal",
    marketCap: "₹1.92L Cr",
    ltp: 152.40,
    change: -1.85,
    changePct: -1.20,
    open: 154.25,
    high: 154.80,
    low: 151.90,
    prev_close: 154.25,
    volume: "3.8 Cr",
    avgVolume: "2.9 Cr",
    week52High: 184.60,
    week52Low: 118.50,
    sparkline: [154, 153, 153, 152, 152, 152, 152, 152, 152, 152],
    technicals: {
      rsi14: 39.2,
      macd: { value: -3.2, signal: -1.8, histogram: -1.4 },
      ema20: 158.40,
      ema50: 162.10,
      ema200: 151.80,
      support: 150,
      resistance: 160,
      signal: "BEARISH",
    },
    fundamentals: {
      pe: 7.4,
      sectorPE: 9.2,
      pb: 1.2,
      evEbitda: 6.4,
      roe: 8.2,
      roce: 9.4,
      debtEquity: 1.24,
      dividendYield: 2.36,
    },
    financials: {
      revenue: "₹2,29,142 Cr",
      revenueGrowth: "-4.2% YoY",
      pat: "₹26,012 Cr",
      patGrowth: "+34.2% YoY",
      ebitdaMargin: "12.8%",
      cashReserves: "Net debt: £3.8Bn (UK ops)",
    },
    shareholding: { promoter: 33.2, fii: 24.1, dii: 28.4, public: 14.3 },
    recentNews: [
      { date: "19 Sep", headline: "Tata Steel UK to close Port Talbot blast furnaces by December", sentiment: "positive" },
      { date: "17 Sep", headline: "China steel oversupply continues to weigh on global prices", sentiment: "negative" },
      { date: "15 Sep", headline: "Tata Steel announces ₹3.60/share dividend — record date Sep 22", sentiment: "positive" },
    ],
    analysis: {
      summary: "Tata Steel is in a transition phase with UK restructuring ongoing. Closing blast furnaces reduces operating costs significantly from FY26. Chinese steel oversupply remains the key overhang. Ex-dividend date tomorrow (₹3.60/share) is a near-term technical catalyst.",
      bullCase: "UK restructuring improving margins, India steel demand strong, cheap valuation",
      bearCase: "China oversupply, UK execution risk, global slowdown reducing steel demand",
      risks: ["Chinese steel dumping", "UK regulatory/pension risks", "Global commodity price cycles"],
    },
  },

  INFY: {
    name: "Infosys Limited",
    symbol: "INFY",
    sector: "Information Technology",
    marketCap: "₹7.4L Cr",
    ltp: 1780.46,
    change: -38.94,
    changePct: -2.14,
    open: 1819.40,
    high: 1821.00,
    low: 1776.10,
    prev_close: 1819.40,
    volume: "48.2L",
    avgVolume: "26.8L",
    week52High: 2006.45,
    week52Low: 1358.35,
    sparkline: [1819, 1810, 1800, 1795, 1790, 1784, 1780, 1778, 1779, 1780],
    technicals: {
      rsi14: 36.8,
      macd: { value: -42.2, signal: -18.4, histogram: -23.8 },
      ema20: 1832.10,
      ema50: 1798.40,
      ema200: 1682.30,
      support: 1760,
      resistance: 1820,
      signal: "BEARISH",
    },
    fundamentals: {
      pe: 26.2,
      sectorPE: 32.1,
      pb: 8.4,
      evEbitda: 18.4,
      roe: 32.8,
      roce: 42.1,
      debtEquity: 0.04,
      dividendYield: 2.2,
    },
    financials: {
      revenue: "₹38,994 Cr",
      revenueGrowth: "+1.8% YoY",
      pat: "₹7,154 Cr",
      patGrowth: "+3.7% YoY",
      ebitdaMargin: "22.1%",
      cashReserves: "₹12,200 Cr",
    },
    shareholding: { promoter: 14.9, fii: 34.2, dii: 18.4, public: 32.5 },
    recentNews: [
      { date: "21 Sep", headline: "Infosys breaks below 200-day EMA on volume — technical alert", sentiment: "negative" },
      { date: "19 Sep", headline: "Infosys AI deal wins slow in Q2 — analyst caution", sentiment: "negative" },
      { date: "17 Sep", headline: "Infosys maintains FY27 revenue guidance at 4.5–7%", sentiment: "neutral" },
    ],
    analysis: {
      summary: "Infosys is under technical pressure today, breaking below the 200-day EMA (₹1,682) — a significant technical level. The breakdown is happening on elevated volume (1.8x average), which strengthens the bearish signal. However, fundamentals remain solid and valuation is below sector average.",
      bullCase: "Below-sector P/E, strong dividend yield (2.2%), stabilising deal pipeline, AI services adoption",
      bearCase: "200-EMA breakdown, US client spending caution, slower revenue growth vs TCS",
      risks: ["US corporate spending cuts", "USD/INR movement", "Competition from Accenture in large deals"],
    },
  },
};

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────

const USER_PORTFOLIO = {
  userId: "ZEBU2024181234",
  name: "Rahul Sharma",
  accountType: "Equity + F&O",
  totalInvested: 425000,
  currentValue: 498240,
  totalPnl: 73240,
  totalPnlPct: 17.23,
  dayPnl: -8420,
  dayPnlPct: -1.66,
  holdings: [
    {
      symbol: "HDFCBANK",
      name: "HDFC Bank",
      qty: 45,
      avgCost: 1456.00,
      ltp: 1598.45,
      invested: 65520,
      currentValue: 71930.25,
      pnl: 6410.25,
      pnlPct: 9.78,
      dayPnl: -1093.50,
      weight: 14.44,
      upcoming: "Q2 Results today 4 PM",
      alert: true,
      alertType: "earnings",
    },
    {
      symbol: "RELIANCE",
      name: "Reliance Industries",
      qty: 30,
      avgCost: 2612.00,
      ltp: 2934.60,
      invested: 78360,
      currentValue: 88038,
      pnl: 9678,
      pnlPct: 12.35,
      dayPnl: -553.50,
      weight: 17.67,
      upcoming: null,
      alert: false,
      alertType: null,
    },
    {
      symbol: "TCS",
      name: "Tata Consultancy Services",
      qty: 10,
      avgCost: 3890.00,
      ltp: 4112.35,
      invested: 38900,
      currentValue: 41123.50,
      symbol: "TATASTEEL",
      name: "Tata Steel Ltd",
      qty: 150,
      avgCost: 135.00,
      ltp: 154.29,
      invested: 20250,
      currentValue: 23143.50,
      pnl: 2893.50,
      pnlPct: 14.29,
      dayPnl: -277.50,
      weight: 6.76,
      upcoming: "Ex-dividend ₹3.60/share — Tomorrow",
      alert: true,
      alertType: "dividend",
    },
    {
      symbol: "INFY",
      name: "Infosys Limited",
      qty: 25,
      avgCost: 1620.00,
      ltp: 1780.46,
      invested: 40500,
      currentValue: 44511.50,
      pnl: 4011.50,
      pnlPct: 9.90,
      dayPnl: -534.00,
      weight: 12.99,
      upcoming: null,
      alert: false,
      alertType: null,
    },
    {
      symbol: "RELIANCE",
      name: "Reliance Industries",
      qty: 20,
      avgCost: 2850.00,
      ltp: 2939.84,
      invested: 57000,
      currentValue: 58796.80,
      pnl: 1796.80,
      pnlPct: 3.15,
      dayPnl: -368.00,
      weight: 17.17,
      upcoming: null,
      alert: false,
      alertType: null,
    },
    {
      symbol: "IOC",
      name: "Indian Oil Corporation Ltd",
      qty: 10,
      avgCost: 91.15,
      ltp: 87.53,
      invested: 911.50,
      currentValue: 875.30,
      pnl: -36.20,
      pnlPct: -3.97,
      dayPnl: 12.40,
      weight: 0.26,
      upcoming: null,
      alert: false,
      alertType: null,
    },
    {
      symbol: "TRIDENT",
      name: "Trident Limited",
      qty: 4,
      avgCost: 39.93,
      ltp: 36.70,
      invested: 159.72,
      currentValue: 146.80,
      pnl: -12.92,
      pnlPct: -8.09,
      dayPnl: -2.40,
      weight: 0.04,
      upcoming: null,
      alert: false,
      alertType: null,
    },
    {
      symbol: "IDFC",
      name: "IDFC Limited",
      qty: 1,
      avgCost: 111.85,
      ltp: 122.69,
      invested: 111.85,
      currentValue: 122.69,
      pnl: 10.84,
      pnlPct: 9.69,
      dayPnl: 1.20,
      weight: 0.04,
      upcoming: null,
      alert: false,
      alertType: null,
    },
    {
      symbol: "GOLDBEES",
      name: "Nippon India ETF Gold",
      qty: 1,
      avgCost: 50.86,
      ltp: 48.87,
      invested: 50.86,
      currentValue: 48.87,
      pnl: -1.99,
      pnlPct: -3.91,
      dayPnl: 0.30,
      weight: 0.01,
      upcoming: null,
      alert: false,
      alertType: null,
    },
  ],
  riskScore: 74,
  sectorAllocation: [
    { sector: "Energy & Oil", pct: 28 },
    { sector: "Banking & Finance", pct: 24 },
    { sector: "Information Tech", pct: 18 },
    { sector: "Metals & Commodities", pct: 18 },
    { sector: "Mutual Funds (Direct)", pct: 14 },
  ],
  portfolioIntelligence: [
    {
      priority: "high",
      icon: "⚠️",
      title: "HDFC Bank — Q2 Results today at 4 PM",
      detail: "You hold 35 shares (avg ₹1,540.20, current ₹1,648.26). Analyst consensus: PAT ₹16,800 Cr. Options market pricing ±4% move. Key watch: NIM guidance and deposit growth.",
      stock: "HDFCBANK",
    },
    {
      priority: "medium",
      icon: "💸",
      title: "Tata Steel — Ex-dividend tomorrow (₹3.60/share)",
      detail: "You hold 150 shares → dividend credit of ₹540 expected. Record date: 22 Sep 2026. Stock typically opens ex-dividend (price adjusts down by dividend) tomorrow morning.",
      stock: "TATASTEEL",
    },
    {
      priority: "medium",
      icon: "📉",
      title: "IT Holdings under sector pressure",
      detail: "TCS is down 1.87% today on sector-wide IT selling. No company-specific news — this is macro-driven (US Fed/rate concerns). Your unrealised P&L impact today: -₹782.",
      stock: "TCS",
    },
    {
      priority: "low",
      icon: "📊",
      title: "Portfolio concentration alert",
      detail: "Energy (Reliance) is your largest sector at 17.7%. Consider if this concentration aligns with your risk profile. Overall portfolio beta vs NIFTY: ~0.92 (slightly defensive).",
      stock: null,
    },
  ],
};

// ─── EVENTS / ALERTS ──────────────────────────────────────────────────────────

const MARKET_EVENTS = [
  {
    id: "evt_001",
    time: "09:24 AM",
    symbol: "IRCTC",
    type: "volume",
    title: "Unusual volume — 4.2x 30-day average",
    detail: "IRCTC has traded 42L shares in last hour vs 10L average. Price approaching ₹892 resistance. No negative news found.",
    change: +2.57,
    severity: "high",
    tags: ["volume", "breakout"],
    onWatchlist: false,
    inPortfolio: true,
  },
  {
    id: "evt_002",
    time: "09:18 AM",
    symbol: "INFY",
    type: "technical",
    title: "Breaking below 200-day EMA",
    detail: "Infosys has broken below its 200-day EMA (₹1,682) for the first time since March. This is a technically significant level. Volume is 1.8x average.",
    change: -2.14,
    severity: "medium",
    tags: ["technical", "breakdown"],
    onWatchlist: true,
    inPortfolio: false,
  },
  {
    id: "evt_003",
    time: "09:15 AM",
    symbol: "ADANIPORTS",
    type: "oi",
    title: "OI surge in 1500 CE — Bullish positioning",
    detail: "Adani Ports Call OI at 1500 strike jumped 28% at open. PCR dropped to 0.68. Block deal of 8.2L shares at ₹1,489 seen pre-market.",
    change: +1.82,
    severity: "medium",
    tags: ["derivatives", "block-deal"],
    onWatchlist: false,
    inPortfolio: false,
  },
  {
    id: "evt_004",
    time: "09:12 AM",
    symbol: "SUNPHARMA",
    type: "breakout",
    title: "52-week high breakout",
    detail: "Sun Pharma has made a fresh 52-week high of ₹1,892. Pharma sector is today's outperformer (+1.5%). FDA approval for new formulation expected next week.",
    change: +2.84,
    severity: "medium",
    tags: ["breakout", "52w-high"],
    onWatchlist: true,
    inPortfolio: false,
  },
  {
    id: "evt_005",
    time: "Pre-Market",
    symbol: "HDFCBANK",
    type: "earnings",
    title: "Q2 Results today — options elevated",
    detail: "HDFC Bank Q2 results due at 4 PM. Options market pricing ±4% post-results move. Implied volatility elevated at 24 (vs 30-day avg of 18). You hold 45 shares.",
    change: -1.50,
    severity: "high",
    tags: ["earnings", "portfolio"],
    onWatchlist: true,
    inPortfolio: true,
  },
  {
    id: "evt_006",
    time: "08:45 AM",
    symbol: "NIFTYBEES",
    type: "macro",
    title: "India VIX spikes 9.1% at open",
    detail: "India VIX jumped to 14.82 from 13.58. Elevated VIX signals higher option premiums and expected volatility. FII selling and global uncertainty driving the spike.",
    change: +9.13,
    severity: "medium",
    tags: ["macro", "vix"],
    onWatchlist: false,
    inPortfolio: false,
  },
];

// ─── EDUCATION CONTENT ────────────────────────────────────────────────────────

const EDUCATION_CONCEPTS = {
  rsi: {
    term: "RSI (Relative Strength Index)",
    shortDef: "A momentum oscillator measuring speed of price changes, on a scale of 0–100.",
    explanation: `RSI stands for Relative Strength Index. It measures how fast and how much a stock's price has moved, on a scale from 0 to 100.

**The basics:**
- RSI above 70 → Stock may be "overbought" (risen too fast, could pull back)
- RSI below 30 → Stock may be "oversold" (fallen too fast, could bounce)
- RSI 40–60 → Neutral zone

**Indian market example right now:**
NIFTY IT sector's RSI is around 42 — in neutral-to-weak territory, consistent with the selling pressure we're seeing today from US macro concerns.

**Important caveat:** RSI is a momentum indicator, not a predictor. A stock can stay "overbought" for weeks in a strong bull market. Always use RSI alongside other tools.`,
    currentExample: "TCS RSI at 44.2 — neutral, slight bearish lean",
  },

  pe: {
    term: "P/E Ratio (Price to Earnings)",
    shortDef: "How much investors are paying for each rupee of company profit.",
    explanation: `P/E = Stock Price ÷ Earnings Per Share (EPS)

If a stock is at ₹1,000 and the company earned ₹50 per share last year, P/E = 20x.

**What it means:**
- P/E of 20x → investors are willing to pay ₹20 for every ₹1 of profit
- High P/E (like IRCTC at 62x) → expensive, but market expects high future growth
- Low P/E (like Tata Motors at 8x) → cheap, but market may be pricing in risks

**Indian context today:**
- Tata Motors P/E: 8.2x vs sector avg 14x → looks cheap, but reflects JLR uncertainty
- IRCTC P/E: 62x → expensive, but government monopoly + growth justifies some premium
- NIFTY 50 P/E: ~22x → slightly above long-term average of ~20x`,
    currentExample: "Tata Motors P/E 8.2x vs sector 14x — value or value-trap?",
  },

  fiiDii: {
    term: "FII/DII Activity",
    shortDef: "Foreign and domestic institutional buying/selling — the market's biggest movers.",
    explanation: `**FII = Foreign Institutional Investors**
Large global funds (like BlackRock, Vanguard, sovereign wealth funds) investing in Indian markets. When they buy → markets often rise. When they sell → markets often fall.

**DII = Domestic Institutional Investors**
Indian institutions — mutual funds, LIC, insurance companies. They often buy when FIIs sell (called "counter-balancing").

**Today's data:**
- FIIs sold ₹2,340 Cr yesterday → creating the market pressure you see today
- DIIs bought ₹1,230 Cr → partially cushioning the fall
- Net market impact: ₹-1,110 Cr institutional outflow

**Why it matters for retail investors:**
FII flows are driven by global factors (US Fed rates, dollar strength, emerging market sentiment) — often completely unrelated to Indian company fundamentals. Understanding this helps you separate "company risk" from "global market risk."`,
    currentExample: "FII sold ₹2,340 Cr yesterday — that's why NIFTY is down 0.8% today",
  },

  pcr: {
    term: "Put-Call Ratio (PCR)",
    shortDef: "A derivatives indicator showing the ratio of puts bought to calls bought.",
    explanation: `PCR = Total Put Open Interest ÷ Total Call Open Interest

**What it signals:**
- PCR > 1.2 → More puts than calls → Bearish sentiment, but contrarians see it as support
- PCR < 0.7 → More calls than puts → Bullish sentiment, but can signal complacency
- PCR 0.8–1.2 → Neutral zone

**India VIX connection:**
High PCR + High VIX together = market is "buying insurance" against a fall. This is what we see today (VIX at 14.82 + PCR elevated).

**Indian market specifics:**
NIFTY options are Europe's most traded index options globally. The PCR data is published by NSE hourly during market hours.

**Today's context:**
NIFTY PCR is at 1.18 — slightly elevated, suggesting some hedging happening, but not extreme fear.`,
    currentExample: "NIFTY PCR at 1.18 today — moderate hedging before HDFC Bank results",
  },

  macd: {
    term: "MACD (Moving Average Convergence Divergence)",
    shortDef: "A trend-following momentum indicator using moving average relationships.",
    explanation: `MACD uses two exponential moving averages (EMA):
- **MACD Line** = 12-day EMA minus 26-day EMA
- **Signal Line** = 9-day EMA of the MACD line
- **Histogram** = MACD Line minus Signal Line

**Signals:**
- MACD crosses above Signal Line → Bullish (potential buy signal)
- MACD crosses below Signal Line → Bearish (potential sell signal)
- Histogram turning negative → Momentum weakening

**Indian market example right now:**
TCS MACD: -38.5, Signal: -22.1, Histogram: -16.4
→ MACD is negative and diverging downward → consistent with the downtrend in IT stocks today.

**Limitation:** MACD is a lagging indicator — it tells you what already happened, not what will happen. Best used with price action and volume.`,
    currentExample: "TCS MACD showing bearish divergence — confirming the IT sector weakness",
  },
};

// Export everything
window.ZEBU_DATA = {
  MARKET_DATA,
  STOCKS,
  USER_PORTFOLIO,
  MARKET_EVENTS,
  EDUCATION_CONCEPTS,
};
