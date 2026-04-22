import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const SESSION_ID = "current_trip";

/**
 * Every request creates the row on first read so callers never see a
 * 404 — the singleton is always present.
 */
async function getOrCreateSession() {
  return prisma.tripSession.upsert({
    where: { id: SESSION_ID },
    update: {},
    create: { id: SESSION_ID },
  });
}

/**
 * GET /api/session
 *   -> { driverName, passengerName, activeTheme }
 *
 * Mobile app polls this on an interval so each phone sees updates
 * made from the other phone.
 */
export async function GET() {
  try {
    const session = await getOrCreateSession();
    return NextResponse.json({
      driverName: session.driverName,
      passengerName: session.passengerName,
      activeTheme: session.activeTheme,
    });
  } catch (err) {
    console.error("GET /api/session failed", err);
    return NextResponse.json(
      { error: "Failed to load trip session" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/session  { role: "driver" | "passenger", name: string }
 *   -> claim a seat. Returns 409 if someone already has it.
 */
export async function POST(req: NextRequest) {
  let body: { role?: string; name?: string; activeTheme?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { role, name, activeTheme } = body;

  if (activeTheme) {
    const session = await prisma.tripSession.upsert({
      where: { id: SESSION_ID },
      update: { activeTheme },
      create: { id: SESSION_ID, activeTheme },
    });
    return NextResponse.json(session);
  }

  if (role !== "driver" && role !== "passenger") {
    return NextResponse.json(
      { error: "`role` must be 'driver' or 'passenger'" },
      { status: 400 }
    );
  }
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json(
      { error: "`name` must be at least 2 characters" },
      { status: 400 }
    );
  }

  try {
    const current = await getOrCreateSession();
    const field = role === "driver" ? "driverName" : "passengerName";
    const trimmedName = name.trim();

    // Allow the same person to rejoin (e.g. after an app reload) — only
    // reject when a *different* name already holds the seat.
    if (current[field] && current[field] !== trimmedName) {
      return NextResponse.json(
        { error: `${role} seat is already taken`, session: current },
        { status: 409 }
      );
    }

    const updated = await prisma.tripSession.update({
      where: { id: SESSION_ID },
      data: { [field]: trimmedName },
    });

    return NextResponse.json({
      driverName: updated.driverName,
      passengerName: updated.passengerName,
      activeTheme: updated.activeTheme,
    });
  } catch (err) {
    console.error("POST /api/session failed", err);
    return NextResponse.json(
      { error: "Failed to claim seat" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/session  { role: "driver" | "passenger" }
 *   -> give up a seat when the app closes / user taps "leave".
 *
 * With no body, resets the whole session (useful for dev).
 */
export async function DELETE(req: NextRequest) {
  let role: string | undefined;
  try {
    const body = (await req.json()) as { role?: string };
    role = body.role;
  } catch {
    // empty body is fine -> reset everything
  }

  const data =
    role === "driver"
      ? { driverName: null }
      : role === "passenger"
      ? { passengerName: null }
      : { driverName: null, passengerName: null };

  const updated = await prisma.tripSession.upsert({
    where: { id: SESSION_ID },
    update: data,
    create: { id: SESSION_ID, ...data },
  });

  return NextResponse.json(updated);
}
