import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email: emailInput, password } = await request.json();

    if (!emailInput || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const targetEmail = emailInput.trim().includes("@")
      ? emailInput.trim()
      : `${emailInput.trim()}@mobawi.com`;

    let user = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: targetEmail },
            { email: emailInput.trim() },
          ],
        },
      });
    } catch (dbError: any) {
      console.error("Database connection error during login:", dbError);
      return NextResponse.json(
        { error: "Database not connected. Please check DATABASE_URL in Vercel settings and run seed.js." },
        { status: 500 }
      );
    }

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
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json({ error: "Authentication failed. Please try again." }, { status: 500 });
  }
}
