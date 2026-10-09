import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { randomInt } from "node:crypto";
import { PAGE_HTML } from "./page.js";

const PORT = Number(process.env.PORT ?? 3000);
// Render injects this automatically, e.g. https://header-test.onrender.com
const EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;

const IP_HEADERS = [
  "cf-connecting-ip",
  "true-client-ip",
  "x-forwarded-for",
  "x-real-ip",
  "forwarded",
  "cf-ipcountry",
  "cf-ray",
] as const;

const SPOOF_HEADERS = ["cf-connecting-ip", "true-client-ip", "x-forwarded-for"] as const;

type HeaderSnapshot = {
  receivedAt: string;
  method: string;
  path: string;
  socketRemoteAddress: string | null;
  ipHeaders: Record<string, string | null>;
  allHeaders: Record<string, string | string[] | undefined>;
};

function snapshot(req: IncomingMessage): HeaderSnapshot {
  const ipHeaders: Record<string, string | null> = {};
  for (const name of IP_HEADERS) {
    const value = req.headers[name];
    ipHeaders[name] = Array.isArray(value) ? value.join(", ") : value ?? null;
  }
  return {
    receivedAt: new Date().toISOString(),
    method: req.method ?? "GET",
    path: req.url ?? "/",
    socketRemoteAddress: req.socket.remoteAddress ?? null,
    ipHeaders,
    allHeaders: req.headers,
  };
}

// Addresses from the RFC 5737 documentation ranges, so they can never be a real client.
function randomFakeIp(): string {
  const prefixes = ["192.0.2", "198.51.100", "203.0.113"];
  return `${prefixes[randomInt(prefixes.length)]}.${randomInt(1, 255)}`;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body, null, 2));
}

// The server calls its own public URL with spoofed headers. The request leaves Render,
// re-enters through the public edge, and we report what actually arrived. The "real"
// client here is Render's outbound IP, not the person viewing the page.
async function selfTest(res: ServerResponse): Promise<void> {
  if (!EXTERNAL_URL) {
    sendJson(res, 400, {
      error: "RENDER_EXTERNAL_URL is not set. The self-test only works when deployed on Render.",
    });
    return;
  }

  const target = `${EXTERNAL_URL}/api/headers`;
  // One request per header: Cloudflare rejects any request carrying a client-supplied
  // CF-Connecting-IP, which would otherwise hide the results for the other headers.
  const results = await Promise.all(
    SPOOF_HEADERS.map(async (header) => {
      const sent = randomFakeIp();
      try {
        const response = await fetch(target, {
          headers: { [header]: sent },
          signal: AbortSignal.timeout(10_000),
        });
        const text = await response.text();
        if (!response.ok) {
          return { header, sent, blocked: true, status: response.status, body: text.slice(0, 200) };
        }
        const received = JSON.parse(text) as HeaderSnapshot;
        return { header, sent, blocked: false, status: response.status, received: received.ipHeaders };
      } catch (err) {
        return { header, sent, blocked: true, status: null, body: (err as Error).message };
      }
    }),
  );
  sendJson(res, 200, { target, results });
}

const server = createServer((req, res) => {
  const path = new URL(req.url ?? "/", "http://localhost").pathname;

  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  switch (path) {
    case "/":
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      });
      res.end(PAGE_HTML);
      return;
    case "/api/headers":
      sendJson(res, 200, snapshot(req));
      return;
    case "/api/self-test":
      void selfTest(res);
      return;
    case "/healthz":
      sendJson(res, 200, { ok: true });
      return;
    default:
      sendJson(res, 404, { error: "Not found" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`header-test listening on port ${PORT}`);
});
