# 🔨 Lab 3: Remove repeated setup

**Time:** About 15 minutes of hands-on work. Image generation takes longer.

**Before you start:** Complete [Lab 1](01-Measure.md) and keep its baseline workflow enabled for the comparison.

> **Requires:** larger runners with custom images (GitHub Team or GitHub Enterprise Cloud), organization owner or CI/CD admin permissions to manage custom images and runner groups, and paid larger-runner minutes and image storage. Repository access alone is not enough. Use the runner capacity provided for the class. If you do not have this access, complete the workflow edits and ask the trainer to demonstrate the comparison.

> **Start now, check back later.** Image generation and replication can take several hours. Finishing the builder workflow does not mean the image is ready to use.
>
> Save the run URL and image name/version, then continue with Lab 4. Check back during a break and before class ends. When your image version is **Ready**, resume at setup step 5.
>
> If it is still unavailable, ask the trainer to demonstrate the comparison and leave your own comparison pending. Another build will not shorten the wait. Agree with the trainer when to remove or revisit the image, because stored images can incur charges.

## Objectives

Change the custom-image snapshot configuration, pre-pull a Docker image, and distinguish image contents from runtime caches and artifacts.

## Setup

Read GitHub's [custom image setup](https://docs.github.com/en/actions/how-tos/manage-runners/larger-runners/use-custom-images) and [larger-runner billing](https://docs.github.com/en/actions/concepts/runners/larger-runners#billing). Use the runner group provided by the trainer if there is one.

1. Confirm that custom images are enabled for the organization or enterprise, and that you are an owner, CI/CD Admin, or have the required custom-image and runner-group permissions. Check the supported platform and region, the runner-group policy, who pays for the runners, and how long images are kept.
2. Create a larger runner for image generation on Linux x64, enable **Enable this runner to generate custom images**, and put it in a dedicated runner group restricted to this repository. Public repositories should not have access to an image-generation runner, because any code that runs there ends up in the image.
3. Copy the [`03-build-prewarm.yml` starter](../../examples/workflows/03-build-prewarm.yml) to `.github/workflows/03-build-prewarm.yml`. Set `runs-on` to your builder runner label and choose your own `snapshot.image-name`. Keep `version: 1.*`.

   Complete the npm cache TODO: download `picocolors@1.1.1` into npm's download cache and list its entry to confirm it is present. Do not install it into a project or save `node_modules`. [npm cache commands](https://docs.npmjs.com/cli/v11/commands/npm-cache/)

   Complete the Docker TODO: download `node:latest` before the snapshot and print its image identity. [Docker pull](https://docs.docker.com/reference/cli/docker/image/pull/)

   If you want to try the optional action-archive task, add the steps described in task 3 below. Otherwise, leave them out. Replace the npm and Docker placeholders with your implementation, then generate and review `actions.lock`. The snapshot saves the runner's whole disk, so a token or login left on the runner would also be saved in the image.

4. Run the builder on `main`. It prepares Node.js 24, the `picocolors` npm download cache and `node:latest`.

   Save the run URL, image name, platform and version from the custom-images page, plus the Docker image digest from the log.

   **Continue with Lab 4 while the image is generated.** Return to step 5 at a later break, once your image version is Ready.

5. Create a separate larger runner from your image, using the same platform and enough storage. Select the **exact Ready version you built**, rather than an older version or `latest`. Restrict its runner group to your repository and wait for the runner configuration to become Ready.

   Set repository Actions variable `LAB_PREWARM_RUNNER` to this consumer runner's label. Copy `03-prewarm.yml` to `.github/workflows/03-prewarm.yml`, update the lockfile with `gh actions-lock`, review it and run the workflow on `main`.

   Check **Set up job → VM Image** for the version the job actually used. Configuration changes can take time to reach runners. If you still see the older image, save the failed result and check again later. Downloading the missing content in the consumer would hide whether your image worked.

## Tasks

1. Compare the matching setup steps in your baseline run and custom-image run. Note runner/image and Node/npm versions, whether `picocolors` and `node:latest` were already present, and what still downloaded. Do not compare total run times: the baseline also downloads CodeQL and runs the app's artificial test/build waits, while the image consumer does different work. Do the matching setup timings show an improvement?
2. Explain the difference between the npm download cache, tool cache, Docker image store, Actions dependency cache, action archive cache, and build artifacts. Discuss with the trainer: if a job runs inside a container (`container:`), can it use the Docker images saved on the runner? [Running jobs in a container](https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/run-jobs-in-a-container)
3. **Stretch goal:** Complete the builder's archive-cache TODO with [`gh actions-archive-cache` v0.0.2](https://github.com/jessehouwing/gh-actions-archive-cache/blob/v0.0.2/README.md). Install the pinned extension, download the supplied `ACTION_SHA` into the existing runner cache as `tar.gz`, then uninstall the extension before the snapshot.

   Use separate install, download and uninstall steps. Run uninstall with `always()` after a successful installation, even if the download fails. Keep download and uninstall errors visible; do not use `continue-on-error`. Pass the token only to the steps that need it; do not save a login in the image. The example uses a GitHub.com token, not a `ghe.com` tenant token.

   Add `tj-actions/changed-files@v47.0.6` to the consumer. Pass its output through a quoted environment variable when printing it. Generate and review the lock entry: its SHA must match the archive you seeded. Try this before opening the solution.

   To check reuse, look for `Copied action archive` with that exact SHA in the debug logs. `Download action repository` also appears on cache hits, so it is not proof of another download. The runner still contacts GitHub to resolve action refs. See [runner lookup](https://github.com/actions/runner/blob/310a370bf3605f5b092f8af63b3126627de2a210/src/Runner.Worker/ActionManager.cs#L1232-L1305) and [extension image guidance](https://github.com/jessehouwing/gh-actions-archive-cache/blob/v0.0.2/docs/custom-runner-images.md).
4. Propose who can build and use the image, how inputs are reviewed and pinned, patch/rebuild cadence, credential removal, version selection, and rollback. Compare saved per-run setup against build/retention costs and staleness.

<details>
<summary>Hint</summary>

Your image can contain several kinds of saved content: npm downloads, installed tools, Docker images and action archives. Check each one separately.

`node:latest` can change. It is convenient for this experiment, but a production image should use a reviewed digest and have a plan for updates.
</details>

<details>
<summary>Solution</summary>

Compare your workflows with the [image builder](../../solutions/workflows/03-build-prewarm.yml) and [consumer](../../solutions/workflows/03-prewarm.yml). The builder prepares content to save in an image; the consumer runs on that image and checks what is already there.

Use your own runner label and `snapshot.image-name`. The examples below show the npm and Docker steps and the offline check.

For the optional action-archive task, keep the different stores separate. The action archive cache holds compressed action downloads; it is not the unpacked `_work/_actions` directory or the Actions dependency cache.

GitHub's Ubuntu images configure `/opt/actionarchivecache` and save `ACTIONS_RUNNER_ACTION_ARCHIVE_CACHE` in `/etc/environment`. The runner reads that setting when preparing actions. See the [runner-images setup script](https://github.com/actions/runner-images/blob/d9a55a1954ef976392dce427271026deee8f1302/images/ubuntu/scripts/build/install-actions-cache.sh) and the first-party [action-versions tooling](https://github.com/actions/action-versions/blob/e3c62146623237ce0e50fbb68f09fc0c4739446a/README.md).

The saved archive and consumer workflow must resolve to the same reviewed [changed-files action](https://github.com/tj-actions/changed-files) commit.

`cache-mode: none` disables the Actions dependency cache, not the software, Docker images or action archives saved in your image. A job or service container may use a different Docker daemon and therefore not see images saved on the host.

### Solution: builder snapshot fields and Docker seed

Change the builder workflow's `runs-on` label and snapshot fields for your own runner and image:

```yaml
runs-on: your-image-generation-runner-label
snapshot:
  image-name: actions-advanced-lab3-your-github-handle
  version: 1.*
```

Add these steps to the builder job to fill npm's download cache and pre-pull the Docker image:

```yaml
- name: Seed the npm package cache
  run: |
    npm cache add picocolors@1.1.1
    npm cache ls picocolors
- name: Pre-pull a Docker image
  run: |
    docker pull node:latest
    docker image inspect node:latest --format '{{.Id}}'
```

The consumer workflow verifies the image with:

```yaml
- name: Verify the pre-pulled Docker image
  run: |
    docker image inspect node:latest --format '{{.Id}}'
    docker run --pull=never --rm node:latest node --version
```

### Stretch solution: seed the changed-files action archive

For the stretch task, add the steps below to your builder. Otherwise, leave them out. They install the extension, download the reviewed archive and remove the extension before the snapshot. GitHub CLI must already be installed; the extension's released binary does not need Go.

Keep the Ubuntu base image's existing cache configuration. The builder needs permission to write there, but other users do not need write access. Download the exact reviewed commit rather than every action version.

Keep workflow-level `permissions: {}` and the builder job's `contents: read`. Pass the built-in token only to the install and download steps through their environments; no `gh auth login` or saved credentials are needed.

This example downloads a public action from `github.com`. A `ghe.com` tenant token must not be sent to that host. On `ghe.com`, follow the extension's [authentication guidance](https://github.com/jessehouwing/gh-actions-archive-cache/blob/v0.0.2/README.md#authentication-and-environment-tokens) with separately authorized credentials, or ask the trainer to demonstrate this part.

```yaml
- name: Install the action archive cache extension
  id: install-extension
  env:
    GH_TOKEN: ${{ github.token }}
  run: gh extension install jessehouwing/gh-actions-archive-cache --pin v0.0.2
- name: Seed the changed-files action archive
  shell: bash
  env:
    GH_TOKEN: ${{ github.token }}
    ACTION_SHA: 9426d40962ed5378910ee2e21d5f8c6fcbf2dd96
  run: |
    cache="${ACTIONS_RUNNER_ACTION_ARCHIVE_CACHE:?The base image must configure the action archive cache}"
    gh actions-archive-cache download "tj-actions/changed-files@$ACTION_SHA" \
      --hostname github.com --cache-dir "$cache" --format tar.gz
- name: Uninstall the action archive cache extension
  if: ${{ always() && steps.install-extension.outcome == 'success' }}
  run: gh extension remove actions-archive-cache
```

Normally, GitHub skips later steps after a failure. `always()` lets the uninstall step run even when the download fails. Checking the install step's `outcome` means cleanup runs only when this job successfully installed the extension, not when installation failed or was skipped after an earlier error.

Removing the extension leaves the downloaded archive in place. Leave `continue-on-error` off: if uninstall fails, the job must fail rather than save an image containing the extension. A download failure also keeps the job failed, even when uninstall succeeds.

Use a builder where this extension is not already installed, so cleanup does not remove someone else's installation. Check the download and uninstall logs. A cancelled job may not finish cleanup, so use only a successful build for your snapshot.

The consumer needs the saved archive, not the extension itself. Downloading an archive in a consumer step would be too late to speed up that job's action preparation.

For a larger workflow set, you can import a reviewed lockfile with `gh actions-archive-cache from-lockfile .github/workflows/actions.lock --hostname github.com --cache-dir "$cache" --format tar.gz`. Check out and verify the lockfile first; importing it does not verify it for you. Keep the same install/download/uninstall sequence.

This lab uses Linux `tar.gz` archives. Windows images need `--format zip`.

In the consumer, use the readable release tag below and generate the installed workflow's lockfile with `gh actions-lock`. Check that its changed-files entry resolves to `9426d40962ed5378910ee2e21d5f8c6fcbf2dd96`. The runner looks up the archive using this commit, not the tag:

```yaml
- uses: actions/checkout@v7.0.1
  with:
    fetch-depth: 0
- uses: tj-actions/changed-files@v47.0.6
  id: changed-files
  with:
    since_last_remote_commit: true
- name: Show changed files
  env:
    CHANGED_FILES: ${{ steps.changed-files.outputs.all_changed_files }}
  run: |
    printf 'Changed files: %s\n' "$CHANGED_FILES"
```

After adding the archive seed, rebuild the image and wait for that version to be Ready. Select it on the consumer runner before running the consumer again.

Look for `Copied action archive` in the debug logs to confirm reuse. Having the file or environment variable present does not show that the runner actually used it.

If you use a minimal base image without the cache setting, follow the linked Ubuntu setup script to configure the runner environment before action preparation. Setting `GITHUB_ENV` inside the consumer job happens too late.
</details>

## Success and cleanup

Your comparison should show which setup work was avoided, what still ran and one trade-off in maintaining the image.

After generation and comparison finish, disable **Lab 03 build prewarmed image**, **Lab 03 consume prewarmed image** and the retained **Lab 01 baseline**. None is used in Lab 4. Cancel course runs you no longer need.

Leave shared images and runner groups alone. At the end of class, check with the instructor that dedicated paid runners and their image, storage and network resources are removed or covered by an agreed retention plan.

Next: [Lab 4](04-Events-and-parallelism.md).
