---
name: ModelArk media testing boundaries
description: Direct media generation tests versus app routing, and Seedance portrait restrictions.
---

Separate direct provider availability from successful in-app generation and storage.

**Why:** A working ModelArk key and listed media models do not exercise Aurora's adapter output parsing, model registry, fallback routing, or Supabase persistence. A direct Seedream test can succeed while the app's end-to-end path remains unverified.

**How to apply:** Name the actual model and route used when reporting test results. Do not describe an isolated provider test as proof that app rendering and saving work.

Use the connected account's live `/models` response as the source of truth for BytePlus model IDs. This account exposes `seedream-*` and `dreamina-seedance-*` IDs; some official pages show `doubao-*` names, which returned model-not-found for this credential.

**Why:** ModelArk product/documentation names and account-specific API identifiers are not always interchangeable. The live `seedream-4-5-251128` and `dreamina-seedance-2-5-260628` requests succeeded, while the corresponding `doubao-*` image ID returned 404.

**How to apply:** Check the authenticated account's model list before changing registry IDs, and do not normalize a working account ID to a documentation prefix.

Treat Seedance's portrait restrictions as provider policy, not a missing-key error. This can apply to user-supplied real-person photos as well as generated portraits.

**Why:** A ModelArk Seedance 2.0 Fast image-to-video test rejected a freshly AI-generated photorealistic portrait with `InputImageSensitiveContentDetected.PrivacyInformation`. An artificial source does not guarantee acceptance by the real-person detector.

**How to apply:** Explain the rejection accurately. Do not bypass the detector or keep submitting the same face; use a genuinely different permitted test scene or an approved provider workflow.