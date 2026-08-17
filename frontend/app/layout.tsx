import type { Metadata } from "next";

import { Footer } from "@/components/storefront/Footer";
import { Navbar } from "@/components/storefront/Navbar";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Francis Gadgets Technologies",
  description: "Quality gadgets and electronics, delivered fast.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
