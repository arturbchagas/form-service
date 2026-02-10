import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PHC - Ordem de Serviço",
  description: "Sistema de gestão de ordens de serviço",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
