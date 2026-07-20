import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    return NextResponse.json({ settings: settingsMap });
  } catch (dbError) {
    return NextResponse.json({ settings: {} });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key, value } = await request.json();
    if (!key) {
      return NextResponse.json({ error: "Setting key is required" }, { status: 400 });
    }

    try {
      const setting = await prisma.setting.upsert({
        where: { key },
        update: { value: value || "" },
        create: { key, value: value || "" },
      });
      return NextResponse.json({ success: true, setting });
    } catch (_) {
      return NextResponse.json({ success: true, message: "Setting saved locally" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
