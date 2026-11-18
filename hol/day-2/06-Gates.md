# 🔨 Lab 6: Which gate is blocking?

**Time:** About 35 minutes, plus time to configure the rules.

**Before you start:** Complete [Lab 5](05-Stacks-and-queue.md). Use your own practice repository in an organization. You will create the course rules during this lab; they are not already configured for you. The deployment runs locally inside a job, so you do not need cloud credentials or a cloud service.

> **Requires:** repository administrator access for the required checks, environment and deployment rule (sections A and B). The central-workflow exercise (section C and task 4) also needs GitHub Enterprise Cloud (GHEC) and permission to manage organization rulesets. Changing who can use the source workflow needs approval from its owner. If you do not have this access, complete the parts you can and ask the trainer to demonstrate the rest.

## Objectives

Configure the rule that requires a successful deployment to `lab-staging`, then observe how it blocks or allows merging. Compare that requirement with required status checks and centrally required workflows without bypassing any gate.

## A. Prepare the workflows

1. Open your lab repository and check its default branch and existing rules under **Settings → Rules → Rulesets**. Choose recognizable names for your course rulesets, such as `Lab 6 required checks` and `Lab 6 staging deployment`. You will use these names to find them again. Leave existing rules unchanged.
2. Copy the three `06-*.yml` starters into `.github/workflows`. Complete the TODOs before making any of their checks required.

   **`06-gates.yml`:** keep the supplied detector and application jobs. The final `required` job already has one step that fails when change detection did not succeed. Add steps like it, each with an `if:` condition that finds one problem and fails with an `::error::` message:

   - The impact decision `needs.impact.outputs.checks` is not exactly `true` or `false`.
   - Checks were needed, but the `application` job did not succeed.
   - Checks were not needed, but the `application` job was not skipped.

   End with a step that reports success. Use the result table in the solution of this lab as your target. [Job outputs and results in the `needs` context](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#needs-context), [step conditions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idstepsif), [error workflow command](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#setting-an-error-message)

   **`06-staging.yml`** is ready to run; you do not need to write deployment code. It builds the app, starts a temporary local server, checks `/health` and stops the server afterwards. Later, you will change the repository variable `LAB_STAGING_FAIL` to observe a failed deployment and then a successful one. Use only `true` or `false` for that variable. [Environment deployments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)

   **`06-central-required.yml`** checks the PR title length without checking out any code. The check is supplied. Complete its step:

   - Add an `env:` mapping that sets `TITLE` from the pull request title. Passing the title through an environment variable, rather than writing `${{ }}` inside the script, prevents script injection. [Script injection](https://docs.github.com/en/actions/concepts/security/script-injections)
   - Add an `if:` condition so the step runs only for `pull_request` events. A `merge_group` event has no PR title, so the job should pass there. [`github` context](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#github-context)

   Generate the lockfile with `gh actions-lock`, review all three workflows and the lockfile, then commit them and push to your default branch.

3. In **your repository's Settings → Environments**, create the environment `lab-staging`. The workflow only runs a local server there, so it needs no cloud credentials.

4. **Run the workflow before selecting its check in a rule.** GitHub's required-check selector offers checks that have run recently in this repository. A newly added workflow's check will not appear until it has run at least once.

   Create branch `lab-06-gates` from your default branch. Add a harmless comment to `hol/day-2/06-Gates.md`, commit and push it, then open a temporary PR targeting your default branch. Use a short title, such as `Lab 6 gate experiments`. Keep this PR open for the tasks below; do not merge it.

   In the PR's **Checks** tab, open **Lab 06 explicit required gate** and wait for its `required` job to finish successfully. For this documentation-only change, `impact` and `required` should pass and `application` should skip.

   A workflow with a `workflow_dispatch` trigger can also be started through **Actions → select the workflow → Run workflow** to make its check available. The supplied gate workflow has PR and merge-queue triggers, so use the temporary PR here.

### How the supplied change detector decides

- It uses the `tj-actions/changed-files` action, pinned in your lockfile, and compares the PR base (or merge-group base) with the commit GitHub is testing.
- The patterns select all files, exclude Markdown, then include `.github/**` again. **Order matters:** a Markdown file in `.github/` still triggers checks. Deletions, file-type changes and both sides of a rename count.
- Zero selected files gives `checks=false`; anything else gives `checks=true`. If the comparison fails, the detector job fails. A failed comparison does not mean "no changes", so your final gate must fail too. [Changed-files inputs, patterns and outputs](https://github.com/tj-actions/changed-files/tree/v47.0.6)

## B. Configure the repository rules

1. In **your repository's Settings → Rules → Rulesets**, create a **New branch ruleset** named `Lab 6 required checks`, initially **Disabled**. Include only your exact default branch and leave the bypass list empty.

   Enable **Require status checks to pass**. In the check selector, search for `required`, choose the check from **Lab 06 explicit required gate**, and select **GitHub Actions** as its source where offered. If it is missing, return to your PR and confirm the workflow ran in this repository, then refresh the selector.

   Save the ruleset, reopen it by name and check the branch and selected check. Set enforcement to **Active**, save, then return to the PR's merge section to see the requirement. **Evaluate** does not block merging.

2. Prepare a **separate repository branch ruleset** for the deployment exercise:

   Open **Settings → Rules → Rulesets → New ruleset → New branch ruleset** in **your lab repository**, not the organization settings. Name it `Lab 6 staging deployment` and leave enforcement **Disabled**.

   Target only your exact default branch and leave the bypass list empty. Under **Branch rules**, select **Require deployments to succeed**, then select **`lab-staging`** as the required environment. Save the ruleset.

   Reopen it and confirm the branch and environment selections. Requiring a status check named `local-staging` is not the same rule: this exercise requires a successful **deployment to the selected environment**. You will activate this ruleset in **Task 3** below. [Deployment rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#require-deployments-to-succeed-before-merging)

## C. Prepare the centrally required workflow (GHEC only)

### Authorize and configure source-workflow access

1. Choose the **workflow source repository**: the repository containing the workflow you will require. You can use your lab repository if it supports this feature. The **protected target repository**, where the rule will apply, must be your lab repository.

   Note both repository names and the source repository's current **Settings → Actions → General → Access** setting so you can restore it later. You will select the source and target separately when creating the rule, even if they are the same repository.
2. Before changing anything, obtain explicit owner/policy-owner approval for the intended source sharing and single-target organization rule. Changing the sharing setting needs repository administrator access. Creating the central rule needs permission to manage organization rulesets. If you do not have the approval or the role, ask the trainer to demonstrate this section.
3. If the source already allows the required access, keep that setting. Otherwise, after approval, open **Settings → Actions → General → Access**, select **Accessible from repositories in the organization** and save. The wording may vary by host and repository visibility.

   **This sharing setting is broader than your ruleset:** other repositories in the organization may be able to use the source's actions and reusable workflows. Review the [sharing guidance](https://docs.github.com/en/actions/how-tos/reuse-automations/share-with-your-organization) with the owner first. Enterprise-wide sharing is not needed for this lab.

4. Reopen the source setting and verify the saved access, then continue with the narrowly scoped rule below. If GitHub still rejects the source, record its actual error and stop that scenario; do not broaden access further. Record the original setting and the person responsible for restoring it.

### Create the single-target organization rule

1. In your **organization's Settings**, open **Repository → Rulesets → New ruleset → New branch ruleset**. Enter a unique course-only name and leave enforcement **Disabled**. [Create organization rulesets](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/creating-rulesets-for-repositories-in-your-organization)
2. Under **Target repositories**, choose **Only selected repositories** and select **only your lab repository**. Never select all repositories, a name pattern, a property filter or another participant's repository. Include only your default branch and leave the bypass list empty.
3. Select **Require workflows to pass before merging**, your source repository, its default-branch ref and `.github/workflows/06-central-required.yml`. Your lab repository can also be the source if eligible.

   The workflow source and the protected target are separate selections. If GitHub reports that sharing is disabled, return to the sharing setup with the owner rather than choosing a wider access setting.

4. Save Disabled, reopen and verify its unique name, one selected repository, target branch and source workflow before activating it. **Evaluate** does not block merging. You will activate it in **Task 4**.

Existing organization or enterprise rules still apply. Your new rule cannot weaken them. If a separate rule blocks your PR, identify it; do not modify it or add a bypass.

## Tasks

1. Return to the temporary PR you opened during setup. In its merge section, find the requirement from **Lab 6 required checks** and open the `required` check's run. Compare the PR's latest commit with the tested merge commit shown in the logs. Inspect `06-gates.yml` and the [required check troubleshooting guide](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks).
2. Try the changes below in order. Commit and push each separately, wait for the run, then record the `impact`, `application` and `required` results.

   Compare the PR's **full diff against its base**, not just the latest commit. Undo the previous test change before moving to a different file category.

| Test case | Change on your `lab-06-gates` branch | Expected results |
| --- | --- | --- |
| Docs only | Harmless comment in `hol/day-2/06-Gates.md` | Detection success, application skipped, required success |
| Application | Harmless comment in `app/src/server.js` | Detection, application and required success |
| Shared input only | Remove the application comment, add a harmless YAML comment to your installed `.github/workflows/06-gates.yml` | Detection, application and required success |
| Failed detection | On `lab-06-gates` only, temporarily replace the detector's `base_sha` expression with the literal `0000000000000000000000000000000000000000` (40 zeros). Leave `fail_on_initial_diff_error: 'true'` in place | Detection failure, application skipped, required failure |
| Repaired detection | Restore the original `base_sha` expression and leave the harmless workflow comment | All three success |

An intentional skip requires a successful reviewed impact decision; a failed detector must not be accepted as docs-only. [Available rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)

3. **Configure and test the deployment requirement.** Disable only the status-check ruleset you created for this lab, so you can observe the deployment requirement on its own. Leave pre-existing and shared protections unchanged.

   Open your course deployment ruleset. Confirm that it targets your default branch and requires **a successful deployment to `lab-staging`**, then change enforcement from **Disabled** to **Active** and save. **Evaluate** does not block merging.

   Set repository Actions variable `LAB_STAGING_FAIL` to `true`. Push another harmless comment to your practice PR to trigger new runs. The supplied staging workflow deliberately fails; no deployment code changes are needed.

   Open the PR's merge section. Confirm that application checks pass but **merging is blocked because the required deployment did not succeed**. Open the `lab-staging` deployment record, check its tested revision and identify your deployment ruleset as the source of the requirement.

   Set `LAB_STAGING_FAIL` to `false` and rerun the staging job for that same revision. The supplied workflow starts the built app, checks its health and stops it. Confirm that the deployment succeeds and that **the deployment-related merge blocker disappears**. Other existing rules may still block merging; do not merge the practice PR or bypass those rules.

   Explain why passing application checks alone did not satisfy your deployment rule. An environment approval alone would not satisfy it either: the deployment must finish successfully. The local server lasts only for the job; it is not a permanent staging service.

4. If you can run the central-workflow exercise, disable your **Lab 6 staging deployment** ruleset so that only the central rule is tested. Then activate your single-repository organization rule and open a new practice PR with a title longer than 120 characters. Check that the selected policy workflow fails and merging is blocked.

   Shorten the title and push a harmless commit. Check that the policy passes on the new run.

   Now delete **only `.github/workflows/06-central-required.yml` in this PR branch**, regenerate `actions.lock`, commit and push. Leave the selected workflow on `main` intact. The organization rule should still run its selected source workflow, even without the PR-local copy.

   Close this experimental PR without merging the deletion. Discuss why choosing a workflow in a rule provides enforcement, while optionally calling a reusable workflow does not.

   Also inspect what a pending required-workflow result looks like. Pending does not necessarily mean a workflow is permanently missing; if you cannot reproduce that case, leave it as a discussion rather than a tested result. [Required workflows](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#require-workflows-to-pass-before-merging)

5. If you ran Lab 5's merge-queue exercise, open its merge-queue run. Find its combined commit and the `validate` result, then compare them with this lab's `required` check. If the trainer demonstrated Lab 5 instead, use that demonstrated run for the comparison.

   Discuss how **Evaluate** can help you try a rule before enforcing it, and why an emergency bypass should be recorded and reviewed. Do not perform a bypass in this lab.

<details>
<summary>Hint</summary>

Start with the rule that blocks merging. Which check or workflow does it require, and for which commit?

A skipped job has a recorded result. A workflow that never started may leave a required check waiting. Neither tells you by itself whether the application was tested.
</details>

<details>
<summary>Solution</summary>

Compare your implementations with the [final gate](../../solutions/workflows/06-gates.yml), [local staging workflow](../../solutions/workflows/06-staging.yml) and [central title policy](../../solutions/workflows/06-central-required.yml).

### The final gate checks why application work ran or skipped

The `required` job runs even if an earlier job fails. It first checks that change detection succeeded. Only then can it trust the decision about whether application checks were needed.

| Detection result | Checks needed? | Application result | Final gate |
| --- | --- | --- | --- |
| Success | Yes | Success | Passes |
| Success | No | Skipped | Passes |
| Failure, cancellation or missing result | Any | Any | Fails |
| Success | Missing or unexpected decision | Any | Fails |
| Success | Yes | Failed, skipped, cancelled or timed out | Fails |
| Success | No | Anything other than skipped | Fails |

A docs-only change passes because detection explicitly said that application checks were unnecessary, not simply because the application job skipped.

Each failure condition is a separate step. For example:

```yaml
- name: Needed application checks must pass
  if: needs.impact.outputs.checks == 'true' && needs.application.result != 'success'
  run: |
    echo '::error::Application checks were needed but did not succeed.'
    exit 1
```

When a step fails, the later steps are skipped, so the job fails. The final step reports success only when no condition found a problem.

### The deployment rule checks a different result

The staging workflow starts the built app and tests `/health`. When `LAB_STAGING_FAIL` is `true`, it fails deliberately. When it is `false`, the app must become healthy before the deployment succeeds. An approval alone does not show that the app ran successfully.

### The central rule chooses which workflow must run

The policy step uses `if: github.event_name == 'pull_request'` and `env: TITLE: ${{ github.event.pull_request.title }}`. The title reaches the script as data, not as script text, and the step skips for `merge_group` events, so the job still passes in the merge queue.

The organization rule selects a workflow from the configured source repository and branch. Deleting the PR-local copy does not remove that requirement. This is different from a PR workflow choosing to call a reusable workflow.

The merge queue also tests its own combined commit. A passing result on an earlier PR commit does not replace that run.
</details>

## Success and cleanup

You should be able to explain why each check or policy blocked merging and how to fix the cause without bypassing it. Note which parts you ran yourself and which you observed in a demonstration.

Cancel your course runs and close your practice PRs. Open **Settings → Rules → Rulesets** and find **Lab 6 required checks** and **Lab 6 staging deployment** by name. Check that they are the rules you created, then disable and remove them when no longer needed. If you created the organization-level central-workflow ruleset, find it by the name you supplied in the organization's ruleset list and remove that course rule too. **Remove required-workflow, deployment and check requirements before disabling the workflows.** Keep shared and pre-existing rules unchanged.

If you changed the source's Actions sharing setting, restore the original value after removing the central rule. Save and check it; leave pre-existing sharing enabled.

Reset `LAB_STAGING_FAIL` to `false`. Once no lab job is using it, remove your `lab-staging` environment.

Disable **Lab 06 explicit required gate**, **Lab 06 local staging deployment** and **Lab 06 central required policy**. None is needed in Lab 7.

Next: [Lab 7](07-Debug.md).
