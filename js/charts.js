// ZEBU AI — Chart Engine (SVG-based sparklines and bar charts)

const Charts = {
  // Draw a sparkline SVG
  sparkline(values, opts = {}) {
    const {
      width = 120,
      height = 40,
      color = "#00C896",
      fillColor = null,
      strokeWidth = 1.5,
    } = opts;

    if (!values || values.length < 2) return "";

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(" L ")}`;

    let fillPath = "";
    if (fillColor) {
      const first = points[0].split(",");
      const last = points[points.length - 1].split(",");
      fillPath = `<path d="M ${points.join(" L ")} L ${last[0]},${height} L ${first[0]},${height} Z" fill="${fillColor}" opacity="0.15"/>`;
    }

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        ${fillPath}
        <path d="${pathD}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  },

  // Horizontal bar chart for sector allocation
  sectorBar(sectors, opts = {}) {
    const { width = 160, barHeight = 6, gap = 14 } = opts;
    const totalHeight = sectors.length * (barHeight + gap);

    const bars = sectors.map((s, i) => {
      const y = i * (barHeight + gap);
      const isPos = s.change >= 0;
      const color = isPos ? "#00C896" : "#FF4D6D";
      const barWidth = Math.abs(s.change) * 12;
      const changeText = `${isPos ? "+" : ""}${s.change.toFixed(2)}%`;

      return `
        <g transform="translate(0,${y})">
          <rect x="0" y="0" width="${barWidth}" height="${barHeight}" rx="3" fill="${color}" opacity="0.9"/>
          <text x="${barWidth + 6}" y="${barHeight - 1}" fill="${color}" font-size="9" font-family="Inter, sans-serif">${changeText}</text>
        </g>`;
    });

    return `<svg width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}">${bars.join("")}</svg>`;
  },

  // Donut chart for sector allocation
  donut(segments, opts = {}) {
    const { size = 100, strokeWidth = 18 } = opts;
    const cx = size / 2;
    const cy = size / 2;
    const r = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;

    const colors = ["#7C6FE5", "#00C896", "#F7B731", "#FF4D6D", "#4ECDC4", "#FF8C42", "#A8DADC"];

    let offset = 0;
    const arcs = segments.map((seg, i) => {
      const dash = (seg.pct / 100) * circumference;
      const gap = circumference - dash;
      const arc = `<circle
        cx="${cx}" cy="${cy}" r="${r}"
        fill="none"
        stroke="${colors[i % colors.length]}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${dash} ${gap}"
        stroke-dashoffset="${-offset}"
        transform="rotate(-90 ${cx} ${cy})"
        opacity="0.9"
      />`;
      offset += dash;
      return arc;
    });

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border-2)" stroke-width="${strokeWidth}"/>
        ${arcs.join("")}
      </svg>`;
  },

  // RSI gauge arc
  rsiGauge(value, opts = {}) {
    const { size = 80 } = opts;
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.38;

    // 0–30 oversold (green), 30–70 neutral, 70–100 overbought (red)
    let color = value > 70 ? "var(--red)" : value < 30 ? "var(--green)" : "var(--amber)";
    let label = value > 70 ? "Overbought" : value < 30 ? "Oversold" : "Neutral";

    // Arc for value
    const pct = value / 100;
    const startAngle = -Math.PI * 0.75;
    const endAngle = startAngle + pct * Math.PI * 1.5;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = pct > 0.5 ? 1 : 0;

    // Background arc
    const bx2 = cx + r * Math.cos(startAngle + Math.PI * 1.5);
    const by2 = cy + r * Math.sin(startAngle + Math.PI * 1.5);

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <path d="M ${x1} ${y1} A ${r} ${r} 0 1 1 ${bx2} ${by2}" fill="none" stroke="var(--border-2)" stroke-width="6" stroke-linecap="round"/>
        <path d="M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/>
        <text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="${color}" font-size="14" font-weight="700" font-family="Inter, sans-serif">${value}</text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" fill="var(--text-tertiary)" font-size="7" font-family="Inter, sans-serif">${label}</text>
      </svg>`;
  },

  // MACD histogram bar chart
  macdHistogram(macd, opts = {}) {
    const { width = 200, height = 60 } = opts;
    const { value, signal, histogram } = macd;
    const isPos = histogram >= 0;
    const color = isPos ? "var(--green)" : "var(--red)";
    const barH = Math.min(Math.abs(histogram) * 0.6, height * 0.7);
    const y = isPos ? (height / 2) - barH : height / 2;

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <line x1="0" y1="${height/2}" x2="${width}" y2="${height/2}" stroke="var(--border-2)" stroke-width="1"/>
        <rect x="${width/2 - 20}" y="${y}" width="40" height="${barH}" rx="3" fill="${color}" opacity="0.85"/>
        <text x="10" y="14" fill="var(--text-tertiary)" font-size="9" font-family="Inter">MACD: ${value.toFixed(1)}</text>
        <text x="10" y="26" fill="var(--text-tertiary)" font-size="9" font-family="Inter">Signal: ${signal.toFixed(1)}</text>
        <text x="${width-10}" y="14" text-anchor="end" fill="${color}" font-size="9" font-family="Inter">Hist: ${histogram.toFixed(1)}</text>
      </svg>`;
  },

  // Portfolio P&L waterfall
  pnlBar(pct, opts = {}) {
    const { width = 80, height = 8 } = opts;
    const isPos = pct >= 0;
    const color = isPos ? "var(--green)" : "var(--red)";
    const fill = Math.min(Math.abs(pct) * 4, 100);
    return `
      <div style="width:${width}px;height:${height}px;background:var(--surface-2);border-radius:4px;overflow:hidden;">
        <div style="width:${fill}%;height:100%;background:${color};border-radius:4px;opacity:0.85;transition:width 0.6s ease;"></div>
      </div>`;
  },
};

window.Charts = Charts;
