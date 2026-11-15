import type { NextRequest } from "next/server";
import { requirePrivySession } from "@/lib/auth";
import {
  evaluateWalletAge,
  fetchWalletActivity,
  getMinWalletAgeYears,
} from "@/lib/etherscan";
import { isEvmAddress } from "@/lib/evm";
import { HttpError, jsonOk, runRoute } from "@/lib/http";
import { buildProgress, walletEligibilityFromUser } from "@/lib/progress";
import { enforceRateLimit } from "@/lib/rate-limit";
import { findWalletOwner, linkEligibleWallet, syncUser } from "@/lib/users";
import type {
  EligibilityReason,
  EligibilityResponse,
  WalletEligibility,
} from "@/lib/quest-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatDate(iso: string | null): string {
  if (!iso) return "unknown";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function messageFor(
  reason: EligibilityReason,
  wallet: WalletEligibility | null,
  minAgeYears: number,
): string {
  const date = wallet ? formatDate(wallet.firstTxAt) : "unknown";
  const age = wallet?.ageYears ?? null;

  switch (reason) {
    case "wallet_required":
      return `Submit an EVM wallet. We check its first Ethereum transaction with Etherscan; the wallet must be older than ${minAgeYears} years.`;
    case "wallet_eligible":
      return `Wallet verified. First Ethereum activity: ${date}${
        age !== null ? ` — ${age} years old` : ""
      }. The gate is open.`;
    case "wallet_too_young":
      return `This wallet is only ${
        age !== null ? `${age} years` : "too young"
      } old (first activity ${date}). SUMO requires a wallet older than ${minAgeYears} years.`;
    case "wallet_no_history":
      return `No Ethereum transaction history found for this wallet. SUMO requires a wallet older than ${minAgeYears} years.`;
  }
}

function eligibleResponse(
  progress: ReturnType<typeof buildProgress>,
  wallet: WalletEligibility | null,
  message: string,
  cached: boolean,
): EligibilityResponse {
  return {
    eligible: true,
    reason: "wallet_eligible",
    message,
    cached,
    progress,
    wallet,
  };
}

/**
 * POST /api/eligibility
 *
 * Wallet-age gate. No wallet address in the body → report current state.
 * With `{ address }` → validate, check Etherscan for the first Ethereum
 * transaction, and only link the wallet (marking the user eligible) when it is
 * strictly older than WALLET_MIN_AGE_YEARS (default 3).
 */
export async function POST(request: NextRequest) {
  return runRoute(async () => {
    const session = await requirePrivySession(request);

    enforceRateLimit(session.privyUserId, "eligibility", 8, 60_000);

    const body = (await request
      .json()
      .catch(() => null)) as { address?: unknown } | null;
    const rawAddress =
      typeof body?.address === "string" ? body.address.trim() : null;

    const minAgeYears = getMinWalletAgeYears();
    let user = await syncUser(session);

    // No address: return the current gate state (used on page load).
    if (!rawAddress) {
      if (user.eligible && user.walletAddress) {
        const wallet = walletEligibilityFromUser(user, minAgeYears);
        return jsonOk<EligibilityResponse>(
          eligibleResponse(
            buildProgress(user),
            wallet,
            messageFor("wallet_eligible", wallet, minAgeYears),
            true,
          ),
        );
      }

      return jsonOk<EligibilityResponse>({
        eligible: false,
        reason: "wallet_required",
        message: messageFor("wallet_required", null, minAgeYears),
        cached: false,
        progress: buildProgress(user),
        wallet: null,
      });
    }

    if (!isEvmAddress(rawAddress)) {
      throw new HttpError(
        422,
        "That does not look like an EVM address. Expected 0x followed by 40 hex characters.",
        "INVALID_WALLET",
      );
    }

    const address = rawAddress.toLowerCase();

    if (user.eligible && user.walletAddress) {
      if (user.walletAddress === address) {
        const wallet = walletEligibilityFromUser(user, minAgeYears);
        return jsonOk<EligibilityResponse>(
          eligibleResponse(
            buildProgress(user),
            wallet,
            messageFor("wallet_eligible", wallet, minAgeYears),
            true,
          ),
        );
      }
      throw new HttpError(
        409,
        "This account already passed the gate with another wallet. Wallets cannot be changed.",
        "WALLET_ALREADY_SET",
      );
    }

    const owner = await findWalletOwner(address);
    if (owner && owner.userId !== user.id) {
      throw new HttpError(
        409,
        "That wallet is already linked to another SUMO account.",
        "WALLET_TAKEN",
      );
    }

    const activity = await fetchWalletActivity(address);
    const verdict = evaluateWalletAge(activity.firstTxAt, minAgeYears);
    const wallet: WalletEligibility = {
      address,
      firstTxAt: activity.firstTxAt,
      ageDays: verdict.ageDays,
      ageYears: verdict.ageYears,
      minAgeYears,
    };
    const reason: EligibilityReason = verdict.reason;

    if (!verdict.eligible) {
      return jsonOk<EligibilityResponse>({
        eligible: false,
        reason,
        message: messageFor(reason, wallet, minAgeYears),
        cached: false,
        progress: buildProgress(user),
        wallet,
      });
    }

    user = await linkEligibleWallet(user.id, {
      address,
      firstTxAt: activity.firstTxAt as string,
      ageDays: verdict.ageDays as number,
      ageYears: verdict.ageYears as number,
    });

    const linkedWallet = walletEligibilityFromUser(user, minAgeYears);
    return jsonOk<EligibilityResponse>(
      eligibleResponse(
        buildProgress(user),
        linkedWallet,
        messageFor("wallet_eligible", linkedWallet, minAgeYears),
        false,
      ),
    );
  });
}
