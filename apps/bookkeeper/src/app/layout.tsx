import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bookkeeper — Bà Lan · sạp vải An Đông (demo)",
  description:
    "Offline sổ hộ kinh doanh — Next.js + SQLite ledger · sandbox billing only",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-dvh bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
