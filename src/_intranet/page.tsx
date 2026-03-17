// The proxy.ts middleware redirects /intranet → /[locale]/intranet
// before this page is rendered. This stub prevents a 404 during build.
export default function IntranetPage() {
  return null;
}
