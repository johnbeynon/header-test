// Single-page UI. All header values are rendered client-side via textContent,
// because they are attacker-controlled and must never be injected as HTML.
export const PAGE_HTML = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Client IP header test</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500&family=Roboto+Mono:wght@400;500&display=swap">
<style>
  /* Render brand foundations. Brand faces are licensed for internal use only, so this
     public page names them first but loads the open-licensed fallbacks. */
  :root {
    --bg: #ffffff; --bg-secondary: #fafafa; --border: #e3e3e3;
    --text: #0d0d0d; --text-secondary: #4d4d4d; --text-faint: #6b6b6b;
    --link: #8a05ff; --link-hover: #48008c; --accent: #8a05ff; --accent-strong: #48008c;
    --chip-bg: #f0f0f0; --row-hover: rgba(0, 0, 0, 0.02);
    --success: #006d4c; --error: #e23642;
    --font-brand: 'Roobert', 'Manrope', ui-sans-serif, system-ui, sans-serif;
    --font-default: 'PP Neue Montreal', 'Manrope', ui-sans-serif, system-ui, sans-serif;
    --font-mono: 'PP Neue Montreal Mono', 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    --ease: cubic-bezier(0.9, 0.1, 0.1, 0.9);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0d0d0d; --bg-secondary: #141414; --border: #272727;
      --text: #ffffff; --text-secondary: #c7c7c7; --text-faint: #b3b3b3;
      --link: #d1b8ff; --link-hover: #e7dbff; --accent-strong: #c29eff;
      --chip-bg: #141414; --row-hover: rgba(255, 255, 255, 0.03);
      --success: #5cffb8; --error: #f0989e;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 400 16px/24px var(--font-default); letter-spacing: 0.01em; }
  main { max-width: 1024px; margin: 0 auto; padding: 48px 32px 64px; display: flex; flex-direction: column; gap: 32px; }
  header { display: flex; flex-direction: column; gap: 12px; }
  h1 { margin: 0; font: 300 40px/44px var(--font-brand); letter-spacing: -0.015em; }
  h2 { margin: 0; font: 400 24px/28px var(--font-brand); letter-spacing: -0.01em; }
  p { margin: 0; max-width: 62ch; color: var(--text-secondary); }
  .lead { font-size: 18px; line-height: 26px; }
  .overline { font: 500 12px/16px var(--font-mono); letter-spacing: 0.02em; text-transform: uppercase; color: var(--text-faint); }
  .muted { color: var(--text-faint); font-size: 14px; line-height: 20px; }
  section { display: flex; flex-direction: column; gap: 16px; padding-top: 32px; border-top: 1px solid var(--border); }
  .section-head { display: flex; flex-direction: column; gap: 8px; }
  a { color: var(--link); text-decoration: none; background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat; transition: background-size 200ms var(--ease); }
  a:hover { color: var(--link-hover); background-size: 100% 1px; }
  @media (prefers-reduced-motion: reduce) { a { transition: none; } }
  code { font: 400 0.875em var(--font-mono); background: var(--chip-bg); padding: 1px 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; line-height: 20px; border: 1px solid var(--border); }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { font: 500 11px/14px var(--font-mono); letter-spacing: 0.025em; text-transform: uppercase; color: var(--text-faint); background: var(--bg-secondary); }
  tbody tr:hover { background: var(--row-hover); }
  tbody tr:last-child td { border-bottom: 0; }
  td.mono { font-family: var(--font-mono); word-break: break-all; }
  table:empty, p:empty { display: none; }
  th:first-child { width: 34%; }
  .actions { display: flex; gap: 12px; }
  button { font: 400 16px/24px var(--font-default); padding: 8px 16px; border: 1px solid var(--text); border-radius: 0; cursor: pointer; }
  button.primary { background: var(--text); color: var(--bg); }
  button.primary:hover { background: var(--accent); border-color: var(--accent); color: #ffffff; }
  button.secondary { background: transparent; color: var(--text); }
  button.secondary:hover { color: var(--accent-strong); border-color: var(--accent-strong); }
  button:disabled { opacity: 0.5; cursor: wait; }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ok { color: var(--success); }
  .bad { color: var(--error); }
  pre { margin: 0; background: #141414; color: #f0f0f0; padding: 16px; overflow: auto; font: 400 13px/20px var(--font-mono); max-height: 320px; }
  details { display: flex; flex-direction: column; gap: 8px; }
  details[open] summary { margin-bottom: 8px; }
  summary { cursor: pointer; font: 500 12px/16px var(--font-mono); letter-spacing: 0.02em; text-transform: uppercase; color: var(--text-faint); }
  summary:hover { color: var(--text); }
  @media (max-width: 767px) {
    main { padding: 32px 16px 48px; gap: 24px; }
    h1 { font-size: 32px; line-height: 36px; }
    .actions { flex-direction: column; }
    button { width: 100%; min-height: 44px; }
    th, td { padding: 8px; }
  }
</style>
</head>
<body>
<main>
<header>
  <span class="overline">Render edge headers</span>
  <h1>Client IP header test</h1>
  <p class="lead">What do <code>X-Forwarded-For</code>, <code>CF-Connecting-IP</code> and <code>True-Client-IP</code> contain by the time a request reaches this service?</p>
  <p class="muted">Reference: <a href="https://developers.cloudflare.com/fundamentals/reference/http-headers/" target="_blank" rel="noopener">Cloudflare HTTP headers documentation</a></p>
</header>

<section>
  <div class="section-head">
    <span class="overline">01</span>
    <h2>Your normal request</h2>
    <p>A plain request from your browser with no custom headers. This is your baseline "real" client IP as seen by the service. The <code>cf-ray</code> row shows what the service received. The last row shows the <code>cf-ray</code> Cloudflare returned to your browser for the same request. The ray ID matches, but the data center suffix can differ: the request enters Cloudflare near you and may leave from a data center near the origin.</p>
  </div>
  <table id="baseline"><tbody><tr><td class="muted">Loading…</td></tr></tbody></table>
  <details><summary>All received headers</summary><pre id="baseline-raw"></pre></details>
</section>

<section>
  <div class="section-head">
    <span class="overline">02</span>
    <h2>Spoof attempt from your browser</h2>
    <p>Your browser sends one request per header, each with a random fake IP (from the RFC 5737 documentation ranges). The table shows whether the fake value reached the service, was overwritten with your real IP, or was blocked at the edge.</p>
  </div>
  <div class="actions"><button id="spoof-btn" class="primary">Send spoofed requests</button></div>
  <table id="spoof"></table>
  <p id="spoof-note" class="muted"></p>
  <details><summary>Raw results</summary><pre id="spoof-raw"></pre></details>
</section>

<section>
  <div class="section-head">
    <span class="overline">03</span>
    <h2>Server-to-self spoof attempt</h2>
    <p>The service calls its own public URL with the same fake headers. The request goes out to the internet and back in through the edge. Here the real client is Render's outbound IP, not you.</p>
  </div>
  <div class="actions"><button id="self-btn" class="secondary">Run self-test</button></div>
  <table id="self"></table>
  <details><summary>Raw result</summary><pre id="self-raw"></pre></details>
</section>

<section>
  <div class="section-head">
    <span class="overline">04</span>
    <h2>Try it with curl</h2>
  </div>
  <pre id="curl"></pre>
</section>
</main>

<script>
const SPOOF_HEADERS = ["cf-connecting-ip", "true-client-ip", "x-forwarded-for"];
let baseline = null;

function fakeIp() {
  const prefixes = ["192.0.2", "198.51.100", "203.0.113"];
  return prefixes[Math.floor(Math.random() * prefixes.length)] + "." + (1 + Math.floor(Math.random() * 254));
}

function el(tag, text, cls) {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  if (cls) e.className = cls;
  return e;
}

function row(cells) {
  const tr = document.createElement("tr");
  for (const c of cells) tr.appendChild(c instanceof Node ? c : el("td", c ?? "(not present)"));
  return tr;
}

function renderTable(table, headerCells, rows) {
  table.replaceChildren();
  const thead = document.createElement("thead");
  const htr = document.createElement("tr");
  for (const h of headerCells) htr.appendChild(el("th", h));
  thead.appendChild(htr);
  const tbody = document.createElement("tbody");
  for (const r of rows) tbody.appendChild(r);
  table.append(thead, tbody);
}

function mono(text) { return el("td", text ?? "(not present)", "mono"); }

// result: { header, sent, blocked, status, body?, received? }
function verdict(result) {
  if (result.blocked) {
    return el("td", "Blocked at edge (HTTP " + (result.status ?? "error") + ": " + (result.body ?? "").trim() + ")", "ok");
  }
  const got = result.received[result.header];
  if (got && got.includes(result.sent)) {
    return el("td", got.trim() === result.sent ? "Spoofed value passed through" : "Spoofed value kept, real IP appended", "bad");
  }
  return el("td", "Overwritten by edge", "ok");
}

function resultRows(results) {
  return results.map((r) =>
    row([mono(r.header), mono(r.sent), mono(r.blocked ? "(request never reached the service)" : r.received[r.header]), verdict(r)]));
}

// Sends one request with a single spoofed header and reports what happened.
async function spoofOne(header) {
  const sent = fakeIp();
  const r = await fetch("/api/headers", { cache: "no-store", headers: { [header]: sent } });
  const text = await r.text();
  if (!r.ok) return { header, sent, blocked: true, status: r.status, body: text.slice(0, 200) };
  return { header, sent, blocked: false, status: r.status, received: JSON.parse(text).ipHeaders };
}

async function getJson(url, init) {
  const r = await fetch(url, { cache: "no-store", ...init });
  return r.json();
}

async function loadBaseline() {
  const r = await fetch("/api/headers", { cache: "no-store" });
  baseline = await r.json();
  const rows = Object.entries(baseline.ipHeaders).map(([k, v]) => row([mono(k), mono(v)]));
  rows.push(row([mono("socket remote address"), mono(baseline.socketRemoteAddress)]));
  // Same ray ID, but the suffix is the data center that handled each side. When Cloudflare
  // routes across its network, your browser sees the entry colo and the origin sees the exit colo.
  rows.push(row([mono("cf-ray (response to your browser)"), mono(r.headers.get("cf-ray"))]));
  renderTable(document.getElementById("baseline"), ["Header", "Value received"], rows);
  document.getElementById("baseline-raw").textContent = JSON.stringify(baseline.allHeaders, null, 2);
}

function yourIp() {
  return baseline?.ipHeaders["cf-connecting-ip"] ?? baseline?.ipHeaders["true-client-ip"] ?? null;
}

const RESULT_COLUMNS = ["Header", "Sent (fake)", "Received by service", "Result"];

document.getElementById("spoof-btn").addEventListener("click", async (e) => {
  const btn = e.currentTarget;
  btn.disabled = true;
  try {
    const results = await Promise.all(SPOOF_HEADERS.map(spoofOne));
    renderTable(document.getElementById("spoof"), RESULT_COLUMNS, resultRows(results));
    document.getElementById("spoof-note").textContent =
      "Your IP from the baseline request: " + (yourIp() ?? "unknown");
    document.getElementById("spoof-raw").textContent = JSON.stringify(results, null, 2);
  } finally {
    btn.disabled = false;
  }
});

document.getElementById("self-btn").addEventListener("click", async (e) => {
  const btn = e.currentTarget;
  btn.disabled = true;
  try {
    const result = await getJson("/api/self-test");
    document.getElementById("self-raw").textContent = JSON.stringify(result, null, 2);
    if (result.error) {
      renderTable(document.getElementById("self"), ["Error"], [row([el("td", result.error, "bad")])]);
      return;
    }
    renderTable(document.getElementById("self"), RESULT_COLUMNS, resultRows(result.results));
  } finally {
    btn.disabled = false;
  }
});

document.getElementById("curl").textContent = [
  "# Blocked by Cloudflare (403, error code 1000)",
  "curl -s " + location.origin + "/api/headers -H 'CF-Connecting-IP: 203.0.113.7'",
  "",
  "# Overwritten with your real IP",
  "curl -s " + location.origin + "/api/headers -H 'True-Client-IP: 198.51.100.9'",
  "",
  "# Fake value kept, real IP appended",
  "curl -s " + location.origin + "/api/headers -H 'X-Forwarded-For: 192.0.2.44'",
].join("\\n");

loadBaseline().catch((err) => {
  document.getElementById("baseline").replaceChildren(row([el("td", "Failed: " + err.message, "bad")]));
});
</script>
</body>
</html>
`;
