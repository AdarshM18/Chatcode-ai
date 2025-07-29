# Chatcode-ai
This project uses Google's Gemini API to enable real-time AI assistance in the code editor. The AI can generate code, create server routes, and respond to developer prompts within a shared chat interface.

An AI-powered chat platform for writing, testing, and explaining code collaboratively in real-time.

## 🚀 Features

* 🧠 AI assistant for generating and explaining code
* 🗨️ Real-time multi-user chat & collaboration
* 💡 Syntax highlighting for popular languages

## 📦 Tech Stack

* **Frontend:** React, TailwindCSS, Vite
* **Backend:** Node.js, Express, Socket.IO
* **Database:** MongoDB
* **AI Integration:** Google Gemini

## 🛠️ Setup Instructions

💡 Note: If you encounter Redis-related errors like connect ECONNREFUSED 127.0.0.1:6379, it's likely because Redis isn't running on your Windows machine.

✅ As an alternative, you can start Redis inside WSL/Ubuntu with:

sudo service redis-server start

This is helpful especially if Redis is not available or unstable on your native Windows environment.

```bash
# Clone the repository
git clone https://github.com/AdarshM18/Chatcode-ai.git
cd Chatcode-ai

# Install dependencies for frontend and backend
cd frontend
npm install
cd ../backend
npm install

# Start the development servers
cd backend
npx nodemon

# In another terminal, start the frontend (Vite dev server)
cd frontend
npm run dev
```

> ⚠️ Make sure to create a `.env` file in the backend directory if environment variables (e.g., MongoDB URI or API keys) are required.
