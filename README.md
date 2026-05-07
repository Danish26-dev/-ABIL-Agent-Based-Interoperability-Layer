# ABIL

### Agent-Based Interoperability Layer for Government System Synchronization

ABIL is a distributed middleware orchestration platform designed to solve interoperability and synchronization challenges between the Karnataka Single Window System (SWS) and independent department legacy systems such as BESCOM, KSPCB, Labour Department, and other government platforms.

Built as an external orchestration layer, ABIL enables reliable two-way synchronization, conflict reconciliation, and auditability across heterogeneous government systems without modifying existing infrastructure.

---

## The Problem

Government systems today operate in silos.

The Karnataka Single Window System (SWS) and multiple department systems independently maintain overlapping business records with:

- Different schemas and APIs
- Isolated workflows
- No real-time synchronization
- Multiple authoritative sources
- No unified operational state

This results in:

- Inconsistent business records
- Conflicting updates across departments
- Duplicate data propagation
- Fragmented workflows
- Lack of auditability and traceability

The challenge becomes significantly harder because:

- Existing systems cannot be modified
- Big-bang migration is not feasible
- Some systems do not emit events
- Synchronization must remain auditable and reversible
- UBID is the only reliable cross-system identity anchor

This is not simply an API integration problem.

It is fundamentally a distributed systems consistency and state reconciliation problem.

---

## The Solution

ABIL introduces an external middleware orchestration layer that synchronizes SWS and department systems without requiring invasive source-system changes.

Instead of replacing infrastructure, ABIL:

- Detects state changes across systems
- Translates heterogeneous schemas
- Propagates updates bidirectionally
- Resolves synchronization conflicts
- Maintains complete auditability
- Coordinates deterministic reconciliation workflows

From isolated systems to coordinated interoperability.

---

## Why Agent-Based Middleware?

Traditional middleware pipelines are often rigid and difficult to scale across heterogeneous government systems.

ABIL uses specialized orchestration agents because synchronization is not a fixed workflow problem.

Each update may require:

- Schema translation
- Policy evaluation
- Conflict handling
- Retry coordination
- Audit validation
- Propagation routing
- State reconciliation

depending on the originating system and current distributed state.

This allows ABIL to behave as a dynamic interoperability coordination engine instead of a static integration pipeline.

---

## System Architecture

ABIL follows a modular multi-agent architecture:

1. Listener Agent
   - Detects changes using polling and delta tracking
   - Supports systems without native event emission
   - Tracks state hashes for change detection

2. Decision Agent
   - Evaluates synchronization policies
   - Determines propagation direction and execution strategy
   - Handles workflow coordination

3. Translation Agent
   - Converts heterogeneous schemas into a Canonical Data Model
   - Simplifies onboarding of new departments
   - Enables scalable interoperability

5. Synchronization Agent
   - Executes bidirectional propagation
   - Maintains idempotent synchronization state
   - Prevents circular update loops

7. Conflict Resolution Agent
   - Applies policy-driven reconciliation
   - Supports authoritative field ownership
   - Escalates high-risk conflicts

8. Audit & Monitoring Agent

   - Maintains complete traceability
   - Stores synchronization history
   - Enables replayability and compliance

---

## Architecture Overview
<img width="1219" height="862" alt="ABIL FLOW CHART" src="https://github.com/user-attachments/assets/487838b3-4243-4e9d-8d21-027990175033" />

---

## Canonical Data Model

ABIL uses a Canonical Data Model (CDM) internally.

Instead of building N×M mappings between every department system, each system translates only once into the ABIL intermediary schema.

Benefits:

- Scalable onboarding
- Reduced integration complexity
- Easier maintenance
- Consistent synchronization workflows

UBID acts as the common identity anchor across all mappings.

---

## Conflict Resolution

ABIL does not rely on unsafe “last-write-wins” synchronization.

Instead, it uses deterministic policy-driven reconciliation.

Example:

- SWS authoritative for identity-related fields
- BESCOM authoritative for utility-related metadata
- Department-specific ownership policies

When simultaneous updates occur, ABIL evaluates:

- Source authority
- Timestamps
- Version metadata
- Propagation history
- Synchronization policies

before applying reconciliation.

Every resolution remains:

- Explainable
- Reversible
- Fully auditable

---

## Reliability & Failure Handling

ABIL is designed around distributed systems failure scenarios.

The platform guarantees:

- Idempotent synchronization
- Retry-safe propagation
- Loop prevention
- Version-aware reconciliation
- Event-source tracking
- At-least-once delivery
- End-to-end auditability

Even under:

- duplicate events,
- delayed propagation,
- retry conditions,
- or partial failures,

ABIL maintains deterministic synchronization state.

---

## Operational Workflow

### SWS → Department Flow

1. Business updates data inside SWS
2. Listener Agent detects delta
3. Decision Agent evaluates synchronization strategy
4. Translation Agent maps schemas into CDM
5. Sync Agent propagates updates
6. Audit Agent records transaction history

---

### Department → SWS Flow

1. Department system updates business record
2. Listener Agent detects state change
3. Translation Agent normalizes schema
4. Sync Agent propagates update into SWS
5. Audit history maintained end-to-end

---

### Conflict Scenario

1. Simultaneous updates occur for same UBID
2. Conflict Agent detects inconsistency
3. Policies determine authoritative ownership
4. Deterministic reconciliation applied
5. Complete audit trail stored

---

## Frontend Visualization Layer

ABIL includes a real-time operational visualization interface for demonstration and monitoring.

The interface visualizes:

- Agent orchestration
- Synchronization workflows
- Event propagation
- Conflict handling
- Audit timelines
- Reconciliation state

The frontend was intentionally designed to help visualize distributed synchronization workflows.

In production deployment, ABIL primarily functions as a backend middleware bridge.

The frontend acts only as an operational visibility layer.

---

# Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB |
| Orchestration | Strands SDK |
| AI Layer | AWS Bedrock, Amazon Nova |
| Architecture | Event-Driven Microservices |
| Communication | Polling, APIs, Adapter Layers |

---

## AI Usage

ABIL does NOT use LLMs for:

- Synchronization execution
- Reconciliation decisions
- Propagation control
- Critical state mutations

Core synchronization remains:

### Deterministic and Policy-Driven

AI capabilities are used only as assistive operational intelligence for:

- Workflow narration
- Operational summaries
- Anomaly explanations
- Governance assistance

and only on sandboxed/synthetic data.

---

## Sandbox Deployment Approach

If provided access to sandbox SWS and department endpoints, ABIL would:

- Integrate externally using exposed APIs
- Continuously detect changes through polling-based adapters
- Normalize records through the Canonical Data Model
- Propagate updates across connected systems
- Detect conflicts automatically
- Maintain full auditability and replayability

without modifying any underlying infrastructure.

---

## Non-Negotiables Compliance

| Requirement | Compliance |
|---|---|
| No modification to source systems | ✅ |
| UBID as primary identity anchor | ✅ |
| Idempotent synchronization | ✅ |
| Full auditability | ✅ |
| Sandbox/synthetic data only | ✅ |
| No hosted LLM usage on raw PII | ✅ |

---

## Demo Capabilities

The prototype demonstrates:

- SWS → Legacy synchronization
- Legacy → SWS synchronization
- Conflict simulation and reconciliation
- Real-time orchestration visualization
- Distributed event propagation
- Audit tracking and replayability
- Middleware coordination under failure-safe conditions

---

## Scalability

ABIL is designed for:

- Incremental onboarding
- Future department integrations
- Distributed orchestration
- Large-scale interoperability
- State-wide deployment scenarios

The architecture enables governments to modernize interoperability incrementally instead of replacing entire ecosystems through risky large-scale migrations.

---

## Risks & Trade-Offs

### Polling vs Real-Time Events

Polling introduces slightly higher latency but supports unmodifiable systems.

### Deterministic Rules vs Autonomous AI

Deterministic orchestration improves:
- Auditability
- Governance
- Reliability
- Explainability

### Distributed Coordination Complexity

Distributed synchronization increases orchestration complexity but improves resilience and modularity.

---

# Project Structure

```text
ABIL
├── frontend/               # React operational interface
├── backend/                # Middleware orchestration engine
├── agents/                 # Synchronization & orchestration agents
├── services/               # Integration adapters & APIs
├── database/               # Persistence & audit storage
├── docs/                   # Architecture & workflow documentation
├── public/                 # Static assets
├── components/             # Shared frontend components
└── utils/                  # Helper utilities & shared logic
```

---

# Setup

## Backend Setup

```bash
cd backend

yarn install
```

Create `.env`:

```env
PORT=4000
BEDROCK_ENABLED=true

AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
AWS_REGION=YOUR_AWS_REGION
```

Run backend:

```bash
yarn dev
```

---

## Frontend Setup

```bash
cd frontend

yarn install
```

Create `.env`:

```env
REACT_APP_API_URL=http://localhost:4000
```

Run frontend:

```bash
yarn start
```

---

# Future Scope

- Production-grade event streaming
- Advanced governance dashboards
- AI-assisted anomaly detection
- Intelligent schema onboarding
- State-wide interoperability expansion
- Enterprise-scale orchestration pipelines

---

# Team

## Corsair Devs

Built for:

## PAN IIT AI for Bharat Hackathon

### Theme 2 — Two-Way Interoperability Between the Single Window System and Department Systems

---

# Final Vision

ABIL transforms fragmented government systems into a synchronized, auditable, and interoperable ecosystem without requiring infrastructure replacement.

Instead of forcing migration, ABIL enables systems to communicate intelligently through deterministic middleware orchestration and distributed state reconciliation.
