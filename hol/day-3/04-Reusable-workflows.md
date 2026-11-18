# M4: Reusable workflows

**Time:** 50 minutes.

**Before you start:** Complete [M3](03-Composite-actions.md). You need an allocated workflow file in the organization's shared source repo and owner approval for its access settings. Use a per-attendee file such as `reusable-ci-HANDLE.yml` unless the facilitator is editing a single shared example.

**If source access cannot be changed:** Ask the trainer to demonstrate sharing. Do not broaden an organization policy to complete the exercise.

## Objectives

Create central CI with typed inputs, mapped secrets and outputs; distinguish a reusable workflow from a starter and a composite.

## Tasks

1. In the approved source repository, create your file directly under `.github/workflows/`. Add `workflow_call` inputs: `runtime-version` (string, default `'24'`) and `coverage-threshold` (number, default `80`).

   Declare an optional secret `TRAINING_MESSAGE` for a **made-up** value. Check only whether it was supplied; never print it. Add a workflow output `coverage-percent`. See [reusing workflows](https://docs.github.com/en/actions/how-tos/sharing-automations/reusing-workflows).

2. In its test job, check out the **caller** repository, invoke the shared M3 composite and expose its coverage output as a job output. Map the workflow output to the job output. Keep permissions at the job scope and give jobs timeouts.

   Start with one canonical Ubuntu/24 coverage job. Keep the M2 matrix as a separate compatibility job if desired; do not use racing matrix outputs as the coverage result.

3. In the attendee repository, replace the implementation in `ci.yml` with a thin caller job using `ORG/.github/.github/workflows/ALLOCATED-FILE.yml@main`. This deliberate moving branch lets you observe central edits during the workshop; use a reviewed immutable reference/lock for production.

   Put `uses`, `with` and `secrets` at the **job** level. A reusable-workflow caller job has no `runs-on` or `steps`. Grant that caller job the read permissions the called workflow requires; called workflows cannot elevate the caller's token.

4. Pass `TRAINING_MESSAGE` explicitly from a fake repository secret. Compare with `secrets: inherit` for allowed same-organization/enterprise calls, then retain explicit mapping. Do not inherit unrelated secrets for convenience.

5. Add a `report` job depending on the caller job. Read `needs.ci.outputs.coverage-percent` through an environment variable and print it in the summary.

6. With the source owner, inspect **Settings > Actions > General > Access** on a private/internal source and the organization allowed-actions policy. If isolated from other learners, temporarily deny this practice caller, observe the access error, then restore exactly the prior approved setting. Otherwise ask for a trainer demonstration. Sharing source content can expose it more widely than one ruleset target.

7. Disable an **unused disposable** workflow through its Actions menu and compare that with deleting its file in a commit. Do not disable your active caller or the shared reusable workflow.

<details>
<summary>Hint: there are three output boundaries</summary>

The action output becomes a job output, which becomes a `workflow_call` output, which the caller reads through `needs`. Missing one mapping often produces an empty value even though the coverage step succeeded.

Repository checkout in a called workflow checks out the caller's repository. Helper files from the central repository need their own deliberate packaging; the composite's own helpers can use `github.action_path`.
</details>

<details>
<summary>Solution walkthrough</summary>

The thin caller passes a runtime, a numeric threshold and only the named fake secret. The called job invokes the composite and returns coverage. The caller's report job has no checkout and needs no repository token permissions.

A starter was copied once; later edits to its source do not update copies. A reusable workflow centralizes jobs and can select runners. A composite centralizes steps inside the caller's job. A change to a moving central ref affects its next callers; a locked/pinned consumer requires a reviewed update.

The prepared reference is `solution/module-04` in the template, if supplied.
</details>

## Checkpoint and cleanup

The caller runs central CI and the follow-up job prints a real coverage number. Explain the three component types and the effect of source access being denied.

Restore any approved temporary access change and remove the fake secret if no longer used. Keep the central workflow and output for M5/M6. Next: [M5](05-PR-feedback.md).
