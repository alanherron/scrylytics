# 🔮 Scrylytics

**Where magic meets machine learning.**  
Scrylytics is an AI-powered analytics and deck optimization platform for collectible card games — starting with **Hearthstone** and **Magic: The Gathering**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Cloudflare](https://img.shields.io/badge/Cloudflare-CDN-orange?logo=cloudflare)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

---

## ✨ Features

| Module | Description |
|---------|-------------|
| 🧙‍♂️ **Decklytics** | AI deck analyzer — grades, synergies, and optimization suggestions. ✅ |
| 🎴 **Multi-Game Support** | Hearthstone & Magic: The Gathering with card images | ✅ |
| ⚔️ **Playlytics** | Game simulation and matchup testing. |
| 📊 **Metalyzer** | Meta tracking and statistical reports across formats. |
| 🔥 **Forge** | Intelligent deck builder powered by generative AI. |
| 🤖 **Coach AI** | Personalized insights and guided improvements for your decks. |

---

## 🚀 **Status: DevOps Pipeline Active**

✅ **Automated Deployments**: GitHub Actions + Vercel
✅ **Branch Protection**: main & develop branches protected (2 reviews required)
✅ **Smart Deployments**: Skip logic for docs-only changes
✅ **Live Site**: [scrylytics.com](https://www.scrylytics.com)
✅ **Security**: Linear history, conversation resolution, admin enforcement
✅ **Testing**: Deployment verification in progress

---

## 🧱 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) + React 19  
- **Hosting:** [Vercel](https://vercel.com) (global edge network)  
- **DNS / CDN:** [Cloudflare](https://cloudflare.com)  
- **Styling:** TailwindCSS + ShadCN UI  
- **Charts:** Recharts / D3.js  
- **AI Layer:** OpenAI / Local Model adapters  
- **Data Sources:** Official APIs + HearthstoneJSON + Scryfall  

---

## ⚙️ Getting Started

### 1️⃣ Clone the repo
```bash
git clone https://github.com/<your-username>/scrylytics.git
cd scrylytics
```

### 2️⃣ Set up CI/CD (Automated)
```bash
# Run the automated setup script
bash scripts/setup-ci-cd.sh
```

This will configure:
- ✅ GitHub branch protection for `main` and `develop`
- ✅ Automated Vercel deployments with skip logic
- ✅ CI/CD workflows and rules

### 3️⃣ Manual Setup (Alternative)
If you prefer manual setup, see [CI/CD Setup Guide](docs/ci-cd-setup.md)
