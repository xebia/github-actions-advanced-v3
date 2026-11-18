# Fewer repeated runs, the same safeguards
- A pull request (PR) stack is a group of PRs that build on one another
- Test the combined changes before merging them
- Keep the required checks and deployment results
- An unknown result must not count as a pass

<!-- notes: Timing 0-5 min. Introduce the module's distinction: reduce redundant or obsolete work, but retain required layer and integration evidence. Demo checkpoint: show a prepared two-change stack and an integration run. Expected evidence: learners can state what evidence must remain for every proposed optimization. Failure/recovery: if the organization demo repository is unavailable, use prepared run and ruleset screenshots; do not make enterprise provisioning a learner task. Docs: [D12](https://docs.github.com/en/pull-requests/reference/stacked-pull-requests), [D11](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue), [W05](https://github.com/github/github-well-architected/blob/d7ff7ab0b225e189c18dadca53196b0d8bc19764/content/library/governance/recommendations/managing-repositories-at-scale/rulesets-best-practices.md). -->

---

# Review each change, then test them together
- Each PR is a layer in the stack; review it separately and test the combination

## Example: PR B needs the changes from PR A
```flow
main (trunk) | The branch that will receive both changes.
Bottom PR: service | Targets main and has its own required checks.
Top PR: screen | Targets the bottom PR and adds only its own changes.
Merge queue | Tests a new combined commit before merging.
```

<!-- notes: Timing 5-10 min. Use the editable flow as a branch/queue visual: the first three cards show the stack chain and the final card shows the distinct queue revision. Explain native stacked PR relationships, stack position/size metadata, and the difference from manually targeting an unrelated feature branch. Native stack behavior has specific branch protection and merge semantics. Expected evidence: learners can identify base/head dependency for each layer. Failure/recovery: if stack metadata is unavailable in the participant tenant/repository, demonstrate on a supported trainer host or explain the expected relationship. Avoid assuming arbitrary branch chains receive native stack behavior. Docs: [D12](https://docs.github.com/en/pull-requests/reference/stacked-pull-requests), [D14](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-stacked-pull-requests). -->

---

# Avoid running the same checks twice
- Do not duplicate checks on both a branch push and its pull request
- Some optional checks may run only on the top PR in a stack
- Keep each PR's required checks
- Cancel an older PR run when a newer commit replaces it

<!-- notes: Timing 10-15 min. Discuss avoiding duplicate feature-branch push and PR workflows, stack-aware optional jobs, and cancellation groups that isolate a PR without cancelling merge-group runs. Deployment requirements documented for linear stacks do not imply arbitrary status-check inheritance. Expected evidence: a proposed reduction identifies exactly which redundant runs disappear and which required results remain. Failure/recovery: if cancellation groups overlap, separate PR and merge-group namespaces. Docs: [D13](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/optimizing-ci-for-stacked-pull-requests), [D05](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency). -->

---

# The merge queue tests changes together
- A merge queue tests PRs with the latest target branch before merging
- Requires: an organization repository: public, or private on GitHub Enterprise Cloud (GHEC)

## Trigger excerpt: merge_group starts a run for the combined commit
```yaml
on:
  pull_request:
  merge_group:

# A PR run tests the PR; a queue run tests the combined commit.
# In both runs, github.sha is the commit being tested.
```

<!-- notes: Timing 15-20 min. Start Lab 5 introduction within the scheduled 15-40 lab segment after showing the combined revision concept. Merge-queue availability depends on repository ownership, visibility/plan, and current product terms; verify F02 for the training tenant. GHEC REQUIRED only where the selected org plan/feature requires it; otherwise use the eligible prepared org repository. DEMO / FALLBACK: the trainer can demonstrate queue validation in an authorized repository. Expected evidence: learner identifies the exact combined commit tested. Failure/recovery: if no merge-group run appears, check workflow trigger, queue eligibility, and required checks; do not infer integration validation from PR-head green checks. Docs: [D11](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue), [F02](https://github.com/github/docs/blob/15f068380afe64f9d87ef55ec24d590eb9e055da/data/reusables/gated-features/merge-queue.md). -->

---

# Lab 5: Build a small stack
- Create the bottom PR targeting the default branch (`main` in this lab), then create the top PR from it
- Use Create stack or GitHub's recommendation banner to make it a native stack
- Write the cancellation policy and observe the supplied top-PR report
- Read each PR's diff: the lines that it adds or removes
- Compare checks on every PR with optional checks on the top PR
- List the checks that must still pass for each PR

<!-- notes: Timing 20-28 min. Follow hol/day-2/05-Stacks-and-queue.md in each participant repository. The bottom PR targets the lab default branch and adds the check script; the top PR is based on the bottom branch and uses that script. Use GitHub's bottom/top terminology consistently. Use Create stack or GitHub's recommendation banner after opening the PRs; this is the action that creates native stack membership and exposes stack metadata. Runs triggered before stack creation retain their earlier event payloads, so push a harmless top-branch comment if a fresh run is needed to show the report. Optional work may run only for the top PR, but validation remains mandatory for both. Expected evidence: stack graph, focused diffs and mandatory results. If native stacks or permissions are unavailable, label fallback evidence explicitly; do not grant broad access. Docs: [D12](https://docs.github.com/en/pull-requests/reference/stacked-pull-requests), [D13](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/optimizing-ci-for-stacked-pull-requests), [D14](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-stacked-pull-requests). -->

---

# See which old runs can be cancelled
- Push one small change, then push a second change while the first run waits
- Observe which runs restart and which older runs are cancelled
- Confirm PR cancellation does not stop merge-queue checks
- Record actual cancelled work; do not assume billing savings

<!-- notes: Timing 28-35 min. Follow hol/day-2/05-Stacks-and-queue.md: set LAB_STACK_DELAY_SECONDS to 150, add one harmless YAML comment on lab-05-top and push it. Once validate logs Waiting 150 seconds, add and push a second harmless comment. The long delay gives learners time to make the second change without hurrying. Observe first run cancelled and replacement success; reset the delay to 0 and record each head/base/merge SHA. Temporary pending optional checks before native metadata exists are not proof of a permanent missing result. Cancellation saves obsolete execution, not a measured billing amount. If a learner's workflow file drifts from the starter, compare it with the solution; the trainer can demonstrate if needed. Docs: [D05](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency), [D13](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/optimizing-ci-for-stacked-pull-requests), [D11](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue). -->

---

# Lab 5: Check the combined changes
- Requires: repository administrator access; organization repository that is public, or private on GHEC
- Add the example stack to the merge queue
- Find the combined commit and its required check results
- Compare each PR's checks with checks of the combined changes
- Explain which repeated work was avoided

<!-- notes: Timing 35-40 min, plus repository policy setup. The visible requirement applies before learners attempt policy setup. Participants configure merge queue and the stable validate check on their own exact base branch; it is not assumed preconfigured. Record existing rules, queue from the top PR and identify the combined commit. Restore only course-specific policy before disabling the workflow. Expected evidence: PR versus combined-revision checks and actual avoided work. If queue access or an eligible plan is unavailable, the trainer can demonstrate in an authorized repository. Docs: [D11](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue), [D12](https://docs.github.com/en/pull-requests/reference/stacked-pull-requests). -->

---

# Three independent merge controls
- When all three rules are enabled, each needs its own passing result
- Requires: GHEC and organization ruleset permissions for required workflows

## Independent rules: merge only after each one passes
```gates
Status check | Passes for this commit, not an earlier one.
Deployment | Successful deployment to the required environment.
Required workflow | The selected workflow passes; optional reuse is not enough.
Merge | Allowed only when all required rules pass.
```

<!-- notes: Timing 40-45 min. Begin the 40-60 teaching segment. Contrast the three rules by evidence type and enforcement source. Check eligibility for each rule separately; do not claim every ruleset capability is Enterprise-only. Expected evidence: learners classify a prepared merge blocker by its actual rule. Failure/recovery: if UI wording differs by plan or host, use current ruleset docs and tenant verification, not a stale screenshot. Docs: [D15](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets), [D16](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#require-workflows-to-pass-before-merging), [W09](https://github.com/github/github-well-architected/blob/d7ff7ab0b225e189c18dadca53196b0d8bc19764/content/library/collaboration/recommendations/scaling-actions-reusability.md). -->

---

# Make required checks easy to identify
- Use a consistent check name and select its expected source
- Check whether the rule requires an up-to-date branch
- Filtering out a whole workflow can leave its required check pending
- A skipped job can appear successful without doing any work

<!-- notes: Timing 45-50 min. Explain required check names, source selection, and strict/loose branch update behavior. A workflow filtered out at trigger level can leave a required check pending; skipped jobs can have successful-looking conclusions. Expected evidence: learners can diagnose a check that is absent versus failed. Failure/recovery: use an always-running aggregator instead of weakening policy or selecting an unstable matrix-generated name. Docs: [D15](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets), [D17](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks). -->

---

# Required deployments need real evidence
- An environment is a named deployment target, such as lab-staging
- An approval or a job named deploy does not prove a successful deployment

## The deployment record, not the job name, satisfies the rule
```flow
Deploy job | The job uses environment: lab-staging.
Health check | The app answers /health.
Deployment record | GitHub records success for this commit.
Rule satisfied | Other merge rules still apply.
```

<!-- notes: Timing 50-55 min. Show the prepared staging gate and distinguish successful deployment from approval or a job label. Check repository visibility/plan and selected environment eligibility separately. Do not have learners provision a production target. Expected evidence: an actual successful deployment record tied to the expected revision. Failure/recovery: if staging is unavailable, use the prepared run and identify its tested revision; never mark an approval-only scenario as success. Docs: [D15](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets), [F05](https://github.com/github/docs/blob/15f068380afe64f9d87ef55ec24d590eb9e055da/data/reusables/gated-features/repo-rules.md). -->

---

# An organization can require a workflow
- Requires: GHEC, organization ruleset permission and workflow sharing

## An organization rule requires results, not just reuse of workflow code
```flow
Organization rule | Selects a workflow and target branches.
Workflow source | A reviewed workflow the target can access.
Commit to test | The workflow runs for the PR commit.
Merge decision | Missing or failed results block merging.
```

<!-- notes: Timing 55-60 min. GHEC REQUIRED applies to this central-workflow feature, not every check/deployment rule. Repository-local status/deployment scenarios need repository administration; the central rule separately needs organization ruleset-management permission. Technical access is not authorization: follow hol/day-2/06-Gates.md for explicit source-owner and policy-owner approval before sharing or rule activation. The source's organization Actions sharing can expose actions/reusable workflows to more repositories than the rule's single selected target. Select exactly the participant repository/main, no bypass actors; never broaden access to finish class. The trainer can demonstrate in an authorized practice repository when roles or organization policy prohibit participant changes. If that is also unavailable, explain the behavior without claiming enforcement was demonstrated. Check the account, host (GitHub.com or GHE.com) and feature eligibility before class. Cleanup removes only course rules before restoring any approved sharing change. Docs: [D16](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#require-workflows-to-pass-before-merging), [F03](https://github.com/github/docs/blob/15f068380afe64f9d87ef55ec24d590eb9e055da/data/features/repo-rules-required-workflows.yml), [F05](https://github.com/github/docs/blob/15f068380afe64f9d87ef55ec24d590eb9e055da/data/reusables/gated-features/repo-rules.md). -->

---

# Lab 6: Find why merging is blocked
- Requires: repository admin; GHEC and org ruleset permission for the central policy
- Complete gate and policy TODOs; use the supplied staging workflow
- Name the rule that is not yet satisfied
- Change one relevant setting or input at a time
- Do not bypass the rule to make the example pass
- Use an authorized trainer demo when organization policy forbids changes

<!-- notes: Timing 60-65 min, plus policy setup. Follow hol/day-2/06-Gates.md, isolating one course rule at a time without weakening existing protections. Use repository-level check and deployment rules; an organization-level deployment rule cannot select a repository environment. Use the separate single-target organization rule only for central workflow enforcement. Confirm identity, scope, revision and expected evidence before acting. Roles and explicit approval are separate requirements; demonstrate in an authorized trainer repository when participant policy disallows changes. Docs: [D15](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets), [D17](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks). -->

---

# Lab 6: Choose checks from changed files
- Use the supplied pinned tj-actions/changed-files detector; try docs, app and shared-file edits
- Shared files include workflows, lockfiles and shared libraries
- Recheck changed files for the merge queue's combined commit
- If file detection fails, run all checks or block merging

<!-- notes: Timing 65-72 min. Lab 6 supplies tj-actions/changed-files v47.0.6 independently; do not require Lab 3's optional archive-cache stretch. Keep fetch-depth 0, explicit event base_sha/tested sha, skip_initial_fetch and fail_on_initial_diff_error. Ordered patterns select all, exclude Markdown, then re-include .github. Use all_changed_and_modified_files_count so deletions and type changes count; count both rename paths. Zero selected files means checks=false, otherwise true; missing count conservatively requests checks. Use the docs, application and shared-workflow test cases in hol/day-2/06-Gates.md. Temporarily replace base_sha with 40 zeros only in the practice PR to cause detection failure; restore it for recovery. The supplied detector is scaffolding: learners still implement the final gate. Re-evaluate the merge-group combined revision, never reuse the PR list. Detection errors must block the final gate. Docs: [D23](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushpull_requestpull_request_targetpathspaths-ignore), [B03](https://github.com/tj-actions/changed-files/tree/9426d40962ed5378910ee2e21d5f8c6fcbf2dd96), [D11](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue). -->

---

# Lab 6: Make the final check verify results
- Each step checks one condition with if: and fails with ::error::

## Gate solution excerpt: the job uses if: always() and needs: [impact, application]
```yaml
- if: needs.impact.result != 'success'
  run: echo '::error::Change detection failed'; exit 1
- if: >-
    needs.impact.outputs.checks == 'true' &&
    needs.application.result != 'success'
  run: echo '::error::Needed checks did not pass'; exit 1
# Also fail on a missing decision or unneeded checks not skipped.
```

<!-- notes: Timing 72-79 min. Learners complete an always-running final job whose step conditions validate change-detection success and every applicable check. Ensure skipped jobs do not bypass the final gate; failed dependencies and missing outputs remain failures. Expected evidence: docs-only change safely skips only irrelevant checks; shared inputs fan out; failed detection blocks or runs all. Failure/recovery: if the aggregator can't distinguish skipped from failed, fix its result logic before considering the policy satisfied. Docs: [D17](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks), [D23](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushpull_requestpull_request_targetpathspaths-ignore). -->

---

# Lab 6: Tests are only one merge rule
- After a new push, an earlier passing run does not prove the new code passes

## Predict the decision for these examples
| Checks | Deployment | Central workflow | Decision |
| --- | --- | --- | --- |
| Pass | Failed | Pass | Block: failed deployment |
| Pass | Success | Missing | Block: missing workflow |
| Pass on old commit | Success | Pass | Block: old check results |
| Pass on latest changes | Success | Pass | All three rules satisfied |

<!-- notes: Timing 79-86 min. The table is a conceptual prediction exercise, not evidence that every row was rehearsed. For live deployment failure set LAB_STAGING_FAIL=true on a fresh revision: application/required checks pass but the lab-staging deployment fails. Reset false and rerun staging to build, start and health-check the local server; inspect its successful deployment record. For central enforcement use the lab's overlong-title failure, then shorten the title and synchronize. A practice PR deleting its local policy workflow still runs the rule-selected source on main; close it unmerged. A test run confirmed blocked -> clean for central policy; a permanent missing-result case was not tested. Pending alone is not permanently missing. Never bypass or accept old-SHA evidence. Docs: [D15](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets), [D16](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#require-workflows-to-pass-before-merging), [D17](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks). -->

---

# Lab 6: Check the merge-queue run
- Reopen your Lab 5 merge-group run and its combined commit
- Confirm the run was started by `merge_group`
- Check that no required workflow is missing because of a filter
- Distinguish Lab 5 queue evidence from Lab 6 gate evidence

<!-- notes: Timing 86-95 min. Revisit the participant's or trainer's Lab 5 merge_group run; this is not another Lab 6 queue merge or a claim that the Lab 6 aggregator/central rule ran in that queue. Identify the tested combined SHA and its actual base. A test run produced two groups despite merge limits of one; do not assume every class run groups PRs the same way. If no Lab 5 run is available, the trainer can demonstrate the queue or explain the expected behavior without claiming it was observed. Explain why filters or missing evidence can deadlock a required gate. Cleanup: remove/restore course-only requirements before disabling all three Lab 6 workflows; reset the failure variable, remove the idle course environment and restore only approved temporary sharing changes. Preserve existing/shared policy. Docs: [D11](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue), [D17](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks). -->

---

# Review: Fewer runs, but still enough checks
- Which repeated runs did we avoid?
- What tests each PR and the combined changes?
- When can a documentation-only change safely skip tests?
- What happens if we cannot identify the changed files?
- Which rule changes need an administrator?

<!-- notes: Timing 95-105 min. Use the full ten-minute debrief. Ask learners to explain stack-level evidence, queue combined revision, a safe docs-only path, detection failure behavior, and the difference between required status checks, deployments, and central workflows. GHEC REQUIRED recap applies to the specific required-workflow rule; eligibility for other rules is independently checked. Cleanup: do not leave temporary branches or active runs; coordinate rule/queue changes with admin and retain shared policy. Expected evidence: a design that reduces redundant work while every merge gate has explicit evidence. Failure/recovery: if a policy demo was unavailable, state that tenant validation remains pending rather than claiming success. Docs: [D12](https://docs.github.com/en/pull-requests/reference/stacked-pull-requests), [D11](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue), [D15](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets), [W05](https://github.com/github/github-well-architected/blob/d7ff7ab0b225e189c18dadca53196b0d8bc19764/content/library/governance/recommendations/managing-repositories-at-scale/rulesets-best-practices.md). -->
