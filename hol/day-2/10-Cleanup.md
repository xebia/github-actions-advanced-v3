# 🔨 Hands-on: End-of-class cleanup

Before you finish, check that your practice workflows, temporary access and paid resources are no longer active unless you have agreed to keep them.

Work in your own lab repository. Ask the instructor before changing anything shared. These references can help: [manage workflow runs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs) and [manage caches](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manage-caches).

## Tasks and verification

**Check back on Lab 3 first.** If your image is Ready and there is time, finish the consumer comparison and note the job's actual image version.

If it is still unavailable, ask the trainer to demonstrate the comparison. Agree with the owner whether to remove the resources now or keep them for a later attempt. If you keep them, note who will remove them and by when; image storage can continue to cost money.

1. In **your lab repository**, open **Actions** and cancel any queued or running lab runs you no longer need.

   Before disabling workflows, remove the rules that require them, as described in step 5. Then disable the lab workflows you copied during the course. Remove any schedules or automations you created for the labs. Leave unrelated workflows unchanged.
2. If one of your practice PRs is still in the merge queue, remove it from the queue first. Close the issues and unmerged PRs you created for the labs, then delete your temporary lab branches.

   Keep any run links, logs or screenshots you want for your notes. Ask the instructor which lab caches and artifacts to keep. Remove only caches, artifacts, packages, releases and images that you created for these exercises and no longer need. Leave shared items and anything you agreed to keep unchanged.
3. Stop the local servers and containers you started for the labs. Delete any example credential files you created for the Lab 7 demo and the changed archive copies from Lab 9. Delete them one by one, so you keep your normal configuration and other files.
4. **Paid resources:** Ask their owner to remove dedicated course runners, image-generation resources and any other paid resources created for the exercises.

   Check images, disks, registries and network resources too: stopping a runner may not stop those charges. Keep shared runner groups and networks in place.

5. **Rules and access:** Open **Settings → Rules → Rulesets** and find your Lab 5 and Lab 6 rules by the names you supplied. Check that they are your course rules, then restore the temporary settings or remove the rules. Find any course-only organization ruleset by name in the organization's ruleset list.

   Remove required-check and required-workflow rules **before** disabling their workflows. Once no job is using them, remove your `lab-staging` and `lab-release` environments.

   Restore any temporary Actions sharing change to its original value. Arrange removal of temporary tokens, credentials and access grants with their owner. Work on the correct host and leave shared policy unchanged.

<details>
<summary>Instructor verification checklist</summary>

- [ ] No course runs remain queued/running and no course schedules or event automations remain enabled.
- [ ] Course-only issue/PR/branch and cache/artifact retention agreed and verified.
- [ ] Dedicated compute, image generation, network, image/storage and mock targets accounted for, including ongoing costs.
- [ ] Only temporary grants and course-owned policy removed; shared resources left intact.
- [ ] Local demos stopped and fake inputs removed.
</details>

## Success

You can name what was removed, what was intentionally retained, and who owns any outstanding cleanup. Return to the [course outline](../../CLASS-OUTLINE.md).
