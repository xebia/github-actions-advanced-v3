# M6: Coverage gate with a threshold

**Time:** 35 minutes.

**Before you start:** Complete [M4](04-Reusable-workflows.md) and [M5](05-PR-feedback.md). You need repository ruleset administration. Confirm the named rotation test produces the below-80% experiment before class.

**If rulesets are unavailable:** Build and observe the failing CI check, then ask the trainer to demonstrate merge enforcement. A red job without a required-check rule does not prove merging is blocked.

## Objectives

Enforce coverage centrally, distinguish thresholds from baseline deltas, and prove that missing evidence cannot pass.

## Tasks

1. In your allocated reusable workflow, enforce `coverage-threshold` using the canonical Ubuntu coverage report. Read line coverage from the root `coverage` element of `app/coverage/cobertura-coverage.xml`, not the first package/class element.

   Convert `line-rate` from a fraction to percent. Reject missing/empty reports, invalid numbers, rates outside 0-1 and thresholds outside 0-100. Compare full precision before rounding for display: `79.995` is below `80`, even if formatted as `80.00`.

   Parse XML with a maintained XML parser supplied by the template; do not assume XML can be read with `jq`. See [workflow exit codes](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/set-exit-codes).

2. Write actual coverage, threshold and difference from `main` to `$GITHUB_STEP_SUMMARY`, including when the gate fails. Emit `::error::` and return a nonzero exit code below threshold.

   Use a reviewed repository variable such as `BASE_LINE_COVERAGE` containing the measured `main` value, or a validated artifact from a successful `main` run in this repository. Record its source revision. Missing/invalid baseline means **delta unavailable**, not zero coverage and not a passed gate. The absolute threshold must still be enforced.

3. Give the gate a stable job/check name. Ensure test failures, cancellations, missing reports and unexpectedly skipped required jobs fail the final decision. If using a final aggregator, it needs `if: always()` and every dependency, as in [Day 2 Lab 6](../day-2/06-Gates.md).

4. Open a healthy PR and let the named check run once. Then open **Settings > Rules > Rulesets**, create `<handle>-coverage` for only `main`, and require the exact observed check name. Keep the expected source as GitHub Actions when offered, and no course bypass actors.

   Do not guess the reusable job's displayed check name. Select the one actually reported on the PR. Avoid path filters on required workflows; they can leave required results missing. See [required checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#require-status-checks-to-pass-before-merging).

5. On a new PR branch, remove only `app/test/rotation.test.js`, without altering source, coverage exclusions or the threshold. Push and inspect the actual result.

   Tests may pass while coverage fails. Confirm the value is below 80 and the merge box names the coverage blocker. If removing the test does not lower coverage below 80, stop: the template fixture needs correction; do not falsify a report or raise the agreed threshold.

6. Restore the test and push. Show the check recover on the new revision. Then test a missing report in your allocated practice workflow and confirm the gate fails, not skips; restore the healthy implementation.

<details>
<summary>Hint: separate measurement, reporting and decision</summary>

Generate coverage first. Validate and expose the raw numeric measurement next. Write the summary before the threshold step exits with an error. If reporting is in another job, allow it to run after failure but never let that reporting success stand in for the required gate.

Coverage tools may stop with an error before writing outputs. Test failures must stay failures even when a partial report exists.
</details>

<details>
<summary>Solution walkthrough</summary>

For line-rate `0.834`, actual coverage is `83.4%`. At threshold 80 it passes. If the measured baseline is `84.1%`, the summary delta is `-0.7` percentage points, not a relative percent change. A valid rate of exactly `0.8` passes.

Deleting the prepared test lowers measured coverage below the fixed threshold and the required check blocks merge. Restoring it produces a new passing result. Invalid/missing coverage is a separate failure case. The gate belongs in the reusable workflow so each caller cannot accidentally implement a different comparison.

The prepared reference is `solution/module-06` in the template, if supplied.
</details>

## Checkpoint and cleanup

Keep the failing and recovering run URLs and a merge-box observation for each. Explain why rounding, missing reports and a green summary job cannot decide the gate.

Restore the test and workflow. Keep the narrowly scoped rule for the later capstone; do not merge the test-deletion PR.

Next in the timetable: [M8](08-Environments.md), not M7.
