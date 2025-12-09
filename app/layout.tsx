import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import { DataInitializer } from "@/components/DataInitializer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neon Void Trading Journal",
  description: "Professional Trading Journal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground flex min-h-screen`}
      >
        <Sidebar />
        <main className="flex-1 ml-20 md:ml-64 p-8 overflow-y-auto h-screen">
          <DataInitializer />
          {children}
        </main>
      </body>
    </html>
  );
}
