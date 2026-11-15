import type { PrivySession } from "@/lib/auth";
import { HttpError } from "@/lib/http";
import {
  readDatabaseCopy,
  withDatabase,
  type Database,
  type UserRecord,
} from "@/lib/store";

function nowIso(): string {
  return new Date().toISOString();
}

function findUser(database: Database, userId: string): UserRecord {
  const user = database.users.find((candidate) => candidate.id === userId);
  if (!user) {
    throw new HttpError(
      404,
      "User record not found. Reconnect X and try again.",
      "USER_NOT_FOUND",
    );
  }
  return user;
}

/**
 * Creates or refreshes the local user record from the verified Privy session.
 */
export async function syncUser(session: PrivySession): Promise<UserRecord> {
  const { privyUserId, twitter } = session;

  return withDatabase((database) => {
    const twitterConflict = database.users.find(
      (candidate) =>
        candidate.twitterId === twitter.subject &&
        candidate.id !== privyUserId,
    );
    if (twitterConflict) {
      throw new HttpError(
        409,
        "This X account is already linked to another SUMO account.",
        "TWITTER_ALREADY_LINKED",
      );
    }

    const existing = database.users.find(
      (candidate) => candidate.id === privyUserId,
    );

    if (existing) {
      existing.twitterId = twitter.subject;
      existing.twitterUsername = twitter.username;
      existing.twitterName = twitter.name;
      existing.twitterAvatarUrl = twitter.profilePictureUrl;
      existing.updatedAt = nowIso();
      return existing;
    }

    const timestamp = nowIso();
    const user: UserRecord = {
      id: privyUserId,
      twitterId: twitter.subject,
      twitterUsername: twitter.username,
      twitterName: twitter.name,
      twitterAvatarUrl: twitter.profilePictureUrl,
      eligible: false,
      eligibilityCheckedAt: null,
      walletAddress: null,
      walletFirstTxAt: null,
      walletAgeDays: null,
      walletAgeYears: null,
      walletSubmittedAt: null,
      followVerifiedAt: null,
      replyVerifiedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    database.users.push(user);
    return user;
  });
}

/** Cheap pre-check before calling Etherscan (the authoritative check is in the lock below). */
export async function findWalletOwner(
  address: string,
): Promise<{ userId: string; twitterUsername: string | null } | null> {
  return readDatabaseCopy((database) => {
    const owner = database.users.find(
      (candidate) => candidate.walletAddress === address,
    );
    return owner
      ? { userId: owner.id, twitterUsername: owner.twitterUsername }
      : null;
  });
}

/**
 * Locks one wallet to one account after the wallet-age check passed.
 * Uniqueness is re-checked inside the same locked write, and an existing wallet
 * is never overwritten (two concurrent submissions for the same user cannot
 * race a second wallet in).
 */
export async function linkEligibleWallet(
  userId: string,
  input: {
    address: string;
    firstTxAt: string;
    ageDays: number;
    ageYears: number;
  },
): Promise<UserRecord> {
  return withDatabase((database) => {
    const user = findUser(database, userId);

    if (user.walletAddress) {
      if (user.walletAddress === input.address) {
        return user;
      }
      throw new HttpError(
        409,
        "This account already passed the gate with another wallet. Wallets cannot be changed.",
        "WALLET_ALREADY_SET",
      );
    }

    const takenByAnotherUser = database.users.find(
      (candidate) =>
        candidate.id !== userId && candidate.walletAddress === input.address,
    );
    if (takenByAnotherUser) {
      throw new HttpError(
        409,
        "That wallet is already linked to another SUMO account.",
        "WALLET_TAKEN",
      );
    }

    const timestamp = nowIso();
    user.walletAddress = input.address;
    user.walletFirstTxAt = input.firstTxAt;
    user.walletAgeDays = input.ageDays;
    user.walletAgeYears = input.ageYears;
    user.walletSubmittedAt ??= timestamp;
    user.eligible = true;
    user.eligibilityCheckedAt = timestamp;
    user.updatedAt = timestamp;
    return user;
  });
}

export async function markTaskVerified(
  userId: string,
  task: "follow" | "reply",
): Promise<UserRecord> {
  return withDatabase((database) => {
    const user = findUser(database, userId);
    const timestamp = nowIso();
    if (task === "follow") {
      user.followVerifiedAt ??= timestamp;
    } else {
      user.replyVerifiedAt ??= timestamp;
    }
    user.updatedAt = timestamp;
    return user;
  });
}
