import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipients = await prisma.recipient.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ recipients });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, company, tags } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const recipient = await prisma.recipient.create({
      data: {
        name,
        email,
        company,
        tags: tags || [],
      },
    });

    return NextResponse.json({ success: true, recipient });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Recipient email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create recipient" }, { status: 500 });
  }
}
