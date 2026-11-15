import {
  MOCK_VERIFY_DELAY_MS,
  NotImplementedError,
  sleep,
  type TaskVerifier,
  type VerifyContext,
  type VerifyOutcome,
} from "@/lib/verify/types";

/**
 * MOCK verifier — always succeeds after a 2 second delay.
 * This is what the MVP ships with; it lets the whole flow be demoed without
 * spending X API quota.
 */
export const mockFollowVerifier: TaskVerifier = {
  mode: "mock",
  async verify(): Promise<VerifyOutcome> {
    await sleep(MOCK_VERIFY_DELAY_MS);
    return { ok: true };
  },
};

/**
 * LIVE verifier — placeholder for the real X API call.
 *
 * TODO(live-verification): implement the real "does this user follow SUMO" check.
 * A follow relationship can only be read with a *user-context* token, not the
 * app-only bearer token used for eligibility:
 *
 *   1. Resolve the SUMO account id once (cache it):
 *        GET /2/users/by/username/:username?user.fields=id
 *      with LINKS.SUMO_TWITTER_USERNAME — never hardcode the id here.
 *   2. Resolve the logged-in user's following list with THEIR user-context token:
 *        GET /2/users/:source_user_id/following?max_results=1000
 *      then follow `pagination_token` until the target id appears or pages run out.
 *      Alternatively keep a server-side Twitter OAuth 2.0 flow that stores the
 *      user token; Privy's linked account does not expose the raw X token, so a
 *      separate consent step is required.
 *   3. Return { ok: true } only if the target id was found. On API failure return
 *      { ok: false, message: ... } instead of silently passing.
 *
 * Wire the real implementation in place of the thrown error below, then set
 * TASKS_VERIFY_MODE=live.
 */
export const liveFollowVerifier: TaskVerifier = {
  mode: "live",
  async verify(_context: VerifyContext): Promise<VerifyOutcome> {
    throw new NotImplementedError(
      "Live follow verification is not wired yet. Implement it in src/lib/verify/follow.ts or keep TASKS_VERIFY_MODE=mock.",
    );
  },
};
