/**
 * /register — permanent redirect to /login?mode=register
 *
 * The registration UI lives inside the login page. This server redirect
 * ensures bookmarked or linked /register URLs still work.
 */

import { redirect } from "next/navigation";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const sp = (await searchParams) || {};
  const returnTo = sp.returnTo ?? sp.redirect ?? sp.next ?? "";
  const dest = returnTo ? `/login?mode=register&returnTo=${encodeURIComponent(returnTo)}` : "/login?mode=register";
  redirect(dest);
}
