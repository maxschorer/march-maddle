import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "March Maddle",
  description: "Guess today's March Madness team in 6 tries!",
  metadataBase: new URL("https://marchmaddle.com"),
  openGraph: {
    title: "March Maddle",
    description: "Guess today's March Madness team in 6 tries!",
    url: "https://marchmaddle.com",
    siteName: "March Maddle",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "March Maddle",
    description: "Guess today's March Madness team in 6 tries!",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
