"use client";

import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ComponentProps,
  type ReactNode,
} from "react";

export type SumoTwitter = {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
};

export type SumoAuthValue = {
  /** False when NEXT_PUBLIC_PRIVY_APP_ID is missing (setup mode). */
  configured: boolean;
  /** False until Privy has hydrated its session. */
  ready: boolean;
  authenticated: boolean;
  twitter: SumoTwitter | null;
  connect: () => void;
  disconnect: () => Promise<void>;
  /** Fresh Privy access token for API calls, or null if unavailable. */
  getToken: () => Promise<string | null>;
};

const SumoAuthContext = createContext<SumoAuthValue | null>(null);

const NOT_CONFIGURED: SumoAuthValue = {
  configured: false,
  ready: true,
  authenticated: false,
  twitter: null,
  connect: () => {
    // The setup banner explains what is missing; nothing else to do here.
  },
  disconnect: async () => {},
  getToken: async () => null,
};

const privyConfig: ComponentProps<typeof PrivyProvider>["config"] = {
  // Requirement: X/Twitter is the only login method.
  loginMethods: ["twitter"],
  appearance: {
    theme: "dark",
    accentColor: "#15F5BA",
    landingHeader: "Enter the ring",
    loginMessage:
      "SUMO only lets X-verified accounts through the gate. Connect yours to check.",
  },
};

function extractTwitter(accounts: unknown): SumoTwitter | null {
  if (!Array.isArray(accounts)) return null;

  for (const account of accounts) {
    if (!account || typeof account !== "object") continue;
    const record = account as Record<string, unknown>;
    if (record.type !== "twitter_oauth") continue;

    const id = typeof record.subject === "string" ? record.subject : null;
    if (!id) continue;

    const username =
      typeof record.username === "string" ? record.username : "";
    const name =
      typeof record.name === "string" && record.name.trim().length > 0
        ? record.name
        : username || "X user";
    const avatarUrl =
      typeof record.profilePictureUrl === "string"
        ? record.profilePictureUrl
        : typeof record.profile_picture_url === "string"
          ? record.profile_picture_url
          : null;

    return { id, username, name, avatarUrl };
  }

  return null;
}

function AuthBridge({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, login, logout, getAccessToken } =
    usePrivy();

  const twitter = useMemo(
    () => extractTwitter(user?.linkedAccounts),
    [user?.linkedAccounts],
  );

  const connect = useCallback(() => {
    login();
  }, [login]);

  const disconnect = useCallback(async () => {
    await logout();
  }, [logout]);

  const getToken = useCallback(async () => {
    try {
      const token = await getAccessToken();
      return token ?? null;
    } catch {
      return null;
    }
  }, [getAccessToken]);

  const value = useMemo<SumoAuthValue>(
    () => ({
      configured: true,
      ready,
      authenticated: authenticated && twitter !== null,
      twitter,
      connect,
      disconnect,
      getToken,
    }),
    [ready, authenticated, twitter, connect, disconnect, getToken],
  );

  return (
    <SumoAuthContext.Provider value={value}>
      {children}
    </SumoAuthContext.Provider>
  );
}

export function SumoAuthProvider({
  appId,
  children,
}: {
  appId: string | undefined;
  children: ReactNode;
}) {
  if (!appId) {
    // Rendering without Privy keeps the landing page (and `next build`) usable
    // before credentials exist. The header banner tells the user what to set.
    return (
      <SumoAuthContext.Provider value={NOT_CONFIGURED}>
        {children}
      </SumoAuthContext.Provider>
    );
  }

  return (
    <PrivyProvider appId={appId} config={privyConfig}>
      <AuthBridge>{children}</AuthBridge>
    </PrivyProvider>
  );
}

export function useSumoAuth(): SumoAuthValue {
  const context = useContext(SumoAuthContext);
  if (!context) {
    throw new Error("useSumoAuth must be used inside <SumoAuthProvider>.");
  }
  return context;
}
