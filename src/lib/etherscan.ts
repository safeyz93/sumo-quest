import { HttpError } from "@/lib/http";

/**
 * Wallet-age eligibility via Etherscan API v2 (Ethereum mainnet).
 *
 * We use the wallet's first normal transaction as its "age". If the address has
 * no normal transactions, we fall back to the first ERC-20 transfer so
 * receive-only wallets are still considered. Only Ethereum mainnet is checked.
 */

const ETHERSCAN_BASE_URL =
  process.env.ETHERSCAN_API_URL?.trim() || "https://api.etherscan.io/v2/api";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const DEFAULT_MIN_WALLET_AGE_YEARS = 3;

export function getMinWalletAgeYears(): number {
  const raw = Number(process.env.WALLET_MIN_AGE_YEARS ?? DEFAULT_MIN_WALLET_AGE_YEARS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_MIN_WALLET_AGE_YEARS;
}

export type WalletActivity = {
  firstTxAt: string | null;
  source: "txlist" | "tokentx" | null;
};

type CacheEntry = { expiresAt: number; activity: WalletActivity };

const activityCache = new Map<string, CacheEntry>();

type EtherscanResponse = {
  status?: string;
  message?: string;
  result?: unknown;
};

async function queryFirstTx(
  address: string,
  action: "txlist" | "tokentx",
): Promise<{ firstTxAt: string | null; empty: boolean }> {
  const apiKey = process.env.ETHERSCAN_API_KEY?.trim();
  if (!apiKey) {
    throw new HttpError(
      503,
      "Etherscan is not configured on the server. Set ETHERSCAN_API_KEY in .env.local.",
      "ETHERSCAN_NOT_CONFIGURED",
    );
  }

  const url = new URL(ETHERSCAN_BASE_URL);
  url.searchParams.set("chainid", "1");
  url.searchParams.set("module", "account");
  url.searchParams.set("action", action);
  url.searchParams.set("address", address);
  url.searchParams.set("startblock", "0");
  url.searchParams.set("endblock", "99999999");
  url.searchParams.set("page", "1");
  url.searchParams.set("offset", "1");
  url.searchParams.set("sort", "asc");
  url.searchParams.set("apikey", apiKey);

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new HttpError(
      502,
      "Could not reach Etherscan. Try the wallet check again in a moment.",
      "ETHERSCAN_UNAVAILABLE",
    );
  }

  if (response.status === 429) {
    throw new HttpError(
      503,
      "Etherscan rate limit reached. Try again in a minute.",
      "ETHERSCAN_RATE_LIMITED",
    );
  }

  if (!response.ok) {
    throw new HttpError(
      502,
      `Etherscan responded with ${response.status}. Try again in a moment.`,
      "ETHERSCAN_ERROR",
    );
  }

  const payload = (await response
    .json()
    .catch(() => null)) as EtherscanResponse | null;

  if (!payload) {
    throw new HttpError(
      502,
      "Etherscan returned an unreadable response. Try again.",
      "ETHERSCAN_BAD_RESPONSE",
    );
  }

  if (payload.status === "1" && Array.isArray(payload.result)) {
    const first = payload.result[0] as { timeStamp?: unknown } | undefined;
    const timestamp = Number(first?.timeStamp);
    if (Number.isFinite(timestamp) && timestamp > 0) {
      return {
        firstTxAt: new Date(timestamp * 1000).toISOString(),
        empty: false,
      };
    }
    throw new HttpError(
      502,
      "Etherscan returned an unexpected transaction payload. Try again.",
      "ETHERSCAN_BAD_RESPONSE",
    );
  }

  if (
    payload.status === "0" &&
    typeof payload.message === "string" &&
    /no transactions found/i.test(payload.message)
  ) {
    return { firstTxAt: null, empty: true };
  }

  const detail =
    typeof payload.result === "string"
      ? payload.result
      : payload.message ?? "unknown error";

  if (/invalid api key/i.test(detail)) {
    throw new HttpError(
      503,
      "Etherscan rejected the API key. Check ETHERSCAN_API_KEY.",
      "ETHERSCAN_INVALID_KEY",
    );
  }

  if (/rate limit/i.test(detail)) {
    throw new HttpError(
      503,
      "Etherscan rate limit reached. Try again in a minute.",
      "ETHERSCAN_RATE_LIMITED",
    );
  }

  console.error("[etherscan] error", detail);
  throw new HttpError(
    502,
    "Etherscan could not complete the wallet lookup. Try again in a moment.",
    "ETHERSCAN_ERROR",
  );
}

/** First Ethereum activity for an address, cached for an hour. */
export async function fetchWalletActivity(
  address: string,
): Promise<WalletActivity> {
  const cached = activityCache.get(address);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.activity;
  }

  const normal = await queryFirstTx(address, "txlist");
  let activity: WalletActivity;
  if (normal.firstTxAt) {
    activity = { firstTxAt: normal.firstTxAt, source: "txlist" };
  } else {
    const tokens = await queryFirstTx(address, "tokentx");
    activity = {
      firstTxAt: tokens.firstTxAt,
      source: tokens.firstTxAt ? "tokentx" : null,
    };
  }

  activityCache.set(address, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    activity,
  });
  if (activityCache.size > 5_000) {
    const now = Date.now();
    for (const [key, entry] of activityCache) {
      if (entry.expiresAt <= now) activityCache.delete(key);
    }
  }

  return activity;
}

export type WalletAgeVerdict = {
  eligible: boolean;
  ageDays: number | null;
  ageYears: number | null;
  reason: "wallet_eligible" | "wallet_too_young" | "wallet_no_history";
};

/** Wallet must be strictly older than `minYears` (calendar years). */
export function evaluateWalletAge(
  firstTxAt: string | null,
  minYears: number,
): WalletAgeVerdict {
  if (!firstTxAt) {
    return {
      eligible: false,
      ageDays: null,
      ageYears: null,
      reason: "wallet_no_history",
    };
  }

  const firstMs = Date.parse(firstTxAt);
  if (!Number.isFinite(firstMs)) {
    return {
      eligible: false,
      ageDays: null,
      ageYears: null,
      reason: "wallet_no_history",
    };
  }

  const now = Date.now();
  const ageMs = now - firstMs;
  const dayMs = 24 * 60 * 60 * 1000;
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - minYears);
  const eligible = firstMs < cutoff.getTime();

  return {
    eligible,
    ageDays: Math.max(0, Math.floor(ageMs / dayMs)),
    ageYears: Math.round((ageMs / (365.25 * dayMs)) * 10) / 10,
    reason: eligible ? "wallet_eligible" : "wallet_too_young",
  };
}
