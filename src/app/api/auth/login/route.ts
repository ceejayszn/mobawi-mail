import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email: emailInput, password } = await request.json();

    if (!emailInput || !password) {
      return NextResponse.json({ error: "Username/Email and password are required" }, { status: 400 });
    }

    // Support entering "root" or "root@mobawi.com"
    const targetEmail = emailInput.trim().includes("@")
      ? emailInput.trim()
      : `${emailInput.trim()}@mobawi.com`;

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: targetEmail },
          { email: emailInput.trim() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
