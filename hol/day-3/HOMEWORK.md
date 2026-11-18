# Day 3 homework

Allow about an hour for each item. Use your own approved training resources; keep organization changes exact-target and owner-approved. Ask for the prepared solution references only after attempting the work.

1. **Finish a stretch module.** Start with [S3](STRETCH.md#s3---add-a-second-required-check), then pick the exercise closest to one of your weakest exam domains. Keep a failure/fix run pair and explain the permission choices.

2. **Turn the M3 composite into a JavaScript action.** Use `@actions/core` for inputs, outputs and failure handling, and `@actions/github` only where API access is needed. Package runtime dependencies according to the JavaScript-action guidance; do not assume the caller has installed them. Publish an approved version and compare it with the original composite. Prove valid coverage output and explicit failure on invalid input.

3. **Implement M9 as a GitHub App.** Replace manual CLI decisions with an installation-token flow limited to the intended repository and Checks write. Validate incoming requests/webhooks, bind approvals to the current revision, handle re-delivery without duplicate decisions, and keep private keys/tokens out of the repo. Show that a new commit needs new approval.

4. **Apply the M7 policy to a second disposable app repository.** Get approval for its exact target. Record what initially broke (source access, permissions, app contract, runtime or check names), fix it, and show both independent coverage and scan gates. Do not target unrelated repos or weaken the baseline policy.

5. **Prepare for Day 4.** Revisit the current [GH-200 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-200) for your two weakest domains. Bring one explanation of a failed assumption from the labs, your corrected workflow and the run evidence. Optional: use Microsoft's linked practice assessment and exam sandbox if available.

## Completion

For each completed item, keep the reviewed diff, successful and failing evidence, the source of any shared dependency, and a short explanation of what is not yet validated. Prepared `solution/module-NN` and stretch branches belong in the facilitator's template repositories; these instructions do not create them.

Repeat [cleanup](11-Cleanup.md) after every session, especially after installing an App, enabling recurring updates or allocating a runner.
