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
    const { email, password, name } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const prisma = getPrismaClient();

    const user = await prisma.user.upsert({
      where: { email },
      update: { updatedAt: new Date() },
      create: {
        email,
        name: name || email.split("@")[0],
        role: "USER",
        plan: "PRO",
      },
    });

    await sendWelcomeEmail(email, user.name || undefined);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
    });

    response.cookies.set("resumematch_user", JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    }), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: false,
    });

    return response;
  } catch (error) {
    console.error("[Auth API Error]:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
