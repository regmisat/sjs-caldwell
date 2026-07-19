import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ADMIN_EMAILS } from "@/utils/CONSTANTS";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    redirect("/");
  }

  return <UsersClient />;
}
