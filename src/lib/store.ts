import { promises as fs } from "node:fs";
import path from "node:path";
import { HttpError } from "@/lib/http";

/**
 * JSON file database for the MVP.
 *
 * - Location: DATA_FILE env (default `data/sumo.json`, relative to project root).
 * - Writes are atomic (temp file + rename) and serialized through an in-process
 *   queue, so concurrent requests cannot interleave a read-modify-write cycle.
 * - This is intentionally single-instance / single-process storage. For more
 *   than one instance, swap this module for Postgres/Redis behind the same API.
 */

export type UserRecord = {
  /** Privy DID — primary key. */
  id: string;
  twitterId: string;
  twitterUsername: string | null;
  twitterName: string | null;
  twitterAvatarUrl: string | null;

  eligible: boolean;
  /** ISO timestamp of the successful wallet-age check. */
  eligibilityCheckedAt: string | null;

  /** Lowercased EVM address. Unique across users. */
  walletAddress: string | null;
  /** ISO timestamp of the wallet's first Ethereum transaction. */
  walletFirstTxAt: string | null;
  walletAgeDays: number | null;
  walletAgeYears: number | null;
  walletSubmittedAt: string | null;

  followVerifiedAt: string | null;
  replyVerifiedAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export type Database = {
  version: 1;
  users: UserRecord[];
};

const DATA_FILE_PATH = path.resolve(
  process.cwd(),
  process.env.DATA_FILE?.trim() || "data/sumo.json",
);

export function getDatabaseFilePath(): string {
  return DATA_FILE_PATH;
}

function emptyDatabase(): Database {
  return { version: 1, users: [] };
}

async function readDatabase(): Promise<Database> {
  let raw: string;
  try {
    raw = await fs.readFile(DATA_FILE_PATH, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return emptyDatabase();
    }
    console.error("[store] read failed", error);
    throw new HttpError(
      500,
      "Could not read the JSON database. Check DATA_FILE and file permissions.",
      "STORE_READ_FAILED",
    );
  }

  try {
    const parsed = JSON.parse(raw) as Database;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.users)) {
      throw new Error("Unexpected database shape");
    }
    return parsed;
  } catch (error) {
    console.error("[store] parse failed", error);
    throw new HttpError(
      500,
      "The JSON database is corrupted. Restore it or delete data/sumo.json to start fresh.",
      "STORE_CORRUPT",
    );
  }
}

async function writeDatabase(database: Database): Promise<void> {
  const directory = path.dirname(DATA_FILE_PATH);
  const tempPath = `${DATA_FILE_PATH}.${process.pid}.${Date.now()}.tmp`;

  try {
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(
      tempPath,
      `${JSON.stringify(database, null, 2)}\n`,
      "utf8",
    );
    await fs.rename(tempPath, DATA_FILE_PATH);
  } catch (error) {
    console.error("[store] write failed", error);
    // Best-effort cleanup of the temp file.
    await fs.unlink(tempPath).catch(() => undefined);
    throw new HttpError(
      500,
      "Could not save to the JSON database. Check DATA_FILE and file permissions.",
      "STORE_WRITE_FAILED",
    );
  }
}

/**
 * Serializes read-modify-write operations. Every mutation goes through here;
 * the whole mutation runs while holding the queue slot.
 */
let tail: Promise<unknown> = Promise.resolve();

function locked<T>(task: () => Promise<T>): Promise<T> {
  const run = tail.then(task, task);
  tail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function withDatabase<T>(
  mutate: (database: Database) => T | Promise<T>,
): Promise<T> {
  return locked(async () => {
    const database = await readDatabase();
    const result = await mutate(database);
    await writeDatabase(database);
    return result;
  });
}

/** Read-only access (still serialized so it never observes a partial write). */
export function readDatabaseCopy<T>(
  read: (database: Database) => T | Promise<T>,
): Promise<T> {
  return locked(async () => read(await readDatabase()));
}
