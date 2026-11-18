# 🔨 Hands-on: Set up your lab repository

You will use your own practice repository and the same small Node application throughout this course. Each of the four sections lasts 105 minutes.

If a run, service or permission issue holds you up, ask the trainer to demonstrate that part so you can continue with the class.

## Objectives and prerequisites

- Identify your host, repository, default branch, and training resources.
- Confirm that Actions, issues, and the sample application are available without enabling every workflow.
- Bring fundamentals knowledge: workflows, environments, reusable workflows, immutable action dependencies and least privilege.

You need a browser, a GitHub account and the course repository provided by the instructor. A local Git client and Node.js are useful but optional; you can begin without installing them or changing enterprise settings.

Use made-up data for the exercises. Logs, caches, artifacts and runner images are stored and can be read by other people or later jobs, so anything you put in them may be seen again.

## Choose your setup

1. **With a personal account on GitHub.com:** Create or open the practice repository as directed by the instructor. Note its owner, name and default branch. These labs use `main`; substitute your default branch if it has another name.

2. **With an Enterprise Managed User account:** Use an **organization-owned repository** approved by the instructor and sign in with your managed account.

   Personal repositories cannot use the GitHub-hosted runners required by these labs. **Do not use a personal repository or a fork owned by your managed account.** Ask the instructor for an organization-owned repository if you do not have one.

3. **On a `ghe.com` host:** Use an **organization-owned repository** at your enterprise's `https://SUBDOMAIN.ghe.com` address and sign in there. Personal repositories cannot use the hosted runners required by these labs, so they cannot be your lab repository.

   Configure GitHub CLI for that host when using commands. Action sources and feature availability may differ from GitHub.com.

See GitHub's [managed-account restrictions](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/understanding-iam-for-enterprises/abilities-and-restrictions-of-managed-user-accounts#github-actions) for the hosted-runner limitation.

### Check access for later labs

Some exercises need more access than ordinary workflow editing. Check these with the trainer now. If you cannot run a part yourself, ask the trainer to demonstrate it.

| Lab | What you need |
| --- | --- |
| 3: Custom image | Eligible larger runners and custom images, administrator access and an approved budget. Use existing course capacity rather than purchasing a plan. |
| 5: Merge queue | Repository administrator access and a repository/plan that supports queues. You will configure the queue in your own repository. |
| 6: Gates | Repository administrator access for local rules and environments. The central-workflow part also needs an eligible Enterprise Cloud organization, organization ruleset permissions and owner-approved source sharing. You will create the course rules yourself. |
| 8: Dependency inventory | Repository administrator access if the dependency graph needs to be enabled. |
| 9: Attestations | Artifact-attestation support for your repository. Private/internal repositories need an eligible Enterprise Cloud plan. Staging runs locally inside a hosted job. |

Lab 6's rules apply only to your practice repository and its default branch. Repository administration alone is not enough to create the organization-level rule. See [Lab 6 setup](06-Gates.md#c-prepare-the-centrally-required-workflow-ghec-only) and the [feature availability reference](../../REFERENCES.md#product-and-version-gates-from-githubdocs).

Labs 6 and 9 do not need a real cloud deployment target.

## Prepare the workspace

The workflows and slide examples use the full release tags recorded in [the action version lookup](../../ACTION-VERSIONS.md), including checkout `v7.0.1` and dependency submission `v2.0.2`. A tag is easy to read but can be moved to another commit, so you will also lock the exact versions with an execution lockfile.

1. Locate `app/package.json`, `app/package-lock.json`, `app/src/server.js`, and `app/test/server.test.js`. The application supports `npm ci`, `npm test`, `npm run lint`, and `npm run build` from `app`. Review the scripts before running them. [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/)

   Tests and builds each include a labelled 20-second artificial wait to make timing differences visible. These waits apply throughout the course. Lab 1 also downloads a fresh 559 MB CodeQL bundle; allow for that download when planning time, disk space and network access.

2. Find `examples/workflows`. These are **starting points**, not finished solutions. Copy only the files named in each lab to `.github/workflows`, then complete their TODOs. Some placeholders deliberately fail until you replace them with working steps.

   The baseline, broad event observer, local staging workflow and small local-demo example are ready to run because their exercises are about use and observation.

   Try each exercise before opening its collapsed solution. Finished references are in `solutions/workflows`; avoid copying either whole directory.

   Keep the supplied filenames: Lab 9 checks the release workflow's identity using its path. If your default branch is not `main`, check the triggers, conditions and signer settings with the instructor.

3. Find how to open an Actions run, read job logs, cancel a run and disable a workflow.

   Review the workflows' permissions. They start with `permissions: {}` and grant permissions only to the jobs that need them.

   Install the execution-lock extension after installing and authenticating GitHub CLI:

   ```bash
   gh extension install github/gh-actions-lock
   ```

   Generate `actions.lock` with `gh actions-lock` and review the pinned versions before running a workflow. Use this lockfile rather than hand-editing it or adding SHA pins to every workflow. [Extension installation and support](https://github.com/github/gh-actions-lock), [secure use](https://docs.github.com/en/actions/reference/security/secure-use), [lock workflow dependencies](https://docs.github.com/en/actions/how-tos/secure-your-work/lock-workflow-dependencies)
4. Note your default branch and check that you can use issues, PRs and Actions in your lab repository. If you cannot create or edit a practice issue, ask the trainer to demonstrate the issue activities.

<details>
<summary>Hint: how does a workflow become active?</summary>

GitHub recognizes workflow YAML in `.github/workflows` on the relevant branch. Event-specific requirements differ: the issue examples must exist on the default branch; manual dispatch also requires the workflow on the default branch.
</details>

## Success and cleanup

Check that you know your host, repository and default branch, and which exercises you can run yourself. The example files are not active until you copy them into `.github/workflows`. This setup does not add a workflow, so there is no Lab 0 workflow to disable.

Keep the repository for the remaining labs. Continue with [Lab 1](01-Measure.md); the [cleanup checklist](10-Cleanup.md) is for the end of class.
