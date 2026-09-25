# RefractDebugStruct bug report intake

This file is the working log for bug reports received from the debugging agent. Each report should be transferred to a GitHub Issue and also tracked here until it is fixed.

## Reporting format

- Date:
- Area:
- Symptom:
- Root cause:
- Business impact:
- Severity:
- Fix direction:
- Assigned to Feature Builder:
- Status:

## Current possible bug watchlist

These are issues that need active attention because they can cause operational disruption in a restaurant environment.

1. Order accepted even when inventory is insufficient.
2. Stock goes negative after repeated order creation.
3. Table status does not match the actual order state.
4. Print job fails silently and kitchen/bar staff never receive the order.
5. Day closing totals do not match real sales and costs.
6. Authentication or authorization allows staff to access roles outside their permissions.
7. Duplicate order submissions create duplicate lines or double charges.
8. QR menu loads a table that does not match the correct order session.
9. Database migrations or backups fail without a clear recovery path.
10. Windows local deployment fails on startup or loses printer connectivity after reboot.

## Active bug queue

### 1. Order validation and stock safety
- Area: backend orders + inventory
- Symptom: order can be created without checking stock
- Root cause: missing stock validation before creating order lines
- Business impact: sold items may not be available in the kitchen or stock may be inaccurate
- Severity: Blocker
- Fix direction: validate stock before finalizing each order and block or suspend if insufficient
- Assigned to Feature Builder: Yes
- Status: Pending

### 2. Table state consistency
- Area: restaurant tables + order flow
- Symptom: table remains in the wrong status after order movement or closing
- Root cause: status is updated without reconciling with final order lifecycle
- Business impact: confusion at the POS and wrong order management
- Severity: Blocker
- Fix direction: derive table status from order lifecycle and close states instead of isolated updates
- Assigned to Feature Builder: Yes
- Status: Pending

### 3. Print flow reliability
- Area: printing service
- Symptom: kitchen/bar printer may fail without clear error handling
- Root cause: no robust print status handling and no fallback workflow
- Business impact: kitchen staff may miss orders
- Severity: Blocker
- Fix direction: create print queue, status tracking, retry or failed-task alerting
- Assigned to Feature Builder: Yes
- Status: Pending

### 4. Day closing integrity
- Area: reports + day closing
- Symptom: totals can be inaccurate or not tied to actual sales
- Root cause: closing logic is not yet reconciled with real paid orders and costs
- Business impact: false profit, false cash checks, and reporting drift
- Severity: Blocker
- Fix direction: rebuild close logic from final order data, with audit trail and reconciliation checks
- Assigned to Feature Builder: Yes
- Status: Pending

### 5. Auth and permission enforcement
- Area: auth + API routes
- Symptom: staff may access routes or screens they should not see
- Root cause: permission checks are not yet enforced server-side across all routes
- Business impact: unauthorized access to sales, stock, and setup data
- Severity: Blocker
- Fix direction: add server-side permission enforcement, staff role checks, and protected route middleware
- Assigned to Feature Builder: Yes
- Status: Pending

## Release note note

Possible bugs should be added to the release notes as risk warnings when they are known but not yet fully resolved. This ensures that stakeholders understand the operational risk and the expected improvement path.
