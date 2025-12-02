import { Suspense } from "react";
import "./globals.css"; 
import Providers from "./providers";
import AppShell from "@/components/AppShell";
import { Outfit } from "next/font/google"; //
import Guard from "@/components/Guard";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "Amar Shop Admin",
  description: "Admin panel for Shodaigram",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="font-sans">
        <Suspense fallback={<div>Loading...</div>}>
          <Guard>
            <Providers>
              <AppShell>{children}</AppShell>
            </Providers>
          </Guard>
        </Suspense>
      </body>
    </html>
  );
}
