import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await prisma.template.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, slug, subject, html, variables, status } = await request.json();

    if (!name || !slug || !subject) {
      return NextResponse.json({ error: "Name, slug, and subject are required" }, { status: 400 });
    }

    const template = await prisma.template.create({
      data: {
        name,
        slug,
        subject,
        html,
        variables: variables || [],
        status: status || "ACTIVE",
      },
    });

    await prisma.log.create({
      data: {
        action: "CREATE_TEMPLATE",
        entityType: "Template",
        entityId: template.id,
        userId: session.userId,
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A template with this slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
