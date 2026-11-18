# M2b: Why is my workflow not starting?

**Time:** 25 minutes: 20 to investigate, five to compare.

**Before you start:** Complete [M2](02-Matrix-and-data.md). Save your work. The facilitator supplies `broken/triggers` in your practice repository, or six inert exercise files to inspect.

**If the branch is missing:** Do not create it from `main` and assume the faults exist. Ask the trainer to provide or demonstrate the fixtures.

## Objectives

Distinguish a missing run from invalid configuration, a skipped job, an unexpected matrix and a queued job.

## Tasks

1. Inspect the supplied branch and six files without merging them into `main`. Apply this checklist in order:

   1. File: correct extension and `.github/workflows/` directory?
   2. Event: does it fire from this branch?
   3. Filter: do branch, path or activity filters match?
   4. Selection: did `if` or matrix expansion omit the job?
   5. Runner: valid label and permitted group?

2. For each file, record the symptom, cause, smallest fix and evidence. Use the Actions tab, workflow validation messages and the [event reference](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows). An empty run history is evidence too; do not invent logs for a run that never existed.

3. Correct the six faults. Use manual dispatch for a quick smoke test where provided, but separately establish that the intended event is configured correctly.

4. Explain every cause to your partner without looking at the solution. Use the [troubleshooting article](https://devopsjournal.io/blog/2022/08/12/workflows-not-starting) for the debrief.

<details>
<summary>Hints and solution: six faults</summary>

| Fault | Symptom | Fix and evidence |
| --- | --- | --- |
| `ubuntu-latests` | Job waits for an unmatched runner | Use a real permitted label; cancel the old queued job and trigger a new one |
| Schedule only on a feature branch | No scheduled run | A schedule must exist on the default branch; inspect that requirement and demonstrate only in an approved disposable repo |
| Six cron fields or an invalid day name | Invalid workflow or wrong schedule | Use five valid fields, for example `17 3 * * *`; validation errors are not a silently successful schedule |
| `github.ref == 'main'` | Job skipped on a push | Compare with `refs/heads/main` for a main-branch push; PR runs use different refs, so choose an event-appropriate condition |
| Exclusion removes a required combination | Run exists, expected test leg absent | Expand the matrix on paper and restore the missing combination; count the resulting jobs |
| `.github/workflow/` | File not discovered | Move it into `.github/workflows/` and push an event that actually triggers it |

Use event-specific fixes, not a blanket `if: true`. The intended schedule cannot run on `broken/triggers`; six green manual runs alone do not prove all six original triggers work. Keep manual smoke-test evidence and default-branch schedule evidence distinct.

The prepared answer branch is `solution/module-02b` in the template, if supplied.
</details>

## If you finish early

Investigate a path filter that excludes your edit, a push made with `GITHUB_TOKEN` that does not trigger a new push workflow, a schedule disabled after inactivity in a public repo, and a fork PR awaiting approval. Describe the cause; do not weaken fork protections or enable an event loop to prove it.

## Checkpoint and cleanup

Name all six causes and show a verified fix for each. Record which intended events actually fired and which were explained or demonstrated. Never claim a feature-branch schedule ran.

Cancel unmatched-runner jobs, remove temporary schedules and return to your saved M2 work. Do not merge the broken fixtures into CI.

Next: [M3](03-Composite-actions.md).
