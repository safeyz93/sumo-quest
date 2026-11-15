"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSumoAuth } from "@/components/providers/privy-provider";
import type {
  ActionResponse,
  EligibilityReason,
  EligibilityResponse,
  QuestProgress,
  WalletEligibility,
} from "@/lib/quest-types";

export type GateState =
  | "loading"
  | "wallet_required"
  | "ineligible"
  | "eligible"
  | "error";
export type QuestAction = "follow" | "reply" | null;
export type ActionErrorScope = "follow" | "reply" | "wallet" | null;

type ErrorPayload = { error?: unknown };

export function useQuest() {
  const { ready, authenticated, twitter, getToken, configured } = useSumoAuth();

  const [gate, setGate] = useState<GateState>("loading");
  const [progress, setProgress] = useState<QuestProgress | null>(null);
  const [gateMessage, setGateMessage] = useState<string | null>(null);
  const [gateReason, setGateReason] = useState<EligibilityReason | null>(null);
  const [gateError, setGateError] = useState<string | null>(null);
  const [walletAttempt, setWalletAttempt] = useState<WalletEligibility | null>(
    null,
  );
  const [checkingWallet, setCheckingWallet] = useState(false);
  const [action, setAction] = useState<QuestAction>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionErrorScope, setActionErrorScope] =
    useState<ActionErrorScope>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const checkedFor = useRef<string | null>(null);
  const gateInFlight = useRef(false);

  const request = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      const token = await getToken();
      if (!token) {
        throw new Error(
          "Your Privy session expired. Reconnect X and try again.",
        );
      }

      let response: Response;
      try {
        response = await fetch(path, {
          ...init,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(init?.headers ?? {}),
          },
          cache: "no-store",
        });
      } catch {
        throw new Error("Network error. Check your connection and try again.");
      }

      const payload = (await response.json().catch(() => null)) as
        | T
        | ErrorPayload
        | null;

      if (!response.ok) {
        const message =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof (payload as ErrorPayload).error === "string"
            ? ((payload as ErrorPayload).error as string)
            : `Request failed (${response.status}).`;
        throw new Error(message);
      }

      return payload as T;
    },
    [getToken],
  );

  const loadGate = useCallback(async () => {
    if (gateInFlight.current) return;
    gateInFlight.current = true;

    setGate("loading");
    setGateError(null);
    setGateMessage(null);
    setGateReason(null);
    setActionError(null);
    setActionErrorScope(null);
    setNotice(null);
    setWalletAttempt(null);

    try {
      const data = await request<EligibilityResponse>("/api/eligibility", {
        method: "POST",
        body: JSON.stringify({}),
      });
      setProgress(data.progress);
      setGateMessage(data.message);
      setGateReason(data.reason);
      setWalletAttempt(data.wallet);
      setGate(
        data.eligible
          ? "eligible"
          : data.reason === "wallet_required"
            ? "wallet_required"
            : "ineligible",
      );
    } catch (error) {
      setProgress(null);
      setGateError(
        error instanceof Error
          ? error.message
          : "Could not load the gate state. Try again.",
      );
      setGate("error");
    } finally {
      gateInFlight.current = false;
    }
  }, [request]);

  // Auto-load once per login / account change; reset on disconnect.
  useEffect(() => {
    if (!ready) return;

    if (!authenticated || !twitter) {
      checkedFor.current = null;
      setGate("loading");
      setProgress(null);
      setGateMessage(null);
      setGateReason(null);
      setGateError(null);
      setWalletAttempt(null);
      setCheckingWallet(false);
      setActionError(null);
      setActionErrorScope(null);
      setNotice(null);
      setAction(null);
      return;
    }

    if (checkedFor.current === twitter.id) return;
    checkedFor.current = twitter.id;
    void loadGate();
  }, [ready, authenticated, twitter, loadGate]);

  const checkWallet = useCallback(
    async (address: string): Promise<boolean> => {
      if (checkingWallet) return false;
      setCheckingWallet(true);
      setActionError(null);
      setActionErrorScope(null);
      setNotice(null);

      try {
        const data = await request<EligibilityResponse>("/api/eligibility", {
          method: "POST",
          body: JSON.stringify({ address }),
        });
        setProgress(data.progress);
        setGateMessage(data.message);
        setGateReason(data.reason);
        setWalletAttempt(data.wallet);
        setGate(data.eligible ? "eligible" : "ineligible");
        return data.eligible;
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Wallet check failed.",
        );
        setActionErrorScope("wallet");
        return false;
      } finally {
        setCheckingWallet(false);
      }
    },
    [request, checkingWallet],
  );

  const verify = useCallback(
    async (kind: "follow" | "reply"): Promise<boolean> => {
      setAction(kind);
      setActionError(null);
      setActionErrorScope(null);
      setNotice(null);
      try {
        const data = await request<ActionResponse>(
          `/api/tasks/verify-${kind}`,
          { method: "POST", body: JSON.stringify({}) },
        );
        setProgress(data.progress);
        setNotice(data.message);
        return true;
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Verification failed.",
        );
        setActionErrorScope(kind);
        return false;
      } finally {
        setAction(null);
      }
    },
    [request],
  );

  return {
    configured,
    ready,
    authenticated,
    twitter,
    gate,
    gateMessage,
    gateReason,
    gateError,
    progress,
    walletAttempt,
    checkingWallet,
    action,
    actionError,
    actionErrorScope,
    notice,
    loadGate,
    checkWallet,
    verify,
  };
}
