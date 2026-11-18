# M1: First workflow and CI basics

**Time:** 30 minutes.

**Before you start:** Complete [setup](00-Setup.md). The facilitator must publish the organization starter workflow. Use your Tetris practice repository, not the Day 2 app.

**If the starter or runner is unavailable:** Ask the trainer to demonstrate that part before continuing.

## Objectives

Create CI from a starter workflow, configure four triggers, and explain job dependencies and token permissions.

## Tasks

1. In your repository, open **Actions > New workflow** and find the organization's starter. Choose **Configure** and save it as `.github/workflows/ci.yml`. Read its TODOs; replace them with working behavior, not just deleted error steps.

   A starter is a copy, not a live link to central code. See [workflow templates](https://docs.github.com/en/actions/how-tos/sharing-automations/creating-workflow-templates-for-your-organization).

2. Add `push` limited to `main`, `pull_request`, manual dispatch with a `log-level` choice (`info` or `debug`, default `info`), and nightly UTC schedule `0 3 * * *`.

   Scheduled and manual runs require the workflow on the default branch. For non-dispatch events, handle the missing input explicitly. Log only the selected level, not complete contexts or secrets. See [trigger events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

3. Create `build` and `test` jobs with `test` depending on `build`. Each needs its own checkout, Node setup and dependency install from `app`. Run the app's build in one job and tests in the other. `needs` orders jobs; it does not transfer their files.

   Give each job a ten-minute timeout. Use supported release tags, an execution lock, file-level `permissions: {}` and job-level `contents: read`. Disable setup-node's automatic package caching. See [workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).

4. Commit on a feature branch and open a PR. Read the trigger, tested revision, run graph and failed-step logs if needed. Fix your workflow until build and test pass. Re-run the test job, rather than all jobs.

5. After review, merge the working workflow. Dispatch it from `main` using `debug`; compare that input with the push run. Verify the schedule is configured on `main`; do not wait overnight to finish the checkpoint.

<details>
<summary>Hint: make the dependency visible</summary>

The test job needs `needs: build`. A job's `defaults.run.working-directory: app` affects `run` steps, not action inputs. Node setup still needs the intended runtime, and checkout still operates at the repository root.

For the manual input, a value such as `${{ inputs.log-level || 'info' }}` belongs in an environment variable that your script reads safely.
</details>

<details>
<summary>Solution walkthrough</summary>

The workflow has four events but just two jobs. Both start with read-only checkout and explicit Node setup, then `npm ci` in `app`. Build runs `npm run build`; test runs `npm test` only after build succeeds. A failure in build prevents test from running. There is no shared build directory between jobs.

The PR run supplies build/test evidence. A later manual run proves the input works; the default-branch file proves the schedule was installed, not that the nightly event has fired. Record these as different observations.

Ask for the prepared `solution/module-01` reference in the template repository if you need a complete example; that branch is not supplied in this course repository.
</details>

## Checkpoint and cleanup

The PR shows green build and test checks. Keep its run URL and explain where you re-ran one job.

Keep CI enabled for M2. Remove the schedule after observing its configuration unless the facilitator explicitly wants the nightly test; remove it from `main`, not just your PR branch. Close abandoned PRs and cancel obsolete runs.

Next: [M2](02-Matrix-and-data.md).
