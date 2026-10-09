// Single-page UI. All header values are rendered client-side via textContent,
// because they are attacker-controlled and must never be injected as HTML.
export const PAGE_HTML = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Client IP header test</title>
<style>
  :root { --ok: #127a3b; --bad: #b42318; --muted: #667085; --border: #d0d5dd; }
  body { font-family: system-ui, sans-serif; max-width: 960px; margin: 2rem auto; padding: 0 1rem; color: #101828; }
  h1 { margin-bottom: .25rem; }
  p.lead { color: var(--muted); margin-top: 0; }
  section { border: 1px solid var(--border); border-radius: 8px; padding: 1rem 1.25rem; margin: 1.25rem 0; }
  h2 { margin-top: 0; font-size: 1.15rem; }
  table { width: 100%; border-collapse: collapse; font-size: .92rem; }
  th, td { text-align: left; padding: .45rem .5rem; border-bottom: 1px solid #eaecf0; vertical-align: top; }
  th { color: var(--muted); font-weight: 600; }
  code, td.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  button { font: inherit; padding: .5rem 1rem; border-radius: 6px; border: 1px solid #344054; background: #101828; color: white; cursor: pointer; }
  button:disabled { opacity: .5; cursor: wait; }
  .ok { color: var(--ok); font-weight: 600; }
  .bad { color: var(--bad); font-weight: 600; }
  .muted { color: var(--muted); }
  pre { background: #f9fafb; border: 1px solid #eaecf0; padding: .75rem; overflow: auto; font-size: .8rem; max-height: 320px; }
  details summary { cursor: pointer; color: var(--muted); }
</style>
</head>
<body>
<h1>Client IP header test</h1>
<p class="lead">What do <code>X-Forwarded-For</code>, <code>CF-Connecting-IP</code> and <code>True-Client-IP</code> actually contain by the time a request reaches this service?</p>
<p class="muted">Reference: <a href="https://developers.cloudflare.com/fundamentals/reference/http-headers/" target="_blank" rel="noopener">Cloudflare HTTP headers documentation</a></p>

<section>
  <h2>1. Your normal request</h2>
  <p class="muted">A plain request from your browser with no custom headers. This is your baseline "real" client IP as seen by the service.</p>
  <table id="baseline"><tbody><tr><td class="muted">Loading…</td></tr></tbody></table>
  <details><summary>All received headers</summary><pre id="baseline-raw"></pre></details>
</section>

<section>
  <h2>2. Spoof attempt from your browser</h2>
  <p class="muted">Your browser sends one request per header, each with a random fake IP (from the RFC 5737 documentation ranges). The table shows whether the fake value reached the service, was overwritten with your real IP, or was blocked at the edge.</p>
  <button id="spoof-btn">Send spoofed requests</button>
  <table id="spoof" style="margin-top:1rem"></table>
  <p id="spoof-note" class="muted"></p>
  <details><summary>Raw results</summary><pre id="spoof-raw"></pre></details>
</section>

<section>
  <h2>3. Server-to-self spoof attempt</h2>
  <p class="muted">The service calls its own public URL with the same fake headers. The request goes out to the internet and back in through the edge. Here the real client is Render's outbound IP, not you.</p>
  <button id="self-btn">Run self-test</button>
  <table id="self" style="margin-top:1rem"></table>
  <details><summary>Raw result</summary><pre id="self-raw"></pre></details>
</section>

<section>
  <h2>Try it with curl</h2>
  <pre id="curl"></pre>
</section>

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
  baseline = await getJson("/api/headers");
  const rows = Object.entries(baseline.ipHeaders).map(([k, v]) => row([mono(k), mono(v)]));
  rows.push(row([mono("socket remote address"), mono(baseline.socketRemoteAddress)]));
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
