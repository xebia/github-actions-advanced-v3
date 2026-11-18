# M2: Matrix, job summaries and passing data

**Time:** 30 minutes.

**Before you start:** Complete [M1](01-First-workflow.md). Confirm both selected Node versions work with the prepared app.

**If a platform or runtime is unavailable:** Ask the trainer to demonstrate that leg; record the substitution.

## Objectives

Predict a matrix expansion, preserve coverage evidence, and pass small values between steps and jobs.

## Tasks

1. Replace the single test configuration with two OS values and two supported runtime versions. Use `ubuntu-latest` and `windows-latest`, Node 24 and 26 if preflight confirms both. Exclude Windows/26 and include a new macOS/24 combination using `macos-latest`. Predict the result **before** pushing: `4 - 1 + 1 = 4`.

   This keeps two base OS values and adds one explicit combination, without requiring an older Node version the app might not support. An include that merely adds a property to an existing combination would not add a job.

   Set `fail-fast: false`, explicit Bash shells and descriptive job names. If a hosted OS is not authorized, use the facilitator's preflighted four-leg matrix instead. See [matrix strategies](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations).

2. Run `npm run test:coverage` per leg. Upload `app/coverage` with a unique name containing OS and runtime, `retention-days: 7`, and failure on missing files. Keep upload conditional on a report existing if tests fail; missing evidence must remain visible as failure, not an empty success.

   Use the upload action's `artifact-url` output to link the report from `$GITHUB_STEP_SUMMARY`. Explain that downloading still requires repository access. See [artifacts](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-what-your-workflow-does/storing-and-sharing-data-from-a-workflow).

3. Give a metadata step an `id`; write `build-label=<your value>` to `$GITHUB_OUTPUT`. Read it in a later step and expose it as a build job output. Add a `report` job with `needs: build` that reads `needs.build.outputs.build-label`. Pass expression values through `env`, not directly into shell code.

4. Set an environment variable through `$GITHUB_ENV`; show it in the **next** step in the same job. Explain why the report job cannot read that variable unless you pass it separately.

5. Make one leg fail using a temporary condition on its exact matrix values and `exit 1`, without breaking the app globally. Confirm the other legs finish. Inspect the failed job and re-run it once without changing code; expect failure again.

   Then remove the deliberate failure and push a new commit. This creates a new run; re-running an old job does not pick up a code fix from a newer commit.

<details>
<summary>Hint: outputs are not a matrix result database</summary>

Use the non-matrix build job for the cross-job output exercise. Matrix jobs publishing the same output name can overwrite one another; completion order is not reliable. Use one uniquely named coverage artifact per leg and choose one documented Linux leg as the later canonical coverage result.
</details>

<details>
<summary>Solution walkthrough</summary>

The final test legs are Ubuntu/24, Ubuntu/26, Windows/24 and macOS/24. Windows/26 was removed; macOS/24 is new. The facilitator must confirm runtime and runner availability rather than silently accepting a failing compatibility test.

Each leg checks out code, sets up its selected Node version, installs dependencies and runs coverage. The artifact name includes both matrix axes. A summary step reads that upload's URL. The build job separately exposes a named step output to the report job; `$GITHUB_ENV` is only for later steps in its own job.

The prepared reference is `solution/module-02` in the template, if supplied.
</details>

## Checkpoint and cleanup

One healthy run shows exactly four matrix test jobs, uniquely named coverage artifacts and linked summaries. Record the expanded combinations and the output printed by the report job.

Remove the deliberate failure, keep canonical coverage evidence for M6, and cancel duplicate runs. Do not repeat the Day 2 caching or `max-parallel` exercise.

Next: [M2b](02b-Not-starting.md).
