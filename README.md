# Lost In Frame Production: An Autonomous Multi-Agent AI Marketing Operating System

---

## Abstract

Lost In Frame Production is a production-grade, autonomous AI marketing operating system that orchestrates a coordinated pipeline of eight specialized language-model agents to generate complete, multi-channel marketing strategies from a single campaign brief. The system accepts a minimal structured input — business name, industry, geographic location, campaign goal, target audience, and budget — and autonomously executes a Directed Acyclic Graph (DAG) of agent tasks covering market research, SEO strategy, content planning, social media management, analytics framework design, creative direction, and executive report compilation. Agent outputs are propagated downstream as shared context through a database-backed memory layer, ensuring each specialist agent builds upon all prior work. The completed strategy is compiled into a professionally formatted PDF report and delivered via a React-based dashboard that visualizes pipeline execution in real time through WebSocket event streaming and an interactive 3D agent-network graph rendered with WebGL. The system is deployed on Render (backend) and Netlify (frontend) with Groq cloud inference for low-latency LLM calls, requiring no local GPU infrastructure.

---

## 1. Introduction

### 1.1 Problem Statement

Small and mid-sized businesses frequently lack the marketing expertise, budget, and internal headcount required to develop comprehensive, multi-channel marketing strategies. Engaging a full-service marketing agency typically costs thousands of dollars per engagement and requires weeks of back-and-forth communication before a deliverable is produced. Existing AI writing tools provide isolated content generation but do not coordinate across marketing disciplines — SEO strategy, social media planning, analytics frameworks, creative direction, and executive synthesis each remain separate concerns that must be manually integrated by a human strategist.

### 1.2 Motivation

The emergence of fast, low-cost LLM inference APIs (notably Groq's hosted inference tier) and advances in multi-agent orchestration patterns create an opportunity to automate the entire marketing strategy lifecycle within a single system. Rather than using a single generalist prompt, a coordinated hierarchy of specialist agents — each deeply primed for one marketing domain — can produce output of sufficient breadth and depth to serve as a professional-grade deliverable.

### 1.3 Objective

This project demonstrates that a structured DAG of LLM agents, combined with a strict state machine, a database-backed memory layer, and real-time event broadcasting, can autonomously generate integrated marketing strategies indistinguishable in scope from those produced by a human agency team, at a fraction of the cost and time.

---

## 2. Methodology

### 2.1 Multi-Agent Architecture

The system is organized around a hierarchical agent model. A CEO Agent acts as the top-level orchestrator: it receives the campaign brief, calls the Groq LLM to generate a strategic plan, and constructs a DAG execution plan specifying which specialist agent to invoke at each step and in what order. The CEO Agent then drives the execution of seven downstream specialist agents:

1. **Research Agent** — Market analysis, competitor landscape, audience psychographics.
2. **SEO Agent** — Keyword clusters, search intent mapping, on-page and local SEO recommendations.
3. **Content Agent** — Editorial calendar themes, blog topics, email sequence strategy, brand voice.
4. **Social Media Agent** — Platform selection, posting frequency, sample content, paid social budget allocation.
5. **Analytics Agent** — KPI framework, tracking tool recommendations, 90-day traffic forecasts, ROI projections.
6. **Creative Director Agent** — Brand positioning, visual identity palette, tone of voice, campaign big idea.
7. **Report Agent** — Executive synthesis of all prior outputs into a 90-day action plan and executive summary.

### 2.2 DAG Execution and Topological Ordering

The `DAGEngine` constructs an execution plan represented as a set of nodes (one per agent task) and directed edges encoding inter-agent dependencies. A Kahn's-algorithm topological sort resolves execution levels; agents within the same level may theoretically run concurrently, while agents at later levels are blocked until all dependencies reach the `COMPLETED` state. In the current sequential implementation, the DAG produces a single ordered list corresponding to the natural pipeline order. A cycle detection pass validates the plan before execution begins.

### 2.3 State Machine

Campaign lifecycle is governed by a finite state machine with eleven states: `CREATED`, `PLANNING`, `RUNNING_RESEARCH`, `RUNNING_SEO`, `RUNNING_CONTENT`, `RUNNING_SOCIAL`, `RUNNING_ANALYTICS`, `REVIEW`, `REPORT_GENERATION`, `COMPLETED`, and `FAILED`. A `VALID_TRANSITIONS` dictionary defines the only permitted state edges. Illegal transitions raise a `StateTransitionError` that immediately halts the campaign and persists the error to the database, preventing silent corruption of campaign state.

### 2.4 Memory and Context Propagation

A `MemoryManager` class wraps the SQLAlchemy session and provides typed read/write access to a `MemoryStore` table keyed by `(campaign_id, memory_type, key)`. Three memory scopes are supported: `GLOBAL` (shared across campaigns), `BUSINESS` (per-campaign profile data), and `SESSION` (per-agent outputs within a single campaign run). Before invoking each specialist agent, the system builds a context payload containing the full campaign brief plus all prior agent outputs stored in `SESSION` memory, injecting this context into the agent's prompt as structured text.

### 2.5 Prompt Engineering and JSON Repair

Each agent class inherits from `BaseAgent`, which implements a standardized prompt template requiring agents to return only a valid JSON object with fields: `output`, `key_insights`, `confidence_score`, `dependencies`, and `memory_updates`. The `OllamaService` (Groq API wrapper) attempts JSON extraction through four successive strategies: direct parse, regex object extraction, markdown code-block extraction, and a bracket-stack repair algorithm that closes truncated JSON objects caused by max-token cutoff. If all strategies fail, agents return a safe fallback `AgentOutput` rather than raising an exception, ensuring pipeline continuity.

### 2.6 Real-Time Event Broadcasting

An `EventEmitter` singleton maintains per-campaign and global WebSocket connection sets. As each agent starts and completes, the `WorkflowEngine` emits typed `SystemEvent` objects (`AGENT_UPDATE`, `STATE_CHANGED`, `CAMPAIGN_CREATED`, `AGENT_FAILED`) that are immediately broadcast to all subscribed WebSocket clients. An in-memory history buffer of up to 200 events per campaign is replayed to newly connecting clients, ensuring late joiners receive the full execution timeline.

### 2.7 Asynchronous Campaign Worker

Campaign execution is decoupled from the HTTP request lifecycle through an `asyncio.Queue`-based worker. When the `POST /campaign/{id}/run` endpoint is called, the campaign ID is enqueued and the HTTP response returns immediately with HTTP 202. The background worker dequeues campaign IDs and spawns `asyncio.create_task` coroutines that drive the `WorkflowEngine` to completion, preventing API gateway timeouts on long-running campaigns.

---

## 3. Literature Survey

### 3.1 Multi-Agent LLM Systems

The concept of decomposing complex tasks across a network of collaborating language model agents has been explored extensively in recent literature. Park et al. (2023) introduced "Generative Agents" [1], demonstrating that multiple LLM instances with distinct personas and memory can simulate coherent social behavior. Wu et al. (2023) proposed AutoGen [2], a framework for multi-agent conversation patterns where agents negotiate, critique, and refine each other's outputs. This project adopts a pipeline rather than a dialogue pattern: agents execute sequentially with strict output contracts, prioritizing determinism and auditability over emergent agent conversation.

### 3.2 DAG-Based Orchestration

LangChain [3] and LlamaIndex [4] provide general-purpose agent orchestration primitives including sequential chains and routing logic. The present system implements its own lightweight DAG engine rather than adopting these frameworks in order to maintain full observability of state transitions and avoid abstraction overhead that complicates debugging in production. The topological sort approach is standard in task scheduling literature [5] and is validated against cyclic graph inputs before execution.

### 3.3 Marketing Automation Systems

Traditional marketing automation platforms such as HubSpot [6] and Marketo [7] provide workflow automation for campaign scheduling, email sequencing, and CRM integration, but do not perform strategic content generation or market analysis. AI-adjacent tools such as Jasper and Copy.ai focus on single-turn content generation without cross-domain coordination. This system differentiates by integrating strategy, research, creative direction, and analytics into a single autonomous pipeline.

### 3.4 LLM Inference APIs

OpenAI's GPT-4 API [8] established the modern pattern of hosted LLM inference with a JSON-friendly chat completions interface. Groq [9] provides ultra-low-latency inference for open-weight models (LLaMA 3, Qwen3) via custom Language Processing Units (LPUs), offering free-tier access suitable for development and small-scale production. The system uses `llama-3.3-70b-versatile` via Groq's `AsyncGroq` Python SDK, configured with exponential-backoff retry logic for transient API failures.

### 3.5 WebGL-Based Data Visualization

React Three Fiber [10] provides a React declarative abstraction over the Three.js WebGL library [11], enabling 3D agent network graphs with animated data-flow particles to be embedded directly in the React component tree. The Drei helper library [12] supplies pre-built primitives (Sphere, Line, Text, OrbitControls) used in the agent network visualization.

---

## 4. Implementation

### 4.1 Technology Stack

#### 4.1.1 Backend

| Component            | Technology                                          |
|----------------------|-----------------------------------------------------|
| API Framework        | FastAPI 0.115                                       |
| ASGI Server          | Uvicorn 0.30 (with standard extras)                 |
| ORM                  | SQLAlchemy 2.0                                      |
| Database             | PostgreSQL (production) / SQLite with WAL (local)   |
| Data Validation      | Pydantic v2 + pydantic-settings                     |
| LLM Client           | Groq AsyncGroq SDK (`llama-3.3-70b-versatile`)      |
| PDF Generation       | ReportLab 4.2                                       |
| Async Task Queue     | Python `asyncio.Queue`                              |
| HTTP Client          | HTTPX 0.27 (async)                                  |
| WebSocket            | FastAPI native WebSocket + asyncio                  |
| Settings Management  | pydantic-settings with `.env` file loading          |

#### 4.1.2 Frontend

| Component            | Technology                                          |
|----------------------|-----------------------------------------------------|
| Framework            | React 18 + TypeScript                               |
| Build Tool           | Vite 5                                              |
| 3D Visualization     | React Three Fiber 8 + Drei 9 + Three.js 0.169       |
| State Management     | Zustand 5                                           |
| Server State         | TanStack React Query v5                             |
| Charts               | Recharts 2                                          |
| Animations           | Framer Motion 11                                    |
| Styling              | Tailwind CSS 3 + PostCSS                            |
| Icons                | Lucide React                                        |
| Routing              | React Router v6                                     |
| Date Utilities       | date-fns 3                                          |

#### 4.1.3 Deployment

| Layer                | Platform                                            |
|----------------------|-----------------------------------------------------|
| Backend API          | Render (Python web service, free tier)              |
| Frontend SPA         | Netlify (static hosting, `frontend/dist`)           |
| Database             | Render PostgreSQL (free tier)                       |
| LLM Inference        | Groq cloud API (30 req/min, 14,400 req/day)         |

### 4.2 Key Modules

#### 4.2.1 `backend/agents/base_agent.py`

Defines the abstract `BaseAgent` class with a concrete `execute()` method. All specialist agents inherit this class and override only `name`, `role`, `system_prompt`, and optionally `_build_prompt()`. The base implementation handles LLM invocation, JSON extraction with multi-strategy repair, output validation with safe defaults, and structured logging including per-agent execution duration and confidence score.

#### 4.2.2 `backend/agents/ceo_agent.py`

The `CEOAgent` is the only agent not derived from `BaseAgent`. It owns instances of all seven specialist agents and implements two phases: `plan()` (calls the LLM to generate a strategic summary and constructs a `DAGExecutionPlan`) and `orchestrate()` (iterates over DAG execution levels, invokes each specialist agent, and fires start/complete/failed callbacks consumed by the `WorkflowEngine`). The CEO Agent does not itself produce marketing content; its sole output is orchestration control and strategic framing injected into the research task node.

#### 4.2.3 `backend/core/dag_engine.py`

`DAGEngine.build_plan()` constructs a `DAGExecutionPlan` from the fixed `AGENT_SEQUENCE` list, assigning each task node a single predecessor dependency (forming a strict linear chain). The `_topological_sort()` method implements Kahn's BFS algorithm over the dependency graph, returning a list of execution levels. `_validate_dag()` checks all dependency references resolve to known task IDs. The `NodeStatus` enum (`PENDING`, `READY`, `RUNNING`, `COMPLETED`, `FAILED`, `SKIPPED`) tracks per-node execution state.

#### 4.2.4 `backend/core/state_machine.py`

`StateMachine` wraps the current `CampaignStatus` enum value and enforces the `VALID_TRANSITIONS` adjacency dictionary defined in `models/campaign.py`. Any call to `transition()` with a non-permitted target raises `StateTransitionError`, which propagates up to `WorkflowEngine.run_campaign()` and triggers a campaign failure with the error message persisted to the database.

#### 4.2.5 `backend/core/event_emitter.py`

`EventEmitter` maintains two connection registries: a `Dict[str, Set[WebSocket]]` for campaign-scoped connections and a `Set[WebSocket]` for global connections. `emit()` serializes the `SystemEvent` Pydantic model to JSON, appends it to the per-campaign in-memory history buffer (capped at 200 entries), and broadcasts to all relevant sockets, removing dead connections on send failure. `connect()` replays the history buffer to newly joining clients.

#### 4.2.6 `backend/reports/pdf_generator.py`

`PDFReportGenerator.generate()` uses ReportLab's Platypus layout engine to build a multi-page A4 PDF. The document includes a styled cover page with campaign metadata, a table of contents, one section per agent with output text and key insights, a confidence score caption, a projected-traffic bar chart rendered via `VerticalBarChart`, and a branded footer. The file is written to the configured `REPORT_OUTPUT_DIR` and the path is returned for storage in the campaign database record.

#### 4.2.7 `frontend/src/three/SystemVisualization.tsx`

Renders an interactive 3D agent network using React Three Fiber. Eight sphere meshes represent agents, positioned in 3D space with color-coded materials. `DataFlow` components render `Line` primitives between connected agent pairs; when a data-flow connection is active (the source agent is `RUNNING` or `COMPLETED`), a animated particle sphere traverses the line using `useFrame` linear interpolation. The scene auto-rotates via Drei's `OrbitControls` and responds to live `agentProgress` state from the Zustand store.

#### 4.2.8 `frontend/src/services/websocket.ts` and `hooks/useWebSocket.ts`

`CampaignWebSocket` manages a single `WebSocket` connection per campaign and exposes a `subscribe()` callback pattern. The `useWebSocket.ts` hook wraps this in a React effect, wiring incoming `AGENT_UPDATE` events to `updateAgentProgress()` and `STATE_CHANGED` events to `updateCampaignStatus()` in the Zustand campaign store. A `useGlobalWebSocket()` variant connects to the `/ws/global` endpoint and updates campaign statuses across all campaigns.

### 4.3 API Endpoints

| Method    | Endpoint                      | Description                                         |
|-----------|-------------------------------|-----------------------------------------------------|
| `POST`    | `/campaign/create`            | Create a new campaign record                        |
| `POST`    | `/campaign/{id}/run`          | Enqueue campaign for background execution           |
| `GET`     | `/campaign/{id}/status`       | Full campaign record including all agent outputs    |
| `GET`     | `/campaign/{id}/logs`         | Per-agent execution logs with duration and score    |
| `GET`     | `/campaign/`                  | List all campaigns (most recent 50)                 |
| `GET`     | `/report/{campaign_id}`       | Download generated PDF report                       |
| `WS`      | `/ws/campaign/{id}`           | Campaign-scoped real-time event stream              |
| `WS`      | `/ws/global`                  | Global event stream across all campaigns            |
| `GET`     | `/`                           | Health check and system info                        |
| `GET`     | `/health`                     | Worker and system status                            |

### 4.4 Database Schema

Three SQLAlchemy models back the persistent storage layer:

- **`campaigns`** — Stores the campaign brief fields, current `CampaignStatus`, the serialized `DAGExecutionPlan` JSON, the aggregated `agent_outputs` JSON, the path to the generated PDF, and lifecycle timestamps.
- **`agent_logs`** — Records one row per agent execution with fields for `state`, `input`, `output`, `confidence_score`, `retry_count`, `duration_ms`, and `error_message`.
- **`memory_store`** — A generic key-value table scoped by `campaign_id`, `memory_type` (`GLOBAL`, `BUSINESS`, `SESSION`), and `key`, used by `MemoryManager` to persist and retrieve agent context between agent invocations.

### 4.5 Frontend Pages

| Page              | Route                   | Function                                                        |
|-------------------|-------------------------|-----------------------------------------------------------------|
| Dashboard         | `/`                     | Stats summary, 3D agent network, recent campaigns, product guide|
| Campaigns         | `/campaigns`            | Filterable campaign list                                        |
| New Campaign      | `/campaigns/new`        | Campaign creation form                                          |
| Campaign Detail   | `/campaigns/:id`        | Live execution status, per-agent output cards                   |
| Live Monitor      | `/monitor`              | Real-time WebSocket event feed + 3D visualization               |
| Analytics         | `/analytics`            | Recharts performance charts                                     |
| Reports           | `/reports`              | PDF report download list                                        |

### 4.6 Design System

The frontend uses a custom dark cinematic design language implemented with Tailwind CSS utility classes and inline styles. The primary typefaces are Space Grotesk (UI labels and data) and Syne (headings and large numerals). The color palette centers on indigo (`#6366f1`) as the primary accent, with per-agent semantic colors spanning cyan, emerald, amber, violet, rose, and orange. UI cards use glassmorphism-style backgrounds with semi-transparent gradients, radial glow halos, and micro-interaction transforms on hover. All page transitions and card mounts are animated with Framer Motion spring and tween variants.

---

## 5. Conclusion

Lost In Frame Production demonstrates that a structured eight-agent pipeline, driven by a deterministic DAG execution engine, a validated state machine, and a database-backed memory layer, can autonomously produce professional-grade multi-channel marketing strategies from a minimal campaign brief. The system achieves full observability through real-time WebSocket event streaming and a 3D interactive visualization. The separation of concerns across agents, each operating within a precise domain prompt, produces outputs of greater specificity and depth than a single generalist prompt. The use of Groq's hosted LLM inference eliminates local GPU dependencies and enables deployment on standard cloud free tiers, making the system accessible without infrastructure investment. The asynchronous campaign worker prevents API gateway timeouts on multi-minute pipeline executions, and the JSON repair mechanism ensures pipeline continuity in the presence of partial LLM responses.

---

## 6. Future Scope

The product roadmap identifies three development phases:

**Phase 2 (Q3 2026):**
- Campaign scheduling and automation (trigger campaigns on a defined schedule).
- A/B testing recommendation engine (comparative analysis of strategy variants).
- Multi-language report generation (localized output for non-English markets).
- HubSpot and Mailchimp integration for direct campaign deployment.
- Custom brand voice training (per-client style profiles fed into agent prompts).
- Team collaboration workspaces with multi-user access.

**Phase 3 (Q4 2026):**
- Custom agent creation studio (visual editor for defining new specialist agents).
- White-label client reports (custom branding on generated PDFs).
- Public REST API access for third-party integration.
- Live campaign performance tracking (post-launch metrics ingestion).
- AI-powered ad creative generation (image and copy assets for paid campaigns).
- Enterprise SSO (SAML/OIDC) and audit logging for compliance.

**Technical improvements under consideration:**
- Replacing the linear DAG with a true parallel DAG to run non-dependent agents concurrently, reducing total pipeline latency.
- Streaming agent outputs token-by-token to the frontend via server-sent events.
- Introducing an LLM judge agent to review and score the quality of each specialist agent's output before it is passed downstream.
- Adding retrieval-augmented generation (RAG) with a vector store to inject live industry data and competitor intelligence at query time.

---

## 7. References

[1] J. S. Park, J. C. O'Brien, C. J. Cai, M. R. Morris, P. Liang, and M. S. Bernstein, "Generative Agents: Interactive Simulacra of Human Behavior," in *Proc. 36th Annual ACM Symposium on User Interface Software and Technology (UIST '23)*, San Francisco, CA, USA, Oct. 2023. doi: 10.1145/3586183.3606763.

[2] Q. Wu, G. Bansal, J. Zhang, Y. Wu, B. Li, E. Zhu, L. Jiang, X. Zhang, S. Zhang, J. Liu, A. H. Awadallah, R. W. White, D. Burger, and C. Wang, "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation," *arXiv preprint arXiv:2308.08155*, Aug. 2023. [Online]. Available: https://arxiv.org/abs/2308.08155.

[3] H. Chase, "LangChain," GitHub repository, 2022. [Online]. Available: https://github.com/langchain-ai/langchain.

[4] J. Liu, "LlamaIndex (formerly GPT Index)," GitHub repository, 2022. [Online]. Available: https://github.com/run-llama/llama_index.

[5] A. B. Kahn, "Topological Sorting of Large Networks," *Communications of the ACM*, vol. 5, no. 11, pp. 558–562, Nov. 1962. doi: 10.1145/368996.369025.

[6] HubSpot, Inc., "HubSpot Marketing Hub," HubSpot, Cambridge, MA, USA. [Online]. Available: https://www.hubspot.com.

[7] Adobe Inc., "Marketo Engage," Adobe, San Jose, CA, USA. [Online]. Available: https://business.adobe.com/products/marketo.

[8] OpenAI, "GPT-4 Technical Report," *arXiv preprint arXiv:2303.08774*, Mar. 2023. [Online]. Available: https://arxiv.org/abs/2303.08774.

[9] Groq Inc., "GroqCloud: Fast AI Inference," Groq, Mountain View, CA, USA. [Online]. Available: https://console.groq.com.

[10] Paul Henschel (pmndrs), "React Three Fiber: A React Renderer for Three.js," GitHub repository, 2019. [Online]. Available: https://github.com/pmndrs/react-three-fiber.

[11] R. Cabello (mrdoob), "Three.js: JavaScript 3D Library," GitHub repository, 2010. [Online]. Available: https://github.com/mrdoob/three.js.

[12] Paul Henschel (pmndrs), "Drei: Useful Helpers for React Three Fiber," GitHub repository, 2020. [Online]. Available: https://github.com/pmndrs/drei.

[13] S. Abramowitz, "Pydantic: Data Validation Using Python Type Annotations," version 2.x, 2023. [Online]. Available: https://docs.pydantic.dev.

[14] S. Ramirez, "FastAPI: Modern, Fast (High-Performance) Web Framework for Building APIs with Python," GitHub repository, 2018. [Online]. Available: https://github.com/tiangolo/fastapi.

[15] ReportLab Inc., "ReportLab: PDF Generation Library for Python," version 4.2, 2023. [Online]. Available: https://www.reportlab.com.

---

*Live deployment:* https://lost-in-frame-production.netlify.app/
*Repository:* Lost In Frame Production, MIT License.
