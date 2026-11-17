# CraftMyFolio: turn a GitHub profile into a portfolio site

Type a GitHub username. CraftMyFolio pulls that profile and its repositories, uses Gemini to write the project descriptions, and builds a personal portfolio site from a template. You can then change the code in the browser and download it as a ZIP.

> **Status:** work in progress. Profile import, AI content, templates, the in-browser editor and the ZIP download work. One-click deploy and push-to-GitHub are mocked for now.

## What it does

- **GitHub import:** fetches a user's profile and public repositories through the GitHub API
- **AI-written content:** Gemini writes the bio and project descriptions from the repository data
- **Templates:** pick a starting design, or browse portfolios other people have made
- **Live code editor:** edit the generated HTML/CSS/JS in a Monaco editor with live preview
- **Download:** export the finished portfolio as a ZIP (JSZip)
- **Accounts:** email signup with an OTP sent by email (Nodemailer), plus login with JWT

## Tech stack

| Part | Built with |
|---|---|
| Frontend + API routes | Next.js (App Router), React, Tailwind CSS, Monaco Editor, JSZip |
| Auth service | Node.js, Express, JWT, bcrypt, Nodemailer |
| Data | MongoDB (users), JSON file store (portfolios) |
| AI | Google Gemini |
| External APIs | GitHub REST API |

## Run it locally

```bash
# Auth service
cd Backend
npm install
cp .env.example .env     # fill in the values
npm run dev              # http://localhost:5000

# Web app (new terminal)
cd frontend
npm install
npm run dev              # http://localhost:3000
```

`Backend/.env` (see `.env.example`) needs `MONGODB_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS` (a Gmail app password for the OTP emails) and `PORT`.

`frontend/.env.local` needs:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key
GITHUB_TOKEN=a-github-token-with-public-read-access
```

## Project structure

```
Backend/              Express auth service (signup, login, OTP)
frontend/app/         Next.js pages: create, templates, editor, preview, dashboard
frontend/app/api/     API routes for GitHub import, AI content, portfolios, download
frontend/utils/       Gemini prompts, portfolio generator, GitHub helpers
```

## What's next

- Move the Gemini call to the server so the API key is not shipped to the browser
- Real deploy to Vercel or GitHub Pages
- Remove the leftover `ui-backup/` and test HTML files

## Author

Built by [Varun Sharma](https://github.com/i-varunsharma).
