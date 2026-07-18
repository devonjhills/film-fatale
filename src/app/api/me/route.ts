import { NextResponse } from "next/server";
import { getSession } from "@/lib/access-auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    { user: session.user },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
