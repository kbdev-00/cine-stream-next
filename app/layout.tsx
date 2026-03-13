import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { FavoritesProvider } from "@/components/FavoritesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cine Stream",
  description: "Next.js Migration (Cine-Stream Upgrade)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <FavoritesProvider>
          <div style={{
            backgroundColor: "#111",
            minHeight: "100vh",
            padding: "2rem 4rem",
            color: "white",
            boxSizing: "border-box",
            width: "100%"
          }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h1>🎬 Cine Stream</h1>
              <nav style={{ display: "flex", gap: "20px" }}>
                <Link href="/" style={{ color: "white", textDecoration: "none", fontSize: "1.2rem", fontWeight: "bold" }}>Home</Link>
                <Link href="/favorites" style={{ color: "white", textDecoration: "none", fontSize: "1.2rem", fontWeight: "bold" }}>My Favorites ❤️</Link>
              </nav>
            </header>
            <main>
              {children}
            </main>
          </div>
        </FavoritesProvider>
      </body>
    </html>
  );
}
