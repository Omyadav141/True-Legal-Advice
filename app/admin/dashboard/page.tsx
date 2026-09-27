import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-session";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    redirect("/admin/login");
  }

  return <DashboardClient />;
}
