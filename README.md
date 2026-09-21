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
├── index.html          # App shell with official ZEBU branding
├── assets/             # Official assets from zebuetrade.com
│   ├── zebu-logo.svg   # Official ZEBU vector logo & tagline
│   ├── zebu-mark.svg   # Official ZEBU icon mark
│   ├── stocks-etfs.png # Official Stocks & ETFs illustration
│   ├── mutual-funds.png# Official Mutual Funds & SIP illustration
│   ├── bonds.png       # Official Bonds & Currencies illustration
│   ├── ipos.png        # Official IPO illustration
│   ├── webtrading.svg  # ZEBU Web platform icon
│   ├── app-desk.svg    # ZEBU Desktop terminal icon
│   ├── api.svg         # ZEBU Python API icon
│   ├── reports.svg     # ZEBU Smart Reports icon
│   ├── apps.svg        # ZEBU Mobile apps icon
│   ├── funds.svg       # ZEBU Instant Funds icon
│   ├── sebi-check.svg  # Official SEBI Registered Broker badge
│   └── iso-logo.svg    # Official ISO Certified badge
├── css/
│   └── styles.css      # White mode default design system with Dark mode toggle
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
