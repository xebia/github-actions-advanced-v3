# 🔨 Lab 2: Cache a large, versioned tool download

**Time:** About 25 minutes, plus download and cache transfer time.

**Before you start:** Complete [Lab 1](01-Measure.md). You need permission to update your lab repository's default branch and run workflows on a hosted Linux x64 runner with Node 24, GNU tar and zstd.

The download helper is provided. Your task is to add cache restore and save steps around it. The download runs on the runner; you do not need the bundle on your own computer.

**If the download or cache is unavailable:** Ask the trainer to demonstrate the cache comparisons. This also applies if your runner or cache budget is too small.

## Objectives

Lab 1 downloads this same CodeQL bundle without caching. Here you will cache the archive and measure what changes. Compare the matching CodeQL steps rather than total job times: this workflow does not run Lab 1's app tests or build.

Cache a substantial download without a setup action's built-in caching. Populate only from reviewed main, restore read-only from PRs, and distinguish miss, exact and compatible partial reuse while verifying the requested bytes on every path.

## What you are caching

The [CodeQL bundle v2.27.4 release](https://github.com/github/codeql-action/releases/tag/codeql-bundle-v2.27.4) supplies `codeql-bundle-linux64.tar.zst`: **559,484,083 bytes (about 559 MB / 534 MiB)**, with published SHA-256. This is a CLI/query bundle, not a single query pack. We download it directly, not through `codeql-action/init` or another caching installer.

[`examples/codeql-bundle.json`](../../examples/codeql-bundle.json) records the reviewed release, asset, byte size, checksum and a descriptive `note`. This is separate from `actions.lock`, which controls the versions of actions your workflow executes.

The supplied [`tools/prepare-codeql.mjs`](../../tools/prepare-codeql.mjs) downloads a missing archive into `.cache/codeql-downloads` and checks its size and SHA-256 on every run. A corrupt cached archive causes an error rather than an automatic replacement download.

The workflow extracts the verified archive into a new temporary directory and runs that copy's `codeql version` command. It does not use a CodeQL installation already on the runner. You still need to add the Actions caching steps.

## Tasks

1. Read about [cache matching and access](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching) and [cache inputs and outputs](https://github.com/actions/cache#usage), then inspect the manifest and helper.

   Design a key containing the OS, architecture, tool name, your own cache version label (also called an **epoch**) and the manifest hash. Your fallback prefix should keep the same platform, tool and cache version, without the manifest hash.

   Cache **only** `.cache/codeql-downloads`. Leave extracted tools, the workspace, credentials and analysis databases out of the cache. [Release assets and checksums](https://github.com/github/codeql-action/releases/tag/codeql-bundle-v2.27.4)

2. Copy the two `02-cache-*.yml` starters into `.github/workflows`. In both, add restore before the supplied preparation step.

   In the main-branch job, add save after verification, extraction and the version check succeed. Save only when restore did not find the exact key. In the PR job, report the lookup result but do not save.

   Replace the error placeholders with your implementation. Keep the helper and extraction running even on exact hits: finding a cache does not verify its contents.

   Keep the supplied permission settings, main-branch restriction and PR `cache-mode: read`. Leave setup-node's package caching disabled; Node runs the helper, not an npm-cache exercise. Generate and review `actions.lock` after adding actions.

3. Use the same new epoch in both workflows' keys and prefixes, such as `lab-yourhandle-20261110-a`. Commit and push your reviewed workflows and the unchanged manifest to `main`.

   This should give a **cold miss**. Wait for the run and record the lookup, download, verification, extraction and version-check results. Check the cache budget with the instructor: the first save is roughly 559 MB.

4. For an **exact hit**, add a harmless comment to `tools/prepare-codeql.mjs`, then commit/push without changing the manifest or cache epoch. This helper path is included in the trigger; an empty push or unrelated app/docs change is not. Expect cache transfer plus checksum verification/extraction, but no upstream bundle download. Report actual results if eviction or a failed save prevents reuse.

5. For a **compatible partial hit**, change only the manifest's `note`, commit, push and wait. The file hash changes, but the version, asset, size and digest stay the same. Look for a fallback restore, reuse of the downloaded archive and a save under the new key.

   Changing a note is a convenient way to test partial reuse in this lab, not a reason to invalidate production downloads.

   Next, cause a **miss** by changing the epoch in both workflows' primary keys and restore prefixes. Keep the checksum and bundle version unchanged.

6. Open a PR changing only the manifest's `note` again. Check that the PR workflow restores the cache but does not save one. Also check the setup steps: an action such as `setup-node` with its `cache:` input would save a cache of its own. A branch can restore default-branch caches, so the default-branch workflow must stay the only writer.

   Separately, try a docs-only change. These optional cache workflows should not run for it, so they should not be required checks. If you rename a workflow, update its self-path filter. Workflows that build releases or deploy should not restore caches at all: a poisoned cache could end up in what you ship.

   For a real bundle upgrade, review the version, size and checksum together. A restored older version cannot replace the requested version.

| Checkpoint | cache-hit / matched key | Upstream download? | Verify / extract / version passed? | Restore / download / verify / extract / save time |
| --- | --- | --- | --- | --- |
| Cold/miss | | | | |
| Exact | | | | |
| Compatible partial | | | | |
| New epoch/miss | | | | |
| PR restore only | | | | |

A restored cache still transfers hundreds of megabytes. Compare restore/save transfer time, upstream download time, verification, extraction, queue time and total job time separately. An already compressed archive may compress little further. Avoided upstream downloads do not guarantee lower latency or cost.

<details>
<summary>Hint: match identity, then verify contents</summary>

Put the manifest hash in the primary key, but leave it out of the fallback prefix. That lets the workflow look for a compatible download when the full key changes.

The helper looks for the version named in the manifest, not just any restored archive. Run it even after an exact hit so it checks the requested archive's checksum.

`setup-node` can cache npm downloads, but it does not cache this directly downloaded CodeQL archive.
</details>

<details>
<summary>Solution and trust boundary</summary>

Compare your implementation with the [main-branch writer](../../solutions/workflows/02-cache-main.yml) and [PR restore workflow](../../solutions/workflows/02-cache-pr.yml).

The primary key combines OS, architecture, `codeql`, your cache version label and `hashFiles('examples/codeql-bundle.json')`. The workflows cache only `.cache/codeql-downloads`.

The restore output tells you what matched:

| `cache-hit` | What happened |
| --- | --- |
| `'true'` | The full key matched. |
| `'false'` | A fallback key matched, but the full key did not. |
| Empty string | No cache matched. |

The main workflow saves under the new primary key only after verification, extraction and the version check pass, and only when restore did not find an exact match. The PR workflow never saves.

The helper reads the expected version, size and checksum from the reviewed manifest. It checks downloaded or restored bytes against those values before returning an archive path. The workflow then extracts that archive outside the cache and runs its version command.

This is why the manifest checksum must not come from the restored cache: you need a separate, reviewed value to check against. A matching checksum confirms the expected bytes, not that the tool has no vulnerabilities.

Ordinary PR cache saves, where the platform allows them, are merge-ref scoped and cannot replace main's cache. In this course, PR jobs only restore. Other low-trust events have separate platform safeguards; leave those protections in place.

A default-branch workflow can still consume untrusted data. Discuss the poisoning risk with a diagram rather than a live experiment: untrusted input reaches a cache writer, then a later privileged job consumes that cache.
</details>

## Success and cleanup

Use your table to explain what the cache restored, whether the helper reused it and which transfers were avoided. Compare timings before deciding whether caching helped.

Close your practice PRs, cancel unneeded runs and disable **Lab 02 trusted cache writer** and **Lab 02 PR restore only**. Neither is used in Lab 3. Keep **Lab 01 baseline** for the image comparison.

Agree with the instructor which of your cache keys to retain until class ends. Several cache versions can use substantial storage; remove only your recorded course caches, not shared entries. Keep downloaded bundles and extracted tools out of Git.

Next: [Lab 3](03-Prewarm.md). The [end-of-class checklist](10-Cleanup.md) covers final cache cleanup.
