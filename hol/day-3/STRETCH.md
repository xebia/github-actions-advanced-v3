# Day 3 stretch modules S1-S10

**Time:** Choose one 15-25 minute exercise when ahead. Do not delay a core checkpoint.

**Before you start:** Finish the module named below and confirm the necessary permissions. Ask the trainer to demonstrate unavailable parts. Prepared `solution/stretch-SN` branches are optional facilitator assets, not branches supplied by these instructions.

Each checkpoint should include a working example and a failure/recovery observation. Follow the [setup permissions and dependency rules](00-Setup.md).

## S1 - Simulate an external service

**Builds on M9; consume and troubleshoot.** Create an isolated workflow on the default branch responding to `repository_dispatch` with a dedicated allowlisted event type, or a typed manual dispatch.

1. Validate payload repository, a full current PR SHA and an allowlisted decision before writing anything. Do not interpolate a dispatch payload into shell/JavaScript source.
2. Use a no-checkout job with only `checks: write` and the read permissions needed for PR metadata. Create/update a check for that exact SHA. Do not execute code or artifacts named by the payload.
3. Dispatch a decision from the approved caller and observe the check. Reject a malformed SHA or foreign repository without posting success.

**Checkpoint:** The decision controls your practice check and invalid requests fail explicitly. This is a GitHub Actions simulation, not an independently authenticated external App.

**Cleanup:** Remove its required-check rule before disabling the service workflow; remove the caller's short-lived credential.

## S2 - Review comments on specific lines

**Builds on M5; author and manage.** Use the [pull-request review comment API](https://docs.github.com/en/rest/pulls/comments) to place feedback on a changed line.

1. Identify a file/line in the PR's current diff and its head commit.
2. Post a review comment using `commit_id`, `path`, `line` and `side`, with a safe fixed body. Use a comment-only job or an approved CLI identity, not a privileged checkout of PR code.
3. Compare it with an issue-style PR conversation comment and a check annotation. Observe and explain the API error for a line outside the permitted diff.

**Checkpoint:** The comment appears at the intended diff line on the current revision. **Cleanup:** Remove your disposable comment and any deliberate lint/test change.

## S3 - Add a second required check

**Builds on M7; enterprise governance.** Add a stable `actionlint` job to the centrally required workflow, or use another preflighted option below.

| Layer | Candidate |
| --- | --- |
| Application | ESLint or CodeQL code analysis |
| Container | Trivy HIGH/CRITICAL scan, already built in M7 |
| Infrastructure | tflint and Trivy config/Checkov, if the repo contains IaC |
| Workflows | actionlint and CodeQL's Actions analysis |
| Dependencies | `actions/dependency-review-action`, where eligible |

Run the new check once before selecting it as a required status check. Introduce a harmless invalid workflow expression in a disposable PR and prove that the check blocks; fix it and recover. Syntax validity and security analysis are different checks.

**Checkpoint:** The new required result independently blocks and recovers. **Cleanup:** Fix the deliberate fault; retain or retire the course-only requirement with the policy owner.

## S4 - Service container with a health check

**Builds on M2; author and manage.** Use a Linux job with a Postgres service container. This is a small additional integration test, not a requirement for the static Tetris app.

1. Choose a reviewed image and made-up isolated database credentials; add a health check with bounded retries.
2. For a job running on the runner, map the port and connect through `localhost`; for a container job, use the service hostname. Add a test that actually queries the database.
3. Break the connection settings, observe a real failure, then recover.

**Checkpoint:** The integration job waits for readiness, queries the service and fails for an invalid connection. **Cleanup:** Hosted job services are removed at job end; stop only your named local container if you started one manually.

## S5 - YAML anchors

**Builds on M1; author and manage.** On a host supporting workflow YAML anchors, deduplicate a repeated environment mapping using an anchor and alias.

Keep the dependency graph and permission boundaries unchanged. Read the resulting workflow with your partner and explain which concrete values each alias supplies. Do not assume YAML merge keys or arbitrary workflow templating are supported merely because basic anchors work.

**Checkpoint:** The workflow validates and preserves behavior on that host. **Cleanup:** Remove the disposable comparison workflow.

## S6 - Restricted self-hosted runner routing

**Builds on M7; enterprise governance.** Needs an approved dedicated machine and runner-group administrator. Otherwise use [A4's demonstration](ADMIN-STRETCH.md#a4---runner-groups).

Create a runner group restricted to your practice repository, use an additional course label, then route a benign manually dispatched job by group and label. Do not run fork PR code on a persistent privileged runner. Demonstrate a denied group in an isolated example, cancel it promptly, and restore the approved setting.

**Checkpoint:** Explain why a matching label cannot override denied group access. **Cleanup:** Stop/deregister only the course runner and release dedicated capacity with its owner.

## S7 - Retention through the REST API

**Builds on M2; author and manage.** With approved admin access, use the [Actions permissions API](https://docs.github.com/en/rest/actions/permissions) to read organization/repository artifact and log retention.

Record the original value. In a disposable repository, set an approved shorter retention, create a new artifact, then inspect its expiration. Compare that with M2's per-artifact `retention-days: 7`; it cannot exceed policy limits. Do not expect changes to rewrite every existing artifact's expiry.

**Checkpoint:** Show the original policy, approved change and a new artifact's expiration. **Cleanup:** Restore only the setting you changed; do not PATCH an organization-wide default without authorization.

## S8 - Push rulesets and path restrictions

**Builds on M7b; enterprise governance.** Check plan/visibility eligibility and use only a disposable exact target.

Compare a branch rule requiring PRs and code-owner review with a push rule restricting `/.github/workflows/` file paths. A push path restriction is **not** "allow workflow edits through any PR": it can block those changes even through a PR and can apply across the fork network. Agree authorized editors/bypass handling with the policy owner before any experiment.

Preview/evaluate the proposed scope where supported, then demonstrate the intended allowed and denied update paths in the disposable repository. Do not leave yourself unable to repair course workflows.

**Checkpoint:** Explain which operation each rule blocks without claiming PRs bypass path restrictions. **Cleanup:** Retire only the named course push rule with its owner.

## S9 - Publish to GitHub Pages

**Builds on M8; author/manage and secure automation.** Confirm Pages eligibility and approval to publish the app.

Build `app/dist`, run `actions/configure-pages`, package it with `actions/upload-pages-artifact`, then use `actions/deploy-pages` in a dependent job referencing the `github-pages` environment. Give that deployment job `pages: write` and `id-token: write`; keep checkout permissions only on jobs that need them. Restrict publication to reviewed `main`.

**Checkpoint:** Show the real Pages URL and environment history. This deployment uses OIDC; no cloud subscription or long-lived cloud secret is required.

**Cleanup:** Disable automatic publication and unpublish only your course site unless retention is explicitly agreed.

## S10 - Immutable dependencies and upgrades

**Builds on M3/M7; maintain actions and secure automation.** Coordinate the shared action release with its owner.

1. Compare the repository convention (full release tags plus a generated execution lock) with the PDF's inline full-SHA pin and version comment. Use a disposable comparison branch for the inline alternative; do not hand-edit `actions.lock`.
2. For the inline example, resolve the real approved action commit, consume it by full SHA with a version comment and add a `github-actions` Dependabot configuration with a weekly schedule and grouped updates.
3. Have the shared action owner publish `v1.1.0`. Trigger an update check, inspect the proposed diff and run it through coverage/review gates. A version comment or private subdirectory action may not be recognized as expected; inspect actual updater behavior rather than promising a PR.
4. For the lockfile route, regenerate and review the execution lock through the approved update process; verify whether the installed tooling supports automatic updates. Dependabot support for action refs does not prove it regenerates execution locks.

**Checkpoint:** Explain the immutable commit actually executed and review one real update diff. A SHA-only allowed-actions policy demonstration needs an isolated owner-approved target; do not impose it on the whole class.

**Cleanup:** Retire the disposable comparison config and recurring update schedule if not retaining the repo. Do not move shared release tags.
