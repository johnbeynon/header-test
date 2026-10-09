# header-test

A small TypeScript service (no runtime dependencies) that shows what client IP headers actually contain once a request has passed through Render's edge:

- `X-Forwarded-For`
- `CF-Connecting-IP`
- `True-Client-IP`

## What the page shows

1. **Your normal request**: the headers the service receives for a plain request from your browser. This is your real IP.
2. **Spoof attempt from your browser**: your browser sends one request per header to `/api/headers`, each with a random fake IP (from the RFC 5737 documentation ranges). The table compares what was sent with what was received.
3. **Server-to-self spoof attempt**: the service calls its own public URL (`RENDER_EXTERNAL_URL`) with the same fake headers. The real client is then Render's outbound IP.

### Observed behaviour on Render

| Spoofed header | Result |
| --- | --- |
| `CF-Connecting-IP` | Cloudflare rejects the request with `403 error code: 1000`. It never reaches the service. |
| `True-Client-IP` | Overwritten with the real client IP. |
| `X-Forwarded-For` | The fake value is kept and the real IP is appended, e.g. `192.0.2.44,81.107.0.110, 172.71.x.x, 10.x.x.x`. Don't trust the leftmost entry. |

A request without spoofed headers receives `CF-Connecting-IP` and `True-Client-IP` set to the real client IP.

If you run it locally there's no edge proxy, so every spoofed value passes straight through.

## Endpoints

| Path | Description |
| --- | --- |
| `/` | Demo UI |
| `/api/headers` | JSON echo of IP-related headers, socket address and all headers |
| `/api/self-test` | Server calls itself with spoofed headers and returns sent vs received |
| `/healthz` | Health check |

## Run locally

```sh
npm install
npm run dev   # http://localhost:3000
```

## Deploy to Render

Push this repo to GitHub/GitLab, then in the Render Dashboard choose **New > Blueprint** and select the repo. `render.yaml` defines a free Node web service.

```sh
curl -s https://<your-service>.onrender.com/api/headers -H 'CF-Connecting-IP: 203.0.113.7'
curl -s https://<your-service>.onrender.com/api/headers -H 'True-Client-IP: 198.51.100.9'
curl -s https://<your-service>.onrender.com/api/headers -H 'X-Forwarded-For: 192.0.2.44'
```
