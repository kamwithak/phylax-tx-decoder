import type { Metadata } from "next";
import { geistMono, geistSans } from "./fonts";
import { Providers } from "./providers";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phylax Transaction Decoder",
  description: "Decoding ETH transactions and traces via a nested table visualization",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Providers>
          <NavBar />
          <main className="flex-1 pb-10">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
