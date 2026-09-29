import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FC27 Market Scanner",
  description: "Market intelligence for EA SPORTS FC 27 Ultimate Team"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
