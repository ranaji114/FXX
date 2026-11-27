import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FXX — Streetwear",
  description: "Independent streetwear from India.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
