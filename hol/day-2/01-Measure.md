# 🔨 Lab 1: Find the bottleneck

**Time:** About 10 minutes.

**Before you start:** Complete [setup](00-Setup.md) and open your lab repository.

**If you cannot run the workflow:** Ask the trainer to demonstrate the baseline. Use the run timeline if you cannot access the metrics dashboard, and note whether your measurements come from your own run or the trainer's demonstration.

## Objectives

Separate queue delay, setup and execution time; propose an optimization supported by evidence rather than by a single total duration.

## What this baseline does

The app is deliberately small, so this teaching version adds work that is easy to see in the timeline:

- Every baseline run downloads the reviewed **559 MB CodeQL bundle** into a new temporary directory, verifies its checksum, extracts it and runs its version command. It does not use a cache or the runner's preinstalled CodeQL.
- `npm test` includes a **20-second artificial wait**, followed by real HTTP endpoint checks.
- `npm run build` includes a **20-second artificial wait**, followed by real application packaging.

The waits simulate slow work; they do not consume CPU like compilation. They also apply when later labs run these same app commands. Leave them unchanged when comparing workflows, and do not use them to argue that a faster runner would help.

Allow several minutes for the baseline, depending on download speed and runner availability. The CodeQL download is the same one you will cache in Lab 2.

## Tasks

1. In your lab repository, copy `examples/workflows/01-baseline.yml` to `.github/workflows/01-baseline.yml`. Run `gh actions-lock`, review the pinned versions, then commit and push to your default branch.

   In **Actions**, select **Lab 01 baseline → Run workflow** on that branch. Open the completed run. If it is still waiting for a runner when the lab time ends, ask the trainer to demonstrate the comparison. [Managing workflow runs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs)
2. Record these values from the run:

   - The runner type.
   - The queued and started times, and the job duration.
   - The duration of checkout, Node setup, install, and each check.
   - The CodeQL download and verification time, separate from extraction. The helper logs `download_ms` and `verify_ms`.
   - Any failures, retries or cancellations.
   - The workflow's total time from start to finish, and the sum of all job durations.

   What can these numbers tell you about billable usage, and what can they not tell you? [Billing for GitHub Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
3. If permitted, compare [performance and usage metrics](https://docs.github.com/en/actions/how-tos/administer/view-metrics); access/aggregation can differ, so use the run timeline if unavailable. Propose a first target and explain why it is material.

| Observation | Your evidence |
| --- | --- |
| Queue versus execution | |
| Setup versus test/lint/build | |
| Feedback latency versus job time | |
| Proposed optimization and uncertainty | |

<details>
<summary>Hint</summary>

Do not count waiting for a runner as test execution, and do not assume the longest visible step will remain the bottleneck after a change.
</details>

<details>
<summary>Solution / interpretation</summary>

The [baseline workflow](../../examples/workflows/01-baseline.yml) gives you something to measure before changing it. There is no single correct optimization; it depends on where your run spends its time.

If dependency downloads take most of the setup time, caching those downloads is worth testing. If independent checks take most of the execution time, try running them in parallel. If the run spends most of its time waiting for a runner, investigate available capacity first.

Compare several runs when possible. A dashboard may summarize more runs than the one you opened, including failures and cancellations, so its numbers may differ from your worksheet.

Lab 2 isolates the CodeQL download: compare its download, verification and extraction timings with these baseline steps, not its total job duration with this workflow's total. The baseline also runs the app checks, which Lab 2 does not.
</details>

## Success and cleanup

You should have a completed worksheet and a reason for your first optimization experiment.

Cancel runs you no longer need. Keep **Lab 01 baseline** enabled for the comparisons in Labs 2 and 3, then disable it after Lab 3. Check that you have not added any scheduled runs.

Next: [Lab 2](02-Cache.md).
