import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { Layout } from '@/components/layout/Layout'

const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
  title: "Foco Monitor",
  description: "Monitore sua rotina e suas tarefas",
};

export default function RootLayout({children,}: Readonly<{
  children: React.ReactNode;}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
