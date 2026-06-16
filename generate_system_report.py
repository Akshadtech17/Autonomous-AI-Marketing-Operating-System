"""
Lost In Frame Production — Comprehensive System Architecture & Agent Processing Report
Professional multi-section PDF documenting every component of the platform.
"""

import sys
from datetime import datetime
from pathlib import Path


def main():
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, PageBreak, KeepTogether,
    )
    from reportlab.graphics.shapes import Drawing, Rect, String as GStr, Line
    from reportlab.graphics.charts.barcharts import VerticalBarChart

    # ── Output ────────────────────────────────────────────────────────────────
    out_dir = Path(__file__).parent / "reports"
    out_dir.mkdir(exist_ok=True)
    ts  = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    out = out_dir / f"LostInFrame_SystemReport_{ts}.pdf"

    # ── Palette ───────────────────────────────────────────────────────────────
    NAVY    = colors.HexColor("#0f172a")
    INDIGO  = colors.HexColor("#6366f1")
    VIOLET  = colors.HexColor("#8b5cf6")
    TEAL    = colors.HexColor("#0ea5e9")
    EMERALD = colors.HexColor("#10b981")
    AMBER   = colors.HexColor("#f59e0b")
    ROSE    = colors.HexColor("#f43f5e")
    SLATE   = colors.HexColor("#475569")
    LGRAY   = colors.HexColor("#f1f5f9")
    MGRAY   = colors.HexColor("#e2e8f0")
    DTEXT   = colors.HexColor("#1e293b")
    BTEXT   = colors.HexColor("#334155")
    MUTED   = colors.HexColor("#64748b")
    WHITE   = colors.white

    # ── Document ──────────────────────────────────────────────────────────────
    doc = SimpleDocTemplate(
        str(out), pagesize=A4,
        rightMargin=2.2*cm, leftMargin=2.2*cm,
        topMargin=2.5*cm, bottomMargin=2.2*cm,
        title="Lost In Frame Production — System Architecture Report",
        author="Lost In Frame Production AI OS",
    )
    PW = A4[0] - 4.4*cm

    # ── Style helpers ─────────────────────────────────────────────────────────
    S = getSampleStyleSheet()

    def ps(name, parent="Normal", **kw):
        return ParagraphStyle(name, parent=S[parent], **kw)

    sTitle   = ps("sTitle",   "Title",    fontSize=30, textColor=WHITE,   fontName="Helvetica-Bold",   spaceAfter=8,  leading=36)
    sSub     = ps("sSub",                 fontSize=13, textColor=INDIGO,  fontName="Helvetica-Bold",   spaceAfter=4)
    sH1      = ps("sH1",     "Heading1",  fontSize=20, textColor=INDIGO,  fontName="Helvetica-Bold",   spaceAfter=10, spaceBefore=18, leading=24)
    sH2      = ps("sH2",     "Heading2",  fontSize=14, textColor=NAVY,    fontName="Helvetica-Bold",   spaceAfter=6,  spaceBefore=12, leading=18)
    sH3      = ps("sH3",     "Heading3",  fontSize=11, textColor=VIOLET,  fontName="Helvetica-Bold",   spaceAfter=4,  spaceBefore=8,  leading=14)
    sBody    = ps("sBody",                fontSize=10, textColor=BTEXT,                                spaceAfter=5,  leading=16)
    sBullet  = ps("sBullet",             fontSize=10, textColor=BTEXT,                                spaceAfter=3,  leading=15, leftIndent=18, firstLineIndent=-10)
    sCaption = ps("sCaption",             fontSize=8,  textColor=MUTED,   fontName="Helvetica-Oblique",spaceAfter=6,  alignment=1)
    sSmall   = ps("sSmall",              fontSize=8,  textColor=MUTED,                                leading=12)
    sToc     = ps("sToc",                fontSize=10, textColor=DTEXT,                                spaceAfter=3,  leading=15)
    sEye     = ps("sEye",                fontSize=8,  textColor=INDIGO,   fontName="Helvetica-Bold",   spaceAfter=2,  tracking=40)
    sCoverM  = ps("sCoverM",             fontSize=10, textColor=WHITE,                                spaceAfter=2,  leading=14)
    sAgHdr   = ps("sAgHdr",             fontSize=13, textColor=WHITE,    fontName="Helvetica-Bold",   leading=18)
    sCode    = ps("sCode",               fontSize=8,  textColor=NAVY,    fontName="Courier",          spaceAfter=3,  leading=12, backColor=LGRAY, leftIndent=6)

    story = []

    # ── Helpers ───────────────────────────────────────────────────────────────
    def hr(color=MGRAY, t=0.8):
        return HRFlowable(width="100%", thickness=t, color=color, spaceAfter=6, spaceBefore=4)

    def eyebrow(text):
        return Paragraph(text.upper(), sEye)

    def colored_table(rows, widths, hbg=NAVY, hfg=WHITE, alt=LGRAY):
        t = Table(rows, colWidths=widths)
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0,0),(-1,0),  hbg),
            ("TEXTCOLOR",     (0,0),(-1,0),  hfg),
            ("FONTNAME",      (0,0),(-1,0),  "Helvetica-Bold"),
            ("FONTSIZE",      (0,0),(-1,0),  9),
            ("FONTSIZE",      (0,1),(-1,-1), 9),
            ("TEXTCOLOR",     (0,1),(-1,-1), BTEXT),
            ("GRID",          (0,0),(-1,-1), 0.4, MGRAY),
            ("TOPPADDING",    (0,0),(-1,-1), 5),
            ("BOTTOMPADDING", (0,0),(-1,-1), 5),
            ("LEFTPADDING",   (0,0),(-1,-1), 7),
            ("RIGHTPADDING",  (0,0),(-1,-1), 7),
            ("VALIGN",        (0,0),(-1,-1), "MIDDLE"),
            ("ROWBACKGROUNDS",(0,1),(-1,-1), [WHITE, alt]),
        ]))
        return t

    def info_box(title, lines, accent=INDIGO):
        rows = [[Paragraph(f"<b>{title}</b>",
                           ps("ibt", fontSize=10, textColor=WHITE, fontName="Helvetica-Bold", leading=14))]]
        for ln in lines:
            rows.append([Paragraph(ln, ps("ibb", fontSize=9, textColor=DTEXT, leading=14))])
        t = Table(rows, colWidths=[PW])
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0,0),(-1,0),  accent),
            ("BACKGROUND",    (0,1),(-1,-1), LGRAY),
            ("TOPPADDING",    (0,0),(-1,-1), 6),
            ("BOTTOMPADDING", (0,0),(-1,-1), 6),
            ("LEFTPADDING",   (0,0),(-1,-1), 10),
            ("RIGHTPADDING",  (0,0),(-1,-1), 10),
            ("GRID",          (0,0),(-1,-1), 0, WHITE),
            ("LINEBELOW",     (0,0),(-1,0),  1, accent),
        ]))
        return t

    def para(text, style=None):
        return Paragraph(text, style or sBody)

    def bullet(text):
        return Paragraph(f"• {text}", sBullet)

    def cell(text, mono=False, bold=False):
        fn = "Courier" if mono else ("Helvetica-Bold" if bold else "Helvetica")
        return Paragraph(text, ps(f"c{text[:4]}", fontSize=8.5, textColor=BTEXT, leading=13, fontName=fn))

    # ══════════════════════════════════════════════════════════════════════════
    # COVER PAGE
    # ══════════════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 0.3*cm))

    # Hero block
    hero = Table([[
        Paragraph("LOST IN FRAME<br/>PRODUCTION",
                  ps("hero", fontSize=28, textColor=WHITE, fontName="Helvetica-Bold", leading=34, spaceAfter=6)),
    ],[
        Paragraph("Autonomous AI Marketing Operating System",
                  ps("heroS", fontSize=13, textColor=INDIGO, fontName="Helvetica-Bold", leading=18)),
    ],[
        Paragraph("Complete System Architecture &amp; Agent Processing Report",
                  ps("heroB", fontSize=10, textColor=colors.HexColor("#cbd5e1"), leading=15)),
    ]], colWidths=[PW])
    hero.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), NAVY),
        ("TOPPADDING",    (0,0),(-1,-1), 20),
        ("BOTTOMPADDING", (0,0),(-1,-1), 8),
        ("LEFTPADDING",   (0,0),(-1,-1), 22),
        ("RIGHTPADDING",  (0,0),(-1,-1), 22),
        ("LINEBELOW",     (0,-1),(-1,-1), 2, INDIGO),
    ]))
    story.append(hero)
    story.append(Spacer(1, 0.5*cm))

    # Meta table
    meta = [
        ["Document Type",    "Technical Architecture & Agent Processing Report"],
        ["System Version",   "1.0.0"],
        ["Report Date",      datetime.utcnow().strftime("%d %B %Y")],
        ["Generated At",     datetime.utcnow().strftime("%H:%M UTC")],
        ["Platform",         "FastAPI (Python 3.11) + React 18 + TypeScript"],
        ["AI Engine",        "Groq API — Qwen3 8B / LLaMA 3.2"],
        ["Database",         "SQLite / SQLAlchemy ORM"],
        ["Real-time Layer",  "WebSocket (FastAPI)"],
        ["Deployment",       "Render (Backend) + Netlify (Frontend)"],
        ["Total AI Agents",  "8 Specialised Agents (1 Orchestrator + 7 Specialists)"],
        ["Architecture",     "DAG-based Sequential Multi-Agent Pipeline"],
        ["Memory Layers",    "4 (SESSION, CAMPAIGN, BUSINESS, GLOBAL)"],
        ["API Endpoints",    "15 REST + 2 WebSocket channels"],
        ["PDF Generator",    "ReportLab 4.x — Auto-generated per campaign"],
    ]
    mt = Table(meta, colWidths=[PW*0.28, PW*0.72])
    mt.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(0,-1),  LGRAY),
        ("FONTNAME",      (0,0),(0,-1),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0),(-1,-1), 9),
        ("TEXTCOLOR",     (0,0),(0,-1),  NAVY),
        ("TEXTCOLOR",     (1,0),(1,-1),  BTEXT),
        ("GRID",          (0,0),(-1,-1), 0.3, MGRAY),
        ("ROWBACKGROUNDS",(0,0),(-1,-1), [WHITE, LGRAY]),
        ("TOPPADDING",    (0,0),(-1,-1), 5),
        ("BOTTOMPADDING", (0,0),(-1,-1), 5),
        ("LEFTPADDING",   (0,0),(-1,-1), 8),
    ]))
    story.append(mt)
    story.append(Spacer(1, 0.8*cm))
    story.append(hr(INDIGO, 2))
    story.append(para("CONFIDENTIAL — Internal Technical Documentation", sCaption))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # TABLE OF CONTENTS
    # ══════════════════════════════════════════════════════════════════════════
    story.append(para("Table of Contents", sH1))
    story.append(hr(INDIGO, 1.5))
    toc = [
        ("1",    "Executive Overview"),
        ("2",    "System Architecture"),
        ("3",    "Campaign Lifecycle & State Machine"),
        ("4",    "DAG Execution Engine"),
        ("5",    "Memory Management System"),
        ("6",    "Agent Pipeline — Detailed Processing"),
        ("6.1",  "CEO Orchestrator Agent"),
        ("6.2",  "Research Agent — Market Research Specialist"),
        ("6.3",  "SEO Strategy Agent"),
        ("6.4",  "Content Strategy Agent"),
        ("6.5",  "Social Media Agent"),
        ("6.6",  "Analytics Agent — KPI Framework"),
        ("6.7",  "Creative Director Agent"),
        ("6.8",  "Report Compiler Agent"),
        ("7",    "Real-Time Event System (WebSocket)"),
        ("8",    "REST API Reference"),
        ("9",    "Frontend Architecture"),
        ("10",   "Technology Stack"),
        ("11",   "Database Schema"),
        ("12",   "Deployment Architecture"),
    ]
    for num, title in toc:
        indent = 18 if "." in num else 0
        story.append(Paragraph(
            f"<b>{num}.</b>&nbsp;&nbsp;&nbsp;{title}",
            ps(f"toc{num}", fontSize=10, textColor=DTEXT, spaceAfter=3, leading=15, leftIndent=indent)
        ))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 1. EXECUTIVE OVERVIEW
    # ══════════════════════════════════════════════════════════════════════════
    story.append(eyebrow("Section 1"))
    story.append(para("Executive Overview", sH1))
    story.append(hr(INDIGO, 1.5))

    story.append(para(
        "<b>Lost In Frame Production</b> is an Autonomous AI Marketing Operating System that replaces "
        "traditional marketing agency workflows with a fully automated, multi-agent AI pipeline. "
        "A user submits a campaign brief — business name, industry, location, goal, audience, and budget — "
        "and the platform autonomously produces a complete, research-backed marketing strategy with zero "
        "human intervention across eight specialist AI agents."))
    story.append(para(
        "The system orchestrates agents through a <b>Directed Acyclic Graph (DAG)</b> execution engine, "
        "enforces campaign state transitions through a finite <b>State Machine</b>, maintains persistent "
        "cross-agent memory in four layers, and broadcasts real-time progress to clients via WebSockets. "
        "Each completed campaign generates a professionally formatted PDF report."))
    story.append(Spacer(1, 8))

    story.append(colored_table(
        [[cell(a, bold=True), cell(b)] for a, b in [
            ["Metric",               "Value"],
            ["Total AI Agents",      "8 (1 CEO Orchestrator + 7 Domain Specialists)"],
            ["Execution Model",      "Sequential DAG — 7 levels, 1 node per level"],
            ["State Machine States", "11 named states: CREATED → PLANNING → 6 RUNNING states → REVIEW → REPORT → COMPLETED"],
            ["Memory Layers",        "4: SESSION (per run) · CAMPAIGN · BUSINESS · GLOBAL"],
            ["API Surface",          "15 REST endpoints + 2 WebSocket channels (/campaign/{id}, /global)"],
            ["Real-time Events",     "10 event types broadcast over WebSocket with 200-event history replay"],
            ["Report Format",        "Auto-generated PDF via ReportLab — per-campaign on demand"],
            ["Frontend Stack",       "React 18 · TypeScript · Tailwind · Three.js · Framer Motion · Zustand"],
            ["Backend Stack",        "FastAPI · SQLAlchemy · asyncio · Pydantic v2 · Uvicorn"],
            ["AI Provider",          "Groq Cloud API (free tier) — Qwen3 8B / LLaMA 3.2"],
        ]],
        widths=[PW*0.36, PW*0.64], hbg=INDIGO
    ))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 2. SYSTEM ARCHITECTURE
    # ══════════════════════════════════════════════════════════════════════════
    story.append(eyebrow("Section 2"))
    story.append(para("System Architecture", sH1))
    story.append(hr(INDIGO, 1.5))

    story.append(para(
        "The platform follows a layered architecture. The React SPA communicates with the FastAPI "
        "backend over REST (HTTPS) and WebSocket (WSS). The backend runs an asyncio event loop that "
        "processes campaign jobs through an orchestrated agent pipeline, persisting state to an SQLite "
        "database via SQLAlchemy ORM."))

    # Layer diagram
    d = Drawing(PW, 220)
    layers = [
        (TEAL,    "FRONTEND LAYER",    "React 18 · TypeScript · Vite · Three.js · Tailwind CSS · Framer Motion · Zustand · TanStack Query",  183),
        (INDIGO,  "API GATEWAY",       "FastAPI · Uvicorn/Gunicorn · REST Endpoints · WebSocket · CORS Middleware · Pydantic v2 Validation",   140),
        (VIOLET,  "ORCHESTRATION",     "WorkflowEngine · StateMachine · DAGEngine · EventEmitter · CampaignWorker (asyncio.Queue)",              97),
        (EMERALD, "AGENT PIPELINE",    "CEO Orchestrator → Research → SEO → Content → Social → Analytics → Creative → Report",                  54),
        (AMBER,   "PERSISTENCE",       "SQLAlchemy ORM · SQLite DB · MemoryManager (4 layers) · PDFReportGenerator (ReportLab)",                11),
    ]
    for col, title, detail, y in layers:
        d.add(Rect(0, y, PW, 36, fillColor=col, strokeColor=WHITE, strokeWidth=0.5))
        d.add(GStr(10, y+24, title,  fontName="Helvetica-Bold", fontSize=9,  fillColor=WHITE))
        d.add(GStr(10, y+10, detail, fontName="Helvetica",       fontSize=7,  fillColor=colors.HexColor("#e2e8f0")))
    story.append(d)
    story.append(para("Figure 1 — System Layer Architecture (top = user-facing, bottom = persistence)", sCaption))
    story.append(Spacer(1, 6))

    story.append(para("Component Responsibilities", sH2))
    story.append(colored_table(
        [[cell(a, bold=True), cell(b, bold=True), cell(c)] for a, b, c in [
            ["Component",        "Technology",          "Responsibility"],
            ["Frontend SPA",     "React 18 / Vite",     "Campaign management, live monitoring, analytics dashboard, 3D visualisation, report download"],
            ["API Gateway",      "FastAPI / Uvicorn",   "HTTP routing, WebSocket management, request validation, CORS, global exception handling"],
            ["Campaign Worker",  "asyncio.Queue",       "Async job queue — receives campaign IDs and spawns concurrent workflow coroutines"],
            ["Workflow Engine",  "Python asyncio",      "Coordinates CEO planning → DAG execution → state transitions → completion flow"],
            ["DAG Engine",       "Custom Python",       "Builds execution graph, topological sort (Kahn's), dependency resolution, node tracking"],
            ["State Machine",    "Finite Automaton",    "Enforces valid campaign status transitions; raises StateTransitionError on violations"],
            ["Agent Pipeline",   "BaseAgent ABC",       "8 LLM agents executing in series — each overrides _build_prompt() for domain context"],
            ["Memory Manager",   "SQLAlchemy",          "Read/write to 4 memory layers (session, campaign, business, global) with upsert semantics"],
            ["Event Emitter",    "WebSocket",           "Fan-out to per-campaign and global connections; replays last 200 events on reconnect"],
            ["PDF Generator",    "ReportLab 4.x",       "Builds professional campaign report from agent_outputs dict — invoked by /report API"],
            ["Database",         "SQLite / ORM",        "Persists campaigns, agent_logs, memory_store tables; campaign.agent_outputs as JSON column"],
        ]],
        widths=[PW*0.20, PW*0.20, PW*0.60], hbg=NAVY
    ))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 3. CAMPAIGN LIFECYCLE & STATE MACHINE
    # ══════════════════════════════════════════════════════════════════════════
    story.append(eyebrow("Section 3"))
    story.append(para("Campaign Lifecycle & State Machine", sH1))
    story.append(hr(INDIGO, 1.5))

    story.append(para(
        "Every campaign moves through a strictly enforced finite state machine implemented in "
        "<b>core/state_machine.py</b>. The <b>VALID_TRANSITIONS</b> dict in the Campaign model "
        "defines which state changes are legal. Invalid transitions raise a "
        "<b>StateTransitionError</b> (logged CRITICAL), immediately failing the campaign and "
        "preventing any partially-executed workflow from persisting in an unknown state."))
    story.append(Spacer(1, 6))

    story.append(para("State Transition Map", sH2))
    story.append(colored_table(
        [[cell(a, bold=True), cell(b, bold=True), cell(c, bold=True), cell(d)] for a, b, c, d in [
            ["State",               "Triggered By",                   "Valid Next States",              "Description"],
            ["CREATED",             "POST /campaign/create",          "PLANNING",                       "Campaign record initialised in DB with all brief fields"],
            ["PLANNING",            "WorkflowEngine.run_campaign()",  "RUNNING_RESEARCH, FAILED",       "CEO Agent generates strategic plan and builds DAG"],
            ["RUNNING_RESEARCH",    "DAG Node: research_task",        "RUNNING_SEO, FAILED",            "Research Agent performs market analysis and audience profiling"],
            ["RUNNING_SEO",         "DAG Node: seo_task",             "RUNNING_CONTENT, FAILED",        "SEO Agent creates keyword strategy and ranking targets"],
            ["RUNNING_CONTENT",     "DAG Node: content_task",         "RUNNING_SOCIAL, FAILED",         "Content Agent builds editorial calendar and blog ideas"],
            ["RUNNING_SOCIAL",      "DAG Node: social_task",          "RUNNING_ANALYTICS, FAILED",      "Social Agent plans platform strategy and posting cadence"],
            ["RUNNING_ANALYTICS",   "DAG Node: analytics_task",       "REVIEW, FAILED",                 "Analytics Agent defines KPI framework and traffic forecast"],
            ["REVIEW",              "WorkflowEngine (auto)",          "REPORT_GENERATION, FAILED",      "System validates all 7 agent outputs are present"],
            ["REPORT_GENERATION",   "WorkflowEngine (auto)",          "COMPLETED, FAILED",              "PDF report assembled from all agent_outputs"],
            ["COMPLETED",           "WorkflowEngine (final)",         "— (terminal)",                   "All agents completed; report available for download"],
            ["FAILED",              "Any unhandled exception",        "— (terminal)",                   "Error captured in campaign.error_message; pipeline halted"],
        ]],
        widths=[PW*0.22, PW*0.22, PW*0.22, PW*0.34], hbg=NAVY
    ))
    story.append(Spacer(1, 8))
    story.append(info_box("State Integrity Guarantee",
        ["Every database commit of a campaign status change flows through: sm.transition(target) → "
         "campaign.status = target → db.commit() → event_emitter.emit_state_change(). There is no "
         "code path that sets campaign.status directly.",
         "The StateMachine.can_transition(target) pre-check is called before every transition attempt, "
         "so the WorkflowEngine only requests transitions it knows are valid for the current state. "
         "This guarantees DB state and in-memory state machine are always synchronised."], EMERALD))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 4. DAG EXECUTION ENGINE
    # ══════════════════════════════════════════════════════════════════════════
    story.append(eyebrow("Section 4"))
    story.append(para("DAG Execution Engine", sH1))
    story.append(hr(INDIGO, 1.5))

    story.append(para(
        "The <b>DAGEngine</b> (<i>core/dag_engine.py</i>) builds and manages the execution graph "
        "for every campaign. Each node represents one agent task; directed edges encode dependencies. "
        "Topological sorting (Kahn's algorithm) determines execution order and guarantees no node "
        "runs before its dependencies complete. A cycle detection check prevents infinite loops."))
    story.append(Spacer(1, 6))

    story.append(para("DAG Node Sequence", sH2))
    story.append(colored_table(
        [[cell(a, bold=True), cell(b, bold=True), cell(c, bold=True), cell(d, bold=True), cell(e, bold=True)] for a, b, c, d, e in [
            ["Order", "Task ID",         "Agent Name",               "Dependencies",    "DAG Level"],
            ["1",     "research_task",   "research_agent",           "None (root)",     "Level 0"],
            ["2",     "seo_task",        "seo_agent",                "research_task",   "Level 1"],
            ["3",     "content_task",    "content_agent",            "seo_task",        "Level 2"],
            ["4",     "social_task",     "social_agent",             "content_task",    "Level 3"],
            ["5",     "analytics_task",  "analytics_agent",          "social_task",     "Level 4"],
            ["6",     "creative_task",   "creative_director_agent",  "analytics_task",  "Level 5"],
            ["7",     "report_task",     "report_agent",             "creative_task",   "Level 6"],
        ]],
        widths=[PW*0.08, PW*0.20, PW*0.23, PW*0.22, PW*0.27], hbg=VIOLET
    ))
    story.append(Spacer(1, 8))

    story.append(para("Node Status Lifecycle", sH2))
    story.append(colored_table(
        [[cell(a, bold=True), cell(b, bold=True), cell(c)] for a, b, c in [
            ["Status",    "Meaning",                                      "Transition Trigger"],
            ["PENDING",   "Waiting for dependencies to complete",         "Initial state on DAG creation via build_plan()"],
            ["READY",     "All dependencies met, awaiting dispatch",      "get_ready_nodes() returns this node ID"],
            ["RUNNING",   "Agent is actively executing",                  "WorkflowEngine dispatches _execute_node()"],
            ["COMPLETED", "Agent returned valid AgentOutput",             "mark_completed() called with output dict"],
            ["FAILED",    "Agent raised an exception",                    "mark_failed() called with error string"],
            ["SKIPPED",   "Node bypassed (reserved for future branching)","Not yet implemented — available as enum value"],
        ]],
        widths=[PW*0.18, PW*0.40, PW*0.42], hbg=NAVY
    ))
    story.append(Spacer(1, 8))
    story.append(info_box("Output Propagation Between Agents",
        ["Each completed node's output dict is appended to previous_outputs[], which is passed to every "
         "subsequent agent's memory context via MemoryManager.build_agent_context().",
         "This allows full pipeline awareness: the SEO Agent reads the Research Agent's market analysis "
         "before building keywords; the Content Agent reads SEO keywords before creating the editorial "
         "calendar; the Report Agent reads ALL prior summaries to write the executive synthesis."], VIOLET))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 5. MEMORY MANAGEMENT SYSTEM
    # ══════════════════════════════════════════════════════════════════════════
    story.append(eyebrow("Section 5"))
    story.append(para("Memory Management System", sH1))
    story.append(hr(INDIGO, 1.5))

    story.append(para(
        "The <b>MemoryManager</b> (<i>memory/memory_manager.py</i>) provides a four-layer persistent "
        "memory architecture backed by the <b>memory_store</b> database table. Agents share knowledge "
        "across tasks within a run (SESSION), across runs of the same campaign (CAMPAIGN), across all "
        "campaigns for a business (BUSINESS), and system-wide (GLOBAL)."))
    story.append(Spacer(1, 6))

    story.append(colored_table(
        [[cell(a, bold=True), cell(b, bold=True), cell(c, bold=True), cell(d, bold=True), cell(e)] for a, b, c, d, e in [
            ["Layer",    "MemoryType", "Scope",            "Lifetime",          "Purpose"],
            ["Session",  "SESSION",   "Per-campaign run",  "Cleared per run",   "Stores individual agent outputs during execution (key: agent_output_{name})"],
            ["Campaign", "CAMPAIGN",  "Per-campaign",      "Campaign lifetime",  "Stores campaign-specific learned preferences and contextual data"],
            ["Business", "BUSINESS",  "Per business",      "Persistent",        "Stores business profile, communication style, past campaign learnings"],
            ["Global",   "GLOBAL",    "System-wide",       "Permanent",         "Stores industry knowledge, best practices, prompt templates"],
        ]],
        widths=[PW*0.11, PW*0.14, PW*0.17, PW*0.17, PW*0.41], hbg=EMERALD
    ))
    story.append(Spacer(1, 8))

    story.append(para("Memory Manager Public API", sH2))
    story.append(colored_table(
        [[cell(a, bold=True), cell(b), cell(c)] for a, b, c in [
            ["Method",                   "Signature",                                          "Behaviour"],
            ["write()",                  "write(type, key, data, campaign_id=None)",           "Upsert — updates existing record or inserts new one atomically"],
            ["read()",                   "read(type, key, campaign_id=None)",                  "Returns stored data (any JSON-serialisable type) or None"],
            ["build_agent_context()",    "build_agent_context(campaign, previous_outputs)",    "Assembles full context payload injected into every agent call"],
            ["store_agent_output()",     "store_agent_output(campaign_id, agent_name, output)","Persists AgentOutput as SESSION memory keyed by agent name"],
            ["get_all_session_outputs()","get_all_session_outputs(campaign_id)",               "Retrieves all agent output dicts for the current campaign run"],
        ]],
        widths=[PW*0.25, PW*0.38, PW*0.37], hbg=NAVY
    ))
    story.append(Spacer(1, 8))

    story.append(para("Agent Context Payload Structure", sH2))
    story.append(para(
        "Every agent receives this standardised dict built by build_agent_context(). "
        "It is the single source of truth for an agent's awareness of campaign details and prior outputs."))
    story.append(colored_table(
        [[cell(a, mono=True), cell(b), cell(c)] for a, b, c in [
            ["Field Path",                      "Type",  "Description"],
            ["campaign_context.id",             "str",   "Unique campaign UUID"],
            ["campaign_context.business_name",  "str",   "Business display name"],
            ["campaign_context.industry",       "str",   "Industry vertical"],
            ["campaign_context.location",       "str",   "Geographic target market"],
            ["campaign_context.goal",           "str",   "Primary campaign objective (free text)"],
            ["campaign_context.target_audience","str",   "Demographic descriptor"],
            ["campaign_context.budget",         "str",   "Available budget string"],
            ["previous_outputs",                "list",  "All prior AgentOutput dicts from this run in execution order"],
            ["global_memory",                   "dict",  "System-wide industry knowledge (MemoryType.GLOBAL key='industry_knowledge')"],
            ["business_memory",                 "dict",  "Persistent business profile (MemoryType.BUSINESS key='profile')"],
        ]],
        widths=[PW*0.37, PW*0.10, PW*0.53], hbg=NAVY
    ))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 6. AGENT PIPELINE — OVERVIEW
    # ══════════════════════════════════════════════════════════════════════════
    story.append(eyebrow("Section 6"))
    story.append(para("Agent Pipeline — Detailed Processing", sH1))
    story.append(hr(INDIGO, 1.5))

    story.append(para(
        "All seven specialist agents inherit from <b>BaseAgent</b> (<i>agents/base_agent.py</i>). "
        "The base class provides a common <b>execute()</b> method that calls the Groq LLM, extracts "
        "JSON, validates against the <b>AgentOutput</b> Pydantic schema, and returns a typed result. "
        "Agents override <b>_build_prompt()</b> to inject domain-specific context while reusing "
        "the same prompt structure."))
    story.append(Spacer(1, 6))

    story.append(para("BaseAgent Processing Flow", sH2))
    for i, step in enumerate([
        "execute() is called by WorkflowEngine with task dict, memory context dict, and prior outputs",
        "_build_prompt() assembles the domain-specific LLM prompt — every agent injects campaign context + last 2 prior outputs",
        "ollama_service.generate() (now Groq API) sends system_prompt + user_prompt to the LLM",
        "ollama_service.extract_json() parses raw LLM text — tries direct JSON parse, then regex extraction with bracket matching",
        "_validate_output() merges parsed dict into AgentOutput Pydantic model; applies safe defaults for any missing fields",
        "On JSON extraction failure, _fallback_output() returns confidence_score=0.5 partial result — workflow continues",
        "AgentOutput returned to WorkflowEngine: stored in DB, persisted to memory, WebSocket event emitted (COMPLETED)",
    ], 1):
        story.append(bullet(f"<b>Step {i}:</b> {step}"))
    story.append(Spacer(1, 6))

    story.append(para("AgentOutput Schema — All 7 Specialist Agents", sH2))
    story.append(colored_table(
        [[cell(a, bold=True), cell(b, bold=True), cell(c)] for a, b, c in [
            ["Field",           "Type",   "Description"],
            ["agent",           "str",    "Agent name identifier (e.g. 'research_agent')"],
            ["task_id",         "str",    "DAG task ID this output belongs to (e.g. 'research_task')"],
            ["input_summary",   "str",    "One-sentence description of what was processed"],
            ["output",          "str",    "Main analysis text (3–5 sentences) — shown in PDF sections"],
            ["key_insights",    "list",   "Array of insight strings — up to 8 displayed in PDF report"],
            ["confidence_score","float",  "Self-reported quality score 0.0–1.0 — stored in agent_logs.confidence_score"],
            ["dependencies",    "list",   "Upstream agents this output depends on (informational, not enforced)"],
            ["memory_updates",  "list",   "Keys suggested for persistence to memory store"],
            ["timestamp",       "str",    "ISO-8601 UTC timestamp of generation"],
        ]],
        widths=[PW*0.25, PW*0.12, PW*0.63], hbg=NAVY
    ))
    story.append(PageBreak())

    # ── Agent sub-sections ────────────────────────────────────────────────────
    agents = [
        {
            "section": "6.1", "color": VIOLET,
            "title": "CEO Orchestrator Agent",
            "role": "Pure orchestrator — never executes content tasks",
            "file": "agents/ceo_agent.py",
            "note": "Does NOT inherit from BaseAgent — standalone class with its own LLM call.",
            "steps": [
                "Receives full campaign brief dict: id, business_name, industry, location, goal, target_audience, budget",
                "Constructs strategic planning prompt asking LLM to return: strategy_summary, key_objectives[], target_channels[], timeline_estimate, risk_factors[]",
                "Calls ollama_service.generate() with strict system prompt: 'You are the CEO of a world-class AI marketing agency. Return ONLY valid JSON.'",
                "On valid JSON response: extracts strategy, logs first 80 chars of strategy_summary",
                "On JSON parse failure: applies safe defaults (30-day timeline, channels: SEO + Social + Content Marketing)",
                "Calls DAGEngine.build_plan(campaign_id) to construct the 7-node execution graph with topological ordering",
                "Injects generated strategy into research_task node's output dict as a seed for downstream Research Agent",
                "Returns complete DAGExecutionPlan to WorkflowEngine — no content is written by this agent",
            ],
            "output_fields": [
                ["strategy_summary",  "str",  "High-level strategic direction for the campaign"],
                ["key_objectives",    "list", "Prioritised list of campaign objectives"],
                ["target_channels",   "list", "Recommended marketing channels (SEO, Social, Email, etc.)"],
                ["timeline_estimate", "str",  "Estimated campaign duration"],
                ["risk_factors",      "list", "Identified risks to campaign success"],
            ],
            "design_notes": [
                "The CEO Agent is intentionally isolated from content generation. Its system prompt states: 'You NEVER write content, SEO, or social media posts.'",
                "This mirrors a real executive's role: strategic planning and delegation to specialists.",
                "Failure tolerance: the try/except block ensures that even if the LLM fails, a valid default strategy is generated and the DAG is still built.",
            ],
        },
        {
            "section": "6.2", "color": TEAL,
            "title": "Research Agent — Market Research Specialist",
            "role": "Market research analyst producing foundational intelligence",
            "file": "agents/research_agent.py",
            "note": "First specialist agent to execute. All downstream agents build on its output.",
            "steps": [
                "Receives memory context: business_name, industry, location, target_audience, goal from campaign record",
                "Reads CEO strategy seed from research_task.output.ceo_strategy (injected by CEO Agent during planning)",
                "Calls super()._build_prompt() to get standard base prompt structure",
                "Extends prompt with research-specific instruction: 'Cover: industry trends, target audience profile, top 3 competitors, key opportunities'",
                "LLM call to Groq API with role: 'market research analyst' — returns valid JSON only",
                "JSON extracted and validated into AgentOutput schema with safe defaults for missing fields",
                "Output stored in campaign.agent_outputs['research_agent'] JSON column in DB",
                "Output appended to previous_outputs[] list — becomes available to SEO Agent as context",
                "WebSocket AGENT_UPDATE event emitted: state=COMPLETED, confidence_score in data payload",
            ],
            "output_fields": [
                ["output",       "str",  "Industry trends, audience profile, competitive landscape, opportunities (3-5 sentences)"],
                ["key_insights", "list", "3 actionable insights: competitor gap, audience pain point, market opportunity"],
            ],
            "design_notes": [
                "The Research Agent's output is the most critical — all 6 downstream agents depend on it either directly or transitively.",
                "The SEO Agent reads the first 200 chars of research output as its market context before keyword planning.",
                "Confidence score below 0.6 from this agent typically signals that the campaign brief lacked specific enough detail.",
            ],
        },
        {
            "section": "6.3", "color": EMERALD,
            "title": "SEO Strategy Agent",
            "role": "SEO strategist creating keyword and ranking strategy",
            "file": "agents/seo_agent.py",
            "note": "Reads Research Agent output — extracts first 200 chars as market context.",
            "steps": [
                "Reads previous_outputs[] to extract Research Agent's market analysis (first 200 chars used as context string)",
                "Receives campaign context: business_name, industry, location for local SEO targeting",
                "Constructs SEO-specific prompt: '5 primary keywords, on-page recommendations, local SEO tactics, 90-day ranking goal'",
                "LLM prompted as 'SEO strategist' with instruction to return focused SEO plan as valid JSON only",
                "Primary keywords selected based on: industry vertical + geographic location + audience intent signals from research",
                "On-page recommendations derived from keyword intent (informational vs transactional vs navigational)",
                "Local SEO tactics customised to the location field: Google Business Profile, local citations, geo-targeted pages",
                "90-day ranking goal formulated as concrete target positions for primary keyword set",
                "Output stored and forwarded to Content Agent as editorial keyword seed",
            ],
            "output_fields": [
                ["output",       "str",  "5 primary keywords, on-page strategy, local SEO tactics, 90-day ranking goal"],
                ["key_insights", "list", "Top keyword opportunities, competitive gaps, quick-win technical SEO fixes"],
            ],
            "design_notes": [
                "The SEO Agent's keyword output directly seeds the Content Agent — editorial themes are mapped to target keywords.",
                "Location specificity is critical: the prompt explicitly includes city/region for local SEO differentiation.",
            ],
        },
        {
            "section": "6.4", "color": AMBER,
            "title": "Content Strategy Agent",
            "role": "Content strategist building SEO-aligned editorial plan",
            "file": "agents/content_agent.py",
            "note": "Uses SEO Agent keywords as seed for editorial planning.",
            "steps": [
                "Extracts SEO Agent output from previous_outputs[] (first 150 chars used as keyword context)",
                "Receives campaign goal and business_name for brand-aligned messaging direction",
                "Constructs content-specific prompt: 'brand voice, 4-week editorial calendar themes, 3 blog ideas, email series concept'",
                "LLM prompted as 'content strategist' to return concise content plan as valid JSON only",
                "Brand voice definition: tone, vocabulary personality, communication style anchored to industry + audience",
                "4-week editorial calendar themes mapped directly to SEO target keywords from prior agent",
                "3 blog ideas formulated to target high-intent search queries within the keyword set",
                "Email series concept: multi-step nurture sequence aligned with campaign goal (awareness vs leads vs sales)",
                "Output stored and forwarded to Social Media Agent as content theme reference",
            ],
            "output_fields": [
                ["output",       "str",  "Brand voice definition, calendar themes, blog ideas, email series concept"],
                ["key_insights", "list", "Content pillars, top performing format types, engagement hooks"],
            ],
            "design_notes": [
                "Content themes intentionally align with SEO keywords — this ensures every content piece serves both audience and search.",
                "The 4-week calendar provides an immediately actionable schedule the client can begin executing.",
            ],
        },
        {
            "section": "6.5", "color": colors.HexColor("#ec4899"),
            "title": "Social Media Agent",
            "role": "Social media strategist planning platform-specific execution",
            "file": "agents/social_agent.py",
            "note": "Budget-aware — incorporates campaign.budget for paid social allocation.",
            "steps": [
                "Receives campaign context: business_name, industry, target_audience, budget",
                "Constructs social-specific prompt: 'best platforms, posting frequency, 3 sample posts, paid budget split, KPIs'",
                "LLM prompted as 'social media strategist' with audience and budget awareness",
                "Platform selection weighted by target_audience demographics and budget efficiency (CPM/CPC benchmarks)",
                "Posting frequency optimised per platform algorithm: LinkedIn (3-5/wk), Instagram (5-7/wk), TikTok (daily)",
                "3 sample post ideas generated for primary platform: hook, body, call-to-action, relevant hashtags",
                "Paid social budget split allocated as percentage across selected platforms based on ROI benchmarks",
                "Social KPIs defined: follower growth rate, engagement rate, reach, click-through rate, share of voice",
                "Output stored and forwarded to Analytics Agent for KPI framework integration",
            ],
            "output_fields": [
                ["output",       "str",  "Platform recommendations, posting cadence, sample posts, paid budget split"],
                ["key_insights", "list", "Best platform for audience, optimal posting times, top content format"],
            ],
            "design_notes": [
                "Platform selection is deliberately audience-driven — the target_audience field heavily influences whether LinkedIn, Instagram, or TikTok is primary.",
                "Budget field directly influences whether paid social is recommended at all and how aggressively.",
            ],
        },
        {
            "section": "6.6", "color": colors.HexColor("#f97316"),
            "title": "Analytics Agent — KPI Framework Specialist",
            "role": "Marketing analytics expert defining measurement framework",
            "file": "agents/analytics_agent.py",
            "note": "Synthesises all prior channel outputs into a unified measurement framework.",
            "steps": [
                "Receives campaign goal and budget from memory context for ROI baseline calculation",
                "Constructs analytics-specific prompt: '5 primary KPIs with numeric targets, tracking tools, 90-day traffic forecast, ROI estimate'",
                "LLM prompted as 'marketing analytics expert' to return concise KPI framework as valid JSON only",
                "5 primary KPIs selected based on campaign goal type: brand awareness (reach, impressions) vs leads (CPL, conv rate) vs sales (ROAS, revenue)",
                "Numeric targets derived from industry benchmarks scaled to business size and budget level",
                "Tracking tool recommendations: GA4 (website), Google Search Console (SEO), platform native (social), CRM (leads)",
                "90-day traffic forecast modelled as compound growth: Month 1 (baseline) → Month 2 (+65%) → Month 3 (+60%) → Month 4 (+45%)",
                "ROI estimate calculated using channel cost assumptions and industry-average conversion rate benchmarks",
                "Output stored — referenced directly by Creative Director and Report Agents for strategic alignment",
            ],
            "output_fields": [
                ["output",       "str",  "5 KPIs with targets, recommended tools, 90-day traffic forecast, ROI estimate"],
                ["key_insights", "list", "Top performing metric to watch, quick-win measurement opportunities"],
            ],
            "design_notes": [
                "KPI selection is goal-type sensitive — this prevents misaligned metrics (e.g. recommending conversion rate for a pure awareness campaign).",
                "The 90-day forecast provides the data backbone for the performance chart in the PDF report.",
            ],
        },
        {
            "section": "6.7", "color": ROSE,
            "title": "Creative Director Agent",
            "role": "Creative director establishing brand identity and campaign concepts",
            "file": "agents/creative_agent.py",
            "note": "Produces the unifying creative platform that ties all channels together.",
            "steps": [
                "Receives campaign context: business_name, industry, goal for brand positioning",
                "Constructs creative-specific prompt: 'brand positioning statement, visual identity (colours + tone), campaign big idea, 2 creative concepts'",
                "LLM prompted as 'creative director' to return brand and creative strategy as valid JSON only",
                "Brand positioning statement: one sentence defining unique market position vs competitors identified by Research Agent",
                "Visual identity direction: primary colour psychology, typography mood (geometric vs serif vs humanist), photography style",
                "Tone of voice: defined on 4 axes — formal/casual, serious/playful, technical/accessible, exclusive/inclusive",
                "Campaign Big Idea: single unifying creative platform that works consistently across all 5 channels",
                "2 Creative Concepts: distinct executable directions with different emotional and visual approaches",
                "Output stored and passed to Report Agent as final specialist input before executive synthesis",
            ],
            "output_fields": [
                ["output",       "str",  "Brand positioning, visual identity, tone of voice, campaign big idea, 2 concepts"],
                ["key_insights", "list", "Primary brand differentiator, strongest creative hook, recommended hero medium"],
            ],
            "design_notes": [
                "The Creative Director Agent is positioned last among specialists (before Report Agent) so it can reference the complete analytical picture.",
                "Two creative concepts are provided deliberately — giving the client a choice between a safe and a bold direction.",
            ],
        },
        {
            "section": "6.8", "color": INDIGO,
            "title": "Report Compiler Agent",
            "role": "Executive report compiler synthesising all agent outputs",
            "file": "agents/report_agent.py",
            "note": "Only agent with access to ALL 6 prior outputs. Final synthesis layer.",
            "steps": [
                "Reads ALL previous_outputs[] — gets summaries from all 6 prior specialist agents",
                "Builds per-agent summary strings: '{agent_name}: {first 150 chars of output}' for each of 6 agents",
                "Constructs report-specific prompt: 'executive summary, top 3 strategic priorities, 90-day action plan, expected ROI'",
                "LLM prompted as 'executive marketing strategist' to synthesise and distil insights across all channels",
                "Executive summary written in business-facing language — no technical jargon, client-ready prose",
                "Top 3 strategic priorities ranked by impact × urgency matrix across all 6 agent recommendations",
                "90-day action plan formatted as time-bound tasks: Week 1-2 (setup), Month 1 (launch), Month 2-3 (optimise)",
                "Expected ROI derived from Analytics Agent's forecast with qualifications about assumptions",
                "Output stored as final agent_outputs['report_agent'] entry — used directly by PDF Generator for Executive Summary section",
            ],
            "output_fields": [
                ["output",       "str",  "Executive summary, top 3 strategic priorities, 90-day action plan, expected ROI"],
                ["key_insights", "list", "Most impactful quick win, primary competitive advantage, critical success factor"],
            ],
            "design_notes": [
                "The Report Agent is the synthesis layer — its output is what the client actually reads. Confidence score here reflects full pipeline quality.",
                "Deliberately positioned as the final agent so it has access to all 6 specialist outputs before synthesising.",
                "The 150-char truncation per agent in the prompt is a deliberate context management choice to stay within LLM token limits.",
            ],
        },
    ]

    for ag in agents:
        story.append(eyebrow(f"Section {ag['section']}"))
        story.append(para(ag["title"], sH1))
        story.append(hr(ag["color"], 1.5))

        story.append(para(f"<b>Role:</b> {ag['role']}"))
        story.append(para(f"<b>Source file:</b> <font name='Courier'>{ag['file']}</font>"))
        story.append(info_box("Important Note", [ag["note"]], ag["color"]))
        story.append(Spacer(1, 6))

        story.append(para("Processing Pipeline", sH2))
        for i, step in enumerate(ag["steps"], 1):
            story.append(bullet(f"<b>Step {i}:</b> {step}"))

        story.append(Spacer(1, 6))
        story.append(para("Key Output Fields", sH2))
        story.append(colored_table(
            [[cell(a, bold=True), cell(b, bold=True), cell(c)] for a, b, c in
             [["Field", "Type", "Description"]] + ag["output_fields"]],
            widths=[PW*0.25, PW*0.10, PW*0.65], hbg=ag["color"]
        ))
        story.append(Spacer(1, 6))
        story.append(para("Design Notes", sH2))
        for note in ag["design_notes"]:
            story.append(bullet(note))

        story.append(Spacer(1, 4))
        story.append(hr())
        story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 7. REAL-TIME EVENT SYSTEM
    # ══════════════════════════════════════════════════════════════════════════
    story.append(eyebrow("Section 7"))
    story.append(para("Real-Time Event System", sH1))
    story.append(hr(INDIGO, 1.5))

    story.append(para(
        "The <b>EventEmitter</b> singleton (<i>core/event_emitter.py</i>) maintains all active "
        "WebSocket connections and broadcasts <b>SystemEvent</b> Pydantic objects as JSON. It supports "
        "both campaign-scoped and global fan-out, stores up to 200 events per campaign for history "
        "replay on reconnect, and sends a 30-second heartbeat to keep connections alive."))
    story.append(Spacer(1, 6))

    story.append(para("WebSocket Endpoints", sH2))
    story.append(colored_table(
        [[cell(a, bold=True), cell(b, bold=True), cell(c)] for a, b, c in [
            ["Endpoint",                      "Channel",         "Behaviour"],
            ["ws://.../ws/campaign/{id}",     "Campaign-scoped", "Receives only events for one specific campaign; replays history on connect"],
            ["ws://.../ws/global",            "Global",          "Receives ALL events across all campaigns; used by Dashboard and Live Monitor"],
        ]],
        widths=[PW*0.40, PW*0.18, PW*0.42], hbg=NAVY
    ))
    story.append(Spacer(1, 8))

    story.append(para("Event Types", sH2))
    story.append(colored_table(
        [[cell(a, bold=True), cell(b, bold=True), cell(c)] for a, b, c in [
            ["EventType",         "Emitted When",                           "Key Fields"],
            ["CAMPAIGN_CREATED",  "Campaign saved to DB",                   "campaign_id, message"],
            ["STATE_CHANGED",     "StateMachine.transition() succeeds",     "campaign_id, state (new value), message"],
            ["AGENT_STARTED",     "Agent task begins",                      "campaign_id, agent, state='RUNNING'"],
            ["AGENT_UPDATE",      "Agent progress checkpoint (10% → 100%)", "campaign_id, agent, state, progress (int 0-100), message"],
            ["AGENT_COMPLETED",   "Agent returns valid AgentOutput",        "campaign_id, agent, state='COMPLETED', data.confidence_score"],
            ["AGENT_FAILED",      "Agent raises exception",                 "campaign_id, agent, state='FAILED', message (exception str)"],
            ["MEMORY_UPDATED",    "MemoryManager.write() called",           "campaign_id, message"],
            ["REPORT_GENERATED",  "PDF file created on disk",               "campaign_id, message (file path)"],
            ["SYSTEM_ERROR",      "Unhandled global exception",             "campaign_id, message (exception detail)"],
            ["HEARTBEAT",         "30s of client inactivity",               "type='HEARTBEAT' only — no campaign context"],
        ]],
        widths=[PW*0.25, PW*0.33, PW*0.42], hbg=NAVY
    ))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 8. REST API REFERENCE
    # ══════════════════════════════════════════════════════════════════════════
    story.append(eyebrow("Section 8"))
    story.append(para("REST API Reference", sH1))
    story.append(hr(INDIGO, 1.5))

    story.append(para("Campaign Endpoints  ( prefix: /campaign )", sH2))
    story.append(colored_table(
        [[cell(a, bold=True), cell(b, mono=True), cell(c, bold=True), cell(d)] for a, b, c, d in [
            ["Method", "Path",               "Status", "Description"],
            ["POST",   "/create",            "201",    "Create campaign; body: business_name, industry, location, goal, target_audience?, budget?"],
            ["POST",   "/{id}/run",          "202",    "Enqueue campaign for async execution; returns immediately with queued message"],
            ["GET",    "/{id}/status",       "200",    "Full campaign record: status, dag, agent_outputs, report_path, error_message"],
            ["GET",    "/{id}/logs",         "200",    "All AgentLog records for the campaign with confidence scores and duration_ms"],
            ["GET",    "/",                  "200",    "List last 50 campaigns ordered by created_at DESC"],
        ]],
        widths=[PW*0.10, PW*0.28, PW*0.09, PW*0.53], hbg=INDIGO
    ))
    story.append(Spacer(1, 8))

    story.append(para("Report Endpoints  ( prefix: /report )", sH2))
    story.append(colored_table(
        [[cell(a, bold=True), cell(b, mono=True), cell(c, bold=True), cell(d)] for a, b, c, d in [
            ["Method", "Path",               "Status", "Description"],
            ["GET",    "/{campaign_id}",     "200",    "Download PDF — generates on-demand if report_path is null, returns FileResponse"],
            ["POST",   "/{campaign_id}/generate","200","Force-regenerate PDF from current agent_outputs; overwrites existing file"],
        ]],
        widths=[PW*0.10, PW*0.28, PW*0.09, PW*0.53], hbg=INDIGO
    ))
    story.append(Spacer(1, 8))

    story.append(para("System Endpoints", sH2))
    story.append(colored_table(
        [[cell(a, bold=True), cell(b, mono=True), cell(c, bold=True), cell(d)] for a, b, c, d in [
            ["Method", "Path",        "Status", "Description"],
            ["GET",    "/",           "200",    "Health check — returns system name, status, version string"],
            ["GET",    "/health",     "200",    "Lightweight health check confirming worker is running"],
            ["GET",    "/agent/logs", "200",    "All agent logs across all campaigns (agent_router)"],
            ["GET",    "/agent/stats","200",    "Aggregate stats: total agents run, avg confidence, avg duration_ms"],
        ]],
        widths=[PW*0.10, PW*0.22, PW*0.09, PW*0.59], hbg=INDIGO
    ))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 9. FRONTEND ARCHITECTURE
    # ══════════════════════════════════════════════════════════════════════════
    story.append(eyebrow("Section 9"))
    story.append(para("Frontend Architecture", sH1))
    story.append(hr(INDIGO, 1.5))

    story.append(para(
        "The frontend is a React 18 SPA built with TypeScript and Vite. It features a dark cinematic "
        "design system (Space Grotesk + Syne + JetBrains Mono fonts, six-neon colour palette, "
        "glassmorphism cards), real-time data via WebSocket + TanStack Query, a Three.js 3D agent "
        "network visualisation, and Framer Motion animations throughout."))
    story.append(Spacer(1, 6))

    story.append(para("Pages & Routes", sH2))
    story.append(colored_table(
        [[cell(a, bold=True), cell(b), cell(c)] for a, b, c in [
            ["Route",          "Page Component",  "Primary Function"],
            ["/",              "Dashboard",       "Stat cards (total/completed/active/failed), 3D vis, event feed, recent campaigns table"],
            ["/campaigns",     "Campaigns",       "Campaign grid with industry-coloured cards, status badges, active pulse indicators"],
            ["/campaigns/new", "CampaignForm",    "Create campaign: agent pipeline preview, sectioned form, glowing field inputs"],
            ["/campaigns/:id", "CampaignDetail",  "Full campaign detail with live agent grid, progress tracking, output display"],
            ["/monitor",       "LiveMonitor",     "Real-time stat row, 3D network view, 8-agent status grid, running campaigns list"],
            ["/reports",       "Reports",         "Completed campaign cards with confidence bar, agent pills, PDF download button"],
            ["/analytics",     "Analytics",       "KPI cards, Recharts area/pie/bar charts, per-agent confidence breakdown grid"],
        ]],
        widths=[PW*0.22, PW*0.22, PW*0.56], hbg=NAVY
    ))
    story.append(Spacer(1, 8))

    story.append(para("Key Components", sH2))
    story.append(colored_table(
        [[cell(a, bold=True), cell(b), cell(c)] for a, b, c in [
            ["Component",           "File",                              "Design Detail"],
            ["AgentStatusCard",     "components/campaign/AgentStatusCard","8 agents each with unique neon color, icon, glow; animated shimmer progress bar; confidence badge"],
            ["EventFeed",           "components/live/EventFeed",         "JetBrains Mono terminal; type-badge per event; color-coded by event type; auto-scroll"],
            ["SystemVisualization", "three/SystemVisualization",         "Three.js 3D WebGL network of agent nodes; animated particle flows; interactive camera"],
            ["Sidebar",             "components/layout/Sidebar",         "Per-route neon accent colors; animated active indicator (layoutId); glowing logo mark"],
            ["Header",              "components/layout/Header",          "Breadcrumb title; running campaign badge; ⌘K command palette with color-coded results"],
            ["CampaignForm",        "components/campaign/CampaignForm",  "Agent pipeline preview grid; sectioned card form; focus-glow inputs; gradient submit button"],
        ]],
        widths=[PW*0.22, PW*0.30, PW*0.48], hbg=NAVY
    ))
    story.append(Spacer(1, 8))

    story.append(para("State Management Architecture", sH2))
    story.append(para(
        "<b>Zustand</b> manages global state via <b>campaignStore</b> holding campaign list, "
        "active campaign, per-agent progress, and event log. WebSocket events update the store in "
        "real-time via <b>useGlobalWebSocket</b> hook — no polling for live data. TanStack Query "
        "handles REST fetching with 3–5 second refetch intervals as a fallback. AgentOutput confidence "
        "scores are surfaced in the store as <i>agentProgress[name].confidence_score</i>."))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 10. TECHNOLOGY STACK
    # ══════════════════════════════════════════════════════════════════════════
    story.append(eyebrow("Section 10"))
    story.append(para("Technology Stack", sH1))
    story.append(hr(INDIGO, 1.5))

    story.append(para("Backend Technologies", sH2))
    story.append(colored_table(
        [[cell(a, bold=True), cell(b), cell(c)] for a, b, c in [
            ["Technology",    "Version", "Role & Notes"],
            ["Python",        "3.11",    "Core runtime — asyncio for concurrent agent execution"],
            ["FastAPI",       "latest",  "Async web framework; REST API + WebSocket server; auto OpenAPI docs"],
            ["SQLAlchemy",    "2.x",     "ORM for all DB operations; flag_modified() for JSON column change detection"],
            ["SQLite",        "built-in","Relational database; Render-compatible with persistent disk"],
            ["asyncio",       "stdlib",  "Event loop; asyncio.Queue for campaign worker; asyncio.gather() for parallel DAG levels"],
            ["Pydantic v2",   "2.x",     "Schema validation for all API inputs/outputs and AgentOutput model"],
            ["ReportLab",     "4.2.2",   "PDF report generation with VerticalBarChart, Table, Paragraph, HRFlowable"],
            ["Uvicorn",       "latest",  "ASGI server; Gunicorn+Uvicorn in production on Render"],
            ["Groq SDK",      "latest",  "LLM API client; replaces Ollama/Anthropic for free-tier deployment"],
        ]],
        widths=[PW*0.22, PW*0.13, PW*0.65], hbg=NAVY
    ))
    story.append(Spacer(1, 8))

    story.append(para("Frontend Technologies", sH2))
    story.append(colored_table(
        [[cell(a, bold=True), cell(b), cell(c)] for a, b, c in [
            ["Technology",        "Version", "Role & Notes"],
            ["React",             "18.3",    "UI framework; StrictMode; QueryClientProvider"],
            ["TypeScript",        "5.6",     "Type-safe JS; strict mode; path aliases via @/"],
            ["Vite",              "5.4",     "Build tool; HMR dev server; ESBuild bundler"],
            ["Tailwind CSS",      "3.4",     "Utility-first CSS; extended with custom neon palette and animations"],
            ["TanStack Query",    "5.59",    "Server state; staleTime 10s; refetchInterval 3-5s; retry 2"],
            ["Zustand",           "5.0",     "Lightweight client state; campaignStore; no boilerplate"],
            ["Framer Motion",     "11.11",   "Animation library; motion.div; AnimatePresence; layoutId"],
            ["Three.js",         "0.169",   "WebGL 3D visualisation for agent network"],
            ["React Three Fiber", "8.17",    "React renderer for Three.js; @react-three/drei for helpers"],
            ["Recharts",          "2.13",    "Chart library; AreaChart, BarChart, PieChart with custom styling"],
            ["React Router",      "6.27",    "SPA routing; BrowserRouter; AnimatePresence mode='wait'"],
            ["Lucide React",      "0.453",   "Icon library; 450+ icons"],
        ]],
        widths=[PW*0.22, PW*0.13, PW*0.65], hbg=NAVY
    ))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 11. DATABASE SCHEMA
    # ══════════════════════════════════════════════════════════════════════════
    story.append(eyebrow("Section 11"))
    story.append(para("Database Schema", sH1))
    story.append(hr(INDIGO, 1.5))

    story.append(para("campaigns Table  —  models/campaign.py", sH2))
    story.append(colored_table(
        [[cell(a, mono=True), cell(b), cell(c), cell(d)] for a, b, c, d in [
            ["Column",         "Type",          "Nullable", "Description"],
            ["id",             "String (UUID)", "No",       "Primary key — auto-generated UUID4 via default lambda"],
            ["business_name",  "String",        "No",       "Business display name"],
            ["industry",       "String",        "No",       "Industry vertical / sector"],
            ["location",       "String",        "No",       "Geographic target market (city, country)"],
            ["goal",           "Text",          "No",       "Primary campaign objective — free text, no length limit"],
            ["target_audience","String",        "Yes",      "Audience demographic descriptor"],
            ["budget",         "String",        "Yes",      "Available budget — free text (e.g. '$5,000/month')"],
            ["status",         "Enum",          "No",       "CampaignStatus enum value — enforced via SQLAlchemy SAEnum"],
            ["dag",            "JSON",          "Yes",      "Serialised DAGExecutionPlan.to_dict() — stores node statuses"],
            ["agent_outputs",  "JSON",          "Yes",      "Dict: {agent_name: AgentOutput.model_dump()} — all 8 outputs"],
            ["report_path",    "String",        "Yes",      "Filesystem path to generated PDF file"],
            ["error_message",  "Text",          "Yes",      "Exception detail string when status=FAILED"],
            ["created_at",     "DateTime",      "No",       "Record creation timestamp (UTC)"],
            ["updated_at",     "DateTime",      "No",       "Last update timestamp (UTC) — auto via onupdate"],
            ["completed_at",   "DateTime",      "Yes",      "Completion timestamp set when status=COMPLETED"],
        ]],
        widths=[PW*0.22, PW*0.18, PW*0.10, PW*0.50], hbg=INDIGO
    ))
    story.append(Spacer(1, 8))

    story.append(para("agent_logs Table  —  models/agent_log.py", sH2))
    story.append(colored_table(
        [[cell(a, mono=True), cell(b), cell(c)] for a, b, c in [
            ["Column",           "Type",          "Description"],
            ["id",               "String (UUID)", "Primary key"],
            ["campaign_id",      "String (FK)",   "Foreign key → campaigns.id"],
            ["agent_name",       "String",        "Agent identifier (e.g. 'research_agent')"],
            ["task_id",          "String",        "DAG task ID (e.g. 'research_task')"],
            ["input",            "JSON",          "Task input dict passed to agent.execute()"],
            ["output",           "JSON",          "Full AgentOutput.model_dump() dict"],
            ["state",            "Enum",          "AgentState: PENDING/RUNNING/COMPLETED/FAILED/RETRYING"],
            ["confidence_score", "Float",         "Agent self-reported quality 0.0–1.0"],
            ["retry_count",      "Integer",       "Number of retry attempts (currently unused — reserved)"],
            ["error_message",    "Text",          "Exception message string if state=FAILED"],
            ["duration_ms",      "Integer",       "Wall-clock execution time in milliseconds"],
            ["model_used",       "String",        "LLM model identifier used for this task"],
            ["timestamp",        "DateTime",      "Log entry creation timestamp"],
            ["completed_at",     "DateTime",      "Task completion timestamp"],
        ]],
        widths=[PW*0.22, PW*0.18, PW*0.60], hbg=INDIGO
    ))
    story.append(Spacer(1, 8))

    story.append(para("memory_store Table  —  models/memory_store.py", sH2))
    story.append(colored_table(
        [[cell(a, mono=True), cell(b), cell(c)] for a, b, c in [
            ["Column",       "Type",          "Description"],
            ["id",           "String (UUID)", "Primary key"],
            ["campaign_id",  "String (FK)",   "Optional FK → campaigns.id (null for GLOBAL/BUSINESS types)"],
            ["memory_type",  "Enum",          "MemoryType: SESSION / CAMPAIGN / BUSINESS / GLOBAL"],
            ["key",          "String",        "Memory slot identifier (e.g. 'agent_output_seo_agent', 'industry_knowledge')"],
            ["data",         "JSON",          "Any JSON-serialisable payload — agent output dicts, knowledge objects"],
            ["version",      "String",        "Schema version tag (default '1') for future migration support"],
            ["created_at",   "DateTime",      "First write timestamp"],
            ["updated_at",   "DateTime",      "Last upsert timestamp — updated via onupdate"],
        ]],
        widths=[PW*0.18, PW*0.18, PW*0.64], hbg=INDIGO
    ))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # 12. DEPLOYMENT ARCHITECTURE
    # ══════════════════════════════════════════════════════════════════════════
    story.append(eyebrow("Section 12"))
    story.append(para("Deployment Architecture", sH1))
    story.append(hr(INDIGO, 1.5))

    story.append(para(
        "The platform deploys as two independent services: the Python backend on Render (Web Service) "
        "and the React frontend on Netlify (CDN). This split enables independent scaling, zero-downtime "
        "frontend deploys, and clean separation of compute-heavy AI inference from static asset delivery."))
    story.append(Spacer(1, 6))

    story.append(colored_table(
        [[cell(a, bold=True), cell(b, bold=True), cell(c), cell(d)] for a, b, c, d in [
            ["Service",      "Platform",          "Config File",    "Key Details"],
            ["Backend API",  "Render Web Service","render.yaml",    "Python 3.11 · Gunicorn+Uvicorn workers · GROQ_API_KEY env var · SQLite on persistent disk"],
            ["Frontend SPA", "Netlify",           "netlify.toml",   "Vite build (dist/) · CDN delivery · SPA redirect (_redirects: /* → /index.html)"],
            ["Database",     "SQLite (Render)",   "Persistent disk","Survives deploys; attached to Render service; backup via Render dashboard"],
            ["AI Engine",    "Groq Cloud API",    "Env var",        "Free tier Qwen3 8B / LLaMA 3.2 · GROQ_API_KEY · Rate limited at ~6000 tokens/min"],
        ]],
        widths=[PW*0.18, PW*0.22, PW*0.18, PW*0.42], hbg=NAVY
    ))
    story.append(Spacer(1, 8))

    story.append(para("Environment Variables", sH2))
    story.append(colored_table(
        [[cell(a, mono=True), cell(b), cell(c)] for a, b, c in [
            ["Variable",           "Used By",  "Purpose"],
            ["GROQ_API_KEY",       "Backend",  "Groq Cloud API auth for all LLM calls — set in Render environment settings"],
            ["DATABASE_URL",       "Backend",  "SQLite connection string (default: sqlite:///./lif.db)"],
            ["REPORT_OUTPUT_DIR",  "Backend",  "Filesystem directory for generated PDF files (default: ./reports)"],
            ["VITE_API_BASE_URL",  "Frontend", "Backend API base URL injected at Vite build time via import.meta.env"],
            ["VITE_WS_URL",        "Frontend", "WebSocket server URL injected at build time"],
        ]],
        widths=[PW*0.30, PW*0.15, PW*0.55], hbg=NAVY
    ))
    story.append(Spacer(1, 8))
    story.append(info_box("Production Readiness Notes",
        ["SQLite is suitable for Render free tier and low-to-medium campaign volume. For production "
         "scale (>50 concurrent campaigns), replace with PostgreSQL and add Celery + Redis for the "
         "campaign worker queue to support distributed processing and retry logic.",
         "The Groq API free tier provides ~6,000 tokens/minute. Each campaign run consumes approximately "
         "8-12 LLM calls (1 CEO + 7 agents). Monitor token usage via Groq dashboard; implement "
         "exponential backoff on rate limit errors (HTTP 429) for production resilience.",
         "WebSocket connections reset on Render cold starts (free tier sleeps after 15min inactivity). "
         "The EventEmitter history replay (200 events) mitigates this: reconnecting clients immediately "
         "receive all prior campaign events and can reconstruct full state without additional API calls."],
        SLATE))

    # ── Closing ───────────────────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(Spacer(1, 2.5*cm))
    story.append(hr(INDIGO, 2))
    story.append(Spacer(1, 0.5*cm))
    story.append(para("Lost In Frame Production", sH1))
    story.append(para("Autonomous AI Marketing Operating System", sSub))
    story.append(Spacer(1, 0.3*cm))
    story.append(para(
        "This document provides a complete technical reference for the Lost In Frame Production platform — "
        "from the CEO Orchestrator Agent that plans every campaign through to the ReportLab PDF that "
        "delivers the final marketing strategy. Every component described in this report is implemented "
        "and operational in the current codebase."))
    story.append(Spacer(1, 0.5*cm))

    final = [
        ["Total AI Agents",       "8 (CEO Orchestrator + 7 Domain Specialists)"],
        ["AI Provider",           "Groq API — Qwen3 8B / LLaMA 3.2 (free tier)"],
        ["Backend",               "Python 3.11 / FastAPI / SQLAlchemy / asyncio"],
        ["Frontend",              "TypeScript / React 18 / Vite / Tailwind / Three.js"],
        ["Database",              "SQLite + SQLAlchemy ORM (3 tables)"],
        ["PDF Engine",            "ReportLab 4.2.2"],
        ["Real-time",             "WebSocket via FastAPI (2 channels, 10 event types)"],
        ["Deployment",            "Render (backend) + Netlify (frontend)"],
        ["Report Generated",      datetime.utcnow().strftime("%d %B %Y at %H:%M UTC")],
    ]
    ft = Table(final, colWidths=[PW*0.35, PW*0.65])
    ft.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(0,-1),  LGRAY),
        ("FONTNAME",      (0,0),(0,-1),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0),(-1,-1), 9),
        ("TEXTCOLOR",     (0,0),(0,-1),  NAVY),
        ("TEXTCOLOR",     (1,0),(1,-1),  BTEXT),
        ("GRID",          (0,0),(-1,-1), 0.3, MGRAY),
        ("ROWBACKGROUNDS",(0,0),(-1,-1), [WHITE, LGRAY]),
        ("TOPPADDING",    (0,0),(-1,-1), 5),
        ("BOTTOMPADDING", (0,0),(-1,-1), 5),
        ("LEFTPADDING",   (0,0),(-1,-1), 8),
    ]))
    story.append(ft)
    story.append(Spacer(1, 0.8*cm))
    story.append(hr(INDIGO))
    story.append(para(
        f"Generated by Lost In Frame Production AI OS — {datetime.utcnow().strftime('%d %B %Y')}",
        sCaption))
    story.append(para(
        "Powered by Groq API (Qwen3 8B / LLaMA 3.2) · FastAPI · React 18 · ReportLab 4.x",
        sCaption))

    # ── Build ─────────────────────────────────────────────────────────────────
    doc.build(story)
    print(f"\n✓ Report generated:\n  {out}\n")
    return str(out)


if __name__ == "__main__":
    main()
