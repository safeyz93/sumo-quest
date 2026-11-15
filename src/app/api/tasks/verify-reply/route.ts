import type { NextRequest } from "next/server";
import { handleVerifyTask } from "@/lib/verify/verify-task";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/tasks/verify-reply — Privy auth required. */
export async function POST(request: NextRequest) {
  return handleVerifyTask(request, "reply");
}
