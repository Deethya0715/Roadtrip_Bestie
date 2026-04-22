import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const SESSION_ID = "current_trip";

// Cap the log so the JSON column doesn't grow unbounded on a long trip.
const MAX_ENTRIES = 50;

export type CheckInType = "arrived" | "vibe" | "leaving" | "blackout";

export interface CheckInEntry {
  id: string;
  type: CheckInType;
  role: "driver" | "passenger";
  author: string;
  message: string;
  /** Arbitrary JSON-serialisable metadata (battery %, lat/lng, etc.). */
  payload?: Record<string, unknown>;
  createdAt: string;
}

function parseLog(raw: string | null | undefined): CheckInEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CheckInEntry[]) : [];
  } catch {
    return [];
  }
}

async function getSessionRow() {
  return prisma.tripSession.upsert({
    where: { id: SESSION_ID },
    update: {},
    create: { id: SESSION_ID },
  });
}

/**
 * GET /api/check-in
 *   -> { entries: CheckInEntry[] }  (newest first)
 *
 * Both phones poll this so the driver can see the passenger's vibe
 * checks, and the passenger can see the driver's arrival / leaving
 * confirmations without either side having to type anything.
 */
export async function GET() {
  try {
    const session = await getSessionRow();
    const entries = parseLog(session.checkInLogJson);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("GET /api/check-in failed", err);
    return NextResponse.json(
      { error: "Failed to load check-in log" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/check-in
 *   body: { type, role, author, message, payload? }
 *   -> { entry, entries }
 *
 * Appends a new Safe Check-In event to the trip log. The server assigns
 * the id and createdAt so timestamps come from one clock.
 */
export async function POST(req: NextRequest) {
  let body: Partial<CheckInEntry>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, role, author, message, payload } = body;

  if (
    type !== "arrived" &&
    type !== "vibe" &&
    type !== "leaving" &&
    type !== "blackout"
  ) {
    return NextResponse.json(
      { error: "`type` must be arrived|vibe|leaving|blackout" },
      { status: 400 }
    );
  }
  if (role !== "driver" && role !== "passenger") {
    return NextResponse.json(
      { error: "`role` must be driver|passenger" },
      { status: 400 }
    );
  }
  if (!author || typeof author !== "string") {
    return NextResponse.json(
      { error: "`author` is required" },
      { status: 400 }
    );
  }
  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { error: "`message` is required" },
      { status: 400 }
    );
  }

  try {
    const session = await getSessionRow();
    const existing = parseLog(session.checkInLogJson);

    const entry: CheckInEntry = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `ci_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      role,
      author: author.trim(),
      message: message.trim(),
      payload: payload && typeof payload === "object" ? payload : undefined,
      createdAt: new Date().toISOString(),
    };

    const next = [entry, ...existing].slice(0, MAX_ENTRIES);

    await prisma.tripSession.update({
      where: { id: SESSION_ID },
      data: { checkInLogJson: JSON.stringify(next) },
    });

    return NextResponse.json({ entry, entries: next });
  } catch (err) {
    console.error("POST /api/check-in failed", err);
    return NextResponse.json(
      { error: "Failed to record check-in" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/check-in
 *   -> clears the trip log. Handy between demo runs.
 */
export async function DELETE() {
  try {
    await prisma.tripSession.upsert({
      where: { id: SESSION_ID },
      update: { checkInLogJson: "[]" },
      create: { id: SESSION_ID, checkInLogJson: "[]" },
    });
    return NextResponse.json({ entries: [] });
  } catch (err) {
    console.error("DELETE /api/check-in failed", err);
    return NextResponse.json(
      { error: "Failed to reset check-in log" },
      { status: 500 }
    );
  }
}
