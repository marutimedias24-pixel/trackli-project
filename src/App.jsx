import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabase";

/* ══════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════ */
const toISO = (d) => {
  if (!d) return "";
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  return new Date(d).toISOString().slice(0, 10);
};
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const yesterdayISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fmtFull = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const M = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${d} ${M[m - 1]} ${y}`;
};
const fmtINR = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const uid = () => Math.random().toString(36).slice(2, 10);
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ══════════════════════════════════════════════
   SVG ICON SYSTEM — no emojis
══════════════════════════════════════════════ */
const IC = {
  home: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7 18v-6h6v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M4 6h12M4 10h12M4 14h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 20 20" fill="none">
      <rect
        x="3"
        y="4"
        width="14"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3 8h14M7 3v2M13 3v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  receipt: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M5 3h10a1 1 0 011 1v13l-2-1.5L12 17l-2-1.5L8 17l-2-1.5L4 17V4a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 8h4M8 11h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  arrowUp: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M10 15V5M5 10l5-5 5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  arrowDown: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M10 5v10M15 10l-5 5-5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  trending: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M3 14l5-5 4 3 5-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 5h4v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 20 20" fill="none">
      <rect
        x="2"
        y="5"
        width="16"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M2 9h16" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="13" r="1.2" fill="currentColor" />
      <path
        d="M6 2l-2 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M4 10l5 5L16 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 7v3.5l2.5 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 20 20" fill="none">
      <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2 17c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15 11a3 3 0 010 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13.5 5a3 3 0 010 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M10 4v12M4 10h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M17 12A7 7 0 018 3a7 7 0 100 14 7 7 0 009-5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3M13 14l4-4-4-4M17 10H8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M4 16l3-1 8-8a1.4 1.4 0 00-2-2L5 13 4 16z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M3 6h14M8 6V4h4v2M6 6l1 11h6l1-11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M10 3L2 17h16L10 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 9v4M10 14.5v.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  eyeOff: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M3 3l14 14M10 4C6 4 3 10 3 10s1 2 3 3.5M15 7c1.5 1.5 2 3 2 3s-3 6-8 6a7 7 0 01-2.5-.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M14 14l3 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M3 5h14M6 10h8M9 15h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M11 2L4 11h7l-2 7 9-9h-7l2-7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  download: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M10 3v10M6 10l4 4 4-4M3 17h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2l2.4 5 5.6.8-4 4 1 5.5L10 15l-5 2.3 1-5.5-4-4 5.6-.8L10 2z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 9v5M10 7v.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
};

// Icon component
const Icon = ({ n, size = 16, color = "currentColor", style = {} }) => (
  <span
    style={{
      width: size,
      height: size,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      color,
      ...style,
    }}
  >
    {IC[n] || IC.bolt}
  </span>
);

/* ══════════════════════════════════════════════
   STORAGE
══════════════════════════════════════════════ */
const buildSeed = () => [];
const loadTx = () => {
  try {
    const r = localStorage.getItem("flt_v4");
    if (r) return JSON.parse(r).map((t) => ({ paid: false, ...t }));
  } catch {}
  return buildSeed();
};
const saveTx = (a) => {
  try {
    localStorage.setItem("flt_v4", JSON.stringify(a));
  } catch {}
};
const loadGoal = () => {
  try {
    const r = localStorage.getItem("flt_goal");
    if (r) return JSON.parse(r);
  } catch {}
  return { monthly: 0 };
};
const saveGoal = (g) => {
  try {
    localStorage.setItem("flt_goal", JSON.stringify(g));
  } catch {}
};
const loadLastMonth = () => {
  try {
    const r = localStorage.getItem("flt_last_month");
    if (r) return r;
  } catch {}
  return "";
};
const saveLastMonth = (m) => {
  try {
    localStorage.setItem("flt_last_month", m);
  } catch {}
};
const loadArchive = () => {
  try {
    const r = localStorage.getItem("flt_archive");
    if (r) return JSON.parse(r);
  } catch {}
  return {};
};
const saveArchive = (a) => {
  try {
    localStorage.setItem("flt_archive", JSON.stringify(a));
  } catch {}
};

// ── SUBSCRIPTION ──
const UNLOCK_CODES = ["FREELANCER60", "FL60PRO", "VIDEOEDITOR60"]; // add more when someone pays
const TRIAL_DAYS = 30;
const loadSub = () => {
  try {
    const r = localStorage.getItem("flt_sub");
    if (r) return JSON.parse(r);
  } catch {}
  return null;
};
const saveSub = (s) => {
  try {
    localStorage.setItem("flt_sub", JSON.stringify(s));
  } catch {}
};
const initTrial = () => {
  let sub = loadSub();
  if (!sub) {
    sub = {
      trialStart: new Date().toISOString(),
      unlocked: false,
      unlockedAt: null,
    };
    saveSub(sub);
  }
  return sub;
};
const getTrialDaysLeft = (sub) => {
  if (!sub) return TRIAL_DAYS;
  if (sub.unlocked) return 999;
  const start = new Date(sub.trialStart);
  const diff = Math.floor((new Date() - start) / 86400000);
  return Math.max(TRIAL_DAYS - diff, 0);
};

const loadClients = () => {
  try {
    const r = localStorage.getItem("flt_clients");
    if (r) return JSON.parse(r);
  } catch {}
  return [];
};
const saveClients = (a) => {
  try {
    localStorage.setItem("flt_clients", JSON.stringify(a));
  } catch {}
};

/* ══════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════ */
const PASS_KEY = "flt_auth_v1";
const CORRECT_PASSWORD = "freelancer123";

/* ══════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════ */
const C = {
  // Backgrounds
  bg: "#050709",
  surface: "var(--surface2)",
  card: "var(--surface)",
  cardHov: "#101520",
  // Borders
  border: "var(--cb)",
  borderH: "#243044",
  // Brand greens
  green: "var(--green)",
  greenD: "#00c853",
  greenBg: "#00e67610",
  greenGlow: "#00e67630",
  // Reds
  red: "var(--red)",
  redL: "#ff5252",
  redBg: "#ff174410",
  // Blues
  blue: "#448aff",
  blueBg: "#448aff10",
  // Amber
  amber: "var(--amber)",
  amberL: "#ffd740",
  amberBg: "#ffab0010",
  // Purple
  purple: "#e040fb",
  purpleBg: "#e040fb10",
  // Text
  text: "var(--t1)",
  sub: "#5a6a8a",
  muted: "var(--t3)",
};

/* ══════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════ */
const injectStyles = (dark = true) => {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  if (document.getElementById("flt-s")) return;
  const s = document.createElement("style");
  s.id = "flt-s";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700&display=swap');

    :root[data-theme="dark"] {
      --bg:         #0d0d12;
      --bg2:        #111117;
      --surface:    #18181f;
      --surface2:   #1f1f28;
      --card:       rgba(24,24,31,0.9);
      --cb:         rgba(255,255,255,0.07);
      --cbh:        rgba(255,255,255,0.13);
      --divider:    rgba(255,255,255,0.06);
      --t1:         #efefff;
      --t2:         #7c7c9a;
      --t3:         #3a3a52;
      --green:      #22c55e;
      --green2:     #4ade80;
      --greenbg:    rgba(34,197,94,0.1);
      --red:        #ef4444;
      --red2:       #f87171;
      --redbg:      rgba(239,68,68,0.1);
      --amber:      #f59e0b;
      --amber2:     #fbbf24;
      --amberbg:    rgba(245,158,11,0.1);
      --indigo:     #6366f1;
      --indigo2:    #818cf8;
      --indigobg:   rgba(99,102,241,0.12);
      --shadow:     0 1px 3px rgba(0,0,0,0.7);
      --shadow2:    0 4px 16px rgba(0,0,0,0.6);
      --shadow3:    0 12px 40px rgba(0,0,0,0.7);
      --card-today: linear-gradient(145deg,rgba(20,40,28,.9),rgba(14,28,20,.9));
      --card-amber: linear-gradient(145deg,rgba(35,25,5,.9),rgba(24,18,4,.9));
    }
    :root[data-theme="light"] {
      --bg:         #f0f2f8;
      --bg2:        #e8eaf2;
      --surface:    #ffffff;
      --surface2:   #f5f6fa;
      --card:       rgba(255,255,255,0.98);
      --cb:         rgba(0,0,0,0.08);
      --cbh:        rgba(0,0,0,0.14);
      --divider:    rgba(0,0,0,0.07);
      --t1:         #0f0f1a;
      --t2:         #5a5a72;
      --t3:         #a0a0b8;
      --green:      #16a34a;
      --green2:     #15803d;
      --greenbg:    rgba(22,163,74,0.08);
      --red:        #dc2626;
      --red2:       #b91c1c;
      --redbg:      rgba(220,38,38,0.07);
      --amber:      #d97706;
      --amber2:     #b45309;
      --amberbg:    rgba(217,119,6,0.08);
      --indigo:     #4f46e5;
      --indigo2:    #4338ca;
      --indigobg:   rgba(79,70,229,0.09);
      --shadow:     0 1px 3px rgba(0,0,0,0.08);
      --shadow2:    0 4px 16px rgba(0,0,0,0.1);
      --shadow3:    0 12px 40px rgba(0,0,0,0.12);
      --card-today: linear-gradient(145deg,rgba(220,255,235,0.7),rgba(200,245,220,0.5));
      --card-amber: linear-gradient(145deg,rgba(255,248,220,0.8),rgba(255,240,200,0.5));
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { height: 100%; font-size: 15px; scroll-behavior: smooth; }
    body {
      background: var(--bg); color: var(--t1);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh; overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      transition: background .25s, color .25s;
    }
    #root { min-height: 100vh; display: flex; flex-direction: column; }
    input, select, button, textarea { font-family: inherit; }
    ::placeholder { color: var(--t3); }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--cb); border-radius: 99px; }
    input[type=date]::-webkit-calendar-picker-indicator { opacity: .4; cursor: pointer; filter: var(--t2); }

    /* ── ANIMATIONS ── */
    @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes scaleIn { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
    @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.15} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
    @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
    @keyframes barGrow { from{width:0} to{width:var(--w,100%)} }
    @keyframes ringPulse { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.2);opacity:0} }

    .fu  { animation: fadeUp .35s cubic-bezier(.16,1,.3,1) both; }
    .fu1 { animation: fadeUp .35s cubic-bezier(.16,1,.3,1) .06s both; }
    .fu2 { animation: fadeUp .35s cubic-bezier(.16,1,.3,1) .12s both; }
    .fu3 { animation: fadeUp .35s cubic-bezier(.16,1,.3,1) .18s both; }
    .fu4 { animation: fadeUp .35s cubic-bezier(.16,1,.3,1) .24s both; }
    .pop { animation: scaleIn .25s cubic-bezier(.34,1.56,.64,1) both; }
    .blink { animation: blink 2.5s ease infinite; }
    .float { animation: float 4s ease infinite; }
    .spin-el { animation: spin 1s linear infinite; }

    /* ── LAYOUT SYSTEM ── */
    html, body { height: 100%; }
    #root { height: 100%; }

    .app-shell {
      display: flex; flex-direction: column;
      height: 100vh; width: 100%; overflow: hidden;
      background: var(--bg);
    }

    /* Header — fixed height, never shrinks */
    .hdr { flex-shrink: 0; z-index: 200; }

    /* Body = sidebar + content, fills remaining height */
    .app-body {
      display: flex; flex: 1;
      min-height: 0; /* critical for flex children to scroll */
      width: 100%; overflow: hidden;
    }

    /* ── SIDEBAR ── */
    .sidebar {
      width: 220px; flex-shrink: 0;
      background: var(--surface);
      border-right: 1px solid var(--divider);
      display: flex; flex-direction: column;
      padding: 16px 10px 20px;
      height: 100%; overflow-y: auto;
      scrollbar-width: none;
      transition: background .25s, border-color .25s;
    }
    .sidebar::-webkit-scrollbar { display: none; }

    /* ── MAIN CONTENT — fills ALL remaining width ── */
    .main-content {
      flex: 1; min-width: 0; /* prevents overflow */
      height: 100%; overflow-y: auto;
      padding: 20px 28px 60px;
      background: var(--bg);
    }

    /* Sidebar nav items */
    .sb-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 10px; border: none;
      background: transparent; color: var(--t3); font-size: 13px;
      font-weight: 500; cursor: pointer; width: 100%; text-align: left;
      font-family: inherit; transition: background .15s, color .15s;
      margin-bottom: 2px; flex-shrink: 0;
    }
    .sb-item:hover  { background: var(--surface2); color: var(--t2); }
    .sb-item.active { background: var(--indigobg); color: var(--indigo); font-weight: 600; }
    .sb-icon {
      width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: background .15s;
    }
    .sb-item.active .sb-icon { background: var(--indigobg); color: var(--indigo); }

    /* ── DASHBOARD GRID ── */
    .dash-grid {
      display: grid;
      grid-template-columns: minmax(0,1fr) 290px;
      gap: 18px; align-items: start;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4,1fr);
      gap: 12px; margin-bottom: 16px;
    }
    .dash-right-sticky {
      position: sticky; top: 0;
      display: flex; flex-direction: column; gap: 14px;
    }

    /* Mobile page wrap */
    .page-wrap { width: 100%; padding: 16px 14px 80px; }

    /* ── GLASS CARD ── */
    .gc {
      background: var(--card);
      border: 1px solid var(--cb);
      border-radius: 14px;
      position: relative; overflow: hidden;
      transition: border-color .2s, box-shadow .2s, transform .2s;
    }
    .gc::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,.025) 0%, transparent 60%);
      pointer-events: none; border-radius: inherit;
    }
    .gc:hover { border-color: var(--cbh); }
    .gc.lift:hover { transform: translateY(-2px); box-shadow: var(--shadow2); }
    .gc.g { border-color: rgba(34,197,94,.2); background: var(--card-today); }
    .gc.a { border-color: rgba(245,158,11,.2); background: var(--card-amber); }
    .gc.r { border-color: rgba(239,68,68,.15); }
    .gc.i { border-color: rgba(99,102,241,.2); }

    /* Tinted glow corners */
    .gc.g::after, .gc.a::after, .gc.i::after {
      content: ''; position: absolute; top: -60px; right: -60px;
      width: 180px; height: 180px; pointer-events: none; border-radius: 50%;
    }
    .gc.g::after { background: radial-gradient(circle, rgba(34,197,94,.07), transparent 70%); }
    .gc.a::after { background: radial-gradient(circle, rgba(245,158,11,.06), transparent 70%); }
    .gc.i::after { background: radial-gradient(circle, rgba(99,102,241,.08), transparent 70%); }

    /* ── TYPOGRAPHY ── */
    .lbl { font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--t3); }
    .num { font-variant-numeric: tabular-nums; letter-spacing: -.02em; }

    /* ── BUTTONS ── */
    button { cursor: pointer; transition: all .16s cubic-bezier(.16,1,.3,1); outline: none; }
    button:active { transform: scale(.95) !important; }
    button:disabled { opacity: .4; cursor: not-allowed !important; }

    .btn-g { background: var(--green); color: #fff; font-weight: 600; border: none; border-radius: 10px; box-shadow: 0 2px 10px rgba(34,197,94,.3); }
    .btn-g:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 4px 18px rgba(34,197,94,.45); }
    .btn-r { background: var(--red); color: #fff; font-weight: 600; border: none; border-radius: 10px; box-shadow: 0 2px 10px rgba(239,68,68,.25); }
    .btn-r:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-i { background: var(--indigo); color: #fff; font-weight: 600; border: none; border-radius: 10px; box-shadow: 0 2px 10px rgba(99,102,241,.35); }
    .btn-i:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-ghost { background: transparent; color: var(--t2); border: 1px solid var(--cb); font-weight: 500; border-radius: 10px; }
    .btn-ghost:hover:not(:disabled) { border-color: var(--cbh); color: var(--t1); background: var(--surface2); }

    /* Pill buttons in header */
    .pill-g { background: var(--greenbg); border: 1px solid rgba(34,197,94,.25); color: var(--green); font-weight: 600; font-size: 13px; border-radius: 99px; display: inline-flex; align-items: center; gap: 6px; }
    .pill-g:hover { background: rgba(34,197,94,.15); border-color: rgba(34,197,94,.4); transform: translateY(-1px); }
    .pill-r { background: var(--redbg); border: 1px solid rgba(239,68,68,.2); color: var(--red); font-weight: 600; font-size: 13px; border-radius: 99px; display: inline-flex; align-items: center; gap: 6px; }
    .pill-r:hover { background: rgba(239,68,68,.15); border-color: rgba(239,68,68,.38); transform: translateY(-1px); }
    .pill-ghost { background: transparent; border: 1px solid var(--cb); color: var(--t2); font-size: 13px; border-radius: 99px; display: inline-flex; align-items: center; gap: 6px; font-weight: 500; }
    .pill-ghost:hover { border-color: var(--cbh); color: var(--t1); }

    /* ── INPUTS ── */
    .inp {
      width: 100%; background: var(--surface2); border: 1px solid var(--cb);
      border-radius: 10px; padding: 9px 13px; color: var(--t1); font-size: 14px;
      transition: border-color .18s, box-shadow .18s;
    }
    .inp:focus { outline: none; border-color: var(--indigo); box-shadow: 0 0 0 3px var(--indigobg); }
    input[type=date].inp { cursor: pointer; }

    /* ── HEADER ── */
    .hdr {
      position: sticky; top: 0; z-index: 200;
      background: rgba(13,13,18,0.9);
      border-bottom: 1px solid var(--divider);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      transition: background .25s, border-color .25s;
    }
    :root[data-theme="light"] .hdr {
      background: rgba(255,255,255,0.95);
    }
    .hdr-inner {
      display: flex; align-items: center; justify-content: space-between;
      height: 56px; padding: 0 24px; width: 100%;
    }
    .hdr-logo { display: flex; align-items: center; gap: 10px; }
    .hdr-logo-ic {
      width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--indigo), var(--green));
      display: flex; align-items: center; justify-content: center; color: #fff;
      box-shadow: 0 2px 8px rgba(99,102,241,.35);
    }
    .hdr-logo-name { font-size: 15px; font-weight: 700; color: var(--t1); letter-spacing: -.04em; line-height: 1; }
    .hdr-logo-sub  { font-size: 10px; color: var(--t3); margin-top: 1px; font-weight: 400; }
    .hdr-actions { display: flex; align-items: center; gap: 8px; }

    /* ── TABS ── */
    .tabs-bar {
      border-top: 1px solid var(--divider);
      padding: 0 24px; width: 100%;
      display: flex; gap: 0; overflow-x: auto; scrollbar-width: none;
    }
    .tabs-bar::-webkit-scrollbar { display: none; }
    .tab-btn {
      position: relative; background: none; border: none;
      color: var(--t3); padding: 9px 16px; font-size: 13px; font-weight: 500;
      white-space: nowrap; cursor: pointer; font-family: inherit;
      display: flex; align-items: center; gap: 7px;
      transition: color .18s; letter-spacing: .01em;
    }
    .tab-btn::after {
      content: ''; position: absolute; bottom: 0; left: 50%;
      transform: translateX(-50%); height: 2px; width: 0;
      background: linear-gradient(90deg, var(--indigo), var(--green));
      border-radius: 99px 99px 0 0; transition: width .28s cubic-bezier(.16,1,.3,1);
    }
    .tab-btn.active { color: var(--t1); font-weight: 600; }
    .tab-btn.active::after { width: 55%; }
    .tab-btn:hover:not(.active) { color: var(--t2); }
    .tab-icon-wrap {
      width: 20px; height: 20px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      transition: background .18s; color: inherit;
    }
    .tab-btn.active .tab-icon-wrap { background: var(--indigobg); color: var(--indigo); }

    /* ── THEME TOGGLE ── */
    .th-toggle {
      width: 44px; height: 24px; border-radius: 99px;
      background: var(--surface2); border: 1px solid var(--cb);
      position: relative; cursor: pointer; padding: 2px; flex-shrink: 0;
      display: flex; align-items: center; transition: background .25s;
    }
    .th-knob {
      width: 20px; height: 20px; border-radius: 50%;
      background: var(--indigo); display: flex; align-items: center; justify-content: center;
      transition: transform .3s cubic-bezier(.34,1.56,.64,1);
      box-shadow: 0 1px 4px rgba(99,102,241,.4); color: #fff;
    }
    .th-toggle.light .th-knob { transform: translateX(20px); }

    /* ── DASHBOARD GRID ── */
    .dash-grid { display: grid; grid-template-columns: minmax(0,1fr) 300px; gap: 18px; align-items: start; }
    .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 16px; }
    /* Full-width top section */
    .dash-top { width: 100%; margin-bottom: 0; }
    /* Right column sticky */
    .dash-right-sticky { position: sticky; top: 74px; display: flex; flex-direction: column; gap: 14px; }

    /* ── PROGRESS ── */
    .prog-track { height: 5px; background: var(--divider); border-radius: 99px; overflow: hidden; }
    .prog-fill { height: 100%; border-radius: 99px; transition: width .8s cubic-bezier(.16,1,.3,1); }

    /* ── ROW HOVER ── */
    .tx-row { border-radius: 10px; margin: 0 -10px; padding: 0 10px; transition: background .12s; }
    .tx-row:hover { background: var(--surface2); }

    /* ── EMPTY STATE ── */
    .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 20px; gap: 10px; text-align: center; }

    /* ── MOBILE NAV ── */
    .mob-nav {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
      background: var(--card); border-top: 1px solid var(--divider);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      display: flex; padding-bottom: env(safe-area-inset-bottom, 0);
    }
    .mob-nav-btn {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 3px; padding: 9px 4px 7px;
      background: none; border: none; color: var(--t3); font-size: 10px;
      font-weight: 500; cursor: pointer; position: relative; font-family: inherit;
      transition: color .18s;
    }
    .mob-nav-btn.active { color: var(--indigo); }
    .mob-nav-btn.active::before {
      content: ''; position: absolute; top: 0; left: 25%; right: 25%;
      height: 2px; background: var(--indigo); border-radius: 0 0 4px 4px;
    }
    .fab {
      position: fixed; bottom: 68px; right: 16px; z-index: 299;
      width: 48px; height: 48px; border-radius: 50%;
      background: linear-gradient(135deg, var(--indigo), var(--green));
      color: #fff; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 18px rgba(99,102,241,.45); border: none;
      transition: transform .2s, box-shadow .2s;
    }
    .fab:hover { transform: scale(1.06) !important; box-shadow: 0 6px 24px rgba(99,102,241,.6); }

    /* ══ RESPONSIVE ══ */

    /* ── DESKTOP (>960px): sidebar layout ── */
    @media (min-width: 961px) {
      .sidebar      { display: flex !important; }
      .tabs-bar     { display: none !important; }
      .mob-nav      { display: none !important; }
      .fab          { display: none !important; }
    }

    /* ── TABLET (641–960px): no sidebar, top tabs ── */
    @media (min-width: 641px) and (max-width: 960px) {
      .sidebar      { display: none !important; }
      .tabs-bar     { display: flex !important; }
      .mob-nav      { display: none !important; }
      .fab          { display: none !important; }
      /* Stack layout vertically */
      .app-body     { display: block !important; overflow-y: auto !important; height: auto !important; }
      .main-content { height: auto !important; overflow-y: visible !important; padding: 16px 20px 40px !important; }
      .dash-grid    { grid-template-columns: 1fr !important; }
      .stats-grid   { grid-template-columns: repeat(2,1fr) !important; }
      .dash-right-sticky { position: static !important; }
    }

    /* ── MOBILE (≤640px): no sidebar, bottom nav ── */
    @media (max-width: 640px) {
      .sidebar      { display: none !important; }
      .tabs-bar     { display: none !important; }
      .mob-nav      { display: flex !important; }
      .fab          { display: flex !important; }
      .hdr-inner    { padding: 0 14px; height: 50px; }
      /* Stack layout vertically */
      .app-body     { display: block !important; overflow-y: auto !important; height: auto !important; }
      .main-content { height: auto !important; overflow-y: visible !important; padding: 12px 12px 80px !important; }
      .dash-grid    { grid-template-columns: 1fr !important; }
      .stats-grid   { grid-template-columns: repeat(2,1fr) !important; gap: 10px !important; }
      .dash-right-sticky { position: static !important; }
      .hide-sm      { display: none !important; }
      .hdr-logo-sub { display: none !important; }
      .hdr-actions .btn-lbl { display: none !important; }
      .hdr-actions  { gap: 6px; }
    }
    @media print {
      body * { visibility: hidden !important; }
      #inv-print, #inv-print * { visibility: visible !important; }
      #inv-print { position: fixed !important; inset: 0; background: #fff !important; }
    }
  `;
  document.head.appendChild(s);
};

const updateTheme = (dark) => {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
};

/* ══════════════════════════════════════════════
   BASE COMPONENTS
══════════════════════════════════════════════ */

const GlassCard = ({
  children,
  style = {},
  cls = "",
  variant = "",
  lift = false,
  p = 18,
}) => (
  <div
    className={`gc ${variant} ${lift ? "lift" : ""} ${cls}`}
    style={{ padding: p, ...style }}
  >
    {children}
  </div>
);
const Card = ({ children, style = {}, cls = "" }) => (
  <GlassCard cls={cls} style={style}>
    {children}
  </GlassCard>
);

const SecTitle = ({ children, extra }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    }}
  >
    <span className="lbl">{children}</span>
    {extra}
  </div>
);

const Btn = ({
  children,
  onClick,
  v = "i",
  sz = "md",
  style = {},
  disabled = false,
}) => {
  const sz2 = {
    xs: { padding: "5px 11px", fontSize: 11, borderRadius: 8 },
    sm: { padding: "7px 14px", fontSize: 12, borderRadius: 9 },
    md: { padding: "9px 18px", fontSize: 13, borderRadius: 10 },
    lg: { padding: "11px 22px", fontSize: 14, borderRadius: 11 },
  };
  const vmap = { i: "btn-i", g: "btn-g", r: "btn-r", ghost: "btn-ghost" };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={vmap[v] || "btn-i"}
      style={{ ...sz2[sz || "md"], ...style }}
    >
      {children}
    </button>
  );
};

const FI = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  style = {},
  autoFocus = false,
  suffix = null,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <span className="lbl">{label}</span>}
    <div style={{ position: "relative" }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="inp"
        style={style}
      />
      {suffix && (
        <span
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const FS = ({ label, value, onChange, options, style = {} }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <span className="lbl">{label}</span>}
    <select value={value} onChange={onChange} className="inp" style={style}>
      {options.map((o) => (
        <option key={o.v} value={o.v}>
          {o.l}
        </option>
      ))}
    </select>
  </div>
);

const Tag = ({ children, color = "var(--indigo)", bg }) => (
  <span
    style={{
      background: bg || color + "14",
      color,
      border: `1px solid ${color}28`,
      borderRadius: 99,
      padding: "2px 9px",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: ".04em",
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
    }}
  >
    {children}
  </span>
);

const ProgressBar = ({ pct = 0, color = "var(--indigo)", h = 5 }) => (
  <div className="prog-track" style={{ height: h }}>
    <div
      className="prog-fill"
      style={{ width: `${Math.min(pct, 100)}%`, background: color, height: h }}
    />
  </div>
);

const Loader = ({ size = 18, color = "var(--indigo)" }) => (
  <div
    className="spin-el"
    style={{
      width: size,
      height: size,
      border: "2px solid var(--divider)",
      borderTopColor: color,
      borderRadius: "50%",
      flexShrink: 0,
    }}
  />
);

const ThemeToggle = ({ dark, onToggle }) => (
  <button
    onClick={onToggle}
    className={`th-toggle ${dark ? "" : "light"}`}
    style={{ outline: "none" }}
  >
    <div className="th-knob">
      <Icon n={dark ? "moon" : "sun"} size={12} color="#fff" />
    </div>
  </button>
);

const Avatar = ({ name = "?", size = 28, color = "var(--indigo)" }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      flexShrink: 0,
      background: `${color}18`,
      border: `1px solid ${color}28`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.38,
      fontWeight: 700,
      color,
    }}
  >
    {(name[0] || "?").toUpperCase()}
  </div>
);

const SparkBar = ({ value, max, color = "var(--green)" }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div
      style={{
        height: 3,
        background: "var(--divider)",
        borderRadius: 99,
        overflow: "hidden",
        marginTop: 6,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: "width .6s",
        }}
      />
    </div>
  );
};

/* ══════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════ */
const Modal = ({ open, onClose, title, children, width = 480 }) => {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        backdropFilter: "blur(10px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="gc pop"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: width,
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "22px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--t1)",
              letterSpacing: "-.03em",
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{
              width: 30,
              height: 30,
              padding: 0,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon n="close" size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   AUTH SCREEN — Supabase Register + Login
══════════════════════════════════════════════ */
const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState(() => {
    // If URL has access_token, it's a reset link — show reset form
    return window.location.hash.includes("access_token") ? "reset" : "login";
  });
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [newPass, setNew] = useState("");
  const [newPass2, setNew2] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoad] = useState(false);
  const [error, setError] = useState("");
  const [success, setOk] = useState("");
  const [showPw, setShowPw] = useState(false);

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setOk("");
  };

  const go = async () => {
    setError("");
    setOk("");
    setLoad(true);
    try {
      if (mode === "reset") {
        if (!newPass || !newPass2) {
          setError("Dono fields fill karo!");
          setLoad(false);
          return;
        }
        if (newPass.length < 6) {
          setError("Password kam se kam 6 characters!");
          setLoad(false);
          return;
        }
        if (newPass !== newPass2) {
          setError("Dono passwords match nahi kar rahe!");
          setLoad(false);
          return;
        }
        const { error: e } = await supabase.auth.updateUser({
          password: newPass,
        });
        if (e) throw e;
        setOk("Password update ho gaya! Ab login karo.");
        setTimeout(() => {
          window.location.hash = "";
          switchMode("login");
        }, 2000);
      } else if (mode === "forgot") {
        if (!email) {
          setError("Email daalo pehle!");
          setLoad(false);
          return;
        }
        const { error: e } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (e) throw e;
        setOk(
          "Reset link bhej diya! Email check karo (spam bhi dekho). Link se wapas aao to new password set hoga.",
        );
      } else if (mode === "register") {
        if (!name.trim()) {
          setError("Naam zaroori hai!");
          setLoad(false);
          return;
        }
        if (!email || !pass) {
          setError("Sab fields fill karo!");
          setLoad(false);
          return;
        }
        if (pass.length < 6) {
          setError("Password kam se kam 6 characters!");
          setLoad(false);
          return;
        }
        const { error: e } = await supabase.auth.signUp({
          email,
          password: pass,
          options: { data: { full_name: name.trim() } },
        });
        if (e) throw e;
        setOk("Account ban gaya! Ab login karo.");
        switchMode("login");
      } else {
        if (!email || !pass) {
          setError("Email aur password fill karo!");
          setLoad(false);
          return;
        }
        const { data, error: e } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (e) throw e;
        onLogin(data.user);
      }
    } catch (e) {
      const msg = e.message || "";
      if (msg.includes("Invalid login"))
        setError("Email ya password galat hai!");
      else if (msg.includes("already registered"))
        setError("Yeh email pehle se registered hai!");
      else if (msg.includes("rate limit"))
        setError("Zyada attempts! Thoda ruko phir try karo.");
      else setError(msg || "Kuch gadbad ho gayi, dobara try karo.");
    }
    setLoad(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glows */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle,rgba(99,102,241,.07),transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            bottom: "-10%",
            right: "5%",
            background:
              "radial-gradient(circle,rgba(34,197,94,.05),transparent 60%)",
          }}
        />
      </div>

      <div
        className="fu"
        style={{
          width: "100%",
          maxWidth: 420,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              margin: "0 auto 14px",
              background: "linear-gradient(135deg,var(--indigo),var(--green))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 28px rgba(99,102,241,.38)",
            }}
          >
            <Icon n="bolt" size={22} color="#fff" />
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "var(--t1)",
              letterSpacing: "-.05em",
              marginBottom: 6,
            }}
          >
            Trackli
          </h1>
          <p style={{ fontSize: 13, color: "var(--t2)" }}>
            {mode === "reset"
              ? "Set a new password"
              : mode === "forgot"
                ? "Reset your password"
                : "Freelance income, simplified."}
          </p>
        </div>

        {/* Card */}
        <div className="gc" style={{ padding: "26px 28px 22px" }}>
          {/* ── RESET PASSWORD mode ── */}
          {mode === "reset" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  background: "var(--indigobg)",
                  border: "1px solid rgba(99,102,241,.2)",
                  borderRadius: 10,
                  padding: "11px 14px",
                  fontSize: 12,
                  color: "var(--indigo)",
                  lineHeight: 1.6,
                }}
              >
                Email link se aaye ho — naya password set karo.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span className="lbl">New Password</span>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={newPass}
                    onChange={(e) => setNew(e.target.value)}
                    placeholder="Min 6 characters"
                    className="inp"
                    style={{ paddingRight: 40 }}
                    autoFocus
                  />
                  <button
                    onClick={() => setShowPw((p) => !p)}
                    style={{
                      position: "absolute",
                      right: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    <Icon
                      n={showPw ? "eyeOff" : "eye"}
                      size={15}
                      color="var(--t3)"
                    />
                  </button>
                </div>
              </div>
              <FI
                label="Confirm Password"
                value={newPass2}
                onChange={(e) => setNew2(e.target.value)}
                type="password"
                placeholder="Same password dobara"
              />
            </div>
          )}

          {/* ── FORGOT mode ── */}
          {mode === "forgot" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  background: "var(--amberbg)",
                  border: "1px solid rgba(245,158,11,.2)",
                  borderRadius: 10,
                  padding: "11px 14px",
                  fontSize: 12,
                  color: "var(--amber)",
                  lineHeight: 1.6,
                }}
              >
                Registered email daalo — reset link milega inbox mein.
              </div>
              <FI
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@email.com"
                autoFocus
              />
            </div>
          )}

          {/* ── LOGIN / REGISTER mode ── */}
          {(mode === "login" || mode === "register") && (
            <>
              <div
                style={{
                  display: "flex",
                  background: "var(--surface2)",
                  border: "1px solid var(--divider)",
                  borderRadius: 11,
                  padding: 3,
                  marginBottom: 22,
                  gap: 3,
                }}
              >
                {[
                  { v: "login", l: "Sign In" },
                  { v: "register", l: "Register" },
                ].map((m) => (
                  <button
                    key={m.v}
                    onClick={() => switchMode(m.v)}
                    style={{
                      flex: 1,
                      padding: "9px 0",
                      fontSize: 13,
                      fontWeight: 600,
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "all .2s",
                      fontFamily: "inherit",
                      background:
                        mode === m.v ? "var(--surface)" : "transparent",
                      color: mode === m.v ? "var(--t1)" : "var(--t3)",
                      boxShadow: mode === m.v ? "var(--shadow)" : "none",
                    }}
                  >
                    {m.l}
                  </button>
                ))}
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {mode === "register" && (
                  <FI
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    autoFocus
                  />
                )}
                <FI
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@email.com"
                  autoFocus={mode === "login"}
                />
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 5 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span className="lbl">Password</span>
                    {mode === "login" && (
                      <button
                        onClick={() => switchMode("forgot")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--indigo)",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          padding: 0,
                        }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPw ? "text" : "password"}
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      placeholder="Min 6 characters"
                      onKeyDown={(e) => e.key === "Enter" && go()}
                      className="inp"
                      style={{ paddingRight: 40 }}
                    />
                    <button
                      onClick={() => setShowPw((p) => !p)}
                      style={{
                        position: "absolute",
                        right: 11,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                      }}
                    >
                      <Icon
                        n={showPw ? "eyeOff" : "eye"}
                        size={15}
                        color="var(--t3)"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Error / Success */}
          {error && (
            <div
              style={{
                marginTop: 14,
                background: "var(--redbg)",
                border: "1px solid rgba(239,68,68,.2)",
                borderRadius: 9,
                padding: "10px 13px",
                fontSize: 12,
                color: "var(--red)",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <Icon n="alert" size={13} color="var(--red)" />
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                marginTop: 14,
                background: "var(--greenbg)",
                border: "1px solid rgba(34,197,94,.2)",
                borderRadius: 9,
                padding: "10px 13px",
                fontSize: 12,
                color: "var(--green)",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <Icon n="check" size={13} color="var(--green)" />
              {success}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={go}
            disabled={loading}
            style={{
              marginTop: 18,
              width: "100%",
              padding: "13px 0",
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 11,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: loading
                ? "var(--surface2)"
                : mode === "register"
                  ? "var(--green)"
                  : "var(--indigo)",
              color: loading ? "var(--t3)" : "#fff",
              opacity: loading ? 0.7 : 1,
              boxShadow: loading
                ? "none"
                : mode === "register"
                  ? "0 4px 14px rgba(34,197,94,.35)"
                  : "0 4px 14px rgba(99,102,241,.4)",
              transition: "all .18s",
              fontFamily: "inherit",
            }}
          >
            {loading ? (
              <>
                <Loader size={15} color="var(--t2)" />
                <span>Please wait...</span>
              </>
            ) : mode === "reset" ? (
              "Set New Password"
            ) : mode === "forgot" ? (
              "Send Reset Link →"
            ) : mode === "login" ? (
              "Continue →"
            ) : (
              "Create Account →"
            )}
          </button>

          {/* Footer link */}
          <div
            style={{
              textAlign: "center",
              marginTop: 14,
              fontSize: 12,
              color: "var(--t3)",
            }}
          >
            {mode === "forgot" || mode === "reset" ? (
              <button
                onClick={() => switchMode("login")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--indigo)",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "inherit",
                }}
              >
                ← Back to Sign In
              </button>
            ) : (
              <span>
                {mode === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={() =>
                    switchMode(mode === "login" ? "register" : "login")
                  }
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--indigo)",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "inherit",
                  }}
                >
                  {mode === "login" ? "Register" : "Sign in"}
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            marginTop: 18,
            fontSize: 11,
            color: "var(--t3)",
          }}
        >
          By continuing you agree to our{" "}
          <a
            href="/privacy"
            style={{ color: "var(--t2)", textDecoration: "underline" }}
          >
            Privacy Policy
          </a>
          {" & "}
          <a
            href="/terms"
            style={{ color: "var(--t2)", textDecoration: "underline" }}
          >
            Terms
          </a>
        </p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   LOGIN SCREEN
══════════════════════════════════════════════ */
const LoginScreen = ({ onLogin }) => {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [error, setErr] = useState(false);
  const [shake, setShake] = useState(false);
  const attempt = () => {
    if (pw === CORRECT_PASSWORD) {
      localStorage.setItem(PASS_KEY, "true");
      onLogin();
    } else {
      setErr(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setErr(false), 2000);
      setPw("");
    }
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        className={`glass-card ${shake ? "" : "pop"}`}
        style={{
          padding: "36px 30px",
          width: "100%",
          maxWidth: 400,
          animation: shake ? "shake .4s ease" : "",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg,var(--indigo),var(--green))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
            }}
          >
            <Icon n="bolt" size={18} color="#fff" />
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-.03em",
              color: "var(--text-1)",
            }}
          >
            Trackli
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
            Apna password enter karo
          </p>
        </div>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <input
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && attempt()}
            placeholder="Password"
            autoFocus
            className="field"
            style={{
              paddingRight: 44,
              borderColor: error ? "var(--red)" : "",
              boxShadow: error ? "0 0 0 3px var(--red-bg)" : "",
            }}
          />
          <button
            onClick={() => setShow((s) => !s)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "var(--text-3)",
              cursor: "pointer",
              fontSize: 16,
              padding: 0,
            }}
          >
            <Icon n={show ? "eyeOff" : "eye"} size={15} color="var(--t3)" />
          </button>
        </div>
        {error && (
          <p
            style={{
              fontSize: 12,
              color: "var(--red)",
              textAlign: "center",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            ❌ Galat password — dobara try karo
          </p>
        )}
        <button
          onClick={attempt}
          disabled={!pw}
          className="btn-success"
          style={{
            width: "100%",
            borderRadius: 12,
            padding: "13px 0",
            fontSize: 15,
            fontWeight: 700,
            opacity: pw ? 1 : 0.5,
          }}
        >
          Login →
        </button>
        <p
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            textAlign: "center",
            marginTop: 16,
          }}
        >
          Default: <b style={{ color: "var(--text-2)" }}>freelancer123</b>
        </p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   QUICK ADD FORM
══════════════════════════════════════════════ */
const EXP_CATS = [
  "Rent",
  "Internet",
  "Electricity",
  "Software",
  "Food",
  "Travel",
  "Equipment",
  "Mobile",
  "Other",
];

const QuickAddForm = ({
  defaultType = "income",
  prefillClient = "",
  onAdd,
  onClose,
}) => {
  const [form, setForm] = useState({
    type: defaultType,
    client: prefillClient || "",
    amount: "",
    minutes: 0,
    date: todayISO(),
    note: "",
    category: EXP_CATS[0],
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isExp = form.type === "expense";
  const submit = () => {
    if (!form.amount || !form.date) return;
    if (!isExp && !form.client.trim()) return;
    onAdd({
      id: uid(),
      ...form,
      client: isExp ? form.category : form.client,
      amount: Number(form.amount),
      minutes: Number(form.minutes || 0),
      date: toISO(form.date),
      paid: isExp,
    });
  };
  return (
    <div>
      <div
        style={{
          display: "flex",
          background: "var(--surface2)",
          border: "1px solid var(--divider)",
          borderRadius: 12,
          padding: 4,
          marginBottom: 20,
          gap: 4,
        }}
      >
        {[
          { v: "income", l: "Income", icon: "arrowUp", c: "var(--green)" },
          { v: "expense", l: "Expense", icon: "arrowDown", c: "var(--red)" },
        ].map((t) => (
          <button
            key={t.v}
            onClick={() => setForm((f) => ({ ...f, type: t.v }))}
            style={{
              flex: 1,
              padding: "9px 0",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              borderRadius: 9,
              cursor: "pointer",
              transition: "all .2s",
              background: form.type === t.v ? "var(--surface)" : "transparent",
              color: form.type === t.v ? t.c : "var(--t3)",
              boxShadow: form.type === t.v ? "var(--shadow)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Icon
              n={t.icon}
              size={14}
              color={form.type === t.v ? t.c : "var(--t3)"}
            />
            {t.l}
          </button>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 13,
          marginBottom: 20,
        }}
      >
        {isExp ? (
          <>
            <div style={{ gridColumn: "1/-1" }}>
              <FS
                label="Category"
                value={form.category}
                onChange={set("category")}
                options={EXP_CATS.map((c) => ({ v: c, l: c }))}
              />
            </div>
            <FI
              label="Amount (₹)"
              value={form.amount}
              onChange={set("amount")}
              type="number"
              placeholder="0"
              autoFocus
            />
            <FI
              label="Date"
              value={form.date}
              onChange={set("date")}
              type="date"
            />
            <div style={{ gridColumn: "1/-1" }}>
              <FI
                label="Note (optional)"
                value={form.note}
                onChange={set("note")}
                placeholder="e.g. Monthly rent"
              />
            </div>
          </>
        ) : (
          <>
            <div style={{ gridColumn: "1/-1" }}>
              <FI
                label="Client Name"
                value={form.client}
                onChange={set("client")}
                placeholder="e.g. Vivek Gupta"
                autoFocus
              />
            </div>
            <FI
              label="Amount (₹)"
              value={form.amount}
              onChange={set("amount")}
              type="number"
              placeholder="0"
            />
            <FI
              label="Date"
              value={form.date}
              onChange={set("date")}
              type="date"
            />
            <div style={{ gridColumn: "1/-1" }}>
              <FI
                label="Note (optional)"
                value={form.note}
                onChange={set("note")}
                placeholder="e.g. Reel editing"
              />
            </div>
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn v="ghost" sz="sm" onClick={onClose}>
          Cancel
        </Btn>
        <Btn
          v={isExp ? "r" : "g"}
          sz="sm"
          onClick={submit}
          disabled={!form.amount || !form.date || (!isExp && !form.client)}
        >
          {isExp ? "Add Expense" : "Add Income"}
        </Btn>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   EDIT FORM
══════════════════════════════════════════════ */
const EditForm = ({ tx, onSave, onClose }) => {
  const [form, setForm] = useState({
    type: tx?.type || "income",
    client: tx?.client || "",
    amount: tx?.amount || "",
    minutes: tx?.minutes || 0,
    date: tx?.date || todayISO(),
    note: tx?.note || "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <FS
          label="Type"
          value={form.type}
          onChange={set("type")}
          options={[
            { v: "income", l: "Income" },
            { v: "expense", l: "Expense" },
          ]}
        />
        <FI
          label="Client / Category"
          value={form.client}
          onChange={set("client")}
          placeholder="Client name"
        />
        <FI
          label="Amount ₹"
          value={form.amount}
          onChange={set("amount")}
          type="number"
        />
        <FI label="Date" value={form.date} onChange={set("date")} type="date" />
        <div style={{ gridColumn: "1/-1" }}>
          <FI
            label="Note"
            value={form.note}
            onChange={set("note")}
            placeholder="Optional"
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn v="ghost" onClick={onClose}>
          Cancel
        </Btn>
        <Btn
          v="primary"
          onClick={() => {
            if (!form.client || !form.amount || !form.date) return;
            onSave({
              ...tx,
              ...form,
              amount: Number(form.amount),
              minutes: Number(form.minutes),
              date: toISO(form.date),
            });
          }}
        >
          Save Changes
        </Btn>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   DELETE CONFIRM
══════════════════════════════════════════════ */
const DeleteConfirm = ({ tx, onConfirm, onClose }) => (
  <div>
    <p
      style={{
        fontSize: 13,
        color: "var(--t2)",
        marginBottom: 16,
        lineHeight: 1.6,
      }}
    >
      This action cannot be undone.
    </p>
    <div className="gc" style={{ marginBottom: 20, padding: 14 }}>
      {[
        { l: "Client", v: tx?.client },
        {
          l: "Amount",
          v: fmtINR(tx?.amount),
          c: tx?.type === "income" ? "var(--green)" : "var(--red)",
        },
        { l: "Date", v: fmtFull(tx?.date) },
      ].map((r) => (
        <div
          key={r.l}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "5px 0",
            borderBottom: "1px solid var(--divider)",
          }}
        >
          <span className="lbl">{r.l}</span>
          <span
            style={{ fontSize: 13, fontWeight: 600, color: r.c || "var(--t1)" }}
          >
            {r.v}
          </span>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <Btn v="ghost" sz="sm" onClick={onClose}>
        Cancel
      </Btn>
      <Btn v="r" sz="sm" onClick={onConfirm}>
        Delete
      </Btn>
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   TRANSACTION ROW
══════════════════════════════════════════════ */
const TxRow = ({ tx, onEdit, onDelete, onTogglePaid }) => {
  const inc = tx.type === "income";
  const [hov, setHov] = useState(false);
  return (
    <div
      className="tx-row"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 10px",
        borderBottom: "1px solid var(--divider)",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          flexShrink: 0,
          background: inc ? "var(--greenbg)" : "var(--redbg)",
          border: `1px solid ${inc ? "rgba(34,197,94,.15)" : "rgba(239,68,68,.15)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon
          n={inc ? "arrowUp" : "arrowDown"}
          size={14}
          color={inc ? "var(--green)" : "var(--red)"}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--t1)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {tx.client}
        </p>
        {tx.note && (
          <p
            style={{
              fontSize: 11,
              color: "var(--t3)",
              marginTop: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {tx.note}
          </p>
        )}
      </div>
      <div
        className="num"
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: inc ? "var(--green)" : "var(--red)",
          flexShrink: 0,
        }}
      >
        {inc ? "+" : "-"}
        {fmtINR(tx.amount)}
      </div>
      <div
        style={{
          display: "flex",
          gap: 5,
          flexShrink: 0,
          opacity: hov ? 1 : 0,
          transition: "opacity .14s",
          pointerEvents: hov ? "auto" : "none",
        }}
      >
        {inc && (
          <button
            onClick={() => onTogglePaid && onTogglePaid(tx.id)}
            style={{
              background: tx.paid ? "var(--greenbg)" : "var(--amberbg)",
              border: `1px solid ${tx.paid ? "rgba(34,197,94,.2)" : "rgba(245,158,11,.2)"}`,
              color: tx.paid ? "var(--green)" : "var(--amber)",
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 10,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Icon n={tx.paid ? "check" : "clock"} size={10} />
            {tx.paid ? "Received" : "Pending"}
          </button>
        )}
        <button
          onClick={() => onEdit(tx)}
          style={{
            background: "var(--indigobg)",
            border: "1px solid rgba(99,102,241,.2)",
            color: "var(--indigo)",
            borderRadius: 8,
            padding: "4px 8px",
            fontSize: 10,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Icon n="edit" size={10} />
          Edit
        </button>
        <button
          onClick={() => onDelete(tx)}
          style={{
            background: "var(--redbg)",
            border: "1px solid rgba(239,68,68,.18)",
            color: "var(--red)",
            borderRadius: 8,
            padding: "4px 8px",
            fontSize: 10,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Icon n="trash" size={10} />
          Del
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   GROUPED LIST
══════════════════════════════════════════════ */
const GroupedList = ({ transactions, onEdit, onDelete, onTogglePaid }) => {
  const groups = useMemo(() => {
    const m = {};
    transactions.forEach((t) => {
      if (!m[t.date]) m[t.date] = [];
      m[t.date].push(t);
    });
    return Object.entries(m).sort((a, b) => b[0].localeCompare(a[0]));
  }, [transactions]);
  if (!transactions.length)
    return (
      <div className="empty">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "var(--surface2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
          }}
        >
          <Icon n="list" size={20} color="var(--t3)" />
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--t2)" }}>
          Koi transaction nahi
        </p>
        <p style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.7 }}>
          Income ya expense add karo upar se
        </p>
      </div>
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {groups.map(([date, txs]) => {
        const dayInc = txs
          .filter((t) => t.type === "income" && t.paid)
          .reduce((s, t) => s + t.amount, 0);
        const dayPend = txs
          .filter((t) => t.type === "income" && !t.paid)
          .reduce((s, t) => s + t.amount, 0);
        const isToday = date === todayISO();
        return (
          <div key={date}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
                padding: "0 2px",
              }}
            >
              {isToday && (
                <div
                  className="blink"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--green)",
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                className="lbl"
                style={{
                  color: isToday ? "var(--green)" : "var(--t3)",
                  flexShrink: 0,
                }}
              >
                {fmtFull(date)}
              </span>
              <div
                style={{ flex: 1, height: 1, background: "var(--divider)" }}
              />
              {dayInc > 0 && (
                <span
                  className="num"
                  style={{ fontSize: 10, color: "var(--green)", flexShrink: 0 }}
                >
                  {fmtINR(dayInc)}
                </span>
              )}
              {dayPend > 0 && (
                <span
                  className="num"
                  style={{ fontSize: 10, color: "var(--amber)", flexShrink: 0 }}
                >
                  {fmtINR(dayPend)}
                </span>
              )}
            </div>
            <div className="gc" style={{ overflow: "hidden", padding: 0 }}>
              {txs.map((tx, i) => (
                <div
                  key={tx.id}
                  style={{
                    borderBottom:
                      i < txs.length - 1 ? "1px solid var(--divider)" : "none",
                  }}
                >
                  <TxRow
                    tx={tx}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onTogglePaid={onTogglePaid}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════════
   TODAY OVERVIEW
══════════════════════════════════════════════ */
const TodayOverview = ({ transactions }) => {
  const td = transactions.filter((t) => t.date === todayISO());
  const yd = transactions.filter((t) => t.date === yesterdayISO());
  const sum = (a, tp) =>
    a.filter((t) => t.type === tp).reduce((s, t) => s + t.amount, 0);
  const tI = sum(td, "income"),
    tE = sum(td, "expense"),
    tN = tI - tE;
  const yI = sum(yd, "income"),
    yE = sum(yd, "expense");
  return (
    <div className="fu" style={{ marginBottom: 14 }}>
      <div className="gc g" style={{ padding: "20px 22px", marginBottom: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: td.length ? 18 : 12,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 5,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 7,
                  height: 7,
                  flexShrink: 0,
                }}
              >
                <div
                  className="blink"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--green)",
                    position: "absolute",
                  }}
                />
              </div>
              <span className="lbl" style={{ color: "var(--green)" }}>
                Live · {fmtFull(todayISO())}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--t2)" }}>
              {td.length === 0
                ? "No entries yet today"
                : `${td.length} transaction${td.length !== 1 ? "s" : ""} today`}
            </p>
          </div>
          {td.length > 0 && (
            <div style={{ textAlign: "right" }}>
              <div className="lbl" style={{ marginBottom: 4 }}>
                Net Today
              </div>
              <div
                className="num"
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: tN >= 0 ? "var(--green)" : "var(--red)",
                }}
              >
                {tN >= 0 ? "+" : ""}
                {fmtINR(tN)}
              </div>
            </div>
          )}
        </div>
        {td.length === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 0 4px",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(34,197,94,.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon n="wallet" size={18} color="var(--green)" />
            </div>
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--t2)",
                  marginBottom: 2,
                }}
              >
                Koi entry nahi abhi
              </p>
              <p style={{ fontSize: 12, color: "var(--t3)" }}>
                Income ya expense add karo upar se
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 16,
            }}
          >
            {[
              { l: "Income", v: fmtINR(tI), c: "var(--green)" },
              { l: "Expenses", v: fmtINR(tE), c: "var(--red)" },
              { l: "Entries", v: td.length, c: "var(--t1)" },
            ].map((s) => (
              <div key={s.l}>
                <div className="lbl" style={{ marginBottom: 5 }}>
                  {s.l}
                </div>
                <div
                  className="num"
                  style={{ fontSize: 20, fontWeight: 700, color: s.c }}
                >
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        className="gc"
        style={{
          padding: "9px 18px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <span className="lbl" style={{ flexShrink: 0 }}>
          Yesterday
        </span>
        <span style={{ fontSize: 12, color: "var(--t2)" }}>
          Income{" "}
          <b className="num" style={{ color: "var(--green)", fontWeight: 700 }}>
            {fmtINR(yI)}
          </b>
        </span>
        <span style={{ fontSize: 12, color: "var(--t2)" }}>
          Expense{" "}
          <b className="num" style={{ color: "var(--red)", fontWeight: 700 }}>
            {fmtINR(yE)}
          </b>
        </span>
        <span style={{ fontSize: 12, color: "var(--t2)" }}>
          Entries{" "}
          <b style={{ color: "var(--t1)", fontWeight: 700 }}>{yd.length}</b>
        </span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   STATS ROW
══════════════════════════════════════════════ */
const StatsRow = ({ transactions }) => {
  const now = new Date(),
    mk = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const mtx = transactions.filter((t) => t.date.startsWith(mk));
  const inc = mtx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const exp = mtx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const recd = mtx
    .filter((t) => t.type === "income" && t.paid)
    .reduce((s, t) => s + t.amount, 0);
  const pend = mtx
    .filter((t) => t.type === "income" && !t.paid)
    .reduce((s, t) => s + t.amount, 0);
  const pct = inc > 0 ? Math.round((recd / inc) * 100) : 0;
  const cards = [
    {
      lbl: "Month Revenue",
      val: fmtINR(inc),
      sub: `${mtx.filter((t) => t.type === "income").length} entries`,
      color: "var(--green)",
      icon: "trending",
      bar: null,
    },
    {
      lbl: "Received",
      val: fmtINR(recd),
      sub: `${pct}% of revenue`,
      color: "var(--green)",
      icon: "check",
      bar: { pct, color: "var(--green)" },
    },
    {
      lbl: "Pending",
      val: fmtINR(pend),
      sub: pend > 0 ? "Collect karo" : "All clear",
      color: pend > 0 ? "var(--amber)" : "var(--green)",
      icon: "clock",
      bar: null,
    },
    {
      lbl: "Net Profit",
      val: fmtINR(inc - exp),
      sub: `Expense: ${fmtINR(exp)}`,
      color: inc - exp >= 0 ? "var(--green)" : "var(--red)",
      icon: "wallet",
      bar: null,
    },
  ];
  return (
    <div className="stats-grid">
      {cards.map((c, i) => (
        <div
          key={c.lbl}
          className={`gc lift fu${i}`}
          style={{
            padding: "16px 18px",
            borderLeft: `2px solid ${c.color}40`,
            cursor: "default",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 10,
            }}
          >
            <span className="lbl">{c.lbl}</span>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: `${c.color}14`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon n={c.icon} size={14} color={c.color} />
            </div>
          </div>
          <div
            className="num"
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: c.color,
              marginBottom: 3,
            }}
          >
            {c.val}
          </div>
          <p style={{ fontSize: 11, color: "var(--t3)", fontWeight: 400 }}>
            {c.sub}
          </p>
          {c.bar && (
            <div style={{ marginTop: 10 }}>
              <ProgressBar pct={c.bar.pct} color={c.bar.color} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════
   PENDING SUMMARY
══════════════════════════════════════════════ */
const PendingSummary = ({ transactions }) => {
  const incTx = transactions.filter((t) => t.type === "income");
  const pendTx = incTx.filter((t) => !t.paid);
  const recdTx = incTx.filter((t) => t.paid);
  const tP = pendTx.reduce((s, t) => s + t.amount, 0);
  const tR = recdTx.reduce((s, t) => s + t.amount, 0);
  if (!tP) return null;
  const by = {};
  pendTx.forEach((t) => {
    if (!by[t.client]) by[t.client] = 0;
    by[t.client] += t.amount;
  });
  const list = Object.entries(by)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const pct = tP + tR > 0 ? Math.round((tR / (tP + tR)) * 100) : 0;
  return (
    <div
      className="gc a fu1"
      style={{ padding: "18px 20px", marginBottom: 14 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--amber)",
              flexShrink: 0,
              animation: "blink 2.5s ease infinite",
            }}
          />
          <span className="lbl" style={{ color: "var(--amber)" }}>
            Pending Payment
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            className="num"
            style={{ fontSize: 20, fontWeight: 700, color: "var(--amber2)" }}
          >
            {fmtINR(tP)}
          </div>
          <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
            {pendTx.length} pending
          </p>
        </div>
      </div>
      <div style={{ marginBottom: list.length ? 14 : 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 11, color: "var(--t3)" }}>
            Received {fmtINR(tR)}
          </span>
          <span
            style={{ fontSize: 11, fontWeight: 600, color: "var(--amber)" }}
          >
            {pct}%
          </span>
        </div>
        <ProgressBar pct={pct} color="var(--amber)" />
      </div>
      {list.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 4,
          }}
        >
          {list.map(([name, amt]) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar name={name} size={24} color="var(--amber)" />
                <span
                  style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}
                >
                  {name}
                </span>
              </div>
              <span
                className="num"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--amber2)",
                }}
              >
                {fmtINR(amt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════
   REMINDER BANNER + NOTIFICATION
══════════════════════════════════════════════ */
const useWindowWidth = () => {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
};

const useReminder = (transactions) => {
  const [showBanner, setShowBanner] = useState(false);
  useEffect(() => {
    const today = todayISO();
    const hasToday = transactions.some((t) => t.date === today);
    setShowBanner(!hasToday);
    const lastNotif = localStorage.getItem("flt_last_notif");
    if (lastNotif === today) return;
    const send = () => {
      if (Notification.permission === "granted" && !hasToday) {
        new Notification("💰 Trackli", {
          body: "Aaj ka hisaab kiya? Income log karo!",
        });
        localStorage.setItem("flt_last_notif", today);
      }
    };
    if (Notification.permission === "default")
      Notification.requestPermission().then((p) => {
        if (p === "granted") send();
      });
    else send();
  }, [transactions]);
  return { showBanner, setShowBanner };
};

const ReminderBanner = ({ onAdd, onDismiss }) => (
  <div
    className="gc a fu"
    style={{
      padding: "14px 18px",
      marginBottom: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "var(--amberbg)",
          border: "1px solid rgba(245,158,11,.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon n="alert" size={16} color="var(--amber)" />
      </div>
      <div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--amber2)",
            marginBottom: 2,
          }}
        >
          Aaj ka hisaab log karo!
        </p>
        <p style={{ fontSize: 11, color: "var(--t3)" }}>
          Koi entry nahi abhi — kuch kaam kiya?
        </p>
      </div>
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <Btn v="ghost" sz="sm" onClick={onDismiss}>
        Baad mein
      </Btn>
      <button
        onClick={onAdd}
        style={{
          background: "var(--amber)",
          color: "#fff",
          border: "none",
          borderRadius: 9,
          padding: "7px 16px",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Icon n="plus" size={12} color="#fff" /> Add Karo
      </button>
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   ADD CLIENT MODAL
══════════════════════════════════════════════ */
const AddClientModal = ({ onAdd, onClose, existingClients }) => {
  const [name, setName] = useState("");
  const exists = existingClients
    .map((c) => c.toLowerCase())
    .includes(name.trim().toLowerCase());
  const submit = () => {
    if (!name.trim() || exists) return;
    onAdd(name.trim());
    onClose();
  };
  return (
    <>
      <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 16 }}>
        Client ka naam daalo — baad mein income add kar sakte ho.
      </p>
      <FI
        label="Client Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Vivek Gupta"
      />
      {exists && (
        <p
          style={{
            fontSize: 12,
            color: "var(--amber)",
            marginTop: 8,
            fontWeight: 600,
          }}
        >
          ⚠️ Yeh client pehle se exist karta hai
        </p>
      )}
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          marginTop: 20,
        }}
      >
        <Btn v="ghost" onClick={onClose}>
          Cancel
        </Btn>
        <Btn onClick={submit} disabled={!name.trim() || exists}>
          + Client Add Karo
        </Btn>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════
   CLIENT PANEL
══════════════════════════════════════════════ */
const ClientPanel = (props) => {
  const {
    transactions,
    rangeFiltered,
    onAddForClient,
    extraClients,
    onDeleteClient,
    onMarkAllPaid,
  } = props;
  const today = todayISO();
  const [confirmClient, setConfirmClient] = useState(null);
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selMonth, setSelMonth] = useState(currentMonthKey);
  const archive = useMemo(() => loadArchive(), []);
  const archiveMonths = useMemo(
    () => Object.keys(archive).sort().reverse(),
    [archive],
  );
  const allMonths = useMemo(
    () => [currentMonthKey, ...archiveMonths],
    [archiveMonths],
  );

  const monthTx = useMemo(() => {
    if (selMonth === currentMonthKey) return rangeFiltered;
    return archive[selMonth] || [];
  }, [selMonth, rangeFiltered, archive, currentMonthKey]);

  const clients = useMemo(() => {
    const m = {};
    monthTx
      .filter((t) => t.type === "income")
      .forEach((t) => {
        if (!m[t.client])
          m[t.client] = { revenue: 0, minutes: 0, videos: 0, dates: [] };
        m[t.client].revenue += t.amount;
        m[t.client].minutes += t.minutes || 0;
        m[t.client].videos += 1;
        m[t.client].dates.push(t.date);
      });
    const maxRev = Math.max(...Object.values(m).map((x) => x.revenue), 0);
    const result = Object.entries(m)
      .map(([name, d]) => {
        const last = d.dates.sort().at(-1);
        const days = Math.floor((new Date(today) - new Date(last)) / 86400000);
        const pending = transactions
          .filter((t) => t.client === name && t.type === "income" && !t.paid)
          .reduce((s, t) => s + t.amount, 0);
        return {
          name,
          revenue: d.revenue,
          minutes: d.minutes,
          videos: d.videos,
          last,
          days,
          isTop: d.revenue === maxRev && d.revenue > 0,
          isEmpty: false,
          pending,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
    if (selMonth === currentMonthKey) {
      const existing = new Set(result.map((c) => c.name.toLowerCase()));
      extraClients.forEach((name) => {
        if (!existing.has(name.toLowerCase()))
          result.push({
            name,
            revenue: 0,
            minutes: 0,
            videos: 0,
            last: null,
            days: 999,
            isTop: false,
            isEmpty: true,
            pending: 0,
          });
      });
    }
    return result;
  }, [monthTx, extraClients, selMonth, transactions, today]);

  const monthLabel = (key) => {
    const p = key.split("-").map(Number);
    return `${MONTHS[p[1] - 1]} ${p[0]}`;
  };

  return (
    <div>
      {/* Month selector */}
      {allMonths.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 5,
            marginBottom: 12,
            overflowX: "auto",
            paddingBottom: 2,
            scrollbarWidth: "none",
          }}
        >
          {allMonths.map((m) => (
            <button
              key={m}
              onClick={() => setSelMonth(m)}
              style={{
                background:
                  selMonth === m ? "var(--indigo)" : "var(--surface2)",
                color: selMonth === m ? "#fff" : "var(--t3)",
                border: `1px solid ${selMonth === m ? "var(--indigo)" : "var(--cb)"}`,
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                fontFamily: "inherit",
                transition: "all .15s",
              }}
            >
              {m === currentMonthKey ? "This Month" : monthLabel(m)}
            </button>
          ))}
        </div>
      )}

      {/* Client list */}
      {clients.length === 0 ? (
        <p
          style={{
            color: "var(--t3)",
            fontSize: 13,
            padding: "20px 0",
            textAlign: "center",
          }}
        >
          Koi client nahi — + Client se add karo!
        </p>
      ) : (
        clients.map((c) => {
          const accentColor = c.isTop
            ? "var(--amber)"
            : c.isEmpty
              ? "var(--cb)"
              : c.days > 7
                ? "var(--t3)"
                : "var(--green)";
          return (
            <div
              key={c.name}
              style={{
                background: "var(--surface2)",
                border: "1px solid var(--cb)",
                borderLeft: `3px solid ${accentColor}`,
                borderRadius: 10,
                padding: "11px 13px",
                marginBottom: 8,
                transition: "border-color .15s",
              }}
            >
              {/* Client name + actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Avatar
                    name={c.name}
                    size={24}
                    color={
                      c.isTop
                        ? "var(--amber)"
                        : c.days > 7
                          ? "var(--t3)"
                          : "var(--green)"
                    }
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--t1)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.name}
                  </span>
                  {c.isTop && <Tag color="var(--amber)">Top</Tag>}
                  {c.days > 7 && !c.isEmpty && !c.isTop && (
                    <Tag color="var(--t3)">Inactive</Tag>
                  )}
                  {c.isEmpty && <Tag color="var(--t3)">New</Tag>}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    flexShrink: 0,
                  }}
                >
                  <button
                    onClick={() => onAddForClient(c.name)}
                    style={{
                      background: "var(--greenbg)",
                      border: "1px solid rgba(34,197,94,.2)",
                      color: "var(--green)",
                      borderRadius: 7,
                      padding: "3px 9px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    + Add
                  </button>
                  <button
                    onClick={() =>
                      setConfirmClient(
                        confirmClient === `del_${c.name}`
                          ? null
                          : `del_${c.name}`,
                      )
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--t3)",
                      cursor: "pointer",
                      fontSize: 16,
                      padding: "0 2px",
                      lineHeight: 1,
                    }}
                  >
                    ···
                  </button>
                </div>
              </div>

              {/* Delete confirm */}
              {confirmClient === `del_${c.name}` && (
                <div
                  style={{
                    background: "var(--redbg)",
                    border: "1px solid rgba(239,68,68,.2)",
                    borderRadius: 8,
                    padding: "8px 11px",
                    marginBottom: 7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--red)",
                      fontWeight: 500,
                    }}
                  >
                    "{c.name}" delete karo?
                  </span>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button
                      onClick={() => {
                        onDeleteClient(c.name);
                        setConfirmClient(null);
                      }}
                      style={{
                        background: "var(--red)",
                        border: "none",
                        color: "#fff",
                        borderRadius: 6,
                        padding: "3px 9px",
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Haan
                    </button>
                    <button
                      onClick={() => setConfirmClient(null)}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--cb)",
                        color: "var(--t2)",
                        borderRadius: 6,
                        padding: "3px 9px",
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Nahi
                    </button>
                  </div>
                </div>
              )}

              {/* Revenue + pending */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 6,
                }}
              >
                <div>
                  <span
                    className="num"
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: c.isEmpty ? "var(--t3)" : "var(--green)",
                    }}
                  >
                    {c.isEmpty ? "No entries yet" : fmtINR(c.revenue)}
                  </span>
                  {!c.isEmpty && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--t3)",
                        marginLeft: 7,
                      }}
                    >
                      {c.videos} videos ·{" "}
                      {c.days === 0
                        ? "today"
                        : c.days === 1
                          ? "yesterday"
                          : `${c.days}d ago`}
                    </span>
                  )}
                </div>
                {c.pending > 0 &&
                  (confirmClient === c.name ? (
                    <div
                      style={{
                        display: "flex",
                        gap: 5,
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: 10, color: "var(--t3)" }}>
                        Mila?
                      </span>
                      <button
                        onClick={() => {
                          onMarkAllPaid(c.name);
                          setConfirmClient(null);
                        }}
                        style={{
                          background: "var(--green)",
                          border: "none",
                          color: "#fff",
                          borderRadius: 6,
                          padding: "3px 9px",
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        Haan
                      </button>
                      <button
                        onClick={() => setConfirmClient(null)}
                        style={{
                          background: "var(--surface)",
                          border: "1px solid var(--cb)",
                          color: "var(--t2)",
                          borderRadius: 6,
                          padding: "3px 9px",
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        Nahi
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmClient(c.name)}
                      style={{
                        background: "var(--amberbg)",
                        border: "1px solid rgba(245,158,11,.25)",
                        color: "var(--amber)",
                        borderRadius: 7,
                        padding: "3px 9px",
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        fontFamily: "inherit",
                      }}
                    >
                      Mila? {fmtINR(c.pending)}
                    </button>
                  ))}
              </div>

              {/* Spark bar */}
              <SparkBar
                value={c.revenue}
                max={Math.max(...clients.map((x) => x.revenue), 1)}
                color={c.isTop ? "var(--amber)" : "var(--green)"}
              />
            </div>
          );
        })
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════
   MONTHLY GOAL TRACKER
══════════════════════════════════════════════ */
const MonthlyGoal = ({ transactions, goal, setGoal }) => {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(goal.monthly || "");
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const earned = transactions
    .filter((t) => t.type === "income" && t.date.startsWith(thisMonth))
    .reduce((s, t) => s + t.amount, 0);
  const target = goal.monthly || 0;
  const pct = target > 0 ? Math.min((earned / target) * 100, 100) : 0;
  const remaining = Math.max(target - earned, 0);
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const daysLeft = daysInMonth - now.getDate();
  const dailyNeeded = daysLeft > 0 ? Math.ceil(remaining / daysLeft) : 0;
  const barColor =
    pct >= 100 ? "var(--green)" : pct >= 60 ? "var(--amber)" : "var(--red)";
  const save = () => {
    if (Number(input) > 0) {
      setGoal({ monthly: Number(input) });
    }
    setEditing(false);
  };

  if (!target && !editing)
    return (
      <div
        onClick={() => setEditing(true)}
        className="gc"
        style={{
          padding: "16px 20px",
          marginBottom: 16,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 14,
          border: "1px dashed var(--cb)",
          transition: "border-color .2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "var(--green)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--cb)")}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: "var(--greenbg)",
            border: "1px solid rgba(34,197,94,.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon n="target" size={18} color="var(--green)" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>
            Set Monthly Goal
          </p>
          <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
            Is mahine kitna kamana hai?
          </p>
        </div>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "var(--surface2)",
            border: "1px solid var(--cb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--t3)",
            fontSize: 16,
          }}
        >
          +
        </div>
      </div>
    );

  if (editing)
    return (
      <div
        className="gc"
        style={{
          padding: "16px 18px",
          marginBottom: 16,
          border: "1px solid rgba(99,102,241,.3)",
        }}
      >
        <p className="lbl" style={{ marginBottom: 10 }}>
          Set Monthly Goal
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--t3)",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              ₹
            </span>
            <input
              autoFocus
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder="e.g. 15000"
              className="inp"
              style={{ paddingLeft: 28, fontWeight: 700, fontSize: 15 }}
            />
          </div>
          <Btn onClick={save} disabled={!input || Number(input) <= 0}>
            Save
          </Btn>
          {target > 0 && (
            <Btn v="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Btn>
          )}
        </div>
      </div>
    );

  return (
    <div className="gc" style={{ padding: "18px 20px", marginBottom: 16 }}>
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "var(--indigobg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon n="target" size={16} color="var(--indigo)" />
          </div>
          <div>
            <p className="lbl">{MONTHS[now.getMonth()]} Goal</p>
            <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 1 }}>
              {Math.round(pct)}% complete
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="num"
            style={{ fontSize: 20, fontWeight: 700, color: barColor }}
          >
            {fmtINR(earned)}
          </span>
          <span style={{ color: "var(--t3)", fontSize: 12 }}>
            / {fmtINR(target)}
          </span>
          <button
            onClick={() => {
              setInput(target);
              setEditing(true);
            }}
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--cb)",
              color: "var(--t2)",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 9px",
              borderRadius: 7,
              fontFamily: "inherit",
            }}
          >
            Edit
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          background: "var(--divider)",
          borderRadius: 99,
          height: 7,
          marginBottom: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: barColor,
            borderRadius: 99,
            transition: "width .8s cubic-bezier(.16,1,.3,1)",
          }}
        />
      </div>

      {/* Stats row */}
      {pct >= 100 ? (
        <div
          style={{
            background: "var(--greenbg)",
            border: "1px solid rgba(34,197,94,.2)",
            borderRadius: 10,
            padding: "10px 14px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>
            Goal complete! Ekdum zakkas!
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 8,
          }}
        >
          {[
            { lbl: "Daily Needed", val: fmtINR(dailyNeeded), c: barColor },
            { lbl: "Remaining", val: fmtINR(remaining), c: "var(--amber)" },
            { lbl: "Days Left", val: daysLeft, c: "var(--t1)" },
          ].map((s) => (
            <div
              key={s.lbl}
              style={{
                background: "var(--surface2)",
                border: "1px solid var(--cb)",
                borderRadius: 9,
                padding: "8px 10px",
                textAlign: "center",
              }}
            >
              <p className="lbl" style={{ marginBottom: 4 }}>
                {s.lbl}
              </p>
              <p
                className="num"
                style={{ fontSize: 14, fontWeight: 700, color: s.c }}
              >
                {s.val}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════
   PAYWALL / SUBSCRIPTION
══════════════════════════════════════════════ */
const Paywall = ({ daysLeft, onUnlock }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const trialOver = daysLeft === 0;

  const tryUnlock = () => {
    const trimmed = code.trim().toUpperCase();
    if (UNLOCK_CODES.includes(trimmed)) {
      const sub = loadSub();
      sub.unlocked = true;
      sub.unlockedAt = new Date().toISOString();
      saveSub(sub);
      setSuccess(true);
      setTimeout(() => onUnlock(), 1500);
    } else {
      setError(
        "❌ Code galat hai! Payment ke baad WhatsApp pe code bheja jaayega.",
      );
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.92)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "var(--surface2)",
          border: "1px solid rgba(34,197,94,.2)",
          borderRadius: 20,
          padding: "36px 28px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
        }}
      >
        {success ? (
          <>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <p
              style={{ fontSize: 20, fontWeight: 800, color: "var(--green2)" }}
            >
              Unlock ho gaya!
            </p>
            <p style={{ fontSize: 13, color: "var(--t3)", marginTop: 8 }}>
              Welcome to Trackli Pro! 🚀
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {trialOver ? "🔒" : "⏳"}
            </div>

            {trialOver ? (
              <>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "var(--t1)",
                    marginBottom: 8,
                  }}
                >
                  Free Trial Khatam!
                </p>
                <p
                  style={{ fontSize: 13, color: "var(--t3)", marginBottom: 20 }}
                >
                  Tumhara 30 din ka free trial complete ho gaya.
                  <br />
                  App use karte rehne ke liye subscribe karo! 🙏
                </p>
              </>
            ) : (
              <>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "var(--t1)",
                    marginBottom: 8,
                  }}
                >
                  Sirf {daysLeft} din baaki!
                </p>
                <p
                  style={{ fontSize: 13, color: "var(--t3)", marginBottom: 20 }}
                >
                  Free trial mein {daysLeft} din baaki hain.
                  <br />
                  Abhi subscribe karo aur uninterrupted use karo!
                </p>
              </>
            )}

            {/* Plan card */}
            <div
              style={{
                background:
                  "linear-gradient(135deg,var(--surface),var(--surface2))",
                border: `1px solid ${"var(--green)"}40`,
                borderRadius: 14,
                padding: "18px 20px",
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--t3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 6,
                }}
              >
                Trackli Pro
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "center",
                  gap: 4,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 900,
                    color: "var(--green2)",
                  }}
                >
                  ₹60
                </span>
                <span style={{ fontSize: 14, color: "var(--t3)" }}>/month</span>
              </div>
              <p style={{ fontSize: 11, color: "var(--t3)" }}>
                Income tracker • Clients • Invoice • Goal
              </p>
            </div>

            {/* Pay button */}
            <a
              href="https://razorpay.me/@yourlink"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                background:
                  "linear-gradient(135deg,var(--green),var(--green2))",
                color: "#fff",
                borderRadius: 12,
                padding: "13px 0",
                fontSize: 14,
                fontWeight: 800,
                marginBottom: 16,
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              💳 Abhi Pay Karo — ₹60/month
            </a>

            <p style={{ fontSize: 11, color: "var(--t3)", marginBottom: 12 }}>
              Payment ke baad WhatsApp pe unlock code milega 👇
            </p>

            {/* Unlock code input */}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
                placeholder="Unlock code daalo..."
                style={{
                  flex: 1,
                  background: "var(--surface2)",
                  border: `1px solid ${error ? "var(--red)" : "var(--cb)"}`,
                  borderRadius: 9,
                  padding: "10px 14px",
                  color: "var(--t1)",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                onClick={tryUnlock}
                style={{
                  background: "var(--green)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 9,
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Unlock
              </button>
            </div>
            {error && (
              <p
                style={{
                  fontSize: 11,
                  color: "var(--red2)",
                  marginTop: 8,
                  textAlign: "left",
                }}
              >
                {error}
              </p>
            )}

            {trialOver && (
              <p style={{ fontSize: 10, color: "var(--t3)", marginTop: 16 }}>
                Support: wa.me/91XXXXXXXXXX
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   NEW MONTH CELEBRATION
══════════════════════════════════════════════ */
const NewMonthCelebration = ({ stats, monthName, onClose }) => {
  const [confetti, setConfetti] = useState([]);
  useEffect(() => {
    const items = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      color: ["#16a34a", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899", "#a855f7"][
        Math.floor(Math.random() * 6)
      ],
      size: Math.random() * 8 + 4,
      dur: Math.random() * 2 + 2,
    }));
    setConfetti(items);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {/* Confetti */}
      {confetti.map((c) => (
        <div
          key={c.id}
          style={{
            position: "fixed",
            left: `${c.x}%`,
            top: "-10px",
            width: c.size,
            height: c.size,
            background: c.color,
            borderRadius: c.id % 2 === 0 ? "50%" : "2px",
            animation: `fall ${c.dur}s ${c.delay}s ease-in infinite`,
            pointerEvents: "none",
          }}
        />
      ))}
      <style>{`@keyframes fall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(105vh) rotate(720deg);opacity:0}}`}</style>
      {/* Card */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid rgba(34,197,94,.25)",
          borderRadius: 20,
          padding: "36px 32px",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
        <p
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "var(--green2)",
            marginBottom: 6,
          }}
        >
          {monthName} Complete!
        </p>
        <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 24 }}>
          Bhai kya mahina tha — dekho kya kiya tumne!
        </p>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "#00e67615",
              borderRadius: 12,
              padding: "14px 12px",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--t3)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 6,
              }}
            >
              💰 Total Kamaya
            </p>
            <p
              style={{ fontSize: 22, fontWeight: 800, color: "var(--green2)" }}
            >
              {fmtINR(stats.income)}
            </p>
          </div>
          <div
            style={{
              background: "var(--surface2)",
              borderRadius: 12,
              padding: "14px 12px",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--t3)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 6,
              }}
            >
              ✓ Received
            </p>
            <p
              style={{ fontSize: 22, fontWeight: 800, color: "var(--green2)" }}
            >
              {fmtINR(stats.received)}
            </p>
          </div>
          <div
            style={{
              background: "var(--surface2)",
              borderRadius: 12,
              padding: "14px 12px",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--t3)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 6,
              }}
            >
              🎬 Videos
            </p>
            <p style={{ fontSize: 22, fontWeight: 800, color: "var(--t1)" }}>
              {stats.videos}
            </p>
          </div>
          <div
            style={{
              background: "var(--surface2)",
              borderRadius: 12,
              padding: "14px 12px",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--t3)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 6,
              }}
            >
              👥 Clients
            </p>
            <p style={{ fontSize: 22, fontWeight: 800, color: "var(--t1)" }}>
              {stats.clients}
            </p>
          </div>
        </div>

        {stats.topClient && (
          <div
            style={{
              background: "var(--amberbg)",
              border: `1px solid ${"var(--amber)"}30`,
              borderRadius: 10,
              padding: "10px 16px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>🏆</span>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 11, color: "var(--t3)", fontWeight: 700 }}>
                TOP CLIENT
              </p>
              <p
                style={{ fontSize: 14, fontWeight: 800, color: "var(--amber)" }}
              >
                {stats.topClient} — {fmtINR(stats.topAmount)}
              </p>
            </div>
          </div>
        )}

        <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 20 }}>
          Purana data archive mein safe hai 📁
          <br />
          Naya mahina, naya shuruaat! 🚀
        </p>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            background: `linear-gradient(135deg,${"var(--green)"},#15803d)`,
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "14px 0",
            fontSize: 15,
            fontWeight: 800,
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          ✨ Naya Mahina Shuru Karo!
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   CALENDAR VIEW
══════════════════════════════════════════════ */
const CalendarView = ({ transactions, onEdit, onDelete }) => {
  const now = new Date();
  const [vy, setVy] = useState(now.getFullYear());
  const [vm, setVm] = useState(now.getMonth());
  const [sel, setSel] = useState(null);
  const today = todayISO();
  const firstDay = new Date(vy, vm, 1).getDay();
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const isoFor = (d) =>
    `${vy}-${String(vm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  // Merge current + archived transactions
  const allTransactions = useMemo(() => {
    const archive = loadArchive();
    const monthKey = `${vy}-${String(vm + 1).padStart(2, "0")}`;
    const archived = archive[monthKey] || [];
    return [...transactions, ...archived];
  }, [transactions, vy, vm]);

  const dayMap = useMemo(() => {
    const m = {};
    allTransactions.forEach((t) => {
      const [y, mo] = t.date.split("-").map(Number);
      if (y === vy && mo - 1 === vm) {
        if (!m[t.date]) m[t.date] = { inc: 0, exp: 0, txs: [] };
        if (t.type === "income") m[t.date].inc += t.amount;
        else m[t.date].exp += t.amount;
        m[t.date].txs.push(t);
      }
    });
    return m;
  }, [allTransactions, vy, vm]);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const prevM = () => {
    if (vm === 0) {
      setVy((y) => y - 1);
      setVm(11);
    } else setVm((m) => m - 1);
  };
  const nextM = () => {
    if (vm === 11) {
      setVy((y) => y + 1);
      setVm(0);
    } else setVm((m) => m + 1);
  };
  const selTxs = sel ? dayMap[sel]?.txs || [] : [];
  return (
    <div className="fu">
      <Card style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <button
            onClick={prevM}
            style={{
              background: "var(--surface2)",
              border: `1px solid ${"var(--cb)"}`,
              color: "var(--t1)",
              borderRadius: 7,
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ←
          </button>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>
            {MONTHS[vm]} {vy}
          </h3>
          <button
            onClick={nextM}
            style={{
              background: "var(--surface2)",
              border: `1px solid ${"var(--cb)"}`,
              color: "var(--t1)",
              borderRadius: 7,
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            →
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 3,
            marginBottom: 4,
          }}
        >
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "var(--t3)",
                padding: "4px 0",
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 3,
          }}
        >
          {cells.map((day, idx) => {
            if (!day) return <div key={`e${idx}`} />;
            const iso = isoFor(day);
            const data = dayMap[iso];
            const isTd = iso === today;
            const isSel = iso === sel;
            return (
              <div
                key={day}
                onClick={() => setSel(isSel ? null : iso)}
                className="cal-cell"
                style={{
                  background: isSel
                    ? "#00e67615"
                    : isTd
                      ? "#0a1f12"
                      : "var(--surface2)",
                  border: `1px solid ${isSel ? "var(--green)" : isTd ? "var(--green)" + "40" : "var(--cb)"}`,
                  borderRadius: 6,
                  padding: "5px 4px",
                  cursor: "pointer",
                  minHeight: 52,
                  transition: "all .12s",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: isTd ? 800 : 500,
                    color: isTd ? "var(--green2)" : "var(--t1)",
                    textAlign: "right",
                    marginBottom: 2,
                  }}
                >
                  {day}
                </div>
                {data && (
                  <div>
                    {data.inc > 0 && (
                      <div
                        style={{
                          fontSize: 8,
                          color: "var(--green2)",
                          fontWeight: 700,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        +{fmtINR(data.inc)}
                      </div>
                    )}
                    {data.exp > 0 && (
                      <div
                        style={{
                          fontSize: 8,
                          color: "var(--red2)",
                          fontWeight: 700,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        -{fmtINR(data.exp)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
      {sel && (
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <h4
              style={{ fontSize: 14, fontWeight: 700, color: "var(--green2)" }}
            >
              {fmtFull(sel)}
            </h4>
            <button
              onClick={() => setSel(null)}
              style={{
                background: "none",
                border: "none",
                color: "var(--t3)",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>
          {selTxs.length === 0 ? (
            <p style={{ color: "var(--t3)", fontSize: 13 }}>
              No transactions on this day.
            </p>
          ) : (
            selTxs.map((tx) => (
              <TxRow
                key={tx.id}
                tx={tx}
                onEdit={() => {}}
                onDelete={() => {}}
                onTogglePaid={() => {}}
              />
            ))
          )}
        </Card>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════ */
const Dashboard = ({
  transactions,
  onEdit,
  onDelete,
  openAdd,
  onTogglePaid,
  showBanner,
  setShowBanner,
  rangeFilter,
  setRangeFilter,
  extraClients,
  setExtraClients,
  goal,
  setGoal,
  onMarkAllPaid,
  onDeleteClient,
  onAddClient,
}) => {
  const today = todayISO();
  const [tmpF, setTmpF] = useState(rangeFilter.from);
  const [tmpT, setTmpT] = useState(rangeFilter.to);

  const rangeFiltered = useMemo(() => {
    if (!rangeFilter.from) return transactions;
    return transactions.filter((t) => {
      const a = !rangeFilter.from || t.date >= rangeFilter.from;
      const b = !rangeFilter.to || t.date <= rangeFilter.to;
      return a && b;
    });
  }, [transactions, rangeFilter]);

  const [addClientOpen, setAddClientOpen] = useState(false);
  const apply = () => setRangeFilter({ from: tmpF, to: tmpT || today });
  const clear = () => {
    setRangeFilter({ from: "", to: "" });
    setTmpF("");
    setTmpT("");
  };
  const inc = rangeFiltered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const exp = rangeFiltered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="fu" style={{ width: "100%" }}>
      {showBanner && (
        <ReminderBanner
          onAdd={() => {
            openAdd("income", "");
            setShowBanner(false);
          }}
          onDismiss={() => setShowBanner(false)}
        />
      )}

      {/* ── TOP: full-width ── */}
      <TodayOverview transactions={transactions} />
      <MonthlyGoal transactions={transactions} goal={goal} setGoal={setGoal} />
      <StatsRow transactions={rangeFiltered} />

      {/* ── BODY: 2-col on desktop, 1-col on mobile/tablet ── */}
      <div className="dash-grid">
        {/* LEFT col — date filter + transactions */}
        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Date Range Filter */}
          <div className="gc" style={{ padding: "14px 16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Icon n="filter" size={13} color="var(--t3)" />
                <span className="lbl">Custom Range</span>
              </div>
              {rangeFilter.from && (
                <button
                  onClick={clear}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--t3)",
                    fontSize: 11,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: "inherit",
                    fontWeight: 500,
                  }}
                >
                  <Icon n="close" size={10} />
                  Clear
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="date"
                value={tmpF}
                onChange={(e) => setTmpF(e.target.value)}
                className="inp"
                style={{
                  flex: 1,
                  minWidth: 130,
                  fontSize: 12,
                  padding: "7px 10px",
                }}
              />
              <input
                type="date"
                value={tmpT}
                onChange={(e) => setTmpT(e.target.value)}
                className="inp"
                style={{
                  flex: 1,
                  minWidth: 130,
                  fontSize: 12,
                  padding: "7px 10px",
                }}
              />
              <Btn
                sz="sm"
                v="i"
                onClick={apply}
                disabled={!tmpF}
                style={{ flexShrink: 0 }}
              >
                Apply
              </Btn>
            </div>
            {rangeFilter.from && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid var(--divider)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 12, color: "var(--t3)" }}>
                  {rangeFilter.from} → {rangeFilter.to || today} ·{" "}
                  {rangeFiltered.length} entries
                </span>
                <div>
                  <span
                    className="num"
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--green)",
                    }}
                  >
                    {fmtINR(inc)}
                  </span>
                  {exp > 0 && (
                    <span
                      className="num"
                      style={{
                        fontSize: 12,
                        color: "var(--red)",
                        marginLeft: 8,
                      }}
                    >
                      -{fmtINR(exp)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Transactions */}
          <div className="gc" style={{ padding: "16px 18px" }}>
            <SecTitle
              extra={
                <span
                  style={{ fontSize: 11, color: "var(--t3)", fontWeight: 500 }}
                >
                  {rangeFiltered.length} entries
                </span>
              }
            >
              {rangeFilter.from ? "Filtered" : "Recent Transactions"}
            </SecTitle>
            <GroupedList
              transactions={rangeFiltered}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePaid={onTogglePaid}
            />
          </div>
        </div>

        {/* RIGHT col — sticky sidebar */}
        <div className="dash-right-sticky">
          {/* Pending Summary */}
          <PendingSummary transactions={transactions} />

          {/* Clients panel */}
          <div className="gc" style={{ padding: "16px 18px" }}>
            <SecTitle
              extra={
                <button
                  onClick={() => setAddClientOpen(true)}
                  style={{
                    background: "var(--indigobg)",
                    border: "1px solid rgba(99,102,241,.2)",
                    color: "var(--indigo)",
                    borderRadius: 8,
                    padding: "4px 12px",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Icon n="plus" size={11} />
                  Client
                </button>
              }
            >
              Clients
            </SecTitle>
            <ClientPanel
              transactions={transactions}
              rangeFiltered={rangeFiltered}
              onAddForClient={(name) => openAdd("income", name)}
              extraClients={extraClients}
              onDeleteClient={onDeleteClient}
              onMarkAllPaid={onMarkAllPaid}
            />
          </div>
        </div>
      </div>

      {addClientOpen && (
        <Modal
          open={addClientOpen}
          onClose={() => setAddClientOpen(false)}
          title="Add New Client"
          width={400}
        >
          <AddClientModal
            existingClients={[
              ...new Set([
                ...transactions.map((t) => t.client),
                ...extraClients,
              ]),
            ]}
            onAdd={(name) => {
              onAddClient
                ? onAddClient(name)
                : setExtraClients((p) => [...p, name]);
            }}
            onClose={() => setAddClientOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════
   ALL TRANSACTIONS
══════════════════════════════════════════════ */
const AllTransactions = ({ transactions, onEdit, onDelete, onTogglePaid }) => {
  const [q, setQ] = useState("");
  const [tp, setTp] = useState("all");
  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const ms =
          !q ||
          t.client.toLowerCase().includes(q.toLowerCase()) ||
          (t.note || "").toLowerCase().includes(q.toLowerCase());
        const mt = tp === "all" || t.type === tp;
        return ms && mt;
      }),
    [transactions, q, tp],
  );
  return (
    <div
      className="fu"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div className="gc" style={{ padding: "14px 16px" }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: "1 1 200px", position: "relative" }}>
            <span className="lbl" style={{ display: "block", marginBottom: 5 }}>
              Search
            </span>
            <div style={{ position: "relative" }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Client or note…"
                className="inp"
                style={{ paddingLeft: 32 }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <Icon n="search" size={13} color="var(--t3)" />
              </div>
            </div>
          </div>
          <div style={{ flex: "0 0 140px" }}>
            <FS
              label="Type"
              value={tp}
              onChange={(e) => setTp(e.target.value)}
              options={[
                { v: "all", l: "All" },
                { v: "income", l: "Income" },
                { v: "expense", l: "Expense" },
              ]}
            />
          </div>
        </div>
      </div>
      <div className="gc" style={{ padding: "16px 18px" }}>
        <SecTitle
          extra={
            <span style={{ fontSize: 11, color: "var(--t3)", fontWeight: 500 }}>
              {filtered.length} entries
            </span>
          }
        >
          All Transactions
        </SecTitle>
        <GroupedList
          transactions={filtered}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePaid={onTogglePaid}
        />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   INVOICE PAGE
══════════════════════════════════════════════ */
const InvoicePage = ({ transactions }) => {
  // Merge current + all archived transactions for clients and invoice
  const allTx = useMemo(() => {
    const archive = loadArchive();
    const archived = Object.values(archive).flat();
    const ids = new Set(transactions.map((t) => t.id));
    const unique = archived.filter((t) => !ids.has(t.id));
    return [...transactions, ...unique];
  }, [transactions]);
  const clients = [
    ...new Set(allTx.filter((t) => t.type === "income").map((t) => t.client)),
  ];
  const [client, setClient] = useState(clients[0] || "");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(todayISO());
  const [invoiceNo, setInvoiceNo] = useState("INV-001");
  const [yourName, setYourName] = useState("");
  const [yourEmail, setYourEmail] = useState("");
  const [note, setNote] = useState("Payment due within 7 days.");
  const [preview, setPreview] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  const filtered = allTx.filter(
    (t) =>
      t.type === "income" &&
      t.client === client &&
      (!fromDate || t.date >= fromDate) &&
      (!toDate || t.date <= toDate),
  );
  const total = filtered.reduce((s, t) => s + t.amount, 0);
  const pending = filtered
    .filter((t) => !t.paid)
    .reduce((s, t) => s + t.amount, 0);
  const received = filtered
    .filter((t) => t.paid)
    .reduce((s, t) => s + t.amount, 0);

  const printInvoice = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");
    const grouped = {};
    filtered
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((t) => {
        const [y, m] = t.date.split("-");
        const key = `${MONTHS[Number(m) - 1]} ${y}`;
        if (!grouped[key])
          grouped[key] = { total: 0, pending: 0, received: 0, videos: 0 };
        grouped[key].total += t.amount;
        grouped[key].videos += 1;
        if (t.paid) grouped[key].received += t.amount;
        else grouped[key].pending += t.amount;
      });
    const groupRows = Object.entries(grouped)
      .map(
        ([month, g]) => `
      <tr>
        <td style="padding:11px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #f1f5f9">${month}</td>
        <td style="padding:11px 16px;font-size:13px;text-align:center;border-bottom:1px solid #f1f5f9">${g.videos}</td>
        <td style="padding:11px 16px;font-size:12px;text-align:center;border-bottom:1px solid #f1f5f9">
          ${g.received > 0 ? `<span style="background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:20px;font-weight:700">Recd ${fmtINR(g.received)}</span>` : ""}
          ${g.pending > 0 ? `<span style="background:#fef3c7;color:#b45309;padding:2px 8px;border-radius:20px;font-weight:700">Pend ${fmtINR(g.pending)}</span>` : ""}
        </td>
        <td style="padding:11px 16px;font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid #f1f5f9">${fmtINR(g.total)}</td>
      </tr>`,
      )
      .join("");
    const div = document.createElement("div");
    div.style.cssText =
      "position:absolute;left:-9999px;top:0;width:794px;background:#fff;font-family:Arial,sans-serif;color:#1a1a2e";
    div.innerHTML = `
      <div style="background:#0d2a16;padding:28px 36px;display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-size:22px;font-weight:900;color:#22c55e">${yourName || "Your Name"}</div>
          <div style="font-size:11px;color:#86efac;margin-top:3px">${yourEmail || "your@email.com"} | Freelance Video Editor</div></div>
        <div style="text-align:right"><div style="font-size:11px;color:#86efac;text-transform:uppercase;letter-spacing:2px">Invoice</div>
          <div style="font-size:24px;font-weight:900;color:#fff;margin-top:2px">#${invoiceNo}</div>
          <div style="font-size:11px;color:#86efac;margin-top:3px">${fmtFull(todayISO())}</div></div>
      </div>
      <div style="padding:24px 36px">
        <div style="display:flex;margin-bottom:20px;background:#f8fafc;border-radius:10px;overflow:hidden">
          <div style="flex:1;padding:14px 18px;border-right:1px solid #e2e8f0">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:5px">BILL TO</div>
            <div style="font-size:14px;font-weight:700">${client}</div></div>
          <div style="flex:1;padding:14px 18px;border-right:1px solid #e2e8f0">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:5px">PERIOD</div>
            <div style="font-size:12px;font-weight:600">${fromDate ? fmtFull(fromDate) : "All time"} - ${fmtFull(toDate)}</div></div>
          <div style="flex:1;padding:14px 18px">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:5px">TOTAL VIDEOS</div>
            <div style="font-size:20px;font-weight:900;color:#16a34a">${filtered.length}</div></div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px">
          <thead><tr style="background:#f0fdf4;border-top:3px solid #16a34a">
            <th style="padding:10px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#374151">Month</th>
            <th style="padding:10px 16px;text-align:center;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#374151">Videos</th>
            <th style="padding:10px 16px;text-align:center;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#374151">Status</th>
            <th style="padding:10px 16px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#374151">Amount</th>
          </tr></thead>
          <tbody>${groupRows}</tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;margin-bottom:18px">
          <div style="width:240px;background:#f8fafc;border-radius:8px;padding:14px 18px">
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#64748b">
              <span>Received</span><span style="color:#16a34a;font-weight:600">${fmtINR(received)}</span></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#64748b">
              <span>Pending</span><span style="color:#d97706;font-weight:600">${fmtINR(pending)}</span></div>
            <div style="display:flex;justify-content:space-between;padding:10px 0 0;margin-top:6px;border-top:2px solid #16a34a;font-size:16px;font-weight:900">
              <span>TOTAL</span><span style="color:#16a34a">${fmtINR(total)}</span></div>
          </div>
        </div>
        ${note ? `<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:10px 14px;font-size:12px;color:#166534;margin-bottom:14px">${note}</div>` : ""}
        <div style="text-align:center;font-size:10px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:12px">Generated by Trackli</div>
      </div>`;
    document.body.appendChild(div);
    const canvas = await html2canvas(div, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png", 1.0);
    const imgW = canvas.width;
    const imgH = canvas.height;
    const pdfW = 794; // A4 px at 96dpi
    const pdfH = Math.ceil((imgH / imgW) * pdfW);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [pdfW, pdfH],
      hotfixes: ["px_scaling"],
    });
    pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
    pdf.save(
      `Invoice-${invoiceNo}-${client.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`,
    );
    document.body.removeChild(div);
  };

  return (
    <div className="fu">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Card>
          <SecTitle>🧾 Invoice Details</SecTitle>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <FI
              label="Your Name"
              value={yourName}
              onChange={(e) => setYourName(e.target.value)}
              placeholder="Rahul Sharma"
            />
            <FI
              label="Your Email"
              value={yourEmail}
              onChange={(e) => setYourEmail(e.target.value)}
              placeholder="rahul@email.com"
            />
            <FI
              label="Invoice No"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              placeholder="INV-001"
            />
            <FS
              label="Client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              options={clients.map((c) => ({ v: c, l: c }))}
            />
            <FI
              label="From Date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              type="date"
            />
            <FI
              label="To Date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              type="date"
            />
            <div style={{ gridColumn: "1/-1" }}>
              <FI
                label="Note / Payment Terms"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Payment due within 7 days."
              />
            </div>
          </div>
        </Card>
        <Card>
          <SecTitle>📋 Preview</SecTitle>
          {filtered.length === 0 ? (
            <p
              style={{
                color: "var(--t3)",
                fontSize: 13,
                textAlign: "center",
                padding: "30px 0",
              }}
            >
              Client ya date select karo
            </p>
          ) : (
            <>
              <div
                style={{
                  background: "var(--surface2)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginBottom: 14,
                }}
              >
                <p
                  style={{ fontSize: 12, color: "var(--t3)", marginBottom: 4 }}
                >
                  Bill To
                </p>
                <p style={{ fontSize: 16, fontWeight: 800 }}>{client}</p>
                <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 3 }}>
                  {fromDate ? fmtFull(fromDate) : "All time"} →{" "}
                  {fmtFull(toDate)}
                </p>
              </div>
              <div style={{ marginBottom: 14 }}>
                {Object.entries(
                  (() => {
                    const g = {};
                    filtered.forEach((t) => {
                      const [y, m] = t.date.split("-");
                      const k = `${MONTHS[Number(m) - 1]} ${y}`;
                      if (!g[k])
                        g[k] = { total: 0, videos: 0, pending: 0, received: 0 };
                      g[k].total += t.amount;
                      g[k].videos += 1;
                      if (t.paid) g[k].received += t.amount;
                      else g[k].pending += t.amount;
                    });
                    return g;
                  })(),
                ).map(([month, g]) => (
                  <div
                    key={month}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: `1px solid ${"var(--cb)"}`,
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{month}</p>
                      <p style={{ fontSize: 11, color: "var(--t3)" }}>
                        {g.videos} videos
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--green2)",
                        }}
                      >
                        {fmtINR(g.total)}
                      </p>
                      {g.pending > 0 && (
                        <p style={{ fontSize: 11, color: "var(--amber)" }}>
                          ⏳ {fmtINR(g.pending)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: "var(--surface2)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--t3)" }}>
                    Total Videos
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {filtered.length}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: `2px solid ${"var(--green)"}`,
                    paddingTop: 8,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 800 }}>Total</span>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "var(--green2)",
                    }}
                  >
                    {fmtINR(total)}
                  </span>
                </div>
              </div>
              <button
                onClick={printInvoice}
                style={{
                  width: "100%",
                  background: "var(--green)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 0",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ⬇️ PDF Download Karo
              </button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════ */
// ── Boot: inject styles immediately before React renders ──
(() => {
  try {
    const d = localStorage.getItem("flt_theme");
    const dark = d ? d === "dark" : true;
    injectStyles(dark);
    updateTheme(dark);
  } catch (e) {
    injectStyles(true);
    updateTheme(true);
  }
})();

export default function App() {
  // injectStyles already called at module level above
  useEffect(() => {
    const d = localStorage.getItem("flt_theme");
    const dark = d ? d === "dark" : true;
    updateTheme(dark);
  }, []);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthL] = useState(true);
  const [transactions, setTx] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [editTx, setEditTx] = useState(null);
  const [delTx, setDelTx] = useState(null);
  const [addState, setAddState] = useState(null);
  const [rangeFilter, setRF] = useState({ from: "", to: "" });
  const { showBanner, setShowBanner } = useReminder(transactions);
  const [extraClients, setEC] = useState([]);
  const [goal, setGoalSt] = useState({ monthly: 0 });
  const [sub, setSub] = useState(null);
  const [showPaywall, setPayw] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebStats, setCelebStats] = useState(null);
  const [darkMode, setDark] = useState(() => {
    try {
      const s = localStorage.getItem("flt_theme");
      return s ? s === "dark" : true;
    } catch {
      return true;
    }
  });
  const daysLeft = sub ? getTrialDaysLeft(sub) : 30;

  // ── MONTH RESET — new month detect karo aur archive karo ──
  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const currentMK = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMK = loadLastMonth();

    if (lastMK && lastMK !== currentMK) {
      // Naya mahina! Purane transactions archive karo
      const archive = loadArchive();
      archive[lastMK] = transactions.filter((t) => t.date.startsWith(lastMK));
      saveArchive(archive);

      // Stats calculate karo celebration ke liye
      const oldTx = archive[lastMK];
      const income = oldTx
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const received = oldTx
        .filter((t) => t.type === "income" && t.paid)
        .reduce((s, t) => s + t.amount, 0);
      const videos = oldTx.filter((t) => t.type === "income").length;
      const clientMap = {};
      oldTx
        .filter((t) => t.type === "income")
        .forEach((t) => {
          clientMap[t.client] = (clientMap[t.client] || 0) + t.amount;
        });
      const topClient = Object.entries(clientMap).sort(
        (a, b) => b[1] - a[1],
      )[0];
      setCelebStats({
        income,
        received,
        videos,
        clients: Object.keys(clientMap).length,
        topClient: topClient?.[0],
        topAmount: topClient?.[1],
      });
      setShowCelebration(true);
    }

    saveLastMonth(currentMK);
  }, [user, transactions]);

  // Apply theme
  useEffect(() => {
    updateTheme(darkMode);
  }, [darkMode]);
  const toggleTheme = () => {
    const d = !darkMode;
    setDark(d);
    try {
      localStorage.setItem("flt_theme", d ? "dark" : "light");
    } catch {}
  };

  // Supabase auth
  useEffect(() => {
    // Timeout fallback — if Supabase takes too long, show auth screen
    const timer = setTimeout(() => setAuthL(false), 5000);
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timer);
        setUser(session?.user ?? null);
        setAuthL(false);
      })
      .catch(() => {
        clearTimeout(timer);
        setAuthL(false);
      });
    const {
      data: { subscription: s2 },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => s2.unsubscribe();
  }, []);

  // Load user data
  useEffect(() => {
    if (!user) {
      setTx([]);
      setEC([]);
      setGoalSt({ monthly: 0 });
      return;
    }
    (async () => {
      try {
        const { data: txData } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false });
        if (txData) setTx(txData);
        const { data: clData } = await supabase
          .from("user_clients")
          .select("name")
          .eq("user_id", user.id);
        if (clData) setEC(clData.map((c) => c.name));
        const { data: gData } = await supabase
          .from("user_goals")
          .select("monthly")
          .eq("user_id", user.id)
          .maybeSingle();
        if (gData) setGoalSt({ monthly: gData.monthly });
        const s = initTrial();
        setSub(s);
        if (!s.unlocked && getTrialDaysLeft(s) <= 7) setPayw(true);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user]);

  const setGoal = async (g) => {
    setGoalSt(g);
    if (!user) return;
    await supabase
      .from("user_goals")
      .upsert(
        { user_id: user.id, monthly: g.monthly },
        { onConflict: "user_id" },
      );
  };

  const addTx = useCallback(
    async (tx) => {
      if (!user?.id) return;
      const row = {
        id: tx.id,
        user_id: user.id,
        type: tx.type,
        client: tx.client,
        amount: Number(tx.amount),
        minutes: Number(tx.minutes || 0),
        date: tx.date,
        note: tx.note || "",
        paid: tx.paid || false,
      };
      setTx((p) => [row, ...p]);
      await supabase.from("transactions").insert(row);
    },
    [user],
  );

  const saveTxEdit = useCallback(
    async (u) => {
      setTx((p) => p.map((t) => (t.id === u.id ? u : t)));
      setEditTx(null);
      await supabase
        .from("transactions")
        .update(u)
        .eq("id", u.id)
        .eq("user_id", user?.id);
    },
    [user],
  );

  const confirmDel = useCallback(async () => {
    if (!delTx) return;
    setTx((p) => p.filter((t) => t.id !== delTx.id));
    setDelTx(null);
    await supabase.from("transactions").delete().eq("id", delTx.id);
  }, [delTx]);

  const togglePaid = useCallback(async (id) => {
    setTx((p) =>
      p.map((t) => {
        if (t.id !== id) return t;
        const u = { ...t, paid: !t.paid };
        supabase.from("transactions").update({ paid: u.paid }).eq("id", id);
        return u;
      }),
    );
  }, []);

  const handleAddClient = useCallback(
    async (name) => {
      setEC((p) => [...p, name]);
      if (!user) return;
      await supabase
        .from("user_clients")
        .insert({ user_id: user.id, name })
        .select();
    },
    [user],
  );

  const deleteClient = useCallback(
    async (name) => {
      setTx((p) => p.filter((t) => t.client !== name));
      setEC((p) => p.filter((c) => c !== name));
      if (!user) return;
      await supabase
        .from("transactions")
        .delete()
        .eq("user_id", user.id)
        .eq("client", name);
      await supabase
        .from("user_clients")
        .delete()
        .eq("user_id", user.id)
        .eq("name", name);
    },
    [user],
  );

  const markAllPaid = useCallback(async (clientName) => {
    setTx((p) =>
      p.map((t) => {
        if (t.client !== clientName || t.type !== "income" || t.paid) return t;
        supabase.from("transactions").update({ paid: true }).eq("id", t.id);
        return { ...t, paid: true };
      }),
    );
  }, []);

  const openAdd = (type = "income", client = "") =>
    setAddState({ type, client });
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTx([]);
    setEC([]);
    setGoalSt({ monthly: 0 });
  };

  // Loading screen
  if (authLoading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d0d12",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "linear-gradient(135deg,#6366f1,#22c55e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
          }}
        >
          <Icon n="bolt" size={18} color="#fff" />
        </div>
        <Loader size={20} color="#6366f1" />
        <p
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.25)",
            fontFamily: "'Inter',sans-serif",
            letterSpacing: ".04em",
          }}
        >
          Loading Trackli...
        </p>
      </div>
    );

  // Auth screen
  if (!user) return <AuthScreen onLogin={setUser} />;

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "transactions", label: "Transactions", icon: "list" },
    { id: "calendar", label: "Calendar", icon: "calendar" },
    { id: "invoice", label: "Invoice", icon: "receipt" },
  ];

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "transactions", label: "Transactions", icon: "list" },
    { id: "calendar", label: "Calendar", icon: "calendar" },
    { id: "invoice", label: "Invoice", icon: "receipt" },
  ];

  const pageContent = (
    <>
      {tab === "dashboard" && (
        <Dashboard
          transactions={transactions}
          onEdit={setEditTx}
          onDelete={setDelTx}
          openAdd={openAdd}
          onTogglePaid={togglePaid}
          showBanner={showBanner}
          setShowBanner={setShowBanner}
          rangeFilter={rangeFilter}
          setRangeFilter={setRF}
          extraClients={extraClients}
          setExtraClients={setEC}
          goal={goal}
          setGoal={setGoal}
          onMarkAllPaid={markAllPaid}
          onDeleteClient={deleteClient}
          onAddClient={handleAddClient}
        />
      )}
      {tab === "transactions" && (
        <AllTransactions
          transactions={transactions}
          onEdit={setEditTx}
          onDelete={setDelTx}
          onTogglePaid={togglePaid}
        />
      )}
      {tab === "calendar" && (
        <CalendarView
          transactions={transactions}
          onEdit={setEditTx}
          onDelete={setDelTx}
        />
      )}
      {tab === "invoice" && <InvoicePage transactions={transactions} />}
    </>
  );

  return (
    <div
      className="app-shell"
      style={{ color: "var(--t1)", transition: "background .25s,color .25s" }}
    >
      {/* ══ HEADER — always visible ══ */}
      <header className="hdr" style={{ flexShrink: 0 }}>
        <div className="hdr-inner">
          {/* Logo */}
          <div className="hdr-logo">
            <div className="hdr-logo-ic">
              <Icon n="bolt" size={14} color="#fff" />
            </div>
            <div>
              <div className="hdr-logo-name">Trackli</div>
              <div className="hdr-logo-sub">Income Tracker</div>
            </div>
          </div>
          {/* Actions */}
          <div className="hdr-actions">
            <button
              onClick={() => openAdd("income", "")}
              className="pill-g"
              style={{ padding: "6px 16px" }}
            >
              <Icon n="arrowUp" size={12} />
              <span className="btn-lbl">Add Income</span>
            </button>
            <button
              onClick={() => openAdd("expense", "")}
              className="pill-r"
              style={{ padding: "6px 16px" }}
            >
              <Icon n="arrowDown" size={12} />
              <span className="btn-lbl">Add Expense</span>
            </button>
            {!sub?.unlocked && daysLeft <= 7 && (
              <button
                onClick={() => setPayw(true)}
                style={{
                  background: "var(--amberbg)",
                  border: "1px solid rgba(245,158,11,.22)",
                  color: "var(--amber)",
                  borderRadius: 99,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {daysLeft === 0 ? "Subscribe" : daysLeft + "d left"}
              </button>
            )}
            <ThemeToggle dark={darkMode} onToggle={toggleTheme} />
            <button
              onClick={logout}
              className="pill-ghost"
              style={{ padding: "6px 14px" }}
            >
              <Icon n="logout" size={13} />
              <span className="btn-lbl">Logout</span>
            </button>
          </div>
        </div>

        {/* Tabs — tablet + mobile only (≤960px) */}
        <div className="tabs-bar">
          {navItems.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`tab-btn ${tab === t.id ? "active" : ""}`}
            >
              <div className="tab-icon-wrap">
                <Icon n={t.icon} size={14} />
              </div>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ══ NEW MONTH CELEBRATION ══ */}
      {showCelebration && celebStats && (
        <NewMonthCelebration
          stats={celebStats}
          monthName={
            MONTHS[new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1]
          }
          onClose={() => setShowCelebration(false)}
        />
      )}

      {/* ══ PAYWALL ══ */}
      {showPaywall && (
        <Paywall
          daysLeft={daysLeft}
          onUnlock={() => {
            setSub(loadSub());
            setPayw(false);
          }}
        />
      )}
      {!sub?.unlocked && daysLeft === 0 && !showPaywall && (
        <Paywall
          daysLeft={0}
          onUnlock={() => {
            setSub(loadSub());
            setPayw(false);
          }}
        />
      )}

      {/* ══ BODY = SIDEBAR + CONTENT ══ */}
      <div className="app-body">
        {/* ── LEFT SIDEBAR — desktop only (>960px) ── */}
        <aside className="sidebar">
          {/* Navigation */}
          {navItems.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`sb-item ${tab === t.id ? "active" : ""}`}
            >
              <div className="sb-icon">
                <Icon n={t.icon} size={16} />
              </div>
              {t.label}
            </button>
          ))}
        </aside>

        {/* ── MAIN CONTENT — desktop: fills rest, mobile: full width ── */}
        <main className="main-content">{pageContent}</main>
      </div>

      {/* ══ MODALS ══ */}
      <Modal
        open={!!addState}
        onClose={() => setAddState(null)}
        title={addState?.type === "income" ? "Add Income" : "Add Expense"}
      >
        {addState && (
          <QuickAddForm
            defaultType={addState.type}
            prefillClient={addState.client}
            onAdd={(tx) => {
              addTx(tx);
              setAddState(null);
            }}
            onClose={() => setAddState(null)}
          />
        )}
      </Modal>
      <Modal
        open={!!editTx}
        onClose={() => setEditTx(null)}
        title="Edit Transaction"
      >
        {editTx && (
          <EditForm
            tx={editTx}
            onSave={saveTxEdit}
            onClose={() => setEditTx(null)}
          />
        )}
      </Modal>
      <Modal
        open={!!delTx}
        onClose={() => setDelTx(null)}
        title="Delete Transaction"
        width={420}
      >
        {delTx && (
          <DeleteConfirm
            tx={delTx}
            onConfirm={confirmDel}
            onClose={() => setDelTx(null)}
          />
        )}
      </Modal>

      {/* ══ MOBILE BOTTOM NAV ══ */}
      <nav className="mob-nav">
        {navItems.map((t) => (
          <button
            key={t.id}
            className={`mob-nav-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <Icon n={t.icon} size={20} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* ══ MOBILE FAB ══ */}
      <button
        className="fab"
        onClick={() => openAdd("income", "")}
        title="Add Income"
      >
        <Icon n="plus" size={20} color="#fff" />
      </button>
    </div>
  );
}
