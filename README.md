# Motorcycle Repair POS

Small static POS prototype for a motorcycle repair shop. Built with plain HTML, CSS, and JavaScript. State is persisted to `localStorage` for quick local usage.

Run locally

1. Open a terminal in this folder and run a simple HTTP server:

```bash
python -m http.server 8000
# then open http://127.0.0.1:8000/pos.html in your browser
```

Deployment (Netlify)

- Option A — Quick (recommended): Connect a GitHub repo to Netlify and deploy from the `main` branch. No build command required — publish directory is the project root (`/`).
- Option B — Drag & drop: Zip the site files and drag them into Netlify Sites → "Add new site" → "Deploy manually".

Pushing to GitHub

1. Create a new empty repository on your GitHub account.
2. In this folder run:

```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

Notes

- This is a static site — no server is required for core functionality.
- For multi-user/shared data, consider syncing the data to Google Sheets or adding a small backend.
