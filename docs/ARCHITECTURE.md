# AELIA AI Architecture

## Core loop
User → AELIA API → Orchestrator → Planner / Memory / Policy → Capability Search → Task Decomposer → Specialized Agents → Execution → Verification → Result → Memory / Audit

## Capability primitives
SEARCH, READ, WRITE, CREATE, EDIT, DELETE, ANALYZE, CALCULATE, EXECUTE, DEPLOY, MONITOR, COMMUNICATE, SCHEDULE, REMEMBER, REASON, PLAN, DELEGATE, VERIFY, TRANSFORM, GENERATE, SIMULATE, AUTOMATE, CONNECT, AUTHENTICATE, PAY, PUBLISH, DOWNLOAD, UPLOAD, IMPORT, EXPORT, STREAM, COLLABORATE, AUDIT, SECURE.

## Initial API modules
auth, users, organizations, memberships, conversations, messages, projects, files, capabilities, agents, tasks, workflows, health.

## Later modules
connectors, connector_accounts, permissions, subscriptions, usage_records, payments, notifications, knowledge_sources, documents, embeddings, jobs, executions, agent_runs, tool_calls, webhooks, mcp_servers, mcp_tools and marketplace items.

## Engineering rule
Start modular, not microservice-heavy. Split services only when real load, security isolation or operational needs justify it.
