import { redirect } from "next/navigation";

/**
 * Root entry — bounce into the portal. The (app) layout + middleware enforce
 * authentication, redirecting unauthenticated users to /login.
 */
export default function Home() {
  redirect("/dashboard");
}
