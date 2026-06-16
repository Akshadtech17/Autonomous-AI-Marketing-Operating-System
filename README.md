# Lost In Frame Production
### Autonomous AI Marketing Operating System

**Live Web App:** [https://lost-in-frame-production.netlify.app/](https://lost-in-frame-production.netlify.app/)

A production-grade, multi-agent AI marketing platform that operates like a real marketing agency. Submit a campaign brief, and a coordinated team of AI agents autonomously plans, researches, writes content, builds social strategy, analyses performance, and generates a full executive PDF report — all in real time.

---

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [AI Agent Pipeline](#ai-agent-pipeline)
4. [State Machine](#state-machine)
5. [Tech Stack](#tech-stack)
6. [AI Models](#ai-models)
7. [File Structure](#file-structure)
8. [API Reference](#api-reference)
9. [WebSocket Events](#websocket-events)
10. [Setup & Running](#setup--running)
11. [Environment Variables](#environment-variables)

---

## Overview

Lost In Frame Production is a **distributed multi-agent AI system** where seven specialized AI agents collaborate on a deterministic DAG (Directed Acyclic Graph) execution plan. Each agent runs sequentially, passes context forward, and the system tracks every state transition in a persistent database. The React frontend visualizes the running pipeline in real time via WebSocket, including a 3D agent-node graph rendered with React Three Fiber.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        React + Vite Frontend                        │
│  Dashboard │ Campaigns │ Live Monitor │ Analytics │ Reports         │
│  React Three Fiber 3D Graph │ Recharts │ Framer Motion │ Zustand    │
└────────────────────────┬────────────────────────────────────────────┘
                         │  HTTP (REST) + WebSocket
┌────────────────────────▼────────────────────────────────────────────┐
│                      FastAPI Backend  :8000                         │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  ┌───────────┐  │
│  │  campaign   │  │    agent     │  │  report   │  │ websocket │  │
│  │   router    │  │   router     │  │  router   │  │  router   │  │
│  └──────┬──────┘  └──────────────┘  └───────────┘  └─────┬─────┘  │
│         │                                                 │        │
│  ┌──────▼──────────────────────────────────────────────────────┐   │
│  │                   Campaign Worker (asyncio queue)            │   │
│  └──────────────────────┬───────────────────────────────────────┘  │
│                         │                                          │
│  ┌──────────────────────▼───────────────────────────────────────┐  │
│  │                   Workflow Engine                            │  │
│  │  StateMachine ──► DAGEngine ──► Agent Executor              │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
│                         │                                          │
│  ┌──────────────────────▼───────────────────────────────────────┐  │
│  │              7 Specialized AI Agents                         │  │
│  │  CEO ► Research ► SEO ► Content ► Social ► Analytics        │  │
│  │  ► Creative Director ► Report                                │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
│                         │                                          │
│  ┌──────────────────────▼───────────────────────────────────────┐  │
│  │   PostgreSQL DB   │   Memory Manager   │  Event Emitter      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────────┐
│                    Groq API (cloud)                                  │
│            llama-3.3-70b-versatile — free tier                      │
│            30 req/min · 14,400 req/day                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## AI Agent Pipeline

Agents execute in a strict DAG — each receives the outputs of all previous agents as context.

```
Campaign Brief
     │
     ▼
┌──────────┐
│  CEO     │  Plans the campaign DAG, sets execution order
└────┬─────┘
     │
     ▼
┌──────────────┐
│  Research    │  Market analysis, competitor landscape, audience insights
└────┬─────────┘
     │
     ▼
┌──────────┐
│   SEO    │  Keyword strategy, search intent mapping, on-page recommendations
└────┬─────┘
     │
     ▼
┌──────────────┐
│  Content     │  Content calendar, blog/email/ad copy strategy
└────┬─────────┘
     │
     ▼
┌──────────────┐
│   Social     │  Platform selection, posting frequency, sample posts, paid split
└────┬─────────┘
     │
     ▼
┌──────────────┐
│  Analytics   │  KPI framework, traffic forecasts, ROI estimates, tracking tools
└────┬─────────┘
     │
     ▼
┌─────────────────────┐
│  Creative Director  │  Brand positioning, visual identity, campaign big idea
└────┬────────────────┘
     │
     ▼
┌──────────┐
│  Report  │  Executive PDF report — summary, priorities, 90-day plan, ROI
└──────────┘
```

Each agent outputs a validated JSON payload (`AgentOutput`) with:
- `output` — the main analysis text
- `key_insights` — top 3 bullet points
- `confidence_score` — 0.0–1.0
- `dependencies` — upstream agents relied on
- `memory_updates` — data written to shared memory

---

## State Machine

Campaigns follow a strict, validated state machine. Illegal transitions raise a `StateTransitionError` and halt the campaign.

```
CREATED
  │
  ▼
PLANNING
  │
  ▼
RUNNING_RESEARCH
  │
  ▼
RUNNING_SEO
  │
  ▼
RUNNING_CONTENT
  │
  ▼
RUNNING_SOCIAL
  │
  ▼
RUNNING_ANALYTICS
  │
  ▼
REVIEW
  │
  ▼
REPORT_GENERATION
  │
  ▼
COMPLETED
  │
  └──► FAILED  (from any state on error)
```

---

## Tech Stack

### Backend
| Component | Technology |
|---|---|
| API Framework | FastAPI 0.115 |
| ASGI Server | Uvicorn (with standard extras) |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL (production) / SQLite (local) |
| Validation | Pydantic v2 |
| HTTP Client | HTTPX (async) |
| WebSocket | FastAPI WebSocket + asyncio |
| PDF Generation | ReportLab 4.2 |
| Async Queue | Python asyncio.Queue (campaign worker) |
| LLM | Groq API (`llama-3.3-70b-versatile`) |

### Frontend
| Component | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| 3D Visualization | React Three Fiber + Drei |
| State Management | Zustand 5 |
| Server State | TanStack React Query v5 |
| Charts | Recharts 2 |
| Animations | Framer Motion 11 |
| Styling | Tailwind CSS 3 + PostCSS |
| Icons | Lucide React |
| Routing | React Router v6 |
| Date Utilities | date-fns |

### Deployment
| Component | Platform |
|---|---|
| Frontend | Netlify |
| Backend | Render |
| Database | Render PostgreSQL |
| LLM Inference | Groq (free tier) |

---

## AI Models

The system uses the **Groq API** for fast, free LLM inference — no local GPU or Ollama required.

| Role | Model | Notes |
|---|---|---|
| All agents | `llama-3.3-70b-versatile` | Free: 30 req/min, 14,400 req/day |

To switch models, set the `GROQ_MODEL` environment variable to any model supported by Groq (e.g. `llama-3.1-8b-instant` for faster/lighter inference).

### LLM Integration Details
- **Provider:** [Groq](https://console.groq.com)
- **Client:** `groq.AsyncGroq` (async Python SDK)
- **Max tokens:** 2048
- **Retries:** Configurable via `MAX_RETRIES` (default: 2) with exponential backoff
- **JSON repair:** On JSON parse failure, agents auto-repair truncated responses by closing open brackets/braces
- **Fallback:** On JSON parse failure, agents return a safe minimal `AgentOutput` instead of crashing the workflow

---

## File Structure

```
Lost In Frame Production/
├── .gitignore
├── README.md
├── render.yaml                      # Render deployment config
├── netlify.toml                     # Netlify build config
├── start.bat                        # Windows one-click launcher
├── start.sh                         # Unix one-click launcher
│
├── backend/
│   ├── main.py                      # FastAPI app entry point, lifespan, middleware
│   ├── config.py                    # Pydantic settings (env vars, model names)
│   ├── database.py                  # SQLAlchemy engine, session factory, init_db
│   ├── requirements.txt             # Python dependencies
│   │
│   ├── agents/                      # AI agent implementations
│   │   ├── base_agent.py            # Abstract base: execute(), _build_prompt(), _fallback_output()
│   │   ├── ceo_agent.py             # Campaign planner — builds the DAG execution plan
│   │   ├── research_agent.py        # Market research, competitor analysis
│   │   ├── seo_agent.py             # Keyword strategy, search intent
│   │   ├── content_agent.py         # Content calendar, copy strategy
│   │   ├── social_agent.py          # Social media platforms, posting schedule
│   │   ├── analytics_agent.py       # KPIs, tracking, ROI forecasts
│   │   ├── creative_agent.py        # Brand identity, visual direction
│   │   └── report_agent.py          # Executive report compiler
│   │
│   ├── api/                         # FastAPI routers
│   │   ├── campaign_router.py       # POST /campaign/create, POST /{id}/run, GET /{id}/status
│   │   ├── agent_router.py          # GET /agents/ — agent definitions & capabilities
│   │   ├── report_router.py         # GET /report/{id} — download PDF report
│   │   └── websocket_router.py      # WS /ws/campaign/{id}, WS /ws/global
│   │
│   ├── core/                        # Framework internals
│   │   ├── dag_engine.py            # DAG builder, topological sort, cycle detection
│   │   ├── state_machine.py         # Campaign state machine + VALID_TRANSITIONS
│   │   └── event_emitter.py         # Async event bus → WebSocket broadcast
│   │
│   ├── models/                      # SQLAlchemy ORM models
│   │   ├── campaign.py              # Campaign table + CampaignStatus enum
│   │   ├── agent_log.py             # Per-agent execution log (state, output, duration)
│   │   └── memory_store.py          # Persistent key-value memory store
│   │
│   ├── orchestrator/
│   │   └── workflow_engine.py       # Core orchestrator: runs campaigns, drives state machine
│   │
│   ├── schemas/                     # Pydantic v2 request/response schemas
│   │   ├── agent.py                 # AgentOutput (with coercion validators), AgentLogResponse
│   │   ├── campaign.py              # CampaignCreate, CampaignResponse, CampaignSummary
│   │   └── event.py                 # SystemEvent, EventType enum
│   │
│   ├── services/
│   │   └── ollama_service.py        # Groq API client, JSON extraction, truncation repair
│   │
│   ├── memory/
│   │   └── memory_manager.py        # Stores/retrieves agent outputs from DB for context
│   │
│   ├── workers/
│   │   └── campaign_worker.py       # asyncio.Queue consumer — runs campaigns off the API thread
│   │
│   └── reports/
│       ├── pdf_generator.py         # ReportLab PDF builder
│       └── output/                  # Generated PDF reports (git-ignored)
│
└── frontend/
    ├── index.html
    ├── vite.config.ts               # Vite + regex proxy rules (avoids /campaigns/ collision)
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── package.json
    │
    └── src/
        ├── main.tsx                 # React root, QueryClient, Router
        ├── App.tsx                  # Route definitions
        ├── index.css                # Tailwind directives + global styles
        │
        ├── pages/
        │   ├── Dashboard.tsx        # Overview stats, recent campaigns
        │   ├── Campaigns.tsx        # Campaign list + create form
        │   ├── CampaignDetail.tsx   # Live campaign status, agent cards, outputs
        │   ├── LiveMonitor.tsx      # Real-time event feed + 3D agent graph
        │   ├── Analytics.tsx        # Recharts performance charts
        │   └── Reports.tsx          # PDF report download
        │
        ├── components/
        │   ├── campaign/
        │   │   ├── CampaignForm.tsx       # Create campaign form
        │   │   └── AgentStatusCard.tsx    # Per-agent status + output card
        │   ├── layout/
        │   │   ├── Header.tsx             # Top nav bar
        │   │   └── Sidebar.tsx            # Left navigation
        │   └── live/
        │       └── EventFeed.tsx          # Scrolling real-time event log
        │
        ├── three/
        │   └── SystemVisualization.tsx   # React Three Fiber 3D agent node graph
        │
        ├── hooks/
        │   └── useWebSocket.ts           # Auto-reconnect WebSocket hook
        │
        ├── services/
        │   ├── api.ts                    # Axios/fetch wrappers for REST API
        │   └── websocket.ts              # WebSocket client with per-campaign subscriptions
        │
        └── store/
            └── campaignStore.ts          # Zustand global store (campaigns, agent progress, events)
```

---

## API Reference

### Campaigns
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/campaign/create` | Create a new campaign |
| `POST` | `/campaign/{id}/run` | Queue campaign for execution |
| `GET` | `/campaign/{id}/status` | Full campaign status + agent outputs |
| `GET` | `/campaign/{id}/logs` | Per-agent execution logs |
| `GET` | `/campaign/` | List all campaigns |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/report/{campaign_id}` | Download PDF executive report |

### WebSocket
| Endpoint | Description |
|---|---|
| `WS /ws/campaign/{id}` | Campaign-specific real-time events |
| `WS /ws/global` | All events across all campaigns |

### Create Campaign — Request Body
```json
{
  "business_name": "Acme Coffee",
  "industry": "Food & Beverage",
  "location": "Melbourne, Australia",
  "goal": "Increase online sales by 30% in 90 days",
  "target_audience": "Coffee enthusiasts aged 25-40",
  "budget": "$5000"
}
```

---

## WebSocket Events

Events are JSON objects emitted over WebSocket as each agent progresses:

```json
{
  "type": "AGENT_UPDATED",
  "campaign_id": "uuid",
  "agent": "research_agent",
  "state": "COMPLETED",
  "progress": 100,
  "message": "research_agent completed",
  "data": { "confidence_score": 0.85 },
  "timestamp": "2026-06-16T10:14:00Z"
}
```

Event types: `CAMPAIGN_CREATED`, `STATE_CHANGED`, `AGENT_UPDATED`, `AGENT_FAILED`, `REPORT_GENERATED`

---

## Setup & Running

### Prerequisites
- Python 3.11+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### 1. Backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Create a .env file (see Environment Variables below)
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Open the app
```
http://localhost:5173
```

> **Windows shortcut:** Run `start.bat` to launch everything in separate terminal windows.

---

## Environment Variables

Create a `.env` file inside `backend/`:

```env
# Groq LLM API (get free key at console.groq.com)
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

# Database (defaults to SQLite locally)
DATABASE_URL=sqlite:///./lif_production.db

# Logging
LOG_LEVEL=INFO
MAX_RETRIES=2
```

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| Groq API (cloud) over local Ollama | Render deployment cannot run persistent local processes; Groq provides free, fast inference with no infrastructure overhead |
| PostgreSQL on Render, SQLite locally | WAL-mode SQLite is zero-ops for local dev; PostgreSQL handles concurrent writes in production |
| `flag_modified()` on JSON columns | SQLAlchemy doesn't detect in-place dict mutations; reassignment + flag forces change tracking |
| asyncio.Queue worker | Decouples campaign execution from the HTTP request; prevents API timeouts on long runs |
| Regex Vite proxy keys | Prevents `/campaign/` prefix-matching `/campaigns/` (Vite's default string matching is prefix-based) |
| JSON repair algorithm | LLMs occasionally hit token limits mid-JSON; bracket-stack repair closes unclosed objects |
| Pydantic `mode="before"` validators | Models return dicts where strings are expected; coerce at the boundary instead of crashing |
| Deterministic DAG | Topological sort guarantees every agent receives all upstream context; cycle detection prevents deadlocks |

---

## License

MIT — built for the Lost In Frame Production project.
