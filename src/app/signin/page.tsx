import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Owner Sign In",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  redirect("/admin");
}
