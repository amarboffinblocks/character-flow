import { redirect } from "next/navigation";

export default function VerifyEmailSentPage() {
  redirect("/sign-in");
}
