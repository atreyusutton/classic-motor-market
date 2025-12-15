import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DisclaimerGate } from "@/components/legal/disclaimer-gate";

const sans = Inter({
  variable: "--font-sans-base",
  subsets: ["latin"],
  display: "swap",
});

const serif = Playfair_Display({
  variable: "--font-serif-base",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Classic Motor Market",
  description: "The premier destination for buying and selling exceptional vehicles.",
  icons: {
    icon: "/assets/cmm-logo-black.png",
    shortcut: "/assets/cmm-logo-black.png",
    apple: "/assets/cmm-logo-black.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} min-h-screen bg-page text-text-main font-sans antialiased`}>
        <DisclaimerGate>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </DisclaimerGate>
      </body>
    </html>
  );
}
