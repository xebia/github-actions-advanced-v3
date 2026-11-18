# M7: Organization rulesets and required workflows

**Time:** 55 minutes.

**Before you start:** Complete [M6](06-Coverage-gate.md) and [M8](08-Environments.md). You need an eligible Enterprise Cloud organization, approved organization ruleset-management access and owner-approved workflow sharing. Code-scanning/SARIF support is a separate eligibility check.

**If any feature or role is unavailable:** Ask the trainer to demonstrate it in an authorized repository. Repository administration alone is not enough; do not broaden your access or the target pattern.

## Objectives

Enforce centrally owned coverage and container checks, target one repository safely and observe enforcement with no local workflow.

## Tasks

1. Watch the facilitator's single-repository example. Agree your exact practice-repo target, the organization ruleset name `<handle>-gates`, and the allocated source file, for example `.github/workflows/required-ci-HANDLE.yml`.

   The source should remain centrally owned. Do not edit another attendee's workflow. Compare Active (enforced), Evaluate (observations only) and Disabled. Do not activate a broad wildcard to demonstrate its danger. See [organization rulesets](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/creating-rulesets-for-repositories-in-your-organization).

2. In your allocated required workflow, call the M4 reusable workflow with fixed `coverage-threshold: 80`. Configure `pull_request` and `merge_group` support as required by the host/ruleset; include any additional supported event required by the selected rule. Do not use path/branch filters that suppress required evidence.

   Use stable names for coverage and `trivy`. A ruleset-required workflow is different from requiring the name of a locally editable status check. See [required workflows](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#require-workflows-to-pass-before-merging).

3. Add the container scan. In a read-only Linux job, build the root Dockerfile using the already built static output, or prepare the output once in this job if this independent required run has no artifact yet. Do not download an artifact from an unrelated run. Scan the exact tagged image using `aquasecurity/trivy-action`.

   Configure severity `HIGH,CRITICAL`, `exit-code: '1'`, SARIF format and a known output filename. Do not ignore unfixed findings just to make the checkpoint pass. Use reviewed releases/locks, explicit timeouts and no deployment secrets. See [Trivy Action](https://github.com/aquasecurity/trivy-action).

4. Preserve SARIF even when Trivy reports vulnerabilities. Separate the read-only build/scan from any job with `security-events: write`: that upload job should download only the named SARIF artifact, validate its existence/format and upload it with `github/codeql-action/upload-sarif`, without checkout or execution of PR code.

   Run reporting after a scan failure when a report was produced, but keep the failed scan required. A missing SARIF or scanner/network failure is not a clean scan. Fork restrictions must remain intact; if upload permissions are unavailable, record that limitation rather than widening the token.

5. In **Organization Settings > Repository > Rulesets**, create your rule in Evaluate mode, selecting only your exact repository and `main`. Confirm the target preview with your partner. Add **Require workflows to pass before merging**, selecting the approved source repository, file and ref.

   Inspect evaluation results, then activate the single-target rule with approval. Keep bypass actors empty for the exercise. Private/internal source sharing and allowed-actions policies must both permit execution; sharing can expose source more broadly than this rule's target.

6. Open a PR using the facilitator's **preflighted vulnerable base-image tag/digest**. Build and scan it only in the isolated lab; never deploy or publish it. Observe a HIGH/CRITICAL failure, Security findings if supported, and the merge blocker. Restore the reviewed clean image and show recovery.

   Vulnerability databases change. If the prepared image no longer reproduces the result, ask for a trainer demonstration. Do not fabricate SARIF, suppress findings or select an arbitrary old tag and claim it is known vulnerable.

7. Prove the zero-local-YAML case in a **second disposable repository you own**, created from the same app template without workflows. With the policy owner's approval, change your rule's exact target to this repo only, or create a separate exact-target course rule.

   Open a PR deleting the prepared coverage test; observe central coverage failure. Restore it and make the approved image change; observe the independent Trivy failure. Both checks must actually execute; missing-app errors do not prove coverage or security gating.

8. Inspect rule insights and identify the effective organization rule from the repository view. Observe that a repository-only administrator cannot remove it; do not remove owner access to prove this. Review, but do not grant, bypass privileges.

9. With approval, compare property-based targeting (`tier=production` at 80, `tier=experimental` at 60) in Evaluate mode on only your disposable repos. Threshold policy must come from reviewed central configuration, not an unrestricted input chosen by the PR author. Rulesets layer: an experimental 60% rule cannot weaken another applicable 80% rule. Make the intended scopes explicit rather than claiming the lower threshold overrides the baseline. Leave property administration to [A1](ADMIN-STRETCH.md#a1---custom-repository-properties) if time or permissions are short.

<details>
<summary>Hint: keep failures independent</summary>

Coverage below 80 and a container finding must each block on their own. An always-successful SARIF upload is reporting, not the scan verdict. A missing local `ci.yml` must not remove the centrally required workflow.

The no-local-YAML repository still needs the Tetris app, lockfile, tests and Dockerfile. "Zero local workflow configuration" does not mean an empty repository.
</details>

<details>
<summary>Solution walkthrough</summary>

The organization rule selects an exact repository/default branch and an owner-approved source workflow. That workflow runs in the target context and calls central coverage policy plus an independent scan. The target repository cannot remove this organization rule by deleting its own caller.

Coverage and Trivy failures are demonstrated separately. Rule insights show which revision and rule were evaluated. Evaluate mode is useful evidence of matching and violations, but only Active enforcement demonstrates blocked merging.

The prepared reference is `solution/module-07` in the template, if supplied.
</details>

## Checkpoint and cleanup

A freshly prepared repository with no local workflows is blocked by actual central coverage and Trivy results. Record the rule name, exact target, run URLs and one independent failure/recovery for each check.

Keep only approved exact-target rules for M7b/capstone. Restore the clean image, cancel obsolete scans, and do not leave a deliberately vulnerable image deployed or published.

Next: [M7b](07b-Codeowners.md).
