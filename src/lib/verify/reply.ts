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
 */
export const mockReplyVerifier: TaskVerifier = {
  mode: "mock",
  async verify(): Promise<VerifyOutcome> {
    await sleep(MOCK_VERIFY_DELAY_MS);
    return { ok: true };
  },
};

/**
 * LIVE verifier — placeholder for the real "did this user reply to SUMO's last
 * post" check.
 *
 * TODO(live-verification): implement the real reply check.
 *   1. Use LINKS.SUMO_LAST_POST_ID and LINKS.SUMO_TWITTER_USERNAME from
 *      src/config/links.ts (never inline the tweet id).
 *   2. Ask X for recent replies to that conversation with a user-context token:
 *        GET /2/tweets/search/recent?query=conversation_id:<SUMO_LAST_POST_ID> from:<username>
 *      and confirm the response contains a tweet authored by the logged-in user
 *      whose `in_reply_to_tweet_id` equals SUMO_LAST_POST_ID (or whose
 *      conversation_id matches).
 *   3. Return { ok: true } only on a confirmed match. On API failure return
 *      { ok: false, message: ... } — never pass the user silently.
 *
 * The search endpoint requires elevated API access on most plans; check the
 * token's plan before enabling live mode.
 */
export const liveReplyVerifier: TaskVerifier = {
  mode: "live",
  async verify(_context: VerifyContext): Promise<VerifyOutcome> {
    throw new NotImplementedError(
      "Live reply verification is not wired yet. Implement it in src/lib/verify/reply.ts or keep TASKS_VERIFY_MODE=mock.",
    );
  },
};
