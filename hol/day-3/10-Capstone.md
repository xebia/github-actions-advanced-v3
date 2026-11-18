# Capstone: three gates to green

**Time:** 30 minutes, including the exam map and homework hand-out.

**Before you start:** Finish the core modules or note which were trainer demonstrations. Keep one practice PR and a partner available. Do not introduce a new policy across the organization for this exercise.

**If some gates are unavailable:** Show the gates you actually built and ask the trainer to demonstrate the missing mechanism. Label the difference; a diagram is not enforcement evidence.

## Objectives

Show three independent merge blockers, clear them deliberately, and explain which GH-200 skills you practiced.

## Tasks

1. Prepare one PR blocked by at least three mechanisms. Use coverage below 80%, `external/change-approval` pending/failing, and missing code-owner approval. Use a workflow-file change to request the pipeline owner.

   An independently failing Trivy result from the organization-required workflow can replace one mechanism. Do not count the same coverage failure twice merely because both a required workflow and a required-check rule mention it.

2. Show the merge box and failing run/check evidence. Explain where each rule is owned, who can change it, which revision is tested, and why unrelated green jobs do not permit merging.

3. Restore the coverage test and any intentionally changed image. **This creates a new revision.** Wait for the new coverage/scan results, publish external approval for the new SHA, then obtain the required review. If stale approvals are dismissed on push, request the owner again after the last code change.

4. Observe merge eligibility with all three mechanisms satisfied. Merge only if the facilitator approves; otherwise retain the PR as evidence and close it during cleanup.

   A production reviewer from M8 gates a deployment from `main`, not automatically this PR. Do not count that waiting post-merge deployment as a PR blocker. CODEOWNERS provides the human merge gate here.

5. Give a two-minute explanation to your partner. If you completed [Pages stretch S9](STRETCH.md#s9---publish-to-github-pages), show the real URL and distinguish it from M8's mock deployment.

<details>
<summary>Hint: record evidence per revision</summary>

| Mechanism | Required revision | Blocking evidence | Recovery evidence |
| --- | --- | --- | --- |
| Coverage | Current PR/test revision | Measured value below 80; required failure | Test restored, valid report above threshold |
| External check | Current expected SHA | App check pending/failing | Same expected publisher reports success |
| Code owner | Current diff and base ownership rules | Designated owner approval missing | Valid owner approves final changes |

After a push, refresh this table rather than reusing a successful check from the previous SHA.
</details>

## Exam map

| GH-200 domain | Today's practice |
| --- | --- |
| Author and manage workflows | M1, M2, M5, M6: events, dependencies, data, summaries, required results |
| Consume and troubleshoot workflows | M1, M2, M2b, M4, M9: runs, filters, reuse and API diagnosis |
| Author and maintain actions | M3: metadata, inputs/outputs, composition, distribution |
| Manage GitHub Actions for the enterprise | M4, M7, M7b, M8: access, organization policy, ownership, environments |
| Secure and optimize automation | M1, M3, M5, M8, M9: immutable dependencies, permissions, trust and federation |

Use the current [GH-200 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-200) for the exam's authoritative scope; slide percentages can become outdated.

## Checkpoint and cleanup

Show one PR independently blocked by three mechanisms, then eligible after all required evidence and approvals are current. Explain any unobserved/demo-only parts accurately.

Choose [homework](HOMEWORK.md) based on your two weakest domains, then complete [cleanup](11-Cleanup.md) before leaving.
