import { redirect } from "next/navigation";

export default function ResendVerificationPage() {
  redirect("/sign-in");
}
