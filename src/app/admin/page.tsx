import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/access-auth";

export const metadata: Metadata = {
  title: "Owner access",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const session = await getSession();

  redirect(session ? "/library" : "/");
}
