import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = await prisma.history.findMany({
    orderBy: { createdAt: "desc" },
    include: { template: true },
    take: 100,
  });

  return NextResponse.json({ history });
}
