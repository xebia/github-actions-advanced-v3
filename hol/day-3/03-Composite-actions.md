# M3: Composite actions

**Time:** 35 minutes.

**Before you start:** Restore the healthy [M2 workflow](02-Matrix-and-data.md). The facilitator must allocate a publication path in the shared actions repository.

**If you cannot publish a shared action:** Complete the local action, then ask the trainer to demonstrate the approved shared copy.

## Objectives

Extract repeated steps into a composite, expose a coverage output and consume a reviewed shared version.

## Tasks

1. Create `.github/actions/setup-and-test/action.yml` with `name`, `description`, inputs `runtime-version` and `coverage-threshold`, and output `coverage-percent`. Use `runs.using: composite`. Give inputs and outputs meaningful descriptions.

   Move Node setup, dependency installation, build and coverage tests into it. If you have an explicit restore-only cache, preserve that policy; do not add a combined cache writer or implicit setup-node caching. Set `shell: bash` on **every** `run` step. See [composite actions](https://docs.github.com/en/actions/tutorials/create-actions/create-a-composite-action).

2. Parse the line coverage report and emit a numeric `coverage-percent` step output. Map the action output to that step. Missing reports or non-numeric coverage must fail. Keep the threshold input for M6; initially report it without enforcing it so the later gate change is observable.

   A composite is invoked from the caller's checkout; make paths to the app explicit. Use `github.action_path` for helper files shipped with the action, not the caller's app.

3. Replace repeated CI steps with the local action. Keep checkout **before** `uses: ./.github/actions/setup-and-test`, pass the matrix runtime, and leave the artifact upload and summary in the caller. Confirm CI remains green.

4. Review the action source with your partner: publisher, runtime, downloads, permissions, maintenance and transitive action dependencies. Then publish it only to your allocated shared path, for example `ORG/training-actions/setup-and-test-HANDLE`.

   Coordinate releases with the facilitator. Tags belong to the whole shared repository; do not move a shared `v1` tag yourself. The owner may publish `v1.0.0` and a floating `v1` after review.

5. Consume the approved shared action using its full release tag and update your execution lock. Record the resolved commit. Compare with the PDF's `ORG/REPO/PATH@<full-sha> # version` spelling: the path names the **action directory**, not a workflow file.

<details>
<summary>Hint: follow the output all the way out</summary>

The coverage step needs an `id` and writes `coverage-percent=<number>` to `$GITHUB_OUTPUT`. Action metadata maps `outputs.coverage-percent.value` to that step output. The calling step also needs an `id` so later steps can read `steps.<id>.outputs.coverage-percent`.

Checkout remains in the caller. A shared composite does not automatically check out either its caller's app or the entire shared action repository.
</details>

<details>
<summary>Solution walkthrough</summary>

The composite replaces step logic, not the job or its runner. Each matrix job still selects its OS, grants only read access, checks out the caller and invokes the action. The action sets up the requested Node version, installs and checks the caller's app, then returns validated line coverage.

Publishing it changes the `uses` reference, not the app paths or permissions. Resolve the reviewed release through the execution lock. An inline SHA pin is the alternative discussed in S10, not a second conflicting version source to edit by hand.

The prepared reference is `solution/module-03` in the template, if supplied.
</details>

## Checkpoint and cleanup

CI is green with the shared action. Show the resolved commit and coverage output; explain why a composite cannot choose a separate runner for its steps.

Keep the shared action for M4. Remove unused duplicate local steps, but do not delete or retag shared releases. Continue with [M4](04-Reusable-workflows.md).
