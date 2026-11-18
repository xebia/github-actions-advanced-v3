# 🔨 Lab 7: Find the failure without dumping secrets

**Time:** About 20 minutes.

**Before you start:** Complete [setup](00-Setup.md) and open your lab repository. The starter includes the error you will investigate; no special branch or run is needed.

**If reruns or debug settings are unavailable:** Ask the trainer to demonstrate the failing run and its diagnostic logs.

## Objectives

Use narrowly scoped diagnostics to identify and fix a path/configuration or missing-output failure without exposing sensitive or untrusted data.

## Tasks

1. Copy `examples/workflows/07-debug.yml` to `.github/workflows/07-debug.yml` in your lab repository. It contains a deliberately incorrect source-file check. Try to diagnose it before opening the solution.

   Generate and review the lockfile, commit, push and run **Lab 07 targeted diagnostics**. Find the first useful error. How does this script error differ from the timeout and cancellation you saw earlier?

2. Decide which small amount of extra output would help: perhaps a tool version, the working directory or a listing of relevant filenames. Add that diagnostic, using log groups or annotations if useful.

   Keep the output focused. Avoid printing all environment variables or `toJSON(github)`; masking may not hide every sensitive value. Pass any necessary untrusted values through quoted environment variables rather than inserting them into shell code.

3. Add a small diagnostic that runs only when `runner.debug` is enabled. Commit, push and run this still-failing version.

   On that run, select **Re-run jobs → Enable debug logging**, or use the linked CLI command. Compare the extra output at the same revision.

   Use what you found to correct the path, commit and push. Start a **new run on the corrected revision** and check that it passes. Rerunning the old run still uses its old code; debug logging alone does not fix it. [Debug logging](https://docs.github.com/en/actions/how-tos/monitor-workflows/enable-debug-logging), [CLI rerun](https://cli.github.com/manual/gh_run_rerun), [workflow commands](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands)

4. Follow the instructor's optional `github/local-action` and `act` demonstration with made-up inputs. Which parts still need a real GitHub run to test: token permissions, OIDC, rulesets, queues, the hosted environment or new workflow syntax? [Local action](https://github.com/github/local-action), [act limitations](https://nektosact.com/not_supported.html)

<details>
<summary>Hint</summary>

Compare the configured working directory to the path the failing command expects. If you need diagnostic logs as an artifact, upload them before the job times out. A forcibly cancelled job may stop before it can upload anything.
</details>

<details>
<summary>Solution</summary>

The starter looks for `app/src/serve.js`, but the file is named `app/src/server.js`. A focused directory listing reveals the missing `r`.

The [completed example](../../solutions/workflows/07-debug.yml) shows that listing in a log group, adds a message controlled by `runner.debug` and checks the correct path.

Enabling debug logging gives you more information about the failing revision. It does not change the path in that revision. Commit the fix and start a new run to test the corrected code.

You need only the relevant directory and filename to explain this error, not a dump of environment variables or the whole GitHub context.
</details>

## Success and cleanup

Keep a note of the error, the diagnostic that explained it and the successful run on your corrected revision.

Cancel unneeded reruns and disable **Lab 07 targeted diagnostics**; it is not used in Lab 8.

Remove temporary diagnostics if you no longer need them. Stop any local demo processes or containers started for this exercise. If you created example credential files for the demo, delete those files and keep your normal local configuration.

Next: [Lab 8](08-Dependencies.md).
