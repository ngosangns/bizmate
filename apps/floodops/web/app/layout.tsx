import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FloodOps · Ops Dashboard (sandbox)",
  description:
    "HCMC flood-day last-mile replan — offline fixture · not live SPX",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
