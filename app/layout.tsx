import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  applicationName: siteConfig.name,
  title: {
    default: `${siteConfig.name} | Language learning for real conversations`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.social.title,
    description: siteConfig.social.description,
    url: siteConfig.domain,
    images: [{ url: siteConfig.social.image }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.social.title,
    description: siteConfig.social.description,
    images: [siteConfig.social.image],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
