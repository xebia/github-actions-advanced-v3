# M5: PR comments and file annotations

**Time:** 40 minutes.

**Before you start:** Complete [M4](04-Reusable-workflows.md). Use a same-repository practice PR with a real coverage output. Keep fork-token restrictions unchanged.

**If comment writes are prohibited:** Complete the read-only annotations and summary, then ask the trainer to demonstrate comments in an approved repository.

## Objectives

Show feedback on the PR, convert linter output to annotations and update one coverage comment without granting write access to app code.

## Tasks

1. On a practice PR, emit a deliberate `::warning` and `::error` with a repository-relative `file` and a real `line`. Use a changed line in `app/src/game.js` so you can find it on **Files changed**. Observe whether the command alone changes the step's exit status; a failing gate must also return a nonzero exit code.

   Remove the deliberate error after observing it. GitHub Actions limits a step to ten warning and ten error annotations; summarize additional findings rather than flooding the PR. See [workflow commands](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands).

2. Register a problem matcher using `::add-matcher::` with a JSON file in your repository. Match your linter's **actual installed output format**, including file, line, column, severity and message. Introduce one harmless lint error, verify the annotation, then fix it and unregister the matcher.

   Keep paths relative to the repository; account for lint running from `app`. Do not assume a formatter from an older ESLint release is installed. See [problem matchers](https://github.com/actions/toolkit/blob/main/docs/problem-matchers.md).

3. Add a separate `feedback` job after the reusable CI job, running only for `pull_request` from a branch in the same repository. Grant only `pull-requests: write` to that job. **Do not check out code or execute scripts from the PR in this job.**

   Use `actions/github-script` to create a coverage comment with a marker such as `<!-- day3-coverage -->`, the validated coverage number and the run URL. Pass values through `env`, not interpolated JavaScript source.

4. On re-runs, find the existing comment using both the exact marker **and the authenticated bot identity**. Paginate comments; do not assume it is among the first 30. Update your own comment rather than another user's marker-bearing comment.

   Serialize feedback for the same PR to avoid concurrent runs creating duplicates. For an empty/non-numeric coverage output, report unavailable evidence or fail; never publish `0` or a green result as a substitute.

5. Re-run the workflow twice and count the coverage comments. Then compare `gh pr comment` on a disposable PR as a simpler route. `--edit-last --create-if-none` edits the current user's last comment, not a marker-selected one; use a dedicated bot/comment purpose if choosing that approach. See [GitHub Script](https://github.com/actions/github-script) and [gh pr comment](https://cli.github.com/manual/gh_pr_comment).

<details>
<summary>Hint: keep the privilege boundary visible</summary>

The app runs only in the read-only CI jobs. The write job runs fixed, reviewed inline API code, consumes a validated numeric output and writes to the PR number from event metadata. It does not execute downloaded artifacts or PR-controlled JavaScript.

`pull_request_target` is not a workaround for fork write restrictions. Never combine its privileged token with checkout/execution of a PR head. A separate `workflow_run` publisher also needs strict source/run/artifact validation; it is not automatically safe.
</details>

<details>
<summary>Solution walkthrough</summary>

The matcher turns a known lint line into a structured annotation. The feedback job checks the event and source repository, validates coverage, lists all comments, selects only its own marker comment and updates or creates it. A per-PR concurrency group prevents two simultaneous publishers.

Run URLs are built from trusted server/repository/run metadata. Fork PRs retain read-only summaries; they do not get a wider token or personal-token workaround.

The prepared reference is `solution/module-05` in the template, if supplied.
</details>

## Checkpoint and cleanup

Show the changed-line annotations and exactly one bot-owned coverage comment that updates on re-run. Explain why the test job has no write token.

Remove deliberate lint errors and annotations, close the disposable CLI-comment PR, and keep the coverage feedback for M6.

Next: [M6](06-Coverage-gate.md).
