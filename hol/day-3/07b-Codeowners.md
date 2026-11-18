# M7b: Lock down workflow changes with CODEOWNERS

**Time:** 20 minutes.

**Before you start:** Complete [M7](07-Organization-gates.md). Your partner must have write access. Teams used as owners must exist, be visible and have explicit write access. Coordinate any edits to the organization rule.

**If you cannot change the organization rule:** Use an authorized repository-level demonstration with the trainer; label it as different from organization enforcement.

## Objectives

Require the appropriate person to review pipeline changes and distinguish code-owner review from any approval.

## Tasks

1. Add `.github/CODEOWNERS` on your default branch through a reviewed PR. Start with a catch-all for an existing app-maintainer team, then more specific entries for `/.github/workflows/`, `/.github/actions/` and `/.github/CODEOWNERS` naming your partner or an approved platform team.

   Put the catch-all first because the last matching pattern wins. Protect CODEOWNERS itself so changing the reviewer list also needs review. See [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners).

2. Check the file's errors in GitHub's CODEOWNERS view/file banner and confirm every named owner is eligible. If the host exposes **Settings > Code and automation > Code owners**, inspect that view too. UI locations vary; an existing file without syntax errors does not prove the named team can review.

3. In the exact-target organization ruleset, enable **Require a pull request before merging**, one approval and **Require review from Code Owners**. Do not weaken existing approval rules or add yourself to bypass.

4. Open a PR changing only `ci.yml`. Confirm your partner is requested. If a third attendee is available, have that non-owner approve first and show that the code-owner requirement remains. Then have the owner approve and observe that requirement clear.

5. Open an app-only PR. Verify which owner is requested. With a catch-all app owner, **app changes still require a matching code owner**; they just do not need the platform/workflow owner. Contrast this with a workflows-only ownership policy if you want app files unowned.

<details>
<summary>Hint and ownership example</summary>

Replace these example identities with real, authorized owners before committing:

```text
* @TRAINING-ORG/app-maintainers
/.github/workflows/ @PARTNER
/.github/actions/ @PARTNER
/.github/CODEOWNERS @PARTNER
```

Different owners on one line are alternatives, not multiple mandatory approvals. The CODEOWNERS file used for the PR comes from the **base branch**. Creating it only in the PR being tested does not establish the intended protection.
</details>

<details>
<summary>Solution walkthrough</summary>

The workflow PR matches the last applicable pipeline pattern and requires its designated owner. Approval from a different reviewer does not satisfy that ownership rule. The app PR matches the catch-all and requires an app owner, not the pipeline owner.

This corrects the slide's app-only checkpoint: a catch-all cannot simultaneously make app files owned and exempt them from required code-owner review.

The prepared reference is `solution/module-07b` in the template, if supplied.
</details>

## Checkpoint and cleanup

A workflow change stays blocked until its designated owner approves. Show the app-only comparison and identify which owner it requires.

Keep ownership protection for the capstone. Close disposable PRs; do not remove shared team membership or the organization's baseline rule.

Next: [M9](09-External-checks.md).
