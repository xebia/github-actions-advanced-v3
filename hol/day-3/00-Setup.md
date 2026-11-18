# Day 3 setup and Day 2 recap

**Time:** Confirm access before class; recap takes 10 minutes.

**Before you start:** Bring your GitHub account, training organization membership, GitHub CLI and VS Code with the GitHub Actions extension. Docker on your laptop is optional; the container exercise runs on a hosted Linux runner.

**If you cannot run a part:** Ask the trainer to demonstrate it. If a demonstration is also unavailable, note the expected behavior and that you have not observed it.

## Objectives

- Identify your own practice repository, host, partner and permitted administrative scope.
- Check the app contract before building workflows.
- Recall Day 2 concepts without repeating its labs.

## Tasks

1. Open the training organization and create your own **organization-owned** repository from the facilitator's Tetris template. This is a new repository from a template, not this course fork. Record its owner, name and default branch; these instructions use `main`.

   Managed accounts and `ghe.com` attendees must use an organization-owned repository approved for hosted runners. Authenticate to the actual enterprise host, not automatically to GitHub.com. See [Day 2 account guidance](../day-2/00-Setup.md#choose-your-setup).

2. Confirm you have repository admin access, Actions is enabled, your partner has write access, and `gh auth status` reports the correct account and host. Do not print a token. Use host-approved authentication; do not broaden personal-token permissions to work around policy.

3. Inspect the template before running anything. It must supply:

   | Asset | Required contract |
   | --- | --- |
   | `app/package.json` and lockfile | Node 24; `npm ci`, `npm test`, `npm run lint`, `npm run build`, `npm run test:coverage` |
   | Coverage configuration | Line coverage includes untested source files; `app/coverage/cobertura-coverage.xml` and HTML output |
   | Tests | Baseline above 80%; removing `app/test/rotation.test.js` puts coverage below 80% |
   | Static build and Dockerfile | Build writes `app/dist`; root Dockerfile packages that output without building it again |
   | Starting state | No active CI workflows; app, test and Dockerfile changes are yours to inspect |

   The `app` at the root of **this course repository** is the Day 2 server and does not meet that contract. Stop and ask for the template if the coverage command, named test or Dockerfile is missing.

4. From `app` in your practice clone, run the five commands above. Keep the line coverage number and confirm the XML report exists. Do not commit generated coverage or `dist` output.

5. Get the shared Actions repository name, reusable-workflow repository name and your allocated workflow filename from the facilitator. Confirm whether solution branches and `broken/triggers` exist. A repository created from a template does **not** automatically contain all source branches.

6. Confirm the later access requirements now:

   | Module | Required access or feature |
   | --- | --- |
   | M3-M4 | Approved shared action/workflow publication and cross-repository sharing |
   | M6 | Repository ruleset administration |
   | M8 | Environments, required reviewers and wait timers for this plan/visibility |
   | M7-M7b | Eligible Enterprise Cloud organization; authorized org ruleset management, single-repo scope |
   | M7 | Container build capacity, Trivy network access and code-scanning/SARIF eligibility |
   | M9 | Approved GitHub App installation token with Checks write on this repo, or the documented substitute |

   Repository admin is not organization admin. Having a role is not permission to change shared settings. Do not buy capacity or change enterprise policy for a lab.

7. Review [the action version lookup](../../ACTION-VERSIONS.md), then confirm current releases before using them. Install `gh extension install github/gh-actions-lock` if approved. Generate and review the execution lock with `gh actions-lock` whenever dependencies change. Verify the host supports execution locks; do not claim a lock is enforced on an unsupported host.

   Use `permissions: {}` at file scope, job-level `contents: read` only for checkout, and write permissions only where the task needs them. Keep automatic package caching off; if reusing a Day 2 cache, PRs restore only and deployment jobs use no cache. Use `shell: bash` explicitly for shell examples on Windows runners. Local CLI examples label PowerShell or Bash where syntax differs.

## Recap in pairs

1. Does a cache hit prove the bytes are safe? Who may save in this course?
2. Which event/activity types handle opened/edited issues? What handles a PR conversation comment?
3. What revision does a merge-queue run test?
4. Why does the final gate need every dependency, `if: always()`, and failure on missing evidence?
5. What must be verified before promoting an attested artifact?

<details>
<summary>Recap answers</summary>

1. No. A reviewed default-branch workflow may save; PR workflows restore only. Verify bytes against independently reviewed metadata.
2. `issues` with `types: [opened, edited]`; PR conversation comments use `issue_comment`. Comments on the diff are different events.
3. The temporary combined revision of the target branch and queued changes, not just the PR head. Required checks need `merge_group` when a queue is in use.
4. It must run after failures and inspect all results. Unknown, cancelled or unexpectedly skipped checks must not become success.
5. Verify the artifact digest, expected repository, signer workflow, source ref and runner policy. Provenance is not a vulnerability assessment.
</details>

## Checkpoint and cleanup

You can run the app checks, identify your host/repository/partner, and explain which administrative steps you may perform. No workflow has been enabled yet.

Keep the practice repository for the day. Next: [M1](01-First-workflow.md).
