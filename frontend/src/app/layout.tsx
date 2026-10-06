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

const basePath = process.env.NODE_ENV === "production" ? "/kpi" : (process.env.NEXT_PUBLIC_BASE_PATH || "");

export const metadata: Metadata = {
  title: "KPI Axborot Tizimi — Oʻzbekiston Milliy universitetining Jizzax filiali",
  description: "Mirzo Ulugʻbek nomidagi Oʻzbekiston Milliy universitetining Jizzax filiali professor-oʻqituvchilari faoliyatini baholash va ragʻbatlantirish portali (2026)",
  icons: {
    icon: `${basePath}/logo-kpi.png`,
    apple: `${basePath}/logo-kpi.png`,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col w-full max-w-full overflow-x-hidden relative">{children}</body>
    </html>
  );
}
