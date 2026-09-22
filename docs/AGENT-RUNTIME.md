# AELIA Agent Runtime

## Agent execution model

AELIA Agents are not independent chatbots. They are controlled workers inside the AELIA capability system.

**Goal → Plan → Capability Search → Permission Check → Execute → Verify → Report → Remember**

## Agent definition

Each agent should eventually have:

- agent_id
- name
- description
- version
- system_instructions
- allowed_capabilities
- denied_capabilities
- model_policy
- memory_policy
- project_scope
- organization_scope
- approval_policy
- budget_policy
- tools
- status
- audit_policy

## Capability selection

The runtime should select capabilities from a registry instead of allowing arbitrary tool calls.

Example:

`SEARCH` → web/search connector
`READ` → file/document capability
`WRITE` → project file capability
`EXECUTE` → sandboxed code runner
`COMMUNICATE` → authorized SeaChat connector
`DEPLOY` → authorized deployment connector

## Safety and approvals

High-impact actions should support explicit approval gates, including:

- publishing
- deleting data
- sending external communications
- spending money
- deploying production infrastructure
- changing permissions
- accessing sensitive connector data

## Multi-agent execution

A future AELIA Operator can delegate:

- Research Agent → gather evidence
- Developer Agent → implement code
- Analyst Agent → inspect data
- Creative Agent → produce content
- Reviewer Agent → verify the result

The operator should combine results and expose the execution trace.

## Long-running work

Tasks should support:

- queued
- running
- waiting for approval
- retrying
- completed
- failed
- cancelled

Each run should have progress events and an audit record.

## Current status

The repository currently contains the UI foundation, local task/agent state and API scaffolding.

The next production step is a persistent authenticated runtime backed by a database and worker queue.
