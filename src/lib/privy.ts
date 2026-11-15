import { PrivyClient } from "@privy-io/server-auth";
import { HttpError } from "@/lib/http";

/**
 * Server-only Privy client. The app secret must never reach the browser.
 */
let client: PrivyClient | null = null;

export function getPrivyClient(): PrivyClient {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;

  if (!appId || !appSecret) {
    throw new HttpError(
      503,
      "Privy server credentials are missing. Set NEXT_PUBLIC_PRIVY_APP_ID and PRIVY_APP_SECRET.",
      "PRIVY_NOT_CONFIGURED",
    );
  }

  if (!client) {
    client = new PrivyClient(appId, appSecret);
  }
  return client;
}
