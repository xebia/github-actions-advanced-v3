# M8: Environments, approvals and OIDC

**Time:** 30 minutes. This module runs **before M7**.

**Before you start:** Complete [M6](06-Coverage-gate.md). You need repository admin access, a reviewer other than yourself, and environment protections supported for your plan and visibility. No cloud subscription is required.

**If reviewer or wait-timer features are unavailable:** Ask the trainer to demonstrate them in an eligible repository. Do not buy a plan or remove existing protections.

## Objectives

Build once, promote the same output through two gated jobs, and inspect only selected OIDC claims without exposing a token.

## Tasks

1. Under **Settings > Environments**, create `staging` and `production`. For production, select your partner as a required reviewer, prevent self-review where supported, set a one-minute wait timer, and limit deployment branches to `main`.

   Record existing settings before changing a course-owned environment. See [managing environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments).

2. Set `APP_URL` to different **example-only** URLs in the two environments. Add a made-up `TRAINING_MESSAGE` secret in each. Show which environment variable resolves in each job, but test only whether the fake secret is present; never print any secret or the full environment.

   The URLs do not become real sites just because a deployment records them. Variables are plain text and must not contain credentials. Compare environment, repository and organization scope; environment values are available when the environment job starts.

3. Add a dispatch-only deployment workflow on `main`. One build job checks out reviewed `main`, installs dependencies, builds `app/dist`, uploads one artifact and records its SHA-256 digest.

   Two subsequent jobs download that exact artifact: `deploy-staging`, then `deploy-production` with `needs: deploy-staging`. Each references its named environment and `vars.APP_URL` as the environment URL.

   Use a local mock deployment: validate and unpack the artifact in a temporary directory, verify its digest and report the environment. Do **not** rebuild in either deployment job, restore a cache, run a server indefinitely or pretend the example URL is deployed. Day 2 already covered provenance verification.

4. Give only the job inspecting OIDC claims `id-token: write`. Request a token through GitHub's documented OIDC endpoint/helper with an explicit training audience. Mask the returned token immediately, decode it in memory and print only allowlisted claims such as `iss`, `aud`, `sub`, `repository`, `ref` and `job_workflow_ref` when present.

   Do not print the token, request bearer credential, complete response or complete claims object. Do not persist it in an artifact or output. Decode is not signature verification. The environment is commonly represented in `sub`; a separate `environment` claim may be absent, and subject customization can change the format. See [OIDC reference](https://docs.github.com/en/actions/reference/security/oidc).

5. Dispatch from `main`. Observe staging, the production wait/review, approval by your partner and the completed deployment history. Before approval, verify that production steps and its environment secret have not been released.

6. Explain the real cloud counterpart: a provider validates issuer, audience and the approved subject/repository/environment, then exchanges the short-lived token. Azure additionally needs an app registration/federated credential and client, tenant and subscription identifiers. Those IDs alone do not authenticate a job. Do not configure cloud resources for this lab.

<details>
<summary>Hint: environment branches and PR branches are different</summary>

With production limited to `main`, dispatch from `main`, not your feature branch. Commit the reviewed deployment workflow before running it. A PR merge ref does not satisfy a main-only policy.

Keep both deployment jobs downstream of the same artifact-producing build job. A successful staging job is not permission to rebuild different bytes for production.
</details>

<details>
<summary>Solution walkthrough</summary>

The build produces one archive with a recorded digest. Staging and production download the same run's named artifact and compare that digest. The production environment controls when its job may start and when environment secrets become available; the wait timer is additional to reviewer approval.

The OIDC request is made only after the relevant environment gate releases its job. Selected claims demonstrate what a cloud trust policy would inspect, without a cloud deployment or long-lived cloud secret. The run URL and environment history are the evidence, not the example site's availability.

The prepared reference is `solution/module-08` in the template, if supplied.
</details>

## Checkpoint and cleanup

Production waits for your partner and later records a successful **mock** deployment of the same bytes. Show the selected identity claims, never the token.

Cancel waiting duplicate runs and remove fake secrets when finished. Keep the environments for the capstone discussion. A post-merge production wait does not block the earlier PR unless a separate applicable rule requires deployment of that PR's revision.

Next: [M7](07-Organization-gates.md).
