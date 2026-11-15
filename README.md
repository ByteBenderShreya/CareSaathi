# ❤️ CareSaathi

**Elder remains at the centre of their own healthcare decisions.**

CareSaathi is a family caregiving platform built for Catalyst Hackathon that solves the biggest gap in elder care - empowering elders, not replacing them.

### 🚀 Live Demo
https://care-saathi-two.vercel.app

### ✨ Key Features
- **👴 Elder Approval System:** Caretaker can only REQUEST edits, Elder APPROVES. Elder is the boss.
- **🚨 3-Level Missed Dose Escalation:** Level 1: Reminder to Elder → Level 2: Email to Caretaker → Level 3: SOS to Family Circle
- **📊 Weekly AI Report (Gemini):** Adherence % + missed summary + next appointments
- **👨‍👩‍👧 Family Circle Code:** One code to connect whole family, with Activity Log
- **📸 Prescription Scan (Gemini Vision):** Upload prescription, auto-add medicines
- **💊 Medicine & Appointment Manager:** Add / Edit / Delete with persistent data
- **🌐 Multilingual:** English, हिंदी, Hinglish

### 🛠️ Tech Stack
- React + Vite + Tailwind + Framer Motion
- Supabase (Auth, Database, Realtime)
- Gemini AI (Vision + Text)
- Vercel

### 🎯 Problem it Solves
60% elders miss medicines. Existing apps either isolate elders or let family take control. CareSaathi keeps family in loop but elder in control.

### 📱 How to Use
1. Create Circle as Elder → Get Circle Code
2. Family joins as Caretaker using Code
3. Track medicines, appointments, activity together

### ⚙️ Local Setup
1. git clone <repo-url>
2. npm install
3. Create .env from .env.example and add your keys
4. npm run dev

.env.example format:


### 🔒 Privacy and Safety
- .env is gitignored, only .env.example is committed
- Demo uses VITE_GEMINI_API_KEY on client for speed. For production, will move to Vercel serverless function /api/scan with HTTP referrer restriction.
- No secrets or node_modules committed

### 👩‍💻 Built for Catalyst Hackathon 2026