import type {
  QuestProgress,
  VerifyMode,
  WalletEligibility,
} from "@/lib/quest-types";
import { getMinWalletAgeYears } from "@/lib/etherscan";
import { TASKS_TOTAL } from "@/lib/quest-types";
import type { UserRecord } from "@/lib/store";

export function getVerifyMode(): VerifyMode {
  return process.env.TASKS_VERIFY_MODE === "live" ? "live" : "mock";
}

export function walletEligibilityFromUser(
  user: UserRecord,
  minAgeYears = getMinWalletAgeYears(),
): WalletEligibility | null {
  if (!user.walletAddress) return null;
  return {
    address: user.walletAddress,
    firstTxAt: user.walletFirstTxAt ?? null,
    ageDays: user.walletAgeDays ?? null,
    ageYears: user.walletAgeYears ?? null,
    minAgeYears,
  };
}

/**
 * Single source of truth for quest state derived from the JSON record.
 * Derived fields are computed server-side so the client cannot unlock a task
 * by editing local state.
 */
export function buildProgress(user: UserRecord): QuestProgress {
  const minAgeYears = getMinWalletAgeYears();
  const wallet = walletEligibilityFromUser(user, minAgeYears);
  const walletDone = Boolean(user.walletAddress);
  const followDone = Boolean(user.followVerifiedAt);
  const replyDone = Boolean(user.replyVerifiedAt);

  const completedCount = [walletDone, followDone, replyDone].filter(
    Boolean,
  ).length;

  return {
    twitter: {
      id: user.twitterId,
      username: user.twitterUsername,
      name: user.twitterName,
      avatarUrl: user.twitterAvatarUrl,
    },
    eligibility: {
      eligible: user.eligible,
      checkedAt: user.eligibilityCheckedAt,
      minAgeYears,
      wallet,
    },
    tasks: {
      wallet: {
        status: walletDone ? "completed" : "pending",
        address: user.walletAddress,
        firstTxAt: user.walletFirstTxAt ?? null,
        ageYears: user.walletAgeYears ?? null,
      },
      follow: { status: followDone ? "completed" : "pending" },
      reply: { status: replyDone ? "completed" : "pending" },
    },
    completedCount,
    totalCount: TASKS_TOTAL,
    percent: Math.round((completedCount / TASKS_TOTAL) * 100),
    allDone: completedCount === TASKS_TOTAL && user.eligible,
    verifyMode: getVerifyMode(),
  };
}
