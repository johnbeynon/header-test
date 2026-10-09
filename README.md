# header-test

A small TypeScript service (no runtime dependencies) that shows what client IP headers actually contain once a request has passed through Render's edge:

- `X-Forwarded-For`
- `CF-Connecting-IP`
- `True-Client-IP`

## What the page shows

1. **Your normal request**: the headers the service receives for a plain request from your browser. This is your real IP.
2. **Spoof attempt from your browser**: your browser calls `/api/headers` with random fake IPs (from the RFC 5737 documentation ranges) in each header. The table compares what was sent with what was received. Behind Render, `CF-Connecting-IP` and `True-Client-IP` are overwritten with your real IP.
3. **Server-to-self spoof attempt**: the service calls its own public URL (`RENDER_EXTERNAL_URL`) with fake headers. The received values show Render's outbound IP, not the fake ones.

If you run it locally there's no edge proxy, so the spoofed values pass straight through. That's the contrast the demo is meant to show.

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
curl -s https://<your-service>.onrender.com/api/headers \
  -H 'CF-Connecting-IP: 203.0.113.7' \
  -H 'True-Client-IP: 198.51.100.9' \
  -H 'X-Forwarded-For: 192.0.2.44'
```
