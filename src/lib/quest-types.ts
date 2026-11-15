/**
 * Shared shapes between server routes and client components.
 * Keep this file free of server-only imports so the client can use it.
 */

export type VerifyMode = "mock" | "live";

export type EligibilityReason =
  | "wallet_eligible"
  | "wallet_too_young"
  | "wallet_no_history"
  | "wallet_required";

/** Result of the server-side Etherscan wallet-age check. */
export type WalletEligibility = {
  address: string;
  /** ISO timestamp of the first Ethereum transaction, null if none. */
  firstTxAt: string | null;
  ageDays: number | null;
  ageYears: number | null;
  minAgeYears: number;
};

export type TaskProgress = {
  status: "pending" | "completed";
};

export type WalletTaskProgress = TaskProgress & {
  address: string | null;
  firstTxAt: string | null;
  ageYears: number | null;
};

export type QuestProgress = {
  twitter: {
    id: string | null;
    username: string | null;
    name: string | null;
    avatarUrl: string | null;
  };
  eligibility: {
    eligible: boolean;
    checkedAt: string | null;
    minAgeYears: number;
    wallet: WalletEligibility | null;
  };
  tasks: {
    wallet: WalletTaskProgress;
    follow: TaskProgress;
    reply: TaskProgress;
  };
  completedCount: number;
  totalCount: number;
  percent: number;
  allDone: boolean;
  verifyMode: VerifyMode;
};

export type EligibilityResponse = {
  eligible: boolean;
  reason: EligibilityReason;
  message: string;
  cached: boolean;
  progress: QuestProgress;
  /** The wallet that was just checked (even when too young). */
  wallet: WalletEligibility | null;
};

export type ActionResponse = {
  message: string;
  progress: QuestProgress;
};

export type ApiErrorBody = {
  error: string;
  code: string;
};

export const TASKS_TOTAL = 3;
