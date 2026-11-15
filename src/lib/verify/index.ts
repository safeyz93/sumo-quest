import { liveFollowVerifier, mockFollowVerifier } from "@/lib/verify/follow";
import { liveReplyVerifier, mockReplyVerifier } from "@/lib/verify/reply";
import type { TaskVerifier, VerifyTaskKind } from "@/lib/verify/types";

/**
 * Picks the verifier for a task. Mock and live implementations are kept in
 * separate exported objects so swapping them is a one-line change.
 */
export function getVerifier(
  task: VerifyTaskKind,
  mode: "mock" | "live",
): TaskVerifier {
  if (task === "follow") {
    return mode === "live" ? liveFollowVerifier : mockFollowVerifier;
  }
  return mode === "live" ? liveReplyVerifier : mockReplyVerifier;
}
