import { NextResponse } from "next/server";

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly headers?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    code: string,
    headers?: Record<string, string>,
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.headers = headers;
  }
}

/** Thrown by live verifiers whose X API wiring is not built yet. */
export class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Wraps a route handler with uniform error handling. Expected errors are
 * returned as { error, code }; unexpected ones are logged and flattened so
 * internals never leak to the client.
 */
export async function runRoute(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status, headers: error.headers },
      );
    }
    if (error instanceof NotImplementedError) {
      return NextResponse.json(
        {
          error: error.message,
          code: "NOT_IMPLEMENTED",
        },
        { status: 501 },
      );
    }
    console.error("[api] unhandled error", error);
    return NextResponse.json(
      {
        error: "Something cracked on the server. Try again in a moment.",
        code: "INTERNAL",
      },
      { status: 500 },
    );
  }
}
