# Faster checks without weaker safeguards
- A workflow runs jobs; each runner is a machine that runs a job
- A pull request (PR) proposes code changes for review
- Measure waiting time before changing how jobs run
- Reuse tool downloads, but verify and prepare them before use

<!-- notes: Timing 0-3 min. Welcome learners to module 1 of the 105-minute section. Frame the class question: reduce time to useful feedback without weakening merge or deployment evidence. Demo checkpoint: show the small application pipeline and its baseline run, not a prepared “fast” result. Expected evidence: learners can name the workflow and one wait they want to understand. Failure/recovery: if the participant run is unavailable, demonstrate with a trainer workflow. If that is also unavailable, explain the expected timeline without claiming measured results. Docs: [W02](https://github.com/github/github-well-architected/blob/d7ff7ab0b225e189c18dadca53196b0d8bc19764/content/library/productivity/recommendations/effective-ci.md), [D01](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax). -->

---

# Remove unnecessary work first
- Make checks faster without removing tests or security controls

## Try these changes in order
```flow
Avoid | Skip a check only when the change cannot affect it.
Run together | Run independent checks at the same time.
Reuse | Reuse downloads and tools from a reviewed source.
Choose capacity | Use a larger runner only if measurements justify it.
```

<!-- notes: Timing 3-7 min. Explain this ordering and ask learners which tempting optimization they would postpone. Demo checkpoint: compare a workflow run's elapsed duration with aggregate runner time. Expected evidence: learners distinguish faster feedback from lower consumption. Failure/recovery: if metrics are inaccessible, use repository-level metrics or an anonymized instructor export. Docs: [W02](https://github.com/github/github-well-architected/blob/d7ff7ab0b225e189c18dadca53196b0d8bc19764/content/library/productivity/recommendations/effective-ci.md), [D09](https://docs.github.com/en/actions/concepts/metrics), [D10](https://docs.github.com/en/actions/how-tos/administer/view-metrics). -->

---

# Measure a run before making changes
- This first measurement is the baseline for later comparisons

## Example times, not measurements from this course
```flow
Waiting: 2 min | The job waits in a queue for a runner.
Setup: 3 min | Download code, prepare tools and install packages.
Checks: 5 min | Check code style (lint), run tests and build.
Result: 10 min | The runner worked for 8 minutes; waiting took 2.
```

<!-- notes: Timing 7-10 min. Distinguish time-to-feedback from summed runner execution and avoid treating one lucky run as representative. Demo checkpoint: open the run timeline and one comparable recent run. Expected evidence: learners can point to queue, setup, and critical-path work separately. Failure/recovery: queue delay can hide execution improvements; record it separately. Docs: [D09](https://docs.github.com/en/actions/concepts/metrics), [D10](https://docs.github.com/en/actions/how-tos/administer/view-metrics), [W03](https://github.com/github/github-well-architected/blob/d7ff7ab0b225e189c18dadca53196b0d8bc19764/content/library/productivity/recommendations/engineering-system-metrics.md). -->

---

# A faster result can use more runner time
- Runner-minutes add up time used by all runners, not time spent waiting

## Example: same checks, no waiting; actual billing may round time
| Design | Time until result | Total runner time |
| --- | --- | --- |
| One job: setup 2 min, two 4 min checks | 10 minutes | 10 runner-minutes |
| Two jobs together: each 2 + 4 min | 6 minutes | 12 runner-minutes |
| Difference | Result arrives 40% sooner | Uses 20% more runner time |

<!-- notes: Timing 10-20 min. Teach Actions performance versus usage metrics; distinguish queue time from execution time, workflow latency from aggregate runner-minutes, and elapsed duration from cost. Use anonymized/repository-level metrics if organization dashboards are inaccessible. Demo checkpoint: compare an apparently faster run with total runner execution and current runner rates. Expected evidence: learners can describe a useful before/after measure and its caveats. Failure/recovery: if p50/p95 are not exposed, do not imply the dashboard provides them; use a consistent sample and label the statistic. Docs: [D09](https://docs.github.com/en/actions/concepts/metrics), [D10](https://docs.github.com/en/actions/how-tos/administer/view-metrics), [X01](https://github.com/orgs/xebia/actions/metrics/performance), [X02](https://github.com/orgs/xebia/actions/metrics/usage), [W03](https://github.com/github/github-well-architected/blob/d7ff7ab0b225e189c18dadca53196b0d8bc19764/content/library/productivity/recommendations/engineering-system-metrics.md). -->

---

# Lab 1: Find where time is spent
- Download CodeQL fresh; run tests and build with 20-second teaching waits
- Record time spent waiting, preparing tools and running checks
- Record total runner-minutes as a separate measurement
- Choose one change and explain why it should help

<!-- notes: Timing 20-30 min. Follow hol/day-2/01-Measure.md: install and lock 01-baseline.yml, push to the participant repository, and dispatch it before inspecting its timeline. Every baseline run downloads the reviewed 559 MB CodeQL bundle into a fresh temporary directory, verifies it, extracts it and runs that CLI's version command. Tests and build each add a labelled 20-second artificial wait before their real work; later labs use those same app commands. These waits simulate latency, not CPU load; faster runners will not shorten them. Allow several minutes plus queue time. Record download_ms and verify_ms separately from extraction, app checks and summed job durations. Lab 2 only exercises the CodeQL path, so compare matching steps, not total jobs. Historical seven-second checks belong to the earlier tiny app, not this workload. Pair-check observations. If dashboard access is unavailable use run/job views. The trainer can demonstrate if a participant cannot complete the run; distinguish that demonstration from their own measurements. Retain the baseline for Labs 2/3 only, then disable it after comparison. Docs: [D09](https://docs.github.com/en/actions/concepts/metrics), [D10](https://docs.github.com/en/actions/how-tos/administer/view-metrics). -->

---

# Choose what to save and reuse
- Caches save reusable downloads; artifacts save a job's output

## These stores serve different purposes
| Store | What it holds | How it is used |
| --- | --- | --- |
| Download cache | CodeQL bundle archive | Verify, extract and check its version |
| Artifact | Build: application.tgz | Next job downloads and verifies it |
| Tool / action archive | Saved tools or action code | Set up exact versions |
| Container / runner image | Saved software and files | Start with tools already installed |

<!-- notes: Timing 30-36 min. Explain that these stores have different lifetimes, boundaries, and consumers. `cache-mode: none` disables the Actions dependency cache; it does not remove tools or Docker layers from an image. Demo checkpoint: point to one example of a package cache and one artifact handoff. Expected evidence: learners choose the mechanism that matches the material and trust boundary. Failure/recovery: if learners call every reusable store “the cache,” ask who writes it, where it lives, and what consumes it. Docs: [D02](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching), [A02](https://github.com/actions/runner/blob/310a370bf3605f5b092f8af63b3126627de2a210/src/Runner.Worker/ActionManager.cs#L1232-L1305), [W06](https://github.com/github/github-well-architected/blob/d7ff7ab0b225e189c18dadca53196b0d8bc19764/content/library/architecture/recommendations/deploying-actions-runner-controller.md). -->

---

# A cache key identifies reusable downloads
- A manifest records the tool version, file and checksum; hash that manifest

## Example key: a label used to find a saved cache
```text
Linux-X64-codeql-lab-v1-8c31...
  OS  CPU  tool   cache epoch  manifest hash

Exact key:      Linux-X64-codeql-lab-v1-8c31...
Restore prefix: Linux-X64-codeql-lab-v1-
Cache epoch: change lab-v1 to lab-v2 to stop reusing v1

A prefix matches the start of a key, not the manifest hash.
Matching a key does not prove that the contents are safe.
```

<!-- notes: Timing 36-40 min. Lab 2 directly downloads a 559 MB Linux x64 CodeQL bundle rather than duplicating setup-node's npm cache. Its reviewed manifest records release/asset/size/SHA-256 and is separate from actions.lock. Teach platform/tool/epoch/hash keys; only the primary key includes the full manifest hash. The epoch is a label chosen for the key, distinct from GitHub's cache version derived from the paths and compression tool. A note-only edit changes matching without changing bytes. Broad prefixes must retain platform/tool/schema compatibility; a requested real version change still needs that exact version. A key is not authentication. Tighten unsafe prefixes with a fresh epoch, never delete shared caches. Docs: [D02](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching), [D03](https://github.com/actions/cache#outputs), [CodeQL bundle](https://github.com/github/codeql-action/releases/tag/codeql-bundle-v2.27.4). -->

---

# How the cache lookup works
- Within each accessible branch, stop at the first matching key

## Continue to the next option only when no match was found
```flow
Exact key | Look for the full key and cache version.
Key prefix | Look for keys starting with the primary key.
Restore keys | Try each fallback key in order.
Next step | Check the default branch if needed, then download on a miss.
```

<!-- notes: Timing 40-43 min. Walk through the lookup order for an accessible branch: exact primary key and cache version, a prefix match for that key, then each restore key in order. For a restore key, an exact match is tried before its prefix; the newest matching prefix is selected. If needed, GitHub repeats the search on the default branch; PRs may also access eligible base-branch caches. Cache scope restrictions still apply. A non-exact match is a partial hit and cache-hit is 'false'. If nothing matches, the job downloads the bundle. Only the trusted writer saves, and only when the exact key was not hit; PR jobs restore only. Expected evidence: learners predict exact, partial or miss for a given key and prefix. Docs: [D02](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching#cache-key-matching), [D03](https://github.com/actions/cache#outputs). -->

---

# Finding a cache does not verify its contents
- Verify the requested CodeQL archive, extract it and check its version every time

## A cache hit means a saved cache was found
| Cache lookup | cache-hit output | Still required |
| --- | --- | --- |
| Exact hit: full key matches | 'true' | Verify, extract, smoke-test |
| Partial hit: only prefix matches | 'false' | Reconcile, verify and extract |
| Miss: no saved cache matches | '' (empty string) | Download, verify and extract |

<!-- notes: Timing 43-47 min. cache-hit is a string: exact true, partial false, miss empty. Supplied prepare-codeql.mjs verifies reviewed size/SHA-256 for cached or newly downloaded bytes; corrupt archives fail, not silently redownload. Missing requested version downloads separately rather than selecting an old restored bundle. Always run preparation/extraction/smoke test even on an exact hit. Cache only archives, not extracted executables; use the verified output path and explicit extracted CLI, never preinstalled CodeQL on PATH. Save only after success and non-exact hit; != 'true' includes partial and empty. Docs: [D03](https://github.com/actions/cache#outputs), [bundle release](https://github.com/github/codeql-action/releases/tag/codeql-bundle-v2.27.4). -->

---

# Let reviewed code save the cache
- PR jobs may download caches, not save them; deployment jobs use no cache

## PR solution excerpt; incomplete, not runnable on its own
```yaml
permissions: {}
cache-mode: read
steps:
  - uses: actions/cache/restore@v6.1.0
    with:
      path: .cache/codeql-downloads
      # key and restore-keys omitted; see full workflow
  - run: node tools/prepare-codeql.mjs
  # Then extract verified bytes and run that CLI's version command.
```

<!-- notes: Timing 47-50 min concludes the 30-50 teaching/demo segment. Distinguish course policy from platform defaults: this class requires PR restore-only plus `cache-mode: read`, while current low-trust default-context protections and cache scopes are separate platform behavior. A default-branch workflow file does not make its input trusted. Ordinary pull_request caches use PR merge-ref scope; privileged/default-context events have different scope and write restrictions. Explicit write/write-only can override safeguards and is not a recovery fix. Demo checkpoint: show a PR restore step and a deployment with no Actions cache access. Expected evidence: no PR save operation; deployment uses none. Failure/recovery: if a setup action hides an implicit writer, disable its package-manager cache and keep explicit restore behavior. Docs: [D02](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching), [D03](https://github.com/actions/cache#outputs), [F01](https://github.com/github/docs/blob/15f068380afe64f9d87ef55ec24d590eb9e055da/data/features/actions-cache-mode.yml), [D19](https://docs.github.com/en/actions/reference/security/secure-use). -->

---

# Lab 2: Compare cache results
- Complete the writer and restore-only PR starters in your repository
- Design matching keys and restore prefixes before running
- Open a pull request; its job downloads the cache but cannot save it
- Compare no saved cache (a cold run) with an exact cache hit
- Change only the manifest note for a compatible partial hit
- Use a fresh label in both the key and restore prefix for a miss

<!-- notes: Timing 50-58 min, pending renewed timed rehearsal. Implement cache TODOs around supplied CodeQL preparation/extraction steps. Start with a participant-owned epoch in both keys/prefixes and reviewed manifest for cold miss. A helper comment with unchanged manifest repeats exact key; app/docs edits do not trigger this lab. Change only manifest note for compatible partial reuse, then both epochs for a miss. PR note edit should restore only. Reconcile/verify/extract on all paths. Different branches can restore default caches but cannot overwrite them with branch saves. Report observed lookup, download/reuse and timings, never assume a hit or broaden PR writes. Docs: [D02](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching), [D03](https://github.com/actions/cache#outputs). -->

---

# Check the logs, not just the green result
- Every hit still requires checksum verification and extraction
- A missing requested bundle must be downloaded from its release
- Read the cache step's outputs and download/save messages
- A job can pass even when saving the cache was not allowed
- After comparison, disable both cache workflows; retain the baseline for Lab 3

<!-- notes: Timing 58-67 min. Record lookup, restore/save transfer, helper download_ms/verify_ms, timed extraction, smoke test and total duration separately. A restored cache still transfers roughly 559 MB and an already compressed archive may compress little further. Avoided upstream downloads are evidence, not guaranteed speed/cost improvement. The helper logs downloaded versus reused only after verification. Inspect ACTIONS_CACHE_MODE and save messages; disallowed saves can log and continue, so green alone is not proof of writing. Keep PR restore-only. Docs: [D02](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching), [D03](https://github.com/actions/cache#outputs). -->

---

# Review what the cache-saving job runs
- A workflow on main can still be unsafe if it runs unreviewed code

## Who can save, download or use the cache?
```flow
Reviewed main | Only reviewed tool inputs may populate the cache.
Saved archive | Store downloads, never passwords or tokens.
PR job | Restore only; verify before extracting or running.
Deployment | Use no package cache; verify the release artifact.
```

<!-- notes: Timing 67-75 min, closing Lab 2. Draw an inert trust chain: untrusted input -> write-capable job -> shared cache -> privileged consumer. Do not demonstrate poisoning or enable an unsafe writer. Ask learners to inspect workflow definition, run ref, consumed code/data, and cache scope separately. Expected evidence: PR has restore-only access; trusted writer consumes reviewed inputs; deployment has no dependency-cache access. Failure/recovery: if an event/ref example is uncertain, consult event semantics and cache low-trust docs; do not assume default-branch YAML equals trusted execution. Docs: [D02](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching#cache-access-for-low-trust-workflow-triggers), [D22](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows), [D19](https://docs.github.com/en/actions/reference/security/secure-use), [D20](https://docs.github.com/en/actions/concepts/security/workflow-dependency-lockfiles). -->

---

# Prepare runner software in advance
- Requires: larger runners (Team or Enterprise Cloud), runner-admin permissions, paid minutes
- Prewarming means installing tools before the job starts
- A custom runner image saves this prepared environment
- Reusing it can avoid repeated downloads and installations
- Someone must pay for, update and rebuild the image
- On supported hosted runners, `snapshot` creates the image

<!-- notes: Timing 75-85 min. Explain custom images use the `snapshot` keyword on eligible GitHub-hosted larger runners. Check tenant, runner, plan, region, retention, and billing eligibility before class. PAID RUNNER / ADMIN REQUIRED: image generation needs provisioned larger-runner capacity, billing authorization, and organization setup. Ask eligible learners to customize a unique snapshot image name and launch builds during this segment; generation may take several hours. Never ask learners to purchase a plan or change organization policy. FALLBACK: use instructor evidence and keep the workflow-editing and analysis tasks for learners. Prefetching SDKs, package downloads, Docker content, and action archives are separate mechanisms. Demo checkpoint: show image identity/version and a comparable baseline. Expected evidence: learners identify repeated work an image avoided and what still ran. Failure/recovery: if learner access or paid capacity is unavailable, use a prepared instructor run and equivalent logs. Docs: [D07](https://docs.github.com/en/actions/how-tos/manage-runners/larger-runners/use-custom-images), [D08](https://docs.github.com/en/actions/concepts/runners/larger-runners#billing), [A01](https://github.com/actions/action-versions/blob/e3c62146623237ce0e50fbb68f09fc0c4739446a/README.md), [A02](https://github.com/actions/runner/blob/310a370bf3605f5b092f8af63b3126627de2a210/src/Runner.Worker/ActionManager.cs#L1232-L1305). -->

---

# Lab 3: Build and inspect a custom image
- Requires: larger runners (Team or Enterprise Cloud), runner-admin permissions, paid minutes
- Customize the builder, add npm cache and Docker pre-pull steps, then launch it
- Continue with Lab 4; check back at a break or before cleanup
- When Ready, verify the job image version, npm seed and offline Docker
- Compare setup steps with the baseline run
- Stretch: install gh actions-archive-cache, download the action, then uninstall

<!-- notes: Timing 85-100 min. Follow hol/day-2/03-Prewarm.md. Builder success queues image creation, not readiness; in a test run this took about 50 minutes, not a guaranteed duration. Select the exact Ready seeded version on the separate consumer, wait for runner configuration and inspect Set up job -> VM Image. Control-plane Ready/latest can still produce an older image during propagation; preserve failure evidence rather than pulling missing seeds in the consumer. Verify the npm tarball and docker run --pull=never. For archive proof use a debug rerun: Copied action archive for /opt/actionarchivecache/tj-actions_changed-files/<exact SHA>.tar.gz establishes reuse. Download action repository also appears on cache hits; ref resolution still contacts GitHub. Debug reruns are optional diagnostics explained again in module 4. The inspection job and baseline do different work, so their durations do not establish end-to-end speedup. Disable builder, consumer and retained baseline after comparison; image storage remains until owner cleanup. Docs: [D07](https://docs.github.com/en/actions/how-tos/manage-runners/larger-runners/use-custom-images), [Ubuntu runner image action-cache setup](https://github.com/actions/runner-images/blob/d9a55a1954ef976392dce427271026deee8f1302/images/ubuntu/scripts/build/install-actions-cache.sh), [A01](https://github.com/actions/action-versions/blob/e3c62146623237ce0e50fbb68f09fc0c4739446a/README.md), [A02](https://github.com/actions/runner/blob/310a370bf3605f5b092f8af63b3126627de2a210/src/Runner.Worker/ActionManager.cs#L1232-L1305). -->

---

# Include the work of maintaining an image
- Measure which setup steps were avoided and which still ran
- Compare total runner time and cost
- Include the cost of creating and storing images
- Plan updates and a way to return to a previous image
- During cleanup, remove only resources created for this course
- Still waiting? Record pending; agree cleanup or an approved follow-up

<!-- notes: Timing 90-100 min. Review image comparison and whether the same workload, runner capacity, and comparable queue conditions were used. Discuss image freshness, reviewed seeds, protected builders, rebuild cadence, retention/storage charges, and deprovisioning paid runner/image resources. Cleanup means stop training workflows and remove course-owned images/runners only; preserve shared infrastructure and coordinate admin-owned policy. Expected evidence: a decision to cache, prewarm, or do neither, defended by observed savings and ownership cost. Failure/recovery: if billing data is not available, call out the missing cost evidence and use current documented rates only as an estimate. Docs: [D07](https://docs.github.com/en/actions/how-tos/manage-runners/larger-runners/use-custom-images), [D08](https://docs.github.com/en/actions/concepts/runners/larger-runners#billing), [W06](https://github.com/github/github-well-architected/blob/d7ff7ab0b225e189c18dadca53196b0d8bc19764/content/library/architecture/recommendations/deploying-actions-runner-controller.md). -->

---

# Review: When is reuse worthwhile?
- Why is a partial tool-download-cache hit still useful?
- Why must `npm ci` still install packages?
- Which job is allowed to save the cache, and why?
- When would a prepared image help more than a package cache?
- What still costs money or needs updating?

<!-- notes: Timing 100-105 min. Use the existing five-minute debrief only; ask for concise explain-backs. Expected evidence: learners connect partial download reuse to lockfile reconciliation, identify the restore-only PR rule and deployment none mode, and include freshness/cost in the prewarm choice. Failure/recovery: if time is short, use prepared run evidence rather than dropping the security or cost question. Close on time for the 10:45 break. Docs: [D02](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching), [P01](https://docs.npmjs.com/cli/v11/commands/npm-ci/), [D07](https://docs.github.com/en/actions/how-tos/manage-runners/larger-runners/use-custom-images). -->
