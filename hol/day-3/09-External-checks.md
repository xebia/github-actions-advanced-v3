# M9: External checks with the Checks API

**Time:** 30 minutes.

**Before you start:** Complete [M6](06-Coverage-gate.md) or [M7](07-Organization-gates.md). Use a same-repository PR and an approved GitHub App installation token limited to this repository with Checks write and read access to the PR metadata.

**If the App is unavailable:** Ask the trainer to demonstrate it. A dispatch-only workflow with job-level `checks: write`, no checkout and validated repository/SHA inputs can simulate the service, but its source is GitHub Actions, not an external App. A permitted commit-status API exercise is another explicitly different fallback.

## Objectives

Associate a check with the correct revision, control its lifecycle through the API and bind the merge requirement to its expected publisher.

## Tasks

1. Compare [check runs](https://docs.github.com/en/rest/checks/runs) with [commit statuses](https://docs.github.com/en/rest/commits/statuses):

   | | Commit status | Check run |
   | --- | --- | --- |
   | Identity | Context name | Check name and publishing App |
   | States | pending, success, failure, error | queued/in_progress/completed plus conclusion |
   | Output | Description and URL | Summary, annotations and more |
   | Enterprise publisher | Service identity with status write | GitHub App with Checks write |

   Normal CLI login does not guarantee permission to create a check. Use the approved App route rather than creating a broad personal token. `GITHUB_TOKEN` is available only inside a workflow job, not automatically in your local shell.

2. Read your PR's current head SHA and record it. Ensure no job or status in your repo already uses `external/change-approval`; ambiguous duplicate names make the exercise unreliable.

3. Using `gh api`, create `external/change-approval` in `in_progress` on that SHA. Save its returned check-run ID locally. This ID identifies the API object you will update; the rule itself should be managed by its human-readable name.

4. Once the check exists, add it as a required check in your exact-target `main` rule. Select the expected publishing App, not "any source", where supported. The PR should now wait on the in-progress check.

5. Update the same check to completed/success with a title, Markdown summary and two annotations using paths and line numbers that exist in the tested revision. Observe that this requirement clears.

6. Update it to failure or `action_required`; observe the merge requirement block again. Leave it at success only after your simulated external review has genuinely finished.

7. Push a harmless new commit. Re-read the head SHA; verify the old approval does **not** approve the new revision. Create a fresh check for the new SHA and repeat the decision.

   If a check with this name exists on the PR's test-merge revision, GitHub can require that result instead of the head result. Inspect which revision the merge box expects; do not submit approvals to an arbitrary old SHA. See [required-check troubleshooting](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks).

<details>
<summary>Hint: PowerShell API loop</summary>

These are local PowerShell examples. Set the repository and PR to **your** values. Supply the short-lived installation token through an approved process to this process's `GH_TOKEN`; never paste it into a file, command history or the lab notes.

```powershell
$repo = 'TRAINING-ORG/YOUR-REPO'
$pr = 12
$sha = gh pr view $pr --repo $repo --json headRefOid --jq .headRefOid
if ($LASTEXITCODE -ne 0) { throw 'Cannot read PR revision' }
$id = gh api "repos/$repo/check-runs" --method POST `
  -f name='external/change-approval' -f "head_sha=$sha" `
  -f status=in_progress --jq .id
if ($LASTEXITCODE -ne 0) { throw 'Cannot create check run' }

$body = @{
  status = 'completed'
  conclusion = 'success'
  output = @{
    title = 'Training change approved'
    summary = 'Simulated approval for the recorded PR revision.'
    annotations = @(
      @{ path = 'app/src/game.js'; start_line = 1; end_line = 1
         annotation_level = 'notice'; message = 'Training review completed.' },
      @{ path = 'app/src/game.js'; start_line = 2; end_line = 2
         annotation_level = 'notice'; message = 'Rollback plan reviewed.' }
    )
  }
}
$body | ConvertTo-Json -Depth 6 | gh api "repos/$repo/check-runs/$id" `
  --method PATCH --input -
if ($LASTEXITCODE -ne 0) { throw 'Cannot complete check run' }
```

Confirm those annotation lines exist before using them. To show rejection, change the body conclusion to `failure` and give a rejection title/summary, then PATCH the same object. Check every API exit code.
</details>

<details>
<summary>Solution walkthrough and alternative</summary>

The check's name, App and SHA identify the evidence. A valid success on the current required revision clears **only this** requirement; coverage or review can still block the PR. Success from an unexpected publisher or an old SHA must not be accepted.

With a permitted status-write credential, the status API can post the same context on the chosen SHA using `state=pending`, then `success` or `failure`. That demonstrates a commit status, not check-run annotations; do not mix both under the same name in one experiment.

The prepared reference is `solution/module-09` in the template, if supplied.
</details>

## Checkpoint and cleanup

Show pending, success, failure and a new-commit pending state. Record the App, check name, revision and run URL, but no credentials.

Remove the short-lived token from your shell (`Remove-Item Env:GH_TOKEN` in PowerShell) when done. Coordinate App-token revocation with its owner; never uninstall a shared App. Keep the check requirement only until capstone/cleanup.

Next: [capstone](10-Capstone.md).
