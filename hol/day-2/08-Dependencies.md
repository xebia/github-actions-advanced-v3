# 🔨 Lab 8: Make the dependency inventory useful

**Time:** About 20 minutes. Dependency graph updates may take longer to appear.

**Before you start:** Open your lab repository and check that its dependency graph is enabled. You will run submission from reviewed code on the default branch.

> **Requires:** repository administrator access if the dependency graph is not enabled yet. You only change settings for your own lab repository; organization security settings stay as they are. If you do not have this access, use the trainer's before-and-after snapshots.

If the dependency graph takes longer to update than the lab allows, also use the trainer's snapshots.

## Objectives

Distinguish pinned execution identity, dependency inventory, advisory metadata and the contents of a shipped artifact.

## Tasks

1. Open **Insights → Dependency graph** in your lab repository. Compare an action with its entry in `.github/workflows/actions.lock`. Note its source, SHA and any version or upstream information. What does the SHA tell you by itself?

   Export the graph's SPDX software bill of materials (SBOM) as your **before** snapshot. Note the time and commit. An empty graph is a useful starting observation too. [Dependency graph](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-graph), [export a graph SBOM](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/establish-provenance-and-integrity/export-dependencies-as-sbom)

2. Copy the `08-dependencies.yml` starter into `.github/workflows`. Replace the placeholder with the dependency-submission action from the course version lookup.

   Use its documentation to configure the job token, lock verification and direct/transitive relationships. A transitive dependency is one used by another dependency. Grant the required write permission only to `submit`; keep the empty workflow permissions and default-branch restriction. The course lookup and solution include the reviewed verifier version.

   Generate and review the lockfile, commit, push and run the workflow. Look for confirmation that the lock was verified, rather than a warning that verification was skipped. [Submission action inputs and permissions](https://github.com/jessehouwing/actions-dependency-submission/blob/811981eec3c108f41783f194522fde91a34301a4/README.md), [submission API](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/use-dependency-submission-api)

   Export an **after** snapshot and compare relationships and unresolved entries. Indexing takes time, and other detectors may already know some dependencies; unchanged counts do not necessarily mean submission failed. Leave other detectors' snapshots and existing token permissions alone.

3. Generate an inventory of the app's built npm components. From `app`, run `npm ci --ignore-scripts` and `npm run build`. Then, from `app/dist`, run `npm sbom --sbom-format spdx --omit=dev`. Save the JSON **outside `dist`** and keep generated output out of Git.

   Compare it with the repository graph export. Expect `picocolors` in both, but workflow actions only in the graph. The npm inventory does not list every source file or operating-system component.

   Name one item each inventory may include or omit. What would help you check its coverage? [npm sbom](https://docs.npmjs.com/cli/v11/commands/npm-sbom)

4. Discuss why pinned execution SHAs and version/upstream information are both useful. The submission action can also report Docker images that workflows use; this detection is still experimental. What could an unresolved SHA or a missed Docker image leave unknown? Use the instructor's static advisory example; you do not need to run a vulnerable action.

<details>
<summary>Hint</summary>

An inventory lists what its detector found. It may not include every file you ship or every component that has a security advisory.
</details>

<details>
<summary>Solution</summary>

The [completed workflow](../../solutions/workflows/08-dependencies.yml) uses `jessehouwing/actions-dependency-submission@v2.0.2` to read `.github/workflows/actions.lock` and submit its dependencies.

Setting `actions-lock-version: v0.4.1` requires lock verification rather than continuing with an unverified-lock warning. The action installs the verifier extension if needed, so GitHub CLI must be available. Generate and review your execution lock before running the workflow.

Only the `submit` job receives `contents: write`. The default-branch condition keeps submission on reviewed code.

Set `report-transitive-as-direct: 'false'` explicitly. This keeps dependencies used by other dependencies distinct from those used directly. The action's README and input metadata give different defaults, so relying on the default would make the result ambiguous.

Inspect relationships and unresolved entries in the graph, not just the successful run. A graph inventory and an artifact inventory describe different sets of components; neither proves that those components have no vulnerabilities.
</details>

## Success and cleanup

Keep your submission run and before/after snapshots, including the built-component inventory. Be ready to explain what each inventory covers and what remains unknown.

Cancel unneeded runs and disable **Lab 08 trusted dependency submission**; it is not used in Lab 9. Leave shared graph data and other dependency automation in place. If you received temporary access, arrange its removal with the owner.

Next: [Lab 9](09-Promotion.md).
