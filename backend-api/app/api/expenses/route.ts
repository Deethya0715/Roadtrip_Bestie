import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const SESSION_ID = "current_trip";
const MAX_ENTRIES = 80;

export type ExpenseKind = "food" | "coffee" | "charging";

export interface ExpenseEntry {
  id: string;
  kind: ExpenseKind;
  role: "driver" | "passenger";
  payerName: string;
  amountCents: number;
  note?: string;
  vendor?: string;
  createdAt: string;
}

function parseLedger(raw: string | null | undefined): ExpenseEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ExpenseEntry[]) : [];
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
 * GET /api/expenses -> { entries: ExpenseEntry[] } newest first
 */
export async function GET() {
  try {
    const session = await getSessionRow();
    const entries = parseLedger(session.expenseLedgerJson);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("GET /api/expenses failed", err);
    return NextResponse.json(
      { error: "Failed to load expenses" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/expenses
 * body: { kind, role, payerName, amountCents, note?, vendor? }
 */
export async function POST(req: NextRequest) {
  let body: Partial<ExpenseEntry>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { kind, role, payerName, amountCents, note, vendor } = body;

  if (kind !== "food" && kind !== "coffee" && kind !== "charging") {
    return NextResponse.json(
      { error: "`kind` must be food|coffee|charging" },
      { status: 400 }
    );
  }
  if (role !== "driver" && role !== "passenger") {
    return NextResponse.json(
      { error: "`role` must be driver|passenger" },
      { status: 400 }
    );
  }
  if (!payerName || typeof payerName !== "string" || !payerName.trim()) {
    return NextResponse.json(
      { error: "`payerName` is required" },
      { status: 400 }
    );
  }
  if (
    typeof amountCents !== "number" ||
    !Number.isFinite(amountCents) ||
    amountCents < 1 ||
    amountCents > 500_000_00
  ) {
    return NextResponse.json(
      { error: "`amountCents` must be a positive number (max 50000000)" },
      { status: 400 }
    );
  }
  if (!Number.isInteger(amountCents)) {
    return NextResponse.json(
      { error: "`amountCents` must be a whole number of cents" },
      { status: 400 }
    );
  }

  try {
    const session = await getSessionRow();
    const existing = parseLedger(session.expenseLedgerJson);

    const entry: ExpenseEntry = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `ex_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      kind,
      role,
      payerName: payerName.trim(),
      amountCents: Math.round(amountCents),
      note:
        typeof note === "string" && note.trim()
          ? note.trim().slice(0, 280)
          : undefined,
      vendor:
        typeof vendor === "string" && vendor.trim()
          ? vendor.trim().slice(0, 80)
          : undefined,
      createdAt: new Date().toISOString(),
    };

    const next = [entry, ...existing].slice(0, MAX_ENTRIES);

    await prisma.tripSession.update({
      where: { id: SESSION_ID },
      data: { expenseLedgerJson: JSON.stringify(next) },
    });

    return NextResponse.json({ entry, entries: next });
  } catch (err) {
    console.error("POST /api/expenses failed", err);
    return NextResponse.json(
      { error: "Failed to record expense" },
      { status: 500 }
    );
  }
}
