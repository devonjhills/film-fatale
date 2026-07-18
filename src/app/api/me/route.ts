import { NextResponse } from "next/server";
import { getSession } from "@/lib/access-auth";

export async function GET() {
  const session = await getSession();

  return NextResponse.json(
    { user: session?.user ?? null },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
