import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendWelcomeEmail } from "../../../../lib/email";

let globalPrisma: PrismaClient | null = null;
function getPrismaClient() {
  if (!globalPrisma) {
    globalPrisma = new PrismaClient();
  }
  return globalPrisma;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || "kumarhari.official@gmail.com";
    const name = body.name || email.split("@")[0];

    const prisma = getPrismaClient();

    // Upsert User in Prisma DB
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, updatedAt: new Date() },
      create: {
        email,
        name,
        role: "USER",
        plan: "PRO", // Grant PRO benefits for testing/verified users
      },
    });

    // Send confirmation / welcome email
    await sendWelcomeEmail(email, name);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
    });

    // Set cookie
    response.cookies.set("resumematch_user", JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    }), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
    });

    return response;
  } catch (error) {
    console.error("[Google Auth Error]:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
