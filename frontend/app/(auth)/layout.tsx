/**
 * Auth pages get their own shell: no storefront navbar, search or footer.
 * Signing in -- especially into the admin console -- should not look like
 * another page of the shop.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex flex-1 flex-col">{children}</main>;
}
