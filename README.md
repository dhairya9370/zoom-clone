# 🎥 Zoom Clone - Real-time Video Conferencing & Chat App

A full-stack real-time video conferencing application inspired by Zoom, built with **React**, **Node.js**, **Express**, **Socket.io**, **WebRTC**, and **MongoDB**.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=nodedotjs)
![Socket.io](https://img.shields.io/badge/Socket.io-v4-010101?logo=socketdotio)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)

---

## ✨ Features

- 🔐 **User Authentication**: Secure user registration and login powered by bcrypt password hashing and token management.
- 📹 **Real-Time Video & Audio Calls**: Low-latency video calling built with **WebRTC** peer-to-peer connections and **Socket.io** signaling.
- 🎙️ **Pre-Meeting Lobby**: Preview camera and microphone feeds, check media settings, and adjust audio/video before entering the meeting.
- ➕ **Instant Meeting Creation**: Generate unique meeting codes instantly to invite participants.
- 🚪 **Join via Meeting Code**: Seamlessly enter meetings using a shareable code.
- 💬 **Live In-Meeting Chat**: Real-time messaging and chat panel within active video calls.
- ⚙️ **Meeting Controls**: Mute/unmute microphone, enable/disable video camera, toggle screen sharing, and leave/end meeting.
- 📊 **User Dashboard & History**: Access recent meeting logs, view active profile info, and launch new sessions easily.
- 🎨 **Modern Responsive UI**: Dark mode glassmorphism interface built with CSS micro-animations and clean UI components.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 19 (Vite)
- **Routing**: React Router v7
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Real-Time Engine**: Socket.io Client
- **Styling**: Vanilla CSS (Custom Glassmorphism Design System)

### **Backend**
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5
- **Database**: MongoDB & Mongoose ORM
- **Signaling Server**: Socket.io
- **Security & Auth**: bcrypt

---

## 📁 Project Structure

```
zoom-clone/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── socketManager.js    # WebRTC signaling & Socket event handlers
│   │   │   └── user.controller.js  # User authentication & history logic
│   │   ├── models/                 # Mongoose schemas (User, Meeting)
│   │   ├── routes/                 # Express API routes
│   │   └── app.js                  # Express & Socket.io server entry point
│   ├── .env.example                # Template for environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI (Lobby, ActiveMeeting, Auth, Modals)
│   │   ├── pages/                  # Dashboard, LobbyPage, MeetingPage
│   │   ├── services/               # API client & backend service integration
│   │   ├── App.jsx                 # Routes & Navigation
│   │   └── main.jsx
│   └── package.json
│
├── .gitignore                      # Root gitignore excluding secrets & build outputs
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** instance (Local or MongoDB Atlas cluster)

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/dhairya9370/zoom-clone.git
cd zoom-clone
```

---

### 2️⃣ Backend Setup
Navigate to the `backend` folder, install dependencies, and setup your `.env`:

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` using `.env.example` as a template:
```env
PORT=2100
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/zoomclone?retryWrites=true&w=majority
```

Start the backend server:
```bash
npm run dev
```
> The server will start running on `http://localhost:2100`.

---

### 3️⃣ Frontend Setup
Open a new terminal, navigate to the `frontend` folder, and install dependencies:

```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```
> Open `http://localhost:5173` in your browser to view the application.

---

## 🌐 Deployment (Render)

### **Backend (Web Service)**
1. Create a new **Web Service** on Render connected to this repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Add your environment variables: `PORT` and `MONGODB_URI`.

### **Frontend (Static Site)**
1. Create a new **Static Site** on Render connected to this repository.
2. Set **Root Directory** to `frontend`.
3. Set **Build Command** to `npm install && npm run build`.
4. Set **Publish Directory** to `dist`.

---

## 📜 License

This project is open source and available under the [ISC License](LICENSE).
