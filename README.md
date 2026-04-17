# YU Assist

AI-powered chat assistant widget for Yeshiva University, deployed as a serverless application on Vercel.

## Project Structure

```
yuassist/
├── api/
│   └── chat-proxy.js      # Vercel serverless function (proxies to n8n)
├── public/
│   ├── index.html          # Chat widget UI
│   └── bot-logo.jpeg       # Bot avatar image
├── vercel.json             # Vercel routing & build config
├── package.json
└── .gitignore
```

## Environment Variables

Set these in the Vercel dashboard under **Settings → Environment Variables**:

| Variable             | Description                                     |
| -------------------- | ----------------------------------------------- |
| `N8N_WEBHOOK_URL`    | Your full n8n webhook URL                       |
| `N8N_WEBHOOK_SECRET` | The value sent in the `X-Webhook-Secret` header |

## Local Development

```bash
npm i -g vercel
vercel dev
```

## Deployment

```bash
vercel --prod
```
