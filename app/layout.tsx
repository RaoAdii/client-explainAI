import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ClientExplain AI", template: "%s · ClientExplain AI" },
  description: "Turn legal processes into clear, client-friendly visual explainers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
