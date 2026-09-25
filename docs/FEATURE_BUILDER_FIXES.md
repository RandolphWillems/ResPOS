# Feature Builder fix handoff

This document contains the fix instructions that must be handed to the Feature Builder after a QA or debugging review. The goal is to ensure every issue is corrected before the feature is considered complete.

## Fix handoff template

- Bug / issue title:
- Affected area:
- Symptom:
- Root cause:
- Restaurant impact:
- Severity:
- Required fix:
- Acceptance criteria:
- Blocking status:

## Current required fixes

### 1. Enforce stock validation before order creation
- Affected area: backend orders and inventory
- Symptom: order is accepted without checking whether stock exists
- Root cause: no transactional stock validation before creating order lines
- Restaurant impact: orders can be sold that cannot be fulfilled
- Severity: Blocker
- Required fix: check stock availability before saving the order and reject or delay when stock is insufficient
- Acceptance criteria: order cannot be created if relevant stock is unavailable; stock stays non-negative
- Blocking status: Must stop until fixed

### 2. Rebuild table status logic from order lifecycle
- Affected area: tables and order flow
- Symptom: table status becomes inconsistent with actual order state
- Root cause: status is manually set without reconciling the full lifecycle
- Restaurant impact: staff cannot trust status on the floor
- Severity: Blocker
- Required fix: derive status from current order and payment state instead of ad hoc updates
- Acceptance criteria: table state always matches open, paid, or closed order state
- Blocking status: Must stop until fixed

### 3. Add print job tracking and failure handling
- Affected area: printing service and order flow
- Symptom: print actions may fail without clear operator feedback
- Root cause: print jobs are not modeled with status handling and retries
- Restaurant impact: kitchen or bar may miss orders
- Severity: Blocker
- Required fix: create print job queue with status updates, failure logs, and retry logic
- Acceptance criteria: each order creates a print task and stores final status
- Blocking status: Must stop until fixed

### 4. Reconcile day closing with actual sales data
- Affected area: reports and closing logic
- Symptom: day close totals may not reflect the real business data
- Root cause: revenue and costs are not yet fully tied to final order records
- Restaurant impact: inaccurate profit, cash reconciliation, and reporting issues
- Severity: Blocker
- Required fix: calculate closing totals from finalized orders and cost data with verification logic
- Acceptance criteria: total revenue, cost, and profit reconcile to actual orders
- Blocking status: Must stop until fixed

### 5. Enforce role-based access control server-side
- Affected area: auth and all protected APIs
- Symptom: routes may be accessible without proper staff permission
- Root cause: front-end-only hiding is not enough and backend checks are missing
- Restaurant impact: unauthorized staff may access confidential or operational data
- Severity: Blocker
- Required fix: add server-side middleware, permission rules, and authorization checks on every sensitive route
- Acceptance criteria: staff cannot access unauthorized endpoints or data
- Blocking status: Must stop until fixed

## Rule for the Feature Builder

The Feature Builder must not continue with broad scope while a blocker exists. The system must be safe for real restaurant use before new features are added.
