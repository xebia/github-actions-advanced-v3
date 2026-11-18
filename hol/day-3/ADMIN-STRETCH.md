# Day 3 admin stretch A1-A6

**Time:** Choose one scoped 15-25 minute exercise or carry it into homework.

**Before you start:** Confirm explicit approval in addition to the required role. Use disposable course resources and exact targets, never organization-wide changes to prove a point. If access/infrastructure is unavailable, ask the trainer to demonstrate; A2 can be done without admin access.

## A1 - Custom repository properties

**After M7; needs property-management access.** Define approved `tier` values such as production/internal/sandbox and an `owner-team` property. Record any existing definitions before changing them.

Set values on your disposable repository, inspect a ruleset's property-based target preview, and compare the selected set with the exact-name target. New repositories are governed automatically only if their actual/default property values match; prove the match in Evaluate mode before activation.

**Checkpoint:** Explain how property ownership controls policy scope and verify no other attendee is targeted. **Cleanup:** Remove only your course property values/rule; coordinate removal of shared definitions.

## A2 - Governance blueprint

**After M7; no admin role needed for the design.** Sketch governance for 40 teams and 600 repositories: organization baseline, stricter tier rules, bypass owners, allowed actions, secret scopes, runner isolation and ownership of the central workflow source.

Name who may change each control and how changes are reviewed. Implement only a tiny approved slice on your practice repository, then explain how a malicious workflow edit would be constrained by human and automated gates.

**Checkpoint:** One coherent blueprint and a demonstrated exact-target rule. **Cleanup:** Retire only the experimental rule if not needed for capstone.

## A3 - Allowed actions and an internal mirror

**After S10; needs organization policy owner approval.** Review an action's publisher, license, source, transitive downloads and update process before mirroring it. Create a course-owned mirror only if permitted.

In an isolated approved setting, compare allowing GitHub-authored actions, verified creators and reviewed internal actions. A verified badge is not a security guarantee. Consume the approved mirror immutably and design upstream synchronization plus review; Dependabot alone does not maintain mirrored action source.

**Checkpoint:** Explain what the policy permits, what the mirrored action still downloads and who owns security updates. **Cleanup:** Restore the exact previous allow policy after dependent learners finish; retain/delete the course mirror only with its owner's approval.

## A4 - Runner groups

**After M7; needs runner administrator and a dedicated machine.** Create a group restricted to your repository, register one course runner, and route a benign dispatch-only job by group and label.

Remove only that practice repository's group access temporarily, observe a queued job and cancel it promptly. Restore access and show a successful run. Do not expose a persistent runner to untrusted PRs or install it on a shared machine without approval.

**Checkpoint:** Group authorization is evaluated independently of labels. **Cleanup:** Deregister the exact course runner and deprovision approved dedicated infrastructure, including residual disks/network resources.

## A5 - Observability and audit

**After M7; needs appropriate metrics/audit-log access.** Inspect Actions usage/performance metrics, rule insights and organization audit events for a course ruleset change or workflow disable.

Use the documented API for your actual host to export a narrow time range/query containing only your course resources. Do not export the organization's full audit log, tokens or unrelated users' data to the repository.

**Checkpoint:** Correlate one change, rule evaluation and run by time/resource. **Cleanup:** Keep only approved redacted evidence and remove sensitive raw exports from your own storage.

## A6 - Custom deployment protection rule

**After M8/M9; needs an approved GitHub App and supported environment features.** In a disposable environment, install a course protection App and configure only that environment to use it.

Validate webhook signatures, repository, environment and deployment identity before approving/rejecting through the API. Compare an external deployment decision with M9's merge-check decision; one does not automatically satisfy the other.

**Checkpoint:** A deployment waits for the App, then independently approves or rejects on the correct deployment. **Cleanup:** Remove only the course environment's App protection before retiring the publisher; revoke course credentials without uninstalling a shared App.

Finish with the [Day 3 cleanup checklist](11-Cleanup.md).
