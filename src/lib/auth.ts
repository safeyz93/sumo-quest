import type { NextRequest } from "next/server";
import { HttpError } from "@/lib/http";
import { getPrivyClient } from "@/lib/privy";

export type TwitterIdentity = {
  /** X's stable numeric user id — the `subject` of the Privy linked account. */
  subject: string;
  username: string | null;
  name: string | null;
  profilePictureUrl: string | null;
};

export type PrivySession = {
  privyUserId: string;
  twitter: TwitterIdentity;
};

function readString(
  record: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

/**
 * Structural parser for the linked account. Written defensively so it keeps
 * working whether the SDK exposes camelCase or snake_case fields.
 */
export function findTwitterAccount(
  accounts: unknown,
): TwitterIdentity | null {
  if (!Array.isArray(accounts)) return null;

  for (const account of accounts) {
    if (!account || typeof account !== "object") continue;
    const record = account as Record<string, unknown>;
    if (record.type !== "twitter_oauth") continue;

    const subject = readString(record, "subject", "twitter_user_id");
    if (!subject) continue;

    return {
      subject,
      username: readString(record, "username"),
      name: readString(record, "name"),
      profilePictureUrl: readString(
        record,
        "profilePictureUrl",
        "profile_picture_url",
      ),
    };
  }

  return null;
}

/**
 * Verifies the Privy access token from the Authorization header and resolves
 * the X account from Privy's own user record. The server never trusts an X id
 * sent by the client.
 */
export async function requirePrivySession(
  request: NextRequest,
): Promise<PrivySession> {
  const header = request.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) {
    throw new HttpError(
      401,
      "Missing Privy access token. Reconnect X and try again.",
      "MISSING_TOKEN",
    );
  }

  const token = header.slice(7).trim();
  if (!token) {
    throw new HttpError(
      401,
      "Missing Privy access token. Reconnect X and try again.",
      "MISSING_TOKEN",
    );
  }

  const privy = getPrivyClient();

  let privyUserId: string;
  try {
    const claims = await privy.verifyAuthToken(token);
    privyUserId = claims.userId;
  } catch {
    throw new HttpError(
      401,
      "Your session is invalid or expired. Reconnect X to continue.",
      "INVALID_TOKEN",
    );
  }

  let linkedAccounts: unknown;
  try {
    const privyUser = await privy.getUser(privyUserId);
    linkedAccounts = privyUser.linkedAccounts;
  } catch {
    throw new HttpError(
      401,
      "Could not load your Privy account. Reconnect X to continue.",
      "PRIVY_USER_UNAVAILABLE",
    );
  }

  const twitter = findTwitterAccount(linkedAccounts);
  if (!twitter) {
    throw new HttpError(
      403,
      "No X account is linked to this login. Sign in with X first.",
      "TWITTER_NOT_LINKED",
    );
  }

  return { privyUserId, twitter };
}
