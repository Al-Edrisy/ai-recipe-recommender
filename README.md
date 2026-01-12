
# 🧠 AI Recipe Recommender

An AI-powered web app that recommends and generates recipes based on ingredients, diet, preferences, and goals. Built with **Turborepo**, **Next.js**, **Firebase**, and **OpenRouter** and **DeepSeek** models. Users can explore recipes, generate new ones with AI, or interact through a chat-based playground like OpenAI.

---

## ⚙️ Stack

- **LLM Provider**: OpenRouter (DeepSeek V3)
- **Frontend**: Next.js (App Router) + Tailwind CSS + shadcn/ui
- **Backend**: Node.js (Express) with Zod validation
- **Database**: Firestore (Firebase Admin SDK)
- **Authentication**: Firebase Auth (Email/Password + OAuth)
- **Monorepo**: Turborepo
- **UI Library**: shadcn/ui
- **Hosting**: Firebase Hosting / Vercel (optional)

---

## 🧩 Features

- 🧠 AI-based Recipe Generator
- 📋 Save to Personal Recipe
- 📦 Ingredient-Based Search
- 📖 Editable Recipes with Live Preview
- 🔐 Role-Based Access Control (User/Admin)


---

## 📁 Folder Structure

```

apps/
api/         → Express.js backend
web/         → Next.js frontend
docs/        → Documentation (optional)

packages/
types/       → Shared TypeScript types
schemas/     → Shared Zod schemas
ui/          → Shared UI components (shadcn based)
eslint-config/
typescript-config/

````

---

## 🔑 API Endpoints

### 🔄 Recipe Generation
- `POST /api/recipes/generate` – Generate a full recipe with AI
- `POST /api/recipes` – Create recipe (manual)
- `GET /api/recipes/:id` – Get single recipe
- `PUT /api/recipes/:id` – Update recipe
- `DELETE /api/recipes/:id` – Delete recipe

### 💬 Chat Playground
- `POST /api/chats` – Start new chat thread
- `POST /api/chats/:id/reply` – Send message + get AI response
- `GET /api/chats` – List all chats by user
- `GET /api/chats/:id` – Fetch a single chat

### 👤 User Management
- `GET /api/user-role/:uid` – Fetch user role
- `GET /api/user/:uid/history` – Get saved recipe history
- `POST /api/user/:uid/history` – Save recipe to history

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev environment with turborepo
npx turbo dev
````

---

## 🔐 Environment Variables

### 📦 `apps/api/.env`

```env
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...

OPENROUTER_API_KEY=...
SITE_URL=http://localhost:3000
```

### 🌐 `apps/web/.env`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🛠️ Dev Tips

* Use `zod` schemas from `packages/schemas` to validate any inputs across both backend and frontend.
* Use `@types/*` and `@schemas/*` aliases across the repo for consistent typing.
* Chat Playground is located at:
  `apps/web/app/(routes)/(playground)/page.tsx`

---

## 📘 Roadmap

* [x] Recipe Generation (AI)
* [x] Firebase Auth + Role-based Access
* [x] Chat Playground
* [ ] Nutrition facts breakdown (advanced)

---

## 🧑‍💻 Maintainers

* Al-Edrisy – [@aledrisy](https://github.com/aledrisy)

---

## 📄 License

MIT
