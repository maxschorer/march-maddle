import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { getUser, getProfile } from "@/lib/auth";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  const profile = user ? await getProfile(user.id) : null;

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppShell initialUser={user} initialProfile={profile}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
