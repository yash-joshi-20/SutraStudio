/**
 * /register — permanent redirect to /login?mode=register
 *
 * The registration UI lives inside the login page. This server redirect
 * ensures bookmarked or linked /register URLs still work.
 */

import { redirect } from "next/navigation";

export default function RegisterPage({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  const returnTo = searchParams?.returnTo ?? searchParams?.redirect ?? searchParams?.next ?? "";
  const dest = returnTo ? `/login?mode=register&returnTo=${encodeURIComponent(returnTo)}` : "/login?mode=register";
  redirect(dest);
}
