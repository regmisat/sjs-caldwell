import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PaymentsClient from "./PaymentsClient";
import { ADMIN_EMAILS } from "@/utils/CONSTANTS";

export default async function AdminPaymentsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  // Check if user has admin email
  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600">
          This page is only accessible to authorized administrators.
        </p>
        <a
          href="/"
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Return to Home
        </a>
      </div>
    );
  }

  return <PaymentsClient />;
}
