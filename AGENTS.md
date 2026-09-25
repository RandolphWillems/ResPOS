# ResPOS Agent Operating Rules

This repository is for a restaurant POS / order-management system. Feature work must be shaped around operational safety and the real workflow of a restaurant, not just the ideal product vision.

## Non-negotiable constraints

1. Do not expand into advanced features before the core restaurant flow is stable.
   - Required before any extras: login, roles, tables, order creation, stock validation, kitchen/bar print flow, daily closing.

2. Protect the restaurant flow above all else.
   - Order creation must be valid.
   - Stock must not go negative.
   - Table status must remain consistent.
   - Payment and closing logic must be reconciled with actual sales data.

3. Security and access control are mandatory.
   - Staff access must be role-based.
   - Backend routes must enforce permission checks server-side.
   - Never rely on front-end hiding alone.

4. Windows deployment is a real requirement.
   - The system must work reliably on a local Windows restaurant machine.
   - Consider printer compatibility, local database setup, startup behavior, and backup recovery.

5. Operational risk must be reduced before feature scope increases.
   - Do not add Spotify, supplier complexity, or extra reporting before the core flow is production-safe.
   - Avoid scope creep during MVP development.

6. Data integrity must come before convenience.
   - Every order should create a clear audit trail.
   - Stock updates should be transactional.
   - Day closing must reflect real revenue and costs.

## Priority order for development

1. Staff auth and role model
2. Tables and order flow
3. Menu + inventory + stock validation
4. Kitchen / bar printing and status updates
5. End-of-day closing and reporting
6. QR ordering for guests
7. Supplier ordering
8. Spotify integration and optional enhancements

## Specific risk areas that must be handled intentionally

- Missing authentication and authorization
- Restaurant staff accidentally viewing or editing data outside their role
- Orders accepted without stock availability checks
- Table statuses becoming inconsistent with order state
- Printer actions failing silently
- End-of-day totals being incorrect or unrecoverable
- Data loss due to missing backups or schema migration discipline
- Feature work being added before the business-critical flow works

## Engineering expectations for this repo

- Prefer stable, testable backend logic over flashy UI.
- Favor a working restaurant workflow over a broad set of optional modules.
- Keep the MVP realistic and operationally safe.
- Validate every new feature against the restaurant process, not just technical correctness.

## Acceptance rule for new features

A feature is not complete if it causes operational risk in the restaurant process. If a feature risks breaking order flow, stock logic, reporting, printing, or Windows deployment, it must be redesigned or delayed until the risk is handled.

## Quality assurance and test gate

The project has a formal quality gate. The Quality reviewer and the QTAgent are not optional review layers; they are part of the delivery process.

1. QTAgent is responsible for running the relevant test suite after feature work.
   - Run the smallest meaningful validation first.
   - If a feature changes backend logic, run the backend validation and any affected integration tests.
   - If a feature changes the POS workflow, validate the order flow end-to-end by behavior, not just by UI rendering.

2. Quality review is mandatory for every failing test.
   - Determine whether the failure is a logic bug, a regression, a missing requirement, or an environment issue.
   - Classify each failure as blocker, warning, or non-blocking.
   - Do not mark a feature as complete if the failure affects stock, table state, payment, closing, auth, or printer operations.

3. Every failure must be reported to the Feature Builder with a fix direction.
   - Include the failing test name or scenario.
   - Summarize the root cause in plain language.
   - Explain the restaurant impact if left unresolved.
   - Propose the fix or redesign required before merge.

4. No feature is accepted without a working validation path.
   - If the environment is missing Node, pnpm, or the database, that is treated as a verification blocker and must be resolved before acceptance.
   - A feature cannot be marked done on the basis of assumptions or code inspection alone.

5. Quality constraints override feature speed.
   - The Feature Builder must not add new scope while a blocker remains unresolved.
   - A safe, tested MVP is preferred over a larger, unstable release.

## Reporting format to the Feature Builder

For every failing test, the Quality review should provide:

- failing area: which module or workflow broke
- symptom: what the test observed
- root cause: why it failed
- business impact: how it affects restaurant operations
- severity: blocker / warning / non-blocking
- required fix: exact direction for the implementation
- merge status: allowed to continue or must stop

This ensures the Feature Builder works with known operational risks instead of introducing them silently.
