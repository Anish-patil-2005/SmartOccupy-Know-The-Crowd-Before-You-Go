import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs' // <--- Add this import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartOccupy",
  description: "IoT Based Crowd Tracking for malls, shops, helps user to get updates of crowdy at any store, Know the Crowd Before You Go",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Wrap the entire HTML structure with ClerkProvider
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}