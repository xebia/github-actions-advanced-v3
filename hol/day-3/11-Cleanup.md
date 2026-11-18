# Day 3 cleanup

**Time:** Reserve the last part of the wrap-up.

**Before you start:** Keep run URLs, measured coverage and rule names that explain your work. Identify what belongs only to you and what the facilitator shares with the class.

**If you lack permission to clean up:** Cancel your own runs and hand the named resource and owner to the trainer. Do not claim it was removed.

## Objectives

Leave no unexpected scheduled work, blocking course-only policy, exposed credential or paid capacity.

## Tasks

1. Cancel running/queued practice jobs, including unmatched-runner and waiting deployment jobs. Close unneeded PRs and remove your entries from any practice merge queue.

2. With the policy owner, disable or remove **only your named course rulesets/requirements** after collecting evidence. Remove the external-check requirement before retiring its publisher and required checks before disabling their workflows.

   Inspect both repository and organization rules. Do not weaken existing organizational protections, delete another attendee's rule, grant bypass to finish, or assume a repository admin can remove an org rule.

3. Remove schedules from the default branch and disable unneeded dispatch/PR/dispatch-service workflows through **Actions > workflow menu > Disable workflow**. Inspect the default-branch files; removing a schedule only in an abandoned branch changes nothing.

4. Coordinate cleanup of course-only environments, pending approvals and fake secrets/variables. If you published Pages in S9, agree whether to retain or unpublish it through **Settings > Pages**. A retained site is intentionally public only if approved.

5. Remove short-lived credentials from your shell and any approved temporary credential storage. Revoke course-only App tokens/access through the owner. Never uninstall a shared App or remove a shared secret to clean up your own exercise.

6. Review artifacts, logs and images by name and agreed retention. Remove only course-owned items you no longer need; do not delete whole repository/package storage. Confirm deliberately vulnerable images were never published or deployed; remove any local course image if created.

7. For runner/admin stretches, stop your specific course runner service, deregister the course runner and deprovision only the approved dedicated machine. Verify compute **and** remaining storage/network charges with its owner; stopping a VM is not full cleanup. Do not remove a shared runner group or image.

8. Restore any explicitly approved source-sharing, selected-repository secret or allowed-actions changes to their recorded prior settings. The facilitator must coordinate this after all dependent learners finish.

9. Keep the practice repository only as agreed. Do not delete the course fork or a shared organization repo. Record every retained resource, its owner and the follow-up date.

<details>
<summary>Hint: verify rather than infer</summary>

Open Actions and confirm no course run is still queued/running. Open the effective rulesets view and confirm retiring a workflow will not leave a missing required result. Check the deployment history for waiting jobs. In the runner view, confirm the dedicated course runner is deregistered, not merely offline.

Use resource names in the UI for cleanup. Do not run broad deletion scripts or wildcard commands against shared organization resources.
</details>

## Checkpoint

Your partner can confirm no unneeded runs/schedules remain, required course-only publishers are retired in the right order, credentials are gone, and remaining resources have an explicit owner.

Return to the [lab index](README.md) or your [homework](HOMEWORK.md).
