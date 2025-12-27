import type { Metadata } from "next";
import { Roboto_Slab, Abril_Fatface } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DisclaimerGate } from "@/components/legal/disclaimer-gate";

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
});

const abrilFatface = Abril_Fatface({
  variable: "--font-abril-fatface",
  weight: "400",
  subsets: ["latin"],
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
      <body className={`${robotoSlab.variable} ${abrilFatface.variable} min-h-screen bg-page text-text-main font-sans antialiased`}>
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
