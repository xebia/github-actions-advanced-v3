# Day 3 facilitator prerequisites and delivery guide

## Scope and readiness

This folder converts **GitHub Actions Training - Day 3 - Build It Yourself.pdf** into learner labs. The [index](README.md) maps every core module to PDF pages and times. The companion Day 3 hands-on syllabus and slide outline supplied with the PDF inform the stretch/homework details.

**This is a documentation deliverable, not a runnable template release.** This fork currently supplies the Day 2 server app, examples and solutions. It does not supply the separate Day 3 Tetris app, Dockerfile, central organization repositories, broken fixtures, solution branches, App installation or remote policy. Do not advertise the Day 3 lab environment as ready until the checks below pass.

Keep source `.github` and actions repositories centrally owned. Learners can author their allocated central files through reviewed PRs; approved owners merge them. Avoid having every attendee overwrite `reusable-ci.yml` or move the same `v1` tag.

## Assets to prepare before inviting learners

| Asset | Acceptance criteria |
| --- | --- |
| Tetris template | Static app, buildable root Dockerfile, locked Node dependencies, lint/test/build/coverage scripts matching [setup](00-Setup.md) |
| Coverage fixture | All source included, valid Cobertura line coverage above 80%; deleting only `app/test/rotation.test.js` puts it below 80%; restoration recovers |
| Coverage helper | Maintained XML parser; validates missing/invalid report, root line-rate and range; no jq-on-XML shortcut |
| Runner/runtime matrix | Ubuntu/24, Ubuntu/26, Windows/24, macOS/24 preflighted; otherwise document a supported four-leg replacement |
| Base images | Reviewed clean image plus preflighted failing tag/digest; actual HIGH/CRITICAL findings on current database; never deploy/publish the vulnerable variant |
| Org starter | Public/appropriately visible organization `.github` repository with `workflow-templates/ci.yml` and matching `ci.properties.json`; available to the actual attendee repo visibility |
| Shared actions | Allocated action directories, reviewed versions and owner-coordinated release tags |
| Reusable workflows | Allocated filenames in `.github/workflows`, typed inputs and mapped coverage output; fake-secret example only |
| Required workflows | Allocated files or a centrally reviewed common implementation; eligible host events/ref, fixed coverage policy and independent Trivy verdict/SARIF reporting |
| Trigger fixtures | `broken/triggers` with the six non-privileged faults from M2b; intended triggers and manual smoke-test cases documented separately |
| External publisher | Approved GitHub App with narrow installation scope, Checks write and necessary metadata reads; short-lived credential handoff without source/history exposure |
| Recovery references | Reviewed cumulative core solution branches and optional stretch solutions, with instructions for accessing them without overwriting learner work |

Test workflow-template visibility with an attendee account, not just an organization owner. Starter-workflow discovery and private/internal reusable-workflow access are different settings.

For central naming, provide each attendee: org/host, practice repo, shared-action path, reusable-workflow path, required-workflow path, authorized reviewers, ruleset name and permitted disposable second repository.

## Branch and fixture handoff

The PDF names `solution/module-01`, `02`, `02b`, `03`, `04`, `05`, `06`, `08`, `07`, `07b`, `09`. Build/review recovery snapshots in that **delivery order**, not numeric sorting. Learner references use those names only if actually published.

Creating a repository from a template does not guarantee its non-default branches are copied. Confirm each learner can access the fixtures/references, or distribute them explicitly. Do not fabricate unavailable branch links in course docs.

The broken branch must contain only bounded, non-privileged diagnostics. Provide dispatch smoke tests where useful; do not leave unknown-runner jobs or schedules running. Keep the invalid cron example inert if it would block useful diagnostics.

## Permissions and feature preflight

Check independently on the chosen host/plan/repository visibility:

- Hosted Actions availability and budget, permitted OS labels/runtime setup, action download access and execution-lock support.
- Organization-owned repositories for Enterprise Managed Users and `ghe.com`, correct CLI host, attendee repo administration and partner write access.
- Organization ruleset management, required-workflow eligibility, Evaluate mode and source-sharing authority. Broad owner access is not a prerequisite for every learner; offer a scoped authorized role or trainer demonstration.
- Required environment reviewers, self-review prevention, wait timers, deployment branch policy and Pages support.
- Private/internal reusable action/workflow sharing, source visibility and organization action policy. Sharing source content can expose it beyond one ruleset target.
- Trivy image/database network access, image build capacity, artifact retention limits and code-scanning/SARIF entitlement.
- App-based checks and expected-source binding, without widening tokens for forks or handing out a shared private key.

Never activate a wildcard target, buy a plan, grant bypass or change enterprise policy to finish a checkpoint. Preview the exact target with a partner. A single-repo ruleset can still depend on a source-sharing change whose exposure is broader; obtain source-owner approval separately.

## Day-before dry run

1. Create a fresh practice repo as an attendee. Verify the app scripts, named coverage fixture, default branch and all allocated source paths.
2. Work through M1-M4 on that identity: starter discovery, four triggers, exactly four matrix jobs, artifact URLs, trigger diagnoses, local/shared action and reusable output. Confirm the lock resolves reviewed dependencies and is actually enforced on the target host.
3. Re-run M5 feedback concurrently and with more than one page of comments. Confirm one bot-owned marker comment, no privileged checkout, and read-only fork behavior.
4. Measure M6 above/below/exactly 80, missing/invalid coverage and displayed rounding near 80. Confirm a failure is a required merge blocker and a restored test recovers. Verify the baseline delta's source separately from the absolute gate.
5. Run M8 from `main`, observe reviewer/wait timer, same-byte mock promotion and masked/allowlisted OIDC output. No cloud resources or JWT artifacts should exist.
6. Test M7 in a fresh app repo with **no local workflows**. Trigger coverage and Trivy failures independently, confirm actual Security upload where eligible, then recover. Rule insights must name only approved targets. Evaluate-only observations are not enforcement proof.
7. Run M7b with real owners on the base branch: pipeline owner required for workflows, catch-all owner for app changes, CODEOWNERS itself protected.
8. Run M9 pending/success/failure and new-SHA behavior with the expected App. Confirm check selection after its first publication and no competing status with the same name.
9. Walk one PR through three independent gates. Then test the [cleanup order](11-Cleanup.md), including removal of course-only requirements before retiring their publishers.

Record real run links and unresolved restrictions in the training delivery record. This folder does not claim that remote tests, scanner runs or timings have already passed.

## Safety and validation before publishing runnable assets

Follow the repository's [delivery requirements](../../DELIVERY-REQUIREMENTS.md): reviewed release tags with generated execution locks, file-level empty permissions and only necessary job grants. The PDF's inline SHA pin is taught as a comparison in S10, not silently mixed with a second immutable-dependency convention.

Keep untrusted code in read-only CI jobs. Separate comment/check/SARIF API publication from checkout/execution of PR code. Do not pass App credentials or deployment secrets to a Docker build, upload full contexts or preserve raw OIDC tokens.

Validate every runnable starter, solution, shared action and workflow with actionlint, zizmor and applicable CodeQL GitHub Actions/language analysis before release. Include generated/materialized examples in scope. Report unsupported surfaces and tenant-only checks explicitly; a passing local Markdown link check is not workflow security validation.

### Local documentation validation

The documentation update was checked locally on 2026-11-18:

- All 31 Markdown files under `hol` were checked: 117 local file/heading links resolve, and code fences and collapsed hints are balanced.
- The 11 core modules match the PDF's sequence, including M8 before M7; S1-S10 and A1-A6 are present.
- `node --test tools/workflow-triggers.test.mjs`: all 17 existing tests passed after updating their Day 2 paths.
- Git whitespace validation passed.

No Day 3 executable assets were added or run. App coverage thresholds, workflow syntax/security scans, organization enforcement, API writes and end-to-end learner timings remain unverified until the separate training assets and tenant are prepared.

## Timing and recovery

Use the [timetable](README.md#running-order). The time boxes already consume their blocks; do not promise additional 10-15 minute slack in every block. Reserve facilitator assets and run evidence so runner queues do not consume build time. Take unfinished final steps into homework, but discuss each checkpoint.

M1-M4 are warm-up; spend most explanation on the learner's observed result. M5-M9 are the real scenarios. M8 must precede M7. Route fast learners to S1-S10; owner/infrastructure-dependent work belongs in A1-A6.

When blocked, demonstrate in an authorized environment and clearly distinguish trainer evidence from learner execution. If even that is unavailable, explain expected behavior and record it as unobserved.

## Corrections to use in the debrief

- Invalid cron may be rejected rather than quietly accepted. A default-branch schedule cannot be proved by six manual runs on a feature branch.
- A re-run uses the old revision. A code fix needs a new run/commit.
- The matrix example must actually expand to four legs on supported runtimes.
- A reused central ref can be moving for the workshop; production immutability requires reviewed pinned/locked resolution.
- Catch-all ownership means an app-only PR still needs its matching owner; it just does not need the platform owner.
- Code-owner approval is one of the capstone's merge gates. A production deployment from `main` happens after merge and does not by itself block the PR.
- Restrict-file-path push rules can block permitted-looking PR updates and affect forks; they are not simply a PR-only editing policy.
- App checks, GitHub Actions-created checks and commit statuses are distinct publishers/objects. Bind the intended source and revision.

Finish by coordinating named rule cleanup, shared settings restoration, short-lived credential revocation and dedicated runner/capacity ownership. Never remove shared resources while learners still depend on them.
