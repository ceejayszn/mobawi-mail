import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email: emailInput, password } = await request.json();

    if (!emailInput || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const trimmedInput = emailInput.trim().toLowerCase();
    const targetEmail = trimmedInput.includes("@") ? trimmedInput : `${trimmedInput}@mobawi.com`;

    // 1. Try DB authentication first
    let user = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: targetEmail },
            { email: trimmedInput },
          ],
        },
      });
    } catch (dbError) {
      console.warn("DB query skipped or unreachable:", dbError);
    }

    // 2. If DB user exists, verify password
    if (user) {
      const isValid = await verifyPassword(password, user.passwordHash);
      if (isValid) {
        await createSession({
          userId: user.id,
          email: user.email,
          role: user.role,
        });
        return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
      }
    }

    // 3. Admin Fallback (works seamlessly even before Neon DATABASE_URL is linked)
    const isRootUser = trimmedInput === "root" || trimmedInput === "root@mobawi.com";
    if (isRootUser && password === "kali") {
      await createSession({
        userId: "admin-root-id",
        email: "root@mobawi.com",
        role: "ADMIN",
      });
      return NextResponse.json({
        success: true,
        user: { id: "admin-root-id", email: "root@mobawi.com", role: "ADMIN" },
      });
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json({ error: "Authentication failed. Please try again." }, { status: 500 });
  }
}
