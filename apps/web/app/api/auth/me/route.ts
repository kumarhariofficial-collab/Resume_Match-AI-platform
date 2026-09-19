import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("resumematch_user");

    if (!userCookie || !userCookie.value) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = JSON.parse(userCookie.value);
    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
