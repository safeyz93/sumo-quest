import type { UserRecord } from "@/lib/store";
import { NotImplementedError } from "@/lib/http";

export type VerifyTaskKind = "follow" | "reply";

export type VerifyOutcome = {
  ok: boolean;
  /** Human-readable reason shown to the user when ok === false. */
  message?: string;
};

export type VerifyContext = {
  task: VerifyTaskKind;
  user: UserRecord;
};

export interface TaskVerifier {
  /** "mock" or "live" — surfaced in logs so it is obvious what ran. */
  readonly mode: "mock" | "live";
  verify(context: VerifyContext): Promise<VerifyOutcome>;
}

/** Delay used by the MVP mock so the UI can show its Verifying state. */
export const MOCK_VERIFY_DELAY_MS = 2_000;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { NotImplementedError };
