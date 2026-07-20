import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function validateApiKey(request: Request) {
  // 1. Allow authenticated admin dashboard session
  try {
    const session = await getSession();
    if (session) {
      return { valid: true, session };
    }
  } catch (_) {}

  // 2. Check Bearer API key header for external application requests
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid authorization header" };
  }

  const key = authHeader.split(" ")[1];

  if (!key) {
    return { valid: false, error: "Missing API key" };
  }

  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { key },
    });

    if (!apiKey) {
      return { valid: false, error: "Invalid API key" };
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { valid: false, error: "API key expired" };
    }

    return { valid: true, apiKey };
  } catch (_) {
    // If DB is offline, allow key pass-through
    return { valid: true };
  }
}
