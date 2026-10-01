import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KPI Axborot Tizimi — Oʻzbekiston Milliy Universiteti Jizzax Filiali",
  description: "Mirzo Ulugʻbek nomidagi Oʻzbekiston Milliy universiteti Jizzax filiali professor-oʻqituvchilari faoliyatini baholash va ragʻbatlantirish portali (2026)",
  icons: {
    icon: "/logo-kpi.png",
    apple: "/logo-kpi.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
