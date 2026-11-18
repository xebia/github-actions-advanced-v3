# 🔨 Lab 4: Run only necessary work, within a budget

**Time:** About 45 minutes across section 2.

**Before you start:** Complete [setup](00-Setup.md) and open your lab repository. You need permission to create and edit issues. Create label `lab-04-events` if it does not already exist.

Use a practice issue with made-up text, not an existing work issue.

**If you cannot run part of the exercise:** Ask the trainer to demonstrate it. This may be needed if you cannot create issues or no runner is available.

## Objectives

Predict which issue activities start a workflow, select checks using an impact map, and compare running checks side by side with running them one after another. Make a failure stop the work that depends on it, and limit how long a step may run.

## Opening demonstration: avoid unnecessary checkout

Follow the instructor's checkout comparison before starting the exercises. Checkout does more than clone a repository: it prepares the workspace, selects and fetches a revision, handles authentication, writes files and cleans up credentials.

**Sparse checkout** keeps only selected paths in the working tree; it does not select a different revision. The slide example checks out `.github/workflows` for a preinstalled zizmor scanner, using `fetch-depth: 1`, `submodules: false` and `lfs: false`. It is an example to discuss, not another workflow to install.

Compare checkout time and disk use at the same revision, with the same intended scanner inputs. Scanner configuration and local action definitions may also be needed. Scanning workflow files alone is not a full repository security check.

Discuss why changed-file detection may need more Git history, and when a job needs submodule or LFS content. Depth 1, submodules off and LFS off are already checkout defaults. [Checkout inputs and scenarios](https://github.com/actions/checkout), [zizmor collection](https://docs.zizmor.sh/usage/#input-collection)

### Demonstration: download only the artifacts you need

Next, compare separate named artifact bundles with direct-file uploads. An upload with `archive: false` accepts one file per invocation and uses that filename as the artifact name.

Notice how the consumer selects artifact names, IDs or name patterns. It cannot select individual members inside a remote ZIP. `skip-decompress: true` keeps a downloaded ZIP intact; it does not reduce which bytes are transferred.

This comparison does not change Lab 9's signed release archive. [Artifact selection and direct files](https://github.com/actions/download-artifact#examples)

## Part A: Predict and observe events (20 minutes)

1. Read about [issue events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#issues) and [issue-comment events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#issue_comment). Copy the two issue starters to `.github/workflows`.

   Both initially observe all issue activities. Change the second workflow to select only creation and edits; leave the broad observer unchanged.

   Generate the lockfile with `gh actions-lock`, then review the workflows and lockfile. Commit both and push the commit to your default branch. Keep `permissions: {}` and `cache-mode: none`. The observers only print the event name and activity type, so they need no checkout and no permissions.

2. Before acting, predict which workflow runs for each activity. Create an issue, edit its title or body, apply the prepared label and add a comment. Compare each prediction to the Actions run list. Don't repeatedly edit while a run is pending.

| Activity | Broad issues prediction / observation | Filtered opened, edited prediction / observation |
| --- | --- | --- |
| Open | | |
| Edit | | |
| Label | | |
| Comment | | |

3. Apply what you observed to [PR events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request). Which activities trigger a workflow by default? Which activity does a code push trigger, and why is listening only for `edited` not enough to test code changes?

   Ask the instructor to show an example event payload for a PR whose base branch changed. Notice that its activity is `edited`. Titles, bodies and comments in the payload are written by users. If a workflow puts them directly into a `run:` script with `${{ }}`, someone can inject commands. [Script injection](https://docs.github.com/en/actions/concepts/security/script-injections)

<details>
<summary>Solution: event table</summary>

Your results should look like this:

| Activity | Broad observer | Filtered observer |
| --- | --- | --- |
| Open an issue | Runs | Runs |
| Edit an issue | Runs | Runs |
| Add a label | Runs | Does not run |
| Add a comment | Does not run | Does not run |

Comments use a different event, `issue_comment`, so neither `issues` workflow sees them.

Without a `types` filter, `issues` selects all supported issue activities. `pull_request` has different defaults: `opened`, `synchronize` and `reopened`. `synchronize` covers new commits pushed to a PR. If you specify `types`, your list replaces the defaults.

For a workflow that skips draft PRs, consider `ready_for_review` as well as later code pushes. A change to a PR's base branch can arrive as `edited` and may also need validation.

Compare the [broad observer](../../solutions/workflows/04-issues-all.yml) with the [filtered observer](../../solutions/workflows/04-issues-filtered.yml).
</details>

## Part A continued: Select checks (discussion)

4. Draw an **impact map**: which changes should run lint, tests and build? Discuss these examples; you do not need to edit the files yet.

| Changed input | Category |
| --- | --- |
| `hol/day-2/01-Measure.md` | Documentation |
| `app/src/server.js` | Application code |
| `app/package-lock.json` or `app/package.json` | Shared dependency inputs |
| `.github/workflows/04-parallel.yml` | Workflow definition |
| File-list request fails, or the Git base commit is unavailable | Change detection failed |

Explain which shared inputs affect all checks. For a `merge_group` event, why compare the combined revision with its actual base rather than reuse a PR's file list? [Path filters](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushpull_requestpull_request_targetpathspaths-ignore)

5. Explain why a path-filtered **workflow** may leave a required check pending and why a skipped **job** can appear successful. How does an always-run gate distinguish an explicitly unnecessary check from a detection error? [Required-check troubleshooting](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks)

<details>
<summary>Hint</summary>

Unknown is not the same as “no files changed”. Shared inputs can affect multiple components, even if a component's own source did not change.
</details>

<details>
<summary>Solution: impact model</summary>

An impact map describes which inputs each check depends on. Documentation-only changes can skip application checks if those documents cannot affect the app.

An application source change should run the affected checks. A dependency lockfile, shared configuration or workflow change can affect several checks, so it may need all of them.

If you cannot determine what changed, you do not know that checks are unnecessary. Either run all relevant checks or fail the final gate.

The merge queue tests a new combined revision. Calculate its changes against its actual base rather than reusing a list from an earlier PR run. Check the current documentation for limits on native path filtering.
</details>

## Part B: Compare and bound work (25 minutes)

The app's tests and build each include the same 20-second artificial wait used in Lab 1. Keep them unchanged across variants. Lint is still fast, so running lint beside tests may save little time; repeated setup on separate runners can outweigh that saving. The waits simulate slow work, not CPU load.

6. Copy the [`04-parallel.yml` starter](../../examples/workflows/04-parallel.yml) and keep its sequential baseline unchanged.

   Complete the shared-runner TODO with a [`parallel`](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idstepsparallel) group that contains a lint step and a test step. The step after the group starts only when every step in the group has finished, so the existing build step can stay where it is. `parallel` is shorthand for steps with [`background: true`](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idstepsbackground) followed by one [`wait`](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idstepswait).

   Complete the separate-runner TODO with a [matrix](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations) that creates one job for lint and one for tests. The existing build job already uses `needs` to wait for them.

   In the test step of both variants (the `parallel` group and the matrix job), run the real tests first. Then make the step fail if the `fail-test` input is true. Replace the placeholders with these checks. [Inputs context](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#inputs-context), [error workflow command](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#setting-an-error-message)

   Regenerate the lockfile with `gh actions-lock`, then review the workflow and lockfile. Commit both and push the commit to your default branch. In **Actions**, select **Lab 04 parallel checks → Run workflow**, leave `fail-test` unchecked and start the run. Compare time to feedback, total runner time and repeated setup work. The small app may not be faster in parallel.

7. Run it again with `fail-test` checked. Expect the workflow to fail and both dependent builds to skip.

   Now copy the [timeout starter](../../examples/workflows/04-timeout.yml). Replace its error-printing placeholder with a command that waits for two minutes. Add a one-minute step `timeout-minutes` setting at the same YAML level as `run`. Keep the job's three-minute limit unchanged.

   Regenerate the lockfile with `gh actions-lock`, then review the timeout workflow and lockfile. Commit both and push the commit to your default branch. In **Actions**, select the timeout workflow and choose **Run workflow**.

   After about one minute, GitHub Actions should stop the waiting step. This is a **timeout**, not the placeholder's immediate `TODO` error. Ask the trainer to demonstrate if time is short. How does a timeout differ from cancellation or matrix fail-fast? [Timeouts](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idstepstimeout-minutes)

8. Based on your measurements, when would you choose parallel steps, separate jobs or a larger runner?

   Parallel steps share a runner. Separate jobs provide isolation, capacity and permissions of their own. A larger runner may help CPU-heavy work, but not necessarily serial or network-heavy work. Choose time limits from measured cold and warm runs, leaving some extra time.

<details>
<summary>Solution / checkpoints</summary>

Compare your workflows with the [parallel example](../../solutions/workflows/04-parallel.yml) and [timeout example](../../solutions/workflows/04-timeout.yml).

In the parallel example, lint and tests can run at the same time because neither needs the other's output. The build waits for both. When `fail-test` is true, the test branch fails after its real tests, and the dependent build does not run.

Separate jobs repeat checkout, setup and installation on their own runners. They may finish sooner while using more total runner time. Your measurements show whether that trade-off helps this app.

In the timeout example, the step tries to wait for two minutes, but its one-minute limit stops it first. The job's three-minute limit is an outer limit for the whole job; it does not override the shorter step limit.

A timeout or cancellation is not a passed check. Set explicit limits rather than relying on the default job timeout of 360 minutes, which is also subject to runner limits.
</details>

## Success and cleanup

Compare your predictions with the observed issue runs. Check that your impact map handles shared changes and detection errors, that the deliberate test failure blocks the build, and that the waiting step times out.

Close your practice issue and remove its label only if you created it for this lab. Cancel unneeded course runs.

Disable all four Lab 4 workflows: **Lab 04 all issue activities**, **Lab 04 selected issue activities**, **Lab 04 parallel checks** and **Lab 04 bounded timeout**. None is needed in Lab 5; leave other workflows unchanged.

Next: [Lab 5](05-Stacks-and-queue.md).
