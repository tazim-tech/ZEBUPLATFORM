# ZEBU AI — Market Intelligence Agent

A premium AI-powered market intelligence platform for Indian equity markets, built for ZEBU (mynt).

## Features

- 📊 **Market Brief** — Proactive AI briefing, live NIFTY/BANK NIFTY, FII/DII, sector heatmap, global markets
- 🔍 **AI Stock Research** — Technical analysis (RSI, MACD, EMA), fundamentals, shareholding, AI analysis
- 💼 **Portfolio Intelligence** — Real holdings context, risk score, dividend alerts, sector allocation
- 🔔 **Market Event Alerts** — Volume anomalies, breakouts, OI changes, earnings, macro events
- 🎓 **AI Financial Mentor** — Concept explanations using today's market as live examples
- 🤖 **AI Chat** — Multi-agent orchestration: intent routing across all capabilities

## Tech Stack

- Pure HTML / CSS / Vanilla JS — no framework dependencies
- SVG-based charts (sparklines, RSI gauge, MACD histogram, donut)
- Multi-agent AI engine with keyword-based intent classification
- Rich Indian market mock data (NSE/BSE format)

## Running Locally

```bash
python -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080)

## Project Structure

```
├── index.html          # App shell
├── css/
│   └── styles.css      # Full dark fintech design system
└── js/
    ├── data.js         # Indian market data + portfolio
    ├── charts.js       # SVG chart engine
    ├── agents.js       # Multi-agent AI response engine
    └── app.js          # Main app controller
```

## Compliance

All AI outputs are classified as informational/educational only.
Not SEBI-registered investment advice. Compliant with SEBI disclosure requirements.

---

*Built for ZEBU — India's intelligent market companion*
