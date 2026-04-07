import { ThemeInitializer } from "@/components/theme-initializer";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Linear",
  description:
    "Linear is a better way to build. Meet the new standard for modern software development.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-[var(--color-sidebar-bg)] font-sans text-[var(--color-text-primary)] antialiased transition-colors">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
