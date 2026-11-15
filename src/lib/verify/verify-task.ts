import type { NextRequest } from "next/server";
import { requirePrivySession } from "@/lib/auth";
import { HttpError, jsonOk, runRoute } from "@/lib/http";
import { buildProgress, getVerifyMode } from "@/lib/progress";
import { enforceRateLimit } from "@/lib/rate-limit";
import { markTaskVerified, syncUser } from "@/lib/users";
import { getVerifier } from "@/lib/verify";
import type { VerifyTaskKind } from "@/lib/verify/types";
import type { ActionResponse } from "@/lib/quest-types";

/**
 * Shared handler for /api/tasks/verify-follow and /api/tasks/verify-reply.
 * Auth + rate limit + eligibility + persistence live here; the actual check is
 * delegated to the mock/live verifier selected in src/lib/verify/index.ts.
 */
export async function handleVerifyTask(
  request: NextRequest,
  task: VerifyTaskKind,
): Promise<Response> {
  return runRoute(async () => {
    const session = await requirePrivySession(request);

    // 6 verification attempts per minute per user.
    enforceRateLimit(session.privyUserId, `verify-${task}`, 6, 60_000);

    const user = await syncUser(session);

    if (!user.eligible) {
      throw new HttpError(
        403,
        "Only wallets that passed the age gate can clear tasks. Check the wallet again.",
        "NOT_ELIGIBLE",
      );
    }

    const alreadyDone =
      task === "follow" ? user.followVerifiedAt : user.replyVerifiedAt;
    if (alreadyDone) {
      return jsonOk<ActionResponse>({
        message: "This task is already cleared.",
        progress: buildProgress(user),
      });
    }

    const mode = getVerifyMode();
    const verifier = getVerifier(task, mode);
    console.info(`[verify:${task}] mode=${mode} user=${user.id}`);

    const outcome = await verifier.verify({ task, user });
    if (!outcome.ok) {
      throw new HttpError(
        422,
        outcome.message ??
          "We could not verify that action yet. Complete it on X, then try again.",
        "VERIFICATION_FAILED",
      );
    }

    const updated = await markTaskVerified(user.id, task);

    return jsonOk<ActionResponse>({
      message:
        task === "follow"
          ? "Follow verified. Task 01 cleared."
          : "Reply verified. Task 02 cleared.",
      progress: buildProgress(updated),
    });
  });
}
