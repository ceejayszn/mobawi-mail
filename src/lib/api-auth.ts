import { prisma } from "@/lib/prisma";

export async function validateApiKey(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid authorization header" };
  }

  const key = authHeader.split(" ")[1];

  if (!key) {
    return { valid: false, error: "Missing API key" };
  }

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
}
