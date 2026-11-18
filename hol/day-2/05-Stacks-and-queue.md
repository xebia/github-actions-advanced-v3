# 🔨 Lab 5: A small stack and fewer obsolete runs

**Time:** About 25 minutes, plus time to set up the merge queue.

**Before you start:** Open your lab repository. You need permission to push branches and open pull requests.

> **Requires (merge-queue part):** repository administrator access and an organization-owned repository. Merge queues are available for public organization repositories and for private organization repositories on GitHub Enterprise Cloud.

You will set up the queue yourself; it is not already configured for you.

**If you cannot use a merge queue:** Complete the stack and cancellation exercises, then ask the trainer to demonstrate the queue. An ordinary PR merge does not demonstrate a merge queue, so note which part you observed rather than ran yourself.

If you use an Enterprise Managed User account or a `ghe.com` host, continue in the organization and host you selected during [setup](00-Setup.md).

## Objectives

Compare checks on each PR with checks on the combined changes in a merge queue. Observe how cancelling an outdated run avoids unnecessary work.

## Tasks

1. Copy the [`05-stack-queue.yml` example](../../examples/workflows/05-stack-queue.yml) into `.github/workflows`.

   The `validate` job tests the app on every PR and merge-queue revision. Your task is to complete the `concurrency:` TODO at the top of the file. When you push a new commit to the **same PR**, the older run for that PR should be cancelled. Runs for another PR, and merge-queue runs, must not be cancelled. [Concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency), [`concurrency` syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#concurrency), [`github` context](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#github-context)

   The example also includes `optional-top-layer`, a job that only prints a message. Its condition uses GitHub's stack metadata to run on the **top PR**, skipping the other PRs and merge-queue runs. It shows where optional work could run without repeating it for each PR. You will observe this after creating the stack. It is optional, so it should not become a required check.

   Check the target branch and permissions, generate and review `actions.lock`, then commit and push to your default branch. [Stack CI](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/optimizing-ci-for-stacked-pull-requests)

2. Create branch `lab-05-bottom` from `main`. Add `"check": "npm run lint && npm test"` to the scripts in `app/package.json`, then open the **bottom PR** targeting `main`.

   Create branch `lab-05-top` from `lab-05-bottom`. In `.github/workflows/05-stack-queue.yml`, change the validation command from `npm test` to `npm run check`. Open the **top PR** targeting `lab-05-bottom`.

   The dependency is now `main ← bottom PR ← top PR`. The **bottom PR** targets `main`; the **top PR** builds on it and uses the command it adds.

   Use **Create stack** or GitHub's recommendation banner to register the stack. Setting the PR base branches alone does not register it. Compare each PR's diff and stack position.

   Find `validate` and `optional-top-layer` in the Actions runs. A run started before stack creation does not have the new stack metadata. If needed, push a harmless comment on the top branch to start a fresh run. Which jobs ran, and which skipped? [Creating stacks](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-stacked-pull-requests)

3. Set repository Actions variable `LAB_STACK_DELAY_SECONDS` to `150`. Validation will wait for two and a half minutes, giving you time to find the running job and cancel it with a replacement push.

   On `lab-05-top`, add one harmless YAML comment to `.github/workflows/05-stack-queue.yml`, commit and push it normally. Open the new run in **Actions**.

   Wait until the `validate` job reaches **Record tested revision and wait so you can cancel it** and shows `Waiting 150 seconds`. While it is still waiting, add a second harmless YAML comment, commit and push it normally. The replacement commit starts the newer run.

   Find the cancelled run for the top PR. Check that the bottom PR's run was not cancelled. Record which jobs were actually cancelled or skipped, then remove the variable or set it to `0`.

   If the first run finishes before you push, add another comment, push it, and try again while the new run is waiting. [Workflow concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)

4. Follow the merge queue setup below in **your lab repository**. Queueing can automatically merge these practice changes once the required checks pass.

   Find the run triggered by `merge_group` with activity `checks_requested`. Record its combined commit and base commit. How does this differ from checking each PR separately?

### Set up your repository's merge queue policy

Follow GitHub's [merge queue configuration guide](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue) and [branch protection setup](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule#creating-a-branch-protection-rule).

1. Check that you are in **your lab repository** and can administer its merge queue. Record existing branch rules so you can restore them later. Leave shared and organization-wide rules unchanged.

2. Check that your workflow responds to both `pull_request` and `merge_group: types: [checks_requested]`. Let `validate` finish on a PR; GitHub can then offer it in the required-check selector.

3. In **Settings → Branches**, configure branch protection for the exact base branch, usually `main`. Merge queues do not support wildcard branch patterns.

   Require pull requests and passing status checks. Select the Lab 5 `validate` check with GitHub Actions as its source. Leave `optional-top-layer` optional because it deliberately skips some revisions.

4. Enable **Require merge queue** and choose an allowed merge method. For this exercise, set build concurrency to `1`, require non-failing PRs, and set both minimum and maximum PRs per merge to `1`.

   Allow more than ten minutes for status checks, plus time waiting for a runner. Merge limits control merges; they do not guarantee that CI builds are batched.

5. Save and check that the rule applies to your stack's base branch. If a repository ruleset already manages that branch, use its equivalent settings rather than adding a conflicting branch protection rule. Existing requirements still apply.

6. Once both PRs' checks pass, use the stack's queue action on the **top PR** to queue the changes. Look for `validate` on a real `merge_group` run.

   If it does not start, check the workflow trigger and the required check's name and source. Keep the required check in place while investigating.

<details>
<summary>Hint</summary>

These are two different mechanisms. Concurrency cancels an older run after you push a new commit. The merge queue creates a new combined commit to test before merging. Your workflow needs to respond to `merge_group` to check that commit.

For the concurrency group, combine `github.event_name` with `github.event.pull_request.number`. The `||` operator returns its right side when the left side is empty, which is useful for events that have no PR number. `cancel-in-progress` accepts an expression, so you can compare `github.event_name` with `'pull_request'`.
</details>

<details>
<summary>Solution</summary>

You can compare your workflow with the [completed example](../../solutions/workflows/05-stack-queue.yml).

### Why the top PR depends on the bottom PR

The bottom PR adds `npm run check` to `app/package.json`. That command runs lint and tests.

The top PR changes the workflow to call `npm run check`. It needs the command added by the bottom PR, which is why you created its branch from `lab-05-bottom` rather than directly from `main`.

### Why the optional report runs only for the top PR

GitHub provides a PR's position in the stack and the total number of PRs in that stack. In this example, the bottom PR is position **1 of 2** and the top PR is **2 of 2**.

The condition `stack.position == stack.size` asks, “Is this the top PR in the stack?” It is true for the top PR because `2 == 2`. The example also checks that the event is a PR event and that stack information is present.

The `optional-top-layer` job only prints a report in this lab. It illustrates where you could put optional work that runs on the top PR rather than separately for every PR.

| Run | `validate` | Optional report |
| --- | --- | --- |
| Bottom PR | Runs | Skipped |
| Top PR | Runs | Runs |
| Merge queue (`merge_group`) | Runs on the queue's combined commit | Skipped |

Keep `validate` as the required check. The optional report cannot replace it: a successful top-PR run does not satisfy the bottom PR's required check.

### Why the older run is cancelled

```yaml
concurrency:
  group: lab-stack-${{ github.event_name }}-${{ github.event.pull_request.number || github.run_id }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

The concurrency group includes the event type and PR number. Two runs for the same PR therefore use the same group, while another PR uses a different group. A `merge_group` event has no PR number, so `||` falls back to the run ID, which gives every queue run its own group.

When you push the replacement commit, `cancel-in-progress` cancels the older PR run. It is enabled only for PR events, so the queue's validation is not cancelled by this policy.

### Why the queue runs validation again

The queue creates a commit containing the proposed changes together with the target branch and any changes ahead of them in the queue. That combination can differ from the commit tested in a PR run.

Find the queue run's tested SHA in the log and compare it with the PR runs. The `merge_group` trigger makes `validate` run on that combined commit before the queue merges it.

The queue's minimum/maximum PR settings control how PRs are merged, not how many CI runs you will see. Count the runs and jobs in your experiment rather than assuming that queueing a stack means one build.
</details>

## Success and cleanup

You should be able to identify each PR's commit, the queue's combined commit and an outdated run that was cancelled. If the trainer demonstrated the queue, note that alongside your own results.

When the queue experiment is finished, close any remaining practice PRs and delete your temporary branches. Check with the instructor before removing anything still queued. Reset `LAB_STACK_DELAY_SECONDS` to `0`.

Restore the branch settings you changed for this lab, using your notes. Keep pre-existing protections. **Remove the temporary required-check rule before disabling the workflow**, so future PRs are not left waiting for it.

Disable **Lab 05 stack and queue**; it is not used in Lab 6. Leave shared queues and rulesets unchanged.

Next: [Lab 6](06-Gates.md).
