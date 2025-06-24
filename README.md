
# 🧠 AI Recipe Recommender

An AI-powered web app that suggests recipes based on ingredients using Hugging Face’s DeepSeek model. Built with Turborepo, Node.js, Next.js, and Firebase.

## ⚙️ Stack

- Hugging Face (DeepSeek)
- Node.js (Express API)
- Next.js (Frontend)
- Firebase Admin (Auth & DB)
- Turborepo (Monorepo)

## 🔑 Endpoints

- `POST /api/recommend` – Generate recipe
- `GET /user-role/:uid` – Get user role
- `POST /user/:uid/history` – Save recipe
- `GET /user/:uid/history` – Fetch history

## 🚀 Setup

```bash
npm install
npx turbo dev
````

## 🔐 Env

Add `.env` files in `apps/api` and `apps/web` with Firebase + Hugging Face keys.

```

