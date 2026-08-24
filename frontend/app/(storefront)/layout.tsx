import { Footer } from "@/components/storefront/Footer";
import { Navbar } from "@/components/storefront/Navbar";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
