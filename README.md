# ReviewShield AI 🛡️

### Advanced Fake Review Detection & Sentiment Intelligence platform driven by Gemini AI

ReviewShield AI is a state-of-the-art full-stack SaaS platform designed to audit product listings, isolate AI-generated feedback networks, block coordinated competitor negative smear campaigns, and distill complex buyer metrics into actionable product roadmap suggestions.

---

## 🚀 Key Architecture Dimension and Features

1. **Analytical Linguistic Parser (Gemini Engine)**:
   - Uses the official `@google/genai` TypeScript SDK on the server side to analyze text structures against 5 parameters: AI styling probability, sentiment score, fake-rating polarities mismatch, toxic intent, and key concepts.
   
2. **Bulk CSV Importer (Interactive Drag & Drop)**:
   - Supports dragging and dropping standard listing reviews CSV files. Parsed items are batched and verified in parallel.

3. **Product Reputational Grading Sheets (A, B, C, F)**:
   - Evaluates listing listings overall health score, average trust coefficient levels, and outputs aggregate highlights/complaints.

4. **Forensic Copilot Assistant**:
   - An interactive 24/7 AI risk analyst conversational assistant to walk e-commerce merchants through list optimizations.

5. **Integrated JWT Authentication**:
   - Standalone sessions checking login, user registration, and role privileges separation (User vs Moderator).

6. **Continuous event logger telemetry**:
   - Displays administrative action streams, metrics trends, and risk Calibrators controls within a dashboard pane.

---

## 🛠️ Technical Stack Breakdown

- **Frontend**: React 19, Vite, Tailwind CSS (v4 structure), Framer Motion, Recharts, Lucide Icons.
- **Backend Node Node**: Express, Node.js, tsx runtime compiler, esbuild bundling engine.
- **Intelligence Model**: Google GenAI (`gemini-3.5-flash` model instance).
- **Storage/DB**: File-system backed database node (creates dynamic records inside `/data/db.json` automatically).
- **Deployment & Containers**: Docker, multi-stage compilation Dockerfiles, Docker-Compose.

---

## ⚙️ Project Folder Directory Structures

```
├── data/
│   └── db.json              # File-backed local database with bootstrap datasets
├── src/
│   ├── components/
│   │   ├── LandingHero.tsx  # Dynamic introductory landing view with price sliders
│   │   ├── AnalyticsPanel.tsx # Recharts graphics dashboard stats cards
│   │   ├── ReviewAuditor.tsx  # Manual textbox submitter paired with CSV loaders
│   │   ├── ReviewHistory.tsx  # Interactive search history tables and details popups
│   │   ├── ProductInsightsList.tsx # Product Reputational grading panel and summaries
│   │   ├── CopilotAssistant.tsx  # Interactive AI Discussion chatbot
│   │   └── AdminPanel.tsx   # Sliders, API settings configure, and Live Logs stream
│   ├── App.tsx              # Core App router and system controllers
│   ├── types.ts             # Shared Types safe entities formats
│   ├── index.css            # Global CSS structures and animations keys
│   └── main.tsx             # React DOM bootstrap entry point
├── server.ts                # Express Node backend, Express API routing & production serving
├── Dockerfile               # High performance multi-stage Docker build
├── docker-compose.yml       # Docker orchestrator setup
├── requirements.txt         # Optional Python FastAPI package definitions
├── metadata.json            # Deployment configuration and frame permissions
└── package.json             # Build script, typescript compilations, and packages
```

---

## 💿 Standard Setup & Installation

### 1. Prerequisites
Verify that **Node.js 20+** and **npm** are active:
```bash
node -v
npm -v
```

### 2. Set Up Environment Variables
Create or update your `.env` configuration file:
```env
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```
*Note: In the AI Studio workspace, this is automatically configured on server-side actions.*

### 3. Install Dependencies
```bash
npm install
```

### 4. Boot Dev Environment (Express Server + Vite SPA Proxy)
```bash
npm run dev
```
The unified server will bind to port `3000`:
- Website address: `http://localhost:3000`

### 5. Production Compilations
Compile assets into minimized optimized blocks:
```bash
npm run build
```
Start the standalone productions server:
```bash
npm start
```

---

## 🐳 Docker Deployment

Compile and bind container clusters instantly using Docker:

```bash
# Build & Boot container service
docker-compose up --build -d

# Verify operational status
docker-compose ps
```
The website remains accessible at `http://localhost:3000`.

---

## 📊 Standard API Endpoints Schemas

### 1. Authentication
- `POST /api/auth/signup`: Create a standard user profile.
- `POST /api/auth/login`: Verify credentials security and receive JWT tokens.
- `GET /api/auth/me`: Check active user profiles metrics.

### 2. Review Forensics Analytical Pipeline
- `POST /api/reviews/analyze`: Core API taking an array of reviews, querying Gemini with our system instructions and returning detailed classifications.
- `POST /api/reviews/summarize`: Bulk summary report pipeline extracting complaints and highlights cards.
- `GET /api/reviews/history`: Paginated search query filters to browse history databases.
- `DELETE /api/reviews/:id`: PURGE suspicious records (restricted administrative clearance).

### 3. Reputation & Copilot
- `GET /api/insights/products`: Returns overall reputation grade charts grouped by SKU.
- `POST /api/chat`: Handles active user queries relative to platform metrics.

### 4. Administration Logs
- `GET /api/admin/stats`: Unified pie distributions and risk averages.
- `GET /api/admin/logs`: Access the latest 50 security telemetry logging codes.

---

## 🛡️ Forensic Calibration Policies

- **Strict**: Triggers alert verification codes even on minor language superlatives. Recommended during periods of heavy competitor launch activities.
- **Moderate**: Standard baseline filtering. Best-in-class accuracy balance minimizing rating mismatch false alerts.
- **Relaxed**: Flags only when severe automated stylistic phrasing matches hostile competitive slur words.

---

## 📧 Support & Contributions

Developed by Senior Software Architect and Startup product developer. For direct integration inquiries or agency support, contact:
- **Developer Account**: [sjagrit2005@gmail.com](mailto:sjagrit2005@gmail.com)
- **Framework Host**: AI Studio Sandbox, Cloud Run Container Deployments.

## 🔁 Deploying Directly to Vercel (from local machine)

You can deploy this project straight to Vercel without using GitHub by using the Vercel CLI. A convenience script is included at `scripts/deploy_vercel.sh`.

Quick steps:

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Authenticate:

```bash
vercel login
```

3. Add your Gemini API key (production & preview):

```bash
vercel env add GEMINI_API_KEY production
vercel env add GEMINI_API_KEY preview
```

4. Deploy to production:

```bash
vercel --prod
```

Or run the helper script:

```bash
chmod +x scripts/deploy_vercel.sh
./scripts/deploy_vercel.sh
```

Notes:
- `vercel login` is interactive and requires your credentials — I cannot perform this step for you.
- Do not commit secrets like `GEMINI_API_KEY` to the repository. Use Vercel environment variables.

