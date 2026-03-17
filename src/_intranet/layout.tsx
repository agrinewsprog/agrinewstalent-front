// This layout applies to the /intranet/* routes (without locale prefix).
// The proxy.ts middleware redirects all /intranet/* requests to
// /[locale]/intranet/* before this layout is ever rendered.
// It exists only to satisfy Next.js route resolution for re-exported pages.
export default function IntranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
