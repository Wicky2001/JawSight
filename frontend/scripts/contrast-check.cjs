const fs = require("fs");
const path = require("path");

const file = path.resolve(__dirname, "../src/styles/themes.css");
const raw = fs.readFileSync(file, "utf8");

function parseVars(block) {
  const vars = {};
  const re = /--([a-zA-Z0-9-]+):\s*([^;]+);/g;
  let m;
  while ((m = re.exec(block))) {
    vars[m[1]] = m[2].trim();
  }
  return vars;
}

const rootMatch = raw.match(/:root\s*\{([\s\S]*?)\}/);
const darkMatch = raw.match(/\.dark-theme\s*\{([\s\S]*?)\}/);

if (!rootMatch) {
  console.error("Could not find :root in themes.css");
  process.exit(2);
}

const rootVars = parseVars(rootMatch[1]);
const darkVars = darkMatch ? parseVars(darkMatch[1]) : {};

function hexToRgb(str) {
  str = str.trim();
  if (str.startsWith("rgba")) {
    const parts = str
      .match(/rgba\(([^)]+)\)/)[1]
      .split(",")
      .map((s) => s.trim());
    return { r: +parts[0], g: +parts[1], b: +parts[2], a: +parts[3] };
  }
  if (str.startsWith("rgb")) {
    const parts = str
      .match(/rgb\(([^)]+)\)/)[1]
      .split(",")
      .map((s) => s.trim());
    return { r: +parts[0], g: +parts[1], b: +parts[2], a: 1 };
  }
  if (str.startsWith("#")) {
    let c = str.substring(1);
    if (c.length === 3)
      c = c
        .split("")
        .map((ch) => ch + ch)
        .join("");
    const num = parseInt(c, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255, a: 1 };
  }
  // fallback for rgba expressed as rgba(99,163,97,0.08)
  if (str.includes(",")) {
    const parts = str
      .replace(/[()]/g, "")
      .split(",")
      .map((s) => s.trim());
    return {
      r: +parts[0],
      g: +parts[1],
      b: +parts[2],
      a: parts[3] ? +parts[3] : 1,
    };
  }
  return null;
}

function luminance({ r, g, b }) {
  const srgb = [r, g, b]
    .map((v) => v / 255)
    .map((v) =>
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
    );
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(fg, bg) {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  if (!fgRgb || !bgRgb) return null;
  const L1 = luminance(fgRgb);
  const L2 = luminance(bgRgb);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function checkTheme(vars, name) {
  const checks = [
    { a: "text-primary", b: "color-bg-app" },
    { a: "text-primary", b: "color-surface-card" },
    { a: "text-secondary", b: "color-surface-card" },
    { a: "brand-primary", b: "color-surface-card" },
    { a: "brand-primary", b: "color-bg-app" },
    { a: "btn-primary-bg", b: "color-surface-card" },
    { a: "text-primary", b: "color-table-header-bg" },
  ];

  const results = checks.map((check) => {
    const fg = vars[check.a];
    const bg = vars[check.b];
    const ratio = contrastRatio(fg, bg);
    return { check: `${check.a} on ${check.b}`, fg, bg, ratio };
  });
  return { name, results };
}

const lightReport = checkTheme(rootVars, "light");
const darkReport = checkTheme(Object.assign({}, rootVars, darkVars), "dark");

function printReport(rep) {
  console.log("\nTheme:", rep.name);
  rep.results.forEach((r) => {
    console.log(
      `- ${r.check}: fg=${r.fg} bg=${r.bg} -> ratio=${r.ratio ? r.ratio.toFixed(2) : "n/a"}`,
    );
  });
}

printReport(lightReport);
printReport(darkReport);

// Basic analysis and suggested fixes
console.log("\nAnalysis:");
[lightReport, darkReport].forEach((rep) => {
  rep.results.forEach((r) => {
    if (r.ratio && r.ratio < 4.5) {
      console.log(
        `- [${rep.name}] Contrast fail: ${r.check} = ${r.ratio.toFixed(2)} (suggest adjust fg or bg)`,
      );
    }
  });
});

console.log("\nDone.");
