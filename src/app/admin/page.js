import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VerifyToken } from "@/helper/jwt";
import AdminDashboard from "./adminDashboard";

export default async function AdminPage() {
  const cookieStore = await cookies();

  const token = cookieStore.get("EliteShop")?.value;

  // No login cookie
  if (!token) {
    redirect("/");
  }

  // Verify JWT
  const payload = VerifyToken(token);

  // Invalid/expired token
  if (!payload) {
    redirect("/");
  }

  // Logged-in user is not admin
  if (payload.role?.toLowerCase() !== "admin") {
    redirect("/");
  }

  return <AdminDashboard />;
}